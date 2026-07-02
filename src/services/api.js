import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// 🔥 YOUR BACKEND URL (LOCAL NETWORK)
export const API_URL = 'https://educonnect-backend-26.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token automatically
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('edu_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle 401 errors globally
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await SecureStore.deleteItemAsync('edu_token');
    }
    return Promise.reject(err);
  }
);

export default api;
