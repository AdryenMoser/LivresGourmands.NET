import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, messageOf, setToken } from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
const KEY = 'lg-panier';

function readLocal() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

function fromApi(item) {
  return {
    id: item.id,
    ouvrageId: item.ouvrageId,
    titre: item.titre,
    auteur: item.auteur,
    quantite: item.quantite,
    prix: Number(item.prixUnitaire),
    stock: item.stockDisponible,
  };
}

export function CartProvider({ children }) {
  const { token, user } = useAuth();
  const client = user?.role === 'client';
  const [items, setItems] = useState(readLocal);
  const [source, setSource] = useState('local');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancel = false;
    async function sync() {
      if (!client || !token) {
        setItems(readLocal());
        setSource('local');
        return;
      }
      setToken(token);
      setBusy(true);
      const local = readLocal();
      for (const line of local) {
        try {
          await api.post('/panier/items', { ouvrageId: line.ouvrageId, quantite: line.quantite });
        } catch {
          // Un ouvrage en rupture ou déjà présent ne bloque pas le reste du panier.
        }
      }
      localStorage.removeItem(KEY);
      try {
        const { data } = await api.get('/panier');
        if (!cancel) {
          setItems(data.panier.items.map(fromApi));
          setSource('api');
          setError('');
        }
      } catch (err) {
        if (!cancel) setError(messageOf(err));
      } finally {
        if (!cancel) setBusy(false);
      }
    }
    sync();
    return () => {
      cancel = true;
    };
  }, [client, token, user?.id]);

  function remember(next) {
    setItems(next);
    if (source === 'local' || !client) writeLocal(next);
  }

  async function add(book, quantite = 1) {
    setError('');
    const qty = Math.min(20, Math.max(1, Number(quantite) || 1));
    if (Number(book.stock) <= 0) {
      setError('Cet ouvrage est épuisé.');
      return;
    }
    try {
      if (client && token) {
        setToken(token);
        const { data } = await api.post('/panier/items', { ouvrageId: book.id, quantite: qty });
        setItems(data.panier.items.map(fromApi));
        setSource('api');
      } else {
        const current = readLocal();
        const found = current.find((line) => line.ouvrageId === book.id);
        const next = found
          ? current.map((line) => (line.ouvrageId === book.id
            ? { ...line, quantite: Math.min(20, line.quantite + qty) }
            : line))
          : [...current, {
            id: null,
            ouvrageId: book.id,
            titre: book.titre,
            auteur: book.auteur,
            quantite: qty,
            prix: Number(book.prix),
            stock: book.stock,
          }];
        writeLocal(next);
        setItems(next);
        setSource('local');
      }
    } catch (err) {
      setError(messageOf(err));
    }
  }

  async function update(line, quantite) {
    setError('');
    const qty = Math.min(20, Math.max(1, Number(quantite) || 1));
    try {
      if (source === 'api' && line.id) {
        const { data } = await api.put(`/panier/items/${line.id}`, { quantite: qty });
        setItems(data.panier.items.map(fromApi));
      } else {
        remember(items.map((item) => (item.ouvrageId === line.ouvrageId ? { ...item, quantite: qty } : item)));
      }
    } catch (err) {
      setError(messageOf(err));
    }
  }

  async function remove(line) {
    setError('');
    try {
      if (source === 'api' && line.id) {
        const { data } = await api.delete(`/panier/items/${line.id}`);
        setItems(data.panier.items.map(fromApi));
      } else {
        remember(items.filter((item) => item.ouvrageId !== line.ouvrageId));
      }
    } catch (err) {
      setError(messageOf(err));
    }
  }

  async function clear() {
    setError('');
    try {
      if (source === 'api') {
        const { data } = await api.delete('/panier');
        setItems(data.panier.items.map(fromApi));
      } else {
        writeLocal([]);
        setItems([]);
      }
    } catch (err) {
      setError(messageOf(err));
    }
  }

  const count = items.reduce((sum, line) => sum + line.quantite, 0);
  const total = items.reduce((sum, line) => sum + line.prix * line.quantite, 0);

  const value = useMemo(() => ({
    items, count, total, error, busy, source, setError, add, update, remove, clear,
  }), [items, count, total, error, busy, source]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
