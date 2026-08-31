import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { formatInr } from '../../utils/formatters';
import { getStoreSettings, DEFAULT_DEMO_STORE_SETTINGS } from '../../services/storeSettingsService';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

interface CartDrawerProps {
  onNavigate: (page: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigate }) => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotalInr,
    totalItems,
  } = useCart();

  const [threshold, setThreshold] = useState<number>(DEFAULT_DEMO_STORE_SETTINGS.freeShippingThresholdInr);

  useEffect(() => {
    let isMounted = true;
    getStoreSettings()
      .then(settings => {
        if (isMounted) {
          setThreshold(settings.freeShippingThresholdInr);
        }
      })
      .catch(() => {
        // Safe fallback in case of unconfigured state
      });
    return () => {
      isMounted = false;
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const freeShippingThreshold = threshold;
  const progressToFreeShipping = Math.min(
    100,
    Math.round((subtotalInr / freeShippingThreshold) * 100)
  );
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotalInr);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal-text/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-ivory-base shadow-2xl flex flex-col border-l border-outline-variant/30">
          {/* Header */}
          <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-antique-gold" />
              <h2 className="font-serif text-xl text-charcoal-text tracking-wide">
                Your Shopping Bag ({totalItems})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-charcoal-text/70 hover:text-charcoal-text hover:bg-surface-container transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="px-6 py-3 bg-surface-container/60 border-b border-outline-variant/20 text-xs font-sans">
            {remainingForFreeShipping > 0 ? (
              <p className="text-charcoal-text/80 mb-1.5">
                Add <span className="font-semibold text-charcoal-text">{formatInr(remainingForFreeShipping)}</span> more for{' '}
                <span className="text-antique-gold font-semibold">Complimentary Insured Delivery</span>
              </p>
            ) : (
              <p className="text-antique-gold font-semibold mb-1.5 flex items-center gap-1.5">
                <span>✦ You have qualified for Complimentary Insured Delivery across India!</span>
              </p>
            )}
            <div className="w-full bg-surface-container-high h-1.5 overflow-hidden">
              <div
                className="bg-antique-gold h-full transition-all duration-500"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 divide-y divide-outline-variant/20">
            {cart.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-outline-variant stroke-1 mb-4" />
                <h3 className="font-serif text-xl text-charcoal-text mb-2">Your Bag is Empty</h3>
                <p className="font-sans text-xs text-charcoal-text/70 max-w-xs mb-6">
                  Discover our bespoke bridal couture and handcrafted artisanal ensembles.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onNavigate('shop');
                  }}
                  className="px-6 py-2.5 bg-primary text-ivory-base text-xs font-sans tracking-widest uppercase hover:bg-charcoal-text transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div key={`${item.variantId}-${idx}`} className="pt-5 first:pt-0 flex gap-4">
                  {/* Thumbnail */}
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80'}
                    alt={item.title}
                    className="w-20 h-28 object-cover bg-surface-container border border-outline-variant/30 flex-shrink-0"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80';
                    }}
                  />

                  {/* Item info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-serif text-base text-charcoal-text leading-tight line-clamp-1">
                          {item.title}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.variantId)}
                          className="text-outline hover:text-deep-rose transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-1 space-y-0.5 text-[11px] font-sans text-charcoal-text/70">
                        <p>Size: <span className="font-medium text-charcoal-text">{item.size}</span></p>
                        <p>Color: <span className="font-medium text-charcoal-text">{item.color}</span></p>
                        <p className="text-[10px] text-outline">SKU: {item.sku}</p>
                      </div>
                    </div>

                    {/* Quantity and Price */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-outline-variant/20">
                      <div className="flex items-center border border-outline-variant/40 bg-surface-container-low">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="p-1 hover:bg-surface-container text-charcoal-text"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-sans font-medium text-charcoal-text">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.stockAvailable !== undefined && item.quantity >= item.stockAvailable}
                          className="p-1 hover:bg-surface-container text-charcoal-text disabled:opacity-30"
                          title="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-sans font-semibold text-sm text-charcoal-text">
                        {formatInr(item.unitPriceInr * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Checkout Button */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-outline-variant/30 bg-surface-container-low space-y-4">
              <div className="flex items-center justify-between text-sm font-sans">
                <span className="text-charcoal-text/80">Estimated Subtotal</span>
                <span className="font-serif text-xl font-medium text-charcoal-text">
                  {formatInr(subtotalInr)}
                </span>
              </div>
              <p className="text-[11px] font-sans text-charcoal-text/60 italic">
                * Taxes (GST) and final insured courier fees calculated at checkout.
              </p>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onNavigate('checkout');
                }}
                className="w-full py-3.5 bg-primary text-ivory-base font-sans text-xs font-medium tracking-[0.18em] uppercase hover:bg-charcoal-text transition-all duration-200 flex items-center justify-center gap-2 group shadow-sm"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onNavigate('shop');
                }}
                className="w-full text-center text-xs font-sans text-charcoal-text/80 hover:text-charcoal-text underline underline-offset-4 py-1"
              >
                Continue Browsing
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
