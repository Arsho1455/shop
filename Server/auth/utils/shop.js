// Product IDs are positive, safe integers; existence is verified against MongoDB for additions.
export const MAX_QUANTITY = 99;

export function parseProductId(value) {
  if (!/^[1-9]\d*$/.test(String(value))) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

export function serializeShop(user) {
  return {
    favorites: (user.favorites || []).map(Number).filter((id) => parseProductId(id) !== null),
    cart: (user.cart || []).filter((item) => parseProductId(item.productId) !== null)
      .map((item) => ({ productId: Number(item.productId), quantity: Number(item.quantity) }))
      .filter((item) => Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= MAX_QUANTITY),
  };
}
