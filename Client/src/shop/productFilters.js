export function filterAndSortProducts(products, filters = {}) {
  const {
    brand = '', query = '', storage = '', color = '', minPrice = '', maxPrice = '',
    minRating = '', inStock = false, onSale = false, sortBy = 'default',
  } = filters;
  const search = String(query).trim().toLocaleLowerCase();
  const lower = minPrice === '' ? null : Number(minPrice);
  const upper = maxPrice === '' ? null : Number(maxPrice);
  const ratingMinimum = minRating === '' ? null : Number(minRating);
  const visible = products.filter((item) => {
    if (brand && brand !== 'Բոլորը' && item.brand !== brand) return false;
    if (search && !`${item.name} ${item.brand} ${item.storage} ${item.color}`.toLocaleLowerCase().includes(search)) return false;
    if (storage && item.storage !== storage) return false;
    if (color && item.color !== color) return false;
    if (lower !== null && Number.isFinite(lower) && item.price < lower) return false;
    if (upper !== null && Number.isFinite(upper) && item.price > upper) return false;
    if (ratingMinimum !== null && (Number(item.reviews) <= 0 || item.rating < ratingMinimum)) return false;
    if (inStock && item.stock <= 0) return false;
    if (onSale && !(item.oldPrice > item.price)) return false;
    return true;
  });
  const sorts = {
    priceLow: (a, b) => a.price - b.price,
    priceHigh: (a, b) => b.price - a.price,
    ratingHigh: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
    newest: (a, b) => b.id - a.id,
    name: (a, b) => a.name.localeCompare(b.name),
  };
  return sorts[sortBy] ? visible.sort(sorts[sortBy]) : visible;
}
