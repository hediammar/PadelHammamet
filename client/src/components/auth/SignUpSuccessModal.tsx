import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

interface SignUpSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

const SignUpSuccessModal = ({ isOpen, onClose, username }: SignUpSuccessModalProps) => {
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
              className="glass-strong rounded-2xl p-6 md:p-8 max-w-md w-full border-2 border-[var(--color-padel-green)]/30 relative"
            >
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-padel-green)] to-[var(--color-electric-blue)] flex items-center justify-center glow-green"
                >
                  <Check className="w-10 h-10 text-[var(--color-dark-bg)] stroke-[3]" />
                </motion.div>
              </div>

              {/* Success Message */}
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-gradient-green">
                Account Created!
              </h2>
              <p className="text-white/60 text-center mb-6 text-sm md:text-base">
                Welcome, <span className="font-semibold text-white">{username}</span>! Your account has been successfully created.
              </p>

              {/* Info Box */}
              <div className="glass rounded-xl p-4 mb-6 border border-[var(--color-padel-green)]/30">
                <p className="text-sm text-white/80 text-center">
                  You can now book courts and manage your reservations.
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-[var(--color-dark-bg)] font-semibold hover:shadow-lg hover:shadow-[var(--color-padel-green)]/50 transition-all duration-200 glow-green"
              >
                Get Started
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SignUpSuccessModal;

