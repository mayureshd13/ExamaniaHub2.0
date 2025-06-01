const API = `${import.meta.env.VITE_AUTH_API}`;

/**
 * Handles API response consistently
 */
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Invalid server response');
  }

  const data = await response.json();
  
  if (!response.ok) {
    const error = new Error(data.message || data.msg || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

/**
 * Handles network errors and invalid JSON responses
 */
const handleNetworkError = (error) => {
  if (error.name === 'AbortError') {
    throw new Error('Request timed out');
  }
  throw new Error('Network error - please try again later');
};

/**
 * User signup
 */
export const signup = async (data, signal) => {
  try {
    const res = await fetch(`${API}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal, // Optional AbortSignal for request cancellation
    });
    return await handleResponse(res);
  } catch (err) {
    handleNetworkError(err);
  }
};

/**
 * User login
 */
export const login = async (data, signal) => {
  try {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal,
    });

    const response = await res.json();
    
    if (!res.ok) {
      const error = new Error(response.message || 'Login failed');
      error.errorType = response.errorType || 'UNKNOWN_ERROR';
      throw error;
    }

    return response;
  } catch (err) {
    // Re-throw with proper error classification
    if (err.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw err; // This now includes errorType
  }
};/**
 * Verify authentication token
 */
export const verifyToken = async (token, signal) => {
  try {
    const res = await fetch(`${API}/me`, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      signal,
    });
    return await handleResponse(res);
  } catch (err) {
    handleNetworkError(err);
  }
};

/**
 * Refresh expired token
 */
export const refreshToken = async (refreshToken, signal) => {
  try {
    const res = await fetch(`${API}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      signal,
    });
    return await handleResponse(res);
  } catch (err) {
    handleNetworkError(err);
  }
};

/**
 * Logout user
 */
export const logout = async (token, signal) => {
  try {
    const res = await fetch(`${API}/logout`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      signal,
    });
    return await handleResponse(res);
  } catch (err) {
    handleNetworkError(err);
  }
};

/**
 * Utility function to abort pending requests
 */
export const createAbortController = () => {
  return new AbortController();
};