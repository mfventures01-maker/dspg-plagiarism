export interface AIResponse {
  provider: string;
  model: string;
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
  requestId: string;
}

export interface AIError extends Error {
  provider: string;
  code: string;
  retryable: boolean;
}

export interface AIRequest {
  systemPrompt?: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIProvider {
  name: string;
  isAvailable(): boolean;
  generate(request: AIRequest): Promise<AIResponse>;
  healthCheck(): Promise<boolean>;
}
