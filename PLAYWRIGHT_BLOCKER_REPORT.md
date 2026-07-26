# HOEOS Playwright Blocker Report

## 1. Failing Tests
The following tests from the Playwright certification suite failed to execute successfully:

*   **`certifications/runtime/ai.spec.ts`**
    *   *Test*: `LAW-R005: CORE AI request executes >> should fire AI_REQUEST_SENT and AI_RESPONSE_RECEIVED and receive 200 OK from /api/analyze`
    *   *Error*: `TimeoutError: page.waitForSelector: Timeout 15000ms exceeded. Waiting for locator('text=Document Normalization Metrics') to be visible`
*   **`certifications/runtime/report.spec.ts`**
    *   *Test*: `LAW-R006: Analysis renders >> should display similarity score, AI probability, and recommendation`
    *   *Error*: Test timeout of 30000ms exceeded.
*   **`certifications/runtime/mobile.spec.ts`**
    *   *Tests*: `LAW-R010: Responsive certification` (Mobile, Tablet, and Desktop viewports)
    *   *Error*: `TimeoutError: page.waitForSelector: Timeout 15000ms exceeded. Waiting for locator('text=Document Normalization Metrics') to be visible` / `expect(locator).toBeEnabled() failed (button "Analyze & Verify Integrity" remained disabled)`.

---

## 2. Root Cause Analysis
The failure is caused by a **network bottleneck/outbound internet block** in the execution environment combined with a lack of local offline mocks for external AI endpoints.

1.  **Blocked Outbound Connections**: The certification environment lacks outbound network access (verified via a direct connection test to `google.com` which hung indefinitely).
2.  **API Hangs/Timeouts**: When the test fills the project details and clicks **"Analyze & Verify Integrity"**, the frontend sends a `POST` request to the local server at `/api/analyze`.
3.  **Real Network Invocation**: The server invokes `AIGateway`, which defaults to the `GeminiProvider` (configured in `.env` as the default provider). The `GeminiProvider` attempts a real `fetch` request to `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=...`.
4.  **Gateway Failover & Final Crash**: Because the request to Gemini is blocked, it hangs until the 30-second timeout threshold is reached. The gateway then attempts to fall back to `DeepSeekProvider` (at `https://api.deepseek.com/v1`), which also fails immediately with `AIError: fetch failed`.
5.  **UI Unresponsiveness**: As a result, `/api/analyze` fails with HTTP 500, the UI gets stuck in the **"Auditing Academic Integrity Draft..."** spinning state, and the tests fail due to timeouts.

---

## 3. Evidence
*   **Server Stack Trace (captured in WebServer logs)**:
    ```text
    [WebServer] [STACK] request=951a6f4c
    [WebServer] AIError: fetch failed
    [WebServer]     at DeepSeekProvider.analyzeDocument (C:\Projects\dspg\dist\server.cjs:348:13)
    [WebServer]     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    [WebServer]     at async CircuitBreaker.execute (C:\Projects\dspg\dist\server.cjs:771:22)
    ```
*   **Playwright Test Runner Log**:
    ```text
    TimeoutError: page.waitForSelector: Timeout 15000ms exceeded.
    Call log:
      - waiting for locator('text=Document Normalization Metrics') to be visible
    ```
*   **Active UI State (from Page Snapshot)**:
    ```yaml
    - heading "Auditing Academic Integrity Draft..." [level=3]
    - generic:
      - generic: ✓ Extracting Text
      - generic: ✓ Mapping Chunks
      - img (spinning) Gemini Audit
    ```

---

## 4. Suggested Fix
Since the HOEOS constraints strictly prohibit modifying application code at this stage, the following infrastructure or configuration fixes are recommended:

1.  **Introduce an Offline Mock Provider**: Modify the provider layer to support a mock environment where API calls are intercepted locally (e.g., via MSW or a mock provider flag in the config) instead of attempting real outbound fetches.
2.  **Mock Server Endpoint**: Provide a configuration option (such as `GEMINI_API_BASE_URL`) to allow redirecting API requests from `https://generativelanguage.googleapis.com` to a local mock server running alongside the application.
