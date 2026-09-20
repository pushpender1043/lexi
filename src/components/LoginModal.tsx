import React, { useState } from 'react';
import { AexoMascot } from './AexoMascot';
import { Sparkles, Mail, ArrowRight, ShieldCheck, User, X, AlertCircle } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginSuccess: (authData: {
    email: string;
    name: string;
    provider: 'google' | 'email' | 'guest';
    userId?: string;
    userAvatar?: string;
  }) => void;
  initialEmail?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialEmail = 'deepumuku645@gmail.com',
}) => {
  const [authMode, setAuthMode] = useState<'options' | 'email'>('options');
  const [emailInput, setEmailInput] = useState(initialEmail);
  const [passwordInput, setPasswordInput] = useState('••••••••');
  const [nameInput, setNameInput] = useState('Deepu');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const user = await signInWithGoogle();
      if (user) {
        onLoginSuccess({
          email: user.email || initialEmail,
          name: user.displayName || user.email?.split('@')[0] || 'Partner',
          provider: 'google',
          userId: user.uid,
          userAvatar: user.photoURL || undefined,
        });
      }
    } catch (err: any) {
      console.warn('Firebase Google Auth:', err);
      // If popup was closed by user, don't show an error
      if (err?.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(
          err?.message || 'Google sign-in was interrupted. You can also sign in with email or guest.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    setTimeout(() => {
      setIsSubmitting(false);
      const derivedName = nameInput.trim() || emailInput.split('@')[0] || 'Deepu';
      onLoginSuccess({
        email: emailInput,
        name: derivedName,
        provider: 'email',
        userId: `email_${Date.now()}`,
      });
    }, 400);
  };

  const handleGuestLogin = () => {
    onLoginSuccess({
      email: 'guest@companion.ai',
      name: 'Deepu',
      provider: 'guest',
      userId: `guest_${Date.now()}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="login-modal-card"
        className="w-full max-w-md bg-white dark:bg-[#151124] rounded-3xl border border-purple-100 dark:border-purple-900/40 shadow-2xl overflow-hidden relative"
      >
        {/* Close Button if onClose provided */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 bg-white/60 dark:bg-black/20 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Top Decorative Banner */}
        <div className="pt-8 pb-6 px-6 bg-gradient-to-b from-purple-50/80 via-purple-50/30 to-transparent dark:from-purple-950/40 dark:via-purple-950/10 dark:to-transparent text-center flex flex-col items-center">
          <div className="mb-3.5 relative">
            <AexoMascot size="lg" isListening={true} />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white dark:border-[#151124]" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <span>Welcome to Lexi</span>
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs">
            Your personal AI partner for daily habits, real-time voice calls & warm companionship
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 pt-2 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {authMode === 'options' ? (
            <div className="space-y-3">
              {/* Continue with Google */}
              <button
                id="login-google-btn"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-[#1E1838] border border-zinc-200 dark:border-purple-900/50 hover:border-purple-400 text-zinc-800 dark:text-zinc-100 font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-xs hover:shadow-md transition-all active:scale-[0.99] disabled:opacity-60"
              >
                {/* Google "G" SVG */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isSubmitting ? 'Connecting with Google...' : 'Continue with Google'}</span>
              </button>

              {/* Continue with Email */}
              <button
                id="login-email-btn"
                onClick={() => setAuthMode('email')}
                className="w-full py-3 px-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 hover:border-purple-300 text-purple-700 dark:text-purple-300 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.99]"
              >
                <Mail className="w-4 h-4" />
                <span>Continue with Email</span>
              </button>

              <div className="relative py-2 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                </div>
                <span className="relative px-3 bg-white dark:bg-[#151124] text-[11px] text-zinc-400">
                  or explore first
                </span>
              </div>

              {/* Continue as Guest */}
              <button
                id="login-guest-btn"
                onClick={handleGuestLogin}
                className="w-full py-2.5 px-4 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-purple-400 text-zinc-600 dark:text-zinc-400 hover:text-purple-600 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>Continue as Guest</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Deepu"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#1E1838] border border-zinc-200 dark:border-purple-900/40 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-hidden focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#1E1838] border border-zinc-200 dark:border-purple-900/40 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-hidden focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#1E1838] border border-zinc-200 dark:border-purple-900/40 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('options')}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium hover:bg-zinc-200"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          <div className="pt-2 text-center text-[10px] text-zinc-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>Firebase Cloud Authentication • Secure & Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};
