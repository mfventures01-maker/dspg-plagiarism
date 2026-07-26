/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Single Responsibility: Define the immutable structure of an AI execution log.
 * No sensitive data (PII, evidence payload, student documents) is allowed here.
 */
export interface AIExecutionLog {
  readonly executionId: string;
  readonly provider: string;
  readonly model: string;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly durationMs: number;
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly totalTokens: number;
  readonly retries: number;
  readonly retryReasons: string[];
  readonly finalAttempt: number;
  readonly success: boolean;
  readonly errorType?: string;
  readonly providersAttempted: string[];
  readonly fallbackActivated: boolean;
  readonly successfulProvider?: string;
  readonly failedProviders: string[];
  readonly totalAttempts: number;
  
  // Future cost tracking
  readonly estimatedInputCost?: number;
  readonly estimatedOutputCost?: number;
  readonly estimatedTotalCost?: number;
}
