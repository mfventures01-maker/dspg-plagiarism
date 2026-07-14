/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Counts the words in a given text block
 */
export const countWords = (text: string): number => {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
};

/**
 * Clean text formatting for analysis
 */
export const cleanText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Checks compliance thresholds for originality and flags high similarity snippets
 */
export const checkComplianceStatus = (score: number, threshold = 80): {
  compliant: boolean;
  message: string;
} => {
  if (score >= threshold) {
    return {
      compliant: true,
      message: `Compliant: The document meets the HND projects committee's academic originality threshold of ${threshold}%.`
    };
  }
  return {
    compliant: false,
    message: `Non-compliant: The document similarity exceeds threshold. Originality score (${score}%) is below the minimum required ${threshold}%.`
  };
};
