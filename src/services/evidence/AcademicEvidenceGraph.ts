/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CandidatePaper } from '../../types/CandidatePaper';

export class AcademicEvidenceGraph {
  private readonly papers: CandidatePaper[] = [];

  constructor(papers: CandidatePaper[]) {
    this.papers = papers;
  }

  /**
   * Retrieves all candidate papers mapped in the graph.
   */
  public getPapers(): CandidatePaper[] {
    return this.papers;
  }

  /**
   * Finds a paper by its unique provider identifier.
   */
  public getPaperById(providerId: string): CandidatePaper | undefined {
    return this.papers.find(p => p.providerId === providerId);
  }

  /**
   * Retrieves papers matching a specific provider.
   */
  public getPapersByProvider(provider: string): CandidatePaper[] {
    return this.papers.filter(p => p.provider.toLowerCase() === provider.toLowerCase());
  }
}
