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

export async function bookAtelierAppointment(payload: BookAppointmentPayload): Promise<AtelierAppointment> {
  if (isSupabaseConfigured && supabase) {
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

    if (error) {
      throw new Error(`Appointment request failed on database: ${error.message}`);
    }

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

  // Demo Mode: Store in localStorage
  const sampleAppointment: AtelierAppointment = {
    id: `demo-appt-${Date.now()}`,
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

  try {
    const existing = JSON.parse(localStorage.getItem('saanvya_demo_appointments') || '[]');
    existing.unshift(sampleAppointment);
    localStorage.setItem('saanvya_demo_appointments', JSON.stringify(existing));
  } catch (e) {
    console.warn('Could not persist sample appointment to localStorage', e);
  }

  return sampleAppointment;
}
