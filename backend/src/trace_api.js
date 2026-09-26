"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const playwright_1 = require("playwright");
(async () => {
    const browser = await playwright_1.chromium.launch();
    const page = await browser.newPage();
    page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('api') || url.includes('json') || url.includes('product') || url.includes('demo.inelabteamdev.com')) {
            if (response.request().resourceType() === 'fetch' || response.request().resourceType() === 'xhr') {
                console.log(`[API Response] ${url}`);
                try {
                    const json = await response.json();
                    console.log(JSON.stringify(json).substring(0, 200));
                }
                catch (e) { }
            }
        }
    });
    console.log('Navigating to the store...');
    await page.goto('https://demo.inelabteamdev.com/', { waitUntil: 'networkidle' });
    console.log('Done.');
    await browser.close();
})();
//# sourceMappingURL=trace_api.js.map