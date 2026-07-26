/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RetryableError =
  | "TIMEOUT"
  | "RATE_LIMIT"
  | "SERVER_ERROR"
  | "NETWORK_ERROR";

/**
 * Configuration for the centralized Retry Engine.
 */
export interface RetryPolicy {
  maxAttempts: number;
  initialDelayMs: number;
  exponentialBackoff: boolean;
  multiplier: number;
  retryableErrors: RetryableError[];
}
