import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Database, AlertCircle } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { isSupabaseConfigured } = useAuth();

  if (isSupabaseConfigured) {
    return (
      <div className="bg-charcoal-text text-ivory-base text-xs font-sans py-1.5 px-4 text-center flex items-center justify-center gap-2 tracking-wider">
        <Database className="w-3.5 h-3.5 text-antique-gold" />
        <span>Connected to Live Supabase Production Database • Strict RLS Enforced</span>
      </div>
    );
  }

  return (
    <div className="bg-primary/95 text-ivory-base text-xs font-sans py-2 px-4 text-center border-b border-antique-gold/30">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <Sparkles className="w-3.5 h-3.5 text-antique-gold" />
          <span className="font-medium tracking-wide">
            DEMO MODE: Displaying neutral sample couture catalog & demo-safe placeholders.
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-antique-gold-light text-[11px] mx-auto sm:mx-0">
          <AlertCircle className="w-3 h-3" />
          <span>No unverified brand claims or fake live integrations.</span>
        </div>
      </div>
    </div>
  );
};
