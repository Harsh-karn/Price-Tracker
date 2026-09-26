const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('api') && response.request().resourceType() === 'fetch') {
      console.log(`[API] ${url}`);
    }
  });

  console.log('Navigating...');
  await page.goto('https://demo.inelabteamdev.com/', { waitUntil: 'networkidle' });
  
  const inputs = await page.locator('input').elementHandles();
  console.log(`Found ${inputs.length} inputs`);
  for (let input of inputs) {
    const type = await input.getAttribute('type');
    const placeholder = await input.getAttribute('placeholder');
    console.log(`Input: type=${type}, placeholder=${placeholder}`);
    if (placeholder && placeholder.toLowerCase().includes('search')) {
      await input.fill('Rowing');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);
      break;
    }
  }

  await browser.close();
})();
