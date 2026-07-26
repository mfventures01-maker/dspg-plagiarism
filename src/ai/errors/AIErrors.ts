export type AIErrorCategory = 
  | 'AI_TIMEOUT' 
  | 'AI_PROVIDER_UNAVAILABLE' 
  | 'AI_CONFIGURATION_ERROR' 
  | 'AI_RATE_LIMIT' 
  | 'AI_INTERNAL_ERROR'
  | 'AI_AUTHENTICATION_ERROR'
  | 'AI_INVALID_RESPONSE'
  | 'AI_TOKEN_LIMIT_EXCEEDED'
  | 'AI_NETWORK_FAILURE'
  | 'AI_UNKNOWN_PROVIDER_ERROR';

export class AIError extends Error {
  public category: AIErrorCategory;
  public provider: string;
  public retryable: boolean;
  public details?: any;

  constructor(category: AIErrorCategory, provider: string, message: string, retryable: boolean = false, details?: any) {
    super(message);
    this.name = 'AIError';
    this.category = category;
    this.provider = provider;
    this.retryable = retryable;
    this.details = details;
  }
}

// Deterministic Error Classes
export class AIUnavailableError extends AIError {
  constructor(provider: string, message: string = 'Provider is unavailable') {
    super('AI_PROVIDER_UNAVAILABLE', provider, message, true);
    this.name = 'AIUnavailableError';
  }
}

export class AuthenticationError extends AIError {
  constructor(provider: string, message: string = 'Authentication failed') {
    super('AI_AUTHENTICATION_ERROR', provider, message, false);
    this.name = 'AuthenticationError';
  }
}

export class ConfigurationError extends AIError {
  constructor(provider: string, message: string = 'Configuration error') {
    super('AI_CONFIGURATION_ERROR', provider, message, false);
    this.name = 'ConfigurationError';
  }
}

export class RateLimitError extends AIError {
  constructor(provider: string, message: string = 'Rate limit exceeded') {
    super('AI_RATE_LIMIT', provider, message, true);
    this.name = 'RateLimitError';
  }
}

export class ProviderTimeoutError extends AIError {
  constructor(provider: string, message: string = 'Provider timed out') {
    super('AI_TIMEOUT', provider, message, true);
    this.name = 'ProviderTimeoutError';
  }
}

export class InvalidResponseError extends AIError {
  constructor(provider: string, message: string = 'Invalid response schema') {
    super('AI_INVALID_RESPONSE', provider, message, false);
    this.name = 'InvalidResponseError';
  }
}

export class TokenLimitExceededError extends AIError {
  constructor(provider: string, message: string = 'Token limit exceeded') {
    super('AI_TOKEN_LIMIT_EXCEEDED', provider, message, false);
    this.name = 'TokenLimitExceededError';
  }
}

export class NetworkFailureError extends AIError {
  constructor(provider: string, message: string = 'Network failure') {
    super('AI_NETWORK_FAILURE', provider, message, true);
    this.name = 'NetworkFailureError';
  }
}

export class UnknownProviderError extends AIError {
  constructor(provider: string, message: string = 'Unknown provider error') {
    super('AI_UNKNOWN_PROVIDER_ERROR', provider, message, false);
    this.name = 'UnknownProviderError';
  }
}
