/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * @see https://www.crossref.org/documentation/retrieve-metadata/rest-api/
 */

import { ResearchProvider, SearchQuery } from './ResearchProvider.js';
import { CandidatePaper } from '../types/CandidatePaper.js';

interface CrossrefResponse {
  status: string;
  'message-type': string;
  'message-version': string;
  message: {
    totalResults: number;
    items: Array<{
      DOI: string;
      title: string[];
      author?: Array<{ given: string; family: string }>;
      issued?: { 'date-parts': number[][] };
      publisher?: string;
      'container-title'?: string[];
      abstract?: string;
      link?: Array<{ URL: string }>;
      score: number;
      type: string;
      citedByCount?: number;
      'is-referenced-by-count'?: number;
      member?: string;
      license?: Array<{ URL: string }>;
    }>;
  };
}

/**
 * Crossref Provider - DOI registration agency
 * 
 * Features:
 * - 150M+ scholarly works
 * - No API key required
 * - Polite pool with email
 * - Citation counts
 * - Publisher metadata
 */
export class CrossrefProvider implements ResearchProvider {
  public readonly name = 'Crossref';
  private readonly baseUrl = 'https://api.crossref.org/works';
  private readonly email = process.env.CROSSREF_EMAIL || 'user@example.com';

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
      if (!response || !response.message) return [];

      return this.transformToCandidates(response);
    } catch (error) {
      console.error('[CrossrefProvider] Error:', error);
      return [];
    }
  }

  /**
   * Perform search against Crossref API
   */
  private async performSearch(query: string): Promise<CrossrefResponse | null> {
    const encodedQuery = encodeURIComponent(query);
    const url = `${this.baseUrl}?query=${encodedQuery}&rows=10&mailto=${encodeURIComponent(this.email)}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': `DSPG-Plagiarism-Checker/1.0 (mailto:${this.email})`,
        },
      });

      if (!response.ok) {
        console.error(`[CrossrefProvider] HTTP ${response.status}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('[CrossrefProvider] Fetch error:', error);
      return null;
    }
  }

  /**
   * Transform Crossref response to CandidatePaper array
   */
  private transformToCandidates(response: CrossrefResponse): CandidatePaper[] {
    return response.message.items.map(item => {
      const title = item.title?.[0] || 'Untitled';
      const authors = item.author?.map(a => ({
        name: `${a.given || ''} ${a.family || ''}`.trim() || 'Unknown Author'
      })) || [];
      
      const year = item.issued?.['date-parts']?.[0]?.[0] || new Date().getFullYear();
      
      const journal = item['container-title']?.[0] || '';
      const publisher = item.publisher || '';
      
      const doi = item.DOI || '';
      const pdfUrl = item.link?.find(l => l.URL.includes('.pdf'))?.URL || '';
      const abstract = item.abstract || '';
      const citationCount = item['is-referenced-by-count'] || 0;

      return {
        provider: 'Crossref',
        providerId: `crossref:${doi}`,
        title: title,
        abstract: abstract,
        doi: doi,
        authors: authors,
        institutions: [],
        publicationYear: year,
        journal: journal,
        publisher: publisher,
        citationCount: citationCount,
        concepts: [],
        keywords: [],
        subjects: [],
        landingPage: `https://doi.org/${doi}`,
        pdfUrl: pdfUrl,
        metadata: {
          type: item.type,
          score: item.score,
          member: item.member,
          license: item.license,
        } as unknown as Record<string, unknown>,
        coreId: 0,
        language: 'en',
        fullTextAvailable: !!pdfUrl,
        repository: 'Crossref',
      };
    });
  }
}

// Singleton instance
export const crossrefProvider = new CrossrefProvider();
