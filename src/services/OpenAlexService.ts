/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CandidatePaper } from '../types/CandidatePaper';

export class OpenAlexService {
  private readonly baseUrl = 'https://api.openalex.org';
  private readonly mailto = 'dspg-plagiarism@example.com';

  public async searchWorks(queryText: string): Promise<CandidatePaper[]> {
    console.log('OpenAlex Search');
    console.log(`[OpenAlexService] 🔍 Query being sent: "${queryText}"`);
    const startTime = Date.now();
    const encodedQuery = encodeURIComponent(queryText);
    
    // ✅ FIX: Added 'fields' parameter to request concepts, keywords, subjects
    const url = `${this.baseUrl}/works?search=${encodedQuery}&mailto=${this.mailto}&per_page=5&select=id,doi,title,abstract_inverted_index,publication_year,primary_location,cited_by_count,language,open_access,authorships,concepts,keywords`;

    let attempts = 3;
    let delay = 1000;
    let results: any[] = [];
    let status: 'SUCCESS' | 'FAILED' = 'SUCCESS';

    while (attempts > 0) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 429) {
            attempts--;
            if (attempts === 0) {
              status = 'FAILED';
              throw new Error(`OpenAlex API responded with status ${response.status}`);
            }
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
          } else {
            status = 'FAILED';
            throw new Error(`OpenAlex API responded with status ${response.status}`);
          }
        } else {
          const data = await response.json();
          results = data.results || [];
          console.log('Results Retrieved');
          break;
        }
      } catch (err: any) {
        attempts--;
        if (attempts === 0) {
          status = 'FAILED';
          const duration = Date.now() - startTime;
          console.log(`[OpenAlex]\nQuery:\n${queryText}\nRetrieved:\n0 papers\nNormalized:\n0 papers\nDuration:\n${duration} ms\nStatus:\nFAILED`);
          throw err;
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }

    const normalized = results.map((work: any) => ({
      provider: 'OpenAlex',
      providerId: work.id || '',
      title: work.title || 'Untitled',
      abstract: work.abstract || '',
      doi: work.doi || '',
      authors: work.authorships?.map((a: any) => ({ 
        name: a.author.display_name 
      })) || [],
      institutions: work.authorships?.flatMap((a: any) => 
        a.institutions?.map((i: any) => ({ 
          name: i.display_name || '' 
        })) || []
      ) || [],
      publicationYear: work.publication_year || new Date().getFullYear(),
      journal: work.primary_location?.source?.display_name || '',
      publisher: work.publisher || '',
      citationCount: work.cited_by_count || 0,
      
      // ✅ FIXED: Extract display_name from concepts and keywords
      concepts: work.concepts?.map((c: any) => c.display_name) || [],
      keywords: work.keywords?.map((k: any) => k.display_name) || [],
      subjects: [], // OpenAlex doesn't have a subjects field
      
      landingPage: work.doi ? `https://doi.org/${work.doi}` : '',
      pdfUrl: work.open_access?.oa_url || '',
      metadata: work,
      coreId: work.id?.replace('https://openalex.org/', '') || '',
      language: work.language || 'en',
      fullTextAvailable: !!work.open_access?.is_oa,
      repository: 'OpenAlex',
    }));
    
    console.log('Normalization Complete');
    const duration = Date.now() - startTime;

    console.log(`[OpenAlex]\nQuery:\n${queryText}\nRetrieved:\n${results.length} papers\nNormalized:\n${normalized.length} papers\nDuration:\n${duration} ms\nStatus:\n${status}`);
    console.log(`[OpenAlexService] 📊 Concepts: ${normalized[0]?.concepts?.join(', ') || 'EMPTY'}`);
    console.log(`[OpenAlexService] 📊 Keywords: ${normalized[0]?.keywords?.join(', ') || 'EMPTY'}`);

    return normalized;
  }
}