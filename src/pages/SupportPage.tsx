import React, { useState } from 'react';
import { DEMO_POLICIES } from '../data/demoData';
import {
  Clock,
  Scissors,
  Truck,
  RotateCcw,
  CreditCard,
  Sparkles,
  HelpCircle,
  ChevronDown,
  Mail,
  Phone,
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
        'Sample Timeline: Standard bespoke couture takes 4 to 6 weeks from measurement confirmation.',
        'Sample Timeline: Ready-to-wear pieces ship within 3-5 business days.',
        'Sample Urgent Services: Expedited bridal production available on special request subject to master craftsman capacity.',
      ],
    },
    {
      id: 'sizing',
      icon: Scissors,
      title: 'Sizing, Fittings & Alterations',
      content: DEMO_POLICIES.alterationPolicy,
      bulletPoints: [
        'Sample Fitting: Complimentary first fitting adjustment within 14 days of order receipt.',
        'Sample Margin: 2-3 inches of fabric seam allowance built into blouses and waistbands for future alterations.',
        'Sample Bespoke: Client may provide personalized measurements online or book an atelier fitting session.',
      ],
    },
    {
      id: 'shipping',
      icon: Truck,
      title: 'Insured Shipping & Logistics (INR)',
      content: DEMO_POLICIES.shippingTerms,
      bulletPoints: [
        'Sample Delivery: Complimentary insured courier service on domestic orders above ₹15,000.',
        'Sample Delivery: Flat ₹500 standard delivery fee on orders below ₹15,000.',
        'Sample Packaging: Delivered in signature humidity-resistant garment bags with satin hangers.',
      ],
    },
    {
      id: 'returns',
      icon: RotateCcw,
      title: 'Returns & Concierge Adjustments',
      content: DEMO_POLICIES.returnsCancellation,
      bulletPoints: [
        'Sample Policy: Made-to-measure and tailored garments are eligible for complimentary size alterations or store credit.',
        'Sample Notice: Inquiries must be raised with our concierge team within 7 days of package delivery.',
      ],
    },
    {
      id: 'payments',
      icon: CreditCard,
      title: 'Payment Methods & Currency',
      content: DEMO_POLICIES.paymentNotice,
      bulletPoints: [
        'All prices are strictly denominated in Indian Rupees (INR ₹).',
        'Prepared architecture supports Razorpay (UPI, Credit/Debit cards, Net Banking) and Direct Bank Wire.',
        'All orders receive formal GST compliant invoices with valid tax breakdown.',
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
            [Demo Notice]: Neutral demo-safe policy placeholders. Official terms and contact details will be verified by the brand.
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
            <div className="flex items-center justify-between text-ivory-base/70 pt-1 text-[11px]">
              <span>WhatsApp / Phone: +91 22 0000 0000 (Sample)</span>
              <span>concierge@saanvya-demo.local</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
