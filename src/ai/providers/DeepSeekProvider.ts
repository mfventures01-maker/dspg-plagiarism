import { AIProvider, AIRequest, AIResponse, AIError } from '../interfaces/AIProvider';
import { AIConfig } from '../config/AIConfig';

export class DeepSeekProvider implements AIProvider {
  name = 'DeepSeek';
  private baseUrl = 'https://api.deepseek.com/v1/chat/completions'; // Typical DeepSeek endpoint

  isAvailable(): boolean {
    return !!AIConfig.core.apiKey;
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.isAvailable()) return false;
      
      const response = await fetch('https://api.deepseek.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${AIConfig.core.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AIConfig.core.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
            { role: 'user', content: request.prompt }
          ],
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens,
        }),
      });

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        let errorData: any;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: { message: response.statusText } };
        }
        
        const isRetryable = response.status === 429 || response.status >= 500;
        
        const error = new Error(errorData.error?.message || 'DeepSeek API Error') as AIError;
        error.provider = this.name;
        error.code = String(response.status);
        error.retryable = isRetryable;
        error.name = 'AIError';
        throw error;
      }

      const data = await response.json();
      
      return {
        provider: this.name,
        model: data.model || 'deepseek-chat',
        content: data.choices?.[0]?.message?.content || '',
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
        latencyMs,
        requestId: data.id || `ds-${Date.now()}`,
      };
    } catch (err: any) {
      if (err.name === 'AIError') {
        throw err;
      }
      
      const latencyMs = Date.now() - startTime;
      const error = new Error(err.message || 'Network Error') as AIError;
      error.provider = this.name;
      error.code = 'NETWORK_ERROR';
      error.retryable = true; // Network errors are generally retryable
      error.name = 'AIError';
      throw error;
    }
  }
}
