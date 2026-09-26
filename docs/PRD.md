# Product Requirements Document

## Product
Mock Storefront Product Search & Scheduled Price Tracker

## Problem
Shoppers want to know how a product's price and stock change over time on a
given store, but checking manually is tedious and easy to forget. There is no
simple tool to pick a specific product (and a specific option of that product,
e.g. a storage size or pack size) and have its price and stock tracked
automatically and reliably, even when the store's pages are slow, flaky, or
load some content asynchronously.

## Target Users
The assignment evaluator, reviewing a working demo of a product search +
scheduled price-tracking application built against the provided mock
storefront (https://demo.inelabteamdev.com/).

## Goal
Build a small full-stack web application that lets a user search the mock
storefront for a product, pick a specific product option to track, and see
that option's price/stock history and scrape log, built on top of a scraper
that keeps working correctly across many unattended scheduled runs.

## Core Features
1. Product search — search the mock store by partial or full product name.
2. Product/option tracking — pick a product and one of its options (e.g.
   storage size, kit, pack size) to track; persist tracked items in Supabase.
3. Scheduled scraping — scrape each tracked product/option's current price
   and stock once every 2 hours via an external trigger (free-tier backends
   sleep, so no always-on loop).
4. Price & stock history — chart or table of a tracked item's price/stock
   over time.
5. Scrape log — per-product log of every scrape attempt with timestamp and
   outcome (success, retried, failed).
6. CSV export — one row per scrape attempt: store product ID (from the
   product page URL), product name, selected option, ISO 8601 UTC timestamp,
   price, stock, outcome. Failed rows must have price/stock left empty.
7. Headed (observable) scraper run — a mode to watch the scraper run live,
   for the required screen recording.

## MVP
- Search the mock store for a product by name.
- Pick a product + option and save it as "tracked" in Supabase.
- Trigger a scrape (manually and via external cron) that records price,
  stock, timestamp, and outcome for a tracked item.
- Retry logic for slow/failed responses; never store partial/incorrect data
  on failure.
- Dashboard showing price/stock history (chart or table) per tracked item.
- Per-product scrape log (all attempts, including failures).
- CSV export of the full scrape history.
- At least 2–3 products tracked live, with history/log reflecting real
  unattended scheduled runs, at submission time.
- Headed-mode scraper run, screen-recorded (2–4 min), showing handling of a
  slow or failing response.

## Out of Scope (for MVP)
- User accounts / multi-user auth (not requested in the brief).
- Price-drop / back-in-stock alerts (listed only as a bonus).
- Change detection for store page-structure changes (bonus).
- Configurable per-product scrape frequency (bonus).
- Scraping multiple options of the same product in one run (bonus).
- CI/CD pipeline (bonus).
- Scraping any site other than the provided mock storefront.

## Success Criteria
A user (evaluator) should be able to:
1. Open the live dashboard link and see products already being tracked.
2. Search for a product on the mock store by name and add a new
   product+option to track.
3. See price and stock history for a tracked product/option over time.
4. See a scrape log for a tracked product showing every attempt (success,
   retried, failed) with timestamps.
5. Export the full scrape history as a CSV matching the specified columns.
6. Watch a screen recording of the scraper running headed, including at
   least one slow/failing response and how it's handled.
7. Read a README with setup steps, the scrape schedule, and required
   environment variables.
8. Read a short design note on scraping reliability decisions, trade-offs,
   and where the developer's AI tooling got the scraping wrong initially and
   how it was fixed.

## Deliverables (per assignment brief)
- Live hosted site link (frontend on Vercel, backend on Render).
- Public GitHub repository with all source.
- 2–4 minute headed-mode scraper screen recording.
- README (setup, schedule, env vars).
- Design note (reliability approach, trade-offs, AI-tool corrections).
- PDF resume.

## Deadline
September 27, 2026 (Sunday), 1:00 PM IST.

## Evaluation Priorities (from the brief, in order of emphasis)
1. Scraping reliability across many unattended runs (the core of the
   assessment).
2. Correctness under difficulty (late-loading content, slow responses; never
   store wrong/empty data on success).
3. Honest history/logging (failures recorded, not hidden).
4. Judgment (lightweight fetch vs. headless browser; free-tier scheduling).
5. Deployment correctness (Vercel + Render + Supabase, all reachable live).
