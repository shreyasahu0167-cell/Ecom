import React, { useState } from 'react';
import { AtelierAppointment } from '../../types';
import { formatDate } from '../../utils/formatters';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Phone,
  Mail,
  Search,
  Sparkles,
} from 'lucide-react';

interface AppointmentsManagerViewProps {
  appointments: AtelierAppointment[];
  onUpdateStatus: (id: string, status: 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED') => Promise<void>;
}

export const AppointmentsManagerView: React.FC<AppointmentsManagerViewProps> = ({
  appointments,
  onUpdateStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = appointments.filter(app => {
    const matchesSearch =
      app.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.occasionType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (
    id: string,
    status: 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  ) => {
    setUpdatingId(id);
    try {
      await onUpdateStatus(id, status);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div>
          <span className="text-[10px] font-sans tracking-[0.25em] text-antique-gold uppercase font-semibold block">
            Client Concierge & VIP Calendar
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-charcoal-text mt-1">
            Private Atelier Appointments & Fittings
          </h1>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 bg-surface-container-low border border-outline-variant/40 flex flex-col md:flex-row items-stretch md:items-center gap-3 text-xs font-sans">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-charcoal-text/50 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by client name, phone, email, occasion..."
            className="w-full pl-9 pr-4 py-2.5 bg-background border border-outline-variant focus:border-antique-gold focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="p-2.5 bg-background border border-outline-variant focus:border-antique-gold focus:outline-none"
        >
          <option value="all">All Consultation Statuses</option>
          <option value="REQUESTED">Requested (Pending)</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Appointments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map(item => (
          <div
            key={item.id}
            className="p-5 bg-surface-container-low border border-outline-variant/40 space-y-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-sans font-semibold tracking-wider text-antique-gold uppercase block">
                  {item.occasionType}
                </span>
                <h3 className="font-serif text-lg text-charcoal-text mt-0.5">
                  {item.fullName}
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                <select
                  value={item.status}
                  disabled={updatingId === item.id}
                  onChange={e =>
                    handleStatusChange(
                      item.id,
                      e.target.value as 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
                    )
                  }
                  className={`text-[10px] font-semibold uppercase tracking-wider p-1.5 border ${
                    item.status === 'CONFIRMED'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : item.status === 'COMPLETED'
                      ? 'bg-blue-50 text-blue-800 border-blue-300'
                      : item.status === 'CANCELLED'
                      ? 'bg-red-50 text-red-800 border-red-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}
                >
                  <option value="REQUESTED">Requested</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Date, Time & Guests */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-surface-container border border-outline-variant/30 text-xs font-sans">
              <div className="flex items-center gap-2 text-charcoal-text">
                <Calendar className="w-3.5 h-3.5 text-antique-gold" />
                <span>{item.preferredDate}</span>
              </div>
              <div className="flex items-center gap-2 text-charcoal-text">
                <Clock className="w-3.5 h-3.5 text-antique-gold" />
                <span>{item.preferredTimeSlot}</span>
              </div>
              <div className="flex items-center gap-2 text-charcoal-text col-span-2">
                <Users className="w-3.5 h-3.5 text-antique-gold" />
                <span>Accompanied by: {item.estimatedGuestCount} guest(s)</span>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-1 text-xs font-sans text-charcoal-text/80">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-charcoal-text/50" />
                <a href={`tel:${item.phone}`} className="hover:text-antique-gold underline">
                  {item.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-charcoal-text/50" />
                <a href={`mailto:${item.email}`} className="hover:text-antique-gold underline">
                  {item.email}
                </a>
              </div>
            </div>

            {/* Client Notes */}
            {item.notes && (
              <div className="p-3 bg-background border border-outline-variant/30 text-xs font-sans text-charcoal-text/75 italic">
                "{item.notes}"
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="p-12 text-center text-charcoal-text/60 font-sans text-xs bg-surface-container-low border border-outline-variant/40">
          No atelier consultation requests found.
        </div>
      )}
    </div>
  );
};
