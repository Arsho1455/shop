import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAdminPassword } from './adminCli.mjs';

test('admin setup password length constraints', () => {
  assert.equal(validateAdminPassword('short1'), false);
  assert.equal(validateAdminPassword('strong-password-2026'), true);
  assert.equal(validateAdminPassword('a'.repeat(73)), false);
  assert.equal(validateAdminPassword('a'.repeat(12) + '\n'), false);
});
