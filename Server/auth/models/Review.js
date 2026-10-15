import mongoose from 'mongoose';

// Only authenticated users can publish a review. One review per user/product.
const reviewSchema = new mongoose.Schema({
  productId: { type: Number, required: true, min: 1, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true, trim: true, maxlength: 60 },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true, minlength: 10, maxlength: 1000 },
}, { timestamps: true, collection: 'product_reviews' });

reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
reviewSchema.index({ productId: 1, createdAt: -1 });
export const Review = mongoose.model('Review', reviewSchema);
