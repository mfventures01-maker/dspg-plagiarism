# DSPG Engine Single Source of Truth (SSOT)

> [!NOTE]
> **House of Oroh Engineering Operating System (HOEOS) / BOOT.md was not located in this repository.** This audit has been performed using standard architectural engineering practices to establish a definitive Source of Truth for the DSPG Plagiarism Checker Engine.

---

## 1. Repository Structure & Directory Inventory

### Root Directory File Inventory
*   [server.ts](file:///c:/Projects/dspg/server.ts): Express server core. Handles text/document processing, file uploads via `multer`, integrates with the Gemini API (new `@google/genai` SDK), and serves as the local fallback simulation engine. Also manages Vite development server middleware / static asset serving in production.
*   [package.json](file:///c:/Projects/dspg/package.json): Defines Node dependencies, scripts (`dev`, `build`, `start`), and build metadata.
*   [tsconfig.json](file:///c:/Projects/dspg/tsconfig.json): TypeScript compilation parameters for the client application.
*   [vite.config.ts](file:///c:/Projects/dspg/vite.config.ts): Configuration for Vite bundler, mounting API proxies and handling path mapping.
*   [index.html](file:///c:/Projects/dspg/index.html): HTML shell for the single page application.

### Source Directory (`/src`) Directory Inventory
*   [src/App.tsx](file:///c:/Projects/dspg/src/App.tsx): Root layout wrapper housing the main plagiarism checker interface.
*   [src/main.tsx](file:///c:/Projects/dspg/src/main.tsx): Entry point bootstrap file loading React and mounting it to the DOM.
*   [src/index.css](file:///c:/Projects/dspg/src/index.css): Main stylesheet configuration loading global styling utilities.
*   [src/styles/globals.css](file:///c:/Projects/dspg/src/styles/globals.css): Global theme configurations and additional variables.

### Components (`/src/components`)
*   [src/components/PlagiarismChecker.tsx](file:///c:/Projects/dspg/src/components/PlagiarismChecker.tsx): Core container view coordinating metadata input, file uploads/drag zones, result rendering, signature signing blocks, and report compilers.

#### Subdirectory: UIComponents
*   [src/components/UIComponents/Button.tsx](file:///c:/Projects/dspg/src/components/UIComponents/Button.tsx): Unified, reusable button component supporting customizable styles (primary, gold, outline, danger) and loading states.
*   [src/components/UIComponents/Card.tsx](file:///c:/Projects/dspg/src/components/UIComponents/Card.tsx): Standardized content containment panels for visual structure.
*   [src/components/UIComponents/FileUploadZone.tsx](file:///c:/Projects/dspg/src/components/UIComponents/FileUploadZone.tsx): Interactive drag-and-drop document upload box supporting `.txt`, `.docx`, and `.pdf` files.
*   [src/components/UIComponents/ProgressRing.tsx](file:///c:/Projects/dspg/src/components/UIComponents/ProgressRing.tsx): Circular SVG progress dials visualizing originality percentage metrics and AI probabilities.
*   [src/components/UIComponents/SignatureBlock.tsx](file:///c:/Projects/dspg/src/components/UIComponents/SignatureBlock.tsx): Advanced signature management panel enabling drawn, typed, or uploaded signature specimens with secure local cryptographic timestamps.

#### Subdirectory: Report
*   [src/components/Report/PDFReport.tsx](file:///c:/Projects/dspg/src/components/Report/PDFReport.tsx): Interactive client-side HTML/CSS visual preview panel replicating the official 4-page PDF document layout.
*   [src/components/Report/ReportHeader.tsx](file:///c:/Projects/dspg/src/components/Report/ReportHeader.tsx): institutional header layout for the visual report preview.
*   [src/components/Report/ReportFooter.tsx](file:///c:/Projects/dspg/src/components/Report/ReportFooter.tsx): institutional footer layout for the visual report preview.

### Services (`/src/services`)
*   [src/services/geminiService.ts](file:///c:/Projects/dspg/src/services/geminiService.ts): API client executing calls to the Express server endpoint `/api/analyze` to process texts and documents.
*   [src/services/reportGenerator.ts](file:///c:/Projects/dspg/src/services/reportGenerator.ts): Adapter converting client-side state models to a downloadable PDF Blob representation.
*   [src/services/pdfService.ts](file:///c:/Projects/dspg/src/services/pdfService.ts): Core generation logic utilizing `jsPDF` to compile a professional, multi-page document featuring vector-drawn school seals, cover pages, and signature specimens.

### Hooks (`/src/hooks`)
*   [src/hooks/useFileUpload.ts](file:///c:/Projects/dspg/src/hooks/useFileUpload.ts): Handles drag-and-drop file ingestion, file size limits, name caching, and clearing files.
*   [src/hooks/usePlagiarismCheck.ts](file:///c:/Projects/dspg/src/hooks/usePlagiarismCheck.ts): Orchestrates state machines for scanning (idle, scanning, complete, error), result generation, and compilation of PDF credentials.

### Utilities & Types (`/src/utils`, `/src/types`)
*   [src/types/index.ts](file:///c:/Projects/dspg/src/types/index.ts): Holds TS interfaces for `SourceMatch`, `AnalysisResult`, `AnalysisState`, and `CommitteeData`.
*   [src/utils/textProcessor.ts](file:///c:/Projects/dspg/src/utils/textProcessor.ts): Pure utility logic for word counts, cleaning whitespaces, and threshold checks.
*   [src/utils/formatters.ts](file:///c:/Projects/dspg/src/utils/formatters.ts): Localized date formats (`en-NG`), text capitalization, and file size translations.

---

## 2. Component & Hook Mapping

### Component Catalog

| Component | Purpose | Props | Key Dependencies | Interactions |
|---|---|---|---|---|
| `PlagiarismChecker` | Orchestrates the entire user interface. | None | `usePlagiarismCheck`, `useFileUpload`, `Card`, `Button`, `SignatureBlock`, `ProgressRing`, `FileUploadZone`, `PDFReport` | Receives files/text inputs, invokes hooks, binds input to signatory models. |
| `SignatureBlock` | Manages project approval credentials for committee members. | `roleTitle`, `signatoryName`, `onNameChange`, `signatureData`, `onSignatureChange`, `signType`, `dateValue`, `onDateChange`, `isValidated`, `onValidate` | HTML5 Canvas API, Lucide React Icons | Provides drawn signature tracking, text-to-image signature synthesis, or file uploads. Binds validation to local ISO timestamps. |
| `PDFReport` | Visualizes the live 4-page report template. | `analysis` (`AnalysisState`), `committee` (`CommitteeData`), `chairmanValidated`, `secretaryValidated` | `ReportHeader`, `ReportFooter` | Live rendering of inputs and signature updates in real-time. |
| `FileUploadZone` | Handles drag-and-drop files. | `selectedFileName`, `onFileSelect`, `onClear` | Lucide React | Listens to dragover/drop browser events. |
| `ProgressRing` | Renders a color-coded percentage ring. | `percentage`, `label`, `type` ('originality' \| 'ai') | SVG ViewBox | Computes stroke dash-offsets relative to status compliance thresholds. |

### React Hook Map

#### `useFileUpload`
*   **State managed:** `file` (`File | null`), `fileName` (`string | null`), `fileSize` (`number`), `error` (`string | null`).
*   **Methods returned:** `handleSelectFile(File)`, `clearFile()`, `setError(string)`.
*   **Lifecycle:** Fully passive hook initialized on component mount, resetting status only upon manual clear trigger.

#### `usePlagiarismCheck`
*   **State managed:** `status` (`'idle' | 'scanning' | 'complete' | 'error'`), `text` (`string`), `fileName` (`string | null`), `result` (`AnalysisResult | null`), `reportGenerated` (`boolean`), `reportUrl` (`string | null`), `error` (`string`).
*   **Methods returned:** `runCheck(text, file)`, `compilePDFReport(committeeData)`, `resetState()`.
*   **Lifecycle:** Monitors background operations; maintains reference pointers to local URL Object URLs (compiled via `URL.createObjectURL`) that must be garbage-collected upon resetting.

---

## 3. Services & Utility Details

### Service Configurations

#### `geminiService.ts`
Provides wrapper to query server-side parser. Packages inputs (plain text and/or file) into a `multipart/form-data` payload and POSTs it to `/api/analyze`.

#### `pdfService.ts`
Constructs a 4-page academic audit document using `jsPDF`.
*   **Page 1 (Cover Sheet):** Draws institution header and a complex procedurally generated vector school crest (centered shield, gold/red torch flame, circular blue boundary). Renders student/project metadata card.
*   **Page 2 (Document Overview):** Visualizes the analysis metrics. Renders color-coded horizontal bar graphs and a large circular originality score dial.
*   **Page 3 (Detailed Analysis):** Populates a detailed data table list of plagiarism sources with automatic column wrapping, custom row highlights, and severity badges (`CRITICAL` vs `WARNING`).
*   **Page 4 (Signature Panel):** Displays endorsement declarations, mounts base64 signature images, signs off with secure verification stamps, and renders a vector "OFFICIAL STAMP" seal.

#### `reportGenerator.ts`
Converts `jsPDF` blob data generated by `pdfService.ts` into a client-accessible URL resource utilizing `URL.createObjectURL(blob)`.

### Utility Responsibilities

*   `textProcessor.ts`:
    *   `countWords`: Splices text by whitespace tokenization `/\s+/` to estimate document length.
    *   `cleanText`: Trims and strips duplicate line-breaks/carriage returns.
    *   `checkComplianceStatus`: Validates if originality meets or exceeds the required 80% threshold.
*   `formatters.ts`:
    *   `formatDateNG`: Formats output to `en-NG` rules (e.g. "14 July 2026").
    *   `capitalizeWords`: Standardizes capitalization across student/faculty names.
    *   `formatBytesToMB`: Translates raw upload sizes to readable Megabyte strings.
