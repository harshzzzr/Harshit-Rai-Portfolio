import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import SEO from '../components/SEO';

export default function AdminLoginPage() {
  const { login, logout, currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const destination = location.state?.from?.pathname || '/admin';

  const validate = () => {
    if (!email.trim()) {
      return 'Email address is required.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return 'Please enter a valid email address.';
    }
    if (!password) {
      return 'Password is required.';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        if (result.notice) {
          setNotice(result.notice);
        }
        setTimeout(() => {
          navigate(destination, { replace: true });
        }, 500);
      } else {
        setError(result.error || 'Failed to authenticate.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  // If already logged in, display active session view
  if (isAuthenticated && currentUser) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <SEO title="Admin Console | Harshit Rai" noindex={true} />
        <div className="max-w-md w-full p-8 rounded-2xl glass-strong text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/20">
            <ShieldCheck size={36} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
              Administrator Authenticated
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Signed in as <span className="font-mono font-semibold text-primary-600 dark:text-primary-400">{currentUser.email}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/admin"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold transition-colors shadow-md shadow-primary-500/20"
            >
              Access Admin Area
            </Link>
            <button
              onClick={() => logout()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/[0.05] text-sm font-semibold transition-colors cursor-pointer"
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>

          <div className="pt-4 border-t border-neutral-100 dark:border-white/10">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <ArrowLeft size={13} />
              <span>Return to Public Website</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <SEO title="Admin Login | Harshit Rai" noindex={true} />
      <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl glass-strong space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/10 text-primary-600 dark:text-primary-400 mx-auto flex items-center justify-center">
            <Lock size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Admin Authentication
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            Secure administrator access to manage portfolio data
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div role="alert" className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-fade-in">
            <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Notice Banner */}
        {notice && (
          <div role="status" className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300 animate-fade-in">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{notice}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4" autoComplete="off">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label htmlFor="admin-email" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Admin Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400" aria-hidden="true">
                <Mail size={16} />
              </span>
              <input
                id="admin-email"
                type="email"
                required
                aria-required="true"
                aria-invalid={Boolean(error)}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=""
                autoComplete="off"
                spellCheck="false"
                autoCapitalize="none"
                disabled={loading}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm bg-neutral-50 dark:bg-[#101112] border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-[#D7E2EA] placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-primary-500 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label htmlFor="admin-password" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400" aria-hidden="true">
                <Lock size={16} />
              </span>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                required
                aria-required="true"
                aria-invalid={Boolean(error)}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
                autoComplete="new-password"
                disabled={loading}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm bg-neutral-50 dark:bg-[#101112] border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-[#D7E2EA] placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-primary-500 transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
              >
                {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold shadow-md shadow-primary-500/20 transition-all disabled:opacity-50 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary-500 active:scale-[0.99]"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In to Admin</span>
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="pt-2 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 rounded p-1"
          >
            <ArrowLeft size={13} aria-hidden="true" />
            <span>Back to Public Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
