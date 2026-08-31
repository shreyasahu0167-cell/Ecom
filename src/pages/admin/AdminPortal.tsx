import React, { useState, useEffect } from 'react';
import { Product, Order, AtelierAppointment, OrderStatus, PaymentStatus } from '../../types';
import {
  fetchAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateVariantStock,
} from '../../services/productService';
import {
  fetchAllOrders,
  updateOrderStatus,
  updateOrderPaymentStatus,
} from '../../services/orderService';
import {
  fetchAllAppointments,
  updateAppointmentStatus,
} from '../../services/appointmentService';

// Admin Sub-Views & Modals
import { SalesDashboardView } from './SalesDashboardView';
import { ProductsManagerView } from './ProductsManagerView';
import { OrdersManagerView } from './OrdersManagerView';
import { AppointmentsManagerView } from './AppointmentsManagerView';
import { AdminTeamManagerView } from './AdminTeamManagerView';
import { ProductEditorModal } from './ProductEditorModal';
import { OrderDetailModal } from './OrderDetailModal';
import { AdminAuthGuard } from './AdminAuthGuard';
import {
  getCurrentAdminSession,
  logoutAdmin,
  isCurrentAdminAuthenticated,
  getAdminCount,
  MAX_ADMIN_ACCOUNTS,
} from '../../services/adminAuthService';

import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Calendar,
  LogOut,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Layers,
  ChevronRight,
  ShieldCheck,
  Users,
} from 'lucide-react';

interface AdminPortalProps {
  onExit: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onExit }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return isCurrentAdminAuthenticated();
  });

  const [currentAdmin, setCurrentAdmin] = useState(() => getCurrentAdminSession());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'appointments' | 'admins'>('dashboard');

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [appointments, setAppointments] = useState<AtelierAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Load all live data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prods, ords, appts] = await Promise.all([
        fetchAllProducts(),
        fetchAllOrders(),
        fetchAllAppointments(),
      ]);
      setProducts(prods);
      setOrders(ords);
      setAppointments(appts);
    } catch (err) {
      console.error('Error loading admin portal data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
    setCurrentAdmin(null);
  };

  // Product CRUD Handlers
  const handleSaveProduct = async (productData: Omit<Product, 'id'> & { id?: string }) => {
    if (productData.id) {
      const updated = await updateProduct(productData.id, productData);
      setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    } else {
      const created = await createProduct(productData);
      setProducts(prev => [created, ...prev]);
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (productId: string) => {
    await deleteProduct(productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleDuplicateProduct = async (product: Product) => {
    const duplicateData: Omit<Product, 'id'> = {
      ...product,
      title: `${product.title} (Copy)`,
      slug: `${product.slug}-copy-${Date.now().toString().slice(-4)}`,
      isFeatured: false,
      isNewArrival: true,
      variants: product.variants.map((v, i) => ({
        ...v,
        id: `var-dup-${Date.now()}-${i}`,
        sku: `${v.sku}-CP`,
      })),
    };
    const created = await createProduct(duplicateData);
    setProducts(prev => [created, ...prev]);
  };

  const handleQuickUpdateStock = async (productId: string, variantId: string, newStock: number) => {
    await updateVariantStock(productId, variantId, newStock);
    setProducts(prev =>
      prev.map(p =>
        p.id === productId
          ? {
              ...p,
              variants: p.variants.map(v => (v.id === variantId ? { ...v, stockQuantity: newStock } : v)),
            }
          : p
      )
    );
  };

  // Order Handlers
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus, notes?: string) => {
    await updateOrderStatus(orderId, status, notes);
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status, notes: notes !== undefined ? notes : o.notes } : o))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev =>
        prev ? { ...prev, status, notes: notes !== undefined ? notes : prev.notes } : null
      );
    }
  };

  const handleUpdateOrderPayment = async (orderId: string, paymentStatus: PaymentStatus) => {
    await updateOrderPaymentStatus(orderId, paymentStatus);
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, paymentStatus } : o)));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => (prev ? { ...prev, paymentStatus } : null));
    }
  };

  // Appointment Status Handler
  const handleUpdateAppointmentStatus = async (
    id: string,
    status: 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  ) => {
    await updateAppointmentStatus(id, status);
    setAppointments(prev => prev.map(a => (a.id === id ? { ...a, status } : a)));
  };

  if (!isAuthenticated) {
    return <AdminAuthGuard onAuthenticated={() => setIsAuthenticated(true)} onExit={onExit} />;
  }

  return (
    <div className="min-h-screen bg-background text-charcoal-text flex flex-col selection:bg-antique-gold/30">
      {/* Top Luxury Admin Navigation Bar */}
      <header className="sticky top-0 z-40 bg-primary text-ivory-base border-b border-antique-gold/30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Mark & Title */}
          <div className="flex items-center gap-3">
            <span className="font-serif tracking-[0.25em] text-lg sm:text-xl text-ivory-base font-semibold">
              SAANVYA
            </span>
            <span className="h-4 w-px bg-antique-gold/40" />
            <span className="text-[10px] font-sans font-semibold tracking-widest text-antique-gold uppercase px-2 py-0.5 bg-antique-gold/15 border border-antique-gold/30">
              Atelier Management Portal
            </span>
          </div>

          {/* Quick Actions & Exit */}
          <div className="flex items-center gap-3 text-xs font-sans">
            {currentAdmin && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-antique-gold/30 text-[11px] text-ivory-base/90">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="font-medium text-antique-gold">{currentAdmin.fullName}</span>
              </div>
            )}

            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-2 text-ivory-base/80 hover:text-ivory-base hover:bg-white/10 transition-colors"
              title="Refresh all metrics and orders"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onExit}
              className="px-3.5 py-1.5 bg-antique-gold/20 hover:bg-antique-gold/30 text-antique-gold border border-antique-gold/40 font-medium flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Storefront</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 text-ivory-base/60 hover:text-red-300 hover:bg-white/10 transition-colors"
              title="Lock / Sign Out of Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar + Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-4">
          <div className="bg-surface-container-low border border-outline-variant/40 p-3 space-y-1 text-xs font-sans">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full p-3 flex items-center justify-between transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-primary text-ivory-base font-semibold shadow-sm'
                  : 'text-charcoal-text/80 hover:bg-surface-container'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4 text-antique-gold" />
                <span>Sales Dashboard</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full p-3 flex items-center justify-between transition-colors ${
                activeTab === 'orders'
                  ? 'bg-primary text-ivory-base font-semibold shadow-sm'
                  : 'text-charcoal-text/80 hover:bg-surface-container'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-antique-gold" />
                <span>Orders & Fulfillment</span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-surface-container border border-outline-variant/50 text-charcoal-text">
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full p-3 flex items-center justify-between transition-colors ${
                activeTab === 'products'
                  ? 'bg-primary text-ivory-base font-semibold shadow-sm'
                  : 'text-charcoal-text/80 hover:bg-surface-container'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-antique-gold" />
                <span>Couture Products</span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-surface-container border border-outline-variant/50 text-charcoal-text">
                {products.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('appointments')}
              className={`w-full p-3 flex items-center justify-between transition-colors ${
                activeTab === 'appointments'
                  ? 'bg-primary text-ivory-base font-semibold shadow-sm'
                  : 'text-charcoal-text/80 hover:bg-surface-container'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-antique-gold" />
                <span>VIP Appointments</span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-surface-container border border-outline-variant/50 text-charcoal-text">
                {appointments.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('admins')}
              className={`w-full p-3 flex items-center justify-between transition-colors ${
                activeTab === 'admins'
                  ? 'bg-primary text-ivory-base font-semibold shadow-sm'
                  : 'text-charcoal-text/80 hover:bg-surface-container'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-antique-gold" />
                <span>Admin Team & Access</span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-surface-container border border-outline-variant/50 text-charcoal-text">
                {getAdminCount()}/{MAX_ADMIN_ACCOUNTS}
              </span>
            </button>
          </div>

          {/* Quick System Badge */}
          <div className="p-4 bg-surface-container-low border border-outline-variant/30 text-xs font-sans space-y-2">
            <div className="flex items-center gap-2 text-charcoal-text font-semibold">
              <ShieldCheck className="w-4 h-4 text-antique-gold" />
              <span>Saanvya Store Engine</span>
            </div>
            <p className="text-[11px] text-charcoal-text/60 leading-relaxed">
              Authenticated admin environment. Modifications in this portal update the customer storefront in real time.
            </p>
          </div>
        </aside>

        {/* Dynamic View Panel */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <SalesDashboardView
              orders={orders}
              products={products}
              appointments={appointments}
              onNavigateToOrders={() => setActiveTab('orders')}
              onNavigateToProducts={() => setActiveTab('products')}
              onNavigateToAppointments={() => setActiveTab('appointments')}
              onSelectOrder={ord => {
                setSelectedOrder(ord);
                setIsOrderModalOpen(true);
              }}
            />
          )}

          {activeTab === 'products' && (
            <ProductsManagerView
              products={products}
              onAddProduct={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}
              onEditProduct={prod => {
                setEditingProduct(prod);
                setIsProductModalOpen(true);
              }}
              onDeleteProduct={handleDeleteProduct}
              onDuplicateProduct={handleDuplicateProduct}
              onQuickUpdateStock={handleQuickUpdateStock}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersManagerView
              orders={orders}
              onSelectOrder={ord => {
                setSelectedOrder(ord);
                setIsOrderModalOpen(true);
              }}
            />
          )}

          {activeTab === 'appointments' && (
            <AppointmentsManagerView
              appointments={appointments}
              onUpdateStatus={handleUpdateAppointmentStatus}
            />
          )}

          {activeTab === 'admins' && (
            <AdminTeamManagerView />
          )}
        </main>
      </div>

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <ProductEditorModal
          isOpen={isProductModalOpen}
          onClose={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
          initialProduct={editingProduct}
        />
      )}

      {/* Order Details & Custom Measurements Modal */}
      {isOrderModalOpen && selectedOrder && (
        <OrderDetailModal
          isOpen={isOrderModalOpen}
          onClose={() => {
            setIsOrderModalOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onUpdateStatus={handleUpdateOrderStatus}
          onUpdatePayment={handleUpdateOrderPayment}
        />
      )}
    </div>
  );
};
