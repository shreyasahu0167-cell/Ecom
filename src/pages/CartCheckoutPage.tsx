import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatInr } from '../utils/formatters';
import { createOrder, CreateOrderPayload } from '../services/orderService';
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  CreditCard,
  Building,
  Lock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

interface CartCheckoutPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const CartCheckoutPage: React.FC<CartCheckoutPageProps> = ({ onNavigate }) => {
  const { cart, subtotalInr, clearCart } = useCart();
  const { profile, isSupabaseConfigured } = useAuth();

  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<
    'RAZORPAY_SCAFFOLD' | 'CASHFREE_SCAFFOLD' | 'BANK_TRANSFER_VERIFICATION' | 'DEMO_SUBMISSION'
  >(isSupabaseConfigured ? 'RAZORPAY_SCAFFOLD' : 'DEMO_SUBMISSION');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  if (cart.length === 0) {
    return (
      <div className="py-24 max-w-lg mx-auto text-center px-4 bg-background min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <ShoppingBag className="w-12 h-12 text-outline stroke-1 mb-2" />
        <h2 className="font-serif text-3xl text-charcoal-text">Your Bag is Empty</h2>
        <p className="font-sans text-xs text-charcoal-text/70">
          Please select an ensemble from our couture catalog before proceeding to checkout.
        </p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-8 py-3.5 bg-primary text-ivory-base text-xs font-sans tracking-widest uppercase hover:bg-charcoal-text transition-colors"
        >
          Explore Collection
        </button>
      </div>
    );
  }

  const estimatedTax = Math.round(subtotalInr * 0.12);
  const shippingFee = subtotalInr >= 15000 ? 0 : 500;
  const estimatedGrandTotal = subtotalInr + estimatedTax + shippingFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    if (!email || !phone || !fullName || !addressLine1 || !city || !state || !pincode) {
      setSubmissionError('Please fill in all mandatory customer and shipping address fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateOrderPayload = {
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        shippingAddress: {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2.trim() || undefined,
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          country: 'India',
        },
        items: cart.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity,
          customMeasurements: item.customMeasurements,
        })),
        paymentMethod,
        notes: notes.trim() || undefined,
      };

      const result = await createOrder(payload, cart);
      clearCart();
      onNavigate('order-confirmation', { orderId: result.orderId });
    } catch (err: any) {
      setSubmissionError(err.message || 'Order submission could not be completed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-10 text-center border-b border-outline-variant/30 pb-6 space-y-2">
          <span className="text-xs font-sans tracking-[0.25em] text-antique-gold uppercase font-semibold">
            Secure Checkout
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-text">
            Client Order Placement
          </h1>
          <p className="font-sans text-xs text-charcoal-text/70">
            Guest checkout enabled • All pricing strictly in Indian Rupees (INR ₹)
          </p>
        </div>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Form (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {submissionError && (
              <div className="p-4 bg-error/10 border border-error/30 text-error text-xs font-sans flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{submissionError}</span>
              </div>
            )}

            {/* 1. Contact Info */}
            <div className="bg-surface-container-low p-6 border border-outline-variant/30 space-y-4">
              <h2 className="font-serif text-xl text-charcoal-text flex items-center justify-between">
                <span>1. Contact & Communication</span>
                {!profile && (
                  <span className="text-[11px] font-sans font-normal text-antique-gold">
                    Guest Mode Active
                  </span>
                )}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div>
                  <label className="block text-charcoal-text/80 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="w-full bg-background border border-outline-variant/50 p-2.5 text-xs text-charcoal-text focus:outline-none focus:border-antique-gold"
                  />
                </div>
                <div>
                  <label className="block text-charcoal-text/80 uppercase tracking-wider mb-1">
                    Phone Number (WhatsApp for Order Updates) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-background border border-outline-variant/50 p-2.5 text-xs text-charcoal-text focus:outline-none focus:border-antique-gold"
                  />
                </div>
              </div>
            </div>

            {/* 2. Shipping Address */}
            <div className="bg-surface-container-low p-6 border border-outline-variant/30 space-y-4">
              <h2 className="font-serif text-xl text-charcoal-text">
                2. Shipping & Delivery Address
              </h2>

              <div className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block text-charcoal-text/80 uppercase tracking-wider mb-1">
                    Full Recipient Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Radhika Sharma"
                    className="w-full bg-background border border-outline-variant/50 p-2.5 text-xs text-charcoal-text focus:outline-none focus:border-antique-gold"
                  />
                </div>

                <div>
                  <label className="block text-charcoal-text/80 uppercase tracking-wider mb-1">
                    Address Line 1 (House/Apartment, Street) *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressLine1}
                    onChange={e => setAddressLine1(e.target.value)}
                    placeholder="Flat 402, Royal Residency, Linking Road"
                    className="w-full bg-background border border-outline-variant/50 p-2.5 text-xs text-charcoal-text focus:outline-none focus:border-antique-gold"
                  />
                </div>

                <div>
                  <label className="block text-charcoal-text/80 uppercase tracking-wider mb-1">
                    Address Line 2 (Landmark / Area)
                  </label>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={e => setAddressLine2(e.target.value)}
                    placeholder="Opposite Heritage Park"
                    className="w-full bg-background border border-outline-variant/50 p-2.5 text-xs text-charcoal-text focus:outline-none focus:border-antique-gold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-charcoal-text/80 uppercase tracking-wider mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="Mumbai"
                      className="w-full bg-background border border-outline-variant/50 p-2.5 text-xs text-charcoal-text focus:outline-none focus:border-antique-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-charcoal-text/80 uppercase tracking-wider mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={e => setState(e.target.value)}
                      placeholder="Maharashtra"
                      className="w-full bg-background border border-outline-variant/50 p-2.5 text-xs text-charcoal-text focus:outline-none focus:border-antique-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-charcoal-text/80 uppercase tracking-wider mb-1">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={e => setPincode(e.target.value)}
                      placeholder="400050"
                      className="w-full bg-background border border-outline-variant/50 p-2.5 text-xs text-charcoal-text focus:outline-none focus:border-antique-gold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Payment Method (Prepared Scaffold) */}
            <div className="bg-surface-container-low p-6 border border-outline-variant/30 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl text-charcoal-text">
                  3. Payment Method
                </h2>
                <span className="text-[11px] font-sans text-antique-gold flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>256-Bit Encrypted</span>
                </span>
              </div>

              <p className="text-[11px] font-sans text-charcoal-text/70 italic">
                [Payment Architecture Notice]: Live merchant gateways are ready for instant connection upon API key deployment. Order is securely recorded with status 'PAYMENT_PENDING'.
              </p>

              <div className="space-y-3 text-xs font-sans">
                <label className="flex items-start gap-3 p-3.5 border border-outline-variant/50 bg-background cursor-pointer hover:border-antique-gold">
                  <input
                    type="radio"
                    name="payment"
                    value="RAZORPAY_SCAFFOLD"
                    checked={paymentMethod === 'RAZORPAY_SCAFFOLD'}
                    onChange={() => setPaymentMethod('RAZORPAY_SCAFFOLD')}
                    className="mt-0.5 accent-primary"
                  />
                  <div>
                    <span className="font-medium text-charcoal-text block flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-antique-gold" />
                      Razorpay Gateway (UPI, Cards, Net Banking) [Scaffold]
                    </span>
                    <span className="text-[11px] text-charcoal-text/60">
                      Standard Indian checkout flow ready for client merchant activation.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 border border-outline-variant/50 bg-background cursor-pointer hover:border-antique-gold">
                  <input
                    type="radio"
                    name="payment"
                    value="BANK_TRANSFER_VERIFICATION"
                    checked={paymentMethod === 'BANK_TRANSFER_VERIFICATION'}
                    onChange={() => setPaymentMethod('BANK_TRANSFER_VERIFICATION')}
                    className="mt-0.5 accent-primary"
                  />
                  <div>
                    <span className="font-medium text-charcoal-text block flex items-center gap-2">
                      <Building className="w-4 h-4 text-antique-gold" />
                      Direct Bank Wire / Concierge Invoice Verification
                    </span>
                    <span className="text-[11px] text-charcoal-text/60">
                      Ideal for high-value bridal suites; our concierge contacts you with formal proforma invoice.
                    </span>
                  </div>
                </label>

                {!isSupabaseConfigured && (
                  <label className="flex items-start gap-3 p-3.5 border border-antique-gold/60 bg-antique-gold/10 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="DEMO_SUBMISSION"
                      checked={paymentMethod === 'DEMO_SUBMISSION'}
                      onChange={() => setPaymentMethod('DEMO_SUBMISSION')}
                      className="mt-0.5 accent-primary"
                    />
                    <div>
                      <span className="font-semibold text-charcoal-text block">
                        Demo Mode Order Placement (Sample Testing)
                      </span>
                      <span className="text-[11px] text-charcoal-text/70">
                        Creates an authentic demo order instance stored locally for UI workflow review.
                      </span>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Special Instructions */}
            <div className="bg-surface-container-low p-6 border border-outline-variant/30 space-y-2">
              <label className="font-serif text-lg text-charcoal-text block">
                Special Fitting / Delivery Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Mention urgent wedding dates, specific sleeve preferences, or delivery instructions."
                className="w-full bg-background border border-outline-variant/50 p-2.5 text-xs text-charcoal-text focus:outline-none focus:border-antique-gold font-sans"
              />
            </div>
          </div>

          {/* Right Column: Order Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface-container-low p-6 border border-outline-variant/30 space-y-6 sticky top-28">
              <h2 className="font-serif text-xl text-charcoal-text pb-3 border-b border-outline-variant/30">
                Order Review ({cart.length} Ensembles)
              </h2>

              {/* Items List */}
              <div className="space-y-4 divide-y divide-outline-variant/20 max-h-80 overflow-y-auto pr-2">
                {cart.map((item, idx) => (
                  <div key={idx} className="pt-4 first:pt-0 flex gap-3">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-20 object-cover bg-surface-container border border-outline-variant/30 flex-shrink-0"
                    />
                    <div className="flex-1 text-xs font-sans">
                      <h4 className="font-serif text-sm text-charcoal-text line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-charcoal-text/70 mt-0.5">
                        Size: <span className="font-medium text-charcoal-text">{item.size}</span> • Color: {item.color}
                      </p>
                      <p className="text-[10px] text-outline mt-0.5">SKU: {item.sku}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[11px] text-charcoal-text/70">Qty: {item.quantity}</span>
                        <span className="font-semibold text-charcoal-text">
                          {formatInr(item.unitPriceInr * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculation (Server-recalculated on submit) */}
              <div className="border-t border-outline-variant/30 pt-4 space-y-2 text-xs font-sans text-charcoal-text/80">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-charcoal-text">{formatInr(subtotalInr)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Luxury GST (12%)</span>
                  <span className="font-medium text-charcoal-text">{formatInr(estimatedTax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Insured Express Courier</span>
                  <span className="font-medium text-charcoal-text">
                    {shippingFee === 0 ? (
                      <span className="text-antique-gold font-semibold">Complimentary</span>
                    ) : (
                      formatInr(shippingFee)
                    )}
                  </span>
                </div>
                <div className="border-t border-outline-variant/30 pt-3 flex justify-between items-baseline">
                  <span className="font-serif text-lg text-charcoal-text">Total (INR ₹)</span>
                  <span className="font-serif text-2xl font-medium text-charcoal-text">
                    {formatInr(estimatedGrandTotal)}
                  </span>
                </div>
              </div>

              {/* Security & Server RPC Disclaimer */}
              <div className="p-3 bg-surface-container border border-outline-variant/30 text-[11px] font-sans text-charcoal-text/70 space-y-1">
                <div className="flex items-center gap-1 text-antique-gold font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Atomic Database Integrity</span>
                </div>
                <p>
                  Prices and stock allocations are verified server-side in Postgres. Frontend totals are indicative previews.
                </p>
              </div>

              {/* Submit Order Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-primary text-ivory-base font-sans text-xs font-semibold tracking-[0.2em] uppercase hover:bg-charcoal-text transition-all duration-300 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Processing Secure Order...</span>
                ) : (
                  <>
                    <span>Confirm & Create Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
