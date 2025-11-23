import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooking } from '../../context/BookingContext';
import { generatePadelSlots } from '../../utils/dateHelpers';
import { formatDate } from '../../utils/dateHelpers';
import ConfirmationModal from '../common/ConfirmationModal';

interface UpcomingReservationsProps {
  userId?: string;
}

const UpcomingReservations = ({ userId }: UpcomingReservationsProps) => {
  const { getUpcomingBookings, cancelBooking } = useBooking();
  const upcomingBookings = getUpcomingBookings(userId);
  const allSlots = generatePadelSlots(8, 23);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelClick = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setCancelModalOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!bookingToCancel) return;
    
    setIsCancelling(true);
    try {
      await cancelBooking(bookingToCancel);
      setCancelModalOpen(false);
      setBookingToCancel(null);
    } catch (error) {
      console.error('Error cancelling booking:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCancelClose = () => {
    if (!isCancelling) {
      setCancelModalOpen(false);
      setBookingToCancel(null);
    }
  };

  const getSlotDisplay = (slotId: string) => {
    const slot = allSlots.find((s) => s.id === slotId);
    return slot?.display || slotId;
  };

  const getCourtName = (courtId: string) => {
    return courtId === 'court-1' ? 'Court 1' : 'Court 2';
  };

  if (upcomingBookings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass rounded-2xl p-8 text-center"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full glass-strong flex items-center justify-center">
          <svg
            className="w-8 h-8 text-white/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="text-white/60 text-lg">No reservations</p>
        <p className="text-white/40 text-sm mt-2">Book your next match to see it here!</p>
      </motion.div>
    );
  }

  // Separate upcoming and past bookings
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingBookingsList = upcomingBookings.filter((booking) => {
    const bookingDate = new Date(booking.date);
    bookingDate.setHours(0, 0, 0, 0);
    return bookingDate >= today;
  });
  
  const pastBookingsList = upcomingBookings.filter((booking) => {
    const bookingDate = new Date(booking.date);
    bookingDate.setHours(0, 0, 0, 0);
    return bookingDate < today;
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4 text-gradient-green">My Reservations</h2>
      
      {/* Upcoming Reservations */}
      {upcomingBookingsList.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-white/80">Upcoming</h3>
          <AnimatePresence>
            {upcomingBookingsList.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-xl p-6 border border-white/10 hover:border-[var(--color-padel-green)]/30 transition-all duration-200 mb-4"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Booking Details */}
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      {/* Date Badge */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--color-padel-green)] to-[var(--color-electric-blue)] flex flex-col items-center justify-center text-center">
                          <span className="text-xs font-bold text-[var(--color-dark-bg)] uppercase">
                            {new Date(booking.date).toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-2xl font-bold text-[var(--color-dark-bg)]">
                            {new Date(booking.date).getDate()}
                          </span>
                        </div>
                      </div>

                      {/* Booking Info */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {getCourtName(booking.courtId)}
                        </h3>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center space-x-2 text-white/60">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span>{formatDate(new Date(booking.date))}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-white/60">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span>{getSlotDisplay(booking.timeSlot)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cancel Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCancelClick(booking.id)}
                    className="px-6 py-3 rounded-xl glass border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all duration-200 font-semibold"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      
      {/* Past Reservations */}
      {pastBookingsList.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-3 text-white/60">Past Reservations</h3>
          <AnimatePresence>
            {pastBookingsList.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-xl p-6 border border-white/10 opacity-60 mb-4"
              >
                <div className="flex items-start space-x-4">
                  {/* Date Badge */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-600 to-gray-800 flex flex-col items-center justify-center text-center">
                      <span className="text-xs font-bold text-white uppercase">
                        {new Date(booking.date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-2xl font-bold text-white">
                        {new Date(booking.date).getDate()}
                      </span>
                    </div>
                  </div>

                  {/* Booking Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {getCourtName(booking.courtId)}
                    </h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center space-x-2 text-white/60">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>{formatDate(new Date(booking.date))}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-white/60">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>{getSlotDisplay(booking.timeSlot)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        isOpen={cancelModalOpen}
        onClose={handleCancelClose}
        onConfirm={handleCancelConfirm}
        title="Cancel Reservation"
        message="Are you sure you want to cancel this reservation? This action cannot be undone."
        confirmText="Yes, Cancel"
        cancelText="Keep Reservation"
        type="warning"
        icon="alert"
        isLoading={isCancelling}
      />
    </div>
  );
};

export default UpcomingReservations;

