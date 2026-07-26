/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Normalizes document text into a deterministic canonical representation.
 *
 * This function performs the following operations in order:
 * 1. Normalize line endings (CRLF, CR → LF)
 * 2. Unicode normalization (NFC form)
 * 3. Trim leading and trailing whitespace
 * 4. Collapse repeated horizontal whitespace within lines
 * 5. Preserve paragraph boundaries (blank lines remain intact)
 *
 * The function is:
 * - Pure: no side effects, no mutations, no IO, no global state
 * - Deterministic: normalize(A) == normalize(A) always
 * - Idempotent: normalize(normalize(A)) == normalize(A) always
 *
 * @param text - The input text to normalize
 * @returns The normalized text in canonical form
 */
export const normalize = (text: string): string => {
  if (!text) return '';

  // Step 1: Normalize line endings (CRLF → LF, CR → LF)
  let normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Step 2: Unicode normalization (NFC form for canonical equivalence)
  normalized = normalized.normalize('NFC');

  // Step 3: Split into lines to process each line individually
  const lines = normalized.split('\n');

  // Step 4: Collapse repeated horizontal whitespace within each line
  // This preserves blank lines (paragraph boundaries) while normalizing internal whitespace
  const processedLines = lines.map((line) => {
    // Collapse tabs and spaces into single spaces, trim line boundaries
    return line.replace(/[ \t]+/g, ' ').trim();
  });

  // Step 5: Rejoin lines and trim document boundaries
  normalized = processedLines.join('\n');

  // Final trim of leading/trailing whitespace from the entire document
  return normalized.trim();
};