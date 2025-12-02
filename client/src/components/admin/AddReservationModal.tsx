import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, User, MapPin, Check, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDateLocal, generatePadelSlots } from '../../utils/dateHelpers';
import { format } from 'date-fns';

interface AddReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedDate?: Date;
  reservations?: any[];
  editReservation?: {
    id: string;
    court_id: string;
    date: string;
    time_slot: string;
    user_id: string;
  } | null;
}

export function AddReservationModal({
  isOpen,
  onClose,
  onSuccess,
  selectedDate,
  reservations = [],
  editReservation = null,
}: AddReservationModalProps) {
  const isEditMode = !!editReservation;
  const [step, setStep] = useState<'date' | 'time' | 'player'>('date');
  const [date, setDate] = useState(
    editReservation?.date || (selectedDate ? formatDateLocal(selectedDate) : formatDateLocal(new Date()))
  );
  const [timeSlot, setTimeSlot] = useState(editReservation?.time_slot || '');
  const [courtId, setCourtId] = useState(editReservation?.court_id || '');
  const [userId, setUserId] = useState(editReservation?.user_id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchingUsers, setSearchingUsers] = useState(false);

  const timeSlots = generatePadelSlots(8, 23);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (editReservation) {
        // Edit mode: pre-fill with existing reservation data
        setDate(editReservation.date);
        setTimeSlot(editReservation.time_slot);
        setCourtId(editReservation.court_id);
        setUserId(editReservation.user_id);
        setStep('player'); // Start at player step since date/time are already set
        // Fetch user info for search term
        supabase
          .from('users')
          .select('username, name, email')
          .eq('id', editReservation.user_id)
          .maybeSingle()
          .then(({ data }) => {
            if (data) {
              setSearchTerm(data.username || data.name || data.email || '');
            }
          });
      } else if (selectedDate) {
        setDate(formatDateLocal(selectedDate));
        setStep('time');
      } else {
        setDate(formatDateLocal(new Date()));
        setStep('date');
      }
      if (!editReservation) {
        setTimeSlot('');
        setCourtId('');
        setUserId('');
        setSearchTerm('');
      }
      setUsers([]);
    }
  }, [isOpen, selectedDate, editReservation]);

  // Get available time slots for selected date
  const availableSlots = useMemo(() => {
    if (!date) return [];

    return timeSlots.map((slot) => {
      // In edit mode, exclude the current reservation from availability check
      const court1Taken = reservations.some(
        (r) =>
          r.id !== editReservation?.id &&
          r.date === date &&
          r.time_slot === slot.id &&
          r.court_id === 'court-1'
      );
      const court2Taken = reservations.some(
        (r) =>
          r.id !== editReservation?.id &&
          r.date === date &&
          r.time_slot === slot.id &&
          r.court_id === 'court-2'
      );

      // In edit mode, if this is the current slot, it's available
      const isCurrentSlot = editReservation && slot.id === editReservation.time_slot;
      const available = isCurrentSlot || !court1Taken || !court2Taken;
      const availableCourt = !court1Taken ? 'court-1' : 'court-2';

      return {
        ...slot,
        available,
        court1Taken,
        court2Taken,
        availableCourt,
      };
    });
  }, [date, reservations, timeSlots, editReservation]);

  // Auto-select court when time slot is selected
  useEffect(() => {
    if (timeSlot && date) {
      const slot = availableSlots.find((s) => s.id === timeSlot);
      if (slot && slot.available) {
        setCourtId(slot.availableCourt);
      }
    }
  }, [timeSlot, date, availableSlots]);

  const searchUsers = async (term: string) => {
    if (term.length < 2) {
      setUsers([]);
      return;
    }

    setSearchingUsers(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, name, email')
        .or(`username.ilike.%${term}%,name.ilike.%${term}%,email.ilike.%${term}%`)
        .limit(10);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleDateSelect = () => {
    if (date) {
      setStep('time');
    }
  };

  const handleTimeSelect = (slotId: string) => {
    const slot = availableSlots.find((s) => s.id === slotId);
    if (slot && slot.available) {
      setTimeSlot(slotId);
      setCourtId(slot.availableCourt);
      setStep('player');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !timeSlot || !courtId) {
      return;
    }

    setLoading(true);
    try {
      if (isEditMode && editReservation) {
        // Update existing reservation
        const { error } = await supabase
          .from('reservations')
          .update({
            court_id: courtId,
            date: date,
            time_slot: timeSlot,
            user_id: userId,
          })
          .eq('id', editReservation.id);

        if (error) throw error;
      } else {
        // Create new reservation
        const reservationId = `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const { error } = await supabase.from('reservations').insert({
          id: reservationId,
          court_id: courtId,
          date: date,
          time_slot: timeSlot,
          user_id: userId,
        });

        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} reservation:`, error);
      alert(error.message || `Failed to ${isEditMode ? 'update' : 'create'} reservation`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedUser = users.find((u) => u.id === userId) || 
    (userId && searchTerm ? { username: searchTerm, name: searchTerm } : null);

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
              className="glass-strong rounded-3xl p-6 md:p-8 max-w-2xl w-full border-2 border-[var(--color-padel-green)]/30 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 transition-colors z-10"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-white/80" />
              </button>

              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gradient-green">
                  {isEditMode ? 'Edit Reservation' : 'New Reservation'}
                </h2>
                {isEditMode && (
                  <p className="text-white/60 text-sm mt-1">
                    Update the reservation details below
                  </p>
                )}
                <div className="flex items-center space-x-2 mt-4">
                  <div
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                      step === 'date'
                        ? 'bg-[var(--color-padel-green)]/20 text-[var(--color-padel-green)] border border-[var(--color-padel-green)]/50'
                        : 'bg-white/5 text-white/60'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>1. Date</span>
                  </div>
                  <div className="w-8 h-0.5 bg-white/10"></div>
                  <div
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                      step === 'time'
                        ? 'bg-[var(--color-padel-green)]/20 text-[var(--color-padel-green)] border border-[var(--color-padel-green)]/50'
                        : step === 'player'
                        ? 'bg-white/10 text-white/80'
                        : 'bg-white/5 text-white/60'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>2. Time</span>
                  </div>
                  <div className="w-8 h-0.5 bg-white/10"></div>
                  <div
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                      step === 'player'
                        ? 'bg-[var(--color-padel-green)]/20 text-[var(--color-padel-green)] border border-[var(--color-padel-green)]/50'
                        : 'bg-white/5 text-white/60'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>3. Player</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Date Selection */}
                {step === 'date' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-3">
                        Select Date
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        min={formatDateLocal(new Date())}
                        className="w-full px-4 py-4 rounded-xl glass border-2 border-white/10 focus:border-[var(--color-padel-green)] focus:outline-none focus:ring-2 focus:ring-[var(--color-padel-green)]/20 text-white text-lg"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleDateSelect}
                      disabled={!date}
                      className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                    >
                      Continue to Time Selection
                    </button>
                  </motion.div>
                )}

                {/* Step 2: Time Selection */}
                {step === 'time' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">
                          Select Time Slot
                        </label>
                        <p className="text-white/60 text-sm">
                          {date && format(new Date(date + 'T00:00'), 'EEEE, MMMM d, yyyy')}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep('date')}
                        className="text-white/60 hover:text-white text-sm"
                      >
                        Change Date
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => handleTimeSelect(slot.id)}
                          disabled={!slot.available}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            timeSlot === slot.id
                              ? 'border-[var(--color-padel-green)] bg-[var(--color-padel-green)]/20'
                              : slot.available
                              ? 'border-white/10 glass hover:border-[var(--color-padel-green)]/50 hover:bg-white/5'
                              : 'border-white/5 bg-white/5 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Clock className="w-4 h-4 text-white/60" />
                            {timeSlot === slot.id && (
                              <Check className="w-4 h-4 text-[var(--color-padel-green)]" />
                            )}
                          </div>
                          <p className="text-white font-semibold text-sm">{slot.display}</p>
                          {slot.available && (
                            <p className="text-white/60 text-xs mt-1">
                              {slot.availableCourt === 'court-1' ? 'Court 1' : 'Court 2'} available
                            </p>
                          )}
                          {!slot.available && (
                            <p className="text-white/40 text-xs mt-1">Unavailable</p>
                          )}
                        </button>
                      ))}
                    </div>

                    {timeSlot && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl bg-[var(--color-padel-green)]/20 border border-[var(--color-padel-green)]/50"
                      >
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-5 h-5 text-[var(--color-padel-green)]" />
                          <div>
                            <p className="text-white font-semibold">
                              {courtId === 'court-1' ? 'Court 1' : 'Court 2'} selected
                            </p>
                            <p className="text-white/60 text-sm">
                              {availableSlots.find((s) => s.id === timeSlot)?.display}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setStep('date')}
                        className="flex-1 px-6 py-3 rounded-xl glass hover:bg-white/10 transition-colors text-white font-semibold"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => timeSlot && setStep('player')}
                        disabled={!timeSlot}
                        className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Continue to Player
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Player Selection */}
                {step === 'player' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-white/80">
                          Select Player
                        </label>
                        <button
                          type="button"
                          onClick={() => setStep('time')}
                          className="text-white/60 hover:text-white text-sm"
                        >
                          Change Time
                        </button>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-white/60 text-xs mb-1">Selected:</p>
                        <p className="text-white font-semibold">
                          {date && format(new Date(date + 'T00:00'), 'MMM d')} •{' '}
                          {availableSlots.find((s) => s.id === timeSlot)?.display} •{' '}
                          {courtId === 'court-1' ? 'Court 1' : 'Court 2'}
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="text"
                        placeholder="Search by username, name, or email..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          searchUsers(e.target.value);
                        }}
                        className="w-full pl-12 pr-4 py-4 rounded-xl glass border-2 border-white/10 focus:border-[var(--color-padel-green)] focus:outline-none focus:ring-2 focus:ring-[var(--color-padel-green)]/20 text-white placeholder-white/40"
                      />
                      {searchingUsers && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 text-sm">
                          Searching...
                        </div>
                      )}
                    </div>

                    {/* User Results */}
                    {users.length > 0 && (
                      <div className="max-h-64 overflow-y-auto rounded-xl glass border border-white/10 space-y-2 p-2">
                        {users.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => {
                              setUserId(user.id);
                              setSearchTerm(user.username || user.name || user.email);
                              setUsers([]);
                            }}
                            className={`w-full px-4 py-3 text-left rounded-lg transition-colors ${
                              userId === user.id
                                ? 'bg-[var(--color-padel-green)]/20 border-2 border-[var(--color-padel-green)]'
                                : 'hover:bg-white/10 border-2 border-transparent'
                            }`}
                          >
                            <p className="text-white font-medium">
                              {user.username || user.name}
                            </p>
                            {user.email && (
                              <p className="text-white/60 text-sm">{user.email}</p>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {selectedUser && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl bg-[var(--color-padel-green)]/20 border border-[var(--color-padel-green)]/50"
                      >
                        <div className="flex items-center space-x-3">
                          <User className="w-5 h-5 text-[var(--color-padel-green)]" />
                          <div>
                            <p className="text-white font-semibold">
                              {selectedUser.username || selectedUser.name}
                            </p>
                            {selectedUser.email && (
                              <p className="text-white/60 text-sm">{selectedUser.email}</p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setStep('time')}
                        className="flex-1 px-6 py-3 rounded-xl glass hover:bg-white/10 transition-colors text-white font-semibold"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading || !userId || !timeSlot}
                        className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading 
                      ? (isEditMode ? 'Updating...' : 'Creating...') 
                      : (isEditMode ? 'Update Reservation' : 'Create Reservation')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
