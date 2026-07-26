/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Represents a normalized academic paper from CORE API.
 * All fields are normalized to ensure consistency across responses.
 */
export interface CorePaper {
  /** Unique identifier from CORE */
  coreId: number;
  /** Paper title */
  title: string;
  /** List of author names */
  authors: string[];
  /** Paper abstract (optional) */
  abstract?: string;
  /** Digital Object Identifier (optional) */
  doi?: string;
  /** Publication year (optional) */
  year?: number;
  /** URL to download the paper (optional) */
  downloadUrl?: string;
  /** Journal or venue name (optional) */
  journal?: string;
  /** Canonical display URL from CORE links */
  displayUrl?: string;
}

/**
 * Result of a CORE search operation.
 * Contains normalized papers and pagination metadata.
 */
export interface CoreSearchResult {
  /** Original search query */
  query: string;
  /** Total number of results available */
  totalResults: number;
  /** Current page number (1-indexed) */
  page: number;
  /** Number of results per page */
  limit: number;
  /** Execution time in milliseconds */
  executionTime: number;
  /** Source identifier */
  source: 'CORE';
  /** Normalized list of papers */
  papers: CorePaper[];
}

/**
 * Search options for CORE API queries.
 */
export interface CoreSearchOptions {
  /** Page number (1-indexed, default: 1) */
  page?: number;
  /** Number of results per page (default: 10, max: 100) */
  limit?: number;
}

/**
 * CoreOutput represents an output reference for a paper.
 * Verified from runtime evidence: it is a string URL.
 */
export type CoreOutput = string;

export interface CoreRawResponse {
  limit?: number;
  offset?: number;
  totalHits: number;
  searchId?: string;
  results: Array<{
    id: number | string;
    title: string;
    authors?: Array<{ name: string }>;
    abstract?: string;
    doi?: string;
    yearPublished?: number;
    publishedDate?: string;
    downloadUrl?: string;
    journals?: Array<{ title: string } | string>;
    outputs?: CoreOutput[];
    links?: Array<{ type: string; url: string }>;
  }>;
}