-- ====================================================================
-- SAANVYA MODERN INDIAN COUTURE - PRODUCTION DATABASE SCHEMA & RLS
-- ====================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create User Profiles & Role Management
CREATE TYPE user_role AS ENUM ('customer', 'admin');

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  full_name TEXT,
  phone TEXT,
  saved_addresses JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Products Table (Prices in INR)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  collection_name TEXT,
  description TEXT NOT NULL,
  craft_details TEXT[] DEFAULT ARRAY[]::TEXT[],
  fabric_specs TEXT,
  care_instructions TEXT,
  base_price_inr NUMERIC(12, 2) NOT NULL CHECK (base_price_inr >= 0),
  images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_new_arrival BOOLEAN NOT NULL DEFAULT FALSE,
  is_bespoke_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Product Variants (Size, Color, SKU, Stock, Pricing)
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL UNIQUE,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  color_hex TEXT,
  additional_price_inr NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (additional_price_inr >= 0),
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Orders Table
CREATE TYPE order_status AS ENUM (
  'PAYMENT_PENDING',
  'AWAITING_VERIFICATION',
  'CONFIRMED',
  'IN_PRODUCTION',
  'QUALITY_CHECK',
  'READY_FOR_DISPATCH',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED'
);

CREATE TYPE payment_status AS ENUM (
  'PENDING',
  'PROCESSING',
  'CAPTURED',
  'FAILED',
  'REFUNDED'
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  subtotal_inr NUMERIC(12, 2) NOT NULL CHECK (subtotal_inr >= 0),
  tax_inr NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (tax_inr >= 0),
  shipping_inr NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (shipping_inr >= 0),
  total_inr NUMERIC(12, 2) NOT NULL CHECK (total_inr >= 0),
  status order_status NOT NULL DEFAULT 'PAYMENT_PENDING',
  payment_status payment_status NOT NULL DEFAULT 'PENDING',
  payment_method TEXT NOT NULL,
  payment_reference_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  variant_id UUID NOT NULL REFERENCES public.product_variants(id),
  product_title TEXT NOT NULL,
  variant_sku TEXT NOT NULL,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  unit_price_inr NUMERIC(12, 2) NOT NULL CHECK (unit_price_inr >= 0),
  quantity INT NOT NULL CHECK (quantity > 0),
  total_price_inr NUMERIC(12, 2) NOT NULL CHECK (total_price_inr >= 0),
  custom_measurements JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Atelier Consultation Appointments Table
CREATE TABLE IF NOT EXISTS public.atelier_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time_slot TEXT NOT NULL,
  occasion_type TEXT NOT NULL,
  guest_count INT NOT NULL DEFAULT 1,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'REQUESTED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atelier_appointments ENABLE ROW LEVEL SECURITY;

-- Helper to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles RLS
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Categories RLS
CREATE POLICY "Public can read categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (public.is_admin());

-- Products RLS
CREATE POLICY "Public can read active products"
  ON public.products FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  USING (public.is_admin());

-- Product Variants RLS
CREATE POLICY "Public can read active product variants"
  ON public.product_variants FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage product variants"
  ON public.product_variants FOR ALL
  USING (public.is_admin());

-- Orders RLS
CREATE POLICY "Customers can read own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins can manage orders"
  ON public.orders FOR ALL
  USING (public.is_admin());

-- Order Items RLS
CREATE POLICY "Customers can read own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Admins can manage order items"
  ON public.order_items FOR ALL
  USING (public.is_admin());

-- Atelier Appointments RLS
CREATE POLICY "Public can create appointments"
  ON public.atelier_appointments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view and manage appointments"
  ON public.atelier_appointments FOR ALL
  USING (public.is_admin());

-- ====================================================================
-- SECURE SERVER-SIDE ORDER CREATION RPC (create_order_secure)
-- Recalculates prices from DB, validates stock, locks inventory atomically
-- ====================================================================

CREATE OR REPLACE FUNCTION public.create_order_secure(
  p_customer_email TEXT,
  p_customer_phone TEXT,
  p_shipping_address JSONB,
  p_billing_address JSONB,
  p_items JSONB, -- Array of objects: { variant_id: UUID, quantity: INT, custom_measurements: JSONB }
  p_payment_method TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_order_id UUID := gen_random_uuid();
  v_order_number TEXT;
  v_user_id UUID := auth.uid();
  v_subtotal NUMERIC(12, 2) := 0;
  v_tax NUMERIC(12, 2) := 0;
  v_shipping NUMERIC(12, 2) := 0;
  v_total NUMERIC(12, 2) := 0;
  v_item RECORD;
  v_variant RECORD;
  v_product RECORD;
  v_item_price NUMERIC(12, 2);
  v_item_total NUMERIC(12, 2);
  v_created_order JSONB;
BEGIN
  -- Generate unique luxury order number: SNV-YEAR-HEX
  v_order_number := 'SNV-' || TO_CHAR(NOW(), 'YYYY') || '-' || UPPER(SUBSTRING(MD5(v_order_id::TEXT) FROM 1 FOR 6));

  -- Validate that items array is not empty
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item.';
  END IF;

  -- Process and validate each item atomically
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
    variant_id UUID,
    quantity INT,
    custom_measurements JSONB
  )
  LOOP
    IF v_item.quantity <= 0 THEN
      RAISE EXCEPTION 'Quantity must be greater than zero for variant %', v_item.variant_id;
    END IF;

    -- Lock and retrieve variant record
    SELECT * INTO v_variant
    FROM public.product_variants
    WHERE id = v_item.variant_id AND is_active = true
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Variant ID % does not exist or is inactive.', v_item.variant_id;
    END IF;

    -- Check stock availability
    IF v_variant.stock_quantity < v_item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for SKU %. Available: %, Requested: %',
        v_variant.sku, v_variant.stock_quantity, v_item.quantity;
    END IF;

    -- Retrieve parent product
    SELECT * INTO v_product
    FROM public.products
    WHERE id = v_variant.product_id AND is_active = true;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product for variant % is not active or available.', v_item.variant_id;
    END IF;

    -- Calculate verified unit price (base + variant adjustment)
    v_item_price := v_product.base_price_inr + v_variant.additional_price_inr;
    v_item_total := v_item_price * v_item.quantity;
    v_subtotal := v_subtotal + v_item_total;

    -- Decrement variant inventory atomically
    UPDATE public.product_variants
    SET stock_quantity = stock_quantity - v_item.quantity,
        updated_at = NOW()
    WHERE id = v_variant.id;

    -- Insert into order items
    INSERT INTO public.order_items (
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
      total_price_inr,
      custom_measurements
    ) VALUES (
      gen_random_uuid(),
      v_order_id,
      v_product.id,
      v_variant.id,
      v_product.title,
      v_variant.sku,
      v_variant.size,
      v_variant.color,
      v_item_price,
      v_item.quantity,
      v_item_total,
      v_item.custom_measurements
    );
  END LOOP;

  -- Calculate Tax (12% GST standard on luxury garments in India)
  v_tax := ROUND(v_subtotal * 0.12, 2);

  -- Calculate Shipping (Complimentary above ₹15,000, else ₹500 standard)
  IF v_subtotal >= 15000 THEN
    v_shipping := 0;
  ELSE
    v_shipping := 500;
  END IF;

  v_total := v_subtotal + v_tax + v_shipping;

  -- Create Order
  INSERT INTO public.orders (
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
    notes
  ) VALUES (
    v_order_id,
    v_order_number,
    v_user_id,
    p_customer_email,
    p_customer_phone,
    p_shipping_address,
    COALESCE(p_billing_address, p_shipping_address),
    v_subtotal,
    v_tax,
    v_shipping,
    v_total,
    'PAYMENT_PENDING',
    'PENDING',
    p_payment_method,
    p_notes
  );

  -- Return created order summary
  SELECT jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'subtotal_inr', v_subtotal,
    'tax_inr', v_tax,
    'shipping_inr', v_shipping,
    'total_inr', v_total,
    'status', 'PAYMENT_PENDING',
    'payment_status', 'PENDING'
  ) INTO v_created_order;

  RETURN v_created_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
