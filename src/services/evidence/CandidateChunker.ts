/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CandidatePaper } from '../../types';
import { DocumentChunker, ChunkerConfig } from './DocumentChunker';

export interface CandidateChunk {
  candidateId: number;
  chunkId: string;
  index: number;
  text: string;
}

/**
 * Single Responsibility: Apply identical chunking strategy to every candidate paper.
 */
export class CandidateChunker {
  private readonly documentChunker: DocumentChunker;

  constructor(config: Partial<ChunkerConfig> = {}) {
    this.documentChunker = new DocumentChunker(config);
  }

  /**
   * Chunks a candidate paper deterministically using the exact same algorithm
   * as the student document chunker.
   * 
   * @param paper Normalized CandidatePaper
   * @returns Array of CandidateChunk
   */
  public chunk(paper: CandidatePaper): CandidateChunk[] {
    const textToChunk = paper.abstract || paper.title || '';
    
    const docChunks = this.documentChunker.chunk(paper.coreId.toString(), textToChunk);

    return docChunks.map(dc => ({
      candidateId: paper.coreId,
      chunkId: dc.id,
      index: dc.index,
      text: dc.text,
    }));
  }
}
