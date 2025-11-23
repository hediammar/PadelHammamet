import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooking } from '../../context/BookingContext';
import { isSameDay, addDays, generatePadelSlots, formatDateLocal } from '../../utils/dateHelpers';

const CalendarTimeSlot = () => {
  const { selectedDate, selectedSlot, selectedCourt, setSelectedDate, setSelectedSlot, setSelectedCourt, isSlotTaken } = useBooking();
  
  // Get today's date at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Initialize with today's date if no date is selected
  useEffect(() => {
    if (!selectedDate) {
      const todayCopy = new Date();
      todayCopy.setHours(0, 0, 0, 0);
      setSelectedDate(todayCopy);
    }
  }, [selectedDate, setSelectedDate]);

  const allSlots = generatePadelSlots(8, 23);
  const currentSelectedDate = selectedDate || today;
  const dateString = formatDateLocal(currentSelectedDate);

  const handlePreviousDay = () => {
    if (selectedDate) {
      const previousDay = addDays(selectedDate, -1);
      // Don't allow going to past dates
      if (previousDay >= today) {
        previousDay.setHours(0, 0, 0, 0);
        setSelectedDate(previousDay);
        // Clear selected slot when changing date
        setSelectedSlot(null);
        setSelectedCourt(null);
      }
    }
  };

  const handleNextDay = () => {
    if (selectedDate) {
      const nextDay = addDays(selectedDate, 1);
      // Limit to 30 days in advance
      const maxDate = addDays(today, 30);
      if (nextDay <= maxDate) {
        nextDay.setHours(0, 0, 0, 0);
        setSelectedDate(nextDay);
        // Clear selected slot when changing date
        setSelectedSlot(null);
        setSelectedCourt(null);
      }
    }
  };

  const canGoPrevious = selectedDate && selectedDate > today;
  const canGoNext = selectedDate && selectedDate < addDays(today, 30);
  const isTodayDate = selectedDate && isSameDay(selectedDate, today);

  // Check availability for a slot across both courts
  const getSlotAvailability = (slotId: string) => {
    const court1Available = !isSlotTaken('court-1', dateString, slotId);
    const court2Available = !isSlotTaken('court-2', dateString, slotId);
    
    return {
      court1Available,
      court2Available,
      isAvailable: court1Available || court2Available,
      availableCourts: [
        court1Available && 'court-1',
        court2Available && 'court-2',
      ].filter(Boolean) as string[],
    };
  };

  const handleSlotClick = (slotId: string) => {
    const slot = allSlots.find((s) => s.id === slotId);
    if (!slot) return;

    const availability = getSlotAvailability(slotId);
    
    // Don't allow selection if slot is taken on both courts
    if (!availability.isAvailable) {
      return;
    }

    // Auto-select the first available court (prefer court-1)
    if (selectedSlot !== slotId) {
      setSelectedSlot(slotId);
      // Automatically select the first available court
      const autoCourt = availability.court1Available ? 'court-1' : 'court-2';
      setSelectedCourt(autoCourt);
    } else {
      setSelectedSlot(null);
      setSelectedCourt(null);
    }
  };

  return (
    <div className="glass rounded-2xl p-3 md:p-6">
      <h2 className="text-lg md:text-2xl font-bold mb-3 md:mb-6 text-gradient-green">Select Date & Time</h2>
      
      {/* Date Navigation Section */}
      <div className="mb-4 md:mb-8">
        <div className="flex items-center justify-between mb-3 md:mb-6">
          <button
            onClick={handlePreviousDay}
            disabled={!canGoPrevious}
            className={`
              p-2 md:p-3 rounded-xl transition-all duration-200
              ${canGoPrevious
                ? 'glass hover:bg-white/10 cursor-pointer'
                : 'glass opacity-40 cursor-not-allowed'
              }
            `}
          >
            <svg
              className="w-5 h-5 md:w-6 md:h-6 text-white"
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
          </button>

          <motion.div
            key={dateString}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 text-center px-2"
          >
            <h3 className="text-base md:text-2xl font-bold text-gradient-green mb-1 md:mb-2 leading-tight">
              {selectedDate?.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </h3>
            {isTodayDate && (
              <span className="inline-block px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-[var(--color-padel-green)]/20 text-[var(--color-padel-green)] text-xs md:text-sm font-semibold">
                Today
              </span>
            )}
          </motion.div>

          <button
            onClick={handleNextDay}
            disabled={!canGoNext}
            className={`
              p-2 md:p-3 rounded-xl transition-all duration-200
              ${canGoNext
                ? 'glass hover:bg-white/10 cursor-pointer'
                : 'glass opacity-40 cursor-not-allowed'
              }
            `}
          >
            <svg
              className="w-5 h-5 md:w-6 md:h-6 text-white"
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
        </div>
      </div>

      {/* Time Slots Section */}
      {selectedDate && (
        <motion.div
          key={dateString}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-sm md:text-lg font-semibold mb-2 md:mb-4 text-white/80">
            Available Time Slots
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 max-h-[280px] md:max-h-none overflow-y-auto md:overflow-visible">
            <AnimatePresence>
              {allSlots.map((slot, index) => {
                const availability = getSlotAvailability(slot.id);
                const isSelected = selectedSlot === slot.id;
                const isAvailable = availability.isAvailable;

                return (
                  <motion.button
                    key={slot.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{
                      duration: 0.2,
                      delay: index * 0.02,
                      layout: { duration: 0.3 }
                    }}
                    onClick={() => handleSlotClick(slot.id)}
                    disabled={!isAvailable}
                    whileHover={isAvailable && !isSelected ? { scale: 1.05, y: -2 } : {}}
                    whileTap={isAvailable ? { scale: 0.95 } : {}}
                    className={`
                      relative p-2 md:p-4 rounded-lg md:rounded-xl text-center transition-all duration-200
                      ${isSelected
                        ? 'bg-gradient-to-br from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-[var(--color-dark-bg)] font-semibold glow-green shadow-lg shadow-[var(--color-padel-green)]/50 ring-2 ring-[var(--color-padel-green)]'
                        : !isAvailable
                        ? 'glass opacity-40 cursor-not-allowed bg-white/5'
                        : 'glass hover:bg-white/10 cursor-pointer border border-white/10 hover:border-white/20'
                      }
                    `}
                  >
                    <motion.div
                      layout
                      className={`text-xs md:text-sm font-medium ${isSelected ? 'text-[var(--color-dark-bg)]' : 'text-white'}`}
                    >
                      {slot.display}
                    </motion.div>
                    {!isAvailable && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute top-1 right-1 md:top-2 md:right-2 text-[10px] md:text-xs text-white/40"
                      >
                        Taken
                      </motion.div>
                    )}
                    {isAvailable && !isSelected && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute top-1 right-1 md:top-2 md:right-2 text-[10px] md:text-xs text-white/60"
                      >
                        {availability.availableCourts.length === 2 ? 'Both' : availability.court1Available ? 'C1' : 'C2'}
                      </motion.div>
                    )}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                          className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-5 h-5 md:w-6 md:h-6 rounded-full bg-[var(--color-padel-green)] flex items-center justify-center shadow-lg"
                        >
                          <svg
                            className="w-3 h-3 md:w-4 md:h-4 text-[var(--color-dark-bg)]"
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
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          {selectedSlot && selectedCourt && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 md:mt-6 p-2 md:p-4 glass-strong rounded-lg md:rounded-xl border border-[var(--color-padel-green)]/30"
            >
              <p className="text-xs md:text-sm text-white/60">Selected:</p>
              <p className="text-sm md:text-lg font-semibold text-gradient-green">
                {allSlots.find((s) => s.id === selectedSlot)?.display}
              </p>
              <p className="text-xs md:text-sm text-white/60 mt-1 md:mt-2">Court:</p>
              <p className="text-sm md:text-md font-semibold text-white">
                {selectedCourt === 'court-1' ? 'Court 1' : 'Court 2'} (Auto-selected)
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default CalendarTimeSlot;

