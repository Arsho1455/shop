import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { sendVerificationEmail } from '../utils/mail.js';
import {
  clearSessionCookie, createEmailToken, createSessionToken,
  COOKIE_NAME, hashTokenId, publicUser, setSessionCookie, verifyEmailToken, verifySessionToken,
} from '../utils/auth.js';
import { normalizeEmail, validEmail, validName, validPassword } from '../utils/validate.js';

const router = Router();
const limiter = (limit, windowMs = 15 * 60 * 1000) => rateLimit({
  windowMs,
  limit,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Շատ հարցումներ։ Փորձիր մի փոքր ուշ։' },
});
const signUpLimiter = limiter(10);
const loginLimiter = limiter(15);
const resendLimiter = limiter(5, 60 * 60 * 1000);
const verifyLimiter = limiter(20);

async function generateAndSendVerification(user, language = 'hy') {
  const { token, hash, expiresAt } = createEmailToken(user._id);
  user.verificationTokenHash = hash;
  user.verificationTokenExpiresAt = expiresAt;
  await user.save();
  await sendVerificationEmail(user.email, token, language);
}

router.post('/register', signUpLimiter, async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password;
  if (!validName(name) || !validEmail(email) || !validPassword(password)) {
    return res.status(400).json({ message: 'Անունը՝ 2–60 նիշ, վավեր email և գաղտնաբառ՝ 8+ նիշ (առավելագույնը 72 բայթ)։' });
  }

  if (await User.exists({ email })) {
    return res.status(409).json({ message: 'Այս էլ. հասցեով հաշիվ արդեն կա։ Եթե չես հաստատել՝ պահանջիր նոր նամակ։' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  let user;
  try {
    user = await User.create({ name, email, passwordHash });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'Այս էլ. հասցեն արդեն օգտագործվում է։' });
    throw error;
  }

  try {
    await generateAndSendVerification(user, req.body?.language);
  } catch (error) {
    console.error('Verification email send failed:', error.message);
    return res.status(502).json({
      code: 'MAIL_FAILED',
      message: 'Հաշիվը ստեղծվել է, բայց նամակը չի ուղարկվել։ Ստուգիր SMTP կարգավորումները և սեղմիր «Կրկին ուղարկել»։',
    });
  }
  return res.status(201).json({ message: 'Գրանցումը հաջողվել է։ Ստուգիր էլ. փոստդ և հաստատիր հասցեն։' });
});

router.post('/verify-email', verifyLimiter, async (req, res) => {
  const token = req.body?.token;
  if (typeof token !== 'string' || token.length > 4000) {
    return res.status(400).json({ message: 'Հաստատման հղումն անվավեր է։' });
  }
  let payload;
  try {
    payload = verifyEmailToken(token);
  } catch {
    return res.status(400).json({ message: 'Հղումն անվավեր է կամ ժամկետանց։ Պահանջիր նոր նամակ։' });
  }
  if (!mongoose.isValidObjectId(payload.sub)) {
    return res.status(400).json({ message: 'Հղումն անվավեր է։' });
  }
  const user = await User.findOneAndUpdate(
    {
      _id: payload.sub,
      isEmailVerified: false,
      verificationTokenHash: hashTokenId(payload.jti),
      verificationTokenExpiresAt: { $gt: new Date() },
    },
    { $set: { isEmailVerified: true }, $unset: { verificationTokenHash: '', verificationTokenExpiresAt: '' } },
    { new: true }
  );
  if (!user) return res.status(400).json({ message: 'Հղումն արդեն օգտագործվել է կամ անվավեր է։' });
  return res.json({ message: 'Էլ. հասցեն հաստատված է։ Այժմ կարող ես մուտք գործել։' });
});

router.post('/resend-verification', resendLimiter, async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  if (!validEmail(email)) return res.status(400).json({ message: 'Մուտքագրիր վավեր էլ. հասցե։' });
  const user = await User.findOne({ email });
  if (user && !user.isEmailVerified) {
    try {
      await generateAndSendVerification(user, req.body?.language);
    } catch (error) {
      console.error('Resend email failed:', error.message);
      return res.status(502).json({ message: 'Նամակը չուղարկվեց։ Ստուգիր SMTP կարգավորումները։' });
    }
  }
  // Նույն պատասխանը նաև գոյություն չունեցող/հաստատված հասցեների համար։
  return res.json({ message: 'Եթե հասցեն սպասում է հաստատման, նոր նամակ կստանաս։' });
});

router.post('/login', loginLimiter, async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password;
  if (!validEmail(email) || !validPassword(password)) {
    return res.status(400).json({ message: 'Ստուգիր էլ. հասցեն և գաղտնաբառը։' });
  }
  const user = await User.findOne({ email }).select('+passwordHash');
  const correct = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!correct) return res.status(401).json({ message: 'Սխալ էլ. հասցե կամ գաղտնաբառ։' });
  if (!user.isEmailVerified) {
    return res.status(403).json({
      code: 'EMAIL_NOT_VERIFIED',
      message: 'Սկզբում հաստատիր էլ. հասցեդ։ Կարող ես կրկին ուղարկել նամակը։',
    });
  }
  setSessionCookie(res, createSessionToken(user._id));
  return res.json({ message: 'Մուտքը հաջողվել է։', user: publicUser(user) });
});

// /me is a session-status endpoint, not a protected resource.
// An anonymous visitor (or a visitor with an expired cookie) is a normal
// application state; responding 200 prevents noisy 401s on every page load.
// All private profile/cart/favorites routes continue to use requireAuth.
router.get('/me', async (req, res) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.json({ user: null, authenticated: false });

  let payload;
  try {
    payload = verifySessionToken(token);
  } catch {
    clearSessionCookie(res); // Drop expired/invalid cookies so they do not linger.
    return res.json({ user: null, authenticated: false });
  }

  if (!mongoose.isValidObjectId(payload.sub)) {
    clearSessionCookie(res);
    return res.json({ user: null, authenticated: false });
  }

  // Database errors are not "logged out": let Express's error handler report them.
  const user = await User.findById(payload.sub);
  if (!user || !user.isEmailVerified) {
    clearSessionCookie(res);
    return res.json({ user: null, authenticated: false });
  }

  return res.json({ user: publicUser(user), authenticated: true });
});
router.post('/logout', (_req, res) => {
  clearSessionCookie(res);
  return res.json({ message: 'Դու դուրս եկար հաշվից։' });
});

export default router;
