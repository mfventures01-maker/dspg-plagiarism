/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { randomUUID } from 'node:crypto';
import { AIExecutionLog } from './AIExecutionLog';

/**
 * Tracks the state of a single execution before it completes.
 */
interface ActiveExecution {
  executionId: string;
  provider: string;
  model: string;
  startTime: number;
}

/**
 * Single Responsibility: Record and structure AI provider telemetry.
 * Does NOT: Call providers, parse payloads, handle retries, or mutate evidence.
 */
export class TelemetryService {
  
  /**
   * Initializes an active execution and generates an execution ID.
   */
  public startExecution(provider: string, model: string): ActiveExecution {
    return {
      executionId: randomUUID(),
      provider,
      model,
      startTime: Date.now()
    };
  }

  /**
   * Finalizes a successful execution into an immutable AIExecutionLog and emits it.
   */
  public completeExecution(
    active: ActiveExecution,
    promptTokens: number,
    completionTokens: number,
    retries: number = 0,
    retryReasons: string[] = [],
    providersAttempted: string[] = [active.provider],
    fallbackActivated: boolean = false,
    successfulProvider: string = active.provider,
    failedProviders: string[] = [],
    totalAttempts: number = retries + 1
  ): AIExecutionLog {
    const endTime = Date.now();
    
    const log: AIExecutionLog = {
      executionId: active.executionId,
      provider: successfulProvider,
      model: active.model,
      startedAt: new Date(active.startTime).toISOString(),
      completedAt: new Date(endTime).toISOString(),
      durationMs: endTime - active.startTime,
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      retries,
      retryReasons,
      finalAttempt: retries + 1,
      success: true,
      providersAttempted,
      fallbackActivated,
      successfulProvider,
      failedProviders,
      totalAttempts
    };
    
    this.emit(log);
    return log;
  }

  /**
   * Finalizes a failed execution into an immutable AIExecutionLog and emits it.
   */
  public failExecution(
    active: ActiveExecution,
    errorType: string,
    retries: number = 0,
    retryReasons: string[] = [],
    providersAttempted: string[] = [active.provider],
    fallbackActivated: boolean = false,
    failedProviders: string[] = [active.provider],
    totalAttempts: number = retries + 1
  ): AIExecutionLog {
    const endTime = Date.now();
    
    const log: AIExecutionLog = {
      executionId: active.executionId,
      provider: active.provider,
      model: active.model,
      startedAt: new Date(active.startTime).toISOString(),
      completedAt: new Date(endTime).toISOString(),
      durationMs: endTime - active.startTime,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      retries,
      retryReasons,
      finalAttempt: retries + 1,
      success: false,
      errorType,
      providersAttempted,
      fallbackActivated,
      failedProviders,
      totalAttempts
    };
    
    this.emit(log);
    return log;
  }

  /**
   * Emits the structured log. Currently uses JSON.stringify to stdout.
   */
  private emit(log: AIExecutionLog): void {
    console.log(JSON.stringify(log));
  }
}
