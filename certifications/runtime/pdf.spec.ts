import { test, expect } from '@playwright/test';
import * as fs from 'fs';

test.describe('LAW-R007: PDF report generated', () => {
  test('should compile, enable download, and serve a valid PDF file', async ({ page }) => {
    await page.goto('/');

    // 1. Trigger Analysis
    await page.click('button:has-text("Load Sample Project Abstract")');
    await page.click('button:has-text("Analyze & Verify Integrity")');
    await page.waitForSelector('text=Document Normalization Metrics', { timeout: 35000 });

    // 2. Sign the document (Chairman and Secretary)
    // The UI automatically validates signatures when clicking Compile & Download in the Live Preview Simulator
    
    // We listen for the REPORT_RENDERED and PDF_DOWNLOADED events
    let reportRendered = false;
    let pdfDownloaded = false;
    await page.exposeFunction('onTelemetryEvent', (eventDetails: any) => {
      if (eventDetails.event === 'REPORT_RENDERED') reportRendered = true;
      if (eventDetails.event === 'PDF_DOWNLOADED') pdfDownloaded = true;
    });
    await page.addScriptTag({
      content: `window.addEventListener('DSPG_TELEMETRY', (e) => window.onTelemetryEvent(e.detail));`
    });

    // 3. Compile & Download
    // The button says "Compile & Download" initially
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Compile & Download")');
    
    const download = await downloadPromise;
    expect(download).toBeTruthy();

    // 4. Verify Downloaded File
    const filePath = await download.path();
    expect(filePath).toBeTruthy();
    
    if (filePath) {
      const stats = fs.statSync(filePath);
      expect(stats.size).toBeGreaterThan(0); // Non-zero file size

      const buffer = fs.readFileSync(filePath);
      // Valid PDF header checks (PDFs start with %PDF-)
      const header = buffer.subarray(0, 5).toString();
      expect(header).toBe('%PDF-');
    }

    // Wait briefly for telemetry to settle
    await page.waitForTimeout(500);

    expect(reportRendered).toBe(true);
    expect(pdfDownloaded).toBe(true);
  });
});
