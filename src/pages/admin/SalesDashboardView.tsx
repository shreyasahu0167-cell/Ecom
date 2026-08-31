import React, { useState } from 'react';
import { Order, Product, AtelierAppointment } from '../../types';
import { formatInr, formatDate } from '../../utils/formatters';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Calendar,
  Layers,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Sparkles,
  DollarSign,
  ChevronRight,
  Users,
  BarChart2,
} from 'lucide-react';

interface SalesDashboardViewProps {
  orders: Order[];
  products: Product[];
  appointments: AtelierAppointment[];
  onNavigateToOrders: () => void;
  onNavigateToProducts: () => void;
  onNavigateToAppointments: () => void;
  onSelectOrder: (order: Order) => void;
}

export const SalesDashboardView: React.FC<SalesDashboardViewProps> = ({
  orders,
  products,
  appointments,
  onNavigateToOrders,
  onNavigateToProducts,
  onNavigateToAppointments,
  onSelectOrder,
}) => {
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all');

  // Compute Metrics
  const totalRevenue = orders.reduce((sum, o) => (o.paymentStatus === 'PAID' ? sum + o.totalInr : sum), 0);
  const grossPipelineValue = orders.reduce((sum, o) => sum + o.totalInr, 0);
  const totalOrdersCount = orders.length;
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(grossPipelineValue / totalOrdersCount) : 0;

  const inProductionCount = orders.filter(o => o.status === 'IN_PRODUCTION').length;
  const pendingPaymentCount = orders.filter(o => o.paymentStatus === 'PENDING').length;
  const dispatchedCount = orders.filter(o => o.status === 'DISPATCHED').length;
  const deliveredCount = orders.filter(o => o.status === 'DELIVERED').length;

  const pendingAppointmentsCount = appointments.filter(a => a.status === 'REQUESTED').length;

  // Category revenue breakdown estimate
  const categoryStats: Record<string, { label: string; count: number; value: number }> = {
    bridal: { label: 'Bridal Couture', count: 0, value: 0 },
    lehengas: { label: 'Occasion Lehengas', count: 0, value: 0 },
    sarees: { label: 'Artisanal Sarees', count: 0, value: 0 },
    anarkalis: { label: 'Contemporary Anarkalis', count: 0, value: 0 },
    'ready-to-wear': { label: 'Ready To Wear', count: 0, value: 0 },
    accessories: { label: 'Accessories & Fine Accents', count: 0, value: 0 },
  };

  orders.forEach(ord => {
    ord.items.forEach(item => {
      // Find matching product
      const p = products.find(prod => prod.id === item.productId || prod.title === item.productTitle);
      const catKey = p?.category || 'bridal';
      if (categoryStats[catKey]) {
        categoryStats[catKey].count += item.quantity;
        categoryStats[catKey].value += item.totalPriceInr;
      }
    });
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Welcome & Timeframe Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div>
          <span className="text-[10px] font-sans tracking-[0.25em] text-antique-gold uppercase font-semibold block">
            Executive Summary & Analytics
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-charcoal-text mt-1">
            Sales & Atelier Production Pipeline
          </h1>
        </div>

        <div className="flex items-center gap-2 bg-surface-container p-1 border border-outline-variant/40 text-xs font-sans">
          <button
            onClick={() => setTimeframe('all')}
            className={`px-3 py-1.5 transition-colors ${
              timeframe === 'all'
                ? 'bg-primary text-ivory-base font-semibold'
                : 'text-charcoal-text/70 hover:text-charcoal-text'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`px-3 py-1.5 transition-colors ${
              timeframe === 'month'
                ? 'bg-primary text-ivory-base font-semibold'
                : 'text-charcoal-text/70 hover:text-charcoal-text'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeframe('week')}
            className={`px-3 py-1.5 transition-colors ${
              timeframe === 'week'
                ? 'bg-primary text-ivory-base font-semibold'
                : 'text-charcoal-text/70 hover:text-charcoal-text'
            }`}
          >
            This Week
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Gross Settled Revenue */}
        <div className="p-6 bg-surface-container-low border border-outline-variant/40 space-y-3 relative overflow-hidden group hover:border-antique-gold/60 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-sans uppercase tracking-wider text-charcoal-text/70 font-semibold">
              Settled Revenue
            </span>
            <div className="w-8 h-8 rounded-none bg-antique-gold/15 flex items-center justify-center text-antique-gold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl text-charcoal-text font-normal">
            {formatInr(totalRevenue)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-sans">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>High-Value Ensembles Settled</span>
          </div>
        </div>

        {/* Card 2: Total Orders Placed */}
        <div className="p-6 bg-surface-container-low border border-outline-variant/40 space-y-3 relative overflow-hidden group hover:border-antique-gold/60 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-sans uppercase tracking-wider text-charcoal-text/70 font-semibold">
              Total Ensembles
            </span>
            <div className="w-8 h-8 rounded-none bg-primary/10 flex items-center justify-center text-primary">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl text-charcoal-text font-normal">
            {totalOrdersCount} Orders
          </div>
          <div className="text-[11px] text-charcoal-text/60 font-sans">
            Avg. Order Value: <strong className="text-charcoal-text">{formatInr(avgOrderValue)}</strong>
          </div>
        </div>

        {/* Card 3: Atelier In-Production */}
        <div className="p-6 bg-surface-container-low border border-outline-variant/40 space-y-3 relative overflow-hidden group hover:border-antique-gold/60 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-sans uppercase tracking-wider text-charcoal-text/70 font-semibold">
              In Master Craftsman Loom
            </span>
            <div className="w-8 h-8 rounded-none bg-amber-500/15 flex items-center justify-center text-amber-700">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl text-charcoal-text font-normal">
            {inProductionCount} In-Production
          </div>
          <div className="text-[11px] text-amber-800 font-sans flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Active handcrafting queue</span>
          </div>
        </div>

        {/* Card 4: Atelier Appointments */}
        <div className="p-6 bg-surface-container-low border border-outline-variant/40 space-y-3 relative overflow-hidden group hover:border-antique-gold/60 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-sans uppercase tracking-wider text-charcoal-text/70 font-semibold">
              VIP Fittings Booked
            </span>
            <div className="w-8 h-8 rounded-none bg-indigo-500/15 flex items-center justify-center text-indigo-700">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl text-charcoal-text font-normal">
            {appointments.length} Consultations
          </div>
          <div className="text-[11px] text-indigo-700 font-sans">
            {pendingAppointmentsCount} awaiting confirmation
          </div>
        </div>
      </div>

      {/* Production & Fulfillment Status Stepper */}
      <div className="p-6 bg-surface-container-low border border-outline-variant/40 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-charcoal-text">Fulfillment Pipeline Overview</h2>
          <button
            onClick={onNavigateToOrders}
            className="text-xs font-sans font-semibold text-antique-gold hover:text-primary transition-colors flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
          <div className="p-4 bg-background border border-outline-variant/40 space-y-1">
            <div className="flex items-center justify-between text-amber-700 font-semibold">
              <span>Payment Pending</span>
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="text-2xl font-serif text-charcoal-text">{pendingPaymentCount}</div>
            <p className="text-[10px] text-charcoal-text/60">Awaiting wire / gateway settlement</p>
          </div>

          <div className="p-4 bg-background border border-outline-variant/40 space-y-1">
            <div className="flex items-center justify-between text-blue-700 font-semibold">
              <span>In Production</span>
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-2xl font-serif text-charcoal-text">{inProductionCount}</div>
            <p className="text-[10px] text-charcoal-text/60">Tailoring & zardozi handcrafting</p>
          </div>

          <div className="p-4 bg-background border border-outline-variant/40 space-y-1">
            <div className="flex items-center justify-between text-purple-700 font-semibold">
              <span>Dispatched</span>
              <Truck className="w-4 h-4" />
            </div>
            <div className="text-2xl font-serif text-charcoal-text">{dispatchedCount}</div>
            <p className="text-[10px] text-charcoal-text/60">En route via express courier</p>
          </div>

          <div className="p-4 bg-background border border-outline-variant/40 space-y-1">
            <div className="flex items-center justify-between text-emerald-700 font-semibold">
              <span>Delivered</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-2xl font-serif text-charcoal-text">{deliveredCount}</div>
            <p className="text-[10px] text-charcoal-text/60">Completed customer orders</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Category Performance & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Category Demand Distribution */}
        <div className="p-6 bg-surface-container-low border border-outline-variant/40 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg text-charcoal-text">Category Demand Share</h3>
            <span className="text-[10px] font-sans text-charcoal-text/60 uppercase tracking-wider">
              Couture Mix
            </span>
          </div>

          <div className="space-y-4 text-xs font-sans">
            {Object.entries(categoryStats).map(([key, stat]) => {
              const sharePercent =
                grossPipelineValue > 0 ? Math.round((stat.value / grossPipelineValue) * 100) : 0;
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-charcoal-text">
                    <span className="font-medium">{stat.label}</span>
                    <span className="font-mono text-antique-gold">{formatInr(stat.value)}</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${Math.max(sharePercent, 6)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-charcoal-text/60">
                    <span>{stat.count} units ordered</span>
                    <span>{sharePercent}% of total sales</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-outline-variant/30">
            <button
              onClick={onNavigateToProducts}
              className="w-full py-2.5 bg-surface-container hover:bg-surface-container-high border border-outline-variant text-charcoal-text text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Package className="w-4 h-4 text-antique-gold" />
              <span>Manage Store Products & Catalog</span>
            </button>
          </div>
        </div>

        {/* Right: Recent Orders Feed */}
        <div className="lg:col-span-2 p-6 bg-surface-container-low border border-outline-variant/40 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg text-charcoal-text">Recent Couture Orders</h3>
              <p className="text-xs font-sans text-charcoal-text/60">
                Click any order to inspect bespoke measurements and update status.
              </p>
            </div>
            <button
              onClick={onNavigateToOrders}
              className="text-xs font-sans font-semibold text-antique-gold hover:text-primary transition-colors"
            >
              View Full Register
            </button>
          </div>

          <div className="divide-y divide-outline-variant/30">
            {orders.slice(0, 5).map(order => (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className="py-3.5 px-3 hover:bg-surface-container/60 cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-charcoal-text">{order.orderNumber}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 uppercase tracking-wider font-semibold ${
                        order.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'IN_PRODUCTION'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'DISPATCHED'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status.replace('_', ' ')}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 uppercase font-medium ${
                        order.paymentStatus === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                  <div className="text-charcoal-text/80 text-[11px]">
                    <span>{order.shippingAddress.fullName}</span> •{' '}
                    <span>{order.shippingAddress.city}</span> •{' '}
                    <span>{order.items.length} garment{order.items.length > 1 ? 's' : ''}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right">
                    <span className="font-serif text-sm font-semibold text-antique-gold block">
                      {formatInr(order.totalInr)}
                    </span>
                    <span className="text-[10px] text-charcoal-text/50">{formatDate(order.createdAt)}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-charcoal-text/40 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>

          {orders.length === 0 && (
            <div className="p-8 text-center text-charcoal-text/60 font-sans text-xs">
              No orders placed yet. Orders submitted by customers will appear here in real time.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
