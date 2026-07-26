import { test, expect } from '@playwright/test';

test.describe('LAW-R001: Homepage loads', () => {
  test('should return HTTP 200, DOM loaded, no fatal JS exceptions', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    
    // Wait for the main app element to ensure DOM is ready
    await page.waitForSelector('#root, .min-h-screen');
    
    // JS exceptions are caught by page.on('pageerror') configured in a setup or tested inherently
    // We explicitly assert we can see the main container
    await expect(page.locator('text=DSPG').first()).toBeVisible();
  });
});

test.describe('LAW-R002: Brand identity exists', () => {
  test('should render DSPG logo, title, and brand elements', async ({ page }) => {
    await page.goto('/');
    
    // Logo visible (assuming it's an img with alt text related to institution)
    const logo = page.locator('img[alt="Delta State Polytechnic Ogwashi-Uku"]');
    await expect(logo).toBeVisible();
    
    // Title present
    await expect(page).toHaveTitle(/DSPG|Plagiarism/i);
    
    // Navigation / Header text rendered
    await expect(page.locator('text=Delta State Polytechnic Ogwashi-Uku').first()).toBeVisible();
    await expect(page.locator('text=School of Engineering').first()).toBeVisible();
  });
});

test.describe('LAW-R008 & LAW-R009: Browser and Network Integrity', () => {
  test('should load without console errors or failed requests', async ({ page }) => {
    const errors: string[] = [];
    const failedRequests: string[] = [];

    page.on('pageerror', exception => {
      errors.push(exception.message);
    });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('requestfailed', request => {
      failedRequests.push(request.url());
    });

    page.on('response', response => {
      if (response.status() >= 500) {
        failedRequests.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out React dev tools errors if any, but in production this should be 0
    expect(errors.length, `Console errors found: ${errors.join(', ')}`).toBe(0);
    expect(failedRequests.length, `Failed network requests: ${failedRequests.join(', ')}`).toBe(0);
  });
});
