import { Product, ProductVariant } from '../types';
import { supabase, isSupabaseConfigured, isDemoMode } from '../lib/supabase';
import { DEMO_PRODUCTS } from '../data/demoData';

const LOCAL_STORAGE_PRODUCTS_KEY = 'saanvya_products_db';

function getLocalProducts(): Product[] {
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

function saveLocalProducts(products: Product[]): void {
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
      return prods.filter(p => p.category === categorySlug);
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
  let query = supabase
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

  if (categorySlug && categorySlug !== 'all') {
    query = query.eq('categories.slug', categorySlug);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch products from database: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Map Supabase snake_case records to Product interface
  return data.map((item: any) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    category: (item.categories?.slug as any) || 'ready-to-wear',
    categoryLabel: item.categories?.name || 'Couture',
    collectionName: item.collection_name || undefined,
    description: item.description,
    craftDetails: item.craft_details || [],
    fabricSpecs: item.fabric_specs || '',
    careInstructions: item.care_instructions || '',
    basePriceInr: Number(item.base_price_inr),
    images: item.images || [],
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
    category: ((data.categories as any)?.slug as any) || 'ready-to-wear',
    categoryLabel: (data.categories as any)?.name || 'Couture',
    collectionName: data.collection_name || undefined,
    description: data.description,
    craftDetails: data.craft_details || [],
    fabricSpecs: data.fabric_specs || '',
    careInstructions: data.care_instructions || '',
    basePriceInr: Number(data.base_price_inr),
    images: data.images || [],
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
      category: ((data.categories as any)?.slug as any) || 'ready-to-wear',
      categoryLabel: (data.categories as any)?.name || 'Couture',
      collectionName: data.collection_name || undefined,
      description: data.description,
      craftDetails: data.craft_details || [],
      fabricSpecs: data.fabric_specs || '',
      careInstructions: data.care_instructions || '',
      basePriceInr: Number(data.base_price_inr),
      images: data.images || [],
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
