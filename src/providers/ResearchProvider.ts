/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CandidatePaper } from '../types';

export interface SearchQuery {
  text: string;
}

export interface ResearchProvider {
  name: string;
  search(query: SearchQuery): Promise<CandidatePaper[]>;
}
