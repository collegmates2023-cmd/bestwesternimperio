/**
 * Global API Configuration
 * 
 * API_URL defaults to production Render backend
 * Can be overridden with REACT_APP_BACKEND_URL env var
 */

export const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://bestwesternimperio-1.onrender.com';

console.log('🔌 API Configuration:');
console.log('API_URL:', API_URL);
console.log('Environment:', process.env.NODE_ENV);

export default API_URL;
