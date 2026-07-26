# Research Federation Architecture

This document outlines the architecture of the DSPG Research Federation Layer.

```
                  ┌──────────────────────┐
                  │     Student PDF      │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ Document Normalizer  │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  SearchQueryBuilder  │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  ├──────────────────────┤
                  │ Research Federation  │
                  │  (Parallel Queries)  │
                  ├──────────┬───────────┤
                  │          │           │
                  ▼          ▼           ▼
               ┌──────┐  ┌────────┐  ┌───────────┐
               │ CORE │  │OpenAlex│  │ Crossref  │
               └──┬───┘  └───┬────┘  └─────┬─────┘
                  │          │             │
                  └──────────┼─────────────┘
                             │ (Promise.all)
                             ▼
                  ┌──────────────────────┐
                  │Candidate Merge Engine│
                  │   (Deduplication)    │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  Similarity Engine   │
                  └──────────────────────┘
```

## 1. Unified Interface Contract
All retrieval services implement the `ResearchProvider` contract:
```typescript
export interface ResearchProvider {
  name: string;
  search(query: SearchQuery): Promise<CandidatePaper[]>;
}
```

## 2. Parallel Processing & Abort Safety
Queries to CORE and OpenAlex are initiated concurrently using `Promise.all`. To avoid slow response times on the Plagiarism Checker web gateway, each provider query is capped at **3500ms** using a promise-race timeout. 

## 3. Graceful Degradation & Failover
- **CORE Fails**: Federation continues using OpenAlex candidates.
- **OpenAlex Fails**: Federation continues using CORE candidates.
- **Both Fail**: Backend terminates the request early and returns `NO_ACADEMIC_EVIDENCE_AVAILABLE` with status 400.
