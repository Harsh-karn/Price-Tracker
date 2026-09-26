# Price Tracker

A full-stack web application built to search, track, and record price changes from a deliberately difficult mock store.

## Architecture & Tech Stack
- **Frontend**: React.js (Vite) deployed on **Vercel**
- **Backend**: Node.js (Express) deployed on **Render** using a custom Dockerfile to support Playwright.
- **Database**: Supabase (PostgreSQL)
- **Scraper**: Playwright (Headless browser) for dynamic DOM interaction, supplemented by lightweight `fetch` for static catalog data.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Supabase account (with configured tables)

### 1. Database Setup (Supabase)
Run the SQL script provided in `backend/schema.sql` inside your Supabase SQL Editor. This will create the required `products`, `product_options`, `tracked_items`, and `scrape_history` tables with all necessary foreign key constraints.

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory:
   ```env
   PORT=3001
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   MOCK_STORE_URL=https://demo.inelabteamdev.com
   ```
4. Start the backend:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` directory:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_API_URL=http://localhost:3001 # Or your live Render URL for production
   ```
4. Start the frontend:
   ```bash
   npm run dev
   ```

## Scraping Schedule
Because free-tier hosting services (like Render) sleep after a period of inactivity, this application uses a stateless architectural pattern for scheduled jobs.

The backend exposes a secure webhook at `POST /api/scrape/run`. An external cron service (`cron-job.org`) is configured to ping this endpoint on a fixed schedule of **once every 2 hours**. This wakes the server if it is sleeping, triggers the Playwright scraper, processes all active tracked items, logs the outcomes, and spins down naturally.

## Observable (Headed) Run
If you would like to test the scraper locally and watch it execute its interactions, you can trigger a headed run. This will open a visible Chromium browser and generate a `.webm` screen recording of the session.

```bash
cd backend
npm run scrape:headed
```
The video will be saved in `backend/recordings/`.
