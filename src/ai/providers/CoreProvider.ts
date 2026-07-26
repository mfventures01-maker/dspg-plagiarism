import { AIProvider } from '../interfaces/AIProvider';
import { AIRequest } from '../types/AIRequest';
import { AIResponse } from '../types/AIResponse';
import { AIError, ProviderTimeoutError, RateLimitError, AIUnavailableError, AuthenticationError } from '../errors/AIErrors';
import { AIConfig } from '../config/AIConfig';

export class CoreProvider implements AIProvider {
  name = 'CORE';

  async initialize(): Promise<void> {
    // No explicit initialization required for REST API
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!AIConfig.core.apiKey || !AIConfig.core.enabled) return false;
      
      const baseUrl = AIConfig.core.baseUrl || 'https://api.core.ai/v1';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), AIConfig.defaults.timeoutMs);
      
      const response = await fetch(`${baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${AIConfig.core.apiKey}`,
        },
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      return response.ok;
    } catch {
      return false;
    }
  }

  async analyzeDocument(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      const baseUrl = AIConfig.core.baseUrl || 'https://api.core.ai/v1';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), AIConfig.defaults.timeoutMs);
      
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AIConfig.core.apiKey}`,
        },
        body: JSON.stringify({
          model: AIConfig.core.model || 'core-large',
          messages: [
            ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
            { role: 'user', content: request.prompt + (request.metadata ? '\n\nMetadata Context:\n' + JSON.stringify(request.metadata, null, 2) : '') }
          ],
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens,
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      const durationMs = Date.now() - startTime;

      if (!response.ok) {
        let errorMessage = 'CORE API Error';
        try {
          const errorData = await response.json() as { error?: { message?: string }, detail?: string };
          errorMessage = errorData.error?.message || errorData.detail || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        
        if (response.status === 401 || response.status === 403) {
          throw new AuthenticationError(this.name, errorMessage);
        }
        if (response.status === 429) {
          throw new RateLimitError(this.name, errorMessage);
        }
        if (response.status >= 500) {
          throw new AIUnavailableError(this.name, errorMessage);
        }
        
        throw new AIError(
          'AI_INTERNAL_ERROR',
          this.name,
          errorMessage,
          false
        );
      }

      const data = await response.json() as {
        model?: string;
        choices?: Array<{ message?: { content?: string } }>;
      };
      
      const model = data.model || AIConfig.core.model || 'core-large';
      const content = data.choices?.[0]?.message?.content || '';
      
      let parsedData;
      try {
        let cleanContent = content;
        if (cleanContent.startsWith('```json')) {
          cleanContent = cleanContent.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        } else if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent.replace(/^```\n?/, '').replace(/\n?```$/, '');
        }
        parsedData = JSON.parse(cleanContent);
      } catch (e) {
        parsedData = { content };
      }
      
      return {
        success: true,
        provider: this.name,
        model,
        durationMs,
        data: parsedData
      };
    } catch (err: unknown) {
      if (err instanceof AIError) {
        throw err;
      }
      
      const isTimeout = err instanceof DOMException && err.name === 'AbortError';
      throw new AIError(
        isTimeout ? 'AI_TIMEOUT' : 'AI_INTERNAL_ERROR',
        this.name,
        err instanceof Error ? err.message : 'Network Error',
        true
      );
    }
  }

  async calculateSimilarity(text1: string, text2: string): Promise<number> {
    throw new Error('Not implemented');
  }

  async detectAI(text: string): Promise<number> {
    throw new Error('Not implemented');
  }

  async shutdown(): Promise<void> {
    // Cleanup if needed
  }
}