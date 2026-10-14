import mongoose from 'mongoose';

// Administrative identities are independent of the storefront User collection.
// In particular, a customer with the same email has no access to this account.
const adminAccountSchema = new mongoose.Schema({
  name: { type: String, default: 'Administrator', trim: true, minlength: 2, maxlength: 60 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  isActive: { type: Boolean, default: true },
  // Allows a password reset to invalidate all existing admin JWTs.
  sessionVersion: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

export const AdminAccount = mongoose.model('AdminAccount', adminAccountSchema);
