/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIProvider } from '../interfaces/AIProvider';
import { ProviderRegistry } from '../registry/ProviderRegistry';
import { RetryEngine } from '../retry/RetryEngine';
import { AIUnavailableError } from '../errors/AIUnavailableError';

export interface FailoverResult<T> {
  provider: string;
  attempts: number;
  fallbacksUsed: number;
  successful: boolean;
  result?: T;
  finalError?: string;
  retryReasons: string[];
  providersAttempted: string[];
  failedProviders: string[];
}

export class ProviderFailoverEngine {
  private readonly registry: ProviderRegistry;
  private readonly retryEngine: RetryEngine;

  constructor(registry: ProviderRegistry, retryEngine: RetryEngine) {
    this.registry = registry;
    this.retryEngine = retryEngine;
  }

  public async execute<T>(operation: (provider: AIProvider) => Promise<T>): Promise<FailoverResult<T>> {
    const primary = this.registry.getPrimary();
    if (!primary) {
      throw new AIUnavailableError('No primary AI provider configured.', []);
    }

    const fallbacks = this.registry.getFallbacks();
    const providersToTry = [primary, ...fallbacks];
    
    let totalAttempts = 0;
    const providersAttempted: string[] = [];
    const failedProviders: string[] = [];
    const allRetryReasons: string[] = [];
    let lastError: string | undefined;

    for (const provider of providersToTry) {
      providersAttempted.push(provider.name);
      
      const retryResult = await this.retryEngine.execute(() => operation(provider));
      totalAttempts += retryResult.attempts;
      allRetryReasons.push(...retryResult.retryReasons);

      if (retryResult.successful) {
        return {
          provider: provider.name,
          attempts: totalAttempts,
          fallbacksUsed: providersAttempted.length - 1,
          successful: true,
          result: retryResult.result,
          retryReasons: allRetryReasons,
          providersAttempted,
          failedProviders
        };
      } else {
        failedProviders.push(provider.name);
        lastError = retryResult.finalError;
        
        const lastReason = retryResult.retryReasons[retryResult.retryReasons.length - 1];
        const failoverable = ['TIMEOUT', 'RATE_LIMIT', 'SERVER_ERROR', 'NETWORK_ERROR'].includes(lastReason);
        
        if (!failoverable && lastReason !== 'MAX_ATTEMPTS_REACHED') {
           throw new Error(retryResult.finalError || 'Configuration Error');
        }
      }
    }

    throw new AIUnavailableError(
      `All AI providers failed. Last error: ${lastError}`,
      failedProviders
    );
  }
}
