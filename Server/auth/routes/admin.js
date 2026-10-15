import { Router } from 'express';
import { User } from '../models/User.js';
import { AdminAccount } from '../models/AdminAccount.js';
import { Product } from '../../models/productModel.js';
import { Review } from '../models/Review.js';
import { Order, publicOrder } from '../models/Order.js';
import { requireAdminSession } from '../middleware/requireAdminSession.js';
import { listCatalog, nextProductId, validateProduct } from '../data/catalogService.js';
import { parseProductId } from '../utils/shop.js';

const router = Router();
router.use(requireAdminSession);

router.get('/stats', async (_req, res) => {
  const [users, verified, admins, products, lowStock, cart, latestUsers] = await Promise.all([
    User.countDocuments(), User.countDocuments({ isEmailVerified: true }),
    AdminAccount.countDocuments({ isActive: true }), Product.countDocuments({ id: { $exists: true } }),
    Product.countDocuments({ id: { $exists: true }, stock: { $lte: 5 } }),
    User.aggregate([{ $unwind: '$cart' }, { $group: { _id: null, items: { $sum: '$cart.quantity' } } }]),
    User.find().select('name email isEmailVerified role createdAt').sort({ createdAt: -1 }).limit(5).lean(),
  ]);
  return res.json({ users, verified, admins, products, lowStock, cartItems: cart[0]?.items || 0, latestUsers });
});

router.get('/users', async (req, res) => {
  const page = Math.min(10000, Math.max(1, Number.parseInt(req.query.page, 10) || 1));
  const q = String(req.query.q || '').trim().slice(0, 80);
  const filter = q ? { $or: [
    { name: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
    { email: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
  ] } : {};
  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter).select('name email role isEmailVerified favorites cart createdAt').sort({ createdAt: -1 }).skip((page - 1) * 15).limit(15).lean(),
  ]);
  res.json({ users: users.map((u) => ({ id: String(u._id), name: u.name, email: u.email, role: 'customer', verified: u.isEmailVerified,
    favorites: u.favorites?.length || 0, cartItems: (u.cart || []).reduce((sum, item) => sum + (item.quantity || 0), 0), createdAt: u.createdAt })), total, page, pages: Math.max(1, Math.ceil(total / 15)) });
});

router.get('/orders', async (req, res) => {
  const page = Math.min(10000, Math.max(1, Number.parseInt(req.query.page, 10) || 1));
  const [count, rows] = await Promise.all([
    Order.countDocuments(),
    Order.find().sort({ createdAt: -1 }).skip((page - 1) * 20).limit(20).lean(),
  ]);
  return res.json({ orders: rows.map((order) => ({ ...publicOrder(order), email: order.email })), page, pages: Math.max(1, Math.ceil(count / 20)), count });
});

router.get('/products', async (_req, res) => res.json({ products: await listCatalog() }));

router.post('/products', async (req, res) => {
  const { error, product } = validateProduct(req.body);
  if (error) return res.status(400).json({ message: error });
  const id = await nextProductId();
  const saved = await Product.create({ ...product, id });
  res.status(201).json({ product: saved.toObject() });
});
router.put('/products/:id', async (req, res) => {
  const id = parseProductId(req.params.id);
  if (!id) return res.status(400).json({ message: 'Ապրանքի ID-ն սխալ է։' });
  const { error, product } = validateProduct(req.body);
  if (error) return res.status(400).json({ message: error });
  const saved = await Product.findOneAndUpdate({ id }, { $set: product }, { new: true, runValidators: true }).lean();
  if (!saved) return res.status(404).json({ message: 'Ապրանքը չի գտնվել։' });
  res.json({ product: saved });
});
router.delete('/products/:id', async (req, res) => {
  const id = parseProductId(req.params.id);
  if (!id) return res.status(400).json({ message: 'Ապրանքի ID-ն սխալ է։' });
  const removed = await Product.deleteOne({ id });
  if (!removed.deletedCount) return res.status(404).json({ message: 'Ապրանքը չի գտնվել։' });
  // Remove deleted item from personal lists to prevent stale references.
  await Promise.all([
    User.updateMany({}, { $pull: { favorites: id, cart: { productId: id } } }),
    Review.deleteMany({ productId: id }),
  ]);
  res.json({ message: 'Ապրանքը հեռացվել է։' });
});

export default router;
