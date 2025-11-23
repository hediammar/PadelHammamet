import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import CalendarTimeSlot from './CalendarTimeSlot';
import BookingSuccessModal from './BookingSuccessModal';
import { generatePadelSlots, formatDateLocal } from '../../utils/dateHelpers';
import { GoogleLogin } from '@react-oauth/google';

const STEPS = [
  { id: 1, title: 'Select Date & Time', key: 'datetime' },
  { id: 2, title: 'Confirm', key: 'confirm' },
];

const BookingWizardAlternative = () => {
  const { selectedCourt, selectedDate, selectedSlot, createBooking, clearSelection } = useBooking();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const allSlots = generatePadelSlots(8, 23);
  const selectedSlotData = selectedSlot ? allSlots.find((s) => s.id === selectedSlot) : null;

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!selectedDate && !!selectedSlot && !!selectedCourt;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    // Allow clicking on completed steps or the next step if current is valid
    if (stepId <= currentStep || (stepId === currentStep + 1 && canProceed())) {
      setCurrentStep(stepId);
    }
  };

  const handleConfirm = async () => {
    if (!isAuthenticated) {
      // User needs to sign in first
      return;
    }

    if (!selectedCourt || !selectedDate || !selectedSlot || !user) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create booking with the authenticated user ID
      await createBooking({
        courtId: selectedCourt,
        date: formatDateLocal(selectedDate),
        timeSlot: selectedSlot,
        userId: user.id,
      });
      
      // Show success modal
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Reset wizard
    clearSelection();
    setCurrentStep(1);
  };

  const { handleGoogleSuccess } = useAuth();

  const handleGoogleSuccessCallback = async (credentialResponse: any) => {
    await handleGoogleSuccess(credentialResponse);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <CalendarTimeSlot />;
      case 2:
        return (
          <div className="space-y-6">
            {/* Booking Summary */}
            <div className="glass rounded-2xl p-6 border-2 border-[var(--color-padel-green)]/30">
              <h2 className="text-2xl font-bold mb-6 text-gradient-green">
                Booking Summary
              </h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center p-4 glass-strong rounded-xl">
                  <span className="text-white/60">Court:</span>
                  <span className="font-semibold text-white">
                    {selectedCourt === 'court-1' ? 'Court 1' : selectedCourt === 'court-2' ? 'Court 2' : 'Auto-selected'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 glass-strong rounded-xl">
                  <span className="text-white/60">Date:</span>
                  <span className="font-semibold text-white">
                    {selectedDate?.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 glass-strong rounded-xl">
                  <span className="text-white/60">Time:</span>
                  <span className="font-semibold text-white">
                    {selectedSlotData?.display || selectedSlot}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Status Section */}
            {isAuthenticated && user ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6 border-2 border-[var(--color-padel-green)]/30 bg-gradient-to-r from-[var(--color-padel-green)]/10 to-[var(--color-electric-blue)]/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    {user.picture && (
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="w-12 h-12 rounded-full border-2 border-[var(--color-padel-green)]"
                      />
                    )}
                    <div>
                      <p className="text-white font-semibold text-lg">{user.name}</p>
                      <p className="text-white/60 text-sm">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-[var(--color-padel-green)]/20 border border-[var(--color-padel-green)]/50">
                    <svg
                      className="w-5 h-5 text-[var(--color-padel-green)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm font-semibold text-[var(--color-padel-green)]">
                      Connected
                    </span>
                  </div>
                </div>
                <p className="text-white/80 text-sm">
                  Your account is connected. Ready to confirm your booking!
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6 border-2 border-[var(--color-padel-green)]/30"
              >
                <h3 className="text-xl font-bold mb-4 text-gradient-green">
                  Sign in to Complete Booking
                </h3>
                <p className="text-white/60 mb-6">
                  Please sign in with your Google account to confirm your booking.
                </p>
                
                <div className="flex flex-col items-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccessCallback}
                    onError={(error) => {
                      // Handle One Tap specific errors
                      if (error.error === 'popup_closed_by_user') {
                        // User closed the popup, no need to show error
                        return;
                      }
                      
                      // One Tap initialization errors - these can happen if origin isn't configured
                      if (
                        error.error === 'idpiframe_initialization_failed' ||
                        error.type === 'idpiframe_initialization_failed' ||
                        error.error === 'access_denied'
                      ) {
                        console.warn(
                          'One Tap initialization failed. This usually means:\n' +
                          '1. The origin (http://localhost:5173) needs to be added to Google Cloud Console\n' +
                          '2. Wait a few minutes after adding the origin\n' +
                          '3. Clear browser cache\n\n' +
                          'The regular sign-in button will still work.'
                        );
                        // Don't show alert for One Tap errors - they're expected during setup
                        return;
                      }
                      
                      console.error('Google login error:', error);
                      // Only show alert for unexpected errors
                      if (error.error !== 'popup_blocked') {
                        alert(
                          'Failed to sign in with Google.\n\n' +
                          'Please check:\n' +
                          '1. Your origin is authorized in Google Cloud Console\n' +
                          '2. The Client ID is correctly configured\n' +
                          '3. See GOOGLE_OAUTH_SETUP.md for setup instructions'
                        );
                      }
                    }}
                    useOneTap={true}
                    theme="filled_blue"
                    size="large"
                    text="signin_with"
                    shape="rectangular"
                  />
                  {authLoading && (
                    <p className="mt-4 text-sm text-white/60">Signing in...</p>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {/* Step Indicator */}
      <div className="mb-4 md:mb-8">
        {/* Desktop Step Indicator */}
        <div className="hidden md:flex items-center justify-between mb-4">
          {STEPS.map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const isClickable = isCompleted || (currentStep === step.id - 1 && canProceed());

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <button
                    onClick={() => isClickable && handleStepClick(step.id)}
                    disabled={!isClickable}
                    className={`
                      relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200
                      ${isCurrent
                        ? 'bg-gradient-to-br from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-[var(--color-dark-bg)] glow-green scale-110'
                        : isCompleted
                        ? 'bg-[var(--color-padel-green)] text-[var(--color-dark-bg)]'
                        : 'glass text-white/40'
                      }
                      ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}
                    `}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-6 h-6"
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
                    ) : (
                      step.id
                    )}
                  </button>
                  <span
                    className={`
                      mt-2 text-xs font-medium text-center
                      ${isCurrent ? 'text-gradient-green' : isCompleted ? 'text-white' : 'text-white/40'}
                    `}
                  >
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`
                      flex-1 h-1 mx-2 transition-all duration-300
                      ${isCompleted
                        ? 'bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)]'
                        : 'glass'
                      }
                    `}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Step Indicator */}
        <div className="md:hidden flex items-center justify-between mb-2 px-1">
          {STEPS.map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`
                      relative w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] transition-all duration-200
                      ${isCurrent
                        ? 'bg-gradient-to-br from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-[var(--color-dark-bg)] glow-green'
                        : isCompleted
                        ? 'bg-[var(--color-padel-green)] text-[var(--color-dark-bg)]'
                        : 'glass text-white/40'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-4 h-4"
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
                    ) : (
                      step.id
                    )}
                  </div>
                  <span
                    className={`
                      mt-0.5 text-[9px] font-medium text-center leading-tight
                      ${isCurrent ? 'text-gradient-green' : isCompleted ? 'text-white' : 'text-white/40'}
                    `}
                  >
                    {step.title.split(' ')[0]}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`
                      flex-1 h-0.5 mx-0.5 transition-all duration-300
                      ${isCompleted
                        ? 'bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)]'
                        : 'glass'
                      }
                    `}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Current Step Title (Mobile) */}
        <div className="md:hidden text-center mb-2">
          <h2 className="text-base font-semibold text-gradient-green">
            {STEPS.find((s) => s.id === currentStep)?.title}
          </h2>
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -50, scale: 0.95 }}
          transition={{ 
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-3 md:mt-8 gap-2">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className={`
            px-4 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base font-semibold transition-all duration-200
            ${currentStep === 1
              ? 'glass opacity-40 cursor-not-allowed'
              : 'glass hover:bg-white/10 cursor-pointer'
            }
          `}
        >
          <span className="flex items-center space-x-1 md:space-x-2">
            <svg
              className="w-4 h-4 md:w-5 md:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Back</span>
          </span>
        </button>

        {currentStep < STEPS.length ? (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`
              px-5 py-2 md:px-8 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base font-semibold transition-all duration-200 flex items-center space-x-1 md:space-x-2
              ${canProceed()
                ? 'bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-[var(--color-dark-bg)] hover:shadow-lg hover:shadow-[var(--color-padel-green)]/50 glow-green'
                : 'glass opacity-40 cursor-not-allowed'
              }
            `}
          >
            <span>Next</span>
            <svg
              className="w-4 h-4 md:w-5 md:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        ) : (
          <button
            onClick={handleConfirm}
            disabled={!isAuthenticated || isSubmitting || !canProceed()}
            className={`
              px-5 py-2 md:px-8 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base font-semibold transition-all duration-200
              ${isAuthenticated && !isSubmitting && canProceed()
                ? 'bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-[var(--color-dark-bg)] hover:shadow-lg hover:shadow-[var(--color-padel-green)]/50 glow-green'
                : 'glass opacity-40 cursor-not-allowed'
              }
            `}
          >
            {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
          </button>
        )}
      </div>

      {/* Success Modal */}
      {selectedCourt && selectedDate && selectedSlotData && (
        <BookingSuccessModal
          isOpen={showSuccessModal}
          onClose={handleSuccessModalClose}
          userId={user?.id}
          bookingDetails={{
            court: selectedCourt === 'court-1' ? 'Court 1' : 'Court 2',
            date: selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            time: selectedSlotData.display,
          }}
        />
      )}
    </div>
  );
};

export default BookingWizardAlternative;

