# LEGACY_MODEL_AUDIT.md

This audit inventories the files containing legacy models, obsolete types, and structural attributes that must be migrated to match the new `CandidatePaper` and `SimilarityEvidence` architecture.

## Legacy Model Audit Inventory

| Symbol | File | Line | Replacement | Status |
| :--- | :--- | :--- | :--- | :--- |
| `CorePaper` | [CandidateChunker.test.ts](file:///c:/Projects/dspg/src/services/evidence/CandidateChunker.test.ts) | 8 | `CandidatePaper` | Needs Migration |
| `CorePaper` | [CandidateChunker.test.ts](file:///c:/Projects/dspg/src/services/evidence/CandidateChunker.test.ts) | 30 | `CandidatePaper` | Needs Migration |
| `CorePaper` | [CandidateChunker.test.ts](file:///c:/Projects/dspg/src/services/evidence/CandidateChunker.test.ts) | 48 | `CandidatePaper` | Needs Migration |
| `CorePaper` | [CoreNormalizer.ts](file:///c:/Projects/dspg/src/services/core/CoreNormalizer.ts) | 6, 9, 22, 34, 71, 73, 111 | Keep (CoreNormalizer is provider-specific; maps CORE API response to intermediate `CorePaper` structure before `CandidatePaperProvider` merges/transforms to `CandidatePaper`) | Active/Valid |
| `CorePaper` | [CoreTypes.ts](file:///c:/Projects/dspg/src/services/core/CoreTypes.ts) | 10, 49 | Keep (Define raw provider interface types) | Active/Valid |
| `CorePaper` | [CoreSearchService.ts](file:///c:/Projects/dspg/src/services/core/CoreSearchService.ts) | 285 | Keep (Typescript export definition) | Active/Valid |
| `CorePaper` | [EvidencePackageBuilder.ts](file:///c:/Projects/dspg/src/services/evidence/EvidencePackageBuilder.ts) | 6 | `CandidatePaper` | Needs Migration |
| `CorePaper` | [EvidencePackageBuilder.ts](file:///c:/Projects/dspg/src/services/evidence/EvidencePackageBuilder.ts) | 15 | `CandidatePaper` | Needs Migration |
| `CorePaper` | [EvidencePackageBuilder.ts](file:///c:/Projects/dspg/src/services/evidence/EvidencePackageBuilder.ts) | 40 | `CandidatePaper` | Needs Migration |
| `CorePaper` | [EvidencePackageBuilder.test.ts](file:///c:/Projects/dspg/src/services/evidence/EvidencePackageBuilder.test.ts) | 8 | `CandidatePaper` | Needs Migration |
| `CorePaper` | [EvidencePackageBuilder.test.ts](file:///c:/Projects/dspg/src/services/evidence/EvidencePackageBuilder.test.ts) | 31 | `CandidatePaper` | Needs Migration |
| `SimilarityResult` | [EvidencePackageBuilder.ts](file:///c:/Projects/dspg/src/services/evidence/EvidencePackageBuilder.ts) | 7 | `SimilarityEvidence` | Needs Migration |
| `SimilarityResult` | [EvidencePackageBuilder.ts](file:///c:/Projects/dspg/src/services/evidence/EvidencePackageBuilder.ts) | 16 | `SimilarityEvidence` | Needs Migration |
| `SimilarityResult` | [EvidencePackageBuilder.ts](file:///c:/Projects/dspg/src/services/evidence/EvidencePackageBuilder.ts) | 41 | `SimilarityEvidence` | Needs Migration |
| `SimilarityResult` | [EvidencePackageBuilder.test.ts](file:///c:/Projects/dspg/src/services/evidence/EvidencePackageBuilder.test.ts) | 9 | `SimilarityEvidence` | Needs Migration |
| `SimilarityResult` | [EvidencePackageBuilder.test.ts](file:///c:/Projects/dspg/src/services/evidence/EvidencePackageBuilder.test.ts) | 37 | `SimilarityEvidence` | Needs Migration |
| `MatchingChunk` | [EvidencePackageBuilder.ts](file:///c:/Projects/dspg/src/services/evidence/EvidencePackageBuilder.ts) | 7 | `MatchingPassage` | Needs Migration |
| `MatchingChunk` | [EvidencePackageBuilder.ts](file:///c:/Projects/dspg/src/services/evidence/EvidencePackageBuilder.ts) | 17 | `MatchingPassage` | Needs Migration |
| `CandidateId` | [SimilarityEngine.test.ts](file:///c:/Projects/dspg/src/services/evidence/SimilarityEngine.test.ts) | 37 | `providerId` (Part of `SimilarityEvidence`) | Needs Migration |
| `metrics` | [SimilarityEngine.test.ts](file:///c:/Projects/dspg/src/services/evidence/SimilarityEngine.test.ts) | 39, 40, 41 | `breakdown` (Part of `SimilarityEvidence`) | Needs Migration |
| `matchingChunks` | [SimilarityEngine.test.ts](file:///c:/Projects/dspg/src/services/evidence/SimilarityEngine.test.ts) | 42 | `matchingPassages` (Part of `SimilarityEvidence`) | Needs Migration |
| `metrics` | [test-evidence-engine.ts](file:///c:/Projects/dspg/scripts/test-evidence-engine.ts) | 55 | `breakdown` | Needs Migration |
| `matchingChunks` | [test-evidence-engine.ts](file:///c:/Projects/dspg/scripts/test-evidence-engine.ts) | 56 | `matchingPassages` | Needs Migration |
| `paper` (CorePaper param) | [test-evidence-engine.ts](file:///c:/Projects/dspg/scripts/test-evidence-engine.ts) | 59 | `CandidatePaper` | Needs Migration |
