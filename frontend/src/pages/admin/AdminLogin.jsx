import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';

export function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAdmin();
  const { isDark } = useTheme();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setError(result.error || 'Invalid admin credentials');
      }
    } catch (err) {
      setError('System error connecting to auth server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-[#020704]' : 'bg-slate-50'}`}>
      <div className="w-full max-w-md">
        
        {/* Branding Header */}
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
            Admin <span className="text-emerald-400">Portal</span>
          </h1>
          <p className="text-sm text-slate-400">
            Secure access for authorized personnel only.
          </p>
        </div>

        {/* Login Form Card */}
        <div className={`p-8 rounded-3xl border shadow-2xl ${isDark ? 'bg-[#050f0a] border-emerald-500/20 shadow-emerald-900/10' : 'bg-white border-slate-200'}`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 animate-in fade-in zoom-in-95 duration-300">
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-rose-400">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">Username / Email</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all ${
                      isDark ? 'bg-[#020704] border-slate-800 text-slate-100 placeholder:text-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                    placeholder="admin"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">Master Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all ${
                      isDark ? 'bg-[#020704] border-slate-800 text-slate-100 placeholder:text-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-emerald-soft"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <span>Authenticate Session</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
        
        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5" />
          <span>HealthGuard AI Administrative Systems</span>
        </div>
      </div>
    </div>
  );
}
