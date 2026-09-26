# Development Rules

## General
- Use TypeScript on both frontend and backend.
- Reuse existing components/services; do not duplicate logic.
- Keep functions small and single-purpose.
- Do not modify unrelated files when working a task.

## Before Coding
- Read PRD.md, ARCHITECTURE.md, and DESIGN.md before starting a new feature.
- Check MEMORY.md for current project status before picking up work.
- Inspect existing implementation before adding new code.
- Make a short plan before any change that touches more than one file.

## Scraping (project-specific — this is the core of the assignment)
- Default to lightweight HTTP fetch + HTML parsing; only use a headless
  browser (Playwright) for parts of the mock store that genuinely require
  JavaScript rendering.
- Every scrape attempt must be logged, with outcome `success`, `retried`, or
  `failed` — never silently dropped.
- A `failed` attempt must leave price and stock empty — never store a guess
  or a stale value as if it were current.
- Retry on slow or errored responses before marking an attempt `failed`; log
  the retry as `retried`.
- Handle asynchronous/late-loading content by waiting for the actual data,
  not with an arbitrary fixed delay that may be too short or too long.
- The same scraper code path must work in both headless (scheduled) and
  headed (observable) modes.
- Never scrape any site other than the provided mock store
  (https://demo.inelabteamdev.com/).

## UI
- Follow DESIGN.md.
- Maintain responsive design.
- Include loading, error, and empty states for every data-driven view.
- Do not hide or downplay failed scrapes in the UI.

## Security
- Never expose Supabase service keys or other secrets to client-side code.
- Validate all user input (search queries, tracked product/option
  selections).
- Verify authorization server-side for any state-changing request (e.g. only
  the backend, not the client, decides what gets written to Supabase).

## Scheduling
- Trigger scheduled scrapes via an external cron service (cron-job.org)
  hitting a backend endpoint — do not rely on an always-on in-process loop,
  since free-tier backends sleep.

## Testing
- Add tests for scraper retry/failure handling and for CSV export
  correctness, since these are the features being evaluated most closely.
- Run tests after implementation; fix failing tests before continuing.

## Git
- Make small, incremental commits.
- Use descriptive commit messages.

## Data Integrity
- Never fabricate or backfill price/stock history — the live dashboard's
  history and scrape log must reflect real, unattended scheduled runs.
