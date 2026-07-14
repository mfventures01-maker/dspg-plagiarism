# DSPG Plagiarism Engine Capability Matrix

This document maps the status, availability, limits, and technical implementations of all primary plagiarism scanning, report formatting, and authorization systems.

---

## 1. Engine Capability Index

| Capability | Status | Implementation Mechanism | Notes & Limitations |
| :--- | :--- | :--- | :--- |
| **Plain Text Ingestion** | **Operational** | Managed directly via React state to `textarea`. | Supported up to 10MB text payloads. |
| **TXT File Ingestion** | **Operational** | Handled by file buffer parsing `buffer.toString('utf-8')`. | File bounds enforced via in-memory `multer` limitations. |
| **DOCX File Parsing** | **Operational** | Processed via `mammoth.extractRawText` on the server. | Extracts raw unformatted strings. Ignores embedded images/drawings. |
| **PDF Text Extraction** | **Operational** | Parsed on backend using the custom `PDFParse` module. | May struggle with scanned image PDFs lacking active OCR layers. |
| **Plagiarism Scan (Cloud)** | **Operational** | Remote calls utilizing Google's `@google/genai` library. | Requires a valid `GEMINI_API_KEY` configuration. Non-deterministic. |
| **Plagiarism Scan (Local)** | **Operational** | Stable hash algorithm `generateSimulatedResult(text, ...)`. | Instantly triggered if API fails or if key is not configured. |
| **AI Writing Profiler** | **Operational** | Analyzes syntactic burstiness, vocabulary variation via Gemini. | Included in the structured output response schema. |
| **Originality Threshold Checking** | **Operational** | Hardcoded logic evaluating scores against the 80% mark. | Visual status highlights color-code green (safe) vs red (violates). |
| **Drawn Signature Bindings** | **Operational** | Recorded via HTML5 Canvas drawing listeners. | Saves drawn lines as transparent PNG base64 strings. |
| **Typed Signature Synthesis** | **Operational** | Dynamic off-screen Canvas text-rendering engine. | Supports 3 fonts: Cursive (default), Elegant Serif, and Impact. |
| **Signature Uploading** | **Operational** | Base64 translation using the browser's `FileReader` API. | Reads image formats directly from client filesystem. |
| **Timestamp Security** | **Operational** | Cryptographic local timestamp generator. | Binds current date and time to signature specimens on validation. |
| **PDF Generation (Vector)** | **Operational** | Dynamic multi-page PDF generation via `jsPDF`. | Features vector institution crests and layout borders. |
| **Institutional Seals** | **Operational** | Procedural vector rendering inside `pdfService.ts`. | Generates official blue/gold committee circular stamp. |
| **Live Preview Simulator** | **Operational** | High-fidelity CSS/React preview panel (`PDFReport.tsx`). | Replicates 4-page PDF layout and updates in real-time. |

---

## 2. Missing Core Academic Engine Components

The following features are currently **absent** from the codebase but represent critical pillars of a world-class, enterprise-grade plagiarism detection system:

1. **Active Online Index Database (Active Web Search / Web Crawler):**
   * *Status:* **Absent**
   * *Required Capability:* Direct real-time scanning against active indexes (such as Google Search, Bing, or academic paper databases) instead of relying solely on the LLM's pre-trained knowledge base.
2. **Academic Repository Cross-Referencing (Crossref / Turnitin API integrations):**
   * *Status:* **Absent**
   * *Required Capability:* Deep integration with publishing vaults (CrossRef, JSTOR, IEEE Xplore, arXiv) to verify document overlap metrics directly.
3. **Internal Institutional Archive Storage (Student Work Cross-Matching):**
   * *Status:* **Absent**
   * *Required Capability:* Storing student submissions in a local database to verify if a student is copying work from a previous classmate's project at the polytechnic.
4. **Optical Character Recognition (OCR) Layer:**
   * *Status:* **Absent**
   * *Required Capability:* Processing scanned image documents or PDF drafts containing diagram screenshots that students use to bypass copy-paste detection.
5. **Exact Overlap Text Highlighting (Diff Highlighting):**
   * *Status:* **Absent**
   * *Required Capability:* Visual color-coding highlighting of sentences in the thesis text showing where they match flagged external sources.
6. **Detailed AI Model Pattern Explanations:**
   * *Status:* **Absent**
   * *Required Capability:* Statistical breakdowns showing the specific sections that triggered AI detection (e.g. word perplexity charts).
7. **Signatory Verification Infrastructure:**
   * *Status:* **Absent**
   * *Required Capability:* Renders a verification QR code or a cryptographically signed SHA-256 hash printed at the bottom of the PDF to allow external employers to verify the report's authenticity.
