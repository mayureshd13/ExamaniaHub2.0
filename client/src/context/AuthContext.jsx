import React, { createContext, useState, useEffect } from 'react';
import { isTokenExpired } from '../utils/token';
import { login as apiLogin, signup as apiSignup } from '../API/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    initializeAuth(token);
  }, []);

  const initializeAuth = async (token) => {
    try {
      if (token && !isTokenExpired(token)) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ email: payload.email, userId: payload.userId });
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiLogin({ email, password });
      if (response.success) {
        localStorage.setItem('token', response.token);
        const payload = JSON.parse(atob(response.token.split('.')[1]));
        setUser({ email: payload.email, userId: payload.userId });
        return true;
      }
      throw new Error(response.message || 'Login failed');
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await apiSignup({ name, email, password });
      if (response.success) {
        return true;
      }
      throw new Error(response.msg || 'Signup failed');
    } catch (err) {
      console.error('Signup error:', err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};