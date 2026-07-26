import { ProviderSelector } from './ProviderSelector';
import { AIProvider } from '../interfaces/AIProvider';
import { AIRequest } from '../types/AIRequest';
import { AIResponse } from '../types/AIResponse';
import { AIError } from '../errors/AIErrors';
import { AIConfig } from '../config/AIConfig';
import { CircuitBreaker } from './CircuitBreaker';
import { AIExecutionLedger } from '../telemetry/AIExecutionLedger';
import { randomUUID } from 'crypto';

export class AIGateway {
  private selector: ProviderSelector;
  private circuitBreakers: Map<string, CircuitBreaker>;
  private ledger = AIExecutionLedger.getInstance();

  constructor(selector?: ProviderSelector) {
    this.selector = selector || new ProviderSelector();
    this.circuitBreakers = new Map<string, CircuitBreaker>();
  }

  private getCircuitBreaker(providerName: string): CircuitBreaker {
    if (!this.circuitBreakers.has(providerName)) {
      this.circuitBreakers.set(providerName, new CircuitBreaker(providerName, {
        failureThreshold: 3,
        resetTimeoutMs: 60000,
      }));
    }
    return this.circuitBreakers.get(providerName)!;
  }

  private async executeWithRetry(provider: AIProvider, request: AIRequest, executionId: string, isFallback: boolean = false): Promise<AIResponse> {
    const maxRetries = AIConfig.defaults.retries;
    let attempt = 0;
    const breaker = this.getCircuitBreaker(provider.name);
    const startTime = Date.now();

    while (true) {
      try {
        const result = await breaker.execute(() => provider.analyzeDocument(request));
        
        this.ledger.record({
          executionId,
          provider: provider.name,
          model: result.model || 'unknown',
          latencyMs: Date.now() - startTime,
          retries: attempt,
          fallbackUsed: isFallback,
          status: 'Completed',
          // Estimated token lengths
          promptTokens: Math.ceil(request.prompt.length / 4),
          completionTokens: Math.ceil(JSON.stringify(result.data).length / 4)
        });

        return result;
      } catch (error: any) {
        if (error instanceof AIError || error.message.includes('Circuit is OPEN')) {
          const isRetryable = error instanceof AIError ? error.retryable : true;
          if (isRetryable && attempt < maxRetries) {
            attempt++;
            this.ledger.record({
              executionId,
              provider: provider.name,
              model: 'unknown',
              latencyMs: Date.now() - startTime,
              retries: attempt,
              fallbackUsed: isFallback,
              status: 'Retried',
              errors: [error.message]
            });
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          }
        }
        
        this.ledger.record({
          executionId,
          provider: provider.name,
          model: 'unknown',
          latencyMs: Date.now() - startTime,
          retries: attempt,
          fallbackUsed: isFallback,
          status: 'Failed',
          errors: [error.message]
        });
        
        throw error;
      }
    }
  }

  public async analyzeDocument(request: AIRequest): Promise<AIResponse> {
    const primaryProvider = this.selector.selectPrimaryProvider();
    let executionId = randomUUID();

    try {
      return await this.executeWithRetry(primaryProvider, request, executionId, false);
    } catch (error: any) {
      const isRetryableFailure = error instanceof AIError && error.retryable;
      const isNetworkOrTimeout = error instanceof AIError && (error.category === 'AI_TIMEOUT' || error.category === 'AI_PROVIDER_UNAVAILABLE');
      const isCircuitOpen = error.message?.includes('Circuit is OPEN');

      if (isRetryableFailure || isNetworkOrTimeout || isCircuitOpen) {
        try {
          const fallbackProvider = this.selector.selectFallbackProvider(primaryProvider.name);
          return await this.executeWithRetry(fallbackProvider, request, executionId, true);
        } catch (fallbackError: any) {
          if (fallbackError instanceof AIError) {
            throw fallbackError;
          }
          throw new AIError(
            'AI_INTERNAL_ERROR',
            'Fallback',
            fallbackError instanceof Error ? fallbackError.message : 'Unknown fallback error',
            false
          );
        }
      }

      if (error instanceof AIError) {
        throw error;
      }

      throw new AIError(
        'AI_INTERNAL_ERROR',
        primaryProvider.name,
        error instanceof Error ? error.message : 'Unknown gateway execution error',
        false
      );
    }
  }
}

