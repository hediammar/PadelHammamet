import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, LogOut, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  icon?: 'alert' | 'logout';
  isLoading?: boolean;
}

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  icon = 'alert',
  isLoading = false,
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  const getIconColor = () => {
    switch (type) {
      case 'danger':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      default:
        return 'text-[var(--color-padel-green)]';
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700';
      default:
        return 'bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-[var(--color-dark-bg)]';
    }
  };

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
              {/* Close Button */}
              <button
                onClick={onClose}
                disabled={isLoading}
                className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-white/80" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring' }}
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-full glass flex items-center justify-center ${getIconColor()}`}
                >
                  {icon === 'logout' ? (
                    <LogOut className="w-8 h-8 md:w-10 md:h-10" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 md:w-10 md:h-10" />
                  )}
                </motion.div>
              </div>

              {/* Title */}
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 text-gradient-green">
                {title}
              </h2>

              {/* Message */}
              <p className="text-white/60 text-center mb-6 text-sm md:text-base">
                {message}
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 rounded-xl glass hover:bg-white/10 transition-all duration-200 font-semibold text-white/80 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${getButtonColor()} ${
                    type === 'danger' || type === 'warning'
                      ? 'text-white'
                      : ''
                  } hover:shadow-lg hover:shadow-[var(--color-padel-green)]/50 glow-green disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? 'Processing...' : confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;

