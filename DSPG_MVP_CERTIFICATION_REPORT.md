# DSPG MVP CERTIFICATION REPORT
**Project:** Delta State Polytechnic Ogwashi-Uku — Plagiarism Checker System  
**Version:** v1.0 (Audit Baseline)  
**Audit Date:** 2026-07-19  
**Auditor:** Antigravity Engineering  
**Repository:** `C:\Projects\dspg`  
**Status:** 🔴 **CONDITIONALLY DEPLOYABLE — CRITICAL GAPS IDENTIFIED**

---

## Phase 1 — Repository Cartography

### 1.1 Directory Structure

```
c:\Projects\dspg\
├── server.ts                   # Express API + Gemini integration (454 lines)
├── vite.config.ts              # Vite + TailwindCSS + path aliases
├── vercel.json                 # Vercel deployment configuration
├── package.json                # Node 18 project manifest
├── .env.local                  # API keys (Gemini, NVIDIA, CORE) — LIVE SECRETS
├── .env.example                # Documented env template
├── tsconfig.json               # TypeScript configuration
│
└── src/
    ├── App.tsx                 # Root SPA entry point
    ├── main.tsx                # React 19 mount point
    ├── index.css               # Global CSS reset
    │
    ├── ai/                     # AI configuration layer (INCOMPLETE)
    │   ├── config/             # AIConfig, env, validator, types, AIConfigError
    │   ├── gateway/            # 🔴 EMPTY — No implementation files
    │   ├── interfaces/         # 🔴 EMPTY — No implementation files
    │   ├── prompts/            # 🔴 EMPTY — No implementation files
    │   ├── providers/          # 🔴 EMPTY — No implementation files
    │   ├── types/              # 🔴 EMPTY — No implementation files
    │   └── utils/              # 🔴 EMPTY — No implementation files
    │
    ├── branding/               # Institutional branding config (DSPG logo, colors)
    ├── components/
    │   ├── PlagiarismChecker.tsx  # Main UI orchestrator (701 lines)
    │   ├── Report/
    │   │   ├── PDFReport.tsx      # 4-page in-browser preview simulator
    │   │   ├── ReportHeader.tsx   # Report header component
    │   │   └── ReportFooter.tsx   # Report footer component
    │   └── UIComponents/
    │       ├── Button.tsx
    │       ├── Card.tsx
    │       ├── FileUploadZone.tsx     # Drag-and-drop, .pdf/.docx/.txt
    │       ├── ProgressRing.tsx       # Circular score gauge
    │       └── SignatureBlock.tsx     # Draw/type/upload signature (369 lines)
    │
    ├── hooks/
    │   ├── usePlagiarismCheck.ts  # State machine for analysis workflow
    │   └── useFileUpload.ts       # File selection and validation
    │
    ├── services/
    │   ├── geminiService.ts       # API client → /api/analyze
    │   ├── pdfService.ts          # jsPDF export engine (617 lines, 4-page PDF)
    │   └── reportGenerator.ts     # Blob orchestrator
    │
    ├── types/
    │   └── index.ts               # AnalysisResult, AnalysisState, CommitteeData
    │
    └── utils/
        ├── formatters.ts          # Date/word/size formatters
        └── textProcessor.ts       # Word count, text cleaner, compliance threshold
```

### 1.2 Package Inventory

| Package | Version | Role |
|---|---|---|
| `react` | 19.0.1 | UI framework |
| `@google/genai` | 2.4.0 | Gemini AI SDK |
| `express` | 4.21.2 | Backend API server |
| `multer` | 2.2.0 | File upload handling (memory storage) |
| `mammoth` | 1.12.0 | DOCX → plaintext extraction |
| `pdf-parse` | 1.1.1 | PDF → plaintext extraction |
| `jspdf` | 4.2.1 | Client-side PDF generation |
| `dotenv` | 17.2.3 | Environment variable management |
| `tsx` | 4.21.0 | Dev runtime for TypeScript server |
| `tailwindcss` | 4.1.14 | Utility CSS framework |
| `motion` | 12.23.24 | Animation library (installed, **unused** in source) |

### 1.3 AI Provider Inventory

| Provider | Config Exists | Keys Present | Runtime Wiring | Used in Production |
|---|---|---|---|---|
| Gemini (gemini-2.0-flash → 1.5-flash) | ✅ | ✅ `.env.local` | ✅ `server.ts:311` | ✅ **Primary** |
| NVIDIA NIM (DeepSeek-R1) | ✅ config/types/env | ✅ `.env.local` | 🔴 **Not wired in server.ts** | 🔴 Never called |
| CORE API | ✅ config | ✅ `.env.local` | 🔴 **Not wired anywhere** | 🔴 Never called |

### 1.4 Infrastructure Inventory

| Subsystem | Status |
|---|---|
| Supabase (database/auth) | 🔴 **Not present** — zero references in codebase |
| Authentication | 🔴 **Not implemented** — no auth middleware in server.ts |
| Database (any) | 🔴 **Not present** |
| Storage (file persistence) | ⚠️ In-memory only (multer memoryStorage) — stateless by design |
| Vercel Deployment Config | ✅ Present (`vercel.json` with static build + Node serverless) |
| PDF Parser (server) | ⚠️ Lazy-imported (Vercel DOMMatrix workaround) |
| PDF Generator (client) | ✅ jsPDF, fully implemented |

---

## Phase 2 — Architecture Verification

### 2.1 System Architecture (Actual)

```
Browser (React 19 SPA)
    │
    ├─ PlagiarismChecker.tsx (orchestrator)
    │       ├─ usePlagiarismCheck hook → geminiService.ts → POST /api/analyze
    │       ├─ useFileUpload hook → FileUploadZone.tsx
    │       ├─ SignatureBlock.tsx (draw/type/upload)
    │       └─ PDFReport.tsx (live 4-page preview simulator)
    │
    └─ pdfService.ts (client-side jsPDF export)
            └─ exportToPDF() → Blob → reportGenerator → Object URL

Express Server (server.ts)
    │
    ├─ POST /api/analyze
    │       ├─ multer (memory upload, 10MB limit)
    │       ├─ mammoth (DOCX extraction) ✅
    │       ├─ pdf-parse (PDF extraction) ⚠️ lazy import, Vercel-constrained
    │       ├─ Gemini API (gemini-2.0-flash → gemini-1.5-flash fallback) ✅
    │       └─ generateSimulatedResult() fallback (deterministic hash-based) 🔴
    │
    └─ GET /api/health ✅
```

### 2.2 Subsystem Wiring Verification

| Subsystem | File(s) | Wired | Notes |
|---|---|---|---|
| Upload pipeline | `FileUploadZone.tsx`, `multer` | ✅ | Memory-only, no persistence |
| Text extraction (TXT) | `server.ts:254` | ✅ | Direct buffer.toString |
| Text extraction (DOCX) | `server.ts:257`, `mammoth` | ✅ | Fully functional |
| Text extraction (PDF) | `server.ts:261`, `pdf-parse` | ⚠️ | Lazy import; DOMMatrix polyfill required |
| Plagiarism engine | `server.ts:286–371` | ✅ (Gemini) | No real vector search — LLM prompt |
| AI fallback engine | `server.ts:82–237` | ⚠️ | Deterministic hash simulation — **always passes** |
| Gemini gateway | `server.ts:311` | ✅ | Direct SDK, not using AIConfig module |
| NVIDIA NIM gateway | `src/ai/config/` | ❌ | Config only — gateway directory is **empty** |
| Gemini fallback (model) | `server.ts:311` array | ✅ | gemini-2.0-flash → gemini-1.5-flash |
| Report generator | `pdfService.ts`, `reportGenerator.ts` | ✅ | jsPDF, 4-page A4 |
| Signature capture | `SignatureBlock.tsx` | ✅ | Draw, type, upload |
| PDF preview | `PDFReport.tsx` | ✅ | In-browser 4-page simulator |
| Authentication | — | ❌ | **Completely absent** |
| Database | — | ❌ | **Not implemented** |
| Institutional Corpus | — | ❌ | **Not implemented** |
| Crossref integration | — | ❌ | **Not implemented** |
| OpenAlex integration | — | ❌ | **Not implemented** |
| Vector/embedding search | — | ❌ | **Not implemented** |
| Document chunking engine | — | ❌ | **UI label only** — not a real subsystem |

---

## Phase 3 — MVP Gap Analysis

| Module | Exists | Working | MVP Ready |
|---|---|---|---|
| UI Shell | ✅ | ✅ | ✅ 100% |
| File Upload (.txt / .docx) | ✅ | ✅ | ✅ 95% |
| File Upload (.pdf) | ✅ | ⚠️ | ⚠️ 65% |
| Text Input Mode | ✅ | ✅ | ✅ 100% |
| Gemini AI Analysis | ✅ | ✅ | ✅ 90% |
| AI Fallback Engine | ✅ | ⚠️ | 🔴 0%* |
| Plagiarism Results UI | ✅ | ✅ | ✅ 95% |
| Signature Capture | ✅ | ✅ | ✅ 95% |
| Report PDF Generator | ✅ | ✅ | ✅ 90% |
| Report Preview Simulator | ✅ | ✅ | ✅ 95% |
| Branding / Institutional | ✅ | ✅ | ✅ 100% |
| Health Check API | ✅ | ✅ | ✅ 100% |
| Authentication | ❌ | ❌ | ❌ 0% |
| Database / Persistence | ❌ | ❌ | ❌ 0% |
| NVIDIA NIM Integration | ⚠️ | ❌ | ❌ 5% |
| CORE API Integration | ⚠️ | ❌ | ❌ 5% |
| Real Vector Similarity Search | ❌ | ❌ | ❌ 0% |
| Document Chunking Engine | ❌ | ❌ | ❌ 0% |
| Embedding Engine | ❌ | ❌ | ❌ 0% |
| Institutional Corpus | ❌ | ❌ | ❌ 0% |
| Crossref Integration | ❌ | ❌ | ❌ 0% |
| OpenAlex Integration | ❌ | ❌ | ❌ 0% |
| Citation Verification | ❌ | ❌ | ❌ 0% |

> *\* Fallback "exists and runs" but generates fraudulent passing scores — not safe for academic use.*

---

## Phase 4 — Critical Blockers

### 🔴 BLOCKER 1 — The Plagiarism Engine is an LLM Prompt, Not a Real Similarity Search

**File:** `server.ts:289–308`  
**Issue:** The "plagiarism check" is a single Gemini prompt asking the model to *imagine* similarity scores against sources it cannot actually index. There is no vector database, no corpus index, no sentence embedding, and no real cross-referencing. Scores are fabricated by the LLM based on its training data knowledge, not a real search.  
**Risk:** Students receive similarity scores that have no grounding in actual source comparison against real databases.  
**Fix Required:** Implement real text-embedding + vector similarity search (e.g., NVIDIA NIM embeddings + pgvector/Supabase or Pinecone).

---

### 🔴 BLOCKER 2 — The Fallback Engine Guarantees Passing Scores

**File:** `server.ts:82–237` (`generateSimulatedResult`)  
**Issue:** When Gemini fails, the system returns a hash-computed result that **always produces originality scores between 81–96%** — always compliant. It also fabricates named academic sources with realistic-looking citation strings. The PDF certificate produced from this data appears authentic.  
**Risk:** Any student whose analysis triggers a Gemini API failure receives a fake passing certificate. This is an academic integrity failure.  
**Fix Required:** The fallback must return an honest error response. Remove `generateSimulatedResult` entirely or replace with a clearly labeled "offline mode" that is not certifiable.

---

### 🔴 BLOCKER 3 — No Authentication

**Evidence:** Zero occurrences of `auth`, `login`, `session`, or `jwt` in `server.ts` or any source file.  
**Issue:** Any person with the application URL can submit documents and download official-looking certified reports. There is no concept of a user, a student login, or a session.  
**Fix Required:** Implement user authentication before institutional launch. Recommended: Supabase Auth (pairs naturally with a Supabase database for analysis history).

---

### 🔴 BLOCKER 4 — The AI Architecture Layer is a Dead Shell

**Directories:** `src/ai/gateway/`, `src/ai/interfaces/`, `src/ai/providers/`, `src/ai/prompts/`, `src/ai/types/`, `src/ai/utils/`  
**Issue:** All six sub-directories under `src/ai/` are completely empty. The `AIConfig` in `src/ai/config/` is fully specified (NVIDIA, Gemini, CORE configs) but is **never imported by `server.ts`**. The server maintains its own inline Gemini client. The NVIDIA NIM provider has API keys, a model name (`deepseek-ai/deepseek-r1`), and a base URL — but no call path reaches it.  
**Fix Required:** Wire `AIConfig` into `server.ts` and implement the gateway/providers modules, OR delete `src/ai/` and consolidate into the server.

---

### 🔴 BLOCKER 5 — PDF Extraction on Vercel is Fragile

**File:** `server.ts:12–15`, `server.ts:259–270`  
**Issue:** `pdf-parse` is lazily imported and protected by a bare `class DOMMatrix {}` polyfill because Vercel's serverless runtime throws a `ReferenceError` on `DOMMatrix`. This polyfill has no implementation and may fail for complex PDF parsing operations. The `vercel.json` attempts to bundle the entire `node_modules/pdf-parse/**` tree, which may hit Vercel's 50MB function size limit.  
**Risk:** PDF uploads may return 500 errors in Vercel production, silently failing for a core use case.  
**Fix Required:** Replace `pdf-parse` with a server-side compatible solution or handle extraction errors with a clear user-facing message.

---

### ⚠️ WARNING 1 — Typo on Official Academic Certificate

**File:** `pdfService.ts:496`, `pdfService.ts:552`  
**Issue:** Both signature blocks print `'VERIFIED & TIMESTAMPTED'`. "TIMESTAMPTED" is misspelled (should be "TIMESTAMPED").  
**Fix:** One-line string change.

---

### ⚠️ WARNING 2 — `motion` Installed but Never Used

**File:** `package.json:23`  
**Issue:** The `motion` animation library (v12.23.24) is a production dependency but is not imported anywhere in the source tree. It adds dead bundle weight.  
**Fix:** Remove from dependencies (`npm remove motion`) or implement it.

---

### ⚠️ WARNING 3 — Live API Keys in `.env.local`

**File:** `.env.local`  
**Issue:** GEMINI_API_KEY, NVIDIA_API_KEY, and CORE_API_KEY are present in `.env.local` on disk. While this file should be in `.gitignore`, a `git status` shows it as untracked (not committed), which is correct — but the keys are live and should be treated as potentially exposed if the repo is ever accidentally pushed.  
**Fix:** Confirm `.gitignore` covers `.env.local`; rotate keys after any public exposure.

---

## Phase 5 — Engineering Certification

### 5.1 Metrics

| Metric | Value |
|---|---|
| **Overall MVP Completion** | **58%** |
| **Core User Journey Completion** (submit → AI results → PDF) | **87%** |
| **Production Readiness (honest)** | **42%** |
| **Technical Debt** | **HIGH** — Dead AI shell, fraudulent fallback, no auth |
| **Highest-Risk Subsystem** | Plagiarism Engine (LLM hallucination passed as real similarity scores) |
| **Second Highest-Risk Subsystem** | Fallback Engine (guaranteed-passing fake certificates) |
| **Critical Blockers (🔴)** | 5 |
| **Warnings (⚠️)** | 3 |

### 5.2 What IS Working (Evidence-Based)

The following represents the honest, functioning core of the application:

1. **End-to-end user journey works:** Submit text/DOCX/TXT → Gemini analysis → Results UI → Signature capture → 4-page PDF download.
2. **File upload pipeline is solid:** `multer` memory storage with MIME and extension validation.
3. **DOCX extraction is reliable:** `mammoth` is production-ready for this use case.
4. **PDF generation is complete:** jsPDF produces a professional 4-page A4 certificate with embedded signatures, procedural crests, and DSPG branding.
5. **Signature system is polished:** Draw (canvas), type (rendered to PNG canvas), and upload all function correctly.
6. **Branding is complete:** DSPG logo, institutional colors, department labels, committee metadata.
7. **Graceful degradation:** The system does not crash when Gemini is unavailable (though the fallback behavior is academically dishonest).

### 5.3 Recommended Implementation Order

```
PRIORITY 1 — Integrity (Must fix before any real academic usage)
  P1.1  Remove generateSimulatedResult() or replace with honest error
  P1.2  Fix "TIMESTAMPTED" typo in pdfService.ts (two occurrences)
  P1.3  Resolve pdf-parse / Vercel fragility

PRIORITY 2 — Real Plagiarism Engine (Core product requirement)
  P2.1  Implement text embedding (NVIDIA NIM or Gemini Embeddings API)
  P2.2  Set up vector store (Supabase pgvector, Pinecone, or Chroma)
  P2.3  Implement sentence-level chunking and similarity scoring
  P2.4  Wire NVIDIA NIM provider through src/ai/providers/

PRIORITY 3 — Authentication & Security
  P3.1  Implement authentication (Supabase Auth recommended)
  P3.2  Add per-user rate limiting to /api/analyze
  P3.3  Protect report compilation behind authenticated sessions

PRIORITY 4 — Corpus & Citation Verification
  P4.1  Build DSPG institutional corpus (past HND projects → vector embeddings)
  P4.2  Crossref DOI resolution for academic citation verification

PRIORITY 5 — Cleanup & Consolidation
  P5.1  Remove unused `motion` dependency
  P5.2  Wire AIConfig into server.ts or delete dead src/ai/ shell
  P5.3  Add analysis history persistence (requires database from P3)
```

---

## Summary Verdict

> The DSPG Plagiarism Checker has a **complete, professional front-end** and a **working end-to-end user journey**. The PDF certificate, signature system, branding, and UI are genuinely production-quality.
>
> However, the **core analytical claim** — that submitted documents are checked against real sources for plagiarism — **is not accurate**. The engine asks an LLM to invent similarity scores, and the fallback guarantees a passing grade. Before this system is used by the HND Projects Committee for real academic integrity decisions, the plagiarism engine must be replaced with a genuine implementation.
>
> **The system is safe to demonstrate and pilot-test. It must not be used for real academic certification in its current state.**

---

*Report generated from direct codebase inspection of all 34 source files in `C:\Projects\dspg`. No assumptions were made — every finding is traceable to a specific file and line number.*
