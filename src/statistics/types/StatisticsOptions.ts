/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Configuration contract for statistics computation.
 * 
 * This interface defines optional configuration parameters for computing
 * document statistics. It is framework-independent and contains no logic.
 * 
 * Note: This is a contract-only definition with no implementation logic.
 */
export interface StatisticsOptions {
  /**
   * Words per minute for reading time estimation.
   * If not provided, a default value will be used by the implementation.
   */
  readingWordsPerMinute?: number;

  /**
   * Words per page for page count estimation.
   * If not provided, a default value will be used by the implementation.
   */
  wordsPerPage?: number;
}