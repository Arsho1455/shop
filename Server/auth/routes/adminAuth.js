import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import bcrypt from 'bcrypt';
import { AdminAccount } from '../models/AdminAccount.js';
import { normalizeEmail, validEmail } from '../utils/validate.js';
import { publicAdmin } from '../utils/publicAdmin.js';
import { clearAdminSessionCookie, createAdminSessionToken, setAdminSessionCookie } from '../utils/adminSession.js';
import { resolveAdmin } from '../middleware/requireAdminSession.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Չափազանց շատ փորձեր։ Փորձիր ավելի ուշ։' },
});

router.get('/me', async (req, res) => {
  const admin = await resolveAdmin(req, res);
  return res.json({ authenticated: Boolean(admin), user: admin ? publicAdmin(admin) : null });
});

router.post('/login', loginLimiter, async (req, res) => {
  const login = normalizeEmail(req.body?.login);
  const password = req.body?.password;
  if (!validEmail(login) || typeof password !== 'string' || !password || Buffer.byteLength(password, 'utf8') > 72) {
    return res.status(401).json({ message: 'Սխալ լոգին կամ գաղտնաբառ։' });
  }
  // NEVER consult the shopper User collection. Admins are provisioned via CLI only.
  const admin = await AdminAccount.findOne({ email: login, isActive: true }).select('+passwordHash');
  const matches = admin ? await bcrypt.compare(password, admin.passwordHash) : false;
  if (!matches) return res.status(401).json({ message: 'Սխալ լոգին կամ գաղտնաբառ։' });
  setAdminSessionCookie(res, createAdminSessionToken(admin._id, admin.sessionVersion));
  return res.json({ user: publicAdmin(admin) });
});

router.post('/logout', (_req, res) => {
  clearAdminSessionCookie(res);
  return res.json({ message: 'Ադմինի սեսիան փակված է։' });
});

export default router;
