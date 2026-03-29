import axios from 'axios';
import { getToken, removeToken } from '@/utils/auth';

// Backend API base URL - Production by default
const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://bestwesternimperio-1.onrender.com';

console.log('🔌 API Configuration:');
console.log('API Base URL:', API_URL);
console.log('Environment:', process.env.NODE_ENV);

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For cookies (httpOnly JWT tokens)
});

// Add request interceptor to attach auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 API Request: ${config.method.toUpperCase()} ${config.url}`, token ? '✓ with token' : '');
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    console.error(`❌ API Error: [${status}] ${url}`, error.response?.data?.detail || error.message);

    // Handle 401 Unauthorized - redirect to login
    if (status === 401) {
      console.warn('🔐 Unauthorized! Clearing auth and redirecting to login...');
      removeToken();
      // Redirect to login (will be handled by AuthContext or components)
      window.location.href = '/admin/login';
    }

    // Handle 403 Forbidden
    if (status === 403) {
      console.warn('🚫 Forbidden: You do not have permission to access this resource');
    }

    // Handle 404 Not Found
    if (status === 404) {
      console.warn('🔍 Resource not found');
    }

    // Handle 500 Server Error
    if (status === 500) {
      console.error('💥 Server error - please try again later');
    }

    return Promise.reject(error);
  }
);

export { API_URL, api as default };
