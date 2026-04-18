import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { setToken, removeToken, getToken } from "@/utils/auth";
import api from "@/utils/apiRequest";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null=checking, false=not auth, {}=authenticated
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      console.log('🔍 Checking authentication...');
      const data = await api.get("/api/auth/me");
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
      const data = await api.post("/api/auth/login", { email, password }, { headers: { 'Content-Type': 'application/json' } }, true);
      console.log('✅ Login successful!', data);
      
      // Save token to localStorage
      if (data.token) {
        setToken(data.token);
        console.log('💾 Token saved to localStorage');
      }
      
      setUser(data);
      return data;
    } catch (err) {
      console.error('❌ Login failed:', err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      await api.post("/api/auth/logout", {});
      console.log('✅ Logout successful');
      removeToken();
      setUser(false);
    } catch (err) {
      console.error('❌ Logout error (continuing):', err.message);
      removeToken();
      setUser(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
