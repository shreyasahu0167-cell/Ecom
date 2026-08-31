import React, { useState } from 'react';
import { Order, OrderStatus, PaymentStatus } from '../../types';
import { formatInr, formatDate } from '../../utils/formatters';
import {
  Search,
  Filter,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Eye,
  Printer,
  ChevronRight,
  Download,
  Scissors,
  DollarSign,
} from 'lucide-react';

interface OrdersManagerViewProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
}

export const OrdersManagerView: React.FC<OrdersManagerViewProps> = ({
  orders,
  onSelectOrder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  const filteredOrders = orders.filter(ord => {
    const matchesSearch =
      ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customerPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.shippingAddress.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.shippingAddress.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || ord.status === statusFilter;

    const matchesPayment =
      paymentFilter === 'all' || ord.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handlePrintRegister = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div>
          <span className="text-[10px] font-sans tracking-[0.25em] text-antique-gold uppercase font-semibold block">
            Fulfillment & Tailoring Register
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-charcoal-text mt-1">
            Couture Orders & Client Suites
          </h1>
        </div>

        <button
          onClick={handlePrintRegister}
          className="px-4 py-2.5 bg-surface-container hover:bg-surface-container-high border border-outline-variant text-charcoal-text text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <Printer className="w-4 h-4 text-antique-gold" />
          <span>Print Orders Register</span>
        </button>
      </div>

      {/* Toolbar: Search & Filters */}
      <div className="p-4 bg-surface-container-low border border-outline-variant/40 flex flex-col md:flex-row items-stretch md:items-center gap-3 text-xs font-sans">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-charcoal-text/50 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={`Search by Order ID (e.g. SNV-${new Date().getFullYear()}-...), Client Name, Email, City...`}
            className="w-full pl-9 pr-4 py-2.5 bg-background border border-outline-variant focus:border-antique-gold focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="p-2.5 bg-background border border-outline-variant focus:border-antique-gold focus:outline-none"
          >
            <option value="all">All Fulfillment Statuses</option>
            <option value="PAYMENT_PENDING">Payment Pending</option>
            <option value="IN_PRODUCTION">In Production</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={e => setPaymentFilter(e.target.value)}
            className="p-2.5 bg-background border border-outline-variant focus:border-antique-gold focus:outline-none"
          >
            <option value="all">All Payment Statuses</option>
            <option value="PAID">Paid / Settled</option>
            <option value="PENDING">Pending Settlement</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="border border-outline-variant/40 bg-surface-container-low overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-surface-container text-charcoal-text/70 uppercase text-[10px] tracking-wider border-b border-outline-variant/40">
              <tr>
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Client & Contact</th>
                <th className="p-4">Ordered Pieces</th>
                <th className="p-4">Total (INR)</th>
                <th className="p-4">Fulfillment Status</th>
                <th className="p-4">Payment</th>
                <th className="p-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {filteredOrders.map(order => {
                const hasCustomMeasure = order.items.some(
                  i => i.customMeasurements && Object.keys(i.customMeasurements).length > 0
                );

                return (
                  <tr
                    key={order.id}
                    onClick={() => onSelectOrder(order)}
                    className="hover:bg-surface-container/50 cursor-pointer transition-colors"
                  >
                    {/* Order ID & Date */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <span className="font-mono font-semibold text-charcoal-text text-xs block">
                          {order.orderNumber}
                        </span>
                        <span className="text-[10px] text-charcoal-text/50 block">
                          {formatDate(order.createdAt)}
                        </span>
                        {hasCustomMeasure && (
                          <span className="text-[9px] font-sans font-semibold text-antique-gold bg-antique-gold/10 px-1.5 py-0.5 border border-antique-gold/20 inline-block uppercase">
                            Bespoke Sizing
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Client & Contact */}
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-charcoal-text block">
                          {order.shippingAddress.fullName}
                        </span>
                        <span className="text-[11px] text-charcoal-text/70 block">
                          {order.customerEmail}
                        </span>
                        <span className="text-[10px] text-charcoal-text/50 block">
                          {order.shippingAddress.city}, {order.shippingAddress.state}
                        </span>
                      </div>
                    </td>

                    {/* Ordered Pieces */}
                    <td className="p-4">
                      <div className="space-y-1 max-w-xs">
                        <span className="font-medium text-charcoal-text block">
                          {order.items.length} garment{order.items.length > 1 ? 's' : ''}
                        </span>
                        <div className="text-[11px] text-charcoal-text/70 line-clamp-1">
                          {order.items.map(i => i.productTitle).join(', ')}
                        </div>
                      </div>
                    </td>

                    {/* Total (INR) */}
                    <td className="p-4">
                      <span className="font-serif text-sm font-semibold text-antique-gold">
                        {formatInr(order.totalInr)}
                      </span>
                    </td>

                    {/* Fulfillment Status */}
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                          order.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'IN_PRODUCTION'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'DISPATCHED'
                            ? 'bg-purple-100 text-purple-800'
                            : order.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Payment Status */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase ${
                            order.paymentStatus === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                        <span className="text-[10px] text-charcoal-text/50 font-mono block uppercase">
                          {order.paymentMethod === 'ONLINE_PAYMENT' ? 'Gateway' : 'Bank Wire'}
                        </span>
                      </div>
                    </td>

                    {/* Inspect Button */}
                    <td className="p-4 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onSelectOrder(order);
                        }}
                        className="p-2 text-charcoal-text hover:text-antique-gold hover:bg-surface-container transition-colors"
                        title="View Full Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="p-12 text-center text-charcoal-text/60 font-sans text-xs space-y-2">
            <p>No orders found matching your search and filter criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setPaymentFilter('all');
              }}
              className="text-antique-gold underline hover:text-primary"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
