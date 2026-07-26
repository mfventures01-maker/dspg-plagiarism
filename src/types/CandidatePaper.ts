/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Author {
  name: string;
  orcid?: string;
  affiliation?: string;
  institution?: string;
  country?: string;
  position?: string;
  email?: string;
  authorId?: string;
}

export interface Institution {
  name: string;
  country?: string;
  type?: string;
}

export interface CandidatePaper {
  provider: string;
  providerId: string;
  title: string;
  abstract?: string;
  doi?: string;
  authors: Author[];
  institutions: Institution[];
  publicationYear?: number;
  journal?: string;
  publisher?: string;
  repository?: string;
  citationCount: number;
  concepts: string[];
  keywords: string[];
  subjects: string[];
  language?: string;
  pdfUrl?: string;
  landingPage?: string;
  fullTextAvailable: boolean;
  metadata: Record<string, unknown>;
  
  // Downstream compatibility fields
  coreId: number;
}
