import React from 'react';
import { isDemoMode } from '../../lib/supabase';
import { Sparkles } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  if (!isDemoMode) {
    return null;
  }

  return (
    <aside
      aria-label="Storefront Mode Notice"
      className="bg-antique-gold/15 border-b border-antique-gold/30 text-charcoal-text px-4 py-1.5 text-[11px] font-sans text-center flex items-center justify-center gap-2"
    >
      <Sparkles className="w-3.5 h-3.5 text-antique-gold shrink-0" />
      <span className="font-medium tracking-wide">
        Demo Storefront — Sample products and orders only
      </span>
    </aside>
  );
};


