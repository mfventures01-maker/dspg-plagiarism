import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('LAW-R003: Upload system ready', () => {
  test('should enable upload tab and accept valid files', async ({ page }) => {
    await page.goto('/');
    
    // Switch to File Upload tab
    await page.click('button:has-text("File Upload (.pdf, .docx, .txt)")');
    
    // Ensure the drag & drop zone is visible
    const dropzone = page.locator('.border-dashed').first();
    await expect(dropzone).toBeVisible();
    
    // The underlying file input should exist
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
  });
});

test.describe('LAW-R004: Document upload succeeds', () => {
  test('should fire UPLOAD_STARTED and UPLOAD_COMPLETE events', async ({ page }) => {
    await page.goto('/');
    
    // Switch to File Upload tab
    await page.click('button:has-text("File Upload (.pdf, .docx, .txt)")');
    
    // We need to listen to telemetry events
    let startedFired = false;
    let completeFired = false;
    
    await page.exposeFunction('onTelemetryEvent', (eventDetails: any) => {
      if (eventDetails.event === 'UPLOAD_STARTED') startedFired = true;
      if (eventDetails.event === 'UPLOAD_COMPLETE') completeFired = true;
    });

    await page.addScriptTag({
      content: `
        window.addEventListener('DSPG_TELEMETRY', (e) => {
          window.onTelemetryEvent(e.detail);
        });
      `
    });

    // Fill metadata
    await page.fill('input[placeholder="e.g. Design and Construction of a Microcontroller-Based Smart Irrigation System"]', 'Test Title');
    await page.fill('input[placeholder="e.g. Engr. Brian Abugewa"]', 'Test Supervisor');
    await page.fill('input[placeholder="Full Name"]', 'Test Student');
    await page.fill('input[placeholder="Matric Number"]', 'TEST/123');
    
    // Create a dummy txt file
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('text=browse files');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('This is a test document with more than 10 characters for plagiarism check.')
    });

    // Click Analyze
    await page.click('button:has-text("Analyze & Verify Integrity")');

    // Wait for scanning to finish (either complete or error)
    await page.waitForSelector('text=Document Normalization Metrics', { timeout: 15000 });

    expect(startedFired).toBe(true);
    expect(completeFired).toBe(true);
  });
});
