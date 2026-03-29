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
<<<<<<< HEAD
    console.log('📝 Login attempt:', { email, password: '***' });
    try {
      await login(email, password);
      console.log('✅ Login successful, redirecting to dashboard');
      navigate("/admin/dashboard");
    } catch (err) {
      console.error('❌ Login error:', err);
      // Extract error message from various formats
      const detail = err.response?.data?.detail || err.message || "Login failed";
      const errorMsg = typeof detail === "string" ? detail : Array.isArray(detail) ? detail.map(d => d.msg || JSON.stringify(d)).join(" ") : String(detail);
      console.error('Error message:', errorMsg);
      setError(errorMsg);
=======
    try {
      await login(email, password);
      navigate("/admin/dashboard");
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : Array.isArray(detail) ? detail.map(d => d.msg || JSON.stringify(d)).join(" ") : "Login failed");
>>>>>>> 13412ab8749f8fc6a70ea46c62b0613254000ca4
    }
    setLoading(false);
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#0D0D0D] to-[#1a1a1a] flex items-center justify-center px-4 relative overflow-hidden" data-testid="admin-login-page">
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#D4AF37]/10 to-transparent rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#764ba2]/10 to-transparent rounded-full blur-3xl opacity-20"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block mb-4">
            <span className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase font-bold block" style={{ fontFamily: "'Outfit', sans-serif" }}>Best Western</span>
          </div>
          <h1 className="text-white text-4xl tracking-wider font-medium block mt-2 gradient-text" style={{ fontFamily: "'Playfair Display', serif" }}>IMPERIO</h1>
          <p className="text-[#D4AF37] text-xs mt-3 tracking-[0.2em] font-semibold">ADMIN PANEL</p>
        </div>

        <form onSubmit={handleSubmit} className="relative group" data-testid="login-form">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#D4AF37] to-[#764ba2] rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
          
          <div className="bg-gradient-to-br from-[#141414] to-[#0D0D0D] border border-[#D4AF37]/30 rounded-2xl p-8 space-y-6 backdrop-blur-xl relative">
            <h2 className="text-xl text-white font-semibold tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>Sign In</h2>

            {error && (
              <div data-testid="login-error" className="bg-red-500/15 border border-red-500/40 text-red-300 text-sm p-3 rounded-lg animate-shake">
                ⚠️ {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs text-[#D4AF37] uppercase tracking-widest font-semibold block">Email Address</label>
              <div className="relative group/input">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/50 group-focus-within/input:text-[#D4AF37] transition-colors" />
                <input
                  data-testid="login-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#111] border-1.5 border-[#D4AF37]/30 text-white placeholder-gray-600 pl-11 pr-4 py-3 text-sm rounded-lg focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none transition-all duration-300"
                  placeholder="admin@bwimperio.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[#D4AF37] uppercase tracking-widest font-semibold block">Password</label>
              <div className="relative group/input">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/50 group-focus-within/input:text-[#D4AF37] transition-colors" />
                <input
                  data-testid="login-password-input"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#111] border-1.5 border-[#D4AF37]/30 text-white placeholder-gray-600 pl-11 pr-12 py-3 text-sm rounded-lg focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none transition-all duration-300"
                  placeholder="Enter your password"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPw(!showPw)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              data-testid="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-gradient-to-r from-[#D4AF37] to-[#f59e0b] text-black py-3 text-sm uppercase tracking-widest font-bold rounded-lg hover:shadow-xl hover:shadow-[#D4AF37]/30 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              <span className="relative">{loading ? "Signing in..." : "Sign In"}</span>
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-neutral-500 text-xs mb-4">Demo Credentials:</p>
          <p className="text-neutral-600 text-xs font-mono bg-[#111] border border-[#262626] px-4 py-2 rounded-lg inline-block">
            <span className="text-[#D4AF37]">admin@bwimperio.com</span> / <span className="text-[#D4AF37]">bwimperio</span>
          </p>
        </div>

        <p className="text-center text-neutral-600 text-xs mt-8">
          <button 
            onClick={() => navigate("/")} 
            className="hover:text-[#D4AF37] transition-colors font-medium"
          >
            ← Back to Website
          </button>
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fade-in { animation: fadeIn 0.6s ease; }
        .animate-shake { animation: shake 0.3s ease; }
        .gradient-text {
          background: linear-gradient(135deg, #fde047 0%, #D4AF37 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
=======
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
>>>>>>> 13412ab8749f8fc6a70ea46c62b0613254000ca4
    </div>
  );
}
