import { test, expect } from '@playwright/test';

test.describe('LAW-R005: CORE AI request executes', () => {
  test('should fire AI_REQUEST_SENT and AI_RESPONSE_RECEIVED and receive 200 OK from /api/analyze', async ({ page }) => {
    await page.goto('/');
    
    let requestSentFired = false;
    let responseReceivedFired = false;
    
    await page.exposeFunction('onTelemetryEvent', (eventDetails: any) => {
      if (eventDetails.event === 'AI_REQUEST_SENT') requestSentFired = true;
      if (eventDetails.event === 'AI_RESPONSE_RECEIVED') responseReceivedFired = true;
    });

    await page.addScriptTag({
      content: `
        window.addEventListener('DSPG_TELEMETRY', (e) => {
          window.onTelemetryEvent(e.detail);
        });
      `
    });

    // We can use the Sample Project feature to fill data
    await page.click('button:has-text("Load Sample Project Abstract")');

    // Monitor network for the analyze API call
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/analyze') && resp.request().method() === 'POST'),
      page.click('button:has-text("Analyze & Verify Integrity")')
    ]);

    expect(response.status()).toBe(200);

    // Wait for the UI to update
    await page.waitForSelector('text=Document Normalization Metrics', { timeout: 35000 });

    expect(requestSentFired).toBe(true);
    expect(responseReceivedFired).toBe(true);
  });
});
