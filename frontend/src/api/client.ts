import axios from 'axios';
import { getAuthHeaders } from '../stores/auth';

const api = axios.create({
  baseURL: '/',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const headers = getAuthHeaders();
  config.headers = { ...config.headers, ...headers };
  return config;
});

export default api;
