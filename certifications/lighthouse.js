import { playAudit } from 'playwright-lighthouse';
import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

async function runLighthouseAudit() {
  console.log('Running Lighthouse Audit...');
  const port = 9222;
  const browser = await chromium.launch({
    args: [`--remote-debugging-port=${port}`],
  });
  const page = await browser.newPage();
  
  const reportDir = path.join(process.cwd(), 'certifications', 'evidence');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  // We can just audit the homepage for performance/accessibility baseline
  await page.goto('http://localhost:3000');

  try {
    await playAudit({
      page: page,
      thresholds: {
        performance: 50,
        accessibility: 50,
        'best-practices': 50,
        seo: 50,
      },
      port: port,
      opts: {
        logLevel: 'info',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      },
      reports: {
        formats: {
          json: true,
          html: true,
        },
        name: 'lighthouse-report',
        directory: reportDir,
      },
    });
    console.log('Lighthouse Audit completed successfully. Results saved in certifications/evidence/');
  } catch (error) {
    console.error('Lighthouse Audit failed:', error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runLighthouseAudit();
