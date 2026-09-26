# Architecture

## Frontend
React.js + TypeScript, deployed on Vercel.
(The brief allows React.js or Vue.js — React is chosen here.)

## Styling
Tailwind CSS.

## Backend
Node.js + Express, deployed on Render.
(The brief allows Node.js/Express or Django — Express is chosen here for a
single-language stack with the frontend.)

## Database
Supabase (PostgreSQL) — stores tracked products/options, price & stock
history, and the scrape log.

## Scraping
- Default: lightweight HTTP fetch + HTML parsing (e.g. an HTTP client plus a
  server-side HTML parser) against the mock store's product pages.
- Fallback: a headless browser (Playwright) only for parts of the mock store
  that genuinely require JavaScript rendering (e.g. asynchronously-loaded
  price/stock data), per the brief's guidance to prefer lightweight fetching
  and reach for a headless browser only where necessary.
- Must support both a normal (headless) run and a headed run for the
  required observable/screen-recorded run.

## Scheduling
An external cron service (cron-job.org) calling a scheduled scrape endpoint
on the Render backend every 2 hours, since free-tier backends sleep and an
always-on loop is not reliable on the free tier. The endpoint scrapes every
currently tracked product/option.

## Deployment Targets
- Frontend: Vercel
- Backend: Render
- Database: Supabase (PostgreSQL)
- Scrape trigger: cron-job.org (external, hits a backend endpoint)

## High-Level Flow

```
User
  ↓
React UI (Vercel)
  ↓ (search / track / view history / export)
Express API (Render)
  ↓
Supabase (PostgreSQL)

Scheduled scrape (separate path):
cron-job.org (every 2h)
  ↓ HTTP call
Express scrape endpoint (Render)
  ↓ for each tracked product/option
Scraper (HTTP fetch + parse, or Playwright fallback)
  ↓ (retry on slow/failed load)
Mock store (https://demo.inelabteamdev.com/)
  ↓ result (success / retried / failed)
Supabase (price history + scrape log)
```

## Folder Structure

```
frontend/
├── src/
│   ├── app/            # routes/pages
│   ├── components/     # reusable UI (search box, product card, charts, log table)
│   ├── features/       # search, tracking, history, export — feature-scoped logic
│   ├── services/       # API client calls to the backend
│   ├── lib/            # shared helpers (formatting, CSV helpers)
│   ├── types/           # shared TypeScript types
│   └── utils/

backend/
├── src/
│   ├── routes/          # /search, /products, /scrape, /export
│   ├── controllers/     # request handling per route
│   ├── services/        # database access (Supabase), business logic
│   ├── scraper/         # fetch-based scraper, Playwright fallback, retry logic
│   ├── jobs/            # scheduled-scrape entry point (called by cron-job.org)
│   ├── types/
│   └── utils/
```

## Data Model (Supabase / PostgreSQL) — high level

- `products` — store product identity as discovered on the mock store: store
  product ID (from the product page URL), product name, product URL.
- `product_options` — the specific option being tracked for a product (e.g.
  storage size, kit, pack size), linked to `products`.
- `tracked_items` — a `product_option` the user has chosen to track, with
  when it was added.
- `scrape_history` — one row per scrape attempt: tracked item, timestamp
  (ISO 8601 UTC), price, stock, outcome (`success` / `retried` / `failed`).
  Price and stock are left null/empty when outcome is `failed`.

(Exact column-level schema is a Phase 2 implementation detail, not fixed
here, since it depends on what the mock store's product/option pages
actually expose — see TASKS.md.)

## Architectural Rules
- UI components should not contain database or scraping logic.
- Database operations belong in backend services, not controllers or routes.
- The scraper must never write a `success` row with missing price/stock, and
  must never silently drop a failed attempt — every attempt is logged.
- Retry logic lives inside the scraper module, not scattered across callers.
- The scheduled-scrape job and the manual/headed-run trigger call the same
  underlying scraper code path, so headed-mode behavior reflects production
  behavior.
- Business logic (retry policy, outcome classification) stays out of the UI
  layer.
- Secrets (Supabase keys, etc.) are read from environment variables only,
  never hard-coded or exposed to the frontend.
