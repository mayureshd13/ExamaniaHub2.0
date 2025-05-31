import React, { createContext, useState, useEffect } from 'react';
import { isTokenExpired } from '../utils/token';
import { login as apiLogin, signup as apiSignup } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    initializeAuth(token);
  }, []);

  const initializeAuth = async (token) => {
    try {
      if (token && !isTokenExpired(token)) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ 
          email: payload.email, 
          userId: payload.userId,
          name: payload.name // Include name if available
        });
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
      setAuthError('Session expired. Please login again.');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await apiLogin({ email, password });
      if (response.success) {
        localStorage.setItem('token', response.token);
        const payload = JSON.parse(atob(response.token.split('.')[1]));
        setUser({ 
          email: payload.email, 
          userId: payload.userId,
          name: payload.name 
        });
        return true;
      }
      throw new Error(response.msg || response.message || 'Login failed');
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await apiSignup({ name, email, password });
      if (response.success) {
        return true;
      }
      throw new Error(response.msg || response.message || 'Signup failed');
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setAuthError(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      authError,
      login, 
      signup, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};