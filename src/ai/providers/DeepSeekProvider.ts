import { AIProvider } from '../interfaces/AIProvider';
import { AIRequest } from '../types/AIRequest';
import { AIResponse } from '../types/AIResponse';
import { AIError } from '../errors/AIErrors';
import { AIConfig } from '../config/AIConfig';

export class DeepSeekProvider implements AIProvider {
  name = 'DeepSeek';

  async initialize(): Promise<void> {}

  async healthCheck(): Promise<boolean> {
    try {
      if (!AIConfig.deepseek.apiKey || !AIConfig.deepseek.enabled) return false;
      
      const baseUrl = AIConfig.deepseek.baseUrl || 'https://api.deepseek.com/v1';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), AIConfig.defaults.timeoutMs);
      
      // DeepSeek doesn't always have /models, hit chat completions with a dummy request or models if supported
      const response = await fetch(`${baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${AIConfig.deepseek.apiKey}`,
        },
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      return response.ok || response.status === 404; // if /models is not implemented, still ok if we get a response

    } catch {
      return false;
    }
  }

  async analyzeDocument(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      const baseUrl = AIConfig.deepseek.baseUrl || 'https://api.deepseek.com/v1';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), AIConfig.defaults.timeoutMs);
      
      console.log("DEEPSEEK REQUEST URL:", `${baseUrl}/chat/completions`);
      console.log("DEEPSEEK MODEL:", AIConfig.deepseek.model);

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AIConfig.deepseek.apiKey}`,
        },
        body: JSON.stringify({
          model: AIConfig.deepseek.model || 'deepseek-chat',
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
        console.error("DEEPSEEK ERROR STATUS:", response.status);
        console.error("DEEPSEEK ERROR BODY:", await response.text());
        let errorMessage = 'DeepSeek API Error';
        try {
          const errorData = await response.json() as { error?: { message?: string }, detail?: string };
          errorMessage = errorData.error?.message || errorData.detail || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        
        const isRetryable = response.status === 429 || response.status >= 500;
        
        throw new AIError(
          isRetryable ? 'AI_PROVIDER_UNAVAILABLE' : 'AI_INTERNAL_ERROR',
          this.name,
          errorMessage,
          isRetryable
        );
      }

      const data = await response.json() as {
        model?: string;
        choices?: Array<{ message?: { content?: string } }>;
      };
      
      const model = data.model || AIConfig.deepseek.model || 'deepseek-chat';
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

  async shutdown(): Promise<void> {}
}


