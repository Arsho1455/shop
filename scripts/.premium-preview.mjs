// Temporary, local-only visual fixtures. Never connects to the real API.
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import { products } from '../Client/src/shop/catalog.js';

const customer = {
  id: 'preview-customer', name: 'Preview User', email: 'preview@example.test',
  role: 'customer', bio: 'A fictional profile for the local visual preview.',
  isEmailVerified: true, createdAt: '2026-09-18T10:00:00.000Z',
};
const admin = {
  id: 'preview-admin', name: 'Preview Admin', email: 'admin@example.test',
  role: 'admin', createdAt: '2026-08-01T09:00:00.000Z',
};
const people = [
  { ...customer, favorites: 2, cartItems: 3 },
  { id: 'preview-customer-2', name: 'Demo Customer', email: 'customer@example.test', role: 'customer', isEmailVerified: true, favorites: 3, cartItems: 1, createdAt: '2026-10-16T09:30:00.000Z' },
  { id: 'preview-customer-3', name: 'Sample Member', email: 'member@example.test', role: 'customer', isEmailVerified: false, favorites: 1, cartItems: 2, createdAt: '2026-10-14T11:20:00.000Z' },
  { id: 'preview-customer-4', name: 'Preview Shopper', email: 'shopper@example.test', role: 'customer', isEmailVerified: true, favorites: 4, cartItems: 0, createdAt: '2026-10-10T14:45:00.000Z' },
];
const lineItem = (id, quantity) => {
  const product = products.find((item) => item.id === id);
  return { productId: id, name: product.name, image: product.image, price: product.price, quantity };
};
const makeOrder = (id, orderNumber, items, createdAt, person = customer) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return {
    id, orderNumber, items, subtotal, deliveryFee: 0, total: subtotal, currency: 'AMD',
    status: 'demo_completed', paymentMethod: 'demo_card', createdAt, paidAt: null, inventoryIssue: false,
    email: person.email,
    shipping: { fullName: person.name, phone: '+374 00 000000', region: 'Preview region', city: 'Yerevan', street: 'Preview street 1', apartment: '12', postalCode: '0001', notes: '' },
  };
};
const orders = [
  makeOrder('000000000000000000000001', 'DEMO-PREVIEW1', [lineItem(1, 1), lineItem(2, 1)], '2026-10-18T12:30:00.000Z'),
  makeOrder('000000000000000000000002', 'DEMO-PREVIEW2', [lineItem(3, 1)], '2026-10-12T08:10:00.000Z', people[1]),
];

function send(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-PhoneShop-Preview', 'fictional-read-only-fixture');
  res.end(JSON.stringify(data));
}

const fixturePlugin = {
  name: 'local-read-only-premium-preview',
  enforce: 'pre',
  configureServer(server) {
    // Installed before Vite's internal handlers; no real backend proxy exists.
    server.middlewares.use((req, res, next) => {
      if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return send(res, 405, { message: 'Read-only local preview: all submissions are disabled.' });
      }
      const url = new URL(req.url, 'http://127.0.0.1:5178');
      if (!url.pathname.startsWith('/api/')) return next();
      let empty = url.searchParams.get('empty') === '1';
      try { empty ||= new URL(req.headers.referer || 'http://127.0.0.1:5178').searchParams.get('empty') === '1'; } catch { /* Ignore an absent or malformed referrer. */ }
      const selectedOrders = empty ? [] : orders;
      switch (url.pathname) {
        case '/api/auth/me': return send(res, 200, { user: customer });
        case '/api/products': return send(res, 200, { products });
        case '/api/shop': return send(res, 200, { favorites: empty ? [] : [1, 3], cart: empty ? [] : [{ productId: 1, quantity: 1 }, { productId: 2, quantity: 2 }] });
        case '/api/orders/settings': return send(res, 200, { demoMode: true, demoEnabled: true, deliveryFee: 0 });
        case '/api/orders': return send(res, 200, { orders: selectedOrders });
        case '/api/admin/auth/me': return send(res, 200, { authenticated: true, user: admin });
        case '/api/admin/products': return send(res, 200, { products });
        case '/api/admin/stats': return send(res, 200, {
          users: 1248, verified: 1164, admins: 2, products: products.length,
          lowStock: products.filter((product) => product.stock <= 5).length, cartItems: 38,
          latestUsers: people.map((person) => ({ _id: person.id, name: person.name, email: person.email, isEmailVerified: person.isEmailVerified, role: 'customer', createdAt: person.createdAt })),
        });
        case '/api/admin/users': {
          const query = (url.searchParams.get('q') || '').toLowerCase();
          const users = people.filter((person) => `${person.name} ${person.email}`.toLowerCase().includes(query)).map((person) => ({ ...person, verified: person.isEmailVerified }));
          return send(res, 200, { users, total: users.length, page: 1, pages: 1 });
        }
        case '/api/admin/orders': return send(res, 200, { orders: selectedOrders, count: selectedOrders.length, page: 1, pages: 1 });
        default: {
          const orderMatch = url.pathname.match(/^\/api\/orders\/([^/]+)$/);
          if (orderMatch) {
            const order = selectedOrders.find((item) => item.id === decodeURIComponent(orderMatch[1]));
            return order ? send(res, 200, { order }) : send(res, 404, { message: 'Preview order not found.' });
          }
          const productMatch = url.pathname.match(/^\/api\/products\/(\d+)$/);
          if (productMatch) {
            const product = products.find((item) => item.id === Number(productMatch[1]));
            return product ? send(res, 200, { product }) : send(res, 404, { message: 'Preview product not found.' });
          }
          if (/^\/api\/products\/\d+\/reviews$/.test(url.pathname)) return send(res, 200, { reviews: [], total: 0, page: 1, hasMore: false });
          if (/^\/api\/products\/\d+\/reviews\/mine$/.test(url.pathname)) return send(res, 200, { review: null });
          return send(res, 404, { message: 'Unknown endpoint in the local visual preview.' });
        }
      }
    });
  },
};

const server = await createServer({
  configFile: false,
  envDir: false,
  root: fileURLToPath(new URL('../Client/', import.meta.url)),
  plugins: [fixturePlugin, react()],
  define: { 'import.meta.env.VITE_API_URL': JSON.stringify('') },
  server: { host: '127.0.0.1', port: 5178, strictPort: true },
});
await server.listen();
console.log('Read-only fictional PhoneShop preview: http://127.0.0.1:5178/');
console.log('Order result: /checkout/result?order=000000000000000000000001');
console.log('Empty account state: /profile/cart?empty=1');
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => { await server.close(); process.exit(0); });
}
