import React, { createContext, useContext, useEffect, useState } from 'react';
import http from '../http';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // blokuje render

  useEffect(() => {
    http.get('/auth/me.php') // np. backend zwraca dane użytkownika jeśli token OK
      .then(res => setUser(res))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    await http.post('/auth/login.php', credentials);
    const me = await http.get('/auth/me.php');
    setUser(me);
  };

  const logout = async () => {
    await http.post('/auth/logout.php');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const me = await http.get('/auth/me.php');
      setUser(me);
      toast.success('Pobrano dane i dostepy');
    } catch {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
