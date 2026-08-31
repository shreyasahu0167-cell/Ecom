import { AtelierAppointment } from '../types';
import { supabase, isSupabaseConfigured, isDemoMode } from '../lib/supabase';

export interface BookAppointmentPayload {
  fullName: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTimeSlot: string;
  occasionType: 'Bridal Consultation' | 'Trousseau Planning' | 'Occasion Wear' | 'Custom Bespoke';
  estimatedGuestCount: number;
  notes?: string;
}

const LOCAL_STORAGE_APPOINTMENTS_KEY = 'saanvya_demo_appointments';

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PHONE_FORMAT_REGEX = /^[+]?[0-9\s\-()]{7,30}$/;

/**
 * Validates and sanitizes appointment payload.
 * Throws a descriptive Error if validation fails.
 */
export function validateAndSanitizeAppointmentPayload(
  payload: BookAppointmentPayload
): {
  fullName: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTimeSlot: string;
  occasionType: 'Bridal Consultation' | 'Trousseau Planning' | 'Occasion Wear' | 'Custom Bespoke';
  estimatedGuestCount: number;
  notes?: string;
} {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid appointment request data.');
  }

  // 1. Sanitize & trim inputs
  const fullName = (payload.fullName || '').trim();
  const email = (payload.email || '').trim().toLowerCase();
  const phone = (payload.phone || '').trim();
  const preferredDate = (payload.preferredDate || '').trim();
  const preferredTimeSlot = (payload.preferredTimeSlot || '').trim();
  const occasionType = payload.occasionType;
  const guestCount = Number(payload.estimatedGuestCount);
  const notes = payload.notes ? payload.notes.trim() : undefined;

  // 2. Required fields cannot be blank
  if (!fullName) {
    throw new Error('Full name is required and cannot be blank.');
  }
  if (fullName.length < 2) {
    throw new Error('Full name must be at least 2 characters long.');
  }
  if (fullName.length > 120) {
    throw new Error('Full name cannot exceed 120 characters.');
  }

  if (!email) {
    throw new Error('Email address is required.');
  }
  if (email.length > 255 || !EMAIL_REGEX.test(email)) {
    throw new Error('Please provide a valid email address.');
  }

  if (!phone) {
    throw new Error('Contact phone number is required.');
  }
  if (!PHONE_FORMAT_REGEX.test(phone)) {
    throw new Error('Phone number contains invalid characters.');
  }
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    throw new Error('Contact phone number must contain between 7 and 15 digits.');
  }
  if (phone.length > 30) {
    throw new Error('Phone number formatting is too long.');
  }

  // 3. Appointment date validation (cannot be in the past)
  if (!preferredDate) {
    throw new Error('Preferred appointment date is required.');
  }
  // Validate YYYY-MM-DD format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) {
    throw new Error('Invalid date format. Please select a valid date.');
  }
  const todayStr = new Date().toISOString().split('T')[0];
  if (preferredDate < todayStr) {
    throw new Error('Appointment date cannot be in the past.');
  }

  // 4. Time slot & occasion validation
  if (!preferredTimeSlot) {
    throw new Error('Preferred time slot is required.');
  }
  if (preferredTimeSlot.length > 60) {
    throw new Error('Preferred time slot value is invalid.');
  }

  const validOccasions = [
    'Bridal Consultation',
    'Trousseau Planning',
    'Occasion Wear',
    'Custom Bespoke',
  ];
  if (!occasionType || !validOccasions.includes(occasionType)) {
    throw new Error('Please select a valid consultation occasion focus.');
  }

  // 5. Guest count within safe range (1 to 20)
  if (isNaN(guestCount) || guestCount < 1 || guestCount > 20 || !Number.isInteger(guestCount)) {
    throw new Error('Guest count must be an integer between 1 and 20.');
  }

  // 6. Max lengths on notes (spam & abuse prevention)
  if (notes && notes.length > 1500) {
    throw new Error('Consultation notes cannot exceed 1,500 characters.');
  }

  return {
    fullName,
    email,
    phone,
    preferredDate,
    preferredTimeSlot,
    occasionType,
    estimatedGuestCount: guestCount,
    notes: notes || undefined,
  };
}

function getStoredAppointments(): AtelierAppointment[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_APPOINTMENTS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (a: any) =>
          a &&
          typeof a === 'object' &&
          a.id &&
          !String(a.id).startsWith('appt-seed-')
      );
    }
    return [];
  } catch {
    return [];
  }
}

function saveStoredAppointments(appts: AtelierAppointment[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_APPOINTMENTS_KEY, JSON.stringify(appts));
  } catch (e) {
    console.error('Failed to persist appointments', e);
  }
}

/**
 * Fetches all appointments (restricted to administrators via RLS / service).
 */
export async function fetchAllAppointments(): Promise<AtelierAppointment[]> {
  if (isSupabaseConfigured && supabase) {
    const { data: appts, error } = await supabase
      .from('atelier_appointments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch appointments from database: ${error.message}`);
    }

    if (!appts || appts.length === 0) {
      return [];
    }

    return appts.map((a: any) => ({
      id: a.id,
      fullName: a.full_name,
      email: a.email,
      phone: a.phone,
      preferredDate: a.preferred_date,
      preferredTimeSlot: a.preferred_time_slot,
      occasionType: a.occasion_type,
      estimatedGuestCount: a.guest_count,
      notes: a.notes,
      status: a.status,
      createdAt: a.created_at,
    }));
  }

  if (isDemoMode) {
    return getStoredAppointments();
  }

  throw new Error('Supabase database is unconfigured and VITE_DEMO_MODE is false.');
}

/**
 * Updates status of an appointment (Admin only).
 */
export async function updateAppointmentStatus(
  id: string,
  status: 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error, data } = await supabase
      .from('atelier_appointments')
      .update({ status })
      .eq('id', id)
      .select('id');

    if (error) {
      throw new Error(`Failed to update appointment in database: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error('Appointment not found or insufficient permissions to update.');
    }

    return true;
  }

  if (!isDemoMode) {
    throw new Error('Database is unconfigured and VITE_DEMO_MODE is disabled.');
  }

  const all = getStoredAppointments();
  const index = all.findIndex(a => a.id === id);
  if (index !== -1) {
    all[index].status = status;
    saveStoredAppointments(all);
    return true;
  }
  return false;
}

/**
 * Books an Atelier consultation appointment request.
 * - Always initializes status to 'REQUESTED' (never auto-confirmed).
 * - Enforces rigorous server-side & client-side validation.
 */
export async function bookAtelierAppointment(
  rawPayload: BookAppointmentPayload
): Promise<AtelierAppointment> {
  // Validate and sanitize input
  const sanitized = validateAndSanitizeAppointmentPayload(rawPayload);

  if (isSupabaseConfigured && supabase) {
    // 1. Try secure RPC submission
    const { data: rpcData, error: rpcError } = await supabase.rpc('request_atelier_appointment', {
      p_full_name: sanitized.fullName,
      p_email: sanitized.email,
      p_phone: sanitized.phone,
      p_preferred_date: sanitized.preferredDate,
      p_preferred_time_slot: sanitized.preferredTimeSlot,
      p_occasion_type: sanitized.occasionType,
      p_guest_count: sanitized.estimatedGuestCount,
      p_notes: sanitized.notes || null,
    });

    if (!rpcError && rpcData) {
      return {
        id: rpcData.id || `appt-${Date.now()}`,
        fullName: rpcData.fullName || sanitized.fullName,
        email: rpcData.email || sanitized.email,
        phone: rpcData.phone || sanitized.phone,
        preferredDate: rpcData.preferredDate || sanitized.preferredDate,
        preferredTimeSlot: rpcData.preferredTimeSlot || sanitized.preferredTimeSlot,
        occasionType: rpcData.occasionType || sanitized.occasionType,
        estimatedGuestCount: rpcData.estimatedGuestCount || sanitized.estimatedGuestCount,
        notes: rpcData.notes || sanitized.notes,
        status: 'REQUESTED',
        createdAt: rpcData.createdAt || new Date().toISOString(),
      };
    }

    // If RPC had an error that was a business validation error, throw it directly
    if (rpcError && rpcError.message && !rpcError.message.includes('function') && !rpcError.message.includes('does not exist')) {
      throw new Error(rpcError.message);
    }

    // 2. Fallback to direct table INSERT if RPC is not present
    const { error: insertError } = await supabase
      .from('atelier_appointments')
      .insert([
        {
          full_name: sanitized.fullName,
          email: sanitized.email,
          phone: sanitized.phone,
          preferred_date: sanitized.preferredDate,
          preferred_time_slot: sanitized.preferredTimeSlot,
          occasion_type: sanitized.occasionType,
          guest_count: sanitized.estimatedGuestCount,
          notes: sanitized.notes || null,
          status: 'REQUESTED',
        },
      ]);

    if (insertError) {
      throw new Error(`Failed to submit appointment request: ${insertError.message}`);
    }

    return {
      id: `appt-${Date.now()}`,
      fullName: sanitized.fullName,
      email: sanitized.email,
      phone: sanitized.phone,
      preferredDate: sanitized.preferredDate,
      preferredTimeSlot: sanitized.preferredTimeSlot,
      occasionType: sanitized.occasionType,
      estimatedGuestCount: sanitized.estimatedGuestCount,
      notes: sanitized.notes,
      status: 'REQUESTED',
      createdAt: new Date().toISOString(),
    };
  }

  if (!isDemoMode) {
    throw new Error('Database is unconfigured and VITE_DEMO_MODE is disabled.');
  }

  const sampleAppointment: AtelierAppointment = {
    id: `appt-${Date.now()}`,
    fullName: sanitized.fullName,
    email: sanitized.email,
    phone: sanitized.phone,
    preferredDate: sanitized.preferredDate,
    preferredTimeSlot: sanitized.preferredTimeSlot,
    occasionType: sanitized.occasionType,
    estimatedGuestCount: sanitized.estimatedGuestCount,
    notes: sanitized.notes,
    status: 'REQUESTED',
    createdAt: new Date().toISOString(),
  };

  const existing = getStoredAppointments();
  saveStoredAppointments([sampleAppointment, ...existing]);

  return sampleAppointment;
}
