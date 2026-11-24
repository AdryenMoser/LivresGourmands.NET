import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, setToken } from '../api';

const AuthContext = createContext(null);
const KEY = 'lg-session';

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(read);

  useEffect(() => {
    setToken(session?.token || '');
  }, [session]);

  function save(next) {
    setSession(next);
    if (next) localStorage.setItem(KEY, JSON.stringify(next));
    else localStorage.removeItem(KEY);
    setToken(next?.token || '');
  }

  async function login(email, motDePasse) {
    const { data } = await api.post('/auth/login', { email, motDePasse });
    save(data);
    return data.utilisateur;
  }

  async function register(body) {
    const { data } = await api.post('/auth/register', body);
    save(data);
    return data.utilisateur;
  }

  function logout() {
    api.post('/auth/logout').catch(() => {});
    save(null);
  }

  const value = useMemo(() => ({
    token: session?.token || '',
    user: session?.utilisateur || null,
    login,
    register,
    logout,
  }), [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
