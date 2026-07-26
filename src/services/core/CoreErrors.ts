/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Base class for all CORE-related errors.
 * Provides consistent error structure across the service.
 */
export class CoreError extends Error {
  public readonly code: string;
  public readonly provider: string;
  public readonly statusCode?: number;
  public readonly retryable: boolean;

  constructor(
    code: string,
    message: string,
    provider: string = 'CORE',
    statusCode?: number,
    retryable: boolean = false
  ) {
    super(message);
    this.name = 'CoreError';
    this.code = code;
    this.provider = provider;
    this.statusCode = statusCode;
    this.retryable = retryable;
  }
}

/**
 * Authentication failed or missing API key.
 */
export class CoreAuthenticationError extends CoreError {
  constructor(message: string = 'Authentication failed', statusCode?: number) {
    super('CORE_AUTH_ERROR', message, 'CORE', statusCode, false);
    this.name = 'CoreAuthenticationError';
  }
}

/**
 * Network error during API request.
 */
export class CoreNetworkError extends CoreError {
  constructor(message: string = 'Network error occurred', statusCode?: number) {
    super('CORE_NETWORK_ERROR', message, 'CORE', statusCode, true);
    this.name = 'CoreNetworkError';
  }
}

/**
 * Rate limit exceeded (429).
 */
export class CoreRateLimitError extends CoreError {
  constructor(message: string = 'Rate limit exceeded', statusCode: number = 429) {
    super('CORE_RATE_LIMIT_ERROR', message, 'CORE', statusCode, true);
    this.name = 'CoreRateLimitError';
  }
}

/**
 * Server error (5xx).
 */
export class CoreServerError extends CoreError {
  constructor(message: string = 'Server error occurred', statusCode?: number) {
    super('CORE_SERVER_ERROR', message, 'CORE', statusCode, true);
    this.name = 'CoreServerError';
  }
}

/**
 * Request timeout.
 */
export class CoreTimeoutError extends CoreError {
  constructor(message: string = 'Request timed out') {
    super('CORE_TIMEOUT_ERROR', message, 'CORE', undefined, true);
    this.name = 'CoreTimeoutError';
  }
}

/**
 * Unknown or unexpected error.
 */
export class CoreUnknownError extends CoreError {
  constructor(message: string = 'An unknown error occurred') {
    super('CORE_UNKNOWN_ERROR', message, 'CORE', undefined, false);
    this.name = 'CoreUnknownError';
  }
}

/**
 * Validation error for search parameters.
 */
export class CoreValidationError extends CoreError {
  constructor(message: string) {
    super('CORE_VALIDATION_ERROR', message, 'CORE', undefined, false);
    this.name = 'CoreValidationError';
  }
}