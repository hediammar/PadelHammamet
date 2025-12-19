import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { JackpotPrize } from './JackpotMachine';

interface PrizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  prize: JackpotPrize | null;
}

export const PrizeModal = ({ isOpen, onClose, prize }: PrizeModalProps) => {
  // Debug: Log what prize we received
  if (isOpen && prize) {
    console.log('PrizeModal: Received prize:', {
      id: prize.id,
      name: prize.name,
      prize_type: prize.prize_type,
      description: prize.description
    });
  }
  
  if (!isOpen || !prize) return null;

  return (
    <AnimatePresence>
      {isOpen && prize && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm" 
          />
          
          {/* Popup Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 glass-strong rounded-3xl p-8 md:p-10 max-w-md w-full border-2 border-[var(--color-padel-green)]/50 text-center"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-white/80" />
            </button>

            {/* Confetti effect background */}
            <div className="absolute inset-0 opacity-20 overflow-hidden rounded-3xl">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181'][Math.floor(Math.random() * 5)],
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>

            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 0.1, 
                  type: 'spring', 
                  stiffness: 200,
                  damping: 15
                }}
                className="text-9xl mb-6"
              >
                {prize.emoji || prize.icon || (prize.prize_type === 'no_win' ? '🎲' : '🎉')}
              </motion.div>
              
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-4xl font-bold text-white mb-4"
              >
                {prize.prize_type === 'no_win' 
                  ? 'Better Luck Next Time!' 
                  : 'Congratulations!'}
              </motion.h3>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl md:text-3xl text-[var(--color-padel-green)] font-bold mb-4"
              >
                {prize.name}
              </motion.p>
              
              {prize.description && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-white/70 text-base md:text-lg mb-6"
                >
                  {prize.description}
                </motion.p>
              )}
              
              {prize.prize_type !== 'no_win' && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-white/50 text-sm mt-6"
                >
                  Your prize has been recorded. Please contact the admin to claim it.
                </motion.p>
              )}

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                onClick={onClose}
                className="mt-8 px-8 py-3 rounded-xl bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-white font-semibold hover:shadow-lg hover:shadow-[var(--color-padel-green)]/50 glow-green transition-all"
              >
                Awesome!
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
