import test from 'node:test';
import assert from 'node:assert/strict';
import { ratingSummary, validateReview } from './reviewUtils.js';

test('review text length and rating must be valid', () => {
  assert.equal(validateReview({ rating: 5, comment: 'Excellent phone, works nicely!' }), null);
  assert.match(validateReview({ rating: 0, comment: 'Great mobile phone' }), /1–5/);
  assert.match(validateReview({ rating: 6, comment: 'Great mobile phone' }), /1–5/);
  assert.match(validateReview({ rating: '5', comment: 'Great mobile phone' }), /1–5/);
  assert.match(validateReview({ rating: 5, comment: 'short' }), /10–1000/);
  assert.match(validateReview({ rating: 5, comment: 'x'.repeat(1001) }), /10–1000/);
  assert.match(validateReview({ rating: 5, comment: 'good phone\u0001bad' }), /10–1000/);
});

test('ratings are calculated only from actual reviews', () => {
  assert.deepEqual(ratingSummary([]), { reviews: 0, rating: 0 });
  assert.deepEqual(ratingSummary([{ rating: 5 }, { rating: 4 }, { rating: 5 }]), { reviews: 3, rating: 4.7 });
});
