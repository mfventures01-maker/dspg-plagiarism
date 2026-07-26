/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RetryPolicy } from './RetryPolicy';
import { AIProviderError } from '../errors/AIProviderError';

export interface RetryResult<T> {
  result?: T;
  attempts: number;
  successful: boolean;
  finalError?: string;
  retryReasons: string[];
}

export class RetryEngine {
  private readonly policy: RetryPolicy;

  constructor(policy: RetryPolicy) {
    this.policy = policy;
  }

  /**
   * Executes a provider call and handles retries purely based on the provided policy.
   */
  public async execute<T>(operation: () => Promise<T>): Promise<RetryResult<T>> {
    let attempts = 0;
    const retryReasons: string[] = [];

    while (attempts < this.policy.maxAttempts) {
      attempts++;
      try {
        const result = await operation();
        return {
          result,
          attempts,
          successful: true,
          retryReasons
        };
      } catch (error: any) {
        // Classify the error
        let isRetryable = false;
        let reason = error.name || 'UNKNOWN_ERROR';
        
        if (error instanceof AIProviderError) {
          reason = error.retryType || error.message;
          if (error.isRetryable && error.retryType && this.policy.retryableErrors.includes(error.retryType)) {
            isRetryable = true;
          }
        } else if (error.name === 'AbortError' || error.name === 'TimeoutError') {
           // Fallback for raw fetch timeouts if not caught by provider wrapper
           if (this.policy.retryableErrors.includes('TIMEOUT')) {
             isRetryable = true;
             reason = 'TIMEOUT';
           }
        } else if (error.message && error.message.includes('fetch')) {
           // Fallback for raw fetch network errors
           if (this.policy.retryableErrors.includes('NETWORK_ERROR')) {
             isRetryable = true;
             reason = 'NETWORK_ERROR';
           }
        }

        retryReasons.push(reason);

        // Terminate immediately if not retryable or max attempts reached
        if (!isRetryable || attempts >= this.policy.maxAttempts) {
          return {
            attempts,
            successful: false,
            finalError: error.message || String(error),
            retryReasons
          };
        }

        // Apply backoff before retrying
        const delay = this.policy.exponentialBackoff
          ? this.policy.initialDelayMs * Math.pow(this.policy.multiplier, attempts - 1)
          : this.policy.initialDelayMs;

        await this.sleep(delay);
      }
    }

    // Fallback if loop exits (should not reach here based on while condition)
    return {
      attempts,
      successful: false,
      finalError: 'MAX_ATTEMPTS_REACHED',
      retryReasons
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
