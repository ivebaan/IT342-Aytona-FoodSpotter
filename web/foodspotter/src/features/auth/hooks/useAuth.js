import { createContext, createElement, useContext, useEffect, useState } from 'react';
import * as api from '../api/auth';

const AuthContext = createContext(null);

function AuthProviderInner({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const syncCurrentUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      logout();
      return null;
    }

    try {
      const res = await api.getCurrentUser(token);
      const currentUser = res;
      if (currentUser) {
        localStorage.setItem('user', JSON.stringify(currentUser));
        setUser(currentUser);
      }
      return currentUser;
    } catch {
      logout();
      return null;
    } finally {
      setLoading(false);
    }
  };

  const login = async (creds) => {
    const res = await api.login(creds);
    const accessToken = res?.accessToken;
    const u = res?.user;
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
    setLoading(false);
  };

  useEffect(() => {
    syncCurrentUser();

    const pollId = window.setInterval(() => {
      syncCurrentUser();
    }, 10000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncCurrentUser();
      }
    };

    const handleFocus = () => {
      syncCurrentUser();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(pollId);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return createElement(
    AuthContext.Provider,
    { value: { user, login, logout, loading, refreshUser: syncCurrentUser } },
    children,
  );
}

export function AuthProvider({ children }) {
  return createElement(AuthProviderInner, null, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
