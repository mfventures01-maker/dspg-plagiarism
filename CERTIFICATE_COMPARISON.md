# Certificate Comparison

This document compares all located runtime certificates to verify authenticity and trace history.

| Certificate | Timestamp | Playwright | Status | Commit | Build Hash | SHA256 Integrity Hash |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Milestone 3.0 (Archived)** | 2026-07-20T12:34:49.912Z | PASS (15/15) | CERTIFIED | `781a113` | `bbd1204acfb811e0` | `d343bf7a746b511ad3a5ec1854dbe639876d0eeb90eee70ff473968dd874cd74` |
| **Superseded/Stale Run** | 2026-07-24T12:23:40.502Z | FAIL (12/16) | FAILED | `781a113` | `4edfe7cbf1bb6988` | `3517f3c5860bfa2f934b1477fd762b9aabcd33d6a4072367c9f2d854855b0a98` |
| **Authoritative (Current)** | 2026-07-24T12:41:40.409Z | PASS (16/16) | CERTIFIED | `781a113` | `9491ea3e5bd90f3a` | `6a1b19ffcb6a58a3d84e1a731b96d537fae4b78a8000bb24bafcef3889ea5248` |

### Key Findings
- **Discrepancy resolved**: The superseded run failed due to a ReferenceError (`require is not defined in ES module scope`) in `SimilarityEngine.ts` preventing the API and report UI from rendering properly.
- **Authoritative status**: The current certificate is verified as the newest, most consistent, and authoritative certification record.
