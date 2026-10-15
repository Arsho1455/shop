import { Router } from 'express';
import { Product } from '../../models/productModel.js';
import { listCatalog, reviewStats } from '../data/catalogService.js';
import reviewRoutes from './reviews.js';
import { parseProductId } from '../utils/shop.js';

const router = Router();
router.get('/', async (_req, res) => res.json({ products: await listCatalog() }));
router.use('/:id/reviews', reviewRoutes);
router.get('/:id', async (req, res) => {
  const id = parseProductId(req.params.id);
  if (!id) return res.status(400).json({ message: 'Սխալ ID։' });
  const product = await Product.findOne({ id }).lean();
  if (!product) return res.status(404).json({ message: 'Ապրանքը չի գտնվել։' });
  const stats = await reviewStats([id]);
  return res.json({ product: { ...product, ...(stats.get(id) || { rating: 0, reviews: 0 }) } });
});
export default router;
