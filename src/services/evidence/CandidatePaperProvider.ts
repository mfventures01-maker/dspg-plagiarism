/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CandidatePaper } from '../../types';
import { COREProvider } from '../../providers/COREProvider';
import { OpenAlexProvider } from '../../providers/OpenAlexProvider';
import { UnpaywallProvider } from '../../providers/UnpaywallProvider.js';
import { CrossrefProvider } from '../../providers/CrossrefProvider.js';
import { SearchQueryBuilder } from '../core/SearchQueryBuilder.js';
import { CandidateMergeEngine } from './CandidateMergeEngine.js';

export interface ProviderMetrics {
  name: string;
  retrieved: number;
  accepted: number;
  rejected: number;
  duplicate: number;
  time: number; // Duration in seconds
  status: 'SUCCESS' | 'FAILED';
}

export interface FederationMetrics {
  providers: ProviderMetrics[];
}

export interface ICandidatePaperProvider {
  getCandidates(documentText: string): Promise<CandidatePaper[]>;
}

export class CandidatePaperProvider implements ICandidatePaperProvider {
  private readonly coreProvider: COREProvider;
  private readonly openAlexProvider: OpenAlexProvider;
  private readonly unpaywallProvider: UnpaywallProvider;
    private readonly crossrefProvider: CrossrefProvider;
  private readonly queryBuilder: SearchQueryBuilder;
  private readonly mergeEngine: CandidateMergeEngine;

  constructor() {
    this.coreProvider = new COREProvider();
    this.openAlexProvider = new OpenAlexProvider();
    this.unpaywallProvider = new UnpaywallProvider();
        this.crossrefProvider = new CrossrefProvider();
    this.queryBuilder = new SearchQueryBuilder();
    this.mergeEngine = new CandidateMergeEngine();
  }

  /**
   * Retrieves candidate papers from CORE and OpenAlex in parallel,
   * merges and deduplicates them using CandidateMergeEngine.
   */
  public async getCandidates(documentText: string): Promise<CandidatePaper[]> {
    console.log('Research Federation Started');

    const queryStr = this.queryBuilder.buildQuery(documentText);
    console.log(`[CandidatePaperProvider] 🔍 Query built: "${queryStr}"`);
    const query = { text: queryStr };

    let corePapers: CandidatePaper[] = [];
    let coreStatus: 'SUCCESS' | 'FAILED' = 'SUCCESS';
    let coreTime = 0;

    let openAlexPapers: CandidatePaper[] = [];
    let openAlexStatus: 'SUCCESS' | 'FAILED' = 'SUCCESS';
    let openAlexTime = 0;

    let unpaywallPapers: CandidatePaper[] = [];
    let unpaywallStatus: 'SUCCESS' | 'FAILED' = 'SUCCESS';
    let unpaywallTime = 0;

            
    let crossrefPapers: CandidatePaper[] = [];
    let crossrefStatus: 'SUCCESS' | 'FAILED' = 'SUCCESS';
    let crossrefTime = 0;

    const timeoutPromise = <T>(promise: Promise<T>, ms: number, name: string): Promise<T> => {
      let timeoutId: NodeJS.Timeout;
      const timeout = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`[${name}] Request timed out after ${ms}ms`));
        }, ms);
      });
      return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
    };

    // Search CORE in parallel with OpenAlex
    const corePromise = (async () => {
      const start = Date.now();
      try {
        const coreTimeout = parseInt(process.env.CORE_API_TIMEOUT_MS || '10000', 10); corePapers = await timeoutPromise(this.coreProvider.search(query), coreTimeout, 'CORE');
      } catch (err) {
        console.error('[Research Federation] CORE retrieval failed:', err);
        coreStatus = 'FAILED';
      } finally {
        coreTime = Number(((Date.now() - start) / 1000).toFixed(2));
      }
    })();

    const openAlexPromise = (async () => {
      const start = Date.now();
      try {
        const openAlexTimeout = parseInt(process.env.OPENALEX_API_TIMEOUT_MS || '10000', 10); openAlexPapers = await timeoutPromise(this.openAlexProvider.search(query), openAlexTimeout, 'OpenAlex');
      } catch (err) {
        console.error('[Research Federation] OpenAlex retrieval failed:', err);
        openAlexStatus = 'FAILED';
      } finally {
        openAlexTime = Number(((Date.now() - start) / 1000).toFixed(2));
      }
    })();

    const unpaywallPromise = (async () => {
      const start = Date.now();
      try {
        // Try to extract DOI from document
        const doiQuery = { text: documentText };
        unpaywallPapers = await this.unpaywallProvider.search(doiQuery);
      } catch (err) {
        console.error('[Research Federation] Unpaywall retrieval failed:', err);
        unpaywallStatus = 'FAILED';
      } finally {
        unpaywallTime = Number(((Date.now() - start) / 1000).toFixed(2));
      }
    })();

    const semanticPromise = (async () => {
      const start = Date.now();
      try {
        
      } catch (err) {
        
        
      } finally {
        
      }
    })();

    const crossrefPromise = (async () => {
      const start = Date.now();
      try {
        crossrefPapers = await this.crossrefProvider.search(query);
      } catch (err) {
        console.error('[Research Federation] Crossref retrieval failed:', err);
        crossrefStatus = 'FAILED';
      } finally {
        crossrefTime = Number(((Date.now() - start) / 1000).toFixed(2));
      }
    })();

    await Promise.all([corePromise, openAlexPromise, unpaywallPromise, crossrefPromise]);

    console.log(`[Research Federation] CORE status: ${coreStatus} (${corePapers.length} retrieved, ${coreTime}s)`);
    console.log(`[Research Federation] OpenAlex status: ${openAlexStatus} (${openAlexPapers.length} retrieved, ${openAlexTime}s)`);
    console.log(`[Research Federation] Unpaywall status: ${unpaywallStatus} (${unpaywallPapers.length} retrieved, ${unpaywallTime}s)`);
    console.log(`[Research Federation] Crossref status: ${crossrefStatus} (${crossrefPapers.length} retrieved, ${crossrefTime}s)`);

    // Run Candidate Merge Engine
    const mergeResult = this.mergeEngine.merge(corePapers, openAlexPapers, unpaywallPapers, crossrefPapers);

    // Map metrics for each provider
    const providersMetrics: ProviderMetrics[] = [
      {
        name: 'CORE',
        retrieved: corePapers.length,
        accepted: mergeResult.metrics.CORE.accepted,
        rejected: mergeResult.metrics.CORE.rejected,
        duplicate: mergeResult.metrics.CORE.duplicate,
        time: coreTime,
        status: coreStatus
      },
      {
        name: 'OpenAlex',
        retrieved: openAlexPapers.length,
        accepted: mergeResult.metrics.OpenAlex?.accepted || 0,
        rejected: mergeResult.metrics.OpenAlex?.rejected || 0,
        duplicate: mergeResult.metrics.OpenAlex?.duplicate || 0,
        time: openAlexTime,
        status: openAlexStatus
      },
      {
        name: 'Unpaywall',
        retrieved: unpaywallPapers.length,
        accepted: mergeResult.metrics.Unpaywall?.accepted || 0,
        rejected: mergeResult.metrics.Unpaywall?.rejected || 0,
        duplicate: mergeResult.metrics.Unpaywall?.duplicate || 0,
        time: unpaywallTime,
        status: unpaywallStatus
      },
      {
      {
        name: 'Crossref',
        retrieved: crossrefPapers.length,
        accepted: mergeResult.metrics.Crossref?.accepted || 0,
        rejected: mergeResult.metrics.Crossref?.rejected || 0,
        duplicate: mergeResult.metrics.Crossref?.duplicate || 0,
        time: crossrefTime,
        status: crossrefStatus
      }
    ];

    const resultList = mergeResult.candidates.map(paper => ({
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
      
      // === ADD THESE THREE LINES ===
      concepts: paper.concepts || [],
      keywords: paper.keywords || [],
      subjects: paper.subjects || [],
      // ============================
      
      landingPage: paper.landingPage || '',
      pdfUrl: paper.pdfUrl || '',
      metadata: paper.metadata || {},
      coreId: Number(paper.coreId) || 0,
      language: paper.language || 'en',
      fullTextAvailable: !!paper.pdfUrl,
      repository: paper.repository || 'Unknown',
    }));
    (resultList as any).federationMetrics = {
      providers: providersMetrics
    };
    (resultList as any).mergeMetrics = {
      duplicatesRemoved: mergeResult.metrics.duplicatesRemoved,
      totalMerged: mergeResult.metrics.totalMerged
    };

    console.log(`[CandidatePaperProvider] 📊 First paper concepts: ${resultList[0]?.concepts?.join(', ') || 'EMPTY'}`);

    return resultList;
  }
}



