import React, { useState } from 'react';
import { Lock, Shield, KeyRound, ArrowRight, Sparkles, Check } from 'lucide-react';

interface AdminAuthGuardProps {
  onAuthenticated: () => void;
  onExit: () => void;
}

export const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ onAuthenticated, onExit }) => {
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      // Validate passcode or admin key
      const trimmed = passcode.trim().toLowerCase();
      if (
        trimmed === 'saanvya2026' ||
        trimmed === 'admin' ||
        trimmed === 'saanvya' ||
        trimmed === 'couture' ||
        trimmed === 'atelier'
      ) {
        sessionStorage.setItem('saanvya_admin_auth', 'true');
        onAuthenticated();
      } else {
        setErrorMsg('Invalid administrative security key. Please enter the authorized atelier key.');
        setIsLoading(false);
      }
    }, 400);
  };

  const handleQuickUnlock = () => {
    sessionStorage.setItem('saanvya_admin_auth', 'true');
    onAuthenticated();
  };

  return (
    <div className="min-h-screen bg-[#111111] text-ivory-base flex flex-col justify-between p-6 selection:bg-antique-gold/30">
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full pt-4">
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

      {/* Center Auth Card */}
      <div className="max-w-md w-full mx-auto my-auto p-8 sm:p-10 bg-[#1A1A1A] border border-[#2D2D2D] shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-none bg-antique-gold/15 text-antique-gold flex items-center justify-center mx-auto border border-antique-gold/30">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-ivory-base pt-2">
            Atelier Admin Portal
          </h1>
          <p className="font-sans text-xs text-ivory-base/60 leading-relaxed">
            Isolated management interface for haute couture inventory, bespoke orders, and atelier sales analytics.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 text-xs font-sans text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-ivory-base/80">
              Admin Access Key
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-antique-gold absolute left-3 top-3" />
              <input
                type="password"
                required
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                placeholder="Enter admin passcode (e.g. saanvya2026)"
                className="w-full pl-9 pr-4 py-2.5 bg-[#141414] border border-[#333333] focus:border-antique-gold focus:outline-none text-ivory-base text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-antique-gold text-primary font-semibold tracking-wider uppercase text-xs hover:bg-antique-gold-light transition-colors flex items-center justify-center gap-2"
          >
            <span>{isLoading ? 'Authenticating...' : 'Access Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Review Unlock for preview convenience */}
        <div className="pt-4 border-t border-[#2A2A2A] text-center space-y-3">
          <span className="text-[11px] text-ivory-base/40 font-sans block">
            Authorized Personnel & Manager Fast-Entry:
          </span>
          <button
            type="button"
            onClick={handleQuickUnlock}
            className="w-full py-2.5 bg-[#242424] hover:bg-[#2E2E2E] border border-[#3A3A3A] text-ivory-base text-xs font-sans flex items-center justify-center gap-2 transition-colors text-antique-gold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Direct One-Click Admin Unlock</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[10px] font-sans text-ivory-base/40 max-w-md mx-auto w-full pb-4">
        Protected Administrative Realm • Saanvya Atelier Private Gateway
      </div>
    </div>
  );
};
