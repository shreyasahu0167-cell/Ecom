import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  KeyRound,
  User,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  Database,
  Shield,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  Check,
  X,
  Send,
  RefreshCw,
  ArrowLeft,
  Trash2,
} from 'lucide-react';
import {
  registerAdmin,
  loginAdmin,
  getAdminCount,
  getRegisteredAdmins,
  setAdminSession,
  clearAllRegisteredAdmins,
  MAX_ADMIN_ACCOUNTS,
} from '../../services/adminAuthService';
import { useAuth } from '../../context/AuthContext';
import { validatePasswordPolicy } from '../../utils/passwordValidation';

interface AdminAuthGuardProps {
  onAuthenticated: () => void;
  onExit: () => void;
}

export const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ onAuthenticated, onExit }) => {
  const {
    signIn,
    signUp,
    sendPasswordResetEmail,
    updateUserPassword,
    isSupabaseConfigured,
    isDemoMode,
    demoUserLogin,
  } = useAuth();

  const [adminCount, setAdminCount] = useState<number>(0);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Form State (strictly empty by default - no hardcoded values)
  const [fullName, setFullName] = useState('');
  const [roleTitle, setRoleTitle] = useState('Atelier Manager');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Confirmation Popup State
  const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Live password validation
  const passwordValidation = validatePasswordPolicy(password);

  useEffect(() => {
    const count = getAdminCount();
    setAdminCount(count);
    if (count === 0 && !isSupabaseConfigured && isDemoMode) {
      setAuthMode('register');
    }
  }, [isSupabaseConfigured, isDemoMode]);

  const handleModeSwitch = (mode: 'login' | 'register' | 'forgot') => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setPassword('');
    setConfirmPassword('');
    setRecoveryCode('');
    setSimulatedOtp(null);
    setAuthMode(mode);
  };

  const handlePurgeAllAdmins = () => {
    if (window.confirm('Delete all saved administrator accounts? This will clear all stored credentials and reset available administrator slots.')) {
      clearAllRegisteredAdmins();
      setAdminCount(0);
      setEmail('');
      setPassword('');
      setSuccessMsg('All saved administrator accounts deleted.');
      setErrorMsg(null);
    }
  };

  const handleAdminSendRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg('Please enter your administrator email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendPasswordResetEmail(trimmedEmail);
      setIsLoading(false);
      setSuccessMsg(res.message);
      if (res.demoCode) {
        setSimulatedOtp(res.demoCode);
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Failed to dispatch recovery code.');
    }
  };

  const handleAdminResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim();
    const trimmedCode = recoveryCode.trim();

    if (!trimmedEmail) {
      setErrorMsg('Please enter your administrator email address.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your new administrator password.');
      return;
    }

    if (!passwordValidation.isValid) {
      setErrorMsg(passwordValidation.error || 'Password does not meet required security criteria.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);
    try {
      await updateUserPassword(password);
      setIsLoading(false);
      setSuccessMsg('Administrator password reset successfully. You may now sign in.');
      setTimeout(() => {
        handleModeSwitch('login');
      }, 1500);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Password reset failed.');
    }
  };

  // Called when user clicks "Sign In" or "Register" button on the form
  const handleInitiateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg('Please provide a valid administrator email address.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your administrator password.');
      return;
    }

    if (password.length > 14) {
      setErrorMsg('Password must not exceed 14 characters in length.');
      return;
    }

    if (authMode === 'register') {
      if (!passwordValidation.isValid) {
        setErrorMsg(passwordValidation.error || 'Password does not satisfy all required security rules.');
        return;
      }

      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please verify.');
        return;
      }
    }

    // Open Save Credentials Confirmation Popup
    setShowSaveConfirmModal(true);
  };

  // Called from confirmation popup when admin decides to save or not save
  const handleConfirmAuthWithPolicy = async (saveInBackend: boolean) => {
    setShowSaveConfirmModal(false);
    setIsLoading(true);
    setErrorMsg(null);

    if (authMode === 'login') {
      if (isSupabaseConfigured) {
        try {
          await signIn(email, password);
          // Set local admin session so portal header and clearance state displays correctly
          const existing = getRegisteredAdmins().find(a => a.email.toLowerCase() === email.trim().toLowerCase());
          if (existing) {
            setAdminSession(existing, saveInBackend);
          } else {
            loginAdmin(email, password, saveInBackend);
          }
          onAuthenticated();
        } catch (err: any) {
          setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
          setIsLoading(false);
        }
      } else if (isDemoMode) {
        demoUserLogin('admin');
        const result = loginAdmin(email, password, saveInBackend);
        if (result.success) {
          onAuthenticated();
        } else {
          setErrorMsg(result.error || 'Authentication failed. Please verify credentials.');
          setIsLoading(false);
        }
      } else {
        setErrorMsg('Authentication is unavailable because Supabase is not configured and Demo Mode is disabled.');
        setIsLoading(false);
      }
    } else {
      if (isSupabaseConfigured) {
        try {
          // Register credentials with Supabase
          await signUp(email, password, fullName.trim() || 'Atelier Administrator');
          // Also track local admin session metadata for atelier clearance
          registerAdmin({
            email,
            password,
            fullName: fullName.trim() || 'Atelier Administrator',
            roleTitle: roleTitle.trim() || 'Atelier Manager',
            saveInBackend,
          });
          setSuccessMsg('Administrator account registered successfully.');
          setAdminCount(getAdminCount());
          setTimeout(() => {
            onAuthenticated();
          }, 600);
        } catch (err: any) {
          setErrorMsg(err.message || 'Registration failed.');
          setIsLoading(false);
        }
      } else if (isDemoMode) {
        const result = registerAdmin({
          email,
          password,
          fullName: fullName.trim() || 'Atelier Administrator',
          roleTitle: roleTitle.trim() || 'Atelier Manager',
          saveInBackend,
        });

        if (result.success) {
          demoUserLogin('admin');
          setSuccessMsg('Administrator account registered successfully.');
          setAdminCount(getAdminCount());
          setTimeout(() => {
            onAuthenticated();
          }, 500);
        } else {
          setErrorMsg(result.error || 'Registration failed.');
          setIsLoading(false);
        }
      } else {
        setErrorMsg('Registration is unavailable because Supabase is not configured and Demo Mode is disabled.');
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-ivory-base flex flex-col justify-between p-4 sm:p-6 selection:bg-antique-gold/30">
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full pt-2 sm:pt-4">
        <div className="flex items-center gap-2">
          <span className="font-serif tracking-[0.2em] text-lg text-ivory-base">SAANVYA</span>
          <span className="text-[10px] font-sans font-semibold tracking-widest text-antique-gold uppercase px-2 py-0.5 border border-antique-gold/40">
            Atelier Portal
          </span>
        </div>
        <button
          onClick={onExit}
          className="text-xs font-sans text-ivory-base/60 hover:text-ivory-base transition-colors"
        >
          Return to Customer Storefront →
        </button>
      </div>

      {/* Main Administrative Auth Card */}
      <div className="max-w-md w-full mx-auto my-auto p-6 sm:p-8 bg-[#1A1A1A] border border-[#2D2D2D] shadow-2xl space-y-6">
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-none bg-antique-gold/15 text-antique-gold flex items-center justify-center mx-auto border border-antique-gold/30">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="font-serif text-2xl text-ivory-base pt-1">
            Atelier Admin Portal
          </h1>
          
          {/* Admin Quota Indicator & Clear Option */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#141414] border border-[#333333] text-[10px] font-sans text-ivory-base/70">
              <Shield className="w-3 h-3 text-antique-gold" />
              <span>Admin Capacity: </span>
              <strong className="text-antique-gold font-mono font-semibold">
                {adminCount} / {MAX_ADMIN_ACCOUNTS} Active
              </strong>
            </div>

            {adminCount > 0 && (
              <button
                type="button"
                onClick={handlePurgeAllAdmins}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-950/60 border border-red-800/80 text-[10px] font-sans text-red-300 hover:bg-red-900 hover:text-white transition-colors"
                title="Delete all saved administrator accounts"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete All Saved Admins</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher (Login / Register) */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#141414] border border-[#2A2A2A] text-xs font-sans">
          <button
            type="button"
            onClick={() => handleModeSwitch('login')}
            className={`py-2 text-center transition-colors flex items-center justify-center gap-1.5 ${
              authMode === 'login'
                ? 'bg-antique-gold text-primary font-semibold'
                : 'text-ivory-base/60 hover:text-ivory-base'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            disabled={adminCount >= MAX_ADMIN_ACCOUNTS}
            onClick={() => handleModeSwitch('register')}
            className={`py-2 text-center transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed ${
              authMode === 'register'
                ? 'bg-antique-gold text-primary font-semibold'
                : 'text-ivory-base/60 hover:text-ivory-base'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register Admin</span>
          </button>
        </div>

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 text-xs font-sans flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs font-sans flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ================= LOGIN FORM ================= */}
        {authMode === 'login' && (
          <form onSubmit={handleInitiateSubmit} className="space-y-4 font-sans text-xs" autoComplete="off">
            {adminCount === 0 && (
              <div className="p-3 bg-amber-950/40 border border-amber-800/60 text-amber-200 text-[11px] font-sans">
                No admin registered yet. Please click <strong>"Register Admin"</strong> to create your first administrative credentials.
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-ivory-base/80">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-antique-gold absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  autoComplete="off"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@saanvya.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-[#141414] border border-[#333333] focus:border-antique-gold focus:outline-none text-ivory-base text-xs"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-ivory-base/80">
                  Password (max 14 chars)
                </label>
                <button
                  type="button"
                  onClick={() => handleModeSwitch('forgot')}
                  className="text-[10px] text-antique-gold hover:text-ivory-base transition-colors tracking-wide underline uppercase"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-antique-gold absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  maxLength={14}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="w-full pl-9 pr-10 py-2.5 bg-[#141414] border border-[#333333] focus:border-antique-gold focus:outline-none text-ivory-base text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-ivory-base/40 hover:text-ivory-base"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-antique-gold text-primary font-semibold tracking-wider uppercase text-xs hover:bg-antique-gold-light transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In to Atelier'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ================= FORGOT / RESET PASSWORD FORM ================= */}
        {authMode === 'forgot' && (
          <div className="space-y-4 font-sans text-xs">
            <div className="p-3 bg-[#141414] border border-[#2D2D2D] text-ivory-base/80 text-[11px] leading-relaxed">
              Enter your registered administrator email address to receive a secure 6-digit recovery code and reset your password.
            </div>

            {/* Step A: Request Code */}
            {!simulatedOtp ? (
              <form onSubmit={handleAdminSendRecovery} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-ivory-base/80">
                    Administrator Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-antique-gold absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="admin@saanvya.com"
                      className="w-full pl-9 pr-4 py-2 bg-[#141414] border border-[#333333] focus:border-antique-gold focus:outline-none text-ivory-base text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-antique-gold text-primary font-semibold tracking-wider uppercase text-xs hover:bg-antique-gold-light transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Dispatching Code...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Recovery Code</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Step B: Verify Code & Set New Password */
              <form onSubmit={handleAdminResetPassword} className="space-y-3.5">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-ivory-base/80">
                      6-Digit Recovery Verification Code
                    </label>
                    <button
                      type="button"
                      onClick={() => setRecoveryCode(simulatedOtp)}
                      className="text-[10px] text-antique-gold hover:underline"
                    >
                      Auto-fill Code
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-antique-gold absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={recoveryCode}
                      onChange={e => setRecoveryCode(e.target.value)}
                      placeholder="e.g. 123456"
                      className="w-full pl-9 pr-4 py-2 bg-[#141414] border border-[#333333] focus:border-antique-gold focus:outline-none font-mono text-ivory-base text-xs tracking-widest"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-ivory-base/80">
                      New Password (Max 14 Chars)
                    </label>
                    <span className="text-[10px] font-mono text-ivory-base/50">
                      {password.length}/14
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-antique-gold absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      maxLength={14}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter new administrator password"
                      className="w-full pl-9 pr-10 py-2 bg-[#141414] border border-[#333333] focus:border-antique-gold focus:outline-none text-ivory-base text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-ivory-base/40 hover:text-ivory-base"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password rules checklist */}
                <div className="p-2.5 bg-[#141414] border border-[#2D2D2D] space-y-1 text-[10px]">
                  <span className="text-ivory-base/70 font-semibold uppercase tracking-wider block mb-1">
                    Password Security Rules:
                  </span>
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    <div className={`flex items-center gap-1.5 ${passwordValidation.rules.hasMax14 && passwordValidation.rules.hasMinLength ? 'text-emerald-400' : 'text-ivory-base/50'}`}>
                      {passwordValidation.rules.hasMax14 && passwordValidation.rules.hasMinLength ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-ivory-base/40" />}
                      <span>6 - 14 characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordValidation.rules.hasUppercase ? 'text-emerald-400' : 'text-ivory-base/50'}`}>
                      {passwordValidation.rules.hasUppercase ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-ivory-base/40" />}
                      <span>1 Uppercase (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordValidation.rules.hasLowercase ? 'text-emerald-400' : 'text-ivory-base/50'}`}>
                      {passwordValidation.rules.hasLowercase ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-ivory-base/40" />}
                      <span>1 Lowercase (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordValidation.rules.hasTwoNumbers ? 'text-emerald-400' : 'text-ivory-base/50'}`}>
                      {passwordValidation.rules.hasTwoNumbers ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-ivory-base/40" />}
                      <span>2 Numbers (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 col-span-2 ${passwordValidation.rules.hasSpecialChar ? 'text-emerald-400' : 'text-ivory-base/50'}`}>
                      {passwordValidation.rules.hasSpecialChar ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-ivory-base/40" />}
                      <span>1 Special Character (!@#$%^&*...)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-ivory-base/80">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-antique-gold absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      maxLength={14}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full pl-9 pr-4 py-2 bg-[#141414] border border-[#333333] focus:border-antique-gold focus:outline-none text-ivory-base text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-antique-gold text-primary font-semibold tracking-wider uppercase text-xs hover:bg-antique-gold-light transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Updating Password...</span>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Update Administrator Password</span>
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="pt-2 text-center border-t border-[#2D2D2D]">
              <button
                type="button"
                onClick={() => handleModeSwitch('login')}
                className="text-xs text-ivory-base/60 hover:text-ivory-base flex items-center justify-center gap-1.5 mx-auto transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Administrator Sign In</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= REGISTER FORM ================= */}
        {authMode === 'register' && (
          <form onSubmit={handleInitiateSubmit} className="space-y-3.5 font-sans text-xs" autoComplete="off">
            {/* Quota Notice */}
            <div className="p-2.5 bg-[#141414] border border-[#2D2D2D] text-[11px] text-ivory-base/80 flex items-center justify-between">
              <span>Admin Quota Slot:</span>
              <span className="font-semibold text-antique-gold">
                Slot {adminCount + 1} of {MAX_ADMIN_ACCOUNTS}
              </span>
            </div>

            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-ivory-base/80">
                Full Name / Atelier Designation
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-antique-gold absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  autoComplete="off"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Atelier Administrator"
                  className="w-full pl-9 pr-4 py-2 bg-[#141414] border border-[#333333] focus:border-antique-gold focus:outline-none text-ivory-base text-xs"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-ivory-base/80">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-antique-gold absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  autoComplete="off"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@saanvya.com"
                  className="w-full pl-9 pr-4 py-2 bg-[#141414] border border-[#333333] focus:border-antique-gold focus:outline-none text-ivory-base text-xs"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-ivory-base/80">
                  Password (Max 14 Chars)
                </label>
                <span className="text-[10px] font-mono text-ivory-base/50">
                  {password.length}/14
                </span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-antique-gold absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  maxLength={14}
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="e.g. SaanvyaAdmin@Secure1"
                  className="w-full pl-9 pr-10 py-2 bg-[#141414] border border-[#333333] focus:border-antique-gold focus:outline-none text-ivory-base text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-ivory-base/40 hover:text-ivory-base"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Live Password Requirements Checklist */}
            <div className="p-2.5 bg-[#141414] border border-[#2D2D2D] space-y-1 text-[10px]">
              <span className="text-ivory-base/70 font-semibold uppercase tracking-wider block mb-1">
                Password Security Rules:
              </span>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <div className={`flex items-center gap-1.5 ${passwordValidation.rules.hasMax14 && passwordValidation.rules.hasMinLength ? 'text-emerald-400' : 'text-ivory-base/50'}`}>
                  {passwordValidation.rules.hasMax14 && passwordValidation.rules.hasMinLength ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-ivory-base/40" />}
                  <span>6 - 14 characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordValidation.rules.hasUppercase ? 'text-emerald-400' : 'text-ivory-base/50'}`}>
                  {passwordValidation.rules.hasUppercase ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-ivory-base/40" />}
                  <span>1 Uppercase (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordValidation.rules.hasLowercase ? 'text-emerald-400' : 'text-ivory-base/50'}`}>
                  {passwordValidation.rules.hasLowercase ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-ivory-base/40" />}
                  <span>1 Lowercase (a-z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordValidation.rules.hasTwoNumbers ? 'text-emerald-400' : 'text-ivory-base/50'}`}>
                  {passwordValidation.rules.hasTwoNumbers ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-ivory-base/40" />}
                  <span>2 Numbers (0-9)</span>
                </div>
                <div className={`flex items-center gap-1.5 col-span-2 ${passwordValidation.rules.hasSpecialChar ? 'text-emerald-400' : 'text-ivory-base/50'}`}>
                  {passwordValidation.rules.hasSpecialChar ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-ivory-base/40" />}
                  <span>1 Special Character (!@#$%^&*...)</span>
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-ivory-base/80">
                Confirm Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-antique-gold absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  maxLength={14}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-9 pr-4 py-2 bg-[#141414] border border-[#333333] focus:border-antique-gold focus:outline-none text-ivory-base text-xs"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || adminCount >= MAX_ADMIN_ACCOUNTS}
              className="w-full py-3 bg-antique-gold text-primary font-semibold tracking-wider uppercase text-xs hover:bg-antique-gold-light transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'Processing...' : 'Register & Enter Atelier'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* Save Password Confirmation Modal / Popup */}
      {showSaveConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#1A1A1A] border border-antique-gold/50 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 border-b border-[#2D2D2D] pb-3">
              <div className="w-10 h-10 bg-antique-gold/15 text-antique-gold flex items-center justify-center border border-antique-gold/30">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-ivory-base font-medium">
                  Save Credentials in Backend?
                </h3>
                <p className="text-[11px] font-sans text-ivory-base/60">
                  {authMode === 'register' ? 'Admin Registration Confirmation' : 'Sign-In Confirmation'}
                </p>
              </div>
            </div>

            <p className="font-sans text-xs text-ivory-base/80 leading-relaxed">
              Would you like to securely store your administrator credentials in persistent backend storage for subsequent sessions on this workstation?
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleConfirmAuthWithPolicy(true)}
                className="w-full py-3 bg-antique-gold text-primary font-semibold text-xs uppercase tracking-wider hover:bg-antique-gold-light transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Yes — Save in Backend Database</span>
              </button>

              <button
                type="button"
                onClick={() => handleConfirmAuthWithPolicy(false)}
                className="w-full py-2.5 bg-[#252525] border border-[#3D3D3D] text-ivory-base text-xs hover:bg-[#2F2F2F] transition-colors flex items-center justify-center gap-2"
              >
                <span>No — Temporary Session Only</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSaveConfirmModal(false)}
                className="w-full py-1.5 text-center text-[11px] text-ivory-base/50 hover:text-ivory-base underline transition-colors"
              >
                Cancel & Review Form
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-[10px] font-sans text-ivory-base/40 max-w-md mx-auto w-full pb-2">
        Protected Administrative Realm • Saanvya Atelier Private Gateway
      </div>
    </div>
  );
};
