/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DocumentChunk {
  id: string;
  index: number;
  text: string;
}

export interface ChunkerConfig {
  chunkSize: number;
  overlap: number;
}

/**
 * Single Responsibility: Split document into deterministic chunks.
 * Pure function. No randomness. Repeatable output.
 */
export class DocumentChunker {
  private readonly config: ChunkerConfig;

  constructor(config: Partial<ChunkerConfig> = {}) {
    this.config = {
      chunkSize: config.chunkSize ?? 1000,
      overlap: config.overlap ?? 200,
    };
  }

  /**
   * Splits a document into overlapping chunks deterministically.
   * Splits at whitespace to avoid breaking words where possible.
   * 
   * @param documentId Unique identifier for the document
   * @param text The full text to chunk
   * @returns Array of DocumentChunk objects
   */
  public chunk(documentId: string, text: string): DocumentChunk[] {
    if (!text || text.trim().length === 0) {
      return [];
    }

    const chunks: DocumentChunk[] = [];
    const { chunkSize, overlap } = this.config;
    let currentIndex = 0;
    let chunkIndex = 0;

    // Normalize text whitespace
    const normalizedText = text.replace(/\s+/g, ' ').trim();

    while (currentIndex < normalizedText.length) {
      let end = Math.min(currentIndex + chunkSize, normalizedText.length);
      
      // If we are not at the end of the text, try to find a word boundary
      if (end < normalizedText.length) {
        // Look backwards for a space within the last 50 chars to avoid splitting words
        const lookBack = Math.max(currentIndex + chunkSize - 50, currentIndex);
        const lastSpace = normalizedText.lastIndexOf(' ', end);
        
        if (lastSpace > lookBack) {
          end = lastSpace;
        }
      }

      const chunkText = normalizedText.substring(currentIndex, end).trim();
      
      if (chunkText.length > 0) {
        chunks.push({
          id: `${documentId}_chunk_${chunkIndex}`,
          index: chunkIndex,
          text: chunkText,
        });
        chunkIndex++;
      }

      // Break if we've reached the end
      if (end >= normalizedText.length) {
        break;
      }

      // Move forward by chunkSize - overlap
      // We start the next chunk exactly `overlap` characters back from `end`
      // But we adjust to the nearest word boundary after that point
      let nextStart = Math.max(end - overlap, currentIndex + 1);
      
      if (nextStart > currentIndex && nextStart < end) {
        const nextSpace = normalizedText.indexOf(' ', nextStart);
        if (nextSpace !== -1 && nextSpace < end) {
          nextStart = nextSpace + 1; // start after the space
        }
      }
      
      currentIndex = nextStart;
    }

    return chunks;
  }
}
