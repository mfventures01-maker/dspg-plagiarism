# IMPORT_DEPENDENCY_AUDIT.md

This document inventories every import statement referencing obsolete exports (`SimilarityResult`, `MatchingChunk`) that were removed or restructured during the transition to the `SimilarityEvidence` SSOT.

---

## Import Dependency Registry

| Referencing File | Line | Obsolete Import | Target Module | Architectural State | Action Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [EvidencePackageBuilder.ts](file:///c:/Projects/dspg/src/services/evidence/EvidencePackageBuilder.ts) | 7 | `SimilarityResult` | `./SimilarityEngine` | Removed / Renamed to `SimilarityEvidence` | Change import to `SimilarityEvidence` from `../../types` |
| [EvidencePackageBuilder.ts](file:///c:/Projects/dspg/src/services/evidence/EvidencePackageBuilder.ts) | 7 | `MatchingChunk` | `./SimilarityEngine` | Removed / Renamed to `MatchingPassage` | Change import to `MatchingPassage` from `../../types` |
| [EvidencePackageBuilder.test.ts](file:///c:/Projects/dspg/src/services/evidence/EvidencePackageBuilder.test.ts) | 9 | `SimilarityResult` | `./SimilarityEngine` | Removed / Renamed to `SimilarityEvidence` | Update import to use `SimilarityEvidence` from `../../types` |
| [test-evidence-engine.ts](file:///c:/Projects/dspg/scripts/test-evidence-engine.ts) | 8 | `CorePaper` | `../src/services/core/CoreTypes` | provider-specific type bypass | Import `CandidatePaper` from `../src/types` instead |

---

## Resolved / Relocated Structures Reference

- `SimilarityResult` -> Renamed to `SimilarityEvidence` and moved to [SimilarityEvidence.ts](file:///c:/Projects/dspg/src/types/SimilarityEvidence.ts).
- `MatchingChunk` -> Renamed to `MatchingPassage` and moved to [SimilarityEvidence.ts](file:///c:/Projects/dspg/src/types/SimilarityEvidence.ts).
- `CorePaper` -> Changed to `CandidatePaper` as the single source of truth, defined at [CandidatePaper.ts](file:///c:/Projects/dspg/src/types/CandidatePaper.ts).
