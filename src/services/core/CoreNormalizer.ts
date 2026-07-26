/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CorePaper, CoreRawResponse } from './CoreTypes';

/**
 * Normalizes raw CORE API responses into standardized CorePaper objects.
 * 
 * This class ensures:
 * - Missing values become undefined (never throw)
 * - Consistent field names across responses
 * - Type safety for optional fields
 * - No dependency on raw API payload structure
 */
export class CoreNormalizer {
  /**
   * Normalizes a single paper from raw API response.
   * 
   * @param raw - Raw paper object from CORE API
   * @returns Normalized CorePaper object
   */
  public normalizePaper(raw: {
    id: number | string;
    title: string;
    authors?: Array<{ name: string }>;
    abstract?: string;
    doi?: string;
    yearPublished?: number;
    downloadUrl?: string;
    journals?: Array<{ title: string } | string>;
    links?: Array<{ type: string; url: string }>;
  }): CorePaper {
    // Normalization strategy for journals:
    // If journals are absent, return undefined.
    // If multiple journals exist, pick the first one's title (deterministic).
    let journal: string | undefined = undefined;
    if (raw.journals && Array.isArray(raw.journals) && raw.journals.length > 0) {
      const firstJournal = raw.journals[0];
      journal = typeof firstJournal === 'string' ? firstJournal : firstJournal.title;
    }

    // Link preservation strategy:
    // Extract displayUrl from links array where type is 'display'
    let displayUrl: string | undefined = undefined;
    if (raw.links && Array.isArray(raw.links)) {
      const displayLink = raw.links.find(link => link.type === 'display');
      if (displayLink) {
        displayUrl = displayLink.url;
      }
    }

    return {
      coreId: typeof raw.id === 'string' ? parseInt(raw.id, 10) || 0 : raw.id,
      title: raw.title ?? '',
      authors: this.normalizeAuthors(raw.authors),
      abstract: raw.abstract ?? undefined,
      doi: raw.doi ?? undefined,
      year: raw.yearPublished ?? undefined,
      downloadUrl: raw.downloadUrl ?? undefined,
      journal,
      displayUrl,
    };
  }

  /**
   * Normalizes an array of raw papers.
   * 
   * @param rawPapers - Array of raw paper objects from CORE API
   * @returns Array of normalized CorePaper objects
   */
  public normalizePapers(rawPapers: CoreRawResponse['results']): CorePaper[] {
    return rawPapers.map((raw) => this.normalizePaper(raw));
  }

  /**
   * Normalizes author names from raw API format.
   * 
   * @param authors - Raw author array from CORE API
   * @returns Array of author names (empty array if missing)
   */
  private normalizeAuthors(authors?: Array<{ name: string }>): string[] {
    if (!authors || !Array.isArray(authors)) {
      return [];
    }
    
    return authors
      .map((author) => author.name)
      .filter((name): name is string => typeof name === 'string' && name.trim().length > 0);
  }

  /**
   * Normalizes a complete search response.
   * 
   * @param raw - Raw response from CORE API
   * @param query - Original search query
   * @param page - Requested page number
   * @param limit - Requested limit
   * @param executionTime - Execution time in milliseconds
   * @returns Normalized CoreSearchResult
   */
  public normalizeResponse(
    raw: CoreRawResponse,
    query: string,
    page: number,
    limit: number,
    executionTime: number
  ): {
    totalResults: number;
    papers: CorePaper[];
    query: string;
    page: number;
    limit: number;
    executionTime: number;
    source: 'CORE';
  } {
    return {
      query,
      totalResults: raw.totalHits ?? 0,
      page,
      limit,
      executionTime,
      source: 'CORE',
      papers: this.normalizePapers(raw.results ?? []),
    };
  }
}