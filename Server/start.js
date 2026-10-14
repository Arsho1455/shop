// Local/VM process entry point. Do not import this from Vercel Functions.
import app from './app.js';
import { config } from './auth/config.js';
import { connectDB } from './config/db.js';
import { initializeCatalog } from './auth/data/catalogService.js';

try {
  await connectDB();
  await initializeCatalog();
  app.listen(config.port, () => console.log(`PhoneShop API: http://localhost:${config.port}`));
} catch (error) {
  console.error('Server startup failed:', error.message);
  process.exitCode = 1;
}
