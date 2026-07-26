/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { normalize } from '../normalization/DocumentNormalizer';

/**
 * Counts the number of words in normalized document text.
 *
 * This function:
 * 1. Normalizes the input text using DocumentNormalizer (SSOT)
 * 2. Counts words by splitting on whitespace
 * 3. Returns 0 for empty normalized documents
 *
 * A word is defined as a contiguous sequence of non-whitespace characters.
 * This definition is deterministic and locale-independent.
 *
 * The function is:
 * - Pure: no side effects, no mutations, no IO, no global state
 * - Deterministic: countWords(A) == countWords(A) always
 * - Idempotent: normalize(operation occurs exactly once)
 *
 * @param text - The input text to count words from
 * @returns The number of words in the normalized text
 */
export const countWords = (text: string): number => {
  // Normalize input using DocumentNormalizer (Single Source of Truth)
  const normalized = normalize(text);

  // Return 0 for empty normalized document
  if (!normalized) {
    return 0;
  }

  // Split on whitespace and count non-empty tokens
  // After normalization, whitespace is collapsed to single spaces
  // and paragraphs are preserved with newlines, so we split on any whitespace
  const words = normalized.split(/\s+/).filter((word) => word.length > 0);

  return words.length;
};