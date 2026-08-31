import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { fetchOrderDetails } from '../services/orderService';
import { formatInr, formatDate } from '../utils/formatters';
import { CheckCircle2, Clock, Package, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

interface OrderConfirmationPageProps {
  orderId: string;
  onNavigate: (page: string, params?: any) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  orderId,
  onNavigate,
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchOrderDetails(orderId);
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="py-24 text-center bg-background min-h-[60vh] flex items-center justify-center">
        <p className="font-serif text-lg text-charcoal-text">Retrieving Order Manifest...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-24 max-w-md mx-auto text-center px-4 bg-background min-h-[60vh] space-y-4">
        <ShieldAlert className="w-12 h-12 text-outline mx-auto stroke-1" />
        <h2 className="font-serif text-2xl text-charcoal-text">Order Manifest Not Found</h2>
        <p className="font-sans text-xs text-charcoal-text/70">
          We could not locate order details for reference ID: <span className="font-mono">{orderId}</span>.
        </p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-6 py-2.5 bg-primary text-ivory-base text-xs font-sans tracking-widest uppercase"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Order Header */}
        <div className="text-center space-y-3 bg-surface-container-low p-8 border border-outline-variant/30">
          <div className="w-12 h-12 bg-antique-gold/20 text-antique-gold rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <span className="text-xs font-sans tracking-[0.25em] text-antique-gold uppercase font-semibold block">
            Order Successfully Created
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-text">
            Thank You, {order.shippingAddress.fullName}
          </h1>
          <p className="font-sans text-xs text-charcoal-text/70 max-w-md mx-auto">
            Your couture order manifest has been recorded. A digital confirmation and sizing review summary have been prepared.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-xs font-sans">
            <div className="px-3 py-1.5 bg-surface-container border border-outline-variant/50">
              Order No: <span className="font-mono font-semibold text-charcoal-text">{order.orderNumber}</span>
            </div>
            <div className="px-3 py-1.5 bg-surface-container border border-outline-variant/50">
              Database UUID: <span className="font-mono text-[10px] text-outline">{order.id}</span>
            </div>
            <div className="px-3 py-1.5 bg-antique-gold/15 text-charcoal-text border border-antique-gold/40 flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-antique-gold" />
              <span>Status: {order.status}</span>
            </div>
          </div>
        </div>

        {/* Order Details & Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Items manifest (7 cols) */}
          <div className="md:col-span-7 bg-surface-container-low p-6 border border-outline-variant/30 space-y-6">
            <h2 className="font-serif text-xl text-charcoal-text border-b border-outline-variant/30 pb-3">
              Ensemble Manifest
            </h2>

            <div className="space-y-4 divide-y divide-outline-variant/20">
              {order.items.map((item, idx) => (
                <div key={idx} className="pt-4 first:pt-0 flex justify-between items-start text-xs font-sans">
                  <div>
                    <h4 className="font-serif text-base text-charcoal-text">{item.productTitle}</h4>
                    <p className="text-[11px] text-charcoal-text/70 mt-0.5">
                      Size: <span className="font-medium text-charcoal-text">{item.size}</span> • Color: {item.color}
                    </p>
                    <p className="text-[10px] text-outline">SKU: {item.variantSku}</p>
                    <p className="text-[11px] text-charcoal-text/80 mt-1">
                      Qty: {item.quantity} × {formatInr(item.unitPriceInr)}
                    </p>
                  </div>
                  <span className="font-semibold text-charcoal-text text-sm">
                    {formatInr(item.totalPriceInr)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-outline-variant/30 pt-4 space-y-2 text-xs font-sans text-charcoal-text/80">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatInr(order.subtotalInr)}</span>
              </div>
              <div className="flex justify-between">
                <span>Luxury GST (12%)</span>
                <span>{formatInr(order.taxInr)}</span>
              </div>
              <div className="flex justify-between">
                <span>Insured Courier Delivery</span>
                <span>
                  {order.shippingInr === 0 ? 'Complimentary' : formatInr(order.shippingInr)}
                </span>
              </div>
              <div className="border-t border-outline-variant/30 pt-3 flex justify-between text-base font-serif font-semibold text-charcoal-text">
                <span>Total Amount (INR)</span>
                <span>{formatInr(order.totalInr)}</span>
              </div>
            </div>
          </div>

          {/* Shipping & Next Steps (5 cols) */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-surface-container-low p-6 border border-outline-variant/30 space-y-3 text-xs font-sans">
              <h3 className="font-serif text-lg text-charcoal-text border-b border-outline-variant/30 pb-2">
                Shipping Destination
              </h3>
              <p className="font-medium text-charcoal-text">{order.shippingAddress.fullName}</p>
              <p className="text-charcoal-text/80 leading-relaxed">
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                <br />
                {order.shippingAddress.country}
              </p>
              <p className="text-charcoal-text/70 pt-1">
                Contact: {order.customerPhone} • {order.customerEmail}
              </p>
            </div>

            <div className="bg-primary text-ivory-base p-6 border border-antique-gold/30 space-y-3 text-xs font-sans">
              <div className="flex items-center gap-2 text-antique-gold font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Atelier Next Steps</span>
              </div>
              <p className="text-ivory-base/80 leading-relaxed">
                Your ensemble order is queued for craftsman allocation and fabric cutting. Our concierge team will reach out via WhatsApp/email for custom measurement confirmation.
              </p>
            </div>

            <button
              onClick={() => onNavigate('shop')}
              className="w-full py-3.5 bg-transparent border border-charcoal-text text-charcoal-text font-sans text-xs font-semibold tracking-[0.2em] uppercase hover:bg-charcoal-text hover:text-ivory-base transition-colors flex items-center justify-center gap-2"
            >
              <span>Continue Exploring</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
