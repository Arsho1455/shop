import mongoose from 'mongoose';
import { Product } from '../../models/productModel.js';
import { Review } from '../models/Review.js';
import { defaultProducts } from './defaultProducts.js';
export { validateProduct } from './productValidation.js';

const PUBLIC_FIELDS = 'id name brand price oldPrice stock image storage color rating reviews description tag tone';
// Live ratings come from user-submitted reviews, never from demo seed numbers.
export async function reviewStats(productIds) {
  if (!productIds.length) return new Map();
  const rows = await Review.aggregate([
    { $match: { productId: { $in: productIds } } },
    { $group: { _id: '$productId', count: { $sum: 1 }, average: { $avg: '$rating' } } },
  ]);
  return new Map(rows.map((row) => [row._id, { reviews: row.count, rating: Math.round(row.average * 10) / 10 }]));
}
export async function listCatalog() {
  const products = await Product.find({ id: { $exists: true } }).select(PUBLIC_FIELDS).sort({ id: 1 }).lean();
  const stats = await reviewStats(products.map((item) => item.id));
  return products.map((item) => ({ ...item, ...(stats.get(item.id) || { rating: 0, reviews: 0 }) }));
}

// Insert starter entries once, never repopulate products removed by an administrator.
export async function initializeCatalog() {
  const meta = mongoose.connection.db.collection('shop_meta');
  const state = await meta.findOne({ _id: 'catalog_seed_v1' });
  if (!state) {
    for (const product of defaultProducts) {
      await Product.updateOne({ id: product.id }, { $setOnInsert: product }, { upsert: true });
    }
    await meta.updateOne({ _id: 'catalog_seed_v1' }, { $set: { done: true } }, { upsert: true });
  }
  const maxProduct = await Product.findOne({ id: { $type: 'number' } }).sort({ id: -1 }).select('id').lean();
  await meta.updateOne({ _id: 'product_sequence' }, { $max: { seq: Math.max(4, maxProduct?.id || 4) } }, { upsert: true });
}

export async function nextProductId() {
  const row = await mongoose.connection.db.collection('shop_meta').findOneAndUpdate(
    { _id: 'product_sequence' }, { $inc: { seq: 1 } }, { returnDocument: 'after' }
  );
  // MongoDB driver 6+ returns document, not {value: document}.
  return row.seq;
}

