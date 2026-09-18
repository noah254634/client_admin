import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'));
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin_user') || 'null'); }
    catch { return null; }
  });

  const signIn = useCallback((tok, adminObj) => {
    localStorage.setItem('admin_token', tok);
    localStorage.setItem('admin_user', JSON.stringify(adminObj));
    setToken(tok);
    setAdmin(adminObj);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setToken(null);
    setAdmin(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, admin, signIn, signOut, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
