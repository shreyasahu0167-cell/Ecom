-- ====================================================================
-- SAANVYA MODERN INDIAN COUTURE - PRODUCTION DATABASE SCHEMA & RLS
-- ====================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
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
  status TEXT NOT NULL DEFAULT 'PAYMENT_PENDING' CHECK (status IN (
    'PAYMENT_PENDING',
    'AWAITING_VERIFICATION',
    'CONFIRMED',
    'IN_PRODUCTION',
    'QUALITY_CHECK',
    'READY_FOR_DISPATCH',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED'
  )),
  payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN (
    'PENDING',
    'PROCESSING',
    'CAPTURED',
    'FAILED',
    'REFUNDED'
  )),
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_full_name_length CHECK (char_length(trim(full_name)) >= 2 AND char_length(full_name) <= 120),
  CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND char_length(email) <= 255),
  CONSTRAINT check_phone_format CHECK (char_length(trim(phone)) >= 7 AND char_length(phone) <= 30),
  CONSTRAINT check_guest_count_range CHECK (guest_count >= 1 AND guest_count <= 20),
  CONSTRAINT check_status_valid CHECK (status IN ('REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
  CONSTRAINT check_date_not_past CHECK (preferred_date >= CURRENT_DATE)
);

-- 9. Store Settings Table (Configurable Tax, Shipping Thresholds, and Fees)
CREATE TABLE IF NOT EXISTS public.store_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Helper to check if current user is admin or service_role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Service role always has administrative privileges
  IF (current_setting('request.jwt.claim.role', true) = 'service_role') THEN
    RETURN TRUE;
  END IF;

  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- ====================================================================
-- PROFILE ROLE SECURITY TRIGGER & AUTH HOOK
-- ====================================================================

-- 1. Automatically provision customer profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Enforce strict role immutability and restricted field updates for non-admins
CREATE OR REPLACE FUNCTION public.enforce_profile_role_security()
RETURNS TRIGGER AS $$
BEGIN
  -- Always refresh timestamp
  NEW.updated_at := NOW();

  -- INSERT: Non-admins are strictly forced to role = 'customer'
  IF TG_OP = 'INSERT' THEN
    IF NOT public.is_admin() THEN
      NEW.role := 'customer';
    END IF;
    RETURN NEW;
  END IF;

  -- UPDATE: Non-admins cannot alter their role, id, or email
  IF TG_OP = 'UPDATE' THEN
    IF NOT public.is_admin() THEN
      -- Strict check: customers must never be able to change their own role
      IF NEW.role IS DISTINCT FROM OLD.role THEN
        RAISE EXCEPTION 'Unauthorized: Customers cannot modify their account role.';
      END IF;

      -- Customers may not alter their ID or Email directly on profile updates
      IF NEW.id IS DISTINCT FROM OLD.id THEN
        RAISE EXCEPTION 'Unauthorized: Profile ID is immutable.';
      END IF;

      IF NEW.email IS DISTINCT FROM OLD.email THEN
        RAISE EXCEPTION 'Unauthorized: Email cannot be modified via profile update.';
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS tr_enforce_profile_role_security ON public.profiles;
CREATE TRIGGER tr_enforce_profile_role_security
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_profile_role_security();

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES AUDIT & ENFORCEMENT
-- ====================================================================

-- 1. Profiles Table Policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING ((auth.uid() IS NOT NULL AND auth.uid() = id) OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = id AND role = 'customer')
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING ((auth.uid() IS NOT NULL AND auth.uid() = id) OR public.is_admin())
  WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = id AND role = 'customer')
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.is_admin());

-- 2. Categories Table Policies
DROP POLICY IF EXISTS "Public can read categories" ON public.categories;
CREATE POLICY "Public can read categories"
  ON public.categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. Products Table Policies (Public reads active only, Admins manage all)
DROP POLICY IF EXISTS "Public can read active products" ON public.products;
CREATE POLICY "Public can read active products"
  ON public.products FOR SELECT
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4. Product Variants Table Policies (Public reads active only, Admins manage all)
DROP POLICY IF EXISTS "Public can read active product variants" ON public.product_variants;
CREATE POLICY "Public can read active product variants"
  ON public.product_variants FOR SELECT
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage product variants" ON public.product_variants;
CREATE POLICY "Admins can manage product variants"
  ON public.product_variants FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. Orders Table Policies
-- Customers can only read their own orders; public/anon cannot read any orders.
-- Direct insert/update/delete blocked for public & customers; order creation goes through create_order_secure().
DROP POLICY IF EXISTS "Customers can read own orders" ON public.orders;
CREATE POLICY "Customers can read own orders"
  ON public.orders FOR SELECT
  USING ((auth.uid() IS NOT NULL AND auth.uid() = user_id) OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;

CREATE POLICY "Admins can insert orders"
  ON public.orders FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete orders"
  ON public.orders FOR DELETE
  USING (public.is_admin());

-- 6. Order Items Table Policies
-- Customers can only read items from their own orders; direct inserts/updates/deletes are strictly admin-only.
DROP POLICY IF EXISTS "Customers can read own order items" ON public.order_items;
CREATE POLICY "Customers can read own order items"
  ON public.order_items FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    ))
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can manage order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can update order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can delete order items" ON public.order_items;

CREATE POLICY "Admins can insert order items"
  ON public.order_items FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update order items"
  ON public.order_items FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete order items"
  ON public.order_items FOR DELETE
  USING (public.is_admin());

-- 7. Atelier Appointments Table Policies
-- Public and customers CANNOT SELECT appointments (prevents leakage of PII).
-- Requests are submitted with status = 'REQUESTED' (or via request_atelier_appointment RPC).
DROP POLICY IF EXISTS "Public can create appointments" ON public.atelier_appointments;
DROP POLICY IF EXISTS "Public can submit appointment requests" ON public.atelier_appointments;
DROP POLICY IF EXISTS "Admins can view and manage appointments" ON public.atelier_appointments;
DROP POLICY IF EXISTS "Admins can view appointments" ON public.atelier_appointments;
DROP POLICY IF EXISTS "Admins can update appointments" ON public.atelier_appointments;
DROP POLICY IF EXISTS "Admins can delete appointments" ON public.atelier_appointments;

CREATE POLICY "Admins can view appointments"
  ON public.atelier_appointments FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Public can submit appointment requests"
  ON public.atelier_appointments FOR INSERT
  WITH CHECK (status = 'REQUESTED' OR public.is_admin());

CREATE POLICY "Admins can update appointments"
  ON public.atelier_appointments FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete appointments"
  ON public.atelier_appointments FOR DELETE
  USING (public.is_admin());

-- 8. Store Settings Table Policies
-- Public read is strictly limited to non-sensitive pricing/tax/shipping keys.
DROP POLICY IF EXISTS "Allow public read access to store settings" ON public.store_settings;
DROP POLICY IF EXISTS "Public can read non-sensitive store settings" ON public.store_settings;
CREATE POLICY "Public can read non-sensitive store settings"
  ON public.store_settings FOR SELECT
  USING (
    key IN ('gst_rate', 'free_shipping_threshold_inr', 'standard_shipping_fee_inr')
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can manage store settings" ON public.store_settings;
CREATE POLICY "Admins can manage store settings"
  ON public.store_settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

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
  v_gst_rate NUMERIC(6, 4);
  v_free_shipping_threshold NUMERIC(12, 2);
  v_standard_shipping_fee NUMERIC(12, 2);
  v_item RECORD;
  v_variant RECORD;
  v_product RECORD;
  v_item_price NUMERIC(12, 2);
  v_item_total NUMERIC(12, 2);
  v_created_order JSONB;
  v_items_json JSONB;
BEGIN
  -- 0. Read configurable store settings from public.store_settings
  SELECT (value #>> '{}')::NUMERIC INTO v_gst_rate
  FROM public.store_settings
  WHERE key = 'gst_rate';

  IF v_gst_rate IS NULL THEN
    RAISE EXCEPTION 'Configuration error: Required store setting "gst_rate" is missing in database.';
  END IF;

  SELECT (value #>> '{}')::NUMERIC INTO v_free_shipping_threshold
  FROM public.store_settings
  WHERE key = 'free_shipping_threshold_inr';

  IF v_free_shipping_threshold IS NULL THEN
    RAISE EXCEPTION 'Configuration error: Required store setting "free_shipping_threshold_inr" is missing in database.';
  END IF;

  SELECT (value #>> '{}')::NUMERIC INTO v_standard_shipping_fee
  FROM public.store_settings
  WHERE key = 'standard_shipping_fee_inr';

  IF v_standard_shipping_fee IS NULL THEN
    RAISE EXCEPTION 'Configuration error: Required store setting "standard_shipping_fee_inr" is missing in database.';
  END IF;

  -- Generate unique luxury order number: SNV-YEAR-HEX
  v_order_number := 'SNV-' || TO_CHAR(NOW(), 'YYYY') || '-' || UPPER(SUBSTRING(MD5(v_order_id::TEXT) FROM 1 FOR 6));

  -- Validate that items array is not empty
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item.';
  END IF;

  -- 1. Insert parent orders row FIRST with zero totals and pending status
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
    0,
    0,
    0,
    0,
    'PAYMENT_PENDING',
    'PENDING',
    p_payment_method,
    p_notes
  );

  -- 2. Process, lock, validate inventory, and insert each order item
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

    -- Calculate verified unit price (base + variant adjustment from database)
    v_item_price := v_product.base_price_inr + v_variant.additional_price_inr;
    v_item_total := v_item_price * v_item.quantity;
    v_subtotal := v_subtotal + v_item_total;

    -- Decrement variant inventory atomically
    UPDATE public.product_variants
    SET stock_quantity = stock_quantity - v_item.quantity,
        updated_at = NOW()
    WHERE id = v_variant.id;

    -- Insert into order items referencing the created parent order
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

  -- 3. Calculate Tax based on configured gst_rate
  v_tax := ROUND(v_subtotal * v_gst_rate, 2);

  -- 4. Calculate Shipping based on configured free shipping threshold and standard fee
  IF v_subtotal >= v_free_shipping_threshold THEN
    v_shipping := 0;
  ELSE
    v_shipping := v_standard_shipping_fee;
  END IF;

  v_total := v_subtotal + v_tax + v_shipping;

  -- 5. Update parent order row with final calculated totals
  UPDATE public.orders
  SET subtotal_inr = v_subtotal,
      tax_inr = v_tax,
      shipping_inr = v_shipping,
      total_inr = v_total,
      updated_at = NOW()
  WHERE id = v_order_id;

  -- 6. Return created order summary safely to the checkout caller
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', oi.id,
      'order_id', oi.order_id,
      'product_id', oi.product_id,
      'variant_id', oi.variant_id,
      'product_title', oi.product_title,
      'variant_sku', oi.variant_sku,
      'size', oi.size,
      'color', oi.color,
      'unit_price_inr', oi.unit_price_inr,
      'quantity', oi.quantity,
      'total_price_inr', oi.total_price_inr,
      'custom_measurements', oi.custom_measurements
    )
  ) INTO v_items_json
  FROM public.order_items oi
  WHERE oi.order_id = v_order_id;

  SELECT jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'user_id', v_user_id,
    'customer_email', p_customer_email,
    'customer_phone', p_customer_phone,
    'shipping_address', p_shipping_address,
    'billing_address', COALESCE(p_billing_address, p_shipping_address),
    'items', COALESCE(v_items_json, '[]'::jsonb),
    'subtotal_inr', v_subtotal,
    'tax_inr', v_tax,
    'shipping_inr', v_shipping,
    'total_inr', v_total,
    'status', 'PAYMENT_PENDING',
    'payment_status', 'PENDING',
    'payment_method', p_payment_method,
    'notes', p_notes,
    'created_at', NOW()
  ) INTO v_created_order;

  RETURN v_created_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- ====================================================================
-- SECURE SERVER-SIDE APPOINTMENT SUBMISSION RPC (request_atelier_appointment)
-- Enforces validation, input sanitization, safe guest counts, and 'REQUESTED' status
-- ====================================================================

CREATE OR REPLACE FUNCTION public.request_atelier_appointment(
  p_full_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_preferred_date DATE,
  p_preferred_time_slot TEXT,
  p_occasion_type TEXT,
  p_guest_count INT,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_trimmed_name TEXT;
  v_trimmed_email TEXT;
  v_trimmed_phone TEXT;
  v_trimmed_slot TEXT;
  v_trimmed_occasion TEXT;
  v_trimmed_notes TEXT;
  v_clean_phone TEXT;
  v_appointment_id UUID;
BEGIN
  -- 1. Trim and sanitize input strings (abuse & spam prevention)
  v_trimmed_name := TRIM(p_full_name);
  v_trimmed_email := LOWER(TRIM(p_email));
  v_trimmed_phone := TRIM(p_phone);
  v_trimmed_slot := TRIM(p_preferred_time_slot);
  v_trimmed_occasion := TRIM(p_occasion_type);
  v_trimmed_notes := NULLIF(TRIM(p_notes), '');

  -- 2. Validate required fields are non-empty
  IF v_trimmed_name IS NULL OR v_trimmed_name = '' THEN
    RAISE EXCEPTION 'Full name is required and cannot be blank.';
  END IF;

  IF char_length(v_trimmed_name) < 2 OR char_length(v_trimmed_name) > 120 THEN
    RAISE EXCEPTION 'Full name must be between 2 and 120 characters.';
  END IF;

  IF v_trimmed_email IS NULL OR v_trimmed_email = '' THEN
    RAISE EXCEPTION 'Email address is required.';
  END IF;

  IF char_length(v_trimmed_email) > 255 OR NOT (v_trimmed_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') THEN
    RAISE EXCEPTION 'Please provide a valid email address.';
  END IF;

  IF v_trimmed_phone IS NULL OR v_trimmed_phone = '' THEN
    RAISE EXCEPTION 'Contact phone number is required.';
  END IF;

  -- Verify phone has valid length and format (7 to 15 digits)
  v_clean_phone := REGEXP_REPLACE(v_trimmed_phone, '[^0-9]', '', 'g');
  IF char_length(v_clean_phone) < 7 OR char_length(v_clean_phone) > 15 THEN
    RAISE EXCEPTION 'Phone number must contain between 7 and 15 digits.';
  END IF;

  IF char_length(v_trimmed_phone) > 30 THEN
    RAISE EXCEPTION 'Phone number string is too long.';
  END IF;

  -- 3. Validate appointment date is not in the past
  IF p_preferred_date IS NULL THEN
    RAISE EXCEPTION 'Preferred appointment date is required.';
  END IF;

  IF p_preferred_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Appointment date cannot be in the past.';
  END IF;

  -- 4. Validate time slot and occasion
  IF v_trimmed_slot IS NULL OR v_trimmed_slot = '' THEN
    RAISE EXCEPTION 'Preferred time slot is required.';
  END IF;

  IF char_length(v_trimmed_slot) > 60 THEN
    RAISE EXCEPTION 'Time slot value is invalid.';
  END IF;

  IF v_trimmed_occasion IS NULL OR v_trimmed_occasion = '' THEN
    RAISE EXCEPTION 'Occasion type is required.';
  END IF;

  IF char_length(v_trimmed_occasion) > 80 THEN
    RAISE EXCEPTION 'Occasion type is invalid.';
  END IF;

  -- 5. Validate guest count within safe range (1 to 20)
  IF p_guest_count IS NULL OR p_guest_count < 1 OR p_guest_count > 20 THEN
    RAISE EXCEPTION 'Guest count must be between 1 and 20 attendees.';
  END IF;

  -- 6. Max length on optional client notes
  IF v_trimmed_notes IS NOT NULL AND char_length(v_trimmed_notes) > 1500 THEN
    RAISE EXCEPTION 'Notes cannot exceed 1,500 characters.';
  END IF;

  -- 7. Insert new appointment strictly with status 'REQUESTED' (never auto-confirmed)
  INSERT INTO public.atelier_appointments (
    full_name,
    email,
    phone,
    preferred_date,
    preferred_time_slot,
    occasion_type,
    guest_count,
    notes,
    status
  ) VALUES (
    v_trimmed_name,
    v_trimmed_email,
    v_trimmed_phone,
    p_preferred_date,
    v_trimmed_slot,
    v_trimmed_occasion,
    p_guest_count,
    v_trimmed_notes,
    'REQUESTED'
  )
  RETURNING id INTO v_appointment_id;

  RETURN jsonb_build_object(
    'id', v_appointment_id,
    'status', 'REQUESTED',
    'fullName', v_trimmed_name,
    'email', v_trimmed_email,
    'phone', v_trimmed_phone,
    'preferredDate', p_preferred_date,
    'preferredTimeSlot', v_trimmed_slot,
    'occasionType', v_trimmed_occasion,
    'estimatedGuestCount', p_guest_count,
    'notes', v_trimmed_notes,
    'createdAt', NOW()
  );
END;
$$;

-- ====================================================================
-- SEED DATA (Categories & Signature Couture Ensembles)
-- ====================================================================

INSERT INTO public.categories (id, name, slug, description, sort_order)
VALUES 
  ('a1111111-1111-1111-1111-111111111111', 'Bridal Lehengas', 'bridal-lehengas', 'Handcrafted royal wedding ensembles featuring zardozi, pita work, and real silver zari.', 1),
  ('a2222222-2222-2222-2222-222222222222', 'Artisanal Sarees', 'artisanal-sarees', 'Handwoven pure Kanjivaram and Banarasi silks draped with heirloom borders.', 2),
  ('a3333333-3333-3333-3333-333333333333', 'Contemporary Anarkalis', 'contemporary-anarkalis', 'Floor-length flared silhouettes tailored with lightweight organza and dabka embroidery.', 3),
  ('a4444444-4444-4444-4444-444444444444', 'Luxury Pret & Kurta Sets', 'ready-to-wear', 'Refined festive silhouettes designed for effortless intimate celebrations and sangeets.', 4),
  ('a5555555-5555-5555-5555-555555555555', 'Menswear Sherwanis', 'menswear-sherwanis', 'Regal handcrafted sherwanis with bespoke achkans and raw silk stoles.', 5)
ON CONFLICT (slug) DO NOTHING;

-- Seed Products
INSERT INTO public.products (
  id,
  category_id,
  title,
  slug,
  collection_name,
  description,
  craft_details,
  fabric_specs,
  care_instructions,
  base_price_inr,
  images,
  is_active,
  is_featured,
  is_new_arrival,
  is_bespoke_available
) VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  'Padmavati Royal Crimson Bridal Lehenga',
  'padmavati-crimson-bridal-lehenga',
  'Noor-e-Khaas Bridal 2026',
  'A museum-grade bridal lehenga featuring 16-kalidar velvet flared panels, hand-embroidered with 24k gold-plated zardozi wire, authentic basra pearl fringe, and antique dabka peacocks.',
  ARRAY['16-Kalidar hand-cut velvet silhouette', 'Authentic micro-dabka and salma work', 'Double dupatta draping set in tissue organza and raw silk'],
  'Pure Mulberry Silk Velvet, Pure Silk Organza, Gold Zari Wire',
  'Strictly Dry Clean by Certified Luxury Garment Specialists. Store in muslin cotton cover.',
  185000.00,
  ARRAY['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1200'],
  true,
  true,
  false,
  true
), (
  'b2222222-2222-2222-2222-222222222222',
  'a2222222-2222-2222-2222-222222222222',
  'Kashi Heritage Gold Tissue Banarasi Saree',
  'kashi-heritage-gold-tissue-banarasi-saree',
  'Varanasi Weaves Archive',
  'Woven on traditional pit-looms in Varanasi across 45 artisan days. Features an intricate Kadwa floral jaal in pure silver-dipped gold zari with contrast vermillion borders.',
  ARRAY['Authentic Kadwa handloom technique', 'Pure gold zari meenakari accents', 'Includes unstitched embroidered blouse fabric'],
  '100% Pure Katan Silk with Real Zari',
  'Dry Clean Only. Roll inside muslin fabric. Avoid perfume direct contact.',
  98000.00,
  ARRAY['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1200'],
  true,
  true,
  true,
  false
), (
  'b3333333-3333-3333-3333-333333333333',
  'a3333333-3333-3333-3333-333333333333',
  'Mehrunissa Emerald Flared Anarkali Gown',
  'mehrunissa-emerald-anarkali-gown',
  'Gulzar Festive Collection',
  'Floor-length emerald green raw silk anarkali crafted with delicate gota patti, resham floral bootis, and paired with a hand-painted Pichwai-inspired tissue dupatta.',
  ARRAY['Gota patti geometric neck detailing', 'Voluminous flare with internal cancan canvas', 'Handmade latkan tassels'],
  'Raw Chanderi Silk and Pure Organza',
  'Dry clean only.',
  65000.00,
  ARRAY['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=1200'],
  true,
  true,
  true,
  true
), (
  'b4444444-4444-4444-4444-444444444444',
  'a4444444-4444-4444-4444-444444444444',
  'Gul-e-Maryam Powder Blue Kurta Ensemble',
  'gul-e-maryam-powder-blue-kurta-set',
  'Modern Pret Line',
  'A modern silhouette tailored in powder blue Chanderi silk with delicate scalloped organza trims, tonal beadwork, and matched straight trousers.',
  ARRAY['Tone-on-tone fine resham threadwork', 'Scalloped organza cuffs and hemline', 'Lined with soft mulmul cotton'],
  'Chanderi Silk, Mulmul Cotton Lining',
  'Dry clean or gentle handwash separately in cold water.',
  32000.00,
  ARRAY['https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=1200'],
  true,
  false,
  true,
  true
)
ON CONFLICT (slug) DO NOTHING;

-- Seed Product Variants
INSERT INTO public.product_variants (product_id, sku, size, color, color_hex, additional_price_inr, stock_quantity)
VALUES
  ('b1111111-1111-1111-1111-111111111111', 'SNV-PAD-CRM-S', 'S', 'Royal Crimson', '#800020', 0, 4),
  ('b1111111-1111-1111-1111-111111111111', 'SNV-PAD-CRM-M', 'M', 'Royal Crimson', '#800020', 0, 5),
  ('b1111111-1111-1111-1111-111111111111', 'SNV-PAD-CRM-L', 'L', 'Royal Crimson', '#800020', 0, 3),
  ('b1111111-1111-1111-1111-111111111111', 'SNV-PAD-CRM-CUS', 'Custom', 'Royal Crimson', '#800020', 15000, 10),
  ('b2222222-2222-2222-2222-222222222222', 'SNV-KSH-GLD-FREE', 'Free Size', 'Antique Gold Tissue', '#C5A059', 0, 8),
  ('b3333333-3333-3333-3333-333333333333', 'SNV-MEH-EMR-S', 'S', 'Emerald Green', '#0B5345', 0, 6),
  ('b3333333-3333-3333-3333-333333333333', 'SNV-MEH-EMR-M', 'M', 'Emerald Green', '#0B5345', 0, 7),
  ('b3333333-3333-3333-3333-333333333333', 'SNV-MEH-EMR-L', 'L', 'Emerald Green', '#0B5345', 0, 4),
  ('b4444444-4444-4444-4444-444444444444', 'SNV-GUL-BLU-S', 'S', 'Powder Blue', '#B0E0E6', 0, 10),
  ('b4444444-4444-4444-4444-444444444444', 'SNV-GUL-BLU-M', 'M', 'Powder Blue', '#B0E0E6', 0, 12),
  ('b4444444-4444-4444-4444-444444444444', 'SNV-GUL-BLU-L', 'L', 'Powder Blue', '#B0E0E6', 0, 8)
ON CONFLICT (sku) DO NOTHING;

-- Seed Store Settings (Configurable GST Tax & Shipping Parameters)
INSERT INTO public.store_settings (key, value, description)
VALUES
  ('gst_rate', '0.12'::jsonb, 'Standard Goods & Services Tax rate applied to orders (e.g. 0.12 for 12% GST)'),
  ('free_shipping_threshold_inr', '15000'::jsonb, 'Order subtotal threshold in INR above which shipping is complimentary'),
  ('standard_shipping_fee_inr', '500'::jsonb, 'Standard insured domestic shipping fee in INR for orders below threshold')
ON CONFLICT (key) DO NOTHING;

-- ====================================================================
-- DATABASE PRIVILEGES & PERMISSIONS HARDENING
-- ====================================================================

-- 1. Revoke all default table privileges from public role
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;

-- 2. Grant schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 3. Storefront Catalog Tables (Categories, Products, Product Variants)
-- Public / Anon: Read-only access (RLS restricts products & variants to is_active = true)
-- Authenticated: Read-only for customers; Insert/Update/Delete strictly controlled by admin RLS
-- Service Role: Full administrative access
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.product_variants TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.product_variants TO authenticated;

GRANT ALL ON public.categories TO service_role;
GRANT ALL ON public.products TO service_role;
GRANT ALL ON public.product_variants TO service_role;

-- 4. Store Settings Table
-- Public / Anon: Read-only access (RLS restricts to non-sensitive pricing/shipping keys)
-- Authenticated: Admin manage access (governed by admin RLS)
-- Service Role: Full access
GRANT SELECT ON public.store_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.store_settings TO authenticated;
GRANT ALL ON public.store_settings TO service_role;

-- 5. User Profiles Table
-- Public / Anon: Zero access (cannot read or query any user profiles)
-- Authenticated: Read & update own profile (governed by RLS & role trigger)
-- Service Role: Full access
REVOKE ALL ON public.profiles FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- 6. Orders & Order Items Tables
-- Public / Anon: Zero access (cannot read, insert, update, or delete orders)
-- Authenticated: Read own orders/items; Admins can update/manage via RLS
-- Direct order creation is blocked; order creation strictly executes through create_order_secure()
REVOKE ALL ON public.orders FROM anon;
REVOKE ALL ON public.order_items FROM anon;
GRANT SELECT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.orders TO service_role;
GRANT ALL ON public.order_items TO service_role;

-- 7. Atelier Appointments Table
-- Public / Anon: Can submit appointment requests (INSERT with status = 'REQUESTED'); cannot read/update/delete
-- Authenticated: Can submit requests; Admins can read, update, delete via RLS
-- Service Role: Full access
REVOKE SELECT, UPDATE, DELETE ON public.atelier_appointments FROM anon;
GRANT INSERT ON public.atelier_appointments TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.atelier_appointments TO authenticated;
GRANT ALL ON public.atelier_appointments TO service_role;

-- 8. Secure RPC Function Execution Privileges
-- Only grant EXECUTE to roles that require it
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_order_secure(TEXT, TEXT, JSONB, JSONB, JSONB, TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.request_atelier_appointment(TEXT, TEXT, TEXT, DATE, TEXT, TEXT, INT, TEXT) TO anon, authenticated, service_role;

