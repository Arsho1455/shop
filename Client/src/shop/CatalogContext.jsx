import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../auth/lib/api.js';
import { products as exampleProducts } from './catalog.js';

const CatalogContext = createContext(null);
export function CatalogProvider({ children }) {
  const [products, setProducts] = useState(exampleProducts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refreshCatalog = useCallback(async () => {
    try {
      const response = await api('/api/products');
      setProducts(response.products || []);
      setError('');
    } catch (err) {
      setError(err.message);
      // Keep the starter catalogue visible during a temporary connection failure.
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { refreshCatalog(); }, [refreshCatalog]);
  return <CatalogContext.Provider value={{ products, loading, error, refreshCatalog }}>{children}</CatalogContext.Provider>;
}
export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) throw new Error('useCatalog requires CatalogProvider');
  return context;
}
