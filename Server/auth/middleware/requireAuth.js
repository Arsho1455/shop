import { User } from '../models/User.js';
import { COOKIE_NAME, verifySessionToken } from '../utils/auth.js';

export async function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ message: 'Մուտք գործիր՝ շարունակելու համար։' });

  try {
    const { sub, sessionVersion = 0 } = verifySessionToken(token);
    const user = await User.findById(sub);
    if (!user || !user.isEmailVerified || sessionVersion !== (user.sessionVersion ?? 0)) {
      return res.status(401).json({ message: 'Սեսիան անվավեր է։' });
    }
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: 'Սեսիայի ժամկետը լրացել է։' });
  }
}
