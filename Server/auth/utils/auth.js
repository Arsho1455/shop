import { createHash, randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

const ISSUER = 'armauth-api';
const COOKIE_NAME = 'armauth_session';
const SESSION_DAYS = 7;

export function createSessionToken(userId) {
  return jwt.sign({ purpose: 'session' }, config.jwtSecret, {
    subject: String(userId),
    issuer: ISSUER,
    audience: 'armauth-client',
    expiresIn: `${SESSION_DAYS}d`,
  });
}

export function verifySessionToken(token) {
  const payload = jwt.verify(token, config.jwtSecret, {
    issuer: ISSUER,
    audience: 'armauth-client',
  });
  if (payload.purpose !== 'session' || !payload.sub) throw new Error('Invalid session token');
  return payload;
}

export function createEmailToken(userId) {
  const jti = randomUUID();
  const token = jwt.sign({ purpose: 'verify-email' }, config.jwtSecret, {
    subject: String(userId),
    issuer: ISSUER,
    audience: 'armauth-email-verification',
    jwtid: jti,
    expiresIn: '24h',
  });
  return { token, hash: hashTokenId(jti), expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) };
}

export function verifyEmailToken(token) {
  const payload = jwt.verify(token, config.jwtSecret, {
    issuer: ISSUER,
    audience: 'armauth-email-verification',
  });
  if (payload.purpose !== 'verify-email' || !payload.jti || !payload.sub) {
    throw new Error('Invalid email token');
  }
  return payload;
}

export function hashTokenId(jti) {
  return createHash('sha256').update(jti).digest('hex');
}

export function publicUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    bio: user.bio,
    role: 'customer', // Storefront sessions never confer administrative access.
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
  };
}

const commonCookie = () => ({
  httpOnly: true,
  secure: config.cookieSecure,
  sameSite: config.cookieSameSite,
  path: '/',
});

export function setSessionCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    ...commonCookie(),
    maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, commonCookie());
}

export { COOKIE_NAME };
