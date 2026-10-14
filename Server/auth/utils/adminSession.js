import jwt from 'jsonwebtoken';
import { config } from '../config.js';

// Independent of the shopper's armauth_session cookie.
// A regular customer JWT is NEVER accepted for admin access.
export const ADMIN_COOKIE_NAME = 'phoneshop_admin_session';
const ADMIN_AUDIENCE = 'phoneshop-admin';
const ADMIN_ISSUER = 'armauth-api';
const ADMIN_SESSION_MS = 12 * 60 * 60 * 1000;

export function createAdminSessionToken(adminId, sessionVersion = 0) {
  return jwt.sign({ purpose: 'admin-session', sv: sessionVersion }, config.jwtSecret, {
    subject: String(adminId),
    issuer: ADMIN_ISSUER,
    audience: ADMIN_AUDIENCE,
    expiresIn: '12h',
  });
}

export function verifyAdminSessionToken(token) {
  const payload = jwt.verify(token, config.jwtSecret, {
    issuer: ADMIN_ISSUER,
    audience: ADMIN_AUDIENCE,
  });
  if (payload.purpose !== 'admin-session' || !payload.sub || !Number.isSafeInteger(payload.sv) || payload.sv < 0) throw new Error('Invalid admin session');
  return payload;
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: config.cookieSameSite,
    path: '/api/admin',
  };
}

export function setAdminSessionCookie(res, token) {
  res.cookie(ADMIN_COOKIE_NAME, token, { ...cookieOptions(), maxAge: ADMIN_SESSION_MS });
}

export function clearAdminSessionCookie(res) {
  res.clearCookie(ADMIN_COOKIE_NAME, cookieOptions());
}
