// Centralized Axios API Instance with JWT interceptor
import axios from 'axios';
import { API_BASE_URL } from '../config/gameConfig';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bba_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on 401
      localStorage.removeItem('bba_token');
      localStorage.removeItem('bba_user');
    }
    return Promise.reject(error);
  }
);

export default api;
