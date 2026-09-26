# Tasks

## Phase 1: Setup
- [ ] Initialize frontend (React + TypeScript) and backend (Express +
      TypeScript) projects.
- [ ] Configure Tailwind CSS on the frontend.
- [ ] Set up Supabase project (PostgreSQL) and connection from the backend.
- [ ] Configure Git repository (public, per deliverables).
- [ ] Configure environment variables (Supabase keys, mock store base URL,
      any scraper-specific config) for local + deployed environments.

## Phase 2: Explore the Mock Store
- [ ] Manually inspect https://demo.inelabteamdev.com/: product listing
      pages, product detail pages, product options (storage/kit/pack size),
      and the store's product ID as shown in the product page URL.
- [ ] Identify which content loads immediately vs. asynchronously, and where
      the store is slow or returns errors, to inform the scraper design.
- [ ] Decide, per page type, whether lightweight HTTP fetch + parsing is
      sufficient or a headless browser (Playwright) is required.

## Phase 3: Product Search & Tracking
- [ ] Create `products` / `product_options` / `tracked_items` tables in
      Supabase.
- [ ] Build backend search endpoint (search mock store by partial/full
      product name).
- [ ] Build frontend search UI (search bar, results list).
- [ ] Build "track this product/option" action (persists to Supabase).
- [ ] Build dashboard view listing currently tracked items.

## Phase 4: Scraper Core (the heart of the assignment)
- [ ] Build the base scraper: fetch a tracked product/option's page, parse
      current price and stock.
- [ ] Add retry logic for slow or failed responses.
- [ ] Add handling for asynchronously-loaded content (wait for real data,
      not a fixed guess-delay).
- [ ] Add headless-browser (Playwright) fallback for pages that require it.
- [ ] Classify and record every attempt's outcome: `success`, `retried`,
      `failed` — with price/stock left empty on `failed`.
- [ ] Build a headed-mode run option for the scraper (for the observable
      run / screen recording).
- [ ] Write `scrape_history` rows to Supabase (timestamp in ISO 8601 UTC).

## Phase 5: Scheduling
- [ ] Build a backend endpoint that scrapes all currently tracked
      products/options.
- [ ] Configure cron-job.org to call that endpoint every 2 hours.
- [ ] Verify the schedule keeps running (and the backend doesn't need to
      stay awake) across multiple real, unattended runs.

## Phase 6: History, Log & Export
- [ ] Build price/stock history view (chart or table) per tracked item.
- [ ] Build per-product scrape log view (timestamp, outcome, price, stock).
- [ ] Build CSV export: store product ID, product name, selected option,
      ISO 8601 UTC timestamp, price, stock, outcome — one row per scrape
      attempt, failed rows with price/stock empty.
- [ ] Add loading / empty / error states across all views.

## Phase 7: Deployment
- [ ] Deploy frontend to Vercel.
- [ ] Deploy backend to Render.
- [ ] Confirm Supabase is reachable from the deployed backend.
- [ ] Confirm cron-job.org is hitting the deployed backend endpoint on
      schedule.
- [ ] Track at least 2–3 real products/options live, and let scheduled runs
      accumulate real history before submission.

## Phase 8: Deliverables
- [ ] Record a 2–4 minute headed-mode scraper run, including a slow or
      failing response and how it's handled.
- [ ] Write README.md (setup instructions, scrape schedule, required env
      vars).
- [ ] Write a short design note (reliability approach, trade-offs, what the
      AI tooling got wrong initially and how it was corrected).
- [ ] Attach PDF resume.
- [ ] Final check: live link, GitHub repo (public), recording, README,
      design note, resume — all present before the deadline
      (Sep 27, 2026, 1:00 PM IST).

## Bonus (optional, after core is solid)
- [ ] Price-drop / back-in-stock alerts (in-app or via SendGrid email).
- [ ] Multi-product dashboard view with extra product info.
- [ ] Change detection for store page-structure changes.
- [ ] Configurable per-product scrape frequency.
- [ ] Scrape multiple options of the same product in one run.
- [ ] CI/CD with GitHub Actions.
