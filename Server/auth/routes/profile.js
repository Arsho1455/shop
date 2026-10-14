import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { publicUser } from '../utils/auth.js';
import { validName } from '../utils/validate.js';

const router = Router();
router.use(requireAuth);

router.get('/', (req, res) => res.json({ user: publicUser(req.user) }));

router.patch('/', async (req, res) => {
  const { name, bio } = req.body ?? {};
  if (typeof name !== 'string' || !validName(name)) {
    return res.status(400).json({ message: 'Անունը պետք է լինի 2–60 նիշ։' });
  }
  if (typeof bio !== 'string' || bio.length > 160) {
    return res.status(400).json({ message: 'Նկարագրությունը չի կարող գերազանցել 160 նիշը։' });
  }
  req.user.name = name.trim();
  req.user.bio = bio.trim();
  await req.user.save();
  return res.json({ message: 'Պրոֆիլը պահպանված է։', user: publicUser(req.user) });
});

export default router;
