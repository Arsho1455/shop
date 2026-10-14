import test from 'node:test';
import assert from 'node:assert/strict';
import { publicAdmin } from './publicAdmin.js';

test('publicAdmin does not expose the passwordHash or sessionVersion', () => {
  const user = publicAdmin({ _id: 'test-id', name: 'Administrator', email: 'admin@example.com', passwordHash: 'secret', sessionVersion: 3 });
  assert.deepEqual(user, { id: 'test-id', name: 'Administrator', email: 'admin@example.com', role: 'admin', createdAt: undefined });
  assert.equal(JSON.stringify(user).includes('secret'), false);
});
