# EA-015 Runtime Hotfix Report
**DSPG Academic Integrity Platform**

## Root Cause Report
During document scanning of files that yield zero evidence passages (e.g. original papers without matched paragraphs or when the search provider fails/returns zero matches), the `similarityResult` object returned by the `SimilarityEngine` contains `undefined` arrays for `matchingPassages`, `sentenceScores`, and `chunkScores` depending on the provider failure path.
The serialization layer in `server.ts` was attempting to directly access properties or call methods on these undefined values (such as `similarityResult.matchingPassages.length` or `similarityResult.matchingPassages.map(...)`), resulting in an uncaught `TypeError: Cannot read properties of undefined (reading 'map')` at line 575 and returning a HTTP 500 error.

---

## Files Modified
- [server.ts](file:///c:/Projects/dspg/server.ts)

---

## Exact Lines Changed
- **Before Lines**: 570 - 580, 589 - 595, 617
- **After Lines**: 558 - 572, 575 - 580, 589 - 595, 617

---

## Before/After Code Diff

```diff
-        matchedParagraphs: similarityResult.matchingPassages.length || 0,
-        matchedSentences: similarityResult.sentenceScores.length || 0
+        matchedParagraphs: matchingPassages.length,
+        matchedSentences: sentenceScores.length
```

```diff
-    const evidenceTable = similarityResult.matchingPassages.map((chunk: any) => ({
+    const matchingPassages = similarityResult.matchingPassages ?? [];
+    const sentenceScores = similarityResult.sentenceScores ?? [];
+    const chunkScores = similarityResult.chunkScores ?? [];
+
+    const evidenceTable = matchingPassages.map((chunk: any) => ({
```

```diff
-    const highlightedMatches = similarityResult.matchingPassages.map((chunk: any, idx: number) => ({
+    const highlightedMatches = matchingPassages.map((chunk: any, idx: number) => ({
```

```diff
-    const heatMap = similarityResult.chunkScores.map((score: number) => Math.round(score * 100));
+    const heatMap = chunkScores.map((score: number) => Math.round(score * 100));
```

---

## Runtime Verification
- Successfully verified clean TypeScript type checks (`npx tsc --noEmit`) and successful bundle builds (`npm run build`).
- Safe null-handling was verified dynamically: missing arrays are successfully defaulted to `[]`, allowing Scenario A (evidence populated) and Scenario B (zero evidence) to execute safely with HTTP 200 responses.

---

## Playwright Verification
- All 16 E2E integration tests executed successfully and passed.
- Output: `16 passed (3.3m)`
- The updated certificate has been generated at: `C:\Projects\dspg\certifications\certificates\DSPG_RUNTIME_CERTIFICATE.md` with SHA256 `1c1ef8ac0470367198cdd7c2d611dc4596c3fdc57a31208778a51178b45cf881`.

---

## Confirmation of Scope
No other services, normalizers, provider integrations, UI renderers, or database layers were modified. The scope of changes was strictly restricted to response construction in `server.ts` as dictated by HOEOS rules.
