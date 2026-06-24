// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null);
  const [token, setToken]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => { loadStoredAuth(); }, []);

  async function loadStoredAuth() {
    try {
      const storedToken = await SecureStore.getItemAsync('edu_token');
      const storedUser  = await SecureStore.getItemAsync('edu_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        await checkSubscription(JSON.parse(storedUser));
      }
    } catch (e) {}
    setLoading(false);
  }

  async function checkSubscription(u) {
    if (!u || u.jukumu === 'admin') { setSubscribed(true); return true; }
    try {
      const res = await api.get('/api/malipo?hali=confirmed');
      const now = new Date();
      const active = res.data.malipo?.find(m => new Date(m.tarehe_kuisha) >= now);
      setSubscribed(!!active);
      return !!active;
    } catch { setSubscribed(false); return false; }
  }

  async function login(email, nywila) {
    const res = await api.post('/api/auth/ingia', { email, nywila });
    const { token: t, mtumiaji } = res.data;
    await SecureStore.setItemAsync('edu_token', t);
    await SecureStore.setItemAsync('edu_user', JSON.stringify(mtumiaji));
    setToken(t); setUser(mtumiaji);
    const sub = await checkSubscription(mtumiaji);
    return { ...res.data, subscribed: sub };
  }

  async function register(data) {
    const res = await api.post('/api/auth/sajili', data);
    return res.data;
  }

  async function logout() {
    await SecureStore.deleteItemAsync('edu_token');
    await SecureStore.deleteItemAsync('edu_user');
    setToken(null); setUser(null); setSubscribed(false);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, subscribed, login, logout, register, checkSubscription, setSubscribed }}>
      {children}
    </AuthContext.Provider>
  );
}
