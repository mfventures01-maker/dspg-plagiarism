import { AIProvider, AIRequest, AIResponse, AIError } from '../interfaces/AIProvider';
import { AIConfig } from '../config/AIConfig';

export class GeminiProvider implements AIProvider {
  name = 'Gemini';
  // Use v1beta or v1 as needed, assuming v1beta for general availability of generateContent
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent';

  isAvailable(): boolean {
    return !!AIConfig.gemini.apiKey;
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.isAvailable()) return false;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${AIConfig.gemini.apiKey}`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      const url = `${this.baseUrl}?key=${AIConfig.gemini.apiKey}`;
      
      const contents = [];
      if (request.systemPrompt) {
        // Gemini handles system instructions differently, but for simplicity we can prepend or use the system_instruction field
        // We will just include it in the user prompt for this simple adapter if not explicitly supported
      }

      // Format for Gemini generateContent
      const payload: any = {
        contents: [
          {
            role: 'user',
            parts: [{ text: (request.systemPrompt ? request.systemPrompt + '\n\n' : '') + request.prompt }]
          }
        ],
        generationConfig: {
          temperature: request.temperature ?? 0.7,
        }
      };

      if (request.maxTokens) {
        payload.generationConfig.maxOutputTokens = request.maxTokens;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
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
        
        const error = new Error(errorData.error?.message || 'Gemini API Error') as AIError;
        error.provider = this.name;
        error.code = String(response.status);
        error.retryable = isRetryable;
        error.name = 'AIError';
        throw error;
      }

      const data = await response.json();
      
      // Extract content from Gemini response
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      return {
        provider: this.name,
        model: 'gemini-1.5-pro-latest',
        content,
        usage: {
          promptTokens: data.usageMetadata?.promptTokenCount || 0,
          completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: data.usageMetadata?.totalTokenCount || 0,
        },
        latencyMs,
        requestId: `gemini-${Date.now()}`, // Gemini doesn't typically return an ID in the root response
      };
    } catch (err: any) {
      if (err.name === 'AIError') {
        throw err;
      }
      
      const latencyMs = Date.now() - startTime;
      const error = new Error(err.message || 'Network Error') as AIError;
      error.provider = this.name;
      error.code = 'NETWORK_ERROR';
      error.retryable = true;
      error.name = 'AIError';
      throw error;
    }
  }
}
