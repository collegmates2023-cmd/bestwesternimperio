import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext(null);
<<<<<<< HEAD

// API URL with fallback - CRITICAL: Must have fallback if env var is undefined
const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

console.log('🔐 AuthContext: API URL =', API);
=======
const API = process.env.REACT_APP_BACKEND_URL;
>>>>>>> 13412ab8749f8fc6a70ea46c62b0613254000ca4

const adminApi = axios.create({ baseURL: API, withCredentials: true });

// Add interceptor to handle token refresh
adminApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        await axios.post(`${API}/api/auth/refresh`, {}, { withCredentials: true });
        return adminApi(error.config);
      } catch {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null=checking, false=not auth
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
<<<<<<< HEAD
      console.log('🔍 Checking authentication...');
      const { data } = await adminApi.get("/api/auth/me");
      console.log('✅ User authenticated:', data);
      setUser(data);
    } catch (err) {
      console.log('❌ Not authenticated:', err.message);
=======
      const { data } = await adminApi.get("/api/auth/me");
      setUser(data);
    } catch {
>>>>>>> 13412ab8749f8fc6a70ea46c62b0613254000ca4
      setUser(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const login = async (email, password) => {
<<<<<<< HEAD
    try {
      console.log('🔑 Logging in as:', email);
      console.log('📡 Calling:', `${API}/api/auth/login`);
      const { data } = await adminApi.post("/api/auth/login", { email, password });
      console.log('✅ Login successful!', data);
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
      setUser(false);
    } catch (err) {
      console.error('❌ Logout failed:', err.message);
      setUser(false);
    }
=======
    const { data } = await adminApi.post("/api/auth/login", { email, password });
    setUser(data);
    return data;
  };

  const logout = async () => {
    await adminApi.post("/api/auth/logout");
    setUser(false);
>>>>>>> 13412ab8749f8fc6a70ea46c62b0613254000ca4
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
