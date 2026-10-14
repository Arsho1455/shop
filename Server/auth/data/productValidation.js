const fields = {
  name: [2, 120], brand: [1, 70], storage: [0, 40], color: [0, 40],
  image: [1, 2000], description: [0, 1500], tag: [0, 50],
};

export function validateProduct(input) {
  const result = {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { error: 'Ապրանքի տվյալները սխալ են։' };
  for (const [key, [min, max]] of Object.entries(fields)) {
    const value = input[key] ?? '';
    if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max) {
      return { error: `${key} դաշտը սխալ է։` };
    }
    result[key] = value.trim();
  }
  if (!/^https?:\/\/[^\s]+$/i.test(result.image)) return { error: 'Նկարի հասցեն պետք է սկսվի http:// կամ https://-ով։' };
  for (const [key, min, max, integer] of [
    ['price', 0, 1000000000, false], ['oldPrice', 0, 1000000000, false],
    ['stock', 0, 1000000, true],
  ]) {
    const value = input[key] === '' || input[key] == null ? (key === 'oldPrice' ? 0 : NaN) : Number(input[key]);
    if (!Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) {
      return { error: `${key} դաշտը սխալ է։` };
    }
    result[key] = value;
  }
  result.tone = ['peach', 'sky', 'lilac', 'mint'].includes(input.tone) ? input.tone : 'sky';
  return { product: result };
}
