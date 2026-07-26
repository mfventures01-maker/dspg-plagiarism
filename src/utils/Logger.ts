/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SearchCompletedPayload {
  query: string;
  durationMs: number;
  resultsCount: number;
}

export interface RetryPayload {
  attempt: number;
  delayMs: number;
}

export interface FailurePayload {
  error: string;
}

export class Logger {
  public static searchStarted(payload: { query: string }): void {
    this.writeLog('info', 'search_started', payload);
  }

  public static searchCompleted(payload: SearchCompletedPayload): void {
    this.writeLog('info', 'search_completed', payload);
  }

  public static retry(payload: RetryPayload): void {
    this.writeLog('info', 'search_retry', payload);
  }

  public static failure(payload: FailurePayload): void {
    this.writeLog('error', 'search_failure', payload);
  }

  private static writeLog(level: 'info' | 'error', event: string, payload: unknown): void {
    const stream = level === 'info' ? process.stdout : process.stderr;
    stream.write(JSON.stringify({ level, timestamp: new Date().toISOString(), event, ...(payload as Record<string, unknown>) }) + '\n');
  }
}
