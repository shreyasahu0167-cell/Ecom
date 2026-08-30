import { CartItem, ShippingAddress, Order } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
  paymentMethod: 'RAZORPAY_SCAFFOLD' | 'CASHFREE_SCAFFOLD' | 'BANK_TRANSFER_VERIFICATION' | 'DEMO_SUBMISSION';
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
}

/**
 * Creates an order either via secure Postgres RPC in Supabase (Production)
 * or via local sample checkout handler (Demo Mode).
 */
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
      throw new Error(`Order creation failed on database: ${error.message}`);
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
    };
  }

  // Demo Mode: Process sample order locally
  const rawSubtotal = (cartItemsForDemo || []).reduce(
    (sum, item) => sum + item.unitPriceInr * item.quantity,
    0
  );
  const taxInr = Math.round(rawSubtotal * 0.12);
  const shippingInr = rawSubtotal >= 15000 ? 0 : 500;
  const totalInr = rawSubtotal + taxInr + shippingInr;
  const sampleOrderNumber = `SNV-SAMPLE-${Math.floor(100000 + Math.random() * 900000)}`;
  const sampleOrderId = `demo-order-${Date.now()}`;

  const demoOrderRecord: Order = {
    id: sampleOrderId,
    orderNumber: sampleOrderNumber,
    customerEmail: payload.customerEmail,
    customerPhone: payload.customerPhone,
    shippingAddress: payload.shippingAddress,
    billingAddress: payload.billingAddress,
    items: (cartItemsForDemo || []).map((ci, idx) => ({
      id: `demo-item-${idx}`,
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
    })),
    subtotalInr: rawSubtotal,
    taxInr,
    shippingInr,
    totalInr,
    status: 'PAYMENT_PENDING',
    paymentStatus: 'PENDING',
    paymentMethod: 'DEMO_SUBMISSION',
    isDemoOrder: true,
    createdAt: new Date().toISOString(),
  };

  try {
    const existing = JSON.parse(localStorage.getItem('saanvya_demo_orders') || '[]');
    existing.unshift(demoOrderRecord);
    localStorage.setItem('saanvya_demo_orders', JSON.stringify(existing));
  } catch (e) {
    console.warn('Could not persist sample order to localStorage', e);
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
  };
}

export async function fetchOrderDetails(orderId: string): Promise<Order | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        user_id,
        customer_email,
        customer_phone,
        shipping_address,
        billing_address,
        subtotal_inr,
        tax_inr,
        shipping_inr,
        total_inr,
        status,
        payment_status,
        payment_method,
        payment_reference_id,
        notes,
        created_at,
        order_items (
          id,
          order_id,
          product_id,
          variant_id,
          product_title,
          variant_sku,
          size,
          color,
          unit_price_inr,
          quantity,
          total_price_inr
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to load order from database: ${error.message}`);
    }

    return {
      id: data.id,
      orderNumber: data.order_number,
      userId: data.user_id,
      customerEmail: data.customer_email,
      customerPhone: data.customer_phone,
      shippingAddress: data.shipping_address,
      billingAddress: data.billing_address,
      items: data.order_items.map((oi: any) => ({
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
      subtotalInr: Number(data.subtotal_inr),
      taxInr: Number(data.tax_inr),
      shippingInr: Number(data.shipping_inr),
      totalInr: Number(data.total_inr),
      status: data.status,
      paymentStatus: data.payment_status,
      paymentMethod: data.payment_method,
      paymentReferenceId: data.payment_reference_id,
      notes: data.notes,
      isDemoOrder: false,
      createdAt: data.created_at,
    };
  }

  // Demo Mode: Look up in localStorage
  try {
    const orders: Order[] = JSON.parse(localStorage.getItem('saanvya_demo_orders') || '[]');
    return orders.find(o => o.id === orderId || o.orderNumber === orderId) || null;
  } catch (e) {
    return null;
  }
}
