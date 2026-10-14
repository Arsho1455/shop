import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { parseProductId, serializeShop, MAX_QUANTITY } from '../utils/shop.js';
import { Product } from '../../models/productModel.js';

const router = Router();
router.use(requireAuth);

function invalid(res) { return res.status(400).json({ message: 'Ապրանքի տվյալներն անվավեր են։' }); }

router.get('/', (req, res) => res.json(serializeShop(req.user)));

router.put('/favorites/:id', async (req, res) => {
  const id = parseProductId(req.params.id);
  if (!id || !await Product.exists({ id, stock: { $gt: 0 } })) return invalid(res);
  await req.user.updateOne({ $addToSet: { favorites: id } });
  // Return up-to-date content after atomic update.
  if (!req.user.favorites.includes(id)) req.user.favorites.push(id);
  return res.json(serializeShop(req.user));
});
router.delete('/favorites/:id', async (req, res) => {
  const id = parseProductId(req.params.id);
  if (!id) return invalid(res);
  await req.user.updateOne({ $pull: { favorites: id } });
  req.user.favorites = req.user.favorites.filter((entry) => entry !== id);
  return res.json(serializeShop(req.user));
});
router.delete('/favorites', async (req, res) => {
  await req.user.updateOne({ $set: { favorites: [] } });
  req.user.favorites = [];
  return res.json(serializeShop(req.user));
});

router.post('/cart/:id', async (req, res) => {
  const id = parseProductId(req.params.id);
  if (!id || !await Product.exists({ id, stock: { $gt: 0 } })) return invalid(res);
  const cart = req.user.cart || [];
  const existing = cart.find((item) => item.productId === id);
  if (existing) {
    existing.quantity = Math.min(MAX_QUANTITY, existing.quantity + 1);
  } else {
    cart.push({ productId: id, quantity: 1 });
  }
  await req.user.save();
  return res.json(serializeShop(req.user));
});
router.patch('/cart/:id', async (req, res) => {
  const id = parseProductId(req.params.id);
  const quantity = req.body?.quantity;
  if (!id || !Number.isInteger(quantity) || quantity < 0 || quantity > MAX_QUANTITY) return invalid(res);
  const existing = req.user.cart.find((item) => item.productId === id);
  if (!existing && quantity !== 0) return res.status(404).json({ message: 'Ապրանքը զամբյուղում չէ։' });
  if (quantity === 0) req.user.cart = req.user.cart.filter((item) => item.productId !== id);
  else existing.quantity = quantity;
  await req.user.save();
  return res.json(serializeShop(req.user));
});
router.delete('/cart/:id', async (req, res) => {
  const id = parseProductId(req.params.id);
  if (!id) return invalid(res);
  req.user.cart = req.user.cart.filter((item) => item.productId !== id);
  await req.user.save();
  return res.json(serializeShop(req.user));
});
router.delete('/cart', async (req, res) => {
  req.user.cart = [];
  await req.user.save();
  return res.json(serializeShop(req.user));
});

export default router;
