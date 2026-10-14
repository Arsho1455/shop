import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { connectDB } from '../config/db.js';
import { AdminAccount } from '../auth/models/AdminAccount.js';
import { promptPasswordTwice, requireEmailArgument } from './adminCli.mjs';

try {
  const email = requireEmailArgument('npm run admin:password -- admin@example.com');
  await connectDB();
  const admin = await AdminAccount.findOne({ email });
  if (!admin) throw new Error('Այս email-ով ադմինիստրատոր չկա։');
  const password = await promptPasswordTwice();
  admin.passwordHash = await bcrypt.hash(password, 12);
  admin.sessionVersion = (admin.sessionVersion || 0) + 1;
  await admin.save();
  console.log('✅ Գաղտնաբառը փոխվեց։ Հին ադմին սեսիաները անվավեր են։');
} catch (error) {
  console.error('❌', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
