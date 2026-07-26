# SIMILARITY_ENGINE_CALL_MATRIX.md

This matrix documents every reference and invocation of `computeSimilarity(...)` within the repository, highlighting contract misalignments between the legacy signature and the new `CandidatePaper`-based signature.

## Reference Signature Definitions

- **Legacy Signature**:
  ```typescript
  computeSimilarity(candidateId: number, studentChunks: DocumentChunk[], candidateChunks: CandidateChunk[]): SimilarityResult
  ```
- **New Signature**:
  ```typescript
  computeSimilarity(paper: CandidatePaper, studentChunks: DocumentChunk[], candidateChunks: CandidateChunk[]): SimilarityEvidence
  ```

---

## Call Matrix

| File | Line | Old Signature Call | Expected New Signature Call | Caller | Status | Runtime Impact |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| [server.ts](file:///c:/Projects/dspg/server.ts) | 522 | `computeSimilarity(papers[0], studentChunks, candChunks)` | `computeSimilarity(paper: CandidatePaper, ...)` | POST `/api/analyze` controller | Aligned | None (Already migrated in production code path) |
| [test-evidence-engine.ts](file:///c:/Projects/dspg/scripts/test-evidence-engine.ts) | 53 | `computeSimilarity(paper.coreId, studentChunks, candidateChunks)` | `computeSimilarity(paper, studentChunks, candidateChunks)` | Command-line validation pipeline | Needs Migration | Prevents execution of the validation CLI script |
| [SimilarityEngine.test.ts](file:///c:/Projects/dspg/src/services/evidence/SimilarityEngine.test.ts) | 35 | `computeSimilarity(1, sChunks, cChunks)` | `computeSimilarity(mockPaper, sChunks, cChunks)` | Unit Test: Identical chunks yield high similarity | Needs Migration | Blocks compilation of unit tests |
| [SimilarityEngine.test.ts](file:///c:/Projects/dspg/src/services/evidence/SimilarityEngine.test.ts) | 46 | `computeSimilarity(2, [], [])` | `computeSimilarity(mockPaper, [], [])` | Unit Test: Empty chunks yield zero similarity | Needs Migration | Blocks compilation of unit tests |
