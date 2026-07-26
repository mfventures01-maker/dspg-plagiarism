# TSC_ERROR_CORRELATION.md

This document correlates each active TypeScript compiler error to its corresponding architectural change and required code fix.

---

## TypeScript Error Correlation

| TSC Error Code & Message | File & Line | Root Cause | Required Architectural Code Fix | Runtime Impact Severity |
| :--- | :--- | :--- | :--- | :--- |
| `TS2345: Argument of type 'number' is not assignable to parameter of type 'CandidatePaper'.` | `test-evidence-engine.ts` Line 53 | Signature change in `computeSimilarity(...)` to accept a full `CandidatePaper` instead of an ID. | Update the first argument from `paper.coreId` to `paper`. | High (Blocks validation script) |
| `TS2339: Property 'metrics' does not exist on type 'SimilarityEvidence'.` | `test-evidence-engine.ts` Line 55 | `metrics` field renamed to `breakdown` in `SimilarityEvidence` schema. | Change `similarity.metrics` to `similarity.breakdown`. | High (Blocks validation script) |
| `TS2339: Property 'matchingChunks' does not exist on type 'SimilarityEvidence'.` | `test-evidence-engine.ts` Line 56 | `matchingChunks` renamed to `matchingPassages` in `SimilarityEvidence` schema. | Change `similarity.matchingChunks` to `similarity.matchingPassages` (or `similarity.matchingPassages` mapping). | High (Blocks validation script) |
| `TS2345: Argument of type 'CandidatePaper' is not assignable to parameter of type 'CorePaper'.` | `test-evidence-engine.ts` Line 59 | Package builder still expects legacy `CorePaper` instead of `CandidatePaper` model. | Refactor `EvidencePackageBuilder` to accept `CandidatePaper`. | High (Blocks validation script) |
| `TS2345: Argument of type 'CorePaper' is not assignable to parameter of type 'CandidatePaper'.` | `CandidateChunker.test.ts` Lines 37, 43, 54 | Unit tests pass legacy `CorePaper` to chunker which expects `CandidatePaper`. | Refactor test fixtures to instantiate `CandidatePaper`. | Medium (Blocks test compile) |
| `TS2305: Module '"./SimilarityEngine"' has no exported member 'SimilarityResult'.` | `EvidencePackageBuilder.test.ts` Line 9, `EvidencePackageBuilder.ts` Line 7 | Legacy `SimilarityResult` was removed from the engine export. | Change import to `SimilarityEvidence` from types module. | High (Blocks build) |
| `TS2305: Module '"./SimilarityEngine"' has no exported member 'MatchingChunk'.` | `EvidencePackageBuilder.ts` Line 7 | Legacy `MatchingChunk` was removed from the engine export. | Change import to `MatchingPassage` from types module. | High (Blocks build) |
| `TS2339: Property 'candidateId' does not exist on type 'SimilarityEvidence'.` | `SimilarityEngine.test.ts` Line 37 | Removed legacy identifier property on new model. | Assert `result.providerId` instead. | Medium (Blocks test compile) |
