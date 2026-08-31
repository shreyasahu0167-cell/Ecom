import React, { useState } from 'react';
import { DEMO_POLICIES, DEMO_STORE_INFO } from '../data/demoData';
import {
  Clock,
  Scissors,
  Truck,
  RotateCcw,
  CreditCard,
  ChevronDown,
} from 'lucide-react';

interface SupportPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const SupportPage: React.FC<SupportPageProps> = ({ onNavigate }) => {
  const [openSection, setOpenSection] = useState<string>('timeline');

  const policies = [
    {
      id: 'timeline',
      icon: Clock,
      title: 'Made-to-Order Timelines & Production',
      content: DEMO_POLICIES.madeToOrderTimeline,
      bulletPoints: [
        'Production schedules and lead times to be confirmed by Saanvya.',
        'Ready-to-wear dispatch schedules to be confirmed by Saanvya.',
        'Expedited order feasibility to be confirmed upon consultation.',
      ],
    },
    {
      id: 'sizing',
      icon: Scissors,
      title: 'Sizing, Fittings & Alterations',
      content: DEMO_POLICIES.alterationPolicy,
      bulletPoints: [
        'Fitting adjustments and alteration windows to be confirmed by Saanvya.',
        'Custom measurement specifications and seam allowances to be confirmed by Saanvya.',
        'Atelier fitting appointment guidelines to be confirmed by Saanvya.',
      ],
    },
    {
      id: 'shipping',
      icon: Truck,
      title: 'Shipping & Logistics',
      content: DEMO_POLICIES.shippingTerms,
      bulletPoints: [
        'Shipping partners, dispatch zones, and rates to be confirmed by Saanvya.',
        'Packaging and courier insurance policies to be confirmed by Saanvya.',
        'Tracking and delivery timelines to be confirmed by Saanvya.',
      ],
    },
    {
      id: 'returns',
      icon: RotateCcw,
      title: 'Returns & Adjustments',
      content: DEMO_POLICIES.returnsCancellation,
      bulletPoints: [
        'Return, exchange, and alteration eligibility to be confirmed by Saanvya.',
        'Client support coordination procedures to be confirmed by Saanvya.',
      ],
    },
    {
      id: 'payments',
      icon: CreditCard,
      title: 'Payment Methods & Currency',
      content: DEMO_POLICIES.paymentNotice,
      bulletPoints: [
        'All prices are denominated in Indian Rupees (INR ₹).',
        'Accepted payment gateways, cards, and direct methods to be confirmed by Saanvya.',
        'Taxation and formal invoicing terms to be confirmed by Saanvya.',
      ],
    },
  ];

  return (
    <div className="bg-background min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-sans tracking-[0.25em] text-antique-gold uppercase font-semibold">
            Client Concierge & Guidelines
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-charcoal-text">
            Support & Policies
          </h1>
          <p className="font-sans text-xs sm:text-sm text-charcoal-text/70">
            Overview of sample ordering policies, sizing consultations, and customer service guidelines.
          </p>
        </div>

        {/* Policy Accordion List */}
        <div className="space-y-4">
          {policies.map((policy) => {
            const Icon = policy.icon;
            const isOpen = openSection === policy.id;
            return (
              <div
                key={policy.id}
                className="bg-surface-container-low border border-outline-variant/30 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenSection(isOpen ? '' : policy.id)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-surface-container/60 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-surface-container border border-outline-variant/40 text-antique-gold">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif text-xl text-charcoal-text">{policy.title}</h3>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-charcoal-text/60 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-antique-gold' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="p-6 pt-0 border-t border-outline-variant/20 space-y-4 text-xs font-sans text-charcoal-text/80 leading-relaxed animate-fadeIn">
                    <p className="bg-surface-container p-4 border border-outline-variant/30 text-charcoal-text/75 italic">
                      {policy.content}
                    </p>
                    <ul className="space-y-2 list-disc list-inside">
                      {policy.bulletPoints.map((pt, idx) => (
                        <li key={idx} className="leading-normal">{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact Concierge Box */}
        <div className="p-8 sm:p-10 bg-primary text-ivory-base border border-antique-gold/30 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-3">
            <span className="text-[10px] font-sans tracking-widest text-antique-gold uppercase font-semibold block">
              Direct Assistance
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-ivory-base">
              Speak with a Couture Stylist
            </h3>
            <p className="font-sans text-xs text-ivory-base/75 leading-relaxed">
              Have questions regarding blouse necklines, fabric weights, or bespoke bridal timelines? Our styling team is at your disposal.
            </p>
          </div>

          <div className="space-y-3 text-xs font-sans">
            <button
              onClick={() => onNavigate('visit-store')}
              className="w-full py-3.5 bg-antique-gold text-primary font-semibold tracking-wider uppercase hover:bg-antique-gold-light transition-colors text-center block"
            >
              Book Atelier Consultation
            </button>
            <div className="flex flex-wrap items-center justify-between text-ivory-base/70 pt-1 text-[11px] gap-2">
              <span>Phone: {DEMO_STORE_INFO.phone}</span>
              <span>{DEMO_STORE_INFO.email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
