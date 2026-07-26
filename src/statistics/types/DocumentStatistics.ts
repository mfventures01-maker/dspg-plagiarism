/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Domain contract for document statistics.
 * 
 * This interface defines the shape of statistics computed from a document.
 * It is framework-independent, deterministic, and immutable by convention.
 * 
 * Note: This is a contract-only definition with no implementation logic.
 */
export interface DocumentStatistics {
  /**
   * Total number of words in the document.
   */
  wordCount: number;

  /**
   * Total number of characters in the document (including spaces).
   */
  characterCount: number;

  /**
   * Total number of characters in the document (excluding spaces).
   */
  characterCountNoSpaces: number;

  /**
   * Total number of sentences in the document.
   */
  sentenceCount: number;

  /**
   * Total number of paragraphs in the document.
   */
  paragraphCount: number;

  /**
   * Estimated reading time in minutes.
   * Calculated based on wordCount and wordsPerMinute configuration.
   */
  estimatedReadingMinutes: number;

  /**
   * Estimated page count (optional).
   * Calculated based on wordCount and wordsPerPage configuration.
   */
  estimatedPageCount?: number;
}