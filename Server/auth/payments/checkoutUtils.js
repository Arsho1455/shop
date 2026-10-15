import { MAX_QUANTITY, parseProductId } from '../utils/shop.js';

const short = (value, max) => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max && !/[<>]/.test(value);
export function cleanShipping(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Լրացրու առաքման տվյալները։');
  const required = { fullName: 80, phone: 25, city: 90, street: 160 };
  const data = {};
  for (const [field, max] of Object.entries(required)) {
    if (!short(input[field], max)) throw new Error('Լրացրու առաքման բոլոր պարտադիր դաշտերը։');
    data[field] = input[field].trim();
  }
  if (!/^[+()\d\s-]{7,25}$/.test(data.phone) || data.phone.replace(/\D/g, '').length < 7) throw new Error('Հեռախոսահամարը սխալ է։');
  for (const [field, max] of Object.entries({ region: 90, apartment: 80, postalCode: 20, notes: 400 })) {
    const value = input[field] ?? '';
    if (typeof value !== 'string' || value.length > max || /[<>]/.test(value)) throw new Error('Առաքման տվյալներն անվավեր են։');
    data[field] = value.trim();
  }
  return data;
}
export function calculateOrder(cart, catalog, deliveryFee = 0) {
  if (!Array.isArray(cart) || !cart.length || cart.length > 40) throw new Error('Զամբյուղը դատարկ է կամ չափազանց մեծ։');
  const productMap = new Map(catalog.map((item) => [Number(item.id), item]));
  const ids = new Set();
  const items = cart.map((entry) => {
    const productId = parseProductId(entry.productId);
    const quantity = entry.quantity;
    if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY || ids.has(productId)) throw new Error('Զամբյուղի ապրանքները սխալ են։');
    ids.add(productId);
    const product = productMap.get(productId);
    if (!product || !Number.isSafeInteger(product.price) || product.price <= 0 || !Number.isInteger(product.stock) || product.stock < quantity) {
      throw new Error('Ապրանքներից մեկը սպառվել է կամ գինը փոխվել է։ Ստուգիր զամբյուղը։');
    }
    return { productId, name: product.name, image: product.image, price: product.price, quantity };
  });
  const subtotal = items.reduce((sum, entry) => sum + entry.price * entry.quantity, 0);
  if (!Number.isSafeInteger(subtotal) || !Number.isSafeInteger(deliveryFee) || deliveryFee < 0 || !Number.isSafeInteger(subtotal + deliveryFee)) throw new Error('Պատվերի գումարն անվավեր է։');
  return { items, subtotal, deliveryFee, total: subtotal + deliveryFee };
}
