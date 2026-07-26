/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ResearchProvider, SearchQuery } from './ResearchProvider';
import { CandidatePaper } from '../types';
import { OpenAlexService } from '../services/OpenAlexService';

export class OpenAlexProvider implements ResearchProvider {
  public readonly name = 'OpenAlex';
  private readonly service: OpenAlexService;

  constructor() {
    this.service = new OpenAlexService();
  }

  public async search(query: SearchQuery): Promise<CandidatePaper[]> {
    try {
      return await this.service.searchWorks(query.text);
    } catch (err) {
      console.error('[OpenAlexProvider] Search failed:', err);
      return [];
    }
  }
}