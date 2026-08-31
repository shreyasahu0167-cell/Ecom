import React, { useState } from 'react';
import {
  Shield,
  UserPlus,
  Trash2,
  Mail,
  User,
  KeyRound,
  Database,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Lock,
  Check,
  X,
} from 'lucide-react';
import {
  AdminAccount,
  getRegisteredAdmins,
  registerAdmin,
  deleteAdminAccount,
  MAX_ADMIN_ACCOUNTS,
  getCurrentAdminSession,
} from '../../services/adminAuthService';
import { validatePasswordPolicy } from '../../utils/passwordValidation';

export const AdminTeamManagerView: React.FC = () => {
  const [admins, setAdmins] = useState<AdminAccount[]>(() => getRegisteredAdmins());
  const [currentSession] = useState(() => getCurrentAdminSession());

  // Registration Form State
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [roleTitle, setRoleTitle] = useState('Atelier Manager');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Confirmation Modal State
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const passwordValidation = validatePasswordPolicy(password);

  const refreshAdmins = () => {
    setAdmins(getRegisteredAdmins());
  };

  const handleInitiateRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg('Please enter a valid administrator email.');
      return;
    }

    if (password.length > 14) {
      setErrorMsg('Password must be a maximum of 14 characters.');
      return;
    }

    if (!passwordValidation.isValid) {
      setErrorMsg(passwordValidation.error || 'Password does not meet required criteria.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setShowConfirmPopup(true);
  };

  const handleExecuteRegister = (saveInBackend: boolean) => {
    setShowConfirmPopup(false);

    const result = registerAdmin({
      email,
      password,
      fullName: fullName.trim() || 'Atelier Administrator',
      roleTitle: roleTitle.trim() || 'Atelier Manager',
      saveInBackend,
    });

    if (result.success) {
      setSuccessMsg(`Administrator ${email} registered successfully.`);
      refreshAdmins();
      setIsRegisterOpen(false);
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } else {
      setErrorMsg(result.error || 'Failed to register admin.');
    }
  };

  const handleDeleteAdmin = (adminId: string, adminEmail: string) => {
    if (admins.length <= 1) {
      alert('Cannot delete the only registered administrator account.');
      return;
    }

    if (window.confirm(`Are you sure you want to remove administrator access for ${adminEmail}?`)) {
      deleteAdminAccount(adminId);
      refreshAdmins();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-low p-6 border border-outline-variant/40">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl text-charcoal-text">Administrative Access & Security</h2>
            <span className="px-2 py-0.5 text-[10px] font-sans font-semibold tracking-wider uppercase bg-antique-gold/15 text-antique-gold border border-antique-gold/30">
              {admins.length} / {MAX_ADMIN_ACCOUNTS} Admins
            </span>
          </div>
          <p className="font-sans text-xs text-charcoal-text/70 mt-1">
            Registered atelier administrators. Maximum capacity is strictly limited to 4 authorized accounts.
          </p>
        </div>

        <button
          onClick={() => {
            setIsRegisterOpen(!isRegisterOpen);
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          disabled={admins.length >= MAX_ADMIN_ACCOUNTS}
          className="px-4 py-2.5 bg-antique-gold text-primary font-semibold text-xs uppercase tracking-wider hover:bg-antique-gold-light transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UserPlus className="w-4 h-4" />
          <span>{isRegisterOpen ? 'Close Register Form' : 'Register New Admin'}</span>
        </button>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-sans flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-sans flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Register New Admin Form Modal / Accordion */}
      {isRegisterOpen && (
        <div className="bg-surface-container-low border border-antique-gold/40 p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-3">
            <UserPlus className="w-4 h-4 text-antique-gold" />
            <h3 className="font-serif text-lg text-charcoal-text">Register Authorized Administrator</h3>
          </div>

          <form onSubmit={handleInitiateRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs" autoComplete="off">
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-charcoal-text/80">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-antique-gold absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  autoComplete="off"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Priyanshu Sharma"
                  className="w-full pl-9 pr-3 py-2 bg-background border border-outline-variant focus:border-antique-gold focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-charcoal-text/80">
                Atelier Role / Title
              </label>
              <input
                type="text"
                required
                autoComplete="off"
                value={roleTitle}
                onChange={e => setRoleTitle(e.target.value)}
                placeholder="e.g. Senior Inventory Director"
                className="w-full px-3 py-2 bg-background border border-outline-variant focus:border-antique-gold focus:outline-none"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-charcoal-text/80">
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
                  className="w-full pl-9 pr-3 py-2 bg-background border border-outline-variant focus:border-antique-gold focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-charcoal-text/80">
                  Password (Max 14 chars)
                </label>
                <span className="text-[10px] font-mono text-charcoal-text/60">
                  {password.length}/14
                </span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-antique-gold absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  maxLength={14}
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter secure password"
                  className="w-full pl-9 pr-3 py-2 bg-background border border-outline-variant focus:border-antique-gold focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-charcoal-text/80">
                Confirm Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-antique-gold absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  maxLength={14}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full pl-9 pr-3 py-2 bg-background border border-outline-variant focus:border-antique-gold focus:outline-none"
                />
              </div>
            </div>

            {/* Password Policy Checklist */}
            <div className="md:col-span-2 p-3 bg-background border border-outline-variant space-y-1.5 text-[11px]">
              <span className="font-semibold text-charcoal-text/80 uppercase tracking-wider block">
                Required Password Rules:
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <div className={`flex items-center gap-1.5 ${passwordValidation.rules.hasMax14 && passwordValidation.rules.hasMinLength ? 'text-emerald-700 font-medium' : 'text-charcoal-text/60'}`}>
                  {passwordValidation.rules.hasMax14 && passwordValidation.rules.hasMinLength ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-charcoal-text/40" />}
                  <span>6 - 14 Characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordValidation.rules.hasUppercase ? 'text-emerald-700 font-medium' : 'text-charcoal-text/60'}`}>
                  {passwordValidation.rules.hasUppercase ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-charcoal-text/40" />}
                  <span>1 Uppercase Letter (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordValidation.rules.hasLowercase ? 'text-emerald-700 font-medium' : 'text-charcoal-text/60'}`}>
                  {passwordValidation.rules.hasLowercase ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-charcoal-text/40" />}
                  <span>1 Lowercase Letter (a-z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordValidation.rules.hasTwoNumbers ? 'text-emerald-700 font-medium' : 'text-charcoal-text/60'}`}>
                  {passwordValidation.rules.hasTwoNumbers ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-charcoal-text/40" />}
                  <span>2 Numbers (0-9)</span>
                </div>
                <div className={`flex items-center gap-1.5 col-span-2 ${passwordValidation.rules.hasSpecialChar ? 'text-emerald-700 font-medium' : 'text-charcoal-text/60'}`}>
                  {passwordValidation.rules.hasSpecialChar ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-charcoal-text/40" />}
                  <span>1 Special Character (!@#$%^&*...)</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsRegisterOpen(false)}
                className="px-4 py-2 border border-outline-variant text-charcoal-text hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-antique-gold text-primary font-semibold hover:bg-antique-gold-light transition-colors"
              >
                Continue to Save Options
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Confirmation Popup */}
      {showConfirmPopup && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-surface-container-low border border-antique-gold/60 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-3">
              <div className="w-10 h-10 bg-antique-gold/15 text-antique-gold flex items-center justify-center border border-antique-gold/30">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-charcoal-text font-medium">
                  Save Admin Credentials?
                </h3>
                <p className="text-xs font-sans text-charcoal-text/60">
                  Storage policy confirmation for {email}
                </p>
              </div>
            </div>

            <p className="font-sans text-xs text-charcoal-text/80 leading-relaxed">
              Would you like to store credentials for this administrator in persistent backend storage, or keep it active only for the current workstation session?
            </p>

            <div className="space-y-2.5 pt-2 font-sans text-xs">
              <button
                type="button"
                onClick={() => handleExecuteRegister(true)}
                className="w-full py-3 bg-antique-gold text-primary font-semibold uppercase tracking-wider hover:bg-antique-gold-light transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Yes — Save in Backend Database</span>
              </button>

              <button
                type="button"
                onClick={() => handleExecuteRegister(false)}
                className="w-full py-2.5 bg-surface-container border border-outline-variant text-charcoal-text hover:border-charcoal-text transition-colors flex items-center justify-center gap-2"
              >
                <span>No — Temporary Session Only</span>
              </button>

              <button
                type="button"
                onClick={() => setShowConfirmPopup(false)}
                className="w-full py-1 text-center text-[11px] text-charcoal-text/60 hover:text-charcoal-text underline"
              >
                Cancel & Edit Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {admins.map((admin, idx) => {
          const isCurrent = currentSession?.email === admin.email;

          return (
            <div
              key={admin.id || idx}
              className={`bg-surface-container-low border p-5 flex flex-col justify-between space-y-4 ${
                isCurrent ? 'border-antique-gold/60 shadow-sm' : 'border-outline-variant/40'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-antique-gold/15 text-antique-gold border border-antique-gold/30 flex items-center justify-center font-serif text-lg font-bold">
                    {admin.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif text-base text-charcoal-text font-medium">{admin.fullName}</h4>
                      {isCurrent && (
                        <span className="px-1.5 py-0.5 text-[9px] font-sans font-bold uppercase bg-antique-gold text-primary">
                          You (Current)
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-sans text-charcoal-text/60">{admin.roleTitle}</p>
                  </div>
                </div>

                {admins.length > 1 && !isCurrent && (
                  <button
                    onClick={() => handleDeleteAdmin(admin.id, admin.email)}
                    className="p-1.5 text-charcoal-text/40 hover:text-red-600 hover:bg-red-50 transition-colors rounded-none"
                    title="Remove administrator access"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-1.5 pt-3 border-t border-outline-variant/30 text-xs font-sans text-charcoal-text/80">
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-text/50">Email:</span>
                  <span className="font-mono text-xs text-charcoal-text font-medium">{admin.email}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-charcoal-text/50">Storage Policy:</span>
                  <span className="inline-flex items-center gap-1 text-[11px]">
                    <Database className="w-3 h-3 text-antique-gold" />
                    {admin.savedInBackend ? (
                      <span className="text-emerald-700 font-medium">Saved in Backend</span>
                    ) : (
                      <span className="text-amber-700 font-medium">Session Only</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-charcoal-text/50">Registered:</span>
                  <span className="text-[11px] text-charcoal-text/60">
                    {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'Active'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Security Details Card */}
      <div className="bg-surface-container-low border border-outline-variant/40 p-5 space-y-2 font-sans text-xs text-charcoal-text/70">
        <div className="flex items-center gap-2 text-charcoal-text font-semibold">
          <ShieldCheck className="w-4 h-4 text-antique-gold" />
          <span>Atelier Multi-Admin Safeguards</span>
        </div>
        <p>
          • Maximum 4 administrators may exist simultaneously. To register a replacement, an existing admin must remove an unused account slot.
        </p>
        <p>
          • Administrators selecting <strong>"No"</strong> on backend saving will only retain session credentials in their active browser tab, protecting sensitive credentials on public or temporary workstations.
        </p>
      </div>
    </div>
  );
};
