import test from 'node:test';
import assert from 'node:assert/strict';
import { filterAndSortProducts } from './productFilters.js';
const products = [
  { id: 1, name: 'iPhone 15', brand: 'Apple', storage: '128GB', color: 'Black', price: 340000, oldPrice: 390000, rating: 4.5, reviews: 5, stock: 2 },
  { id: 2, name: 'Galaxy S24', brand: 'Samsung', storage: '256GB', color: 'Gray', price: 250000, oldPrice: 250000, rating: 0, reviews: 0, stock: 0 },
  { id: 3, name: 'iPhone 14', brand: 'Apple', storage: '256GB', color: 'Purple', price: 290000, oldPrice: 320000, rating: 4, reviews: 1, stock: 10 },
];
test('filter by brand, memory, price, availability, discount and rating', () => {
  assert.deepEqual(filterAndSortProducts(products, { brand: 'Apple', minPrice: '300000' }).map(x => x.id), [1]);
  assert.deepEqual(filterAndSortProducts(products, { storage: '256GB', inStock: true }).map(x => x.id), [3]);
  assert.deepEqual(filterAndSortProducts(products, { maxPrice: '300000', onSale: true }).map(x => x.id), [3]);
  assert.deepEqual(filterAndSortProducts(products, { minRating: '4.4' }).map(x => x.id), [1]);
  assert.deepEqual(filterAndSortProducts(products, { query: 'galaxy' }).map(x => x.id), [2]);
  assert.deepEqual(filterAndSortProducts(products, { color: 'Black' }).map(x => x.id), [1]);
});
test('sort by prices and ratings without mutating the original array', () => {
  assert.deepEqual(filterAndSortProducts(products, { sortBy: 'priceLow' }).map(x => x.id), [2, 3, 1]);
  assert.deepEqual(filterAndSortProducts(products, { sortBy: 'ratingHigh' }).map(x => x.id), [1, 3, 2]);
  assert.deepEqual(products.map(x => x.id), [1, 2, 3]);
});
