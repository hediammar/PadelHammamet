import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { X } from 'lucide-react';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignInModal = ({ isOpen, onClose }: SignInModalProps) => {
  const { handleGoogleSuccess, isLoading } = useAuth();

  const handleGoogleSuccessCallback = async (credentialResponse: any) => {
    await handleGoogleSuccess(credentialResponse);
    // Close modal after successful sign in
    onClose();
  };

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
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-white/80" />
              </button>

              {/* Content */}
              <div className="flex flex-col items-center">
                {/* Logo/Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring' }}
                  className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--color-padel-green)] to-[var(--color-electric-blue)] flex items-center justify-center glow-green mb-6"
                >
                  <span className="text-[var(--color-dark-bg)] font-bold text-2xl">P</span>
                </motion.div>

                {/* Title */}
                <h2 className="text-3xl font-bold mb-2 text-gradient-green text-center">
                  Welcome to Padel Hammamet
                </h2>
                <p className="text-white/60 text-center mb-8">
                  Sign in to book courts and manage your reservations
                </p>

                {/* Google Sign In */}
                <div className="flex flex-col items-center w-full">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccessCallback}
                    onError={() => {
                      // Error handling - Google OAuth onError doesn't provide error details
                      console.error('Google login error occurred');
                    }}
                    useOneTap={true}
                    theme="filled_blue"
                    size="large"
                    text="signin_with"
                    shape="rectangular"
                  />
                  {isLoading && (
                    <p className="mt-4 text-sm text-white/60">Signing in...</p>
                  )}
                </div>

                {/* Additional Info */}
                <p className="mt-6 text-xs text-white/40 text-center">
                  By signing in, you agree to our terms of service and privacy policy
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SignInModal;

