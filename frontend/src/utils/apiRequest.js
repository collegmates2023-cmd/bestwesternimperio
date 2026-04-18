/**
 * Centralized API request helper with automatic token handling
 * Handles authentication, error handling, and 401 redirects
 */

import { getToken, removeToken } from './auth';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://bestwesternimperio-1.onrender.com';

// Helper to build Authorization header
const getAuthHeader = () => {
  const token = getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

// Main API request function
export const apiRequest = async (
  endpoint,
  options = {},
  skipAuth = false
) => {
  const url = `${API_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(skipAuth ? {} : getAuthHeader()),
  };

  const config = {
    ...options,
    headers,
  };

  try {
    console.log(`📤 [${config.method || 'GET'}] ${endpoint}`);
    
    const response = await fetch(url, config);
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      console.warn('🔐 [401] Unauthorized - Redirecting to login');
      removeToken();
      window.location.href = '/admin/login';
      return null;
    }

    // Handle 403 Forbidden
    if (response.status === 403) {
      console.error('🚫 [403] Forbidden - Access denied');
      throw new Error('You do not have permission to access this resource');
    }

    // Handle 404 Not Found
    if (response.status === 404) {
      console.warn('🔍 [404] Not Found');
      throw new Error('Resource not found');
    }

    // Handle 500 Server Error
    if (response.status >= 500) {
      console.error(`💥 [${response.status}] Server error`);
      throw new Error('Server error. Please try again later');
    }

    // Parse response
    let data;
    const contentType = response.headers.get('content-type');
    
    try {
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
    } catch (parseError) {
      console.error('❌ Failed to parse response:', parseError);
      throw new Error('Invalid response from server');
    }

    // Check if response is ok
    if (!response.ok) {
      const errorMessage = data?.detail || data?.message || `Request failed with status ${response.status}`;
      console.error(`❌ [${response.status}] ${errorMessage}`);
      throw new Error(errorMessage);
    }

    console.log(`✅ [${response.status}] ${endpoint}`);
    return data;

  } catch (error) {
    console.error(`❌ API Error: ${endpoint}`, error.message);
    throw error;
  }
};

// Convenience methods
export const api = {
  get: (endpoint, options = {}) => 
    apiRequest(endpoint, { ...options, method: 'GET' }),
  
  post: (endpoint, body = {}, options = {}) =>
    apiRequest(endpoint, { 
      ...options, 
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body)
    }),
  
  put: (endpoint, body = {}, options = {}) =>
    apiRequest(endpoint, { 
      ...options, 
      method: 'PUT',
      body: typeof body === 'string' ? body : JSON.stringify(body)
    }),
  
  delete: (endpoint, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'DELETE' }),
  
  patch: (endpoint, body = {}, options = {}) =>
    apiRequest(endpoint, { 
      ...options, 
      method: 'PATCH',
      body: typeof body === 'string' ? body : JSON.stringify(body)
    }),
};

export default api;
