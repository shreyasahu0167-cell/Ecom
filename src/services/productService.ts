import { Product } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DEMO_PRODUCTS } from '../data/demoData';

export async function fetchAllProducts(categorySlug?: string): Promise<Product[]> {
  if (!isSupabaseConfigured || !supabase) {
    // Demo Mode: Filter local demo data
    if (categorySlug && categorySlug !== 'all') {
      return DEMO_PRODUCTS.filter(p => p.category === categorySlug);
    }
    return DEMO_PRODUCTS;
  }

  // Production Mode: Fetch from Supabase directly
  // Note: We intentionally do NOT catch and swallow errors here so production issues are clear and never fallback silently.
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
    throw new Error(`Failed to load products from production database: ${error.message}`);
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
  if (!isSupabaseConfigured || !supabase) {
    const found = DEMO_PRODUCTS.find(p => p.slug === slug || p.id === slug);
    return found || null;
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
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to load product '${slug}' from database: ${error.message}`);
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
