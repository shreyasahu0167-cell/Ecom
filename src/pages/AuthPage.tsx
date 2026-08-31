import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  User,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
  X,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  Send,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { validatePasswordPolicy } from '../utils/passwordValidation';

interface AuthPageProps {
  onNavigate: (page: string, params?: any) => void;
  initialMode?: 'login' | 'register' | 'forgot' | 'reset-password';
}

export const AuthPage: React.FC<AuthPageProps> = ({ onNavigate, initialMode }) => {
  const {
    signIn,
    signUp,
    profile,
    profileError,
    signOut,
    sendPasswordResetEmail,
    updateUserPassword,
    isPasswordRecoveryMode,
    setIsPasswordRecoveryMode,
    isSupabaseConfigured,
    isDemoMode,
  } = useAuth();

  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot' | 'reset-password'>(
    initialMode || (isPasswordRecoveryMode ? 'reset-password' : 'login')
  );

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Notifications & State
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);

  const passwordValidation = validatePasswordPolicy(password);

  useEffect(() => {
    if (isPasswordRecoveryMode) {
      setAuthMode('reset-password');
    }
  }, [isPasswordRecoveryMode]);

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
                className="w-full py-3 bg-primary text-ivory-base font-semibold tracking-wider uppercase hover:bg-charcoal-text transition-colors"
              >
                Go to Admin Dashboard
              </button>
            )}
            <button
              onClick={() => onNavigate('shop')}
              className="w-full py-3 bg-surface-container border border-outline-variant/50 text-charcoal-text hover:border-charcoal-text transition-colors"
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

  const handleModeSwitch = (mode: 'login' | 'register' | 'forgot' | 'reset-password') => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setSimulatedCode(null);
    setPassword('');
    setConfirmPassword('');
    setRecoveryCode('');
    setAuthMode(mode);
  };

  const handleSignInOrRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    if (password.length > 14) {
      setErrorMsg('Password must be a maximum of 14 characters.');
      return;
    }

    if (authMode === 'register') {
      if (!passwordValidation.isValid) {
        setErrorMsg(passwordValidation.error || 'Password does not meet all required security rules.');
        return;
      }

      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please verify.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (authMode === 'register') {
        await signUp(trimmedEmail, password, fullName.trim());
      } else {
        await signIn(trimmedEmail, password);
      }
      onNavigate('shop');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendRecoveryEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg('Please enter the email address associated with your account.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await sendPasswordResetEmail(trimmedEmail);
      setSuccessMsg(res.message);
      if (res.demoCode) {
        setSimulatedCode(res.demoCode);
      }
      // If demo mode, switch automatically to code verification & new password form
      if (!isSupabaseConfigured) {
        setTimeout(() => {
          setAuthMode('reset-password');
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch recovery email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!password) {
      setErrorMsg('Please enter your new password.');
      return;
    }

    if (!passwordValidation.isValid) {
      setErrorMsg(passwordValidation.error || 'Password must meet all required security rules.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    // If local demo verification is needed
    if (!isSupabaseConfigured && simulatedCode) {
      const activeCode = sessionStorage.getItem('saanvya_demo_reset_code');
      if (recoveryCode.trim() && recoveryCode.trim() !== activeCode) {
        setErrorMsg('Invalid verification code. Please check the 6-digit code.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      await updateUserPassword(password);
      setResetCompleted(true);
      setSuccessMsg('Your password has been successfully updated. You can now sign in.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset password.');
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
            Client & Atelier Portal
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-text">
            {authMode === 'login' && 'Account Access'}
            {authMode === 'register' && 'Create Couture Account'}
            {authMode === 'forgot' && 'Password Recovery'}
            {authMode === 'reset-password' && 'Set New Password'}
          </h1>
          <p className="font-sans text-xs text-charcoal-text/70">
            {authMode === 'login' &&
              'Sign in to access your bespoke couture wardrobe, measurements, and orders.'}
            {authMode === 'register' &&
              'Register to enjoy bespoke consultations, private previews, and concierge services.'}
            {authMode === 'forgot' &&
              'Enter your email address to receive password recovery instructions and a secure reset link.'}
            {authMode === 'reset-password' &&
              'Create a strong, secure password for your Saanvya account.'}
          </p>
        </div>

        {/* Live Auth Box */}
        <div className="bg-surface-container-low p-8 border border-outline-variant/30 space-y-6">
          {profileError && (
            <div className="p-3.5 bg-error/10 border border-error/30 text-error text-xs font-sans flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Profile Clearance Error</p>
                <p>{profileError}</p>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="text-[11px] underline text-error font-medium block pt-1"
                >
                  Sign Out and Retry
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-error/10 border border-error/30 text-error text-xs font-sans flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-600/30 text-emerald-800 text-xs font-sans flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-medium">{successMsg}</p>
                {simulatedCode && (
                  <div className="mt-2 pt-2 border-t border-emerald-600/20 text-[11px]">
                    <span className="text-charcoal-text/80 block">Simulated Email Verification OTP:</span>
                    <span className="font-mono text-sm font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 mt-1 inline-block tracking-wider">
                      {simulatedCode}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* VIEW 1: SIGN IN / REGISTER FORM */}
          {/* ========================================================== */}
          {(authMode === 'login' || authMode === 'register') && (
            <form onSubmit={handleSignInOrRegister} className="space-y-4 text-xs font-sans" autoComplete="off">
              {authMode === 'register' && (
                <div>
                  <label className="block text-charcoal-text/80 uppercase tracking-wider mb-1 text-[10px] font-semibold">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-outline absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      autoComplete="off"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full bg-background border border-outline-variant/50 p-2.5 pl-9 text-xs text-charcoal-text focus:outline-none focus:border-antique-gold"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-charcoal-text/80 uppercase tracking-wider mb-1 text-[10px] font-semibold">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-outline absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="user@domain.com"
                    className="w-full bg-background border border-outline-variant/50 p-2.5 pl-9 text-xs text-charcoal-text focus:outline-none focus:border-antique-gold"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-charcoal-text/80 uppercase tracking-wider text-[10px] font-semibold">
                    Password (Max 14 Chars)
                  </label>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => handleModeSwitch('forgot')}
                      className="text-[10px] text-antique-gold hover:text-charcoal-text transition-colors tracking-wide underline uppercase font-medium"
                    >
                      Forgot Password?
                    </button>
                  )}
                  {authMode === 'register' && (
                    <span className="text-[10px] font-mono text-charcoal-text/60">
                      {password.length}/14
                    </span>
                  )}
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-outline absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    maxLength={14}
                    autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-background border border-outline-variant/50 p-2.5 pl-9 pr-10 text-xs text-charcoal-text focus:outline-none focus:border-antique-gold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-charcoal-text/50 hover:text-charcoal-text"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Policy Checklist on Register */}
              {authMode === 'register' && (
                <>
                  <div className="p-3 bg-surface-container border border-outline-variant/40 space-y-1.5 text-[11px]">
                    <span className="font-semibold text-charcoal-text/80 uppercase tracking-wider block text-[10px]">
                      Required Password Rules:
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                      <div className={`flex items-center gap-1.5 ${passwordValidation.rules.hasMax14 && passwordValidation.rules.hasMinLength ? 'text-emerald-700 font-medium' : 'text-charcoal-text/60'}`}>
                        {passwordValidation.rules.hasMax14 && passwordValidation.rules.hasMinLength ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-charcoal-text/40" />}
                        <span>6 - 14 Characters</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${passwordValidation.rules.hasUppercase ? 'text-emerald-700 font-medium' : 'text-charcoal-text/60'}`}>
                        {passwordValidation.rules.hasUppercase ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-charcoal-text/40" />}
                        <span>1 Uppercase (A-Z)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${passwordValidation.rules.hasLowercase ? 'text-emerald-700 font-medium' : 'text-charcoal-text/60'}`}>
                        {passwordValidation.rules.hasLowercase ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-charcoal-text/40" />}
                        <span>1 Lowercase (a-z)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${passwordValidation.rules.hasTwoNumbers ? 'text-emerald-700 font-medium' : 'text-charcoal-text/60'}`}>
                        {passwordValidation.rules.hasTwoNumbers ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-charcoal-text/40" />}
                        <span>2 Numbers (0-9)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 col-span-2 ${passwordValidation.rules.hasSpecialChar ? 'text-emerald-700 font-medium' : 'text-charcoal-text/60'}`}>
                        {passwordValidation.rules.hasSpecialChar ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-charcoal-text/40" />}
                        <span>1 Special Char (!@#$%^&*...)</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-charcoal-text/80 uppercase tracking-wider mb-1 text-[10px] font-semibold">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-outline absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        maxLength={14}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        className="w-full bg-background border border-outline-variant/50 p-2.5 pl-9 text-xs text-charcoal-text focus:outline-none focus:border-antique-gold"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-primary text-ivory-base font-sans text-xs font-semibold tracking-[0.2em] uppercase hover:bg-charcoal-text transition-all duration-300 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>{authMode === 'register' ? 'Register Account' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================== */}
          {/* VIEW 2: FORGOT PASSWORD (REQUEST EMAIL RECOVERY) */}
          {/* ========================================================== */}
          {authMode === 'forgot' && (
            <form onSubmit={handleSendRecoveryEmail} className="space-y-4 text-xs font-sans">
              <div className="p-3 bg-surface-container border border-outline-variant/30 text-charcoal-text/80 text-[11px] leading-relaxed">
                Enter your registered couture account email address. We will immediately dispatch a secure password recovery message.
              </div>

              <div>
                <label className="block text-charcoal-text/80 uppercase tracking-wider mb-1 text-[10px] font-semibold">
                  Account Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-outline absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. yourname@domain.com"
                    className="w-full bg-background border border-outline-variant/50 p-2.5 pl-9 text-xs text-charcoal-text focus:outline-none focus:border-antique-gold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-primary text-ivory-base font-sans text-xs font-semibold tracking-[0.2em] uppercase hover:bg-charcoal-text transition-all duration-300 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Dispatching Email...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Recovery Email</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => handleModeSwitch('reset-password')}
                  className="text-xs text-charcoal-text/70 hover:text-charcoal-text underline"
                >
                  Already have a recovery code or reset link? Click here
                </button>
              </div>
            </form>
          )}

          {/* ========================================================== */}
          {/* VIEW 3: RESET PASSWORD (NEW PASSWORD INPUT) */}
          {/* ========================================================== */}
          {authMode === 'reset-password' && !resetCompleted && (
            <form onSubmit={handleResetPassword} className="space-y-4 text-xs font-sans">
              {!isSupabaseConfigured && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-charcoal-text/80 uppercase tracking-wider text-[10px] font-semibold">
                      6-Digit Recovery Verification Code
                    </label>
                    {simulatedCode && (
                      <button
                        type="button"
                        onClick={() => setRecoveryCode(simulatedCode)}
                        className="text-[10px] text-antique-gold hover:underline font-semibold"
                      >
                        Auto-fill Code
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-outline absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={recoveryCode}
                      onChange={e => setRecoveryCode(e.target.value)}
                      placeholder="e.g. 123456"
                      className="w-full bg-background border border-outline-variant/50 p-2.5 pl-9 font-mono tracking-widest text-xs text-charcoal-text focus:outline-none focus:border-antique-gold"
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-charcoal-text/80 uppercase tracking-wider text-[10px] font-semibold">
                    New Password (Max 14 Chars)
                  </label>
                  <span className="text-[10px] font-mono text-charcoal-text/60">
                    {password.length}/14
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-outline absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    maxLength={14}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter new secure password"
                    className="w-full bg-background border border-outline-variant/50 p-2.5 pl-9 pr-10 text-xs text-charcoal-text focus:outline-none focus:border-antique-gold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-charcoal-text/50 hover:text-charcoal-text"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Policy Checklist */}
              <div className="p-3 bg-surface-container border border-outline-variant/40 space-y-1.5 text-[11px]">
                <span className="font-semibold text-charcoal-text/80 uppercase tracking-wider block text-[10px]">
                  Required Password Rules:
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className={`flex items-center gap-1.5 ${passwordValidation.rules.hasMax14 && passwordValidation.rules.hasMinLength ? 'text-emerald-700 font-medium' : 'text-charcoal-text/60'}`}>
                    {passwordValidation.rules.hasMax14 && passwordValidation.rules.hasMinLength ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-charcoal-text/40" />}
                    <span>6 - 14 Characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordValidation.rules.hasUppercase ? 'text-emerald-700 font-medium' : 'text-charcoal-text/60'}`}>
                    {passwordValidation.rules.hasUppercase ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-charcoal-text/40" />}
                    <span>1 Uppercase (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordValidation.rules.hasLowercase ? 'text-emerald-700 font-medium' : 'text-charcoal-text/60'}`}>
                    {passwordValidation.rules.hasLowercase ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-charcoal-text/40" />}
                    <span>1 Lowercase (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordValidation.rules.hasTwoNumbers ? 'text-emerald-700 font-medium' : 'text-charcoal-text/60'}`}>
                    {passwordValidation.rules.hasTwoNumbers ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-charcoal-text/40" />}
                    <span>2 Numbers (0-9)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 col-span-2 ${passwordValidation.rules.hasSpecialChar ? 'text-emerald-700 font-medium' : 'text-charcoal-text/60'}`}>
                    {passwordValidation.rules.hasSpecialChar ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-charcoal-text/40" />}
                    <span>1 Special Char (!@#$%^&*...)</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-charcoal-text/80 uppercase tracking-wider mb-1 text-[10px] font-semibold">
                  Confirm New Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-outline absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    maxLength={14}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full bg-background border border-outline-variant/50 p-2.5 pl-9 text-xs text-charcoal-text focus:outline-none focus:border-antique-gold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-primary text-ivory-base font-sans text-xs font-semibold tracking-[0.2em] uppercase hover:bg-charcoal-text transition-all duration-300 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Updating Password...</span>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Set New Password</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Reset Completion View */}
          {resetCompleted && (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-xl text-charcoal-text">Password Updated</h3>
                <p className="text-xs text-charcoal-text/70">
                  Your password has been changed. You may now sign in with your new credentials.
                </p>
              </div>
              <button
                onClick={() => {
                  setResetCompleted(false);
                  handleModeSwitch('login');
                }}
                className="w-full py-3 bg-primary text-ivory-base text-xs font-semibold uppercase tracking-wider hover:bg-charcoal-text transition-colors"
              >
                Proceed to Sign In
              </button>
            </div>
          )}

          {/* Bottom Switcher Navigation */}
          <div className="text-center pt-3 border-t border-outline-variant/20 text-xs font-sans space-y-2">
            {authMode === 'login' && (
              <button
                type="button"
                onClick={() => handleModeSwitch('register')}
                className="text-charcoal-text/80 hover:text-charcoal-text underline block mx-auto"
              >
                Don't have an account? Register
              </button>
            )}

            {authMode === 'register' && (
              <button
                type="button"
                onClick={() => handleModeSwitch('login')}
                className="text-charcoal-text/80 hover:text-charcoal-text underline block mx-auto"
              >
                Already have an account? Sign in
              </button>
            )}

            {(authMode === 'forgot' || authMode === 'reset-password') && !resetCompleted && (
              <button
                type="button"
                onClick={() => handleModeSwitch('login')}
                className="text-charcoal-text/80 hover:text-charcoal-text flex items-center justify-center gap-1.5 mx-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

