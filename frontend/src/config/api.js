import axios from 'axios';

// Backend API base URL
// Reads from environment variable with fallback to localhost:8000
const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

console.log('🔌 API Configuration:');
console.log('API Base URL:', API_URL);
console.log('Environment:', process.env.NODE_ENV);

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For cookies (JWT tokens)
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`📤 API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.config?.url);
    return Promise.reject(error);
  }
);

export { API_URL, api as default };
