/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CandidatePaper } from '../../types/CandidatePaper';

function getDeterministicId(idStr: string): number {
  const match = idStr.match(/W(\d+)/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash << 5) - hash + idStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function normalizeOpenAlex(work: any): CandidatePaper {
  const authors = (work.authorships || []).map((a: any) => ({
    name: a.author?.display_name || 'Unknown Author',
    orcid: a.author?.orcid || undefined,
    affiliation: a.institutions?.[0]?.display_name || undefined,
    institution: a.institutions?.[0]?.display_name || undefined,
    country: a.institutions?.[0]?.country_code || undefined,
    position: a.author_position || undefined,
    authorId: a.author?.id || undefined
  }));

  const institutions = (work.authorships || []).flatMap((a: any) => 
    (a.institutions || []).map((inst: any) => ({
      name: inst.display_name || 'Unknown Institution',
      country: inst.country_code || undefined,
      type: inst.type || undefined
    }))
  );



  const repository = work.primary_location?.source?.display_name || 'OpenAlex Source';

  return {
    provider: "OpenAlex",
    providerId: work.id || `OA:${work.display_name}`,
    title: work.display_name ?? work.title ?? 'Untitled OpenAlex Paper',
    abstract: work.abstract ?? undefined,
    doi: work.doi ?? undefined,
    authors,
    institutions,
    publicationYear: work.publication_year,
    journal: work.primary_location?.source?.display_name,
    publisher: work.primary_location?.source?.host_organization_name,
    citationCount: work.cited_by_count ?? 0,
    concepts: work.fieldsOfStudy || work.concepts || [],
    keywords: work.keywords || [],
    subjects: work.subjects || [],
    landingPage: work.primary_location?.landing_page_url,
    pdfUrl: work.primary_location?.pdf_url,
    metadata: work,
    coreId: getDeterministicId(work.id || ''),
    language: work.language || undefined,
    fullTextAvailable: !!work.primary_location?.pdf_url,
    repository
  };
}
