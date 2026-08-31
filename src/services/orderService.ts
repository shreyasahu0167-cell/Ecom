import { CartItem, ShippingAddress, Order, OrderStatus, PaymentStatus } from '../types';
import { supabase, isSupabaseConfigured, isDemoMode } from '../lib/supabase';
import { getStoreSettings } from './storeSettingsService';

export interface CreateOrderPayload {
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  items: {
    variantId: string;
    quantity: number;
    customMeasurements?: Record<string, any>;
  }[];
  paymentMethod: 'ONLINE_PAYMENT' | 'RAZORPAY_SCAFFOLD' | 'CASHFREE_SCAFFOLD' | 'BANK_TRANSFER_VERIFICATION' | 'DEMO_SUBMISSION';
  notes?: string;
}

export interface OrderCreationResult {
  orderId: string;
  orderNumber: string;
  subtotalInr: number;
  taxInr: number;
  shippingInr: number;
  totalInr: number;
  status: string;
  isDemo: boolean;
  order: Order;
}

const LOCAL_STORAGE_ORDERS_KEY = 'saanvya_demo_orders';

function getStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (o: any) =>
          o &&
          typeof o === 'object' &&
          o.id &&
          !String(o.id).startsWith('ord-seed-')
      );
    }
    return [];
  } catch {
    return [];
  }
}

function saveStoredOrders(orders: Order[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to persist orders', e);
  }
}

export async function fetchAllOrders(): Promise<Order[]> {
  if (isSupabaseConfigured && supabase) {
    const { data: ords, error } = await supabase
      .from('orders')
      .select(`
        id, order_number, user_id, customer_email, customer_phone, shipping_address,
        billing_address, subtotal_inr, tax_inr, shipping_inr, total_inr, status,
        payment_status, payment_method, payment_reference_id, notes, created_at,
        order_items (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch orders from database: ${error.message}`);
    }

    if (!ords || ords.length === 0) {
      return [];
    }

    return ords.map((o: any) => ({
      id: o.id,
      orderNumber: o.order_number,
      userId: o.user_id,
      customerEmail: o.customer_email,
      customerPhone: o.customer_phone,
      shippingAddress: o.shipping_address,
      billingAddress: o.billing_address,
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
        customMeasurements: oi.custom_measurements,
      })),
      subtotalInr: Number(o.subtotal_inr),
      taxInr: Number(o.tax_inr),
      shippingInr: Number(o.shipping_inr),
      totalInr: Number(o.total_inr),
      status: o.status,
      paymentStatus: o.payment_status,
      paymentMethod: o.payment_method,
      paymentReferenceId: o.payment_reference_id,
      notes: o.notes,
      isDemoOrder: false,
      createdAt: o.created_at,
    }));
  }

  if (isDemoMode) {
    return getStoredOrders();
  }

  throw new Error('Supabase database is unconfigured and VITE_DEMO_MODE is false.');
}

export async function createOrder(
  payload: CreateOrderPayload,
  cartItemsForDemo?: CartItem[]
): Promise<OrderCreationResult> {
  // Production Mode: Execute atomic RPC on Supabase Postgres
  if (isSupabaseConfigured && supabase) {
    const rpcPayload = {
      p_customer_email: payload.customerEmail,
      p_customer_phone: payload.customerPhone,
      p_shipping_address: payload.shippingAddress,
      p_billing_address: payload.billingAddress || payload.shippingAddress,
      p_items: payload.items.map(item => ({
        variant_id: item.variantId,
        quantity: item.quantity,
        custom_measurements: item.customMeasurements || null,
      })),
      p_payment_method: payload.paymentMethod,
      p_notes: payload.notes || null,
    };

    const { data, error } = await supabase.rpc('create_order_secure', rpcPayload);

    if (error) {
      throw new Error(`Order creation failed in database: ${error.message}`);
    }

    if (!data) {
      throw new Error('No order confirmation data returned from database.');
    }

    const createdOrder: Order = {
      id: data.order_id,
      orderNumber: data.order_number,
      userId: data.user_id || null,
      customerEmail: data.customer_email || payload.customerEmail,
      customerPhone: data.customer_phone || payload.customerPhone,
      shippingAddress: data.shipping_address || payload.shippingAddress,
      billingAddress: data.billing_address || payload.billingAddress || payload.shippingAddress,
      items: Array.isArray(data.items) && data.items.length > 0
        ? data.items.map((oi: any) => ({
            id: oi.id || `oi-${data.order_id}`,
            orderId: data.order_id,
            productId: oi.product_id,
            variantId: oi.variant_id,
            productTitle: oi.product_title,
            variantSku: oi.variant_sku,
            size: oi.size,
            color: oi.color,
            unitPriceInr: Number(oi.unit_price_inr),
            quantity: Number(oi.quantity),
            totalPriceInr: Number(oi.total_price_inr),
            customMeasurements: oi.custom_measurements,
          }))
        : (cartItemsForDemo || []).map((ci, idx) => ({
            id: `oi-${data.order_id}-${idx}`,
            orderId: data.order_id,
            productId: ci.productId,
            variantId: ci.variantId,
            productTitle: ci.title,
            variantSku: ci.sku,
            size: ci.size,
            color: ci.color,
            unitPriceInr: ci.unitPriceInr,
            quantity: ci.quantity,
            totalPriceInr: ci.unitPriceInr * ci.quantity,
            customMeasurements: ci.customMeasurements,
          })),
      subtotalInr: Number(data.subtotal_inr),
      taxInr: Number(data.tax_inr),
      shippingInr: Number(data.shipping_inr),
      totalInr: Number(data.total_inr),
      status: data.status || 'PAYMENT_PENDING',
      paymentStatus: data.payment_status || 'PENDING',
      paymentMethod: payload.paymentMethod,
      notes: payload.notes,
      isDemoOrder: false,
      createdAt: data.created_at || new Date().toISOString(),
    };

    // Safely store in current tab session context so confirmation refresh works without unauthenticated database queries
    try {
      sessionStorage.setItem('saanvya_last_placed_order', JSON.stringify(createdOrder));
    } catch {
      // Ignore session storage exceptions
    }

    return {
      orderId: data.order_id,
      orderNumber: data.order_number,
      subtotalInr: Number(data.subtotal_inr),
      taxInr: Number(data.tax_inr),
      shippingInr: Number(data.shipping_inr),
      totalInr: Number(data.total_inr),
      status: data.status,
      isDemo: false,
      order: createdOrder,
    };
  }

  if (!isDemoMode) {
    throw new Error('Database is unconfigured and VITE_DEMO_MODE is disabled.');
  }

  // Local storage handler (only when VITE_DEMO_MODE is enabled)
  const settings = await getStoreSettings();
  const rawSubtotal = (cartItemsForDemo || []).reduce(
    (sum, item) => sum + item.unitPriceInr * item.quantity,
    0
  );
  const taxInr = Math.round(rawSubtotal * settings.gstRate);
  const shippingInr =
    rawSubtotal >= settings.freeShippingThresholdInr ? 0 : settings.standardShippingFeeInr;
  const totalInr = rawSubtotal + taxInr + shippingInr;
  const currentYear = new Date().getFullYear();
  const sampleOrderNumber = `SNV-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`;
  const sampleOrderId = `ord-${Date.now()}`;

  const demoOrderRecord: Order = {
    id: sampleOrderId,
    orderNumber: sampleOrderNumber,
    customerEmail: payload.customerEmail,
    customerPhone: payload.customerPhone,
    shippingAddress: payload.shippingAddress,
    billingAddress: payload.billingAddress,
    items: (cartItemsForDemo || []).map((ci, idx) => ({
      id: `oi-${sampleOrderId}-${idx}`,
      orderId: sampleOrderId,
      productId: ci.productId,
      variantId: ci.variantId,
      productTitle: ci.title,
      variantSku: ci.sku,
      size: ci.size,
      color: ci.color,
      unitPriceInr: ci.unitPriceInr,
      quantity: ci.quantity,
      totalPriceInr: ci.unitPriceInr * ci.quantity,
      customMeasurements: ci.customMeasurements,
    })),
    subtotalInr: rawSubtotal,
    taxInr,
    shippingInr,
    totalInr,
    status: 'PAYMENT_PENDING',
    paymentStatus: 'PENDING',
    paymentMethod: payload.paymentMethod,
    notes: payload.notes,
    isDemoOrder: true,
    createdAt: new Date().toISOString(),
  };

  const existing = getStoredOrders();
  saveStoredOrders([demoOrderRecord, ...existing]);

  try {
    sessionStorage.setItem('saanvya_last_placed_order', JSON.stringify(demoOrderRecord));
  } catch {
    // Ignore storage errors
  }

  return {
    orderId: sampleOrderId,
    orderNumber: sampleOrderNumber,
    subtotalInr: rawSubtotal,
    taxInr,
    shippingInr,
    totalInr,
    status: 'PAYMENT_PENDING',
    isDemo: true,
    order: demoOrderRecord,
  };
}

export async function fetchOrderDetails(orderId: string): Promise<Order | null> {
  if (!orderId || !orderId.trim()) {
    return null;
  }

  // 1. Check if the current browser session just placed this order (for safe guest confirmation without public DB reads)
  try {
    const rawSession = sessionStorage.getItem('saanvya_last_placed_order');
    if (rawSession) {
      const parsedSession = JSON.parse(rawSession) as Order;
      if (
        parsedSession &&
        (parsedSession.id === orderId || parsedSession.orderNumber === orderId)
      ) {
        return parsedSession;
      }
    }
  } catch {
    // Ignore JSON parsing errors
  }

  // 2. Production Database Lookup (Strictly restricted to Authenticated Customers & Admins)
  if (isSupabaseConfigured && supabase) {
    // Check if an authenticated user session is active
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Guest users have zero SELECT access on orders table; unauthenticated lookup is prohibited
    if (!session) {
      return null;
    }

    // Sanitize orderId: allow only alphanumeric characters, hyphens, and underscores
    const sanitizedId = orderId.trim().replace(/[^a-zA-Z0-9_-]/g, '');
    if (!sanitizedId) {
      return null;
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sanitizedId);

    let query = supabase
      .from('orders')
      .select(`
        id, order_number, user_id, customer_email, customer_phone, shipping_address,
        billing_address, subtotal_inr, tax_inr, shipping_inr, total_inr, status,
        payment_status, payment_method, payment_reference_id, notes, created_at,
        order_items (*)
      `);

    if (isUuid) {
      query = query.or(`id.eq.${sanitizedId},order_number.eq.${sanitizedId}`);
    } else {
      query = query.eq('order_number', sanitizedId);
    }

    const { data: o, error } = await query.maybeSingle();

    if (error || !o) {
      return null;
    }

    return {
      id: o.id,
      orderNumber: o.order_number,
      userId: o.user_id,
      customerEmail: o.customer_email,
      customerPhone: o.customer_phone,
      shippingAddress: o.shipping_address,
      billingAddress: o.billing_address,
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
        customMeasurements: oi.custom_measurements,
      })),
      subtotalInr: Number(o.subtotal_inr),
      taxInr: Number(o.tax_inr),
      shippingInr: Number(o.shipping_inr),
      totalInr: Number(o.total_inr),
      status: o.status,
      paymentStatus: o.payment_status,
      paymentMethod: o.payment_method,
      paymentReferenceId: o.payment_reference_id,
      notes: o.notes,
      isDemoOrder: false,
      createdAt: o.created_at,
    };
  }

  if (!isDemoMode) {
    throw new Error('Database is unconfigured and VITE_DEMO_MODE is disabled.');
  }

  const all = getStoredOrders();
  return all.find(o => o.id === orderId || o.orderNumber === orderId) || null;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  notes?: string
): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const updatePayload: any = { status };
    if (notes !== undefined) updatePayload.notes = notes;
    const { error } = await supabase.from('orders').update(updatePayload).eq('id', orderId);
    if (error) {
      throw new Error(`Failed to update order status in database: ${error.message}`);
    }
    return true;
  }

  if (!isDemoMode) {
    throw new Error('Database is unconfigured and VITE_DEMO_MODE is disabled.');
  }

  // Local demo mode only
  const all = getStoredOrders();
  const index = all.findIndex(o => o.id === orderId || o.orderNumber === orderId);
  if (index !== -1) {
    all[index].status = status;
    if (notes !== undefined) all[index].notes = notes;
    saveStoredOrders(all);
    return true;
  }
  return false;
}

export async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus
): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('orders').update({ payment_status: paymentStatus }).eq('id', orderId);
    if (error) {
      throw new Error(`Failed to update payment status in database: ${error.message}`);
    }
    return true;
  }

  if (!isDemoMode) {
    throw new Error('Database is unconfigured and VITE_DEMO_MODE is disabled.');
  }

  // Local demo mode only
  const all = getStoredOrders();
  const index = all.findIndex(o => o.id === orderId || o.orderNumber === orderId);
  if (index !== -1) {
    all[index].paymentStatus = paymentStatus;
    saveStoredOrders(all);
    return true;
  }
  return false;
}
