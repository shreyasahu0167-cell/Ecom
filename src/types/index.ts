export type Role = 'customer' | 'admin';

export type ProductSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'Custom Measurement';

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  size: ProductSize;
  color: string;
  colorHex?: string;
  additionalPriceInr: number;
  stockQuantity: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  category: 'bridal' | 'lehengas' | 'sarees' | 'anarkalis' | 'ready-to-wear' | 'accessories';
  categoryLabel: string;
  collectionName?: string;
  description: string;
  craftDetails: string[];
  fabricSpecs: string;
  careInstructions: string;
  basePriceInr: number;
  images: string[];
  variants: ProductVariant[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBespokeAvailable?: boolean;
  isSampleItem: boolean; // Explicit flag for demo sample distinction
  createdAt?: string;
}

export interface CartItem {
  variantId: string;
  productId: string;
  title: string;
  categoryLabel: string;
  sku: string;
  size: ProductSize;
  color: string;
  image: string;
  unitPriceInr: number;
  quantity: number;
  stockAvailable: number;
  customMeasurements?: {
    bust?: string;
    waist?: string;
    hip?: string;
    shoulder?: string;
    length?: string;
    notes?: string;
  };
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export type OrderStatus =
  | 'PAYMENT_PENDING'
  | 'AWAITING_VERIFICATION'
  | 'CONFIRMED'
  | 'IN_PRODUCTION'
  | 'QUALITY_CHECK'
  | 'READY_FOR_DISPATCH'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'CAPTURED'
  | 'FAILED'
  | 'REFUNDED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  productTitle: string;
  variantSku: string;
  size: ProductSize;
  color: string;
  unitPriceInr: number;
  quantity: number;
  totalPriceInr: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string | null;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  items: OrderItem[];
  subtotalInr: number;
  taxInr: number;
  shippingInr: number;
  totalInr: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: 'RAZORPAY_SCAFFOLD' | 'CASHFREE_SCAFFOLD' | 'BANK_TRANSFER_VERIFICATION' | 'DEMO_SUBMISSION';
  paymentReferenceId?: string;
  notes?: string;
  isDemoOrder: boolean;
  createdAt: string;
}

export interface AtelierAppointment {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTimeSlot: string;
  occasionType: 'Bridal Consultation' | 'Trousseau Planning' | 'Occasion Wear' | 'Custom Bespoke';
  estimatedGuestCount: number;
  notes?: string;
  status: 'REQUESTED' | 'CONFIRMED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: Role;
  fullName?: string;
  phone?: string;
  savedAddresses?: ShippingAddress[];
}
