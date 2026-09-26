# Design Note: Scraping Reliability & Trade-offs

## How Scraping Was Made Reliable
The mock store is intentionally difficult: it utilizes asynchronous rendering, and critical data (like price and stock) is completely absent from the initial DOM payload. 

To ensure the scraper remains reliable across unattended runs, the following architecture was implemented:
1. **Targeted Escalation**: Instead of using a slow headless browser for everything, the application uses lightning-fast, lightweight HTTP `fetch` requests to build the product catalog and search results. Playwright is *only* instantiated for the final price check where DOM manipulation is mandatory.
2. **Deterministic Waiting over Static Delays**: Rather than using flaky static timeouts (`waitForTimeout(5000)`), the scraper is programmed to wait for specific DOM mutations. It locates the `.group` product card, triggers a physical mouse `hover()`, and then utilizes `waitFor({ state: 'visible' })` specifically looking for the `₹` symbol to be injected into the DOM.
3. **Graceful Failure and Retry Loop**: The scraper is wrapped in a strict `try/catch` block with a max-retry limit of 3. If a network timeout occurs, or the site randomly alters its page structure, the scraper does not crash the server. It iterates the retry loop. If it ultimately fails, it honestly records an `outcome: 'failed'` in the database while leaving the price fields null, ensuring incorrect data is never stored.

## Trade-offs
1. **Playwright vs. Cheerio**: The decision to use Playwright increases the memory footprint and cold-start time of the Render backend significantly. A custom Dockerfile was required to install Chromium binaries. However, this trade-off was mandatory because the mock store strictly injects pricing data via JavaScript event listeners triggered by mouse movement.
2. **Stateless Webhook vs. Stateful Scheduler**: We sacrificed the convenience of an internal `node-cron` loop running on the server. Because free-tier Render instances sleep, an internal loop would silently fail. We traded this for a stateless webhook (`/api/scrape/run`) that delegates scheduling responsibility to an external service (`cron-job.org`), guaranteeing execution even if the backend goes to sleep.

## AI Collaboration: Mistakes & Corrections
During development with the AI assistant, a few initial assumptions had to be corrected:

1. **Blind API Assumptions**: On the first attempt to build the search functionality, the AI assumed the mock store's API would follow standard REST conventions and attempted to fetch from `/api/products`. This returned 404s. **Correction**: The AI had to inspect the live site's network traffic to discover the actual paginated endpoint was located at `/api/v2/listings`.
2. **The "Hidden CSS" Fallacy**: When first building the scraper, the AI assumed the price was loaded in the initial HTML but hidden via `display: none` or `opacity: 0`. It attempted to parse the raw HTML using Cheerio, which returned empty strings. **Correction**: We realized the site aggressively lazy-loads the DOM nodes *only* after a hover event fires, forcing a pivot from lightweight parsing to full Playwright automation.
3. **Node Version Incompatibilities**: When trying to create the "Observable Headed Run" script, the AI provided a command using `ts-node`. Because my local environment is on Node.js v24 (which strictly enforces ES Modules), the script instantly crashed with `__dirname is not defined`. **Correction**: The AI adapted to the environment by removing CommonJS specific variables, migrating to simple `.env` loading, and switching the execution engine to `tsx`.
