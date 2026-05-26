import React, { useState, useEffect, useCallback } from 'react';
import { LoginFormData, SignupFormData } from '../types';
import { authService } from '../services/authService';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
}

type AuthMode = 'signin' | 'signup' | 'forgot';

interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const GithubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

const CheckCircle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const AlertCircle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

// ─── Validation Helpers ───────────────────────────────────────────────────────

const validateEmail = (email: string): string | null => {
  if (!email.trim()) return 'Email is required.';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Please enter a valid email address.';
  return null;
};

const validatePassword = (password: string, isSignUp: boolean): string | null => {
  if (!password) return 'Password is required.';
  if (isSignUp) {
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
  }
  return null;
};

const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Weak', color: '#ef4444' };
  if (score <= 2) return { score, label: 'Fair', color: '#f59e0b' };
  if (score <= 3) return { score, label: 'Good', color: '#3b82f6' };
  return { score, label: 'Strong', color: '#10b981' };
};

// ─── Toast Component ─────────────────────────────────────────────────────────

const ToastContainer: React.FC<{ toasts: Toast[]; onRemove: (id: number) => void }> = ({ toasts, onRemove }) => (
  <div className="fixed top-4 right-4 z-[10001] flex flex-col gap-2 pointer-events-none" style={{ maxWidth: '360px' }}>
    {toasts.map(toast => (
      <div
        key={toast.id}
        className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl border backdrop-blur-xl animate-[slideInRight_0.3s_ease-out]"
        style={{
          background: toast.type === 'success' ? 'rgba(16, 185, 129, 0.15)' :
                      toast.type === 'error' ? 'rgba(239, 68, 68, 0.15)' :
                      'rgba(99, 102, 241, 0.15)',
          borderColor: toast.type === 'success' ? 'rgba(16, 185, 129, 0.3)' :
                       toast.type === 'error' ? 'rgba(239, 68, 68, 0.3)' :
                       'rgba(99, 102, 241, 0.3)',
          color: toast.type === 'success' ? '#6ee7b7' :
                 toast.type === 'error' ? '#fca5a5' :
                 '#a5b4fc',
        }}
      >
        <span className="flex-shrink-0">
          {toast.type === 'success' ? <CheckCircle /> : toast.type === 'error' ? <AlertCircle /> : <InfoIcon />}
        </span>
        <span className="flex-1 leading-snug">{toast.message}</span>
        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity ml-1"
        >
          ×
        </button>
      </div>
    ))}
  </div>
);

// ─── Main AuthModal Component ─────────────────────────────────────────────────

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'github' | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastCounter, setToastCounter] = useState(0);

  const passwordStrength = getPasswordStrength(formData.password);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setFieldErrors({});
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = toastCounter + 1;
    setToastCounter(id);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  }, [toastCounter]);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (mode === 'signup' && !formData.name.trim()) {
      errors.name = 'Full name is required.';
    }

    const emailErr = validateEmail(formData.email);
    if (emailErr) errors.email = emailErr;

    const passErr = validatePassword(formData.password, mode === 'signup');
    if (passErr) errors.password = passErr;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setFieldErrors({});

    try {
      if (mode === 'signup') {
        const result = await authService.signUp(formData as SignupFormData);

        if (result.success && result.data) {
          addToast('success', '🎉 Account created! Welcome to QuantumPulse AI.');
          onAuthSuccess(result.data);
          onClose();
          setFormData({ name: '', email: '', password: '' });
        } else {
          if (result.error === 'ACCOUNT_EXISTS') {
            setFieldErrors({ email: 'An account with this email already exists.' });
            addToast('error', 'Account already exists. Please sign in instead.');
            // Auto-switch to sign in with same email
            setTimeout(() => setMode('signin'), 1200);
          } else {
            addToast('error', result.error || 'Sign up failed. Please try again.');
          }
        }
      } else {
        const result = await authService.signIn({
          email: formData.email,
          password: formData.password,
        } as LoginFormData);

        if (result.success && result.data) {
          addToast('success', `Welcome back, ${result.data.name}!`);
          onAuthSuccess(result.data);
          onClose();
          setFormData({ name: '', email: '', password: '' });
        } else {
          if (result.error === 'INVALID_CREDENTIALS') {
            setFieldErrors({ password: 'Incorrect email or password.' });
            addToast('error', 'Wrong credentials. Please check and try again.');
          } else if (result.error === 'EMAIL_NOT_CONFIRMED') {
            addToast('info', 'Please check your email to confirm your account first.');
          } else if (result.error?.includes('Failed to fetch') || result.error?.includes('network')) {
            addToast('error', 'Network error. Please check your connection.');
          } else {
            addToast('error', result.error || 'Sign in failed. Please try again.');
          }
        }
      }
    } catch {
      addToast('error', 'Unexpected error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(forgotEmail);
    if (emailErr) {
      setFieldErrors({ forgotEmail: emailErr });
      return;
    }

    setIsLoading(true);
    setFieldErrors({});

    try {
      const result = await authService.forgotPassword(forgotEmail);
      if (result.success) {
        addToast('success', `Password reset link sent to ${forgotEmail}`);
        setForgotEmail('');
        setTimeout(() => setMode('signin'), 1000);
      } else {
        addToast('error', result.error || 'Failed to send reset email.');
      }
    } catch {
      addToast('error', 'Unexpected error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSocialLoading('google');
    try {
      const result = await authService.signInWithGoogle();
      if (!result.success) {
        addToast('error', result.error || 'Google sign-in failed.');
      }
      // Success = browser redirect, no further action needed here
    } catch {
      addToast('error', 'Google sign-in failed. Please try again.');
    } finally {
      setSocialLoading(null);
    }
  };

  const handleGitHubLogin = async () => {
    setSocialLoading('github');
    try {
      const result = await authService.signInWithGitHub();
      if (!result.success) {
        addToast('error', result.error || 'GitHub sign-in failed.');
      }
    } catch {
      addToast('error', 'GitHub sign-in failed. Please try again.');
    } finally {
      setSocialLoading(null);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setFieldErrors({});
    setFormData({ name: '', email: formData.email, password: '' });
  };

  if (!isOpen) return null;

  const inputBase = `
    w-full bg-slate-950/70 border rounded-xl px-4 py-2.5 text-white text-sm
    placeholder-slate-500 transition-all duration-200 outline-none
    focus:ring-1 disabled:opacity-40 disabled:cursor-not-allowed
  `;
  const inputOk = `${inputBase} border-slate-700/60 focus:border-cyan-500/60 focus:ring-cyan-500/30`;
  const inputErr = `${inputBase} border-rose-500/50 focus:border-rose-500/60 focus:ring-rose-500/20`;

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ padding: '16px' }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-slate-950/75 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Ambient orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-purple-500/8 rounded-full blur-3xl pointer-events-none" />

        {/* Modal */}
        <div
          className="relative w-full z-10"
          style={{ maxWidth: '400px' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Glow border */}
          <div className="absolute -inset-[1px] bg-gradient-to-br from-cyan-500/25 via-blue-500/10 to-purple-500/25 rounded-2xl blur-sm opacity-80 pointer-events-none" />

          {/* Card */}
          <div className="relative bg-slate-900/95 backdrop-blur-2xl rounded-2xl border border-white/5 shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="relative pt-6 pb-4 px-6 text-center">
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-7 h-7 bg-white/5 hover:bg-white/10 border border-white/8 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200 text-lg leading-none"
                aria-label="Close"
              >
                ×
              </button>

              {/* Brand badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-full mb-4">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
                </div>
                <span className="text-cyan-400 text-xs font-black tracking-widest">QUANTUM PULSE</span>
              </div>

              {/* Title */}
              <h2 className="text-xl font-black text-white tracking-tight">
                {mode === 'signin' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                {mode === 'signin' ? 'Sign in to access your dashboard.' :
                 mode === 'signup' ? 'Join the next generation of market intelligence.' :
                 'Enter your email to receive a reset link.'}
              </p>
            </div>

            {/* Body */}
            <div className="px-6 pb-6">

              {/* ── FORGOT PASSWORD FORM ── */}
              {mode === 'forgot' && (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={e => { setForgotEmail(e.target.value); setFieldErrors({}); }}
                      disabled={isLoading}
                      className={fieldErrors.forgotEmail ? inputErr : inputOk}
                      placeholder="you@example.com"
                      autoFocus
                    />
                    {fieldErrors.forgotEmail && (
                      <p className="text-rose-400 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle />
                        {fieldErrors.forgotEmail}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-white text-slate-900 font-bold py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-50 disabled:transform-none text-sm"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : 'Send Reset Link'}
                  </button>

                  <p className="text-center text-slate-500 text-xs">
                    <button type="button" onClick={() => switchMode('signin')} className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                      ← Back to Sign In
                    </button>
                  </p>
                </form>
              )}

              {/* ── SIGN IN / SIGN UP FORM ── */}
              {mode !== 'forgot' && (
                <>
                  {/* Social Buttons */}
                  <div className="grid grid-cols-2 gap-2.5 mb-4">
                    <button
                      onClick={handleGoogleLogin}
                      disabled={isLoading || !!socialLoading}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 hover:border-slate-600/60 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 hover:text-white text-sm font-medium"
                    >
                      {socialLoading === 'google' ? (
                        <span className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin" />
                      ) : <GoogleIcon />}
                      Google
                    </button>
                    <button
                      onClick={handleGitHubLogin}
                      disabled={isLoading || !!socialLoading}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 hover:border-slate-600/60 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 hover:text-white text-sm font-medium"
                    >
                      {socialLoading === 'github' ? (
                        <span className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin" />
                      ) : <GithubIcon />}
                      GitHub
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-700/40" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-slate-900/95 text-slate-500">or continue with email</span>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-3.5">

                    {/* Name — signup only */}
                    {mode === 'signup' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Full Name</label>
                        <input
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={isLoading}
                          className={fieldErrors.name ? inputErr : inputOk}
                          placeholder="John Doe"
                          autoFocus
                        />
                        {fieldErrors.name && (
                          <p className="text-rose-400 text-xs mt-1 flex items-center gap-1"><AlertCircle />{fieldErrors.name}</p>
                        )}
                      </div>
                    )}

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className={fieldErrors.email ? inputErr : inputOk}
                        placeholder="you@example.com"
                        autoFocus={mode === 'signin'}
                      />
                      {fieldErrors.email && (
                        <p className="text-rose-400 text-xs mt-1 flex items-center gap-1"><AlertCircle />{fieldErrors.email}</p>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                        {mode === 'signin' && (
                          <button
                            type="button"
                            onClick={() => switchMode('forgot')}
                            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                          >
                            Forgot Password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={handleInputChange}
                          disabled={isLoading}
                          className={`${fieldErrors.password ? inputErr : inputOk} pr-10`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      </div>

                      {/* Password strength bar — signup only */}
                      {mode === 'signup' && formData.password && (
                        <div className="mt-2 space-y-1">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map(i => (
                              <div
                                key={i}
                                className="flex-1 h-1 rounded-full transition-all duration-300"
                                style={{
                                  background: i <= passwordStrength.score
                                    ? passwordStrength.color
                                    : 'rgba(255,255,255,0.08)',
                                }}
                              />
                            ))}
                          </div>
                          <p className="text-xs" style={{ color: passwordStrength.color }}>
                            {passwordStrength.label} password
                          </p>
                        </div>
                      )}

                      {fieldErrors.password && (
                        <p className="text-rose-400 text-xs mt-1 flex items-center gap-1"><AlertCircle />{fieldErrors.password}</p>
                      )}

                      {mode === 'signup' && !fieldErrors.password && (
                        <p className="text-slate-600 text-xs mt-1.5">Min 8 chars, one uppercase, one number.</p>
                      )}
                    </div>

                    {/* Submit */}
                    <div className="pt-1">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-white text-slate-900 font-bold py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-50 disabled:transform-none text-sm"
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
                            {mode === 'signup' ? 'Creating Account...' : 'Signing In...'}
                          </span>
                        ) : (
                          mode === 'signup' ? 'Create Account' : 'Sign In'
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Mode toggle */}
                  <p className="text-center text-slate-500 text-xs mt-4">
                    {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                    <button
                      type="button"
                      onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
                      disabled={isLoading}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors disabled:opacity-50"
                    >
                      {mode === 'signin' ? 'Sign up for free' : 'Sign in instead'}
                    </button>
                  </p>
                </>
              )}

              {/* Security Badge */}
              <div className="mt-4 flex items-center justify-center gap-1.5 text-slate-600 text-xs font-mono tracking-widest">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
                <span>SECURE END-TO-END ENCRYPTION</span>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-6px); }
          40%       { transform: translateX(6px); }
          60%       { transform: translateX(-4px); }
          80%       { transform: translateX(4px); }
        }
      `}</style>
    </>
  );
};

export default AuthModal;
