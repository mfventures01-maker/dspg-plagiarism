# BREAKING_CHANGES_REGISTER.md

This register tracks all intentional, certified API changes and contract migrations introduced during the upgrade to the Evidence-First Glass Box Architecture.

---

## Breaking Changes Register

| Legacy API / Contract | Target API / Contract | Reason | Affected Files | Migration Status |
| :--- | :--- | :--- | :--- | :--- |
| `computeSimilarity(candidateId: number, ...)` | `computeSimilarity(paper: CandidatePaper, ...)` | Elevate `SimilarityEngine` to consume a rich CandidatePaper instead of a primitive database identifier, allowing contextual meta similarity assessment. | [SimilarityEngine.ts](file:///c:/Projects/dspg/src/services/evidence/SimilarityEngine.ts), [SimilarityEngine.test.ts](file:///c:/Projects/dspg/src/services/evidence/SimilarityEngine.test.ts), [server.ts](file:///c:/Projects/dspg/server.ts), [test-evidence-engine.ts](file:///c:/Projects/dspg/scripts/test-evidence-engine.ts) | Partially Migrated (Tests and scripts pending) |
| `SimilarityResult` interface | `SimilarityEvidence` interface | Align metrics with the Academic Evidence Graph taxonomy (replacing plain scores with multi-dimensional evidence attributes). | [SimilarityEngine.ts](file:///c:/Projects/dspg/src/services/evidence/SimilarityEngine.ts), [EvidencePackageBuilder.ts](file:///c:/Projects/dspg/src/services/evidence/EvidencePackageBuilder.ts), [pdfService.ts](file:///c:/Projects/dspg/src/services/pdfService.ts), [PDFReport.tsx](file:///c:/Projects/dspg/src/components/Report/PDFReport.tsx) | Partially Migrated (Tests and builders pending) |
| `MatchingChunk` interface | `MatchingPassage` interface | Elevate matches to store structured student text and source text snippets instead of primitive character offsets. | [SimilarityEngine.ts](file:///c:/Projects/dspg/src/services/evidence/SimilarityEngine.ts), [EvidencePackageBuilder.ts](file:///c:/Projects/dspg/src/services/evidence/EvidencePackageBuilder.ts), [pdfService.ts](file:///c:/Projects/dspg/src/services/pdfService.ts) | Partially Migrated (Tests and builders pending) |
| `CorePaper` model in Federation | `CandidatePaper` model | Standardize unified metadata schema (CORE + OpenAlex integration mapping). | [CandidatePaperProvider.ts](file:///c:/Projects/dspg/src/services/evidence/CandidatePaperProvider.ts), [CandidateMergeEngine.ts](file:///c:/Projects/dspg/src/services/evidence/CandidateMergeEngine.ts) | Migrated |
