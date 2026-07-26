# TEST_MIGRATION_MATRIX.md

This document maps all compile-time failures and test suite misalignments into structured categories, identifying root causes and required fixes.

---

## Test Migration Inventory

| Test File | Failure Category | Root Cause | Migration Action Required |
| :--- | :--- | :--- | :--- |
| `scripts/test-evidence-engine.ts` | Category A / B | Call to `computeSimilarity` passes `paper.coreId` (number) instead of `paper` (`CandidatePaper`). Consumes legacy `metrics` and `matchingChunks` properties. Passes `CorePaper` to package builder. | Change first parameter to `paper`. Update prints to read `similarity.breakdown` and `similarity.matchingPassages`. |
| `src/services/evidence/CandidateChunker.test.ts` | Category B / D | Test fixtures declare and pass `CorePaper` instead of `CandidatePaper` to `chunker.chunk()`. | Change fixture declarations to `CandidatePaper`. Add missing `CandidatePaper` fields (provider, providerId, keywords, subjects, language, fullTextAvailable, repository). |
| `src/services/evidence/SimilarityEngine.test.ts` | Category A / E | Test passes mock ID (`1` or `2`) as first parameter instead of a full `CandidatePaper` mock. Test asserts properties `candidateId`, `metrics`, and `matchingChunks` which do not exist on the new `SimilarityEvidence` model. | Define a mock `CandidatePaper` fixture. Pass mock paper as first argument. Update assertions to target `result.providerId`, `result.breakdown` and `result.matchingPassages`. |
| `src/services/evidence/EvidencePackageBuilder.test.ts` | Category C / D | Imports obsolete `SimilarityResult` export. Fixtures use legacy `CorePaper` and `SimilarityResult` structures. | Change import to `SimilarityEvidence` and `CandidatePaper`. Update test fixtures to use the new models. |
