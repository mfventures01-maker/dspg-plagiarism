# RUNTIME_CONTRACT_MATRIX.md

This matrix documents the runtime interface contracts between the components of the DSPG Plagiarism Check pipeline.

---

## Pipeline Runtime Contracts

### 1. Research Federation Layer
- **Input**:
  - `documentText`: `string` (Non-nullable)
- **Output**:
  - `papers`: `CandidatePaper[]` (Non-nullable, returns empty array if no matches found)
- **Type**: `ICandidatePaperProvider` async query
- **Version**: `v2.0`
- **Nullability / Fallback**: If both CORE and OpenAlex search queries fail, the pipeline returns a clean HTTP 400 error (`NO_ACADEMIC_EVIDENCE_AVAILABLE`).

### 2. Academic Evidence Graph Container
- **Input**:
  - `papers`: `CandidatePaper[]` (Non-nullable)
- **Output**:
  - `evidenceGraph`: `AcademicEvidenceGraph` instance containing deduplicated candidates.
- **Type**: In-memory Object Repository
- **Version**: `v2.0`
- **Nullability**: Never null. Internally handles sorting, ranking, and deduplication metrics.

### 3. Similarity Engine
- **Input**:
  - `paper`: `CandidatePaper` (Non-nullable)
  - `studentChunks`: `DocumentChunk[]` (Non-nullable)
  - `candidateChunks`: `CandidateChunk[]` (Non-nullable)
- **Output**:
  - `similarityResult`: `SimilarityEvidence` (Non-nullable)
- **Type**: Multi-dimensional mathematical analyzer
- **Version**: `v2.1`
- **Nullability / Fallback**: Returns zeroed `SimilarityEvidence` structure if either chunk list is empty.

### 4. Confidence Engine
- **Input**:
  - `coreStatus`: `string` (Non-nullable)
  - `papers`: `CandidatePaper[]` (Non-nullable)
  - `similarityResult`: `SimilarityEvidence` (Non-nullable)
- **Output**:
  - `confidence`: `{ coreConfidence: number, geminiConfidence: number, overallConfidence: number }` (Non-nullable)
- **Type**: Deterministic mathematical heuristic weighted model
- **Version**: `v2.0`
- **Nullability**: Never null.

### 5. Gemini Explanation Layer
- **Input**:
  - Prompt containing student text, normalized metadata, deterministic similarity indices, and matching passages.
- **Output**:
  - JSON payload matching: `{ aiGenerationRisk: 'HIGH' | 'MODERATE' | 'LOW', reasoning: string[] }`
- **Type**: Generative AI Gateway request
- **Version**: `gemini-2.5-flash`
- **Nullability / Fallback**: Default to `aiGenerationRisk = 'LOW'` and fallback reasoning descriptions if the provider fails.
