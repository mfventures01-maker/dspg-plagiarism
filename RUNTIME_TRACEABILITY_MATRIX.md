# Runtime Traceability Matrix

This matrix maps every stage of the DSPG plagiarism audit process to guarantee strict evidence traceability from student text to final PDF/HTML rendering.

| Phase | Component | Input | Action | Outputs / Artifacts | Traceability Proof |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **P1** | Normalization | Student Document | Text extraction, sentence segmentation, normalization, SHA-256 generation | `NormalizedDocument` | Fingerprint printed on Cover Sheet & PDF page 1 |
| **P2** | Search Query Builder | Normalized Text | Query construction using academic terms | Search Query String | Sent directly to Research Federation |
| **P3** | Research Federation | Search Query | Concurrently queries CORE and OpenAlex, enforces 3500ms abort timeout | Unified candidate corpus | Logged in backend stdout & `ACADEMIC RETRIEVAL EVIDENCE` grid |
| **P4** | Candidate Merge Engine | Mapped candidates | Enforces 4-tier deduplication (DOI -> ID -> Title -> Authors) | Deduplicated candidates pool | `duplicate` metrics rendered in UI & PDF |
| **P5** | Similarity Engine | Student & Candidate chunks | Computes exact match, n-gram, Jaccard, and Cosine similarity | `SimilarityResult` (overall & chunk scores) | Heatmap blocks colored directly from chunk scores |
| **P6** | Verdict Policy Engine | Deduplicated matches | Applies mathematical verdict thresholds (overallSimilarity >= 70% and matchedSources >= 2 -> Reject) | Recommendation & risk level | Immutable recommendation rendered in UI & PDF |
| **P7** | Gemini Explanation | Factual evidence package | Natural language discussion explaining why matching occurred | Natural language `reasoning` | Discussion box visible in report Section 10 |
| **P8** | React UI / PDF | Evidence package | Displays verified metrics without fabricating placeholders | Final Report / PDF | Renders `riskScore`, `academicIntegrityScore`, and `recommendation` |
