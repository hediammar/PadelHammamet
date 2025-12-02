import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, User, MapPin, Phone, Mail, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';

interface ReservationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
  reservation: {
    id: string;
    court_id: string;
    date: string;
    time_slot: string;
    user_id: string;
    created_at?: string;
  } | null;
  user: {
    id: string;
    username?: string;
    name?: string;
    email?: string;
    phone_prefix?: string;
    phone_number?: string;
    picture?: string;
  } | null;
}

export function ReservationDetailModal({
  isOpen,
  onClose,
  onEdit,
  onCancel,
  reservation,
  user,
}: ReservationDetailModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !reservation) return null;

  const reservationDate = new Date(reservation.date);
  const timeSlot = reservation.time_slot; // Format: "08:00-09:30"

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', reservation.id);

      if (error) throw error;

      onCancel?.();
      onClose();
    } catch (error: any) {
      console.error('Error canceling reservation:', error);
      alert(error.message || 'Failed to cancel reservation');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-2xl p-6 md:p-8 max-w-lg w-full border-2 border-[var(--color-padel-green)]/30 relative"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 transition-colors z-10"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-white/80" />
              </button>

              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gradient-green">
                  Reservation Details
                </h2>
                <p className="text-white/60 text-sm">ID: {reservation.id}</p>
              </div>

              <div className="space-y-4">
                {/* Court */}
                <div className="flex items-center space-x-3 p-4 rounded-xl glass border border-white/10">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-padel-green)]/20 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[var(--color-padel-green)]" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Court</p>
                    <p className="text-white font-semibold">
                      {reservation.court_id === 'court-1' ? 'Court 1' : 'Court 2'}
                    </p>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center space-x-3 p-4 rounded-xl glass border border-white/10">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-padel-green)]/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-[var(--color-padel-green)]" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Date</p>
                    <p className="text-white font-semibold">
                      {format(reservationDate, 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-center space-x-3 p-4 rounded-xl glass border border-white/10">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-padel-green)]/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[var(--color-padel-green)]" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Time Slot</p>
                    <p className="text-white font-semibold">{timeSlot}</p>
                  </div>
                </div>

                {/* User Info */}
                {user && (
                  <div className="p-4 rounded-xl glass border border-white/10">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-[var(--color-padel-green)]/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-[var(--color-padel-green)]" />
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Player</p>
                        <p className="text-white font-semibold">
                          {user.username || user.name || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    {user.email && (
                      <div className="flex items-center space-x-2 mt-2 text-sm">
                        <Mail className="w-4 h-4 text-white/60" />
                        <span className="text-white/80">{user.email}</span>
                      </div>
                    )}
                    {user.phone_prefix && user.phone_number && (
                      <div className="flex items-center space-x-2 mt-2 text-sm">
                        <Phone className="w-4 h-4 text-white/60" />
                        <span className="text-white/80">
                          {user.phone_prefix}{user.phone_number}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {reservation.created_at && (
                  <div className="text-xs text-white/40 text-center pt-2">
                    Created: {format(new Date(reservation.created_at), 'MMM d, yyyy HH:mm')}
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 rounded-xl glass hover:bg-white/10 transition-colors text-white font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={onEdit}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isDeleting}
                  className="px-6 py-3 rounded-xl bg-red-500/20 border-2 border-red-500/50 text-red-400 font-semibold hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeleting ? 'Deleting...' : 'Cancel'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

