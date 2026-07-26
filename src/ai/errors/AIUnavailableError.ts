/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class AIUnavailableError extends Error {
  public readonly failedProviders: string[];

  constructor(message: string, failedProviders: string[]) {
    super(message);
    this.name = 'AIUnavailableError';
    this.failedProviders = failedProviders;
  }
}
