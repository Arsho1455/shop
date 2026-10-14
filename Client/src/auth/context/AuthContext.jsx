import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api('/api/auth/me')
      .then(({ user }) => { if (active) setUser(user); })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function signIn(email, password) {
    const data = await api('/api/auth/login', { method: 'POST', body: { email, password } });
    setUser(data.user);
    return data.user;
  }

  async function signOut() {
    await api('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signOut, setUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
