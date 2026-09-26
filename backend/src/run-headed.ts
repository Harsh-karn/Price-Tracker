import dotenv from 'dotenv';

// Load .env from the backend directory
dotenv.config();

// Enable headed mode
process.env.HEADED_MODE = 'true';

import { scraper } from './scraper/scraper';

console.log('--- STARTING HEADED OBSERVABLE RUN ---');
console.log('This will open a visible Chromium browser and automatically record the session to backend/recordings/');
console.log('The scraper will run through all currently tracked items in your Supabase database.');

scraper.runAllScrapes().then(() => {
  console.log('--- FINISHED ---');
  console.log('Your screen recordings have been saved in the backend/recordings directory!');
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
