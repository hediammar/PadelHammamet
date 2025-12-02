import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import SignUpForm from './SignUpForm';
import LoginForm from './LoginForm';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignInModal = ({ isOpen, onClose }: SignInModalProps) => {
  const { loginWithGoogle, isLoading, isAuthenticated } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Close modal when user successfully authenticates
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      // Small delay to show success state
      setTimeout(() => {
        onClose();
      }, 500);
    }
  }, [isAuthenticated, isOpen, onClose]);

  const handleGoogleClick = async () => {
    await loginWithGoogle();
    // Modal will close via useEffect when user is authenticated
  };

  const handleSuccess = () => {
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-md w-full border-2 border-[var(--color-padel-green)]/30 relative max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 rounded-xl hover:bg-white/10 transition-colors z-10"
                aria-label="Close"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-white/80" />
              </button>

              {/* Content */}
              <div className="flex flex-col items-center">
                {/* Logo/Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring' }}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-[var(--color-padel-green)] to-[var(--color-electric-blue)] flex items-center justify-center glow-green mb-4 sm:mb-6"
                >
                  <span className="text-[var(--color-dark-bg)] font-bold text-xl sm:text-2xl">P</span>
                </motion.div>

                {/* Title */}
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gradient-green text-center">
                  {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-white/60 text-center mb-6 sm:mb-8 text-sm sm:text-base px-2">
                  {mode === 'login'
                    ? 'Sign in to book courts and manage your reservations'
                    : 'Sign up to start booking padel courts'}
                </p>

                {/* Forms */}
                {mode === 'login' ? (
                  <LoginForm
                    onSuccess={handleSuccess}
                    onSwitchToSignup={() => setMode('signup')}
                  />
                ) : (
                  <SignUpForm
                    onSuccess={handleSuccess}
                    onSwitchToLogin={() => setMode('login')}
                  />
                )}

                {/* Divider */}
                <div className="flex items-center w-full gap-3 sm:gap-4 my-4 sm:my-6">
                  <div className="flex-1 h-px bg-white/20"></div>
                  <span className="text-white/60 text-xs sm:text-sm">or</span>
                  <div className="flex-1 h-px bg-white/20"></div>
                </div>

                {/* Google Sign In Button */}
                <button
                  onClick={handleGoogleClick}
                  className="w-full flex items-center justify-center gap-3 px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base shadow-md"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Additional Info */}
                <p className="mt-4 sm:mt-6 text-xs text-white/40 text-center px-2">
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

