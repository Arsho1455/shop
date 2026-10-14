import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { connectDB } from '../config/db.js';
import { AdminAccount } from '../auth/models/AdminAccount.js';
import { promptPasswordTwice, requireEmailArgument } from './adminCli.mjs';

try {
  const email = requireEmailArgument('npm run admin:create -- admin@example.com');
  await connectDB();
  if (await AdminAccount.exists({ email })) {
    throw new Error('Այս email-ով ադմինի հաշիվ արդեն կա։ Գաղտնաբառը փոխելու համար օգտագործիր admin:password հրամանը։');
  }
  const password = await promptPasswordTwice();
  const passwordHash = await bcrypt.hash(password, 12);
  await AdminAccount.create({ email, passwordHash, name: 'Administrator' });
  console.log(`✅ Առանձին ադմինի հաշիվը ստեղծված է՝ ${email}`);
  console.log('Բացիր՝ http://localhost:5173/admin/login');
} catch (error) {
  console.error('❌', error.code === 11000 ? 'Այս email-ով ադմինի հաշիվ արդեն կա։' : error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
