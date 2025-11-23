import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooking } from '../../context/BookingContext';
import Calendar from './Calendar';
import SlotPicker from './SlotPicker';
import GuestRegistrationForm from './GuestRegistrationForm';
import BookingSuccessModal from './BookingSuccessModal';
import { generatePadelSlots, formatDateLocal } from '../../utils/dateHelpers';

const STEPS = [
  { id: 1, title: 'Choose Date', key: 'date' },
  { id: 2, title: 'Pick Time Slot', key: 'slot' },
  { id: 3, title: 'Confirm', key: 'confirm' },
];

const BookingWizard = () => {
  const { selectedCourt, selectedDate, selectedSlot, createBooking, clearSelection, createGuestUser } = useBooking();
  const [currentStep, setCurrentStep] = useState(1);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const allSlots = generatePadelSlots(8, 23);
  const selectedSlotData = selectedSlot ? allSlots.find((s) => s.id === selectedSlot) : null;

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!selectedDate;
      case 2:
        return !!selectedSlot && !!selectedCourt;
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

  const handleConfirm = () => {
    // Show registration form instead of immediately confirming
    if (selectedCourt && selectedDate && selectedSlot) {
      setShowRegistrationForm(true);
    }
  };

  const handleRegistrationSubmit = async (formData: { name: string; email: string; phone: string }) => {
    setIsSubmitting(true);
    
    try {
      // Create guest user account
      const userId = await createGuestUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });
      
      setCurrentUserId(userId);
      
      // Create booking with the new user ID
      await createBooking({
        courtId: selectedCourt!,
        date: formatDateLocal(selectedDate!),
        timeSlot: selectedSlot!,
        userId,
      });
      
      // Show success modal
      setShowRegistrationForm(false);
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
    setCurrentUserId(null);
  };

  const renderStepContent = () => {
    // Show registration form if user clicked confirm
    if (showRegistrationForm) {
      return (
        <GuestRegistrationForm
          onSubmit={handleRegistrationSubmit}
          isLoading={isSubmitting}
        />
      );
    }

    switch (currentStep) {
      case 1:
        return <Calendar />;
      case 2:
        return <SlotPicker />;
      case 3:
        return (
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
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {/* Step Indicator */}
      <div className="mb-8">
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
        <div className="md:hidden flex items-center justify-between mb-4 px-2">
          {STEPS.map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`
                      relative w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200
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
                        className="w-5 h-5"
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
                      mt-1 text-[10px] font-medium text-center leading-tight
                      ${isCurrent ? 'text-gradient-green' : isCompleted ? 'text-white' : 'text-white/40'}
                    `}
                  >
                    {step.title.split(' ')[0]}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`
                      flex-1 h-0.5 mx-1 transition-all duration-300
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
        <div className="md:hidden text-center mb-4">
          <h2 className="text-lg font-semibold text-gradient-green">
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
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className={`
            px-6 py-3 rounded-xl font-semibold transition-all duration-200
            ${currentStep === 1
              ? 'glass opacity-40 cursor-not-allowed'
              : 'glass hover:bg-white/10 cursor-pointer'
            }
          `}
        >
          <span className="flex items-center space-x-2">
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Back</span>
          </span>
        </button>

        {showRegistrationForm ? (
          <button
            onClick={() => setShowRegistrationForm(false)}
            className="px-6 py-3 rounded-xl glass hover:bg-white/10 cursor-pointer transition-all duration-200"
          >
            <span className="flex items-center space-x-2">
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>Back</span>
            </span>
          </button>
        ) : currentStep < STEPS.length ? (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`
              px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2
              ${canProceed()
                ? 'bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-[var(--color-dark-bg)] hover:shadow-lg hover:shadow-[var(--color-padel-green)]/50 glow-green'
                : 'glass opacity-40 cursor-not-allowed'
              }
            `}
          >
            <span>Next</span>
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        ) : (
          <button
            onClick={handleConfirm}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-[var(--color-dark-bg)] font-semibold hover:shadow-lg hover:shadow-[var(--color-padel-green)]/50 transition-all duration-200 glow-green"
          >
            Confirm Booking
          </button>
        )}
      </div>

      {/* Success Modal */}
      {selectedCourt && selectedDate && selectedSlotData && (
        <BookingSuccessModal
          isOpen={showSuccessModal}
          onClose={handleSuccessModalClose}
          userId={currentUserId || undefined}
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

export default BookingWizard;

