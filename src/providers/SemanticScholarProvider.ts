/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * @see https://www.semanticscholar.org/product/api
 */

import { ResearchProvider, SearchQuery } from './ResearchProvider.js';
import { CandidatePaper } from '../types/CandidatePaper.js';

/**
 * Semantic Scholar API response structures
 * @see https://api.semanticscholar.org/api-docs/graph
 */
interface SemanticScholarResponse {
  data: Array<{
    paperId: string;
    title: string;
    abstract: string;
    venue: string;
    year: number;
    citationCount: number;
    referenceCount: number;
    isOpenAccess: boolean;
    openAccessPdf?: {
      url: string;
      status: string;
    };
    authors: Array<{
      authorId: string;
      name: string;
    }>;
    fieldsOfStudy: string[];
    s2FieldsOfStudy: Array<{
      category: string;
      source: string;
    }>;
    publicationDate: string;
    journal: {
      name: string;
      pages: string;
      volume: string;
      number: string;
    };
    externalIds: {
      DOI?: string;
      MAG?: string;
      PubMed?: string;
      ArXiv?: string;
      [key: string]: string | undefined;
    };
    url: string;
    tldr?: {
      text: string;
      model: string;
    };
    citationStyles?: {
      bibtex: string;
      apa: string;
      mla: string;
    };
  }>;
  total: number;
  offset: number;
  next?: number;
}

/**
 * Semantic Scholar Provider
 * 
 * Features:
 * - 200M+ academic papers
 * - AI-powered citation analysis
 * - Citation context and impact metrics
 * - Free API (100 requests/second)
 * - No API key required
 */
export class SemanticScholarProvider implements ResearchProvider {
  public readonly name = 'SemanticScholar';
  private readonly baseUrl = 'https://api.semanticscholar.org/graph/v1';

  /**
   * Search for papers
   */
  public async search(query: SearchQuery): Promise<CandidatePaper[]> {
    const searchTerm = query.text || (query as any).doi || '';
    if (!searchTerm || searchTerm.length < 3) {
      return [];
    }

    try {
      const response = await this.performSearch(searchTerm);
      if (!response || !response.data) return [];

      return this.transformToCandidates(response);
    } catch (error) {
      console.error('[SemanticScholarProvider] Error:', error);
      return [];
    }
  }

  /**
   * Perform search against Semantic Scholar API
   */
  private async performSearch(query: string): Promise<SemanticScholarResponse | null> {
    const encodedQuery = encodeURIComponent(query);
    const url = `${this.baseUrl}/paper/search?query=${encodedQuery}&limit=10&fields=title,abstract,venue,year,citationCount,referenceCount,isOpenAccess,openAccessPdf,authors,fieldsOfStudy,s2FieldsOfStudy,publicationDate,journal,externalIds,url,tldr,citationStyles`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'DSPG-Plagiarism-Checker/1.0',
        },
      });

      if (!response.ok) {
        console.error(`[SemanticScholarProvider] HTTP ${response.status}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('[SemanticScholarProvider] Network error:', error);
      } else {
        console.error('[SemanticScholarProvider] Unexpected error:', error);
      }
      return null;
    }
  }

  /**
   * Transform Semantic Scholar response to CandidatePaper array
   */
  private transformToCandidates(response: SemanticScholarResponse): CandidatePaper[] {
    return response.data.map(paper => {
      const doi = paper.externalIds?.DOI || '';
      const pdfUrl = paper.openAccessPdf?.url || '';
      const authors = paper.authors?.map(a => ({ name: a.name })) || [];

      return {
        provider: 'SemanticScholar',
        providerId: `semantic:${paper.paperId}`,
        title: paper.title || 'Untitled',
        abstract: paper.abstract || '',
        doi: doi,
        authors: authors,
        institutions: [],
        publicationYear: paper.year || new Date().getFullYear(),
        journal: paper.journal?.name || paper.venue || '',
        publisher: '',
        citationCount: paper.citationCount || 0,
        concepts: paper.fieldsOfStudy || paper.s2FieldsOfStudy?.map(f => f.category) || [],
        keywords: [],
        subjects: [],
        landingPage: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
        pdfUrl: pdfUrl,
        metadata: {
          paperId: paper.paperId,
          referenceCount: paper.referenceCount,
          isOpenAccess: paper.isOpenAccess,
          publicationDate: paper.publicationDate,
          tldr: paper.tldr,
          citationStyles: paper.citationStyles,
          externalIds: paper.externalIds,
          fieldsOfStudy: paper.fieldsOfStudy,
          s2FieldsOfStudy: paper.s2FieldsOfStudy,
        } as unknown as Record<string, unknown>,
        coreId: 0,
        language: undefined,
        fullTextAvailable: !!pdfUrl,
        repository: 'Semantic Scholar',
      };
    });
  }
}

// Singleton instance
export const semanticScholarProvider = new SemanticScholarProvider();
