import { motion, AnimatePresence } from 'framer-motion';
import { useBooking } from '../../context/BookingContext';
import { generatePadelSlots, formatDateLocal } from '../../utils/dateHelpers';

const SlotPicker = () => {
  const { selectedDate, selectedSlot, selectedCourt, setSelectedSlot, setSelectedCourt, isSlotTaken } = useBooking();
  
  // Generate all available slots (08:00 - 23:00)
  const allSlots = generatePadelSlots(8, 23);

  if (!selectedDate) {
    return (
      <div className="glass rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-gradient-green">Select Time Slot</h2>
        <p className="text-white/60 text-center py-8">
          Please select a date first to view available time slots
        </p>
      </div>
    );
  }

  // Format date as YYYY-MM-DD for comparison (using local time to avoid timezone issues)
  const dateString = formatDateLocal(selectedDate);

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
    <div className="glass rounded-2xl p-6">
      <h2 className="text-2xl font-bold mb-6 text-gradient-green">Select Time Slot</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence mode="wait">
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
                  relative p-4 rounded-xl text-center transition-all duration-200
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
                  className={`text-sm font-medium ${isSelected ? 'text-[var(--color-dark-bg)]' : 'text-white'}`}
                >
                  {slot.display}
                </motion.div>
                {!isAvailable && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute top-2 right-2 text-xs text-white/40"
                  >
                    Taken
                  </motion.div>
                )}
                {isAvailable && !isSelected && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute top-2 right-2 text-xs text-white/60"
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
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[var(--color-padel-green)] flex items-center justify-center shadow-lg"
                    >
                      <svg
                        className="w-4 h-4 text-[var(--color-dark-bg)]"
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
          className="mt-6 p-4 glass-strong rounded-xl border border-[var(--color-padel-green)]/30"
        >
          <p className="text-sm text-white/60">Selected Slot:</p>
          <p className="text-lg font-semibold text-gradient-green">
            {allSlots.find((s) => s.id === selectedSlot)?.display}
          </p>
          <p className="text-sm text-white/60 mt-2">Court:</p>
          <p className="text-md font-semibold text-white">
            {selectedCourt === 'court-1' ? 'Court 1' : 'Court 2'} (Auto-selected)
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default SlotPicker;

