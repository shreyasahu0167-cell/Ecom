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
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Categories RLS
DROP POLICY IF EXISTS "Public can read categories" ON public.categories;
CREATE POLICY "Public can read categories"
  ON public.categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (public.is_admin());

-- Products RLS
DROP POLICY IF EXISTS "Public can read active products" ON public.products;
CREATE POLICY "Public can read active products"
  ON public.products FOR SELECT
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  USING (public.is_admin());

-- Product Variants RLS
DROP POLICY IF EXISTS "Public can read active product variants" ON public.product_variants;
CREATE POLICY "Public can read active product variants"
  ON public.product_variants FOR SELECT
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage product variants" ON public.product_variants;
CREATE POLICY "Admins can manage product variants"
  ON public.product_variants FOR ALL
  USING (public.is_admin());

-- Orders RLS
DROP POLICY IF EXISTS "Customers can read own orders" ON public.orders;
CREATE POLICY "Customers can read own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
CREATE POLICY "Admins can manage orders"
  ON public.orders FOR ALL
  USING (public.is_admin());

-- Order Items RLS
DROP POLICY IF EXISTS "Customers can read own order items" ON public.order_items;
CREATE POLICY "Customers can read own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Admins can manage order items" ON public.order_items;
CREATE POLICY "Admins can manage order items"
  ON public.order_items FOR ALL
  USING (public.is_admin());

-- Atelier Appointments RLS
DROP POLICY IF EXISTS "Public can create appointments" ON public.atelier_appointments;
CREATE POLICY "Public can create appointments"
  ON public.atelier_appointments FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view and manage appointments" ON public.atelier_appointments;
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
