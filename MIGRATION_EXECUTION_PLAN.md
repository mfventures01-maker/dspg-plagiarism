# MIGRATION_EXECUTION_PLAN.md

This document defines the optimal, dependency-driven repair sequence to align all legacy contracts and tests with the `CandidatePaper` and `SimilarityEvidence` SSOT architecture.

---

## Remediation Steps Sequence

### Step 1: Align `EvidencePackageBuilder` Code Contracts
- **Target File**: `src/services/evidence/EvidencePackageBuilder.ts`
- **Actions**:
  - Replace references to `CorePaper` with `CandidatePaper`.
  - Replace `SimilarityResult` with `SimilarityEvidence`.
  - Replace `MatchingChunk` with `MatchingPassage`.
  - Update internal property mappings (`breakdown` and `matchingPassages`).

### Step 2: Remediate CLI Test Utility
- **Target File**: `scripts/test-evidence-engine.ts`
- **Actions**:
  - Update `simEngine.computeSimilarity` call to pass the `paper` object instead of `paper.coreId`.
  - Update log output references from `similarity.metrics` to `similarity.breakdown` and `similarity.matchingChunks` to `similarity.matchingPassages`.

### Step 3: Remediate Candidate Chunker Tests
- **Target File**: `src/services/evidence/CandidateChunker.test.ts`
- **Actions**:
  - Replace `CorePaper` imports and types with `CandidatePaper`.
  - Add missing mock fields to test paper fixtures (provider, providerId, keywords, subjects, language, fullTextAvailable, repository).

### Step 4: Remediate Similarity Engine Tests
- **Target File**: `src/services/evidence/SimilarityEngine.test.ts`
- **Actions**:
  - Update test cases to pass a mock `CandidatePaper` object as the first parameter.
  - Fix assertions to check `result.providerId`, `result.breakdown` and `result.matchingPassages`.

### Step 5: Remediate Evidence Package Builder Tests
- **Target File**: `src/services/evidence/EvidencePackageBuilder.test.ts`
- **Actions**:
  - Update imports of `SimilarityResult` to `SimilarityEvidence` and `CorePaper` to `CandidatePaper`.
  - Align mock objects to correspond to the updated parameters.

---

## Verification Checkpoints

1. Run `npx tsc --noEmit` to verify compiler errors are completely eliminated.
2. Run `npx playwright test` to execute all runtime verification test suites successfully.
