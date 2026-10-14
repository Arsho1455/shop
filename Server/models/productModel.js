import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, min: 1 },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  brand: { type: String, required: true, trim: true, maxlength: 70 },
  price: { type: Number, required: true, min: 0 },
  oldPrice: { type: Number, default: 0, min: 0 },
  stock: { type: Number, required: true, min: 0 },
  image: { type: String, required: true, maxlength: 2000 },
  storage: { type: String, default: '', maxlength: 40 },
  color: { type: String, default: '', maxlength: 40 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviews: { type: Number, default: 0, min: 0 },
  description: { type: String, default: '', maxlength: 1500 },
  tag: { type: String, default: '', maxlength: 50 },
  tone: { type: String, enum: ['peach', 'sky', 'lilac', 'mint'], default: 'sky' },
}, { timestamps: true, collection: 'products' });

// Partial unique index leaves legacy MongoDB products without a numeric id untouched.
productSchema.index({ id: 1 }, { unique: true, partialFilterExpression: { id: { $type: 'number' } } });
export const Product = mongoose.model('Product', productSchema);
