# EVIDENCE_PACKAGE_ALIGNMENT.md

This document details the audit of `EvidencePackageBuilder` to verify alignment with the new `SimilarityEvidence` model, confidence measures, and matching passages.

---

## Model Alignment Matrix

### 1. Structural Comparison

| Legacy Structure (`SimilarityResult`) | New Structure (`SimilarityEvidence`) | Impact on Package Builder | Alignment Action Required |
| :--- | :--- | :--- | :--- |
| `candidateId: number` | `provider: string`, `providerId: string` | Legacy package builder expects numeric ID. | Update builder to reference `providerId` or store both provider fields. |
| `metrics` (exactMatch, ngram, jaccard, cosine) | `breakdown` (textSimilarity, semanticSimilarity, bibliographicOverlap, citationMatch) | Metrics mismatch. | Update package builder structure to read from `breakdown`. |
| `matchingChunks: MatchingChunk[]` | `matchingPassages: MatchingPassage[]` | Array naming mismatch. | Map `matchingPassages` instead of `matchingFragments`/`matchingChunks`. |
| `overallSimilarity: number` | `overallSimilarity: number` | Direct compatibility. | None. |
| (Not Present) | `confidence: 'High' \| 'Medium' \| 'Low'` | Missing confidence tracking. | Incorporate `confidence` and `confidenceScore` in the returned package. |

---

## Recommended `EvidencePackage` Schema Update

```typescript
export interface EvidencePackage {
  studentDocument: {
    title?: string;
    wordCount: number;
    chunkCount: number;
  };
  candidatePaper: CandidatePaper;
  similarity: SimilarityEvidence;
  matchingFragments: MatchingPassage[];
  metrics: {
    textSimilarity: number;
    semanticSimilarity: number;
    bibliographicOverlap: number;
    citationMatch: number;
  };
  confidence: {
    level: 'High' | 'Medium' | 'Low';
    score: number;
  };
  generatedAt: string;
}
```

---

## Dependency Checklist

- [ ] Modify `src/services/evidence/EvidencePackageBuilder.ts` to import `CandidatePaper`, `SimilarityEvidence`, `MatchingPassage` from types folder instead of `CoreTypes` and `SimilarityEngine`.
- [ ] Refactor the `build` method signature:
  ```typescript
  public build(
    documentText: string,
    documentTitle: string | undefined,
    chunkCount: number,
    candidatePaper: CandidatePaper,
    similarityResult: SimilarityEvidence
  ): EvidencePackage
  ```
- [ ] Map internal attributes:
  - `metrics` -> `similarityResult.breakdown`
  - `matchingFragments` -> `similarityResult.matchingPassages`
- [ ] Update `src/services/evidence/EvidencePackageBuilder.test.ts` to match the updated contract.
