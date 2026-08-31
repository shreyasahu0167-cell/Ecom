import React, { useState } from 'react';
import { Order, OrderStatus, PaymentStatus } from '../../types';
import { formatInr, formatDate } from '../../utils/formatters';
import {
  X,
  Printer,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  Scissors,
  DollarSign,
  Mail,
  Phone,
  MapPin,
  FileText,
  Save,
  Check,
} from 'lucide-react';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onUpdateStatus: (orderId: string, status: OrderStatus, notes?: string) => Promise<void>;
  onUpdatePayment: (orderId: string, paymentStatus: PaymentStatus) => Promise<void>;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  isOpen,
  onClose,
  order,
  onUpdateStatus,
  onUpdatePayment,
}) => {
  if (!isOpen || !order) return null;

  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(order.paymentStatus);
  const [notes, setNotes] = useState(order.notes || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    setIsUpdating(true);
    setSaveSuccess(false);
    try {
      await onUpdateStatus(order.id, status, notes);
      await onUpdatePayment(order.id, paymentStatus);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest border border-outline-variant/60 w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl rounded-none text-charcoal-text overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="p-6 bg-primary text-ivory-base flex items-center justify-between border-b border-antique-gold/30">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-sans tracking-[0.25em] text-antique-gold uppercase font-semibold">
                Couture Order Record
              </span>
              <span className="text-xs font-mono px-2.5 py-0.5 bg-white/10 text-ivory-base border border-white/20">
                {order.orderNumber}
              </span>
            </div>
            <h2 className="font-serif text-2xl text-ivory-base mt-1">
              Order Details & Bespoke Calibration
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-ivory-base/80 hover:text-ivory-base hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-sans"
              title="Print Order Summary / Packing Slip"
            >
              <Printer className="w-4 h-4 text-antique-gold" />
              <span className="hidden sm:inline">Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-ivory-base/70 hover:text-ivory-base hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-sans">
          {/* Top Status Workflow Bar */}
          <div className="p-5 bg-surface-container border border-outline-variant/40 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-charcoal-text/60 block">
                  Placed Date & Time
                </span>
                <span className="font-medium text-charcoal-text">
                  {formatDate(order.createdAt)}
                </span>
              </div>

              {/* Order Status Control */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-charcoal-text/60 block">
                  Atelier Fulfillment Status
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as OrderStatus)}
                  className="p-2 bg-background border border-outline-variant focus:border-antique-gold font-medium text-xs text-charcoal-text"
                >
                  <option value="PAYMENT_PENDING">Payment Pending</option>
                  <option value="IN_PRODUCTION">In Production (Atelier)</option>
                  <option value="DISPATCHED">Dispatched (White Glove)</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Payment Status Control */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-charcoal-text/60 block">
                  Payment Settlement Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={e => setPaymentStatus(e.target.value as PaymentStatus)}
                  className="p-2 bg-background border border-outline-variant focus:border-antique-gold font-medium text-xs text-charcoal-text"
                >
                  <option value="PENDING">Pending Verification</option>
                  <option value="PAID">Settled / Paid</option>
                  <option value="FAILED">Failed / Declined</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={isUpdating}
                className="px-5 py-2.5 bg-primary text-ivory-base font-semibold hover:bg-charcoal-text transition-colors flex items-center gap-2"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-antique-gold" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-antique-gold" />
                    <span>{isUpdating ? 'Updating...' : 'Update Status'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Courier / Atelier Notes */}
            <div className="pt-2 border-t border-outline-variant/30 space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-charcoal-text/60 block">
                Atelier Notes, Custom Embellishment Instructions or Courier Tracking Details
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Tracking No: BDX-99482012IN or Bride requested golden latkan personalization."
                className="w-full p-2.5 bg-background border border-outline-variant focus:border-antique-gold text-xs"
              />
            </div>
          </div>

          {/* Customer & Shipping Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-surface-container-low border border-outline-variant/30 space-y-3">
              <h3 className="font-serif text-lg text-charcoal-text flex items-center gap-2">
                <Mail className="w-4 h-4 text-antique-gold" />
                <span>Client Profile & Contact</span>
              </h3>
              <div className="space-y-1.5 text-charcoal-text/80">
                <p>
                  <span className="font-semibold text-charcoal-text">Name:</span>{' '}
                  {order.shippingAddress.fullName}
                </p>
                <p>
                  <span className="font-semibold text-charcoal-text">Email:</span>{' '}
                  {order.customerEmail}
                </p>
                <p>
                  <span className="font-semibold text-charcoal-text">Phone:</span>{' '}
                  {order.customerPhone}
                </p>
                <p>
                  <span className="font-semibold text-charcoal-text">Payment Method:</span>{' '}
                  <span className="font-mono text-[11px] uppercase bg-surface-container px-2 py-0.5 border border-outline-variant">
                    {order.paymentMethod}
                  </span>
                </p>
                {order.paymentReferenceId && (
                  <p>
                    <span className="font-semibold text-charcoal-text">Ref / Gateway ID:</span>{' '}
                    <span className="font-mono text-[11px] text-antique-gold">{order.paymentReferenceId}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="p-5 bg-surface-container-low border border-outline-variant/30 space-y-3">
              <h3 className="font-serif text-lg text-charcoal-text flex items-center gap-2">
                <MapPin className="w-4 h-4 text-antique-gold" />
                <span>Delivery & Fitting Address</span>
              </h3>
              <div className="space-y-1 text-charcoal-text/80 leading-relaxed">
                <p className="font-medium text-charcoal-text">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                  <span className="font-semibold font-mono">{order.shippingAddress.pincode}</span>
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
          </div>

          {/* Ordered Garments & Custom Measurements */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl text-charcoal-text flex items-center gap-2">
              <Scissors className="w-4 h-4 text-antique-gold" />
              <span>Ordered Garments ({order.items.length})</span>
            </h3>

            <div className="border border-outline-variant/40 divide-y divide-outline-variant/30">
              {order.items.map((item, idx) => (
                <div key={item.id || idx} className="p-4 bg-surface-container-low space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-serif text-base text-charcoal-text">{item.productTitle}</h4>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-charcoal-text/70 pt-0.5">
                        <span>SKU: {item.variantSku}</span>
                        <span>•</span>
                        <span>Size: <strong className="text-charcoal-text">{item.size}</strong></span>
                        <span>•</span>
                        <span>Color: {item.color}</span>
                        <span>•</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="font-serif text-base text-antique-gold font-medium">
                      {formatInr(item.totalPriceInr)}
                    </div>
                  </div>

                  {/* Bespoke Measurements Box if provided */}
                  {item.customMeasurements && Object.keys(item.customMeasurements).length > 0 && (
                    <div className="p-3.5 bg-antique-gold/10 border border-antique-gold/30 space-y-2">
                      <span className="text-[10px] font-sans font-semibold tracking-wider text-antique-gold uppercase flex items-center gap-1.5">
                        <Scissors className="w-3.5 h-3.5" />
                        <span>Client Made-To-Measure Calibration Specs</span>
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {Object.entries(item.customMeasurements).map(([key, val]) => (
                          <div key={key} className="bg-background/80 p-2 border border-outline-variant/30">
                            <span className="text-[10px] text-charcoal-text/60 capitalize block">
                              {key.replace(/([A-Z])/g, ' $1')}
                            </span>
                            <span className="font-semibold text-charcoal-text">{String(val)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pricing & Financial Summary */}
          <div className="p-5 bg-primary text-ivory-base border border-antique-gold/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-sans tracking-widest text-antique-gold uppercase font-semibold block">
                Total Financial Breakdown
              </span>
              <p className="text-xs text-ivory-base/70">
                GST (12%) and complimentary insured express shipping included.
              </p>
            </div>

            <div className="space-y-1.5 text-right w-full sm:w-auto">
              <div className="flex justify-between sm:justify-end gap-6 text-xs text-ivory-base/80">
                <span>Subtotal:</span>
                <span>{formatInr(order.subtotalInr)}</span>
              </div>
              <div className="flex justify-between sm:justify-end gap-6 text-xs text-ivory-base/80">
                <span>GST (12%):</span>
                <span>{formatInr(order.taxInr)}</span>
              </div>
              <div className="flex justify-between sm:justify-end gap-6 text-xs text-ivory-base/80">
                <span>Shipping:</span>
                <span>{order.shippingInr === 0 ? 'Complimentary' : formatInr(order.shippingInr)}</span>
              </div>
              <div className="flex justify-between sm:justify-end gap-6 text-base font-serif text-antique-gold pt-1 border-t border-white/20">
                <span>Grand Total:</span>
                <span>{formatInr(order.totalInr)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
