/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ResearchProvider, SearchQuery } from './ResearchProvider';
import { CandidatePaper } from '../types/CandidatePaper';
import { CoreSearchService } from '../services/core/CoreSearchService';

export class COREProvider implements ResearchProvider {
  public readonly name = 'CORE';
  private readonly searchService: CoreSearchService;

  constructor() {
    this.searchService = new CoreSearchService();
  }

  public async search(query: SearchQuery): Promise<CandidatePaper[]> {
    const result = await this.searchService.search(query.text, { page: 1, limit: 5 });
    
    return result.papers.map(paper => ({
      provider: "CORE",
      providerId: `CORE:${paper.coreId}`,
      title: paper.title,
      abstract: paper.abstract,
      doi: paper.doi,
      authors: (paper.authors || []).map((authorName: string) => ({
        name: authorName
      })),
      institutions: [],
      publicationYear: paper.year,
      journal: paper.journal,
      publisher: undefined,
      citationCount: 0,
      
      // ✅ FIX: Concepts, Keywords, Subjects now properly mapped
      concepts: (paper as any).concepts || (paper as any).fieldsOfStudy || [],
      keywords: (paper as any).keywords || [],
      subjects: (paper as any).subjects || [],
      
      landingPage: paper.displayUrl,
      pdfUrl: paper.downloadUrl,
      metadata: paper as any,
      coreId: paper.coreId,
      language: (paper as any).language || undefined,
      fullTextAvailable: !!paper.downloadUrl,
      repository: (paper as any).repository || 'CORE Repository'
    }));
  }
}