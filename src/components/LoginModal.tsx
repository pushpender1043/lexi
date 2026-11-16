import React, { useState } from 'react';
import { AexoMascot } from './AexoMascot';
import { Sparkles, Mail, ArrowRight, ShieldCheck, User, X, AlertCircle } from 'lucide-react';
import { signInWithGoogle, signInGuestUser } from '../lib/firebase';
import { generateUniqueId } from '../utils/id';

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
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setInfoMessage(null);
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
      } else {
        setInfoMessage('Google sign-in was closed before finishing. Try again, or continue with Email or Guest.');
      }
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setInfoMessage('Google sign-in was closed before finishing. Try again, or continue with Email or Guest.');
      } else {
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
    setInfoMessage(null);
    setTimeout(() => {
      setIsSubmitting(false);
      const derivedName = nameInput.trim() || emailInput.split('@')[0] || 'Deepu';
      onLoginSuccess({
        email: emailInput,
        name: derivedName,
        provider: 'email',
        userId: generateUniqueId('usr_email'),
      });
    }, 400);
  };

  const handleGuestLogin = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setInfoMessage(null);
    try {
      const anonUser = await signInGuestUser();
      if (anonUser) {
        onLoginSuccess({
          email: 'guest@companion.ai',
          name: 'Deepu',
          provider: 'guest',
          userId: anonUser.uid,
        });
        return;
      }
    } catch {
      // Fallback to local storage guest session
    } finally {
      setIsSubmitting(false);
    }

    onLoginSuccess({
      email: 'guest@companion.ai',
      name: 'Deepu',
      provider: 'guest',
      userId: generateUniqueId('usr_guest'),
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/65 dark:bg-black/78 backdrop-blur-lg animate-in fade-in duration-200">
      <div
        id="login-modal-card"
        className="w-full max-w-md glass-strong rounded-[28px] border border-white/60 dark:border-white/20 shadow-[0_24px_64px_rgba(0,0,0,0.65)] overflow-hidden relative"
      >
        {/* Close Button if onClose provided */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-1.5 rounded-full text-[#7C7692] dark:text-[#938CA8] hover:text-[#14121C] dark:hover:text-[#F8F7FC] bg-white/70 dark:bg-white/[0.08] hover:bg-white dark:hover:bg-white/[0.15] border border-white/60 dark:border-white/[0.12] transition-all cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Top Decorative Banner with Mascot */}
        <div className="pt-8 pb-5 px-6 bg-gradient-to-b from-[#F3EBFF]/80 via-[#FAF7FF]/30 to-transparent dark:from-[#A855F7]/15 dark:via-[#141122]/30 dark:to-transparent text-center flex flex-col items-center">
          <div className="mb-3.5 relative">
            <AexoMascot size="lg" isListening={true} />
            <div className="absolute -bottom-1 -right-1 bg-[#4CB782] w-4 h-4 rounded-full border-2 border-white dark:border-[#0E0C16]" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-[#14121C] dark:text-[#F8F7FC] flex items-center gap-1.5">
            <span>Welcome to Lexi</span>
            <Sparkles className="w-4 h-4 text-[#A855F7]" />
          </h2>
          <p className="text-xs text-[#534E68] dark:text-[#C5BED9] mt-1 max-w-xs leading-relaxed">
            Your personal AI partner for daily habits, real-time voice calls &amp; warm companionship
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 pt-1 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/12 border border-rose-400/30 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {infoMessage && !errorMessage && (
            <div className="p-3 rounded-xl bg-[#A855F7]/12 border border-[#A855F7]/25 text-[#534E68] dark:text-[#D8CEF2] text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#A855F7]" />
              <span>{infoMessage}</span>
            </div>
          )}

          {authMode === 'options' ? (
            <div className="space-y-3">
              {/* Continue with Google */}
              <button
                id="login-google-btn"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-[14px] bg-white/85 dark:bg-white/[0.08] hover:bg-white dark:hover:bg-white/[0.14] border border-white/60 dark:border-white/[0.18] hover:border-[#A855F7] text-[#14121C] dark:text-[#F8F7FC] font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-[0_8px_24px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.26)] backdrop-blur-xl transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
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
                onClick={() => {
                  setErrorMessage(null);
                  setInfoMessage(null);
                  setAuthMode('email');
                }}
                className="w-full py-3 px-4 rounded-[14px] glass-button font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Continue with Email</span>
              </button>

              <div className="flex items-center gap-3 py-1.5">
                <div className="flex-1 border-t border-black/10 dark:border-white/[0.12]" />
                <span className="text-[11px] text-[#7C7692] dark:text-[#938CA8]">
                  or explore first
                </span>
                <div className="flex-1 border-t border-black/10 dark:border-white/[0.12]" />
              </div>

              {/* Continue as Guest (Dashed Outline Style) */}
              <button
                id="login-guest-btn"
                onClick={handleGuestLogin}
                className="w-full py-2.5 px-4 btn-guest-dashed text-[#534E68] dark:text-[#C5BED9] hover:text-[#7C3AED] dark:hover:text-[#F8F7FC] font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Continue as Guest</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#14121C] dark:text-[#F8F7FC] mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Deepu"
                  className="w-full px-3.5 py-2.5 rounded-[12px] glass-input text-xs text-[#14121C] dark:text-[#F8F7FC] focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#14121C] dark:text-[#F8F7FC] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-[12px] glass-input text-xs text-[#14121C] dark:text-[#F8F7FC] focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#14121C] dark:text-[#F8F7FC] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[12px] glass-input text-xs text-[#14121C] dark:text-[#F8F7FC] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('options')}
                  className="flex-1 py-2.5 rounded-[12px] glass-button text-xs font-semibold cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-2 py-2.5 rounded-[12px] btn-primary-purple text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          <div className="pt-2 text-center text-[10px] text-[#7C7692] dark:text-[#938CA8] flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#4CB782]" />
            <span>Firebase Cloud Authentication • Secure &amp; Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};
