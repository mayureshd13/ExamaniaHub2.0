import React, { createContext, useState, useEffect } from 'react';
import { isTokenExpired } from '../utils/token';
import { login as apiLogin, signup as apiSignup } from '../API/auth';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();

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
          name: payload.name
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
    const { success, token, message } = await apiLogin({ email, password });
    
    if (success && token) {
      localStorage.setItem('token', token);
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ 
        email: payload.email, 
        userId: payload.userId,
        name: payload.name 
      });
      return true;
    }
    throw new Error(message || 'Login failed');
  } catch (err) {
    // Handle specific error types differently
    if (err.errorType === 'USER_NOT_FOUND') {
      navigate('/signup', { state: { email } });
      setAuthError('No account found. Please signup First.');
      return false;
    }
    
    setAuthError(
      err.errorType === 'INVALID_PASSWORD' ? 'Incorrect password' :
      err.errorType === 'SERVER_ERROR' ? 'Server error, please try again later' :
      err.message || 'Login failed'
    );
    
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