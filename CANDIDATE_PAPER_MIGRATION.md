# CANDIDATE_PAPER_MIGRATION.md

This document audits the usage of the legacy `CorePaper` model versus the new single source of truth `CandidatePaper` model across architectural layers.

---

## Architectural Mapping Matrix

| File | Legacy Symbol | Layer | Target Architecture Component | Migration Action / Status |
| :--- | :--- | :--- | :--- | :--- |
| [CoreTypes.ts](file:///c:/Projects/dspg/src/services/core/CoreTypes.ts) | `CorePaper` | Provider Layer | CORE Provider Raw Schema | Keep (necessary for raw API contract) |
| [CoreNormalizer.ts](file:///c:/Projects/dspg/src/services/core/CoreNormalizer.ts) | `CorePaper` | Normalizer Layer | CORE API normalizer mapping | Keep (standardizes CORE v3 responses) |
| [CandidatePaperProvider.ts](file:///c:/Projects/dspg/src/services/evidence/CandidatePaperProvider.ts) | `CorePaper` / `CandidatePaper` | Federation Layer | Research Federation Merging | Aligned (maps and merges candidates to `CandidatePaper`) |
| [AcademicEvidenceGraph.ts](file:///c:/Projects/dspg/src/services/evidence/AcademicEvidenceGraph.ts) | `CandidatePaper` | Evidence Graph Layer | Authoritative In-Memory Graph | Aligned (accepts and stores `CandidatePaper[]`) |
| [SimilarityEngine.ts](file:///c:/Projects/dspg/src/services/evidence/SimilarityEngine.ts) | `CandidatePaper` | Similarity Engine | Plagiarism evaluation scoring | Aligned (requires `CandidatePaper` as input) |
| [CandidateChunker.ts](file:///c:/Projects/dspg/src/services/evidence/CandidateChunker.ts) | `CandidatePaper` | Chunking Layer | Candidate text segmentation | Aligned (migrated to ingest `CandidatePaper`) |
| [CandidateChunker.test.ts](file:///c:/Projects/dspg/src/services/evidence/CandidateChunker.test.ts) | `CorePaper` | Test Layer | Unit test fixtures for chunking | **Needs Migration**: Change imports and fixtures to use `CandidatePaper` |
| [EvidencePackageBuilder.ts](file:///c:/Projects/dspg/src/services/evidence/EvidencePackageBuilder.ts) | `CorePaper` | Evidence Package Builder | Canonical Evidence Assembly | **Needs Migration**: Change `candidatePaper: CorePaper` references to `CandidatePaper` |
| [EvidencePackageBuilder.test.ts](file:///c:/Projects/dspg/src/services/evidence/EvidencePackageBuilder.test.ts) | `CorePaper` | Test Layer | Package builder test validation | **Needs Migration**: Upgrade mocks to use `CandidatePaper` schema |
| [test-evidence-engine.ts](file:///c:/Projects/dspg/scripts/test-evidence-engine.ts) | `CorePaper` | Test / Validation Layer | CLI test suite utility | **Needs Migration**: Upgrade local validation script calls to target `CandidatePaper` |
| [pdfService.ts](file:///c:/Projects/dspg/src/services/pdfService.ts) | `CandidatePaper` | PDF Rendering | PDF Plagiarism Report | Aligned (processes `CandidatePaper[]` and `SimilarityEvidence`) |
| [PDFReport.tsx](file:///c:/Projects/dspg/src/components/Report/PDFReport.tsx) | `CandidatePaper` | UI Rendering | React Preview Report | Aligned (ingests v2.0 response structures) |
