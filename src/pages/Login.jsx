import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { login as apiLogin } from '../api';
import { Lock, User, ArrowRight } from 'lucide-react';

export default function Login() {
  const { signIn } = useAuth();
  const navigate   = useNavigate();
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await apiLogin(form.email, form.password);
      signIn(data.token, data.admin);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Brand mark */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-full bg-[var(--text-primary)] text-[var(--bg-primary)] font-mono-code font-bold text-lg flex items-center justify-center mb-4 shadow-lg">
            NK
          </div>
          <h1 className="font-sans-title text-2xl font-extrabold text-[var(--text-primary)]">Admin Dashboard</h1>
          <p className="font-mono-code text-[11px] uppercase tracking-widest text-[var(--text-muted)] mt-1">Noah Khaemba · Portfolio CMS</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <span className="badge-glass mb-6 inline-block">// SECURE ACCESS</span>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="email"
                  id="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="admin@example.com"
                  className="form-input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="password"
                  id="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="form-input pl-10"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 font-mono-code text-xs">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center flex items-center gap-2 mt-2">
              {loading ? <span className="spinner" /> : <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>}
            </button>
          </form>
        </div>

        <p className="text-center font-mono-code text-[10px] text-[var(--text-muted)] mt-6 uppercase tracking-widest">
          Protected Admin Area · Noah Khaemba Portfolio
        </p>
      </div>
    </div>
  );
}
