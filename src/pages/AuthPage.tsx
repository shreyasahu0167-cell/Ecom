import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

interface AuthPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onNavigate }) => {
  const { isSupabaseConfigured, signIn, signUp, demoUserLogin, profile, signOut } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (profile) {
    return (
      <div className="bg-background min-h-[70vh] py-20 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8 bg-surface-container-low border border-outline-variant/30 text-center space-y-6">
          <div className="w-12 h-12 bg-antique-gold/20 text-antique-gold rounded-full flex items-center justify-center mx-auto">
            {profile.role === 'admin' ? <Shield className="w-6 h-6" /> : <User className="w-6 h-6" />}
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-sans tracking-widest text-antique-gold uppercase font-semibold">
              Authenticated Session
            </span>
            <h2 className="font-serif text-2xl text-charcoal-text">
              {profile.fullName || profile.email}
            </h2>
            <p className="text-xs font-sans text-charcoal-text/70">
              Role: <span className="font-semibold text-charcoal-text uppercase">{profile.role}</span>
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3 text-xs font-sans">
            {profile.role === 'admin' && (
              <button
                onClick={() => onNavigate('admin')}
                className="w-full py-3 bg-primary text-ivory-base font-semibold tracking-wider uppercase hover:bg-charcoal-text"
              >
                Go to Admin Dashboard
              </button>
            )}
            <button
              onClick={() => onNavigate('shop')}
              className="w-full py-3 bg-surface-container border border-outline-variant/50 text-charcoal-text hover:border-charcoal-text"
            >
              Browse Couture Catalog
            </button>
            <button
              onClick={async () => {
                await signOut();
                onNavigate('home');
              }}
              className="text-deep-rose hover:underline pt-2"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (isRegister) {
        await signUp(email, password, fullName);
      } else {
        await signIn(email, password);
      }
      onNavigate('shop');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background min-h-screen py-16">
      <div className="max-w-md mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-xs font-sans tracking-[0.25em] text-antique-gold uppercase font-semibold">
            Client & Admin Portal
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-text">
            {isRegister ? 'Create Couture Account' : 'Account Access'}
          </h1>
          <p className="font-sans text-xs text-charcoal-text/70">
            Sign in to access your bespoke couture wardrobe, measurements, and order history.
          </p>
        </div>

        {/* Live Supabase Auth Form */}
        <div className="bg-surface-container-low p-8 border border-outline-variant/30 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-error/10 border border-error/30 text-error text-xs font-sans flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            {isRegister && (
              <div>
                <label className="block text-charcoal-text/80 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Radhika Sharma"
                  className="w-full bg-background border border-outline-variant/50 p-2.5 text-xs text-charcoal-text focus:outline-none focus:border-antique-gold"
                />
              </div>
            )}

            <div>
              <label className="block text-charcoal-text/80 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="user@domain.com"
                  className="w-full bg-background border border-outline-variant/50 p-2.5 pl-9 text-xs text-charcoal-text focus:outline-none focus:border-antique-gold"
                />
                <Mail className="w-4 h-4 text-outline absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-charcoal-text/80 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-background border border-outline-variant/50 p-2.5 pl-9 text-xs text-charcoal-text focus:outline-none focus:border-antique-gold"
                />
                <Lock className="w-4 h-4 text-outline absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-primary text-ivory-base font-sans text-xs font-semibold tracking-[0.2em] uppercase hover:bg-charcoal-text transition-all duration-300 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{isRegister ? 'Register Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-outline-variant/20 text-xs font-sans">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMsg(null);
              }}
              className="text-charcoal-text/80 hover:text-charcoal-text underline"
            >
              {isRegister
                ? 'Already have an account? Sign in'
                : "Don't have an account? Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
