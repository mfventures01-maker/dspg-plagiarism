/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIProvider } from '../interfaces/AIProvider';
import { AIRequest } from '../types/AIRequest';
import { AIResponse } from '../types/AIResponse';
import { AIError, AIUnavailableError, AuthenticationError, RateLimitError } from '../errors/AIErrors';
import { AIConfig } from '../config/AIConfig';

export class GeminiProvider implements AIProvider {
  name = 'Gemini';

  async initialize(): Promise<void> {}

  async healthCheck(): Promise<boolean> {
    try {
      if (!AIConfig.gemini.apiKey || !AIConfig.gemini.enabled) return false;
      
      const baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), AIConfig.defaults.timeoutMs);
      
      const response = await fetch(`${baseUrl}?key=${AIConfig.gemini.apiKey}`, {
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
      const baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), AIConfig.defaults.timeoutMs);
      
      const response = await fetch(`${baseUrl}/gemini-2.5-flash:generateContent?key=${AIConfig.gemini.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: request.systemPrompt || '' }]
          },
          contents: [{
            role: 'user',
            parts: [{ text: request.prompt + (request.metadata ? '\n\nMetadata Context:\n' + JSON.stringify(request.metadata, null, 2) : '') }]
          }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: request.temperature ?? 0.1,
            maxOutputTokens: request.maxTokens,
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);
      const durationMs = Date.now() - startTime;

      if (!response.ok) {
        let errorMessage = 'Gemini API Error';
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
      const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
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
        model: 'gemini-2.5-flash',
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

