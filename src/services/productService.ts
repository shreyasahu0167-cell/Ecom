import { Product, ProductVariant } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
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
    return getFilteredLocal();
  }

  try {
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
      console.warn('Supabase products query fallback to curated catalog:', error.message);
      return getFilteredLocal();
    }

    if (!data || data.length === 0) {
      return getFilteredLocal();
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
  } catch (err) {
    console.warn('Database connection fallback:', err);
    return getFilteredLocal();
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const getLocalMatch = () => {
    const prods = getLocalProducts();
    const found = prods.find(p => p.slug === slug || p.id === slug);
    return found || null;
  };

  if (!isSupabaseConfigured || !supabase) {
    return getLocalMatch();
  }

  try {
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
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return getLocalMatch();
      }
      console.warn('Supabase product query fallback:', error.message);
      return getLocalMatch();
    }

    if (!data) return getLocalMatch();

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
  } catch (err) {
    console.warn('Product fetch error fallback:', err);
    return getLocalMatch();
  }
}

export async function createProduct(productData: Omit<Product, 'id'> & { id?: string }): Promise<Product> {
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

  if (isSupabaseConfigured && supabase) {
    try {
      // Supabase insertion
      const { data: prodData, error: prodErr } = await supabase
        .from('products')
        .insert([
          {
            title: newProduct.title,
            slug: newProduct.slug,
            collection_name: newProduct.collectionName || null,
            description: newProduct.description,
            craft_details: newProduct.craftDetails,
            fabric_specs: newProduct.fabricSpecs,
            care_instructions: newProduct.careInstructions,
            base_price_inr: newProduct.basePriceInr,
            images: newProduct.images,
            is_featured: newProduct.isFeatured || false,
            is_new_arrival: newProduct.isNewArrival || false,
            is_bespoke_available: newProduct.isBespokeAvailable || false,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (prodErr) {
        console.warn('Supabase product save warning:', prodErr.message);
      } else if (prodData && newProduct.variants.length > 0) {
        await supabase.from('product_variants').insert(
          newProduct.variants.map(v => ({
            product_id: prodData.id,
            sku: v.sku,
            size: v.size,
            color: v.color,
            color_hex: v.colorHex,
            additional_price_inr: v.additionalPriceInr || 0,
            stock_quantity: v.stockQuantity || 0,
            is_active: true,
          }))
        );
      }
    } catch (err) {
      console.warn('Supabase product insert error:', err);
    }
  }

  // Also persist to local storage
  const prods = getLocalProducts();
  const updated = [newProduct, ...prods.filter(p => p.id !== newProduct.id)];
  saveLocalProducts(updated);

  return newProduct;
}

export async function updateProduct(productId: string, updates: Partial<Product>): Promise<Product> {
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

  if (isSupabaseConfigured && supabase) {
    try {
      const { error: updateErr } = await supabase
        .from('products')
        .update({
          title: updatedProduct.title,
          slug: updatedProduct.slug,
          collection_name: updatedProduct.collectionName || null,
          description: updatedProduct.description,
          craft_details: updatedProduct.craftDetails,
          fabric_specs: updatedProduct.fabricSpecs,
          care_instructions: updatedProduct.careInstructions,
          base_price_inr: updatedProduct.basePriceInr,
          images: updatedProduct.images,
          is_featured: updatedProduct.isFeatured,
          is_new_arrival: updatedProduct.isNewArrival,
          is_bespoke_available: updatedProduct.isBespokeAvailable,
        })
        .eq('id', productId);

      if (updateErr) {
        console.warn('Supabase product update warning:', updateErr.message);
      }
    } catch (err) {
      console.warn('Supabase update warning:', err);
    }
  }

  prods[index] = updatedProduct;
  saveLocalProducts(prods);

  return updatedProduct;
}

export async function deleteProduct(productId: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('products').update({ is_active: false }).eq('id', productId);
    } catch (err) {
      console.warn('Supabase delete warning:', err);
    }
  }

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
    try {
      await supabase
        .from('product_variants')
        .update({ stock_quantity: newStock })
        .eq('id', variantId);
    } catch (err) {
      console.warn('Supabase stock update warning:', err);
    }
  }

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
