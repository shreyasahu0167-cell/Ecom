import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Mail } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string, params?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setIsSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-primary text-ivory-base/90 pt-16 pb-12 border-t border-antique-gold/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-14 border-b border-ivory-base/15">
          {/* Brand Column (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="cursor-pointer inline-block" onClick={() => onNavigate('home')}>
              <span className="font-serif text-3xl tracking-[0.25em] text-ivory-base uppercase block">
                SAANVYA
              </span>
              <span className="text-[10px] font-sans tracking-[0.3em] text-antique-gold uppercase block mt-1 font-semibold">
                Modern Indian Couture
              </span>
            </div>

            <p className="font-sans text-xs text-ivory-base/70 leading-relaxed max-w-sm pt-2">
              A tribute to timeless Indian craftsmanship, combining architectural silhouettes, handloom textiles, and subtle metallic needlework for the modern connoisseur.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs font-sans text-antique-gold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Prices in Indian Rupees (INR ₹) • Luxury Made-to-Order</span>
            </div>
          </div>

          {/* Couture Collections (2 cols) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-serif text-sm text-antique-gold tracking-widest uppercase mb-4">
              Couture
            </h4>
            <ul className="space-y-2.5 text-xs font-sans text-ivory-base/80">
              <li>
                <button
                  onClick={() => onNavigate('shop', { category: 'bridal' })}
                  className="hover:text-antique-gold transition-colors"
                >
                  Bridal Ensembles
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', { category: 'lehengas' })}
                  className="hover:text-antique-gold transition-colors"
                >
                  Occasion Lehengas
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', { category: 'sarees' })}
                  className="hover:text-antique-gold transition-colors"
                >
                  Handloom Sarees
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', { category: 'anarkalis' })}
                  className="hover:text-antique-gold transition-colors"
                >
                  Contemporary Anarkalis
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', { category: 'ready-to-wear' })}
                  className="hover:text-antique-gold transition-colors"
                >
                  Luxury Pret
                </button>
              </li>
            </ul>
          </div>

          {/* Client Concierge (2 cols) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-serif text-sm text-antique-gold tracking-widest uppercase mb-4">
              Concierge
            </h4>
            <ul className="space-y-2.5 text-xs font-sans text-ivory-base/80">
              <li>
                <button
                  onClick={() => onNavigate('visit-store')}
                  className="hover:text-antique-gold transition-colors"
                >
                  Book Atelier Viewing
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('story')}
                  className="hover:text-antique-gold transition-colors"
                >
                  Craft Ethos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('support')}
                  className="hover:text-antique-gold transition-colors"
                >
                  Made-to-Order Timelines
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('support')}
                  className="hover:text-antique-gold transition-colors"
                >
                  Sizing & Alterations
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('support')}
                  className="hover:text-antique-gold transition-colors"
                >
                  Shipping & Concierge
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Box (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-serif text-sm text-antique-gold tracking-widest uppercase mb-4">
              Private Capsule Journal
            </h4>
            <p className="text-xs font-sans text-ivory-base/70 leading-relaxed">
              Receive private previews of seasonal lookbooks, bespoke appointments, and textile narratives.
            </p>

            {isSubscribed ? (
              <div className="p-3 bg-antique-gold/20 border border-antique-gold/40 text-xs font-sans text-antique-gold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Thank you for subscribing to our private journal.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2 pt-1">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-primary-container/80 border border-ivory-base/20 text-xs font-sans px-3 py-2.5 text-ivory-base placeholder:text-ivory-base/40 focus:outline-none focus:border-antique-gold"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1 bottom-1 px-3 bg-antique-gold text-primary hover:bg-antique-gold-light transition-colors flex items-center justify-center"
                    aria-label="Subscribe"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[10px] text-ivory-base/40 block">
                  Strictly private. We never share client contact details.
                </span>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Disclaimer & Disclosures */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-sans text-ivory-base/50">
          <p>© {new Date().getFullYear()} SAANVYA STORE. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('support')}
              className="hover:text-ivory-base transition-colors"
            >
              Terms of Service
            </button>
            <button
              onClick={() => onNavigate('support')}
              className="hover:text-ivory-base transition-colors"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
