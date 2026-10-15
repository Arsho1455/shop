import test from 'node:test';
import assert from 'node:assert/strict';
import { demoCardValid, formatDemoCard, formatDemoExpiry, SAMPLE_CARD } from './demoCard.js';

test('only known sample card details are accepted', () => {
  assert.equal(demoCardValid(SAMPLE_CARD), true);
  assert.equal(demoCardValid({ ...SAMPLE_CARD, number: '4111 1111 1111 1111' }), false);
  assert.equal(demoCardValid({ ...SAMPLE_CARD, cvv: '999' }), false);
  assert.equal(demoCardValid({ ...SAMPLE_CARD, expiry: '01/29' }), false);
});
test('sample field formatting caps length', () => {
  assert.equal(formatDemoCard('424242424242424288'), '4242 4242 4242 4242');
  assert.equal(formatDemoExpiry('123099'), '12/30');
});
