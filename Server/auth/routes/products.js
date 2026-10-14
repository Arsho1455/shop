import { Router } from 'express';
import { Product } from '../../models/productModel.js';
import { listCatalog } from '../data/catalogService.js';
import { parseProductId } from '../utils/shop.js';

const router = Router();
router.get('/', async (_req, res) => res.json({ products: await listCatalog() }));
router.get('/:id', async (req, res) => {
  const id = parseProductId(req.params.id);
  if (!id) return res.status(400).json({ message: 'Սխալ ID։' });
  const product = await Product.findOne({ id }).lean();
  return product ? res.json({ product }) : res.status(404).json({ message: 'Ապրանքը չի գտնվել։' });
});
export default router;
