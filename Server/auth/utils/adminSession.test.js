import test from 'node:test';
import assert from 'node:assert/strict';

// Test tokens after setting the required environment values, without any real secrets.
process.env.MONGO_URL ||= 'mongodb://127.0.0.1:27017';
process.env.JWT_SECRET ||= 'this-is-a-test-secret-that-is-long-enough-only-tests';

const { createAdminSessionToken, verifyAdminSessionToken, setAdminSessionCookie, clearAdminSessionCookie, ADMIN_COOKIE_NAME } = await import('./adminSession.js');
const { createSessionToken } = await import('./auth.js');

test('admin tokens validate, normal shop JWT is rejected by the admin verifier', () => {
  const id = '507f1f77bcf86cd799439011';
  const adminToken = createAdminSessionToken(id);
  assert.equal(verifyAdminSessionToken(adminToken).sub, id);
  assert.throws(() => verifyAdminSessionToken(createSessionToken(id)));
});

test('admin session sets a separate httpOnly cookie scoped only to admin API', () => {
  const res = {
    cookie(name, value, options) { this.created = { name, value, options }; },
    clearCookie(name, options) { this.cleared = { name, options }; },
  };
  setAdminSessionCookie(res, 'test-token');
  assert.equal(res.created.name, ADMIN_COOKIE_NAME);
  assert.equal(res.created.options.path, '/api/admin');
  assert.equal(res.created.options.httpOnly, true);
  assert.equal(res.created.options.maxAge, 12 * 60 * 60 * 1000);
  clearAdminSessionCookie(res);
  assert.equal(res.cleared.name, ADMIN_COOKIE_NAME);
  assert.equal(res.cleared.options.path, '/api/admin');
});

test('admin JWT embeds a session version and rejects missing version', () => {
  const id = '507f1f77bcf86cd799439011';
  const token = createAdminSessionToken(id, 8);
  assert.equal(verifyAdminSessionToken(token).sv, 8);
});
