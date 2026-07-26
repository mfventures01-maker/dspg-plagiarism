/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIProvider } from '../interfaces/AIProvider';
import { AIRequest } from '../types/AIRequest';
import { AIResponse } from '../types/AIResponse';
import { AIError, AIUnavailableError, AuthenticationError, RateLimitError } from '../errors/AIErrors';
import { AIConfig } from '../config/AIConfig';

export class NVIDIAProvider implements AIProvider {
  name = 'NVIDIA';

  async initialize(): Promise<void> {}

  async healthCheck(): Promise<boolean> {
    try {
      if (!AIConfig.nvidia.apiKey || !AIConfig.nvidia.enabled) return false;
      
      const baseUrl = 'https://integrate.api.nvidia.com/v1';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), AIConfig.defaults.timeoutMs);
      
      const response = await fetch(`${baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${AIConfig.nvidia.apiKey}`
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
      const baseUrl = 'https://integrate.api.nvidia.com/v1';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), AIConfig.defaults.timeoutMs);
      
      const messages = [];
      if (request.systemPrompt) {
        messages.push({ role: 'system', content: request.systemPrompt });
      }
      
      const userContent = request.prompt + (request.metadata ? '\n\nMetadata Context:\n' + JSON.stringify(request.metadata, null, 2) : '');
      messages.push({ role: 'user', content: userContent });
      
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AIConfig.nvidia.apiKey}`
        },
        body: JSON.stringify({
          model: AIConfig.nvidia.model || 'meta/llama-3.1-405b-instruct',
          messages,
          temperature: request.temperature ?? 0.1,
          max_tokens: request.maxTokens,
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);
      const durationMs = Date.now() - startTime;

      if (!response.ok) {
        let errorMessage = 'NVIDIA API Error';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        
        if (response.status === 401 || response.status === 403) throw new AuthenticationError(this.name, errorMessage);
        if (response.status === 429) throw new RateLimitError(this.name, errorMessage);
        if (response.status >= 500) throw new AIUnavailableError(this.name, errorMessage);
        
        throw new AIError('AI_INTERNAL_ERROR', this.name, errorMessage, false);
      }

      const json = await response.json();
      const rawText = json.choices?.[0]?.message?.content || '';
      
      let parsedData;
      try {
        let cleanContent = rawText;
        if (cleanContent.startsWith('```json')) {
          cleanContent = cleanContent.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        } else if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent.replace(/^```\n?/, '').replace(/\n?```$/, '');
        }
        parsedData = JSON.parse(cleanContent);
      } catch (e) {
        parsedData = { content: rawText };
      }
      
      return {
        success: true,
        provider: this.name,
        model: AIConfig.nvidia.model || 'meta/llama-3.1-405b-instruct',
        durationMs,
        data: parsedData
      };
    } catch (err: unknown) {
      if (err instanceof AIError) throw err;
      
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
