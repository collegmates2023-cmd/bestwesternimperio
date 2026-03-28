import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/admin/dashboard");
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : Array.isArray(detail) ? detail.map(d => d.msg || JSON.stringify(d)).join(" ") : "Login failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4" data-testid="admin-login-page">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <span className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase font-semibold block" style={{ fontFamily: "'Outfit', sans-serif" }}>Best Western</span>
          <span className="text-white text-3xl tracking-widest font-medium block mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>IMPERIO</span>
          <p className="text-neutral-500 text-sm mt-3">Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#141414] border border-[#262626] p-8 space-y-6" data-testid="login-form">
          <h2 className="text-xl text-white font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>Sign In</h2>

          {error && (
            <div data-testid="login-error" className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs text-neutral-400 uppercase tracking-widest">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                data-testid="login-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#262626] text-white pl-10 pr-4 py-3 text-sm focus:border-[#D4AF37] focus:outline-none transition-colors"
                placeholder="admin@bwimperio.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-400 uppercase tracking-widest">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                data-testid="login-password-input"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#262626] text-white pl-10 pr-10 py-3 text-sm focus:border-[#D4AF37] focus:outline-none transition-colors"
                placeholder="Enter password"
                required
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            data-testid="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full bg-[#D4AF37] text-black py-3 text-sm uppercase tracking-widest font-semibold hover:bg-[#FDE047] transition-all duration-300 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-neutral-600 text-xs mt-6">
          <button onClick={() => navigate("/")} className="hover:text-[#D4AF37] transition-colors">
            Back to Website
          </button>
        </p>
      </div>
    </div>
  );
}
