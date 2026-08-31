import { Product, ProductVariant, ProductCategory } from '../types';
import { supabase, isSupabaseConfigured, isDemoMode } from '../lib/supabase';
import { DEMO_PRODUCTS } from '../data/demoData';

const LOCAL_STORAGE_PRODUCTS_KEY = 'saanvya_products_db';

export function parseProductImages(rawImages: any): string[] {
  if (!rawImages) return [];
  if (Array.isArray(rawImages)) {
    return rawImages.filter(img => typeof img === 'string' && img.trim().length > 0);
  }
  if (typeof rawImages === 'string') {
    const trimmed = rawImages.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.filter(img => typeof img === 'string' && img.trim().length > 0);
        }
      } catch {
        // Fallback
      }
    }
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      return trimmed
        .slice(1, -1)
        .split(',')
        .map(s => s.replace(/^"|"$/g, '').trim())
        .filter(s => s.length > 0);
    }
    return [trimmed];
  }
  return [];
}

export function normalizeCategorySlug(rawSlug?: string): ProductCategory {
  if (!rawSlug) return 'ready-to-wear';
  const s = rawSlug.toLowerCase().trim();
  if (s === 'bridal' || s === 'bridal-lehengas' || s === 'bridal-couture') return 'bridal';
  if (s === 'lehengas' || s === 'occasion-lehengas') return 'lehengas';
  if (s === 'sarees' || s === 'artisanal-sarees') return 'sarees';
  if (s === 'anarkalis' || s === 'contemporary-anarkalis') return 'anarkalis';
  if (s === 'ready-to-wear' || s === 'luxury-pret' || s === 'luxury-pret-kurta-sets') return 'ready-to-wear';
  if (s === 'accessories' || s === 'fine-accessories' || s === 'accessories-fine-accents') return 'accessories';
  return 'ready-to-wear';
}

export function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(DEMO_PRODUCTS));
      return DEMO_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(DEMO_PRODUCTS));
    return DEMO_PRODUCTS;
  } catch {
    return DEMO_PRODUCTS;
  }
}

export function saveLocalProducts(products: Product[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Failed to persist products to localStorage', e);
  }
}

export async function fetchAllProducts(categorySlug?: string): Promise<Product[]> {
  const getFilteredLocal = () => {
    const prods = getLocalProducts();
    if (categorySlug && categorySlug !== 'all') {
      return prods.filter(p => normalizeCategorySlug(p.category) === normalizeCategorySlug(categorySlug));
    }
    return prods;
  };

  if (!isSupabaseConfigured || !supabase) {
    if (isDemoMode) {
      return getFilteredLocal();
    }
    throw new Error(
      'Supabase is unconfigured and VITE_DEMO_MODE is false. Demo fallback is disabled in production mode.'
    );
  }

  // Production Mode: Fetch from Supabase directly
  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
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
      is_bespoke_available,
      created_at,
      categories (
        slug,
        name
      ),
      product_variants (
        id,
        product_id,
        sku,
        size,
        color,
        color_hex,
        additional_price_inr,
        stock_quantity,
        is_active
      )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch products from database: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Map Supabase snake_case records to Product interface
  const mappedProducts: Product[] = data.map((item: any) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    category: normalizeCategorySlug(item.categories?.slug),
    categoryLabel: item.categories?.name || 'Couture',
    collectionName: item.collection_name || undefined,
    description: item.description,
    craftDetails: item.craft_details || [],
    fabricSpecs: item.fabric_specs || '',
    careInstructions: item.care_instructions || '',
    basePriceInr: Number(item.base_price_inr),
    images: parseProductImages(item.images),
    isFeatured: item.is_featured,
    isNewArrival: item.is_new_arrival,
    isBespokeAvailable: item.is_bespoke_available,
    isSampleItem: false,
    createdAt: item.created_at,
    variants: (item.product_variants || [])
      .filter((v: any) => v.is_active)
      .map((v: any) => ({
        id: v.id,
        productId: v.product_id,
        sku: v.sku,
        size: v.size,
        color: v.color,
        colorHex: v.color_hex,
        additionalPriceInr: Number(v.additional_price_inr || 0),
        stockQuantity: Number(v.stock_quantity || 0),
        isActive: v.is_active,
      })),
  }));

  if (categorySlug && categorySlug !== 'all') {
    const targetNormalized = normalizeCategorySlug(categorySlug);
    return mappedProducts.filter(
      p => normalizeCategorySlug(p.category) === targetNormalized || p.category === categorySlug
    );
  }

  return mappedProducts;
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const getLocalMatch = () => {
    const prods = getLocalProducts();
    const found = prods.find(p => p.slug === slug || p.id === slug);
    return found || null;
  };

  if (!isSupabaseConfigured || !supabase) {
    if (isDemoMode) {
      return getLocalMatch();
    }
    throw new Error('Supabase database is unconfigured and VITE_DEMO_MODE is false.');
  }

  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
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
      is_bespoke_available,
      created_at,
      categories (
        slug,
        name
      ),
      product_variants (
        id,
        product_id,
        sku,
        size,
        color,
        color_hex,
        additional_price_inr,
        stock_quantity,
        is_active
      )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch product '${slug}': ${error.message}`);
  }

  if (!data) return null;

  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    category: normalizeCategorySlug((data.categories as any)?.slug),
    categoryLabel: (data.categories as any)?.name || 'Couture',
    collectionName: data.collection_name || undefined,
    description: data.description,
    craftDetails: data.craft_details || [],
    fabricSpecs: data.fabric_specs || '',
    careInstructions: data.care_instructions || '',
    basePriceInr: Number(data.base_price_inr),
    images: parseProductImages(data.images),
    isFeatured: data.is_featured,
    isNewArrival: data.is_new_arrival,
    isBespokeAvailable: data.is_bespoke_available,
    isSampleItem: false,
    createdAt: data.created_at,
    variants: (data.product_variants || [])
      .filter((v: any) => v.is_active)
      .map((v: any) => ({
        id: v.id,
        productId: v.product_id,
        sku: v.sku,
        size: v.size,
        color: v.color,
        colorHex: v.color_hex,
        additionalPriceInr: Number(v.additional_price_inr || 0),
        stockQuantity: Number(v.stock_quantity || 0),
        isActive: v.is_active,
      })),
  };
}

export async function createProduct(productData: Omit<Product, 'id'> & { id?: string }): Promise<Product> {
  if (isSupabaseConfigured && supabase) {
    let categoryId: string | null = null;
    if (productData.category) {
      const { data: catData, error: catErr } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', productData.category)
        .maybeSingle();

      if (catErr) {
        throw new Error(`Failed to resolve category for product: ${catErr.message}`);
      }
      if (catData?.id) {
        categoryId = catData.id;
      }
    }

    // Supabase insertion
    const { data: prodData, error: prodErr } = await supabase
      .from('products')
      .insert([
        {
          title: productData.title,
          slug: productData.slug,
          category_id: categoryId,
          collection_name: productData.collectionName || null,
          description: productData.description,
          craft_details: productData.craftDetails || [],
          fabric_specs: productData.fabricSpecs || '',
          care_instructions: productData.careInstructions || '',
          base_price_inr: productData.basePriceInr,
          images: productData.images || [],
          is_featured: productData.isFeatured || false,
          is_new_arrival: productData.isNewArrival || false,
          is_bespoke_available: productData.isBespokeAvailable || false,
          is_active: true,
        },
      ])
      .select(`
        id,
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
        is_bespoke_available,
        created_at,
        categories (
          slug,
          name
        )
      `)
      .single();

    if (prodErr || !prodData) {
      throw new Error(`Failed to create product in database: ${prodErr?.message || 'Database returned no data'}`);
    }

    let insertedVariants: ProductVariant[] = [];
    if (productData.variants && productData.variants.length > 0) {
      const { data: varData, error: varErr } = await supabase
        .from('product_variants')
        .insert(
          productData.variants.map(v => ({
            product_id: prodData.id,
            sku: v.sku,
            size: v.size,
            color: v.color,
            color_hex: v.colorHex,
            additional_price_inr: v.additionalPriceInr || 0,
            stock_quantity: v.stockQuantity || 0,
            is_active: true,
          }))
        )
        .select();

      if (varErr || !varData) {
        throw new Error(`Failed to create product variants in database: ${varErr?.message || 'Variant creation returned no data'}`);
      }

      insertedVariants = varData.map((v: any) => ({
        id: v.id,
        productId: v.product_id,
        sku: v.sku,
        size: v.size,
        color: v.color,
        colorHex: v.color_hex,
        additionalPriceInr: Number(v.additional_price_inr || 0),
        stockQuantity: Number(v.stock_quantity || 0),
        isActive: v.is_active,
      }));
    }

    return {
      id: prodData.id,
      title: prodData.title,
      slug: prodData.slug,
      category: ((prodData.categories as any)?.slug as any) || productData.category || 'ready-to-wear',
      categoryLabel: (prodData.categories as any)?.name || productData.categoryLabel || 'Couture',
      collectionName: prodData.collection_name || undefined,
      description: prodData.description,
      craftDetails: prodData.craft_details || [],
      fabricSpecs: prodData.fabric_specs || '',
      careInstructions: prodData.care_instructions || '',
      basePriceInr: Number(prodData.base_price_inr),
      images: prodData.images || [],
      isFeatured: prodData.is_featured,
      isNewArrival: prodData.is_new_arrival,
      isBespokeAvailable: prodData.is_bespoke_available,
      isSampleItem: false,
      createdAt: prodData.created_at,
      variants: insertedVariants,
    };
  }

  if (!isDemoMode) {
    throw new Error('Database is unconfigured and VITE_DEMO_MODE is disabled.');
  }

  // Local demo mode only
  const newId = productData.id || `prod-${Date.now()}`;
  const now = new Date().toISOString();

  const newProduct: Product = {
    ...productData,
    id: newId,
    createdAt: now,
    variants: (productData.variants || []).map((v, i) => ({
      ...v,
      id: v.id || `var-${newId}-${i}-${Date.now()}`,
      productId: newId,
      isActive: v.isActive !== false,
    })),
  };

  const prods = getLocalProducts();
  const updated = [newProduct, ...prods.filter(p => p.id !== newProduct.id)];
  saveLocalProducts(updated);

  return newProduct;
}

export async function updateProduct(productId: string, updates: Partial<Product>): Promise<Product> {
  if (isSupabaseConfigured && supabase) {
    const updatePayload: Record<string, any> = {};
    if (updates.title !== undefined) updatePayload.title = updates.title;
    if (updates.slug !== undefined) updatePayload.slug = updates.slug;
    if (updates.collectionName !== undefined) updatePayload.collection_name = updates.collectionName || null;
    if (updates.description !== undefined) updatePayload.description = updates.description;
    if (updates.craftDetails !== undefined) updatePayload.craft_details = updates.craftDetails;
    if (updates.fabricSpecs !== undefined) updatePayload.fabric_specs = updates.fabricSpecs;
    if (updates.careInstructions !== undefined) updatePayload.care_instructions = updates.careInstructions;
    if (updates.basePriceInr !== undefined) updatePayload.base_price_inr = updates.basePriceInr;
    if (updates.images !== undefined) updatePayload.images = updates.images;
    if (updates.isFeatured !== undefined) updatePayload.is_featured = updates.isFeatured;
    if (updates.isNewArrival !== undefined) updatePayload.is_new_arrival = updates.isNewArrival;
    if (updates.isBespokeAvailable !== undefined) updatePayload.is_bespoke_available = updates.isBespokeAvailable;

    if (updates.category) {
      const { data: catData, error: catErr } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', updates.category)
        .maybeSingle();

      if (catErr) {
        throw new Error(`Failed to resolve category for product update: ${catErr.message}`);
      }
      if (catData?.id) {
        updatePayload.category_id = catData.id;
      }
    }

    if (Object.keys(updatePayload).length > 0) {
      const { error: updateErr } = await supabase
        .from('products')
        .update(updatePayload)
        .eq('id', productId);

      if (updateErr) {
        throw new Error(`Failed to update product in database: ${updateErr.message}`);
      }
    }

    if (updates.variants && Array.isArray(updates.variants)) {
      for (const variant of updates.variants) {
        const isExistingDbVariant = variant.id && !variant.id.startsWith('var-') && !variant.id.startsWith('v-');
        if (isExistingDbVariant) {
          const { error: varUpdateErr } = await supabase
            .from('product_variants')
            .update({
              sku: variant.sku,
              size: variant.size,
              color: variant.color,
              color_hex: variant.colorHex,
              additional_price_inr: variant.additionalPriceInr || 0,
              stock_quantity: variant.stockQuantity || 0,
              is_active: variant.isActive !== false,
            })
            .eq('id', variant.id);

          if (varUpdateErr) {
            throw new Error(`Failed to update variant '${variant.sku}' in database: ${varUpdateErr.message}`);
          }
        } else {
          const { error: varInsertErr } = await supabase
            .from('product_variants')
            .insert({
              product_id: productId,
              sku: variant.sku,
              size: variant.size,
              color: variant.color,
              color_hex: variant.colorHex,
              additional_price_inr: variant.additionalPriceInr || 0,
              stock_quantity: variant.stockQuantity || 0,
              is_active: variant.isActive !== false,
            });

          if (varInsertErr) {
            throw new Error(`Failed to create variant '${variant.sku}' in database: ${varInsertErr.message}`);
          }
        }
      }
    }

    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
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
        is_bespoke_available,
        created_at,
        categories (
          slug,
          name
        ),
        product_variants (
          id,
          product_id,
          sku,
          size,
          color,
          color_hex,
          additional_price_inr,
          stock_quantity,
          is_active
        )
      `)
      .eq('id', productId)
      .single();

    if (error || !data) {
      throw new Error(`Failed to retrieve updated product from database: ${error?.message || 'Product not found'}`);
    }

    return {
      id: data.id,
      title: data.title,
      slug: data.slug,
      category: normalizeCategorySlug((data.categories as any)?.slug),
      categoryLabel: (data.categories as any)?.name || 'Couture',
      collectionName: data.collection_name || undefined,
      description: data.description,
      craftDetails: data.craft_details || [],
      fabricSpecs: data.fabric_specs || '',
      careInstructions: data.care_instructions || '',
      basePriceInr: Number(data.base_price_inr),
      images: parseProductImages(data.images),
      isFeatured: data.is_featured,
      isNewArrival: data.is_new_arrival,
      isBespokeAvailable: data.is_bespoke_available,
      isSampleItem: false,
      createdAt: data.created_at,
      variants: (data.product_variants || [])
        .filter((v: any) => v.is_active)
        .map((v: any) => ({
          id: v.id,
          productId: v.product_id,
          sku: v.sku,
          size: v.size,
          color: v.color,
          colorHex: v.color_hex,
          additionalPriceInr: Number(v.additional_price_inr || 0),
          stockQuantity: Number(v.stock_quantity || 0),
          isActive: v.is_active,
        })),
    };
  }

  if (!isDemoMode) {
    throw new Error('Database is unconfigured and VITE_DEMO_MODE is disabled.');
  }

  // Local demo mode only
  const prods = getLocalProducts();
  const index = prods.findIndex(p => p.id === productId);
  
  if (index === -1) {
    throw new Error(`Product with ID ${productId} not found`);
  }

  const updatedProduct: Product = {
    ...prods[index],
    ...updates,
    id: productId,
  };

  prods[index] = updatedProduct;
  saveLocalProducts(prods);

  return updatedProduct;
}

export async function deleteProduct(productId: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', productId)
      .select('id');

    if (error) {
      throw new Error(`Failed to delete product in database: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error(`Product with ID ${productId} was not found or could not be deactivated in database.`);
    }

    return true;
  }

  if (!isDemoMode) {
    throw new Error('Database is unconfigured and VITE_DEMO_MODE is disabled.');
  }

  // Local demo mode only
  const prods = getLocalProducts();
  const filtered = prods.filter(p => p.id !== productId);
  saveLocalProducts(filtered);
  return true;
}

export async function updateVariantStock(
  productId: string,
  variantId: string,
  newStock: number
): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('product_variants')
      .update({ stock_quantity: newStock })
      .eq('id', variantId)
      .select('id, stock_quantity');

    if (error) {
      throw new Error(`Failed to update variant stock in database: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error(`Variant ID ${variantId} was not found or could not be updated in database.`);
    }

    return true;
  }

  if (!isDemoMode) {
    throw new Error('Database is unconfigured and VITE_DEMO_MODE is disabled.');
  }

  // Local demo mode only
  const prods = getLocalProducts();
  const pIndex = prods.findIndex(p => p.id === productId);
  if (pIndex !== -1) {
    prods[pIndex].variants = prods[pIndex].variants.map(v =>
      v.id === variantId ? { ...v, stockQuantity: newStock } : v
    );
    saveLocalProducts(prods);
  }

  return true;
}

export interface CatalogSyncResult {
  success: boolean;
  message: string;
  syncedProducts: number;
  syncedVariants: number;
  errors: string[];
}

export async function getCatalogSyncStatus(): Promise<{
  isSupabaseConnected: boolean;
  databaseProductCount: number;
  localProductCount: number;
}> {
  const localProducts = getLocalProducts();
  if (!isSupabaseConfigured || !supabase) {
    return {
      isSupabaseConnected: false,
      databaseProductCount: 0,
      localProductCount: localProducts.length,
    };
  }

  try {
    const { count, error } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true);

    if (error) {
      console.warn('Error checking Supabase product count:', error);
      return {
        isSupabaseConnected: true,
        databaseProductCount: 0,
        localProductCount: localProducts.length,
      };
    }

    return {
      isSupabaseConnected: true,
      databaseProductCount: count || 0,
      localProductCount: localProducts.length,
    };
  } catch {
    return {
      isSupabaseConnected: false,
      databaseProductCount: 0,
      localProductCount: localProducts.length,
    };
  }
}

export async function pushCatalogToSupabase(): Promise<CatalogSyncResult> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
  }

  const localProducts = getLocalProducts();
  if (!localProducts || localProducts.length === 0) {
    return {
      success: true,
      message: 'No local products found to push.',
      syncedProducts: 0,
      syncedVariants: 0,
      errors: [],
    };
  }

  const errors: string[] = [];
  let syncedProductsCount = 0;
  let syncedVariantsCount = 0;

  // 1. Ensure categories exist
  const requiredCategories = [
    { slug: 'bridal-lehengas', name: 'Bridal Lehengas', description: 'Handcrafted heirloom bridal ensembles.' },
    { slug: 'bridal', name: 'Bridal', description: 'Bridal collections and ensembles.' },
    { slug: 'lehengas', name: 'Lehengas', description: 'Occasion and celebratory lehengas.' },
    { slug: 'occasion-lehengas', name: 'Occasion Lehengas', description: 'Celebratory silhouettes.' },
    { slug: 'artisanal-sarees', name: 'Artisanal Sarees', description: 'Handwoven pure silk sarees.' },
    { slug: 'sarees', name: 'Sarees', description: 'Handwoven pure silk sarees.' },
    { slug: 'contemporary-anarkalis', name: 'Contemporary Anarkalis', description: 'Floor-sweeping flared silhouettes.' },
    { slug: 'anarkalis', name: 'Anarkalis', description: 'Floor-sweeping flared silhouettes.' },
    { slug: 'ready-to-wear', name: 'Ready To Wear', description: 'Luxury pret and festive coordinates.' },
    { slug: 'luxury-pret', name: 'Luxury Pret', description: 'Luxury festive coordinates.' },
    { slug: 'accessories', name: 'Fine Accessories', description: 'Heirloom accents and embellishments.' },
  ];

  for (const cat of requiredCategories) {
    try {
      await supabase
        .from('categories')
        .upsert(
          {
            slug: cat.slug,
            name: cat.name,
            description: cat.description,
            is_active: true,
          },
          { onConflict: 'slug' }
        );
    } catch {
      // Continue
    }
  }

  // Fetch resolved category map
  const { data: categoriesData } = await supabase.from('categories').select('id, slug');
  const categoryMap = new Map<string, string>();
  if (categoriesData) {
    for (const c of categoriesData) {
      categoryMap.set(c.slug, c.id);
    }
  }

  // 2. Insert or update each product
  for (const prod of localProducts) {
    try {
      const normalizedCat = normalizeCategorySlug(prod.category);
      const categoryId =
        categoryMap.get(prod.category) ||
        categoryMap.get(normalizedCat) ||
        categoryMap.get(`${normalizedCat}-lehengas`) ||
        categoryMap.get(`artisanal-${normalizedCat}`) ||
        categoryMap.get('ready-to-wear') ||
        null;

      const productImages = parseProductImages(prod.images);

      // Upsert product by slug
      const { data: upsertedProd, error: prodErr } = await supabase
        .from('products')
        .upsert(
          {
            title: prod.title,
            slug: prod.slug,
            category_id: categoryId,
            collection_name: prod.collectionName || null,
            description: prod.description || '',
            craft_details: prod.craftDetails || [],
            fabric_specs: prod.fabricSpecs || '',
            care_instructions: prod.careInstructions || '',
            base_price_inr: prod.basePriceInr,
            images: productImages,
            is_featured: prod.isFeatured || false,
            is_new_arrival: prod.isNewArrival || false,
            is_bespoke_available: prod.isBespokeAvailable || false,
            is_active: true,
          },
          { onConflict: 'slug' }
        )
        .select('id')
        .single();

      if (prodErr) {
        errors.push(`Product '${prod.title}': ${prodErr.message}`);
        continue;
      }

      if (upsertedProd) {
        syncedProductsCount++;
        const targetProductId = upsertedProd.id;

        // Upsert variants
        if (prod.variants && prod.variants.length > 0) {
          for (const v of prod.variants) {
            try {
              const { error: varErr } = await supabase
                .from('product_variants')
                .upsert(
                  {
                    product_id: targetProductId,
                    sku: v.sku,
                    size: v.size,
                    color: v.color,
                    color_hex: v.colorHex,
                    additional_price_inr: v.additionalPriceInr || 0,
                    stock_quantity: v.stockQuantity || 0,
                    is_active: v.isActive !== false,
                  },
                  { onConflict: 'sku' }
                );

              if (varErr) {
                // If onConflict fails, insert variant
                await supabase.from('product_variants').insert({
                  product_id: targetProductId,
                  sku: `${v.sku}-${Math.floor(Math.random() * 1000)}`,
                  size: v.size,
                  color: v.color,
                  color_hex: v.colorHex,
                  additional_price_inr: v.additionalPriceInr || 0,
                  stock_quantity: v.stockQuantity || 0,
                  is_active: v.isActive !== false,
                });
              }
              syncedVariantsCount++;
            } catch (vErr: any) {
              errors.push(`Variant '${v.sku}': ${vErr?.message}`);
            }
          }
        }
      }
    } catch (err: any) {
      errors.push(`Product '${prod.title}': ${err?.message}`);
    }
  }

  return {
    success: errors.length === 0,
    message: `Successfully synchronized ${syncedProductsCount} products and ${syncedVariantsCount} variants to Supabase database.`,
    syncedProducts: syncedProductsCount,
    syncedVariants: syncedVariantsCount,
    errors,
  };
}
