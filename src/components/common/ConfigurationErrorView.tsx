import React from 'react';
import { Database, AlertTriangle, Key, Terminal, RefreshCw } from 'lucide-react';

interface ConfigurationErrorViewProps {
  onRetry?: () => void;
}

export const ConfigurationErrorView: React.FC<ConfigurationErrorViewProps> = ({ onRetry }) => {
  return (
    <div className="min-h-screen bg-background text-charcoal-text flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-surface-container-low border border-deep-rose/30 shadow-lg p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-4">
          <div className="w-12 h-12 rounded-full bg-deep-rose/10 text-deep-rose flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif text-2xl text-charcoal-text font-medium">
              Database Configuration Required
            </h1>
            <p className="text-xs font-sans text-charcoal-text/70">
              Production Mode is active (<code className="font-mono text-primary font-semibold">VITE_DEMO_MODE=false</code>), but database credentials are not set.
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs font-sans leading-relaxed text-charcoal-text/80">
          <p>
            In production mode, silent fallbacks to local sample/mock data are strictly disabled to protect data integrity. To operate the storefront, choose one of the following configurations:
          </p>

          {/* Option 1: Live Supabase */}
          <div className="p-4 bg-surface-container border border-outline-variant/50 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-charcoal-text">
              <Database className="w-4 h-4 text-antique-gold" />
              <span>Option A: Connect Live PostgreSQL / Supabase (Production)</span>
            </div>
            <p className="text-charcoal-text/70 text-[11px]">
              Set your live Supabase credentials in your environment variables or <code className="font-mono bg-background px-1 py-0.5">.env</code>:
            </p>
            <div className="p-2.5 bg-[#1a1a1a] text-ivory-base font-mono text-[11px] space-y-1">
              <div>VITE_SUPABASE_URL=https://your-project.supabase.co</div>
              <div>VITE_SUPABASE_ANON_KEY=your-anon-key</div>
            </div>
          </div>

          {/* Option 2: Demo Mode */}
          <div className="p-4 bg-surface-container border border-outline-variant/50 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-charcoal-text">
              <Terminal className="w-4 h-4 text-antique-gold" />
              <span>Option B: Enable Demo Storefront Mode (Preview & Testing)</span>
            </div>
            <p className="text-charcoal-text/70 text-[11px]">
              If you want to preview the store with sample bridal couture products and local orders without a database, explicitly enable demo mode:
            </p>
            <div className="p-2.5 bg-[#1a1a1a] text-ivory-base font-mono text-[11px]">
              <div>VITE_DEMO_MODE=true</div>
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              if (onRetry) {
                onRetry();
              } else {
                window.location.reload();
              }
            }}
            className="flex-1 py-3 bg-primary text-ivory-base font-sans text-xs font-semibold tracking-wider uppercase hover:bg-charcoal-text transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Application</span>
          </button>
        </div>
      </div>
    </div>
  );
};
