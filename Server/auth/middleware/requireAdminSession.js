import mongoose from 'mongoose';
import { AdminAccount } from '../models/AdminAccount.js';
import { ADMIN_COOKIE_NAME, clearAdminSessionCookie, verifyAdminSessionToken } from '../utils/adminSession.js';

export async function resolveAdmin(req, res) {
  const token = req.cookies?.[ADMIN_COOKIE_NAME];
  if (!token) return null;
  let payload;
  try {
    payload = verifyAdminSessionToken(token);
  } catch {
    clearAdminSessionCookie(res);
    return null;
  }
  if (!mongoose.isValidObjectId(payload.sub)) {
    clearAdminSessionCookie(res);
    return null;
  }
  // Check the separate admin identity on every request. Disabled accounts
  // and tokens issued before the last password reset are rejected immediately.
  const admin = await AdminAccount.findById(payload.sub);
  if (!admin || !admin.isActive || (admin.sessionVersion || 0) !== payload.sv) {
    clearAdminSessionCookie(res);
    return null;
  }
  return admin;
}

export async function requireAdminSession(req, res, next) {
  const admin = await resolveAdmin(req, res);
  if (!admin) return res.status(401).json({ message: 'Մուտք գործիր ադմինիստրատորի հաշվով։' });
  req.admin = admin;
  return next();
}
