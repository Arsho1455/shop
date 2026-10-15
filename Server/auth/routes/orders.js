import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/requireAuth.js';
import { User } from '../models/User.js';
import { Product } from '../../models/productModel.js';
import { Order, publicOrder } from '../models/Order.js';
import { calculateOrder, cleanShipping } from '../payments/checkoutUtils.js';
import { isSafeDemoCheckoutPayload } from '../payments/demoUtils.js';

const router = Router();
router.use(requireAuth);
const limit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 12, standardHeaders: 'draft-7', legacyHeaders: false, message: { message: 'Չափազանց շատ հարցումներ։ Փորձիր ավելի ուշ։' } });
const fee = Number(process.env.SHIPPING_FEE_AMD || '0');
const deliveryFee = Number.isSafeInteger(fee) && fee >= 0 ? fee : 0;
const demoEnabled = () => process.env.DEMO_CHECKOUT_ENABLED !== 'false';

router.get('/settings', (_req, res) => res.json({ demoMode: true, demoEnabled: demoEnabled(), deliveryFee }));
router.get('/', async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50).lean();
  res.json({ orders: orders.map(publicOrder) });
});
router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Պատվերը չի գտնվել։' });
  const order = await Order.findOne({ _id: req.params.id, userId: req.user._id }).lean();
  if (!order) return res.status(404).json({ message: 'Պատվերը չի գտնվել։' });
  return res.json({ order: publicOrder(order) });
});
router.post('/checkout', limit, async (req, res) => {
  if (!demoEnabled()) return res.status(503).json({ message: 'Դեմո գնումը ժամանակավորապես անջատված է։' });
  // PAN, expiration and CVV must never cross the API boundary, even accidentally.
  if (!isSafeDemoCheckoutPayload(req.body)) return res.status(400).json({ message: 'Քարտի տվյալները սերվեր ուղարկել չի թույլատրվում։' });
  const checkoutKey = req.body.checkoutKey;
  if (typeof checkoutKey !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(checkoutKey)) {
    return res.status(400).json({ message: 'Կրկին բացիր վճարման էջը։' });
  }
  const existing = await Order.findOne({ checkoutKey, userId: req.user._id }).lean();
  if (existing) return res.json({ order: publicOrder(existing) });
  let shipping; let quote;
  try {
    shipping = cleanShipping(req.body.shipping);
    const products = await Product.find({ id: { $in: req.user.cart.map((item) => item.productId) } }).lean();
    quote = calculateOrder(req.user.cart, products, deliveryFee);
  } catch (error) { return res.status(400).json({ message: error.message }); }
  let order;
  try {
    order = await Order.create({
      orderNumber: `DEMO-${randomUUID().slice(0, 8).toUpperCase()}`,
      checkoutKey, userId: req.user._id, email: req.user.email,
      shipping, ...quote,
      status: 'demo_completed', paymentMethod: 'demo_card', demoCompletedAt: new Date(),
    });
  } catch (error) {
    if (error.code === 11000) {
      const previous = await Order.findOne({ checkoutKey, userId: req.user._id }).lean();
      if (previous) return res.json({ order: publicOrder(previous) });
    }
    throw error;
  }
  // This is a SIMULATION, not a confirmed payment or real sale.
  // Do not decrement warehouse stock and do not dispatch orders automatically.
  // Clear purchased items from this user's cart; never store sample card fields.
  await User.updateOne({ _id: req.user._id }, {
    $pull: { cart: { productId: { $in: quote.items.map((item) => item.productId) } } },
  }).catch((error) => console.error('Demo order cart cleanup:', error.message));
  return res.status(201).json({ order: publicOrder(order) });
});
export default router;
