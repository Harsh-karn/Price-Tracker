"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scraper = exports.Scraper = void 0;
const playwright_1 = require("playwright");
const supabase_1 = require("../services/supabase");
class Scraper {
    storeUrl = process.env.MOCK_STORE_URL || 'https://demo.inelabteamdev.com';
    async scrapeItem(trackedItemId, storeProductId, optionLabel) {
        console.log(`Starting scrape for item ${trackedItemId} (Product ${storeProductId}, Option ${optionLabel})`);
        let browser;
        let outcome = 'failed';
        let price = null;
        let stock = null;
        let retries = 0;
        const maxRetries = 2;
        while (retries <= maxRetries && outcome !== 'success') {
            try {
                if (retries > 0) {
                    console.log(`Retry ${retries}/${maxRetries} for item ${trackedItemId}...`);
                    outcome = 'retried';
                }
                const isHeaded = process.env.HEADED_MODE === 'true';
                browser = await playwright_1.chromium.launch({ headless: !isHeaded });
                const context = await browser.newContext();
                const page = await context.newPage();
                await page.goto(`${this.storeUrl}/item/${storeProductId}`, { waitUntil: 'networkidle' });
                // Select the specific option if it exists
                const optionButton = page.locator(`button:has-text("${optionLabel}")`);
                if (await optionButton.count() > 0) {
                    await optionButton.click();
                    await page.waitForTimeout(500); // Wait for React to switch variants
                }
                // The price is hidden behind a hover interaction on the `.group` container
                const hoverTarget = page.locator('.group').first();
                await hoverTarget.hover();
                // The assignment strictly requires waiting for real data to appear, not fixed guess-delay.
                // The price starts with '₹' and appears in a span.
                const priceElement = page.locator('span', { hasText: '₹' }).first();
                await priceElement.waitFor({ state: 'visible', timeout: 5000 });
                // Extract the raw text (e.g. "₹2,499.00" or "₹2499")
                const priceText = await priceElement.innerText();
                const numericPrice = parseFloat(priceText.replace(/[^\d.]/g, ''));
                if (!isNaN(numericPrice)) {
                    price = numericPrice;
                }
                // Find the stock text
                // Stock usually appears after hover too. 
                // We look for common stock phrases.
                const stockElement = page.locator('span', { hasText: /In stock|Out of stock|Only \d+ left/i }).first();
                if (await stockElement.count() > 0) {
                    stock = await stockElement.innerText();
                }
                else {
                    // Fallback just in case
                    const fallbackStock = page.locator('.group span').nth(2); // Often the 3rd span
                    if (await fallbackStock.count() > 0) {
                        stock = await fallbackStock.innerText();
                    }
                }
                if (price !== null) {
                    outcome = 'success';
                }
                else {
                    throw new Error('Price element found but parsing failed');
                }
            }
            catch (error) {
                console.error(`Scrape attempt failed for ${trackedItemId}:`, error.message);
            }
            finally {
                if (browser) {
                    await browser.close();
                }
            }
            if (outcome !== 'success') {
                retries++;
            }
        }
        // Save to database
        await this.saveScrapeHistory(trackedItemId, price, stock, outcome);
        return { trackedItemId, price, stock, outcome };
    }
    async saveScrapeHistory(trackedItemId, price, stock, outcome) {
        try {
            const { error } = await supabase_1.supabase.from('scrape_history').insert([{
                    tracked_item_id: trackedItemId,
                    price,
                    stock,
                    outcome
                }]);
            if (error) {
                console.error(`Failed to save scrape history for ${trackedItemId}:`, error);
            }
        }
        catch (err) {
            console.error(`Exception saving scrape history for ${trackedItemId}:`, err);
        }
    }
    async runAllScrapes() {
        console.log('Fetching all active tracked items...');
        const { data: trackedItems, error } = await supabase_1.supabase
            .from('tracked_items')
            .select(`
        id,
        product_options (
          label,
          products (
            store_product_id
          )
        )
      `);
        if (error || !trackedItems) {
            console.error('Failed to fetch tracked items:', error);
            return;
        }
        console.log(`Found ${trackedItems.length} items to scrape.`);
        // Process items in sequence to avoid launching too many browsers concurrently on small machines
        // For production, a worker pool would be better.
        const results = [];
        for (const item of trackedItems) {
            const storeProductId = item.product_options?.products?.store_product_id;
            const optionLabel = item.product_options?.label;
            if (storeProductId && optionLabel) {
                const res = await this.scrapeItem(item.id, storeProductId, optionLabel);
                results.push(res);
            }
        }
        console.log('All scrapes finished.', results);
        return results;
    }
}
exports.Scraper = Scraper;
exports.scraper = new Scraper();
//# sourceMappingURL=scraper.js.map