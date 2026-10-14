import test from 'node:test';
import assert from 'node:assert/strict';
import { MAX_QUANTITY, parseProductId, serializeShop } from './shop.js';

test('only positive integer product IDs are accepted', () => {
  for (const id of ['1', 1, '2', '3', 4]) assert.equal(parseProductId(id), Number(id));
  for (const id of ['0', '-1', '2.5', '4x', '01', '', '999999999999999999999999']) assert.equal(parseProductId(id), null);
});

test('shop response exposes only catalogue IDs and valid quantities', () => {
  assert.deepEqual(serializeShop({ favorites: [1, -99, 2], cart: [
    { productId: 1, quantity: 3 }, { productId: -9, quantity: 3 },
    { productId: 2, quantity: 0 }, { productId: 3, quantity: MAX_QUANTITY + 1 },
  ] }), { favorites: [1, 2], cart: [{ productId: 1, quantity: 3 }] });
});

test('empty account state is supported', () => {
  assert.deepEqual(serializeShop({}), { favorites: [], cart: [] });
});
