# Playwright Runtime Tests Documentation

This document describes the Playwright end-to-end verification and certification suite.

## 1. Test Execution Command
The test suite can be run locally using the following script:
```bash
npm run test:runtime
```

## 2. Test Cases Covered
The suite contains **16 sequential tests** validating branding, integrity, and analysis pipelines:
- **LAW-R001 & LAW-R002**: Verification of homepage loading, logo rendering, and styling assets.
- **LAW-R003 & LAW-R004**: Checking document upload system readiness, file ingestion, and telemetry events (`UPLOAD_STARTED`, `UPLOAD_COMPLETE`).
- **LAW-R005**: AI API Gateway routing and response validation.
- **LAW-R006**: Report rendering, checking display of similarity scores, AI generation risk, and recommendation levels.
- **LAW-R007**: Multi-page PDF generation, validation of downloads, and cover sheet signatures binding.
- **LAW-R008 & LAW-R009**: Browser and network integrity assertions.
- **LAW-R010**: Responsiveness testing across Mobile, Tablet, and Desktop resolutions.
- **RV-016 (MVP E2E)**: Simulates a complete user journey from uploading to downloading the signed originality audit report.

## 3. Certification Result
Upon completion of the tests, the test runner produces a signed certification document:
- **Location**: `certifications/certificates/DSPG_RUNTIME_CERTIFICATE.md`
- **Result**: **16 of 16 tests passed successfully.**
