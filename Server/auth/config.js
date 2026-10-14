import 'dotenv/config';

// Compatible with existing Shop.project/Server/.env (MONGO_URL, send_mail, send_mail_password).
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL;
const jwtSecret = process.env.JWT_SECRET;
const smtpUser = process.env.SMTP_USER || process.env.send_mail;
const smtpPass = process.env.SMTP_PASS || process.env.send_mail_password;
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const frontendUrl = (process.env.FRONTEND_URL || (vercelHost ? `https://${vercelHost}` : 'http://localhost:5173')).replace(/\/$/, '');
const sameSite = (process.env.COOKIE_SAME_SITE ?? 'lax').toLowerCase();
const cookieSecure = Boolean(process.env.VERCEL) || process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true';

if (!mongoUri) throw new Error('Server/.env-ում նշիր MONGO_URL (կամ MONGODB_URI)։');
if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error('Server/.env-ում ավելացրու JWT_SECRET (առնվազն 32 պատահական նիշ)։');
}
if (!['lax', 'strict', 'none'].includes(sameSite)) throw new Error('COOKIE_SAME_SITE-ի արժեքը սխալ է։');
if (sameSite === 'none' && !cookieSecure) throw new Error('COOKIE_SAME_SITE=none-ը պահանջում է HTTPS։');

export const config = {
  port: Number(process.env.PORT || 3000),
  mongoUri,
  mongoDb: process.env.MONGO_DB_NAME || 'PhoneShop',
  jwtSecret,
  frontendUrl,
  allowedOrigin: new URL(frontendUrl).origin,
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: Number(process.env.SMTP_PORT || 465),
  smtpUser,
  smtpPass,
  smtpFrom: process.env.SMTP_FROM || smtpUser,
  contactToEmail: process.env.CONTACT_TO_EMAIL || smtpUser,
  nodeEnv: process.env.NODE_ENV || 'development',
  cookieSameSite: sameSite,
  cookieSecure,
};
