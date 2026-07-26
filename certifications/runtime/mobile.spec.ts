import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1440, height: 900 }
];

test.describe('LAW-R010: Responsive certification', () => {
  for (const vp of viewports) {
    test(`should render correctly on ${vp.name} without horizontal overflow and keep upload functional`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');

      // 1. Evidence: No overflow
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(overflow, `Horizontal overflow detected on ${vp.name}`).toBe(false);

      // 2. Evidence: Navigation usable
      const title = page.locator('text=DSPG').first();
      await expect(title).toBeVisible();

      // 3. Evidence: Upload functional
      await page.fill('textarea[placeholder*="Paste your abstract"]', 'This is a sample project abstract containing more than 10 characters.');
      const analyzeBtn = page.locator('button:has-text("Analyze & Verify Integrity")');
      await expect(analyzeBtn).toBeVisible();
      await expect(analyzeBtn).toBeEnabled();
    });
  }
});
