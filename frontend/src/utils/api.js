/**
 * api.js — Axios-based API helpers.
 */
import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: BASE });

// Attach JWT on every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const registerUser = (data) => api.post('/api/auth/register', data);
export const loginUser = (data) => api.post('/api/auth/login', data);
export const getUsers = () => api.get('/api/users');
export const getUserPublicKey = (userId) => api.get(`/api/users/${userId}/public-key`);
export const getMessages = (otherUserId) => api.get(`/api/messages/${otherUserId}`);

export default api;
