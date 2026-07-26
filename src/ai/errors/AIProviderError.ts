/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RetryableError } from '../retry/RetryPolicy';

export class AIProviderError extends Error {
  public readonly isRetryable: boolean;
  public readonly retryType?: RetryableError;
  public readonly statusCode?: number;
  public readonly provider: string;

  constructor(
    message: string,
    provider: string,
    isRetryable: boolean = false,
    retryType?: RetryableError,
    statusCode?: number
  ) {
    super(message);
    this.name = 'AIProviderError';
    this.provider = provider;
    this.isRetryable = isRetryable;
    this.retryType = retryType;
    this.statusCode = statusCode;
  }
}
