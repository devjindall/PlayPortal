import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle, Sparkles, User, ShieldCheck, Code2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/games';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="max-w-md mx-auto my-8 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Welcome <span className="text-emerald-400">Back</span>
        </h1>
        <p className="text-sm text-slate-400">
          Sign in to your PlayPortal account to play and track scores
        </p>
      </div>

      {/* Main Login Form Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="player@example.com"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
          >
            {isSubmitting ? (
              <span>Signing in...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Quick-Login Helper for Viva / Grading */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Demo Quick-Fill Accounts:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('player@playportal.com', 'Player123!')}
              className="py-1.5 px-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-emerald-400 font-medium transition flex items-center justify-center space-x-1"
            >
              <User className="w-3 h-3" />
              <span>Player</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('dev@playportal.com', 'Dev123!')}
              className="py-1.5 px-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-purple-400 font-medium transition flex items-center justify-center space-x-1"
            >
              <Code2 className="w-3 h-3" />
              <span>Developer</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin@playportal.com', 'Admin123!')}
              className="py-1.5 px-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-rose-400 font-medium transition flex items-center justify-center space-x-1"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-emerald-400 font-semibold hover:underline">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
}
