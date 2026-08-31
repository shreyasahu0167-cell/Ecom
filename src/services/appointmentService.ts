import { AtelierAppointment } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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

const SEED_APPOINTMENTS: AtelierAppointment[] = [
  {
    id: 'appt-seed-001',
    fullName: 'Meera Singhania',
    email: 'meera.s@example.com',
    phone: '+91 98200 77112',
    preferredDate: '2026-09-08',
    preferredTimeSlot: '2:00 PM – 3:30 PM',
    occasionType: 'Bridal Consultation',
    estimatedGuestCount: 3,
    notes: 'Looking for a custom champagne & antique gold lehenga for December wedding in Udaipur.',
    status: 'CONFIRMED',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'appt-seed-002',
    fullName: 'Ayesha Kapoor',
    email: 'ayesha.k@example.com',
    phone: '+91 98199 44332',
    preferredDate: '2026-09-12',
    preferredTimeSlot: '11:00 AM – 12:30 PM',
    occasionType: 'Trousseau Planning',
    estimatedGuestCount: 2,
    notes: 'Interested in tissue silk Kanjivaram and Chanderi pret sets for sangeet & mehendi.',
    status: 'REQUESTED',
    createdAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
  },
];

function getStoredAppointments(): AtelierAppointment[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_APPOINTMENTS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_APPOINTMENTS_KEY, JSON.stringify(SEED_APPOINTMENTS));
      return SEED_APPOINTMENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(LOCAL_STORAGE_APPOINTMENTS_KEY, JSON.stringify(SEED_APPOINTMENTS));
    return SEED_APPOINTMENTS;
  } catch {
    return SEED_APPOINTMENTS;
  }
}

function saveStoredAppointments(appts: AtelierAppointment[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_APPOINTMENTS_KEY, JSON.stringify(appts));
  } catch (e) {
    console.error('Failed to persist appointments', e);
  }
}

export async function fetchAllAppointments(): Promise<AtelierAppointment[]> {
  if (isSupabaseConfigured && supabase) {
    const { data: appts, error } = await supabase
      .from('atelier_appointments')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && appts && appts.length > 0) {
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
  }

  return getStoredAppointments();
}

export async function updateAppointmentStatus(
  id: string,
  status: 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    await supabase.from('atelier_appointments').update({ status }).eq('id', id);
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

export async function bookAtelierAppointment(payload: BookAppointmentPayload): Promise<AtelierAppointment> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('atelier_appointments')
        .insert([
          {
            full_name: payload.fullName,
            email: payload.email,
            phone: payload.phone,
            preferred_date: payload.preferredDate,
            preferred_time_slot: payload.preferredTimeSlot,
            occasion_type: payload.occasionType,
            guest_count: payload.estimatedGuestCount,
            notes: payload.notes || null,
            status: 'REQUESTED',
          },
        ])
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          fullName: data.full_name,
          email: data.email,
          phone: data.phone,
          preferredDate: data.preferred_date,
          preferredTimeSlot: data.preferred_time_slot,
          occasionType: data.occasion_type,
          estimatedGuestCount: data.guest_count,
          notes: data.notes,
          status: data.status,
          createdAt: data.created_at,
        };
      }
    } catch (err) {
      console.warn('Supabase booking failed, storing locally:', err);
    }
  }

  const sampleAppointment: AtelierAppointment = {
    id: `appt-${Date.now()}`,
    fullName: payload.fullName,
    email: payload.email,
    phone: payload.phone,
    preferredDate: payload.preferredDate,
    preferredTimeSlot: payload.preferredTimeSlot,
    occasionType: payload.occasionType,
    estimatedGuestCount: payload.estimatedGuestCount,
    notes: payload.notes,
    status: 'REQUESTED',
    createdAt: new Date().toISOString(),
  };

  const existing = getStoredAppointments();
  saveStoredAppointments([sampleAppointment, ...existing]);

  return sampleAppointment;
}
