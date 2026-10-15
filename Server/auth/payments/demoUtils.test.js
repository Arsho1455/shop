import test from 'node:test';
import assert from 'node:assert/strict';
import { isSafeDemoCheckoutPayload } from './demoUtils.js';
import { cleanShipping, calculateOrder } from './checkoutUtils.js';

test('demo checkout request accepts only shipping and idempotency key', () => {
  assert.equal(isSafeDemoCheckoutPayload({ checkoutKey: 'uuid', shipping: {} }), true);
  for (const field of ['card', 'cardNumber', 'cvv', 'expiry', 'paymentDetails', 'cardholder', 'number']) {
    assert.equal(isSafeDemoCheckoutPayload({ checkoutKey: 'uuid', shipping: {}, [field]: '1234' }), false, field);
  }
  assert.equal(isSafeDemoCheckoutPayload(null), false);
  assert.equal(isSafeDemoCheckoutPayload([]), false);
});

test('shipping validation requires real delivery contact but no card fields', () => {
  const shipping = cleanShipping({ fullName: 'Demo Buyer', phone: '+374 99123456', city: 'Yerevan', street: 'Example 8' });
  assert.deepEqual(Object.keys(shipping).sort(), ['apartment','city','fullName','notes','phone','postalCode','region','street'].sort());
  assert.throws(() => cleanShipping({ fullName:'A', phone:'12', city:'Yerevan', street:'Example' }));
});

test('server calculates demo order amount from catalog prices only', () => {
  const quote = calculateOrder([{ productId: 7, quantity: 2, price: 1 }], [{ id: 7, name: 'Phone', price: 150000, image: 'img', stock: 8 }], 0);
  assert.equal(quote.total, 300000);
  assert.equal(quote.items[0].price, 150000);
});
