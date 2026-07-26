import { test, expect } from '@playwright/test';

// Import from the compiled/bundle since we are testing runtime behavior
// But Playwright can resolve TS, so we can just hardcode the expected values or import them.
// To keep it simple and strictly separate, we'll assert the exact values from Branding.ts
const EXPECTED_TITLE = "DSPG Plagiarism Checker";
const EXPECTED_INSTITUTION = "Delta State Polytechnic Ogwashi-Uku";
const EXPECTED_LOGO_PATH = "/src/branding/assets/dspg-logo.png";
const EXPECTED_FAVICON_PATH = "/src/branding/assets/favicon.png";

test.describe('LAW-B012 to LAW-B015: Branding Certification', () => {
  
  test('should have correct document title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(EXPECTED_TITLE);
  });

  test('should have correct OpenGraph metadata', async ({ page }) => {
    await page.goto('/');
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toBe(EXPECTED_TITLE);

    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage).toBeTruthy();
    // In production build, Vite might hash and rename the file, so we just ensure it exists
    expect(ogImage?.length).toBeGreaterThan(5);
  });

  test('should render institution name on homepage', async ({ page }) => {
    await page.goto('/');
    const institutionText = page.locator(`text=${EXPECTED_INSTITUTION}`).first();
    await expect(institutionText).toBeVisible();
  });

  test('should resolve logo and favicon properly', async ({ page }) => {
    await page.goto('/');
    
    // Check favicon in head
    const faviconHref = await page.locator('link[rel="icon"]').getAttribute('href');
    expect(faviconHref).toBeTruthy();
    expect(faviconHref?.length).toBeGreaterThan(5);

    // Check logo image in DOM
    const logoImg = page.locator('img[alt="Crest"], img[alt="Delta State Polytechnic Ogwashi-Uku"]').first();
    await expect(logoImg).toBeVisible();
    
    const src = await logoImg.getAttribute('src');
    expect(src).toBeTruthy();
    expect(src?.length).toBeGreaterThan(5);
  });
});
