import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import CalendarTimeSlot from './CalendarTimeSlot';
import BookingSuccessModal from './BookingSuccessModal';
import LoginForm from '../auth/LoginForm';
import { generatePadelSlots, formatDateLocal } from '../../utils/dateHelpers';

const STEPS = [
  { id: 1, title: 'Select Date & Time', key: 'datetime' },
  { id: 2, title: 'Confirm', key: 'confirm' },
];

const BookingWizardAlternative = () => {
  const { selectedCourt, selectedDate, selectedSlot, createBooking, clearSelection } = useBooking();
  const { user, isAuthenticated, loginWithGoogle } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
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

  const handleGoogleClick = async () => {
    await loginWithGoogle();
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
                        alt={user.username || user.name}
                        className="w-12 h-12 rounded-full border-2 border-[var(--color-padel-green)]"
                      />
                    )}
                    <div>
                      <p className="text-white font-semibold text-lg">{user.username || user.name}</p>
                      <p className="text-white/60 text-sm">{`${user.phone_prefix}${user.phone_number}` || user.email}</p>
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
                  Please sign in to confirm your booking.
                </p>
                
                {showLoginForm ? (
                  <div className="space-y-4">
                    <LoginForm
                      onSuccess={() => {
                        setShowLoginForm(false);
                      }}
                    />
                    <div className="text-center">
                      <button
                        onClick={() => setShowLoginForm(false)}
                        className="text-sm text-white/60 hover:text-white/80 underline"
                      >
                        Or continue with Google
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowLoginForm(true)}
                      className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-white rounded-xl hover:opacity-90 transition-opacity font-medium shadow-md"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>Sign in with Username</span>
                    </button>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-white/20"></div>
                      <span className="text-white/60 text-sm">or</span>
                      <div className="flex-1 h-px bg-white/20"></div>
                    </div>
                    
                    <button
                      onClick={handleGoogleClick}
                      className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium shadow-md"
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
                  </div>
                )}
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

