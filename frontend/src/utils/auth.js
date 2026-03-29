/**
 * Auth utilities for token management and headers
 */

export const getToken = () => {
  try {
    return localStorage.getItem('access_token');
  } catch (e) {
    console.error('Error getting token:', e);
    return null;
  }
};

export const setToken = (token) => {
  try {
    if (token) {
      localStorage.setItem('access_token', token);
    }
  } catch (e) {
    console.error('Error setting token:', e);
  }
};

export const removeToken = () => {
  try {
    localStorage.removeItem('access_token');
  } catch (e) {
    console.error('Error removing token:', e);
  }
};

export const getAuthHeader = () => {
  const token = getToken();
  if (!token) {
    return {};
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const clearAuthStorage = () => {
  removeToken();
  try {
    // Clear any other auth-related data if needed
    localStorage.removeItem('user');
  } catch (e) {
    console.error('Error clearing auth storage:', e);
  }
};
