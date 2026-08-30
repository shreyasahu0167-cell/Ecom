import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Product, Order, AtelierAppointment, OrderStatus } from '../types';
import { fetchAllProducts } from '../services/productService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DEMO_PRODUCTS } from '../data/demoData';
import { formatInr, formatDate } from '../utils/formatters';
import {
  Shield,
  Package,
  ShoppingBag,
  Calendar,
  Layers,
  Edit,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Lock,
} from 'lucide-react';

interface AdminPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const { profile, isAdmin, isSupabaseConfigured } = useAuth();

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'appointments'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [appointments, setAppointments] = useState<AtelierAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Variant editing state
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [newStock, setNewStock] = useState<number>(0);

  useEffect(() => {
    async function loadAdminData() {
      setIsLoading(true);
      try {
        // Load Products
        const prods = await fetchAllProducts();
        setProducts(prods);

        // Load Orders
        if (isSupabaseConfigured && supabase) {
          const { data: ords } = await supabase
            .from('orders')
            .select(`
              id, order_number, customer_email, customer_phone, shipping_address,
              subtotal_inr, tax_inr, shipping_inr, total_inr, status, payment_status,
              payment_method, created_at,
              order_items (*)
            `)
            .order('created_at', { ascending: false });

          if (ords) {
            setOrders(
              ords.map((o: any) => ({
                id: o.id,
                orderNumber: o.order_number,
                customerEmail: o.customer_email,
                customerPhone: o.customer_phone,
                shippingAddress: o.shipping_address,
                items: (o.order_items || []).map((oi: any) => ({
                  id: oi.id,
                  orderId: oi.order_id,
                  productId: oi.product_id,
                  variantId: oi.variant_id,
                  productTitle: oi.product_title,
                  variantSku: oi.variant_sku,
                  size: oi.size,
                  color: oi.color,
                  unitPriceInr: Number(oi.unit_price_inr),
                  quantity: Number(oi.quantity),
                  totalPriceInr: Number(oi.total_price_inr),
                })),
                subtotalInr: Number(o.subtotal_inr),
                taxInr: Number(o.tax_inr),
                shippingInr: Number(o.shipping_inr),
                totalInr: Number(o.total_inr),
                status: o.status,
                paymentStatus: o.payment_status,
                paymentMethod: o.payment_method,
                isDemoOrder: false,
                createdAt: o.created_at,
              }))
            );
          }

          // Load Appointments
          const { data: appts } = await supabase
            .from('atelier_appointments')
            .select('*')
            .order('created_at', { ascending: false });

          if (appts) {
            setAppointments(
              appts.map((a: any) => ({
                id: a.id,
                fullName: a.full_name,
                email: a.email,
                phone: a.phone,
                preferredDate: a.preferred_date,
                preferredTimeSlot: a.preferred_time_slot,
                occasionType: a.occasion_type,
                estimatedGuestCount: a.guest_count,
                notes: a.notes,
                status: a.status,
                createdAt: a.created_at,
              }))
            );
          }
        } else {
          // Demo Mode: Read localStorage demo orders & appointments
          try {
            const demoOrds: Order[] = JSON.parse(
              localStorage.getItem('saanvya_demo_orders') || '[]'
            );
            setOrders(demoOrds);
            const demoAppts: AtelierAppointment[] = JSON.parse(
              localStorage.getItem('saanvya_demo_appointments') || '[]'
            );
            setAppointments(demoAppts);
          } catch {}
        }
      } catch (err: any) {
        console.error('Error loading admin data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin, isSupabaseConfigured]);

  if (!isAdmin) {
    return (
      <div className="bg-background min-h-[70vh] py-20 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8 bg-surface-container-low border border-outline-variant/30 text-center space-y-4">
          <Lock className="w-10 h-10 text-outline mx-auto stroke-1" />
          <h2 className="font-serif text-2xl text-charcoal-text">Admin Access Required</h2>
          <p className="font-sans text-xs text-charcoal-text/70">
            This dashboard requires authenticated administrator privileges verified by Supabase RLS.
          </p>
          <button
            onClick={() => onNavigate('auth')}
            className="px-6 py-2.5 bg-primary text-ivory-base text-xs font-sans tracking-widest uppercase hover:bg-charcoal-text"
          >
            Go to Authentication Portal
          </button>
        </div>
      </div>
    );
  }

  const handleUpdateVariantStock = async (variantId: string) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('product_variants')
        .update({ stock_quantity: newStock, updated_at: new Date().toISOString() })
        .eq('id', variantId);

      if (error) {
        setStatusMessage(`Stock update failed: ${error.message}`);
        return;
      }
    }

    // Update local state
    setProducts(prev =>
      prev.map(p => ({
        ...p,
        variants: p.variants.map(v =>
          v.id === variantId ? { ...v, stockQuantity: newStock } : v
        ),
      }))
    );
    setEditingVariantId(null);
    setStatusMessage(`Stock updated successfully for variant.`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) {
        setStatusMessage(`Order status update failed: ${error.message}`);
        return;
      }
    } else {
      // Demo update in localStorage
      const updated = orders.map(o => (o.id === orderId ? { ...o, status: newStatus } : o));
      setOrders(updated);
      localStorage.setItem('saanvya_demo_orders', JSON.stringify(updated));
    }

    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    setStatusMessage(`Order status updated to ${newStatus}.`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const orderStatuses: OrderStatus[] = [
    'PAYMENT_PENDING',
    'AWAITING_VERIFICATION',
    'CONFIRMED',
    'IN_PRODUCTION',
    'QUALITY_CHECK',
    'READY_FOR_DISPATCH',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
  ];

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Admin Header */}
        <div className="bg-surface-container-low p-6 sm:p-8 border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-antique-gold font-semibold text-xs uppercase tracking-widest">
              <Shield className="w-4 h-4" />
              <span>Saanvya Atelier Administration</span>
            </div>
            <h1 className="font-serif text-3xl text-charcoal-text">
              Store & Inventory Management
            </h1>
            <p className="font-sans text-xs text-charcoal-text/70">
              Authenticated Admin: <span className="font-mono">{profile?.email}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('shop')}
              className="px-4 py-2 bg-surface-container border border-outline-variant/50 text-xs font-sans hover:border-charcoal-text text-charcoal-text"
            >
              View Live Storefront
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="p-4 bg-antique-gold/20 border border-antique-gold/40 text-charcoal-text text-xs font-sans flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-antique-gold flex-shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-outline-variant/30 space-x-6 text-xs font-sans">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-3 tracking-wider uppercase font-semibold transition-colors relative flex items-center gap-2 ${
              activeTab === 'products'
                ? 'text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-antique-gold'
                : 'text-charcoal-text/60 hover:text-charcoal-text'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Catalog & Variants ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 tracking-wider uppercase font-semibold transition-colors relative flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-antique-gold'
                : 'text-charcoal-text/60 hover:text-charcoal-text'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders & Manifests ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`pb-3 tracking-wider uppercase font-semibold transition-colors relative flex items-center gap-2 ${
              activeTab === 'appointments'
                ? 'text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-antique-gold'
                : 'text-charcoal-text/60 hover:text-charcoal-text'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Atelier Appointments ({appointments.length})</span>
          </button>
        </div>

        {/* 1. Products & Variants Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="overflow-x-auto bg-surface-container-low border border-outline-variant/30">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-surface-container border-b border-outline-variant/30 text-charcoal-text uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4">Ensemble</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Base Price</th>
                    <th className="p-4">Variants (Size, Color, SKU, Stock)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-surface-container/40 transition-colors">
                      <td className="p-4 align-top">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images[0]}
                            alt={prod.title}
                            className="w-12 h-16 object-cover bg-surface-container border border-outline-variant/30 flex-shrink-0"
                          />
                          <div>
                            <span className="font-serif text-sm font-semibold text-charcoal-text block">
                              {prod.title}
                            </span>
                            <span className="text-[10px] text-outline">ID: {prod.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-top uppercase text-antique-gold font-medium">
                        {prod.categoryLabel}
                      </td>
                      <td className="p-4 align-top font-semibold text-charcoal-text">
                        {formatInr(prod.basePriceInr)}
                      </td>
                      <td className="p-4 align-top">
                        <div className="space-y-2">
                          {prod.variants.map((v) => (
                            <div
                              key={v.id}
                              className="flex items-center justify-between gap-4 p-2 bg-background border border-outline-variant/30"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-semibold px-2 py-0.5 bg-surface-container text-charcoal-text text-[10px]">
                                  {v.size}
                                </span>
                                <span className="text-[11px] text-charcoal-text/80">{v.color}</span>
                                <span className="text-[10px] font-mono text-outline">[{v.sku}]</span>
                              </div>

                              <div className="flex items-center gap-2">
                                {editingVariantId === v.id ? (
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="number"
                                      min={0}
                                      value={newStock}
                                      onChange={(e) => setNewStock(Number(e.target.value))}
                                      className="w-16 p-1 text-xs border border-antique-gold text-charcoal-text"
                                    />
                                    <button
                                      onClick={() => handleUpdateVariantStock(v.id)}
                                      className="p-1 bg-antique-gold text-primary hover:bg-antique-gold-light"
                                      title="Save"
                                    >
                                      <Save className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-[11px] font-medium ${
                                        v.stockQuantity > 0 ? 'text-emerald-800' : 'text-deep-rose'
                                      }`}
                                    >
                                      {v.stockQuantity} in stock
                                    </span>
                                    <button
                                      onClick={() => {
                                        setEditingVariantId(v.id);
                                        setNewStock(v.stockQuantity);
                                      }}
                                      className="text-outline hover:text-charcoal-text"
                                      title="Edit stock"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="py-16 text-center bg-surface-container-low border border-outline-variant/30">
                <ShoppingBag className="w-10 h-10 text-outline mx-auto stroke-1 mb-2" />
                <p className="font-serif text-lg text-charcoal-text">No Orders Recorded Yet</p>
                <p className="text-xs font-sans text-charcoal-text/60">
                  Orders submitted through checkout will appear here in real time.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-6 bg-surface-container-low border border-outline-variant/30 space-y-4 text-xs font-sans"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/20 pb-3">
                      <div>
                        <span className="font-mono font-bold text-sm text-charcoal-text mr-3">
                          {ord.orderNumber}
                        </span>
                        <span className="text-[10px] font-mono text-outline">
                          UUID: {ord.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-outline text-[11px]">{formatDate(ord.createdAt)}</span>
                        <select
                          value={ord.status}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                          className="p-1.5 bg-background border border-outline-variant/50 text-xs font-semibold text-charcoal-text cursor-pointer"
                        >
                          {orderStatuses.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="font-semibold text-charcoal-text block mb-1">Customer</span>
                        <p>{ord.shippingAddress?.fullName}</p>
                        <p className="text-charcoal-text/70">{ord.customerEmail}</p>
                        <p className="text-charcoal-text/70">{ord.customerPhone}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-charcoal-text block mb-1">
                          Delivery Destination
                        </span>
                        <p className="text-charcoal-text/80">
                          {ord.shippingAddress?.addressLine1}, {ord.shippingAddress?.city},{' '}
                          {ord.shippingAddress?.state} - {ord.shippingAddress?.pincode}
                        </p>
                      </div>
                      <div className="text-right sm:text-left md:text-right">
                        <span className="font-semibold text-charcoal-text block mb-1">Financials</span>
                        <p className="font-serif text-base font-semibold text-charcoal-text">
                          {formatInr(ord.totalInr)}
                        </p>
                        <p className="text-[11px] text-antique-gold">Method: {ord.paymentMethod}</p>
                      </div>
                    </div>

                    {/* Order Items Breakdown */}
                    <div className="pt-2 border-t border-outline-variant/20 flex flex-wrap gap-3">
                      {ord.items.map((item, i) => (
                        <div
                          key={i}
                          className="p-2 bg-background border border-outline-variant/30 text-[11px] flex items-center gap-2"
                        >
                          <span className="font-semibold">{item.productTitle}</span>
                          <span className="text-charcoal-text/60">({item.size}, {item.color})</span>
                          <span className="text-antique-gold font-medium">Qty: {item.quantity}</span>
                          <span className="font-semibold">{formatInr(item.totalPriceInr)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. Atelier Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            {appointments.length === 0 ? (
              <div className="py-16 text-center bg-surface-container-low border border-outline-variant/30">
                <Calendar className="w-10 h-10 text-outline mx-auto stroke-1 mb-2" />
                <p className="font-serif text-lg text-charcoal-text">No Consultation Requests Yet</p>
                <p className="text-xs font-sans text-charcoal-text/60">
                  Client bookings from the 'Visit Store' page will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="p-6 bg-surface-container-low border border-outline-variant/30 space-y-3 text-xs font-sans"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/20 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-lg font-semibold text-charcoal-text">
                          {appt.fullName}
                        </span>
                        <span className="text-antique-gold font-medium">({appt.occasionType})</span>
                      </div>
                      <span className="px-2.5 py-1 bg-antique-gold/20 text-charcoal-text font-semibold uppercase text-[10px]">
                        Status: {appt.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-charcoal-text/80">
                      <div>
                        <span className="font-semibold text-charcoal-text block">Date & Time</span>
                        <p>{formatDate(appt.preferredDate)}</p>
                        <p>{appt.preferredTimeSlot}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-charcoal-text block">Client Contact</span>
                        <p>{appt.phone}</p>
                        <p>{appt.email}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-charcoal-text block">Party Size & Notes</span>
                        <p>{appt.estimatedGuestCount} Guest(s)</p>
                        <p className="italic">{appt.notes || 'No special notes provided.'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
