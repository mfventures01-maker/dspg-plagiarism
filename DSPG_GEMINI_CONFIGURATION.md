# DSPG Gemini Configuration & Migration Assessment

This document reviews the current Gemini API configuration and details the migration steps to Gemini 2.0 Flash.

---

## 1. Current Gemini Integration Specs (In server.ts)

*   **Current SDK:** `@google/genai` (Google's new unified SDK)
*   **Current Model:** `gemini-3.5-flash` with fallback to `gemini-3.1-flash-lite` (defined in line 294)
*   **Current API Call:** `ai.models.generateContent({ model: modelName, contents: prompt, config: { ... } })`
*   **Current Temperature:** Default (Unconfigured - defaults to SDK default of 1.0)
*   **Current Max Tokens:** Default (Unconfigured)
*   **Current Response Format:** `application/json` (strictly validated with JSON schema)
*   **Current Timeout:** Default (SDK fallback limits)

---

## 2. Gemini 2.0 Flash Migration Review

*   **Can the current implementation switch to Gemini 2.0 Flash?**
    *   **YES**
*   **Precise lines requiring modifications (in server.ts):**
    Line 294 of `server.ts` currently reads:
    ```typescript
    const candidateModels = ['gemini-3.5-flash', 'gemini-3.1-flash-lite'];
    ```
    This needs to be updated to:
    ```typescript
    const candidateModels = ['gemini-2.0-flash', 'gemini-1.5-flash'];
    ```
    *Note: The `@google/genai` SDK natively supports `'gemini-2.0-flash'` as the standard identifier for Gemini 2.0 Flash.*

---

## 3. Cost-Optimization Recommendations

For a high-reliability, low-latency production plagiarism check demo, the following cheapest production-safe configuration is recommended:

1.  **SDK Selection:** Maintain the current `@google/genai` SDK. It is the official modern library, supports structured JSON schemas, and is highly performant.
2.  **Model Selection:** Use `gemini-2.0-flash`. It offers:
    *   *Lower latency:* Up to 2x faster time-to-first-token compared to older Flash models.
    *   *Cost savings:* Extremely cheap pricing ($0.075 / 1M input tokens, $0.30 / 1M output tokens).
    *   *Structured Outputs:* Native support for responseSchema validation ensuring 100% JSON reliability.
3.  **Generation Settings:**
    *   `temperature: 0.1` (Forces highly deterministic results suitable for academic similarity audits).
    *   `responseMimeType: "application/json"` combined with the current strict `responseSchema`.
