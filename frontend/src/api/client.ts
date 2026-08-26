import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL?.trim() || '/api/v1';

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('azam_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
