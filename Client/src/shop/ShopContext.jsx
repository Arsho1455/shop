import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/context/AuthContext.jsx';
import { api } from '../auth/lib/api.js';
import { useCatalog } from './CatalogContext.jsx';

const ShopContext = createContext(null);
function hydrate(payload, byId) {
  return {
    favorites: (Array.isArray(payload?.favorites) ? payload.favorites : [])
      .map((id) => byId.get(Number(id))).filter(Boolean),
    cart: (Array.isArray(payload?.cart) ? payload.cart : [])
      .map((entry) => {
        const product = byId.get(Number(entry.productId));
        return product && Number.isInteger(entry.quantity) && entry.quantity > 0
          ? { ...product, quantity: entry.quantity } : null;
      }).filter(Boolean),
  };
}

export function ShopProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { products } = useCatalog();
  const byId = new Map(products.map((product) => [Number(product.id), product]));
  const [state, setState] = useState({ favorites: [], cart: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const userRef = useRef(user?.id);
  userRef.current = user?.id;
  const busyRef = useRef(false);

  useEffect(() => {
    let active = true;
    // Account-specific lists must never be shown to a different user/guest.
    setState({ favorites: [], cart: [] });
    setError('');
    if (authLoading) return () => { active = false; };
    if (!user?.id) { setLoading(false); return () => { active = false; }; }
    setLoading(true);
    api('/api/shop')
      .then((payload) => { if (active) setState(hydrate(payload, byId)); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user?.id, authLoading, products]);

  const mutate = useCallback(async (path, method, body) => {
    if (!userRef.current) throw new Error('Գնումներ կատարելու համար մուտք գործիր։');
    if (busyRef.current) return false;
    busyRef.current = true;
    setBusy(true);
    setError('');
    const ownerId = userRef.current;
    try {
      const payload = await api(path, { method, ...(body === undefined ? {} : { body }) });
      if (userRef.current === ownerId) setState(hydrate(payload, byId));
      return true;
    } catch (err) {
      if (userRef.current === ownerId) setError(err.message);
      throw err;
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [products]);

  const refreshShop = useCallback(async () => {
    if (!userRef.current) return;
    const ownerId = userRef.current;
    const payload = await api('/api/shop');
    if (userRef.current === ownerId) setState(hydrate(payload, byId));
  }, [products]);

  const addToCart = (product) => mutate(`/api/shop/cart/${Number(product.id)}`, 'POST');
  const setCartQuantity = (id, quantity) => mutate(`/api/shop/cart/${Number(id)}`, 'PATCH', { quantity });
  const removeFromCart = (id) => mutate(`/api/shop/cart/${Number(id)}`, 'DELETE');
  const clearCart = () => mutate('/api/shop/cart', 'DELETE');
  const toggleFavorite = async (product) => {
    const selected = state.favorites.some((item) => item.id === product.id);
    const ok = await mutate(`/api/shop/favorites/${Number(product.id)}`, selected ? 'DELETE' : 'PUT');
    return ok ? !selected : selected;
  };
  const removeFavorite = (id) => mutate(`/api/shop/favorites/${Number(id)}`, 'DELETE');
  const clearFavorites = () => mutate('/api/shop/favorites', 'DELETE');
  const isFavorite = (id) => state.favorites.some((item) => String(item.id) === String(id));

  return <ShopContext.Provider value={{
    ...state, loading: loading || authLoading, busy, error,
    refreshShop, addToCart, setCartQuantity, removeFromCart, clearCart,
    toggleFavorite, removeFavorite, clearFavorites, isFavorite,
  }}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop requires ShopProvider');
  return ctx;
}
