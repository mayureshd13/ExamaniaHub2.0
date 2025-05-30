const API = `${import.meta.env.VITE_AUTH_API}`

export const signup = async (data) => {
  try {
    const res = await fetch(`${API}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const response = await res.json();
    if (!res.ok) {
      throw new Error(response.msg || 'Signup failed');
    }
    return response;
  } catch (err) {
    throw err;
  }
};

export const login = async (data) => {
  try {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const response = await res.json();
    if (!res.ok) {
      throw new Error(response.message || 'Login failed');
    }
    return response;
  } catch (err) {
    throw err;
  }
};

export const verifyToken = async (token) => {
  try {
    const res = await fetch(`${API}/me`, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
    });
    const response = await res.json();
    if (!res.ok) throw new Error(response.message || 'Token invalid');
    return response;
  } catch (err) {
    throw err;
  }
};