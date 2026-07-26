/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * @see https://unpaywall.org/products/api
 */

import { ResearchProvider, SearchQuery } from './ResearchProvider';
import { CandidatePaper } from '../types';

/**
 * Unpaywall API response structure
 * @see https://unpaywall.org/api/v2/lookup
 */
interface UnpaywallResponse {
  doi: string;
  title: string;
  authors: Array<{ name: string }>;
  year: number;
  publisher: string;
  journal_name: string;
  is_oa: boolean;
  oa_status: 'closed' | 'green' | 'gold' | 'hybrid' | 'bronze';
  best_oa_location?: {
    url: string;
    pdf_url?: string;
    landing_page_url?: string;
    version: string;
    host_type: string;
  };
  oa_locations: Array<{
    url: string;
    pdf_url?: string;
    landing_page_url?: string;
    version: string;
    host_type: string;
  }>;
  data_standard: number;
}

/**
 * Unpaywall Provider - DOI-based open access article lookup
 * 
 * Compliance: Law 10 (AI Is an Engine)
 * Coverage: 120M+ open access articles
 * Rate Limit: 100,000 requests/day
 * Authentication: Email header only (no API key required)
 */
export class UnpaywallProvider implements ResearchProvider {
  public readonly name = 'Unpaywall';
  private readonly baseUrl = 'https://api.unpaywall.org/v2';

  /**
   * Search by DOI - Unpaywall is DOI-based
   * 
   * @param query - Search query (expects doi or text containing DOI)
   * @returns CandidatePaper array
   */
  public async search(query: SearchQuery): Promise<CandidatePaper[]> {
    const doi = this.extractDOI(query);
    
    if (!doi) {
      return [];
    }

    try {
      const response = await this.fetchByDOI(doi);
      if (!response) return [];

      return this.transformToCandidates(response);
    } catch (error) {
      console.error('[UnpaywallProvider] Error:', error);
      return [];
    }
  }

  /**
   * Extract DOI from query
   */
  private extractDOI(query: SearchQuery): string | null {
    const source = (query as any).doi || query.text || '';
    const doiMatch = source.match(/10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);
    return doiMatch ? doiMatch[0] : null;
  }

  /**
   * Fetch article data from Unpaywall by DOI
   * 
   * @param doi - Digital Object Identifier
   * @returns UnpaywallResponse or null
   */
  private async fetchByDOI(doi: string): Promise<UnpaywallResponse | null> {
    const email = process.env.UNPAYWALL_EMAIL || 'user@example.com';
    const url = `${this.baseUrl}/${encodeURIComponent(doi)}?email=${encodeURIComponent(email)}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'DSPG-Plagiarism-Checker/1.0',
        },
      });

      if (response.status === 404) {
        console.debug(`[UnpaywallProvider] DOI not found: ${doi}`);
        return null;
      }

      if (!response.ok) {
        console.error(`[UnpaywallProvider] HTTP ${response.status} for DOI: ${doi}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('[UnpaywallProvider] Network error:', error);
      } else {
        console.error('[UnpaywallProvider] Unexpected error:', error);
      }
      return null;
    }
  }

  /**
   * Transform Unpaywall response to CandidatePaper array
   */
  private transformToCandidates(data: UnpaywallResponse): CandidatePaper[] {
    const results: CandidatePaper[] = [];

    // Best OA location (preferred)
    if (data.best_oa_location) {
      const paper = this.createCandidate(data, data.best_oa_location);
      if (paper) results.push(paper);
    }

    // Other OA locations (fallbacks)
    for (const location of data.oa_locations || []) {
      if (location === data.best_oa_location) continue;
      const paper = this.createCandidate(data, location);
      if (paper) results.push(paper);
    }

    // If no OA locations found but data exists, create a citation-only entry
    if (results.length === 0 && data.doi) {
      results.push({
        provider: 'Unpaywall',
        providerId: `unpaywall:${data.doi}`,
        title: data.title || 'Untitled',
        abstract: '',
        doi: data.doi,
        authors: data.authors || [],
        institutions: [],
        publicationYear: data.year || new Date().getFullYear(),
        journal: data.journal_name || '',
        publisher: data.publisher || '',
        citationCount: 0,
        concepts: [],
        keywords: [],
        subjects: [],
        landingPage: `https://doi.org/${data.doi}`,
        pdfUrl: undefined,
        metadata: data as unknown as Record<string, unknown>,
        coreId: -1,
        language: undefined,
        fullTextAvailable: false,
        repository: 'Unpaywall (Citation Only)',
      });
    }

    return results;
  }

  /**
   * Create a CandidatePaper from Unpaywall data and location
   */
  private createCandidate(
    data: UnpaywallResponse,
    location: NonNullable<UnpaywallResponse['best_oa_location']>
  ): CandidatePaper | null {
    if (!data.doi) return null;

    return {
      provider: 'Unpaywall',
      providerId: `unpaywall:${data.doi}`,
      title: data.title || 'Untitled',
      abstract: '',
      doi: data.doi,
      authors: data.authors || [],
      institutions: [],
      publicationYear: data.year || new Date().getFullYear(),
      journal: data.journal_name || '',
      publisher: data.publisher || '',
      citationCount: 0,
      concepts: [],
      keywords: [],
      subjects: [],
      landingPage: location.landing_page_url || location.url || `https://doi.org/${data.doi}`,
      pdfUrl: location.pdf_url || location.url,
      metadata: data as unknown as Record<string, unknown>,
      coreId: -1,
      language: undefined,
      fullTextAvailable: !!location.pdf_url,
      repository: 'Unpaywall Open Access',
    };
  }
}

// Singleton instance
export const unpaywallProvider = new UnpaywallProvider();
