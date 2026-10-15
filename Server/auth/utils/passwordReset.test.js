import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';

// All integration tests use an in-memory model stub: no database, emails or secrets.
process.env.MONGO_URL ||= 'mongodb://127.0.0.1:27017';
process.env.JWT_SECRET ||= 'this-is-a-test-secret-that-is-long-enough-only-tests';
process.env.FRONTEND_URL ||= 'http://localhost:5173';
const { createPasswordResetToken, createSessionToken, hashPasswordResetToken } = await import('./auth.js');
const { User } = await import('../models/User.js');
const { default: app } = await import('../../app.js');

test('password reset tokens are random, hashed and expire after an hour', () => {
  const a = createPasswordResetToken();
  const b = createPasswordResetToken();
  assert.match(a.token, /^[a-f0-9]{64}$/);
  assert.equal(a.hash, hashPasswordResetToken(a.token));
  assert.notEqual(a.hash, a.token);
  assert.notEqual(a.token, b.token);
  const durationMs = a.expiresAt.getTime() - Date.now();
  assert.ok(durationMs <= 3600000 && durationMs > 3590000);
});

test('unknown reset emails are not disclosed to visitors', async () => {
  const originalFind = User.findOne;
  User.findOne = async () => null;
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
      body: JSON.stringify({ email: 'unknown@example.com' }),
    });
    assert.equal(response.status, 200);
    assert.match((await response.json()).message, /Եթե տվյալ/);
  } finally {
    User.findOne = originalFind;
    await new Promise((resolve) => server.close(resolve));
  }
});

test('reset token changes a password once and invalidates older sessions', async () => {
  const token = createPasswordResetToken();
  const accountId = '507f1f77bcf86cd799439011';
  const account = {
    _id: accountId,
    email: 'customer@example.com',
    name: 'Customer',
    isEmailVerified: true,
    sessionVersion: 0,
    resetPasswordTokenHash: token.hash,
    resetPasswordTokenExpiresAt: token.expiresAt,
  };
  const originalUpdate = User.findOneAndUpdate;
  const originalFindById = User.findById;
  User.findById = async () => account;
  User.findOneAndUpdate = async (filter, update) => {
    if (filter.resetPasswordTokenHash !== account.resetPasswordTokenHash ||
        account.resetPasswordTokenExpiresAt <= filter.resetPasswordTokenExpiresAt.$gt) return null;
    account.passwordHash = update.$set.passwordHash;
    account.resetPasswordTokenHash = undefined;
    account.resetPasswordTokenExpiresAt = undefined;
    account.sessionVersion += update.$inc.sessionVersion;
    return account;
  };
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const session = createSessionToken(accountId, 0);
  try {
    const before = await fetch(`${base}/api/auth/me`, { headers: { Cookie: `armauth_session=${session}` } });
    assert.equal((await before.json()).authenticated, true);

    const options = { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' }, body: JSON.stringify({ token: token.token, password: 'a-brand-new-password' }) };
    const response = await fetch(`${base}/api/auth/reset-password`, options);
    assert.equal(response.status, 200);
    assert.equal(await bcrypt.compare('a-brand-new-password', account.passwordHash), true);
    assert.equal(account.sessionVersion, 1);
    assert.equal(account.resetPasswordTokenHash, undefined);

    const reused = await fetch(`${base}/api/auth/reset-password`, options);
    assert.equal(reused.status, 400);
    const after = await fetch(`${base}/api/auth/me`, { headers: { Cookie: `armauth_session=${session}` } });
    assert.equal((await after.json()).authenticated, false);
  } finally {
    User.findOneAndUpdate = originalUpdate;
    User.findById = originalFindById;
    await new Promise((resolve) => server.close(resolve));
  }
});
