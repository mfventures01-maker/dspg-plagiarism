/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createHash } from 'crypto';
import { NormalizedDocument, Paragraph, Sentence } from '../../types';

export function normalizeDocument(rawText: string): NormalizedDocument {
  const startTime = Date.now();

  // 1. Text Cleaning
  // Convert CRLF to LF
  let text = rawText.replace(/\r\n/g, '\n');
  // Remove zero-width characters
  text = text.replace(/[\u200B-\u200D\uFEFF]/g, '');
  // Normalize Unicode
  text = text.normalize('NFC');
  
  // Clean whitespace within lines, but preserve paragraph breaks (\n\n)
  // First, collapse horizontal whitespace (spaces, tabs)
  text = text.replace(/[ \t]+/g, ' ');
  // Strip trailing spaces from ends of lines
  text = text.replace(/ \n/g, '\n');
  // Collapse 3+ newlines into exactly 2 newlines (paragraph boundary)
  text = text.replace(/\n{3,}/g, '\n\n');
  // Trim
  text = text.trim();

  const originalText = rawText;
  const normalizedText = text;

  // 2. Paragraph Segmentation
  const paragraphTexts = normalizedText.split(/\n\n+/);
  const paragraphs: Paragraph[] = [];
  const sentences: Sentence[] = [];

  let currentGlobalOffset = 0;
  let sentenceCounter = 1;
  let paragraphCounter = 1;

  for (const pText of paragraphTexts) {
    if (!pText.trim()) continue;

    const pStartOffset = normalizedText.indexOf(pText, currentGlobalOffset);
    const pEndOffset = pStartOffset + pText.length;

    // 3. Sentence Segmentation within paragraph
    // Split by ., !, ? followed by whitespace or end of string, OR just grab remaining text
    const sentenceRegex = /[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g;
    const sentenceMatches = Array.from(pText.matchAll(sentenceRegex));
    
    const pSentenceIds: string[] = [];

    let currentParaOffset = 0;

    for (const match of sentenceMatches) {
      const sTextRaw = match[0];
      const sText = sTextRaw.trim();
      if (!sText) continue;

      const relativeOffset = pText.indexOf(sText, currentParaOffset);
      const sStartOffset = pStartOffset + relativeOffset;
      const sEndOffset = sStartOffset + sText.length;

      const sId = `s_${sentenceCounter++}`;
      pSentenceIds.push(sId);

      sentences.push({
        id: sId,
        startOffset: sStartOffset,
        endOffset: sEndOffset,
        wordCount: sText.split(/\s+/).filter(Boolean).length,
        characterCount: sText.length,
        text: sText,
      });

      currentParaOffset = relativeOffset + sTextRaw.length;
    }

    paragraphs.push({
      id: `p_${paragraphCounter++}`,
      sentenceIds: pSentenceIds,
      startOffset: pStartOffset,
      endOffset: pEndOffset,
      text: pText,
    });

    currentGlobalOffset = pEndOffset;
  }

  // 4. Word and Character Counts
  const wordCount = sentences.reduce((sum, s) => sum + s.wordCount, 0);
  const characterCount = normalizedText.length;

  // 5. Deterministic Document Hash
  const documentHash = createHash('sha256').update(normalizedText).digest('hex');

  const durationMs = Date.now() - startTime;

  return {
    originalText,
    normalizedText,
    wordCount,
    characterCount,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    language: 'en', // Deterministic default, or could be detected
    documentHash,
    processedAt: new Date().toISOString(),
    sentences,
    paragraphs,
    analysisDuration: `${(durationMs / 1000).toFixed(2)}s`
  };
}
