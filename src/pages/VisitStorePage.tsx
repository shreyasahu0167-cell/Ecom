import React, { useState } from 'react';
import { DEMO_STORE_INFO } from '../data/demoData';
import { bookAtelierAppointment } from '../services/appointmentService';
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Scissors,
} from 'lucide-react';

interface VisitStorePageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const VisitStorePage: React.FC<VisitStorePageProps> = ({ onNavigate }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('11:00 AM - 1:00 PM');
  const [occasionType, setOccasionType] = useState<
    'Bridal Consultation' | 'Trousseau Planning' | 'Occasion Wear' | 'Custom Bespoke'
  >('Bridal Consultation');
  const [guestCount, setGuestCount] = useState(2);
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    if (!fullName || !email || !phone || !preferredDate) {
      setBookingError('Please fill in all mandatory appointment fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      await bookAtelierAppointment({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        preferredDate,
        preferredTimeSlot,
        occasionType,
        estimatedGuestCount: guestCount,
        notes: notes.trim() || undefined,
      });
      setIsBooked(true);
    } catch (err: any) {
      setBookingError(err.message || 'Appointment request could not be completed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-sans tracking-[0.25em] text-antique-gold uppercase font-semibold">
            Private Fittings & Consultations
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-charcoal-text">
            Visit the Saanvya Atelier
          </h1>
          <p className="font-sans text-xs sm:text-sm text-charcoal-text/70">
            {DEMO_STORE_INFO.notice}
          </p>
        </div>

        {/* 2-Column Layout: Store Info & Location (5 cols) + Booking Form (7 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Atelier Flagship Specs */}
          <div className="lg:col-span-5 space-y-8 bg-surface-container-low p-8 border border-outline-variant/30">
            <div className="space-y-3">
              <span className="text-[10px] font-sans tracking-widest text-antique-gold uppercase font-semibold">
                Flagship Studio
              </span>
              <h2 className="font-serif text-2xl text-charcoal-text">
                {DEMO_STORE_INFO.name}
              </h2>
              <p className="text-xs font-sans text-charcoal-text/70 leading-relaxed">
                Step inside our private fitting salon for custom bridal drapes, live handloom swatches, and individual styling guidance.
              </p>
            </div>

            <div className="space-y-4 text-xs font-sans text-charcoal-text/85 divide-y divide-outline-variant/20">
              <div className="flex items-start gap-3 pt-2">
                <MapPin className="w-4 h-4 text-antique-gold flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-charcoal-text">Atelier Address:</span>
                  <span>{DEMO_STORE_INFO.addressLine}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3">
                <Clock className="w-4 h-4 text-antique-gold flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-charcoal-text">Atelier Hours:</span>
                  <span>{DEMO_STORE_INFO.hours}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3">
                <Phone className="w-4 h-4 text-antique-gold flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-charcoal-text">Concierge Phone:</span>
                  <span>{DEMO_STORE_INFO.phone}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3">
                <Mail className="w-4 h-4 text-antique-gold flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-charcoal-text">Email Inquiries:</span>
                  <span>{DEMO_STORE_INFO.email}</span>
                </div>
              </div>
            </div>

            {/* Atelier Services List */}
            <div className="pt-4 border-t border-outline-variant/30 space-y-2">
              <span className="text-xs font-sans font-semibold text-charcoal-text uppercase tracking-wider block">
                Atelier Experiences:
              </span>
              <ul className="space-y-1.5 text-xs font-sans text-charcoal-text/75 list-disc list-inside">
                {DEMO_STORE_INFO.services.map((srv, idx) => (
                  <li key={idx}>{srv}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Appointment Form */}
          <div className="lg:col-span-7 bg-surface-container-low p-8 border border-outline-variant/30 space-y-6">
            <div className="border-b border-outline-variant/30 pb-4 space-y-1">
              <h2 className="font-serif text-2xl text-charcoal-text">
                Schedule a Private Appointment
              </h2>
              <p className="text-xs font-sans text-charcoal-text/70">
                Please select your preferred date and occasion requirements.
              </p>
            </div>

            {isBooked ? (
              <div className="py-12 text-center space-y-4 bg-surface-container p-6 border border-antique-gold/40">
                <div className="w-12 h-12 bg-antique-gold/20 text-antique-gold rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl text-charcoal-text">
                  Appointment Request Received
                </h3>
                <p className="text-xs font-sans text-charcoal-text/80 max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="font-semibold">{fullName}</span>. Our concierge team has recorded your viewing request for <span className="font-semibold">{preferredDate}</span> ({preferredTimeSlot}).
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setIsBooked(false);
                      setFullName('');
                      setEmail('');
                      setPhone('');
                    }}
                    className="px-6 py-2.5 bg-primary text-ivory-base text-xs font-sans tracking-widest uppercase hover:bg-charcoal-text"
                  >
                    Book Another Appointment
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs font-sans">
                {bookingError && (
                  <div className="p-3 bg-error/10 border border-error/30 text-error flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-charcoal-text/80 uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={120}
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full bg-background border border-outline-variant/50 p-2.5 text-xs text-charcoal-text focus:outline-none focus:border-antique-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-charcoal-text/80 uppercase tracking-wider mb-1">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={30}
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98765 00000"
                      className="w-full bg-background border border-outline-variant/50 p-2.5 text-xs text-charcoal-text focus:outline-none focus:border-antique-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-charcoal-text/80 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    maxLength={255}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="w-full bg-background border border-outline-variant/50 p-2.5 text-xs text-charcoal-text focus:outline-none focus:border-antique-gold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-charcoal-text/80 uppercase tracking-wider mb-1">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={preferredDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setPreferredDate(e.target.value)}
                      className="w-full bg-background border border-outline-variant/50 p-2.5 text-xs text-charcoal-text focus:outline-none focus:border-antique-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-charcoal-text/80 uppercase tracking-wider mb-1">
                      Time Slot
                    </label>
                    <select
                      value={preferredTimeSlot}
                      onChange={e => setPreferredTimeSlot(e.target.value)}
                      className="w-full bg-background border border-outline-variant/50 p-2.5 text-xs text-charcoal-text focus:outline-none focus:border-antique-gold cursor-pointer"
                    >
                      <option value="11:00 AM - 1:00 PM">Morning: 11:00 AM – 1:00 PM</option>
                      <option value="2:30 PM - 4:30 PM">Afternoon: 2:30 PM – 4:30 PM</option>
                      <option value="5:00 PM - 7:00 PM">Evening: 5:00 PM – 7:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-charcoal-text/80 uppercase tracking-wider mb-1">
                      Occasion Focus
                    </label>
                    <select
                      value={occasionType}
                      onChange={e => setOccasionType(e.target.value as any)}
                      className="w-full bg-background border border-outline-variant/50 p-2.5 text-xs text-charcoal-text focus:outline-none focus:border-antique-gold cursor-pointer"
                    >
                      <option value="Bridal Consultation">Bridal Consultation</option>
                      <option value="Trousseau Planning">Trousseau Planning</option>
                      <option value="Occasion Wear">Occasion Wear</option>
                      <option value="Custom Bespoke">Custom Bespoke</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-charcoal-text/80 uppercase tracking-wider mb-1">
                      Number of Guests
                    </label>
                    <select
                      value={guestCount}
                      onChange={e => setGuestCount(Number(e.target.value))}
                      className="w-full bg-background border border-outline-variant/50 p-2.5 text-xs text-charcoal-text focus:outline-none focus:border-antique-gold cursor-pointer"
                    >
                      <option value={1}>1 Guest (Individual)</option>
                      <option value={2}>2 Guests</option>
                      <option value={3}>3 Guests</option>
                      <option value={4}>4+ Guests (Bridal Party)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-charcoal-text/80 uppercase tracking-wider mb-1">
                    Occasion Details & Style Inquiries (Optional)
                  </label>
                  <textarea
                    rows={3}
                    maxLength={1500}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Tell us about your wedding date, preferred color palettes, or specific silhouettes."
                    className="w-full bg-background border border-outline-variant/50 p-2.5 text-xs text-charcoal-text focus:outline-none focus:border-antique-gold"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-primary text-ivory-base font-sans text-xs font-semibold tracking-[0.2em] uppercase hover:bg-charcoal-text transition-all duration-300 shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? 'Requesting Appointment...' : 'Submit Appointment Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
