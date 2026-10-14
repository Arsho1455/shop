import { Router } from 'express';
import { getProducts, getProductById } from '../controllers/productController.js';

// Original Shop.project endpoints are kept for existing integrations (read-only).
// All catalogue writes must now go through authenticated /api/admin/products.
const router = Router();
router.get('/', getProducts);
router.get('/:id', getProductById);
router.use((_req, res) => res.status(405).json({ message: 'Կառավարումն իրականացվում է միայն Admin Panel-ից։' }));
export default router;
