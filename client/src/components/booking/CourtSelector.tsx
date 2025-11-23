import { motion } from 'framer-motion';
import { useBooking } from '../../context/BookingContext';

const COURTS = [
  { id: 'court-1', name: 'Court 1', description: 'Indoor Court' },
  { id: 'court-2', name: 'Court 2', description: 'Outdoor Court' },
];

const CourtSelector = () => {
  const { selectedCourt, setSelectedCourt } = useBooking();

  const handleCourtSelect = (courtId: string) => {
    if (selectedCourt === courtId) {
      setSelectedCourt(null);
    } else {
      setSelectedCourt(courtId);
    }
  };

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-2xl font-bold mb-6 text-gradient-green">Select Court</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {COURTS.map((court) => {
          const isSelected = selectedCourt === court.id;

          return (
            <motion.button
              key={court.id}
              onClick={() => handleCourtSelect(court.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative p-6 rounded-xl text-left transition-all duration-200 overflow-hidden
                ${isSelected
                  ? 'bg-gradient-to-br from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-[var(--color-dark-bg)] glow-green shadow-lg shadow-[var(--color-padel-green)]/50'
                  : 'glass hover:bg-white/10 border border-white/10 hover:border-white/20'
                }
              `}
            >
              {/* Decorative background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                  backgroundSize: '24px 24px'
                }}></div>
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-xl font-bold ${isSelected ? 'text-[var(--color-dark-bg)]' : 'text-white'}`}>
                    {court.name}
                  </h3>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="w-8 h-8 rounded-full bg-[var(--color-dark-bg)]/20 flex items-center justify-center"
                    >
                      <svg
                        className="w-5 h-5 text-[var(--color-dark-bg)]"
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
                </div>
                
                <p className={`text-sm ${isSelected ? 'text-[var(--color-dark-bg)]/80' : 'text-white/60'}`}>
                  {court.description}
                </p>

                {/* Court visual indicator */}
                <div className="mt-4 flex items-center space-x-2">
                  <div className={`
                    w-3 h-3 rounded-full
                    ${isSelected 
                      ? 'bg-[var(--color-dark-bg)]' 
                      : 'bg-[var(--color-padel-green)]'
                    }
                  `}></div>
                  <span className={`text-xs font-medium ${isSelected ? 'text-[var(--color-dark-bg)]/70' : 'text-white/50'}`}>
                    Available
                  </span>
                </div>
              </div>

              {/* Selection glow effect */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-gradient-to-br from-[var(--color-padel-green)]/20 to-[var(--color-electric-blue)]/20"
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {selectedCourt && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 glass-strong rounded-xl border border-[var(--color-padel-green)]/30"
        >
          <p className="text-sm text-white/60">Selected Court:</p>
          <p className="text-lg font-semibold text-gradient-green">
            {COURTS.find((c) => c.id === selectedCourt)?.name}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default CourtSelector;

