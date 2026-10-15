import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { Product } from '../../models/productModel.js';
import { Review } from '../models/Review.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { parseProductId } from '../utils/shop.js';
import { reviewPublic, validateReview } from '../reviews/reviewUtils.js';

const router = Router({ mergeParams: true });
const writeLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 12, standardHeaders: 'draft-8', legacyHeaders: false });

async function existingProduct(req, res, next) {
  const id = parseProductId(req.params.id);
  if (!id) return res.status(400).json({ message: 'Սխալ ապրանքի ID։' });
  if (!await Product.exists({ id })) return res.status(404).json({ message: 'Ապրանքը չի գտնվել։' });
  req.productId = id;
  return next();
}

router.use(existingProduct);

// Read-only endpoint is public. Requests are paginated to avoid downloading all reviews at once.
router.get('/', async (req, res) => {
  const requested = Number(req.query.page || 1);
  const page = Number.isSafeInteger(requested) && requested >= 1 && requested <= 10000 ? requested : 1;
  const limit = 10;
  const [items, total] = await Promise.all([
    Review.find({ productId: req.productId }).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Review.countDocuments({ productId: req.productId }),
  ]);
  return res.json({ reviews: items.map(reviewPublic), total, page, hasMore: page * limit < total });
});

router.get('/mine', requireAuth, async (req, res) => {
  const review = await Review.findOne({ productId: req.productId, userId: req.user._id }).lean();
  return res.json({ review: review ? reviewPublic(review) : null });
});

router.post('/', requireAuth, writeLimiter, async (req, res) => {
  const message = validateReview(req.body);
  if (message) return res.status(400).json({ message });
  try {
    const saved = await Review.create({
      productId: req.productId,
      userId: req.user._id,
      authorName: req.user.name,
      rating: req.body.rating,
      comment: req.body.comment.trim(),
    });
    return res.status(201).json({ review: reviewPublic(saved) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'Այս ապրանքի համար արդեն կարծիք ունես։ Կարող ես այն խմբագրել։' });
    throw error;
  }
});

router.put('/mine', requireAuth, writeLimiter, async (req, res) => {
  const message = validateReview(req.body);
  if (message) return res.status(400).json({ message });
  const review = await Review.findOneAndUpdate(
    { productId: req.productId, userId: req.user._id },
    { $set: { rating: req.body.rating, comment: req.body.comment.trim(), authorName: req.user.name } },
    { new: true, runValidators: true }
  );
  return review ? res.json({ review: reviewPublic(review) }) : res.status(404).json({ message: 'Քո կարծիքը չի գտնվել։' });
});

router.delete('/mine', requireAuth, writeLimiter, async (req, res) => {
  const review = await Review.findOneAndDelete({ productId: req.productId, userId: req.user._id });
  return review ? res.json({ message: 'Կարծիքը հեռացվեց։' }) : res.status(404).json({ message: 'Քո կարծիքը չի գտնվել։' });
});

export default router;
