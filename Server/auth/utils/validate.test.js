import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeEmail, validEmail, validName, validPassword } from './validate.js';

test('email normalization and validation', () => {
  assert.equal(normalizeEmail('  Vahe@Example.Com '), 'vahe@example.com');
  assert.equal(validEmail('vahe@example.com'), true);
  assert.equal(validEmail('bad@'), false);
});

test('name validation', () => {
  assert.equal(validName('Vahe'), true);
  assert.equal(validName('A'), false);
  assert.equal(validName('x'.repeat(61)), false);
});

test('bcrypt byte restriction', () => {
  assert.equal(validPassword('secure123'), true);
  assert.equal(validPassword('1234567'), false);
  assert.equal(validPassword('ա'.repeat(40)), false);
});
