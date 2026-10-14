// All /api/* routes run through one Express instance on Vercel.
// The frontend and API have the SAME origin, allowing HttpOnly auth cookies.
import app from '../Server/app.js';
import { connectDB } from '../Server/config/db.js';
import { initializeCatalog } from '../Server/auth/data/catalogService.js';

let readyPromise;
async function ready() {
  if (!readyPromise) {
    readyPromise = (async () => {
      await connectDB();
      await initializeCatalog();
    })().catch((error) => {
      readyPromise = undefined; // Retry after intermittent Atlas failures.
      throw error;
    });
  }
  return readyPromise;
}

export default async function handler(req, res) {
  try {
    await ready();
    return app(req, res);
  } catch (error) {
    console.error('PhoneShop function initialization failed:', error.message);
    return res.status(503).json({ message: 'Տվյալների բազան ժամանակավորապես անհասանելի է։' });
  }
}
