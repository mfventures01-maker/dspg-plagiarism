/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CandidatePaper } from '../../types';

export interface MergeMetrics {
  retrieved: number;
  accepted: number;
  rejected: number;
  duplicate: number;
}

export interface MergeResult {
  candidates: CandidatePaper[];
  metrics: {
    CORE: MergeMetrics;
    OpenAlex: MergeMetrics;
    Unpaywall?: MergeMetrics;
    SemanticScholar?: MergeMetrics;
    Crossref?: MergeMetrics;
    totalRetrieved: number;
    totalMerged: number;
    duplicatesRemoved: number;
  };
}

export class CandidateMergeEngine {
  /**
   * Merges and deduplicates candidates from CORE and OpenAlex.
   * Deduplication priorities:
   * 1. DOI match
   * 2. OpenAlex ID match
   * 3. Title similarity (normalized string comparison)
   * 4. Author overlap
   */
  public merge(corePapers: CandidatePaper[], openAlexPapers: CandidatePaper[], unpaywallPapers: CandidatePaper[] = [], semanticPapers: CandidatePaper[] = [], crossrefPapers: CandidatePaper[] = []): MergeResult {
    const mergedList: CandidatePaper[] = [];
    const duplicatesRemovedSet = new Set<string>();

    const coreMetrics: MergeMetrics = { retrieved: corePapers.length, accepted: 0, rejected: 0, duplicate: 0 };
    const openAlexMetrics: MergeMetrics = { retrieved: openAlexPapers.length, accepted: 0, rejected: 0, duplicate: 0 };
    const unpaywallMetrics: MergeMetrics = { retrieved: unpaywallPapers.length, accepted: 0, rejected: 0, duplicate: 0 };
    const semanticMetrics: MergeMetrics = { retrieved: semanticPapers.length, accepted: 0, rejected: 0, duplicate: 0 };
    const crossrefMetrics: MergeMetrics = { retrieved: crossrefPapers.length, accepted: 0, rejected: 0, duplicate: 0 };

    const cleanDoiMap = new Map<string, CandidatePaper>();
    const idMap = new Map<string, CandidatePaper>();

    // Process CORE papers first (they have higher priority for duplicate matches)
    for (const paper of corePapers) {
      if (this.isDuplicate(paper, mergedList, cleanDoiMap, idMap)) {
        coreMetrics.duplicate++;
        coreMetrics.rejected++;
        duplicatesRemovedSet.add(paper.providerId);
      } else {
        const mergedPaper: CandidatePaper = {
          provider: paper.provider || 'Unknown',
          providerId: paper.providerId || '',
          title: paper.title || 'Untitled',
          abstract: paper.abstract || '',
          doi: paper.doi || '',
          authors: paper.authors || [],
          institutions: paper.institutions || [],
          publicationYear: paper.publicationYear || new Date().getFullYear(),
          journal: paper.journal || '',
          publisher: paper.publisher || '',
          citationCount: paper.citationCount || 0,
          concepts: paper.concepts || [],
          keywords: paper.keywords || [],
          subjects: paper.subjects || [],
          landingPage: paper.landingPage || '',
          pdfUrl: paper.pdfUrl || '',
          metadata: paper.metadata || {},
          coreId: paper.coreId || 0,
          language: paper.language || 'en',
          fullTextAvailable: !!paper.pdfUrl,
          repository: paper.repository || 'Unknown',
        };
        mergedList.push(mergedPaper);
        coreMetrics.accepted++;
        if (mergedPaper.doi) cleanDoiMap.set(this.cleanDoi(mergedPaper.doi), mergedPaper);
        idMap.set(mergedPaper.providerId, mergedPaper);
      }
    }

    // Process OpenAlex papers next
    for (const paper of openAlexPapers) {
      if (this.isDuplicate(paper, mergedList, cleanDoiMap, idMap)) {
        openAlexMetrics.duplicate++;
        openAlexMetrics.rejected++;
        duplicatesRemovedSet.add(paper.providerId);
      } else {
        const mergedPaper: CandidatePaper = {
          provider: paper.provider || 'Unknown',
          providerId: paper.providerId || '',
          title: paper.title || 'Untitled',
          abstract: paper.abstract || '',
          doi: paper.doi || '',
          authors: paper.authors || [],
          institutions: paper.institutions || [],
          publicationYear: paper.publicationYear || new Date().getFullYear(),
          journal: paper.journal || '',
          publisher: paper.publisher || '',
          citationCount: paper.citationCount || 0,
          concepts: paper.concepts || [],
          keywords: paper.keywords || [],
          subjects: paper.subjects || [],
          landingPage: paper.landingPage || '',
          pdfUrl: paper.pdfUrl || '',
          metadata: paper.metadata || {},
          coreId: paper.coreId || 0,
          language: paper.language || 'en',
          fullTextAvailable: !!paper.pdfUrl,
          repository: paper.repository || 'Unknown',
        };
        mergedList.push(mergedPaper);
        openAlexMetrics.accepted++;
        if (mergedPaper.doi) cleanDoiMap.set(this.cleanDoi(mergedPaper.doi), mergedPaper);
        idMap.set(mergedPaper.providerId, mergedPaper);
      }
    }

    // Process Unpaywall papers next
    for (const paper of unpaywallPapers) {
      if (this.isDuplicate(paper, mergedList, cleanDoiMap, idMap)) {
        unpaywallMetrics.duplicate++;
        unpaywallMetrics.rejected++;
        duplicatesRemovedSet.add(paper.providerId);
      } else {
        const mergedPaper: CandidatePaper = {
          provider: paper.provider || 'Unknown',
          providerId: paper.providerId || '',
          title: paper.title || 'Untitled',
          abstract: paper.abstract || '',
          doi: paper.doi || '',
          authors: paper.authors || [],
          institutions: paper.institutions || [],
          publicationYear: paper.publicationYear || new Date().getFullYear(),
          journal: paper.journal || '',
          publisher: paper.publisher || '',
          citationCount: paper.citationCount || 0,
          concepts: paper.concepts || [],
          keywords: paper.keywords || [],
          subjects: paper.subjects || [],
          landingPage: paper.landingPage || '',
          pdfUrl: paper.pdfUrl || '',
          metadata: paper.metadata || {},
          coreId: paper.coreId || 0,
          language: paper.language || 'en',
          fullTextAvailable: !!paper.pdfUrl,
          repository: paper.repository || 'Unknown',
        };
        mergedList.push(mergedPaper);
        unpaywallMetrics.accepted++;
        if (mergedPaper.doi) cleanDoiMap.set(this.cleanDoi(mergedPaper.doi), mergedPaper);
        idMap.set(mergedPaper.providerId, mergedPaper);
      }
    }

    // Process Semantic Scholar papers next
    for (const paper of semanticPapers) {
      if (this.isDuplicate(paper, mergedList, cleanDoiMap, idMap)) {
        semanticMetrics.duplicate++;
        semanticMetrics.rejected++;
        duplicatesRemovedSet.add(paper.providerId);
      } else {
        const mergedPaper: CandidatePaper = {
          provider: paper.provider || 'Unknown',
          providerId: paper.providerId || '',
          title: paper.title || 'Untitled',
          abstract: paper.abstract || '',
          doi: paper.doi || '',
          authors: paper.authors || [],
          institutions: paper.institutions || [],
          publicationYear: paper.publicationYear || new Date().getFullYear(),
          journal: paper.journal || '',
          publisher: paper.publisher || '',
          citationCount: paper.citationCount || 0,
          concepts: paper.concepts || [],
          keywords: paper.keywords || [],
          subjects: paper.subjects || [],
          landingPage: paper.landingPage || '',
          pdfUrl: paper.pdfUrl || '',
          metadata: paper.metadata || {},
          coreId: paper.coreId || 0,
          language: paper.language || 'en',
          fullTextAvailable: !!paper.pdfUrl,
          repository: paper.repository || 'Unknown',
        };
        mergedList.push(mergedPaper);
        semanticMetrics.accepted++;
        if (mergedPaper.doi) cleanDoiMap.set(this.cleanDoi(mergedPaper.doi), mergedPaper);
        idMap.set(mergedPaper.providerId, mergedPaper);
      }
    }

    // Process Crossref papers last
    for (const paper of crossrefPapers) {
      if (this.isDuplicate(paper, mergedList, cleanDoiMap, idMap)) {
        crossrefMetrics.duplicate++;
        crossrefMetrics.rejected++;
        duplicatesRemovedSet.add(paper.providerId);
      } else {
        const mergedPaper: CandidatePaper = {
          provider: paper.provider || 'Unknown',
          providerId: paper.providerId || '',
          title: paper.title || 'Untitled',
          abstract: paper.abstract || '',
          doi: paper.doi || '',
          authors: paper.authors || [],
          institutions: paper.institutions || [],
          publicationYear: paper.publicationYear || new Date().getFullYear(),
          journal: paper.journal || '',
          publisher: paper.publisher || '',
          citationCount: paper.citationCount || 0,
          concepts: paper.concepts || [],
          keywords: paper.keywords || [],
          subjects: paper.subjects || [],
          landingPage: paper.landingPage || '',
          pdfUrl: paper.pdfUrl || '',
          metadata: paper.metadata || {},
          coreId: paper.coreId || 0,
          language: paper.language || 'en',
          fullTextAvailable: !!paper.pdfUrl,
          repository: paper.repository || 'Unknown',
        };
        mergedList.push(mergedPaper);
        crossrefMetrics.accepted++;
        if (mergedPaper.doi) cleanDoiMap.set(this.cleanDoi(mergedPaper.doi), mergedPaper);
        idMap.set(mergedPaper.providerId, mergedPaper);
      }
    }

    return {
      candidates: mergedList,
      metrics: {
        CORE: coreMetrics,
        OpenAlex: openAlexMetrics,
        Unpaywall: unpaywallMetrics,
        SemanticScholar: semanticMetrics,
        Crossref: crossrefMetrics,
        totalRetrieved: corePapers.length + openAlexPapers.length + unpaywallPapers.length + semanticPapers.length + crossrefPapers.length,
        totalMerged: mergedList.length,
        duplicatesRemoved: duplicatesRemovedSet.size
      }
    };
  }

  private isDuplicate(
    paper: CandidatePaper,
    mergedList: CandidatePaper[],
    cleanDoiMap: Map<string, CandidatePaper>,
    idMap: Map<string, CandidatePaper>
  ): boolean {
    // 1. Check DOI
    if (paper.doi) {
      const cleanDoi = this.cleanDoi(paper.doi);
      if (cleanDoiMap.has(cleanDoi)) {
        return true;
      }
    }

    // 2. Check unified ID
    if (idMap.has(paper.providerId)) {
      return true;
    }

    // 3. Check Title and Author overlap
    const cleanTitle = this.cleanTitle(paper.title);
    for (const existing of mergedList) {
      const existingCleanTitle = this.cleanTitle(existing.title);
      if (cleanTitle === existingCleanTitle) {
        // If titles match exactly, check author overlap (Priority 4)
        if (paper.authors.length === 0 || existing.authors.length === 0) {
          return true; // assume duplicate if either has no author info
        }
        const hasOverlap = paper.authors.some(a1 => 
          existing.authors.some(a2 => this.normalizeAuthor(a1.name) === this.normalizeAuthor(a2.name))
        );
        if (hasOverlap) {
          return true;
        }
      }
    }

    return false;
  }

  private cleanDoi(doi: string): string {
    return doi.toLowerCase()
      .replace('https://doi.org/', '')
      .replace('http://doi.org/', '')
      .trim();
  }

  private cleanTitle(title: string): string {
    return title.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .trim();
  }

  private normalizeAuthor(author: string): string {
    return author.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .trim();
  }
}
