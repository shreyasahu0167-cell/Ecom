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
} from 'lucide-react';
import {
  registerAdmin,
  loginAdmin,
  getAdminCount,
  MAX_ADMIN_ACCOUNTS,
  getRegisteredAdmins,
} from '../../services/adminAuthService';

interface AdminAuthGuardProps {
  onAuthenticated: () => void;
  onExit: () => void;
}

export const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ onAuthenticated, onExit }) => {
  const [adminCount, setAdminCount] = useState<number>(0);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Form State
  const [fullName, setFullName] = useState('');
  const [roleTitle, setRoleTitle] = useState('Atelier Manager');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saveInBackend, setSaveInBackend] = useState<boolean>(true);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const count = getAdminCount();
    setAdminCount(count);
    // If no admin accounts exist yet, default to register mode
    if (count === 0) {
      setAuthMode('register');
    }
  }, []);

  const handleModeSwitch = (mode: 'login' | 'register') => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setAuthMode(mode);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = loginAdmin(email, password, saveInBackend);
      if (result.success) {
        onAuthenticated();
      } else {
        setErrorMsg(result.error || 'Authentication failed.');
        setIsLoading(false);
      }
    }, 300);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters in length.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = registerAdmin({
        email,
        password,
        fullName: fullName.trim() || 'Atelier Administrator',
        roleTitle: roleTitle.trim() || 'Atelier Manager',
        saveInBackend,
      });

      if (result.success) {
        setSuccessMsg('Administrator account registered successfully.');
        setAdminCount(getAdminCount());
        setTimeout(() => {
          onAuthenticated();
        }, 500);
      } else {
        setErrorMsg(result.error || 'Registration failed.');
        setIsLoading(false);
      }
    }, 400);
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
          
          {/* Admin Quota Indicator */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#141414] border border-[#333333] text-[10px] font-sans text-ivory-base/70">
            <Shield className="w-3 h-3 text-antique-gold" />
            <span>Admin Capacity: </span>
            <strong className="text-antique-gold font-mono font-semibold">
              {adminCount} / {MAX_ADMIN_ACCOUNTS} Active
            </strong>
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
          <form onSubmit={handleLogin} className="space-y-4 font-sans text-xs">
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
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@saanvya.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-[#141414] border border-[#333333] focus:border-antique-gold focus:outline-none text-ivory-base text-xs"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-ivory-base/80">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-antique-gold absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
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

            {/* Save in Backend Options */}
            <div className="p-3 bg-[#141414] border border-[#2D2D2D] space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] text-ivory-base font-medium">
                <Database className="w-3.5 h-3.5 text-antique-gold" />
                <span>Save credentials in backend storage?</span>
              </div>
              <div className="space-y-1.5 pl-5 text-[11px]">
                <label className="flex items-center gap-2 cursor-pointer text-ivory-base/80 hover:text-ivory-base">
                  <input
                    type="radio"
                    name="loginSaveInBackend"
                    checked={saveInBackend === true}
                    onChange={() => setSaveInBackend(true)}
                    className="text-antique-gold focus:ring-antique-gold bg-[#1F1F1F]"
                  />
                  <span>Yes — Save in backend database</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-ivory-base/80 hover:text-ivory-base">
                  <input
                    type="radio"
                    name="loginSaveInBackend"
                    checked={saveInBackend === false}
                    onChange={() => setSaveInBackend(false)}
                    className="text-antique-gold focus:ring-antique-gold bg-[#1F1F1F]"
                  />
                  <span>No — Do not save (Session only)</span>
                </label>
              </div>
            </div>

            {/* Submit */}
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

        {/* ================= REGISTER FORM ================= */}
        {authMode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5 font-sans text-xs">
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
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Shreya Sahu (Creative Director)"
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
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@saanvya.com"
                  className="w-full pl-9 pr-4 py-2 bg-[#141414] border border-[#333333] focus:border-antique-gold focus:outline-none text-ivory-base text-xs"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-ivory-base/80">
                Set Administrator Password (min 6 chars)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-antique-gold absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter strong password"
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
                  minLength={6}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-9 pr-4 py-2 bg-[#141414] border border-[#333333] focus:border-antique-gold focus:outline-none text-ivory-base text-xs"
                />
              </div>
            </div>

            {/* Save in Backend Selection */}
            <div className="p-3 bg-[#141414] border border-[#2D2D2D] space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] text-ivory-base font-medium">
                <Database className="w-3.5 h-3.5 text-antique-gold" />
                <span>Save credentials in backend storage?</span>
              </div>
              <div className="space-y-1.5 pl-5 text-[11px]">
                <label className="flex items-center gap-2 cursor-pointer text-ivory-base/80 hover:text-ivory-base">
                  <input
                    type="radio"
                    name="regSaveInBackend"
                    checked={saveInBackend === true}
                    onChange={() => setSaveInBackend(true)}
                    className="text-antique-gold focus:ring-antique-gold bg-[#1F1F1F]"
                  />
                  <span>Yes — Save in backend database</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-ivory-base/80 hover:text-ivory-base">
                  <input
                    type="radio"
                    name="regSaveInBackend"
                    checked={saveInBackend === false}
                    onChange={() => setSaveInBackend(false)}
                    className="text-antique-gold focus:ring-antique-gold bg-[#1F1F1F]"
                  />
                  <span>No — Do not save (Session only)</span>
                </label>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || adminCount >= MAX_ADMIN_ACCOUNTS}
              className="w-full py-3 bg-antique-gold text-primary font-semibold tracking-wider uppercase text-xs hover:bg-antique-gold-light transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'Creating Account...' : 'Register & Enter Atelier'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-[10px] font-sans text-ivory-base/40 max-w-md mx-auto w-full pb-2">
        Protected Administrative Realm • Saanvya Atelier Private Gateway
      </div>
    </div>
  );
};
