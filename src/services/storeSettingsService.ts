import { supabase, isSupabaseConfigured, isDemoMode } from '../lib/supabase';
import { StoreSettings } from '../types';

export const DEFAULT_DEMO_STORE_SETTINGS: StoreSettings = {
  gstRate: 0.12,
  freeShippingThresholdInr: 15000,
  standardShippingFeeInr: 500,
};

const LOCAL_STORAGE_SETTINGS_KEY = 'saanvya_demo_store_settings';

/**
 * Retrieves configurable store settings (tax rate, shipping threshold, standard shipping fee).
 * - In Production: Reads from Supabase `public.store_settings`. Missing settings raise a configuration error.
 * - In Demo Mode: Falls back safely to configurable local storage / standard demo defaults.
 */
export async function getStoreSettings(): Promise<StoreSettings> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('store_settings')
      .select('key, value');

    if (error) {
      throw new Error(`Failed to load store settings from database: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error(
        'Configuration error: Required store settings are missing in the production database.'
      );
    }

    const map = new Map<string, any>();
    data.forEach((row: { key: string; value: any }) => {
      map.set(row.key, row.value);
    });

    const rawGst = map.get('gst_rate');
    const rawThreshold = map.get('free_shipping_threshold_inr');
    const rawShippingFee = map.get('standard_shipping_fee_inr');

    if (rawGst === undefined || rawThreshold === undefined || rawShippingFee === undefined) {
      throw new Error(
        'Configuration error: One or more required store settings (gst_rate, free_shipping_threshold_inr, standard_shipping_fee_inr) are missing in database.'
      );
    }

    const gstRate = Number(rawGst);
    const freeShippingThresholdInr = Number(rawThreshold);
    const standardShippingFeeInr = Number(rawShippingFee);

    if (isNaN(gstRate) || isNaN(freeShippingThresholdInr) || isNaN(standardShippingFeeInr)) {
      throw new Error(
        'Configuration error: Store settings in database contain invalid non-numeric values.'
      );
    }

    return {
      gstRate,
      freeShippingThresholdInr,
      standardShippingFeeInr,
    };
  }

  if (isDemoMode) {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          gstRate: typeof parsed.gstRate === 'number' ? parsed.gstRate : DEFAULT_DEMO_STORE_SETTINGS.gstRate,
          freeShippingThresholdInr:
            typeof parsed.freeShippingThresholdInr === 'number'
              ? parsed.freeShippingThresholdInr
              : DEFAULT_DEMO_STORE_SETTINGS.freeShippingThresholdInr,
          standardShippingFeeInr:
            typeof parsed.standardShippingFeeInr === 'number'
              ? parsed.standardShippingFeeInr
              : DEFAULT_DEMO_STORE_SETTINGS.standardShippingFeeInr,
        };
      }
    } catch {
      // ignore JSON parse error in demo mode
    }
    return DEFAULT_DEMO_STORE_SETTINGS;
  }

  throw new Error(
    'Configuration error: Database is unconfigured and demo mode is disabled.'
  );
}

/**
 * Updates configurable store settings.
 */
export async function updateStoreSettings(
  newSettings: Partial<StoreSettings>
): Promise<StoreSettings> {
  if (isSupabaseConfigured && supabase) {
    const upserts: { key: string; value: any; updated_at: string }[] = [];

    if (newSettings.gstRate !== undefined) {
      upserts.push({
        key: 'gst_rate',
        value: newSettings.gstRate,
        updated_at: new Date().toISOString(),
      });
    }
    if (newSettings.freeShippingThresholdInr !== undefined) {
      upserts.push({
        key: 'free_shipping_threshold_inr',
        value: newSettings.freeShippingThresholdInr,
        updated_at: new Date().toISOString(),
      });
    }
    if (newSettings.standardShippingFeeInr !== undefined) {
      upserts.push({
        key: 'standard_shipping_fee_inr',
        value: newSettings.standardShippingFeeInr,
        updated_at: new Date().toISOString(),
      });
    }

    for (const entry of upserts) {
      const { error } = await supabase
        .from('store_settings')
        .upsert(entry, { onConflict: 'key' });

      if (error) {
        throw new Error(`Failed to update store setting "${entry.key}" in database: ${error.message}`);
      }
    }

    return await getStoreSettings();
  }

  if (isDemoMode) {
    const current = await getStoreSettings();
    const merged: StoreSettings = {
      ...current,
      ...newSettings,
    };
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(merged));
    return merged;
  }

  throw new Error('Database is unconfigured and demo mode is disabled.');
}
