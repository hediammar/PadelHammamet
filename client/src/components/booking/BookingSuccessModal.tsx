import { motion, AnimatePresence } from 'framer-motion';
import { useFidelity } from '../../hooks/useFidelity';
import { useBooking } from '../../context/BookingContext';

interface BookingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingDetails: {
    court: string;
    date: string;
    time: string;
  };
  userId?: string;
}

const BookingSuccessModal = ({ isOpen, onClose, bookingDetails, userId }: BookingSuccessModalProps) => {
  const { bookings } = useBooking();
  // Get the most recent booking's userId if not provided
  const effectiveUserId = userId || bookings[bookings.length - 1]?.userId;
  const { bookingsUntilDiscount, discountProgress, totalBookings, xpEarned } = useFidelity(effectiveUserId);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-2xl p-8 max-w-md w-full border-2 border-[var(--color-padel-green)]/30 relative"
            >
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-padel-green)] to-[var(--color-electric-blue)] flex items-center justify-center glow-green"
                >
                  <svg
                    className="w-10 h-10 text-[var(--color-dark-bg)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </motion.div>
              </div>

              {/* Success Message */}
              <h2 className="text-3xl font-bold text-center mb-2 text-gradient-green">
                Booking Confirmed!
              </h2>
              <p className="text-white/60 text-center mb-6">
                Your reservation has been successfully created
              </p>

              {/* Booking Details */}
              <div className="glass rounded-xl p-4 mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Court:</span>
                  <span className="font-semibold text-white">{bookingDetails.court}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Date:</span>
                  <span className="font-semibold text-white">{bookingDetails.date}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Time:</span>
                  <span className="font-semibold text-white">{bookingDetails.time}</span>
                </div>
              </div>

              {/* XP Earned */}
              <div className="mb-6 p-4 glass rounded-xl border border-[var(--color-padel-green)]/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-sm">XP Earned</span>
                  <span className="text-lg font-bold text-gradient-green">+{xpEarned} XP</span>
                </div>
                <div className="text-xs text-white/40">
                  Total Bookings: {totalBookings}
                </div>
              </div>

              {/* Fidelity Progress */}
              {bookingsUntilDiscount > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white/80">
                      Progress to 10% Discount
                    </span>
                    <span className="text-sm font-semibold text-gradient-green">
                      {bookingsUntilDiscount} {bookingsUntilDiscount === 1 ? 'booking' : 'bookings'} to go!
                    </span>
                  </div>
                  <div className="w-full h-3 glass rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${discountProgress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] rounded-full glow-green"
                    />
                  </div>
                  <p className="text-xs text-white/50 mt-2 text-center">
                    Complete {bookingsUntilDiscount} more {bookingsUntilDiscount === 1 ? 'booking' : 'bookings'} to unlock a 10% discount!
                  </p>
                </div>
              )}

              {/* Discount Unlocked Message */}
              {bookingsUntilDiscount === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-4 glass-strong rounded-xl border-2 border-[var(--color-padel-green)]"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <svg
                      className="w-6 h-6 text-[var(--color-padel-green)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                      />
                    </svg>
                    <span className="text-lg font-bold text-gradient-green">
                      Discount Unlocked!
                    </span>
                  </div>
                  <p className="text-sm text-white/80">
                    You've earned a 10% discount on your next booking!
                  </p>
                </motion.div>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-[var(--color-dark-bg)] font-semibold hover:shadow-lg hover:shadow-[var(--color-padel-green)]/50 transition-all duration-200 glow-green"
              >
                Done
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BookingSuccessModal;

