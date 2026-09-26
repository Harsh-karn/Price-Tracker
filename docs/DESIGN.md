# Design System

## Style
Clean, minimal, dashboard-oriented — the interface's job is to make price
history, stock, and scrape reliability easy to read at a glance, not to look
decorative.

## Layout
- A search bar for finding products on the mock store by partial/full name.
- A list/grid of tracked products, each showing its currently tracked
  option, latest price, latest stock, and a link into its detail view.
- A per-product detail view containing:
  - Price & stock history (chart or table).
  - Scrape log (timestamp, outcome, price/stock if successful).
  - An Export button for that product's (or the whole dashboard's) CSV
    history.

## Typography
A single, readable sans-serif system font stack (or one Google Font, e.g.
Inter) — consistent across the whole app.

## Colors
Not fixed by the assignment brief — pick one consistent palette and apply it
uniformly (background, text, primary action color, and distinct colors for
scrape outcomes):
- Success outcome: a clear "positive" color (e.g. green).
- Retried outcome: a clear "caution" color (e.g. amber).
- Failed outcome: a clear "negative" color (e.g. red).

## Components
- **Buttons**: primary (track a product, export CSV), secondary
  (cancel/back), destructive (stop tracking a product).
- **Cards**: used for tracked-product summaries; consistent border radius
  and spacing across every card.
- **Charts**: price-over-time and stock-over-time for a tracked
  product/option.
- **Log table**: timestamp, outcome, price, stock, per scrape attempt —
  visually distinguishing failed rows from successful ones.

## UX Requirements
- Mobile responsive.
- Loading states while searching, tracking, or fetching history.
- Empty states (no products tracked yet, no scrape history yet).
- Error states (search failed, scrape endpoint unreachable, export failed).
- Accessible forms (labeled search input, keyboard-operable controls).
- Scrape failures must be visually honest — shown plainly in the log and in
  history, not hidden or silently skipped.
