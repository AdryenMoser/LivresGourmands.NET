import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

export function setToken(token) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

export function messageOf(error) {
  return error?.response?.data?.erreur
    || 'Le serveur ne répond pas. Vérifiez que l’API est démarrée, puis réessayez.';
}
