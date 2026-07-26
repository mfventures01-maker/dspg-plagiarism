export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeoutMs: number;
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failures: number = 0;
  private lastFailureTime: number | null = null;
  private providerName: string;
  private options: CircuitBreakerOptions;

  constructor(providerName: string, options?: Partial<CircuitBreakerOptions>) {
    this.providerName = providerName;
    this.options = {
      failureThreshold: options?.failureThreshold ?? 3,
      resetTimeoutMs: options?.resetTimeoutMs ?? 60000,
    };
  }

  public getState(): CircuitState {
    if (this.state === 'OPEN') {
      const now = Date.now();
      if (this.lastFailureTime && now - this.lastFailureTime > this.options.resetTimeoutMs) {
        this.state = 'HALF_OPEN';
      }
    }
    return this.state;
  }

  public recordSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
    this.lastFailureTime = null;
  }

  public recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.options.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  public async execute<T>(action: () => Promise<T>): Promise<T> {
    const currentState = this.getState();

    if (currentState === 'OPEN') {
      throw new Error(`Circuit is OPEN for provider: ${this.providerName}. Skipping execution.`);
    }

    try {
      const result = await action();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }
}
