import test from 'node:test';
import assert from 'node:assert/strict';
import { validateProduct } from './productValidation.js';
const valid = { name:'Example phone',brand:'Acme',image:'https://example.com/img.png',price:120000,stock:7 };
test('product validation allows a correct record', () => {
  const { product } = validateProduct(valid);
  assert.equal(product.name, 'Example phone');
  assert.equal(product.price, 120000);
  assert.equal(product.tone, 'sky');
});
test('validation rejects malicious URLs, missing names, negative stock', () => {
  assert.ok(validateProduct({...valid, image:'javascript:alert(1)'}).error);
  assert.ok(validateProduct({...valid, name:' '}).error);
  assert.ok(validateProduct({...valid, stock:-1}).error);
});
test('cannot modify product identifier through supplied body', () => {
  const { product } = validateProduct({...valid,id:999,role:'admin'});
  assert.ok(!('id' in product));
  assert.ok(!('role' in product));
});
