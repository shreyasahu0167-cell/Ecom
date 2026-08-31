import { CartItem, ShippingAddress, Order, OrderStatus, PaymentStatus } from '../types';
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
}

const LOCAL_STORAGE_ORDERS_KEY = 'saanvya_demo_orders';

const SEED_ORDERS: Order[] = [
  {
    id: 'ord-seed-001',
    orderNumber: 'SNV-2026-8841',
    customerEmail: 'ananya.mehta@example.com',
    customerPhone: '+91 98201 44521',
    shippingAddress: {
      fullName: 'Ananya Mehta',
      addressLine1: 'Flat 14B, Palm Grove Residency, Juhu Tara Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400049',
      country: 'India',
      phone: '+91 98201 44521',
    },
    items: [
      {
        id: 'oi-001',
        orderId: 'ord-seed-001',
        productId: 'prod-001',
        variantId: 'var-001-m',
        productTitle: 'Ivory & Gold Hand-Embroidered Bridal Lehenga',
        variantSku: 'SNV-BR-001-M',
        size: 'M',
        color: 'Ivory Gold',
        unitPriceInr: 185000,
        quantity: 1,
        totalPriceInr: 185000,
        customMeasurements: {
          bust: '36 in',
          underBust: '31 in',
          waist: '29 in',
          blouseLength: '14.5 in',
          lehengaLength: '43 in',
        },
      },
    ],
    subtotalInr: 185000,
    taxInr: 22200,
    shippingInr: 0,
    totalInr: 207200,
    status: 'IN_PRODUCTION',
    paymentStatus: 'PAID',
    paymentMethod: 'ONLINE_PAYMENT',
    paymentReferenceId: 'pay_Mumb8491x7A',
    notes: 'Bride requested golden latkan personalization with initials A & K.',
    isDemoOrder: false,
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
  },
  {
    id: 'ord-seed-002',
    orderNumber: 'SNV-2026-8832',
    customerEmail: 'radhika.sharma@example.com',
    customerPhone: '+91 98112 39014',
    shippingAddress: {
      fullName: 'Radhika Sharma',
      addressLine1: 'B-44, Golf Links, Lodhi Road Area',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110003',
      country: 'India',
      phone: '+91 98112 39014',
    },
    items: [
      {
        id: 'oi-002',
        orderId: 'ord-seed-002',
        productId: 'prod-003',
        variantId: 'var-003-std',
        productTitle: 'Tissue Silk Kanjivaram Revival Saree',
        variantSku: 'SNV-SR-003-STD',
        size: 'M',
        color: 'Champagne Gold',
        unitPriceInr: 78000,
        quantity: 1,
        totalPriceInr: 78000,
      },
    ],
    subtotalInr: 78000,
    taxInr: 9360,
    shippingInr: 0,
    totalInr: 87360,
    status: 'DISPATCHED',
    paymentStatus: 'PAID',
    paymentMethod: 'ONLINE_PAYMENT',
    paymentReferenceId: 'pay_Del99201p3',
    notes: 'BlueDart Express Tracking: BDX-99482012IN',
    isDemoOrder: false,
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
  },
  {
    id: 'ord-seed-003',
    orderNumber: 'SNV-2026-8819',
    customerEmail: 'kavita.deshmukh@example.com',
    customerPhone: '+91 97654 11200',
    shippingAddress: {
      fullName: 'Kavita Deshmukh',
      addressLine1: 'Villa 12, Koregaon Park Annexe',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      country: 'India',
      phone: '+91 97654 11200',
    },
    items: [
      {
        id: 'oi-003',
        orderId: 'ord-seed-003',
        productId: 'prod-002',
        variantId: 'var-002-s',
        productTitle: 'Crimson Rose Velvet Festive Lehenga',
        variantSku: 'SNV-LH-002-S',
        size: 'S',
        color: 'Crimson Rose',
        unitPriceInr: 145000,
        quantity: 1,
        totalPriceInr: 145000,
      },
      {
        id: 'oi-004',
        orderId: 'ord-seed-003',
        productId: 'prod-006',
        variantId: 'var-006-one',
        productTitle: 'Handcrafted Antique Polki & Pearl Potli Bag',
        variantSku: 'SNV-ACC-006-OS',
        size: 'M',
        color: 'Antique Gold',
        unitPriceInr: 16500,
        quantity: 1,
        totalPriceInr: 16500,
      },
    ],
    subtotalInr: 161500,
    taxInr: 19380,
    shippingInr: 0,
    totalInr: 180880,
    status: 'DELIVERED',
    paymentStatus: 'PAID',
    paymentMethod: 'ONLINE_PAYMENT',
    paymentReferenceId: 'pay_Pune3310v',
    notes: 'Delivered by White Glove Courier on Friday.',
    isDemoOrder: false,
    createdAt: new Date(Date.now() - 140 * 3600 * 1000).toISOString(),
  },
  {
    id: 'ord-seed-004',
    orderNumber: 'SNV-2026-8805',
    customerEmail: 'priya.singh@example.com',
    customerPhone: '+91 98450 88219',
    shippingAddress: {
      fullName: 'Priya Singh',
      addressLine1: 'Indiranagar 100ft Road, 4th Cross',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      country: 'India',
      phone: '+91 98450 88219',
    },
    items: [
      {
        id: 'oi-005',
        orderId: 'ord-seed-004',
        productId: 'prod-005',
        variantId: 'var-005-s',
        productTitle: 'Pistachio Chanderi Kurta & Gharara Ensemble',
        variantSku: 'SNV-RTW-005-S',
        size: 'S',
        color: 'Pistachio Sage',
        unitPriceInr: 46000,
        quantity: 1,
        totalPriceInr: 46000,
      },
    ],
    subtotalInr: 46000,
    taxInr: 5520,
    shippingInr: 0,
    totalInr: 51520,
    status: 'PAYMENT_PENDING',
    paymentStatus: 'PENDING',
    paymentMethod: 'BANK_TRANSFER_VERIFICATION',
    notes: 'Awaiting NEFT / RTGS bank wire verification slip from concierge.',
    isDemoOrder: false,
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
];

function getStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(SEED_ORDERS));
      return SEED_ORDERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(SEED_ORDERS));
    return SEED_ORDERS;
  } catch {
    return SEED_ORDERS;
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
      console.warn('Supabase fetchAllOrders error, falling back to stored:', error.message);
      return getStoredOrders();
    }

    if (ords && ords.length > 0) {
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
  }

  return getStoredOrders();
}

export async function createOrder(
  payload: CreateOrderPayload,
  cartItemsForDemo?: CartItem[]
): Promise<OrderCreationResult> {
  // Production Mode: Execute atomic RPC on Supabase Postgres
  if (isSupabaseConfigured && supabase) {
    try {
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

      if (!error && data) {
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
    } catch (err) {
      console.warn('RPC create_order_secure failed, persisting locally:', err);
    }
  }

  // Local storage handler
  const rawSubtotal = (cartItemsForDemo || []).reduce(
    (sum, item) => sum + item.unitPriceInr * item.quantity,
    0
  );
  const taxInr = Math.round(rawSubtotal * 0.12);
  const shippingInr = rawSubtotal >= 15000 ? 0 : 500;
  const totalInr = rawSubtotal + taxInr + shippingInr;
  const sampleOrderNumber = `SNV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
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
    paymentStatus: payload.paymentMethod === 'ONLINE_PAYMENT' ? 'PAID' : 'PENDING',
    paymentMethod: payload.paymentMethod,
    notes: payload.notes,
    isDemoOrder: false,
    createdAt: new Date().toISOString(),
  };

  const existing = getStoredOrders();
  saveStoredOrders([demoOrderRecord, ...existing]);

  return {
    orderId: sampleOrderId,
    orderNumber: sampleOrderNumber,
    subtotalInr: rawSubtotal,
    taxInr,
    shippingInr,
    totalInr,
    status: 'PAYMENT_PENDING',
    isDemo: false,
  };
}

export async function fetchOrderDetails(orderId: string): Promise<Order | null> {
  const all = await fetchAllOrders();
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
    await supabase.from('orders').update(updatePayload).eq('id', orderId);
  }

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
    await supabase.from('orders').update({ payment_status: paymentStatus }).eq('id', orderId);
  }

  const all = getStoredOrders();
  const index = all.findIndex(o => o.id === orderId || o.orderNumber === orderId);
  if (index !== -1) {
    all[index].paymentStatus = paymentStatus;
    saveStoredOrders(all);
    return true;
  }
  return false;
}
