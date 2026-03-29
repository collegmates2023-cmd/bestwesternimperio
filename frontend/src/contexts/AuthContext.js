import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { setToken, removeToken, getToken } from "@/utils/auth";

const AuthContext = createContext(null);

// API URL with fallback
const API = process.env.REACT_APP_BACKEND_URL || 'https://bestwesternimperio-1.onrender.com';

console.log('🔐 AuthContext: API URL =', API);

// Create axios instance with credentials support
const adminApi = axios.create({ 
  baseURL: API, 
  withCredentials: true,
  timeout: 15000 
});

// Add interceptor to attach token to requests
adminApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add interceptor to handle token refresh on 401
adminApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        console.log('🔄 Attempting token refresh...');
        const refreshRes = await axios.post(`${API}/api/auth/refresh`, {}, { withCredentials: true });
        if (refreshRes.data?.token) {
          setToken(refreshRes.data.token);
        }
        // Attach the new token and retry
        const token = getToken();
        if (token) {
          error.config.headers.Authorization = `Bearer ${token}`;
        }
        return adminApi(error.config);
      } catch (refreshErr) {
        console.error('❌ Token refresh failed:', refreshErr.message);
        removeToken();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null=checking, false=not auth, {}=authenticated
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      console.log('🔍 Checking authentication...');
      const { data } = await adminApi.get("/api/auth/me");
      console.log('✅ User authenticated:', data);
      setUser(data);
    } catch (err) {
      console.log('❌ Not authenticated:', err.message);
      setUser(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    checkAuth(); 
  }, [checkAuth]);

  const login = async (email, password) => {
    try {
      console.log('🔑 Logging in as:', email);
      console.log('📡 Calling:', `${API}/api/auth/login`);
      const { data } = await adminApi.post("/api/auth/login", { email, password });
      console.log('✅ Login successful!', data);
      
      // Save token to localStorage
      if (data.token) {
        setToken(data.token);
      }
      
      setUser(data);
      return data;
    } catch (err) {
      console.error('❌ Login failed:');
      console.error('   Error:', err.message);
      console.error('   Status:', err.response?.status);
      console.error('   Data:', err.response?.data);
      console.error('   URL attempted:', `${API}/api/auth/login`);
      throw err;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      await adminApi.post("/api/auth/logout");
      console.log('✅ Logout successful');
      removeToken();
      setUser(false);
    } catch (err) {
      console.error('❌ Logout failed:', err.message);
      removeToken();
      setUser(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, adminApi }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { adminApi };
