import { useState, useEffect } from 'react';
import * as api from '../api/auth';

export function useAuth() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });

  const login = async (creds) => {
    const res = await api.login(creds);
    const accessToken = res?.data?.accessToken;
    const u = res?.data?.user;
    if (accessToken && u) {
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(u));
      setUser(u);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) logout();
  }, []);

  return { user, login, logout };
}
