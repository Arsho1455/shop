import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { config } from "./auth/config.js";
import publicProductRoutes from "./auth/routes/products.js";
import legacyProductRoutes from "./routes/productRoutes.js";
import adminRoutes from "./auth/routes/admin.js";
import adminAuthRoutes from "./auth/routes/adminAuth.js";
import authRoutes from "./auth/routes/auth.js";
import profileRoutes from "./auth/routes/profile.js";
import shopRoutes from "./auth/routes/shop.js";
import contactRoutes from "./auth/routes/contact.js";

const app = express();
app.disable('x-powered-by');
app.use(helmet());
// Credentialed requests require the exact frontend origin (no wildcard).
app.use(cors({ origin: config.allowedOrigin, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

// Check the configured local/production origin. Vercel preview deployments have
// different temporary hostnames: accept them only when origin === request host.
function isAllowedBrowserOrigin(req) {
  const origin = req.headers.origin;
  if (!origin || origin === config.allowedOrigin) return true;
  if (process.env.VERCEL) {
    try {
      const parsed = new URL(origin);
      return parsed.protocol === 'https:' && parsed.host === req.headers.host;
    } catch {
      return false;
    }
  }
  return false;
}

// Limit CSRF on state-changing requests.
app.use('/api', (req, res, next) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && !isAllowedBrowserOrigin(req)) {
    return res.status(403).json({ message: 'Արգելված Origin։' });
  }
  return next();
});

app.use('/products', legacyProductRoutes); // original read-only API preserved
app.use('/api/products', publicProductRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/contact', contactRoutes);
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/', (_req, res) => res.send('PhoneShop Server is working!'));
app.use((err, _req, res, _next) => {
  if (err instanceof SyntaxError && 'body' in err) return res.status(400).json({ message: 'JSON-ը սխալ է։' });
  console.error(err);
  return res.status(500).json({ message: 'Սերվերի սխալ։' });
});

// Export a reusable Express app. Vercel must NOT start a long-lived HTTP server.
export default app;
