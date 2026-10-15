import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true, immutable: true },
  checkoutKey: { type: String, required: true, unique: true, immutable: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  email: { type: String, required: true },
  shipping: {
    fullName: String, phone: String, region: String, city: String,
    street: String, apartment: String, postalCode: String, notes: String,
  },
  items: [{ _id: false, productId: Number, name: String, image: String, price: Number, quantity: Number }],
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true },
  currency: { type: String, default: 'AMD', immutable: true },
  status: { type: String, enum: ['pending_payment', 'payment_setup_failed', 'paid', 'failed', 'refunded', 'demo_completed'], default: 'pending_payment', index: true },
  paymentMethod: { type: String, enum: ['demo_card', 'provider'], default: 'demo_card' },
  demoCompletedAt: { type: Date, default: null },
  providerPaymentId: { type: String, default: '' },
  providerCheckoutUrl: { type: String, default: '' },
  paidAt: { type: Date, default: null },
  inventoryIssue: { type: Boolean, default: false },
}, { timestamps: true });
orderSchema.index({ userId: 1, createdAt: -1 });
export const Order = mongoose.model('Order', orderSchema);

export function publicOrder(order) {
  const row = typeof order.toObject === 'function' ? order.toObject() : order;
  return {
    id: String(row._id), orderNumber: row.orderNumber, items: row.items,
    subtotal: row.subtotal, deliveryFee: row.deliveryFee, total: row.total, currency: 'AMD',
    status: row.status, paymentMethod: row.paymentMethod, shipping: row.shipping, createdAt: row.createdAt, paidAt: row.paidAt,
    inventoryIssue: row.inventoryIssue,
  };
}
