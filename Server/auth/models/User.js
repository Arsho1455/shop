import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    bio: { type: String, default: '', maxlength: 160 },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    favorites: { type: [Number], default: [] },
    cart: { type: [{ _id: false, productId: Number, quantity: Number }], default: [] },
    isEmailVerified: { type: Boolean, default: false },
    verificationTokenHash: { type: String, default: null, select: false },
    verificationTokenExpiresAt: { type: Date, default: null, select: false },
    resetPasswordTokenHash: { type: String, default: null, select: false },
    resetPasswordTokenExpiresAt: { type: Date, default: null, select: false },
    sessionVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
