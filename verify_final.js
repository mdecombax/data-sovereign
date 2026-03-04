const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:8000');

  // Wait for animations
  await page.waitForTimeout(1000);

  // Take screenshots of sections with moved styles
  await page.locator('.hero').screenshot({ path: 'verification/hero_final.png' });
  await page.locator('.reality-check').screenshot({ path: 'verification/reality_final.png' });
  await page.locator('.comparatif').screenshot({ path: 'verification/comparatif_final.png' });
  await page.locator('.tech-reassurance').screenshot({ path: 'verification/tech_final.png' });

  await browser.close();
})();
