import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type JackpotPrize = {
  id: string;
  name: string;
  description?: string;
  prize_type: string;
  emoji?: string;
  icon?: string;
};

interface JackpotMachineProps {
  prizes: JackpotPrize[];
  onSpinComplete: (prize: JackpotPrize) => void;
  isSpinning: boolean;
  winningPrize?: JackpotPrize | null;
}

export const JackpotMachine = ({ 
  prizes, 
  onSpinComplete, 
  isSpinning, 
  winningPrize 
}: JackpotMachineProps) => {
  const [displayPrizes, setDisplayPrizes] = useState<JackpotPrize[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Initialize display with random prizes
  useEffect(() => {
    if (prizes.length > 0) {
      const initial = Array(3).fill(null).map(() => 
        prizes[Math.floor(Math.random() * prizes.length)]
      );
      setDisplayPrizes(initial);
    }
  }, [prizes]);

  // Handle spinning animation
  useEffect(() => {
    if (isSpinning && !isAnimating && winningPrize) {
      setIsAnimating(true);
      
      // Find winning prize index
      const winningIndex = prizes.findIndex(p => p.id === winningPrize.id);
      
      if (winningIndex === -1) {
        console.error('Winning prize not found:', winningPrize);
        setIsAnimating(false);
        return;
      }

      // Animation duration
      const spinDuration = 3000; // 3 seconds
      const slotDuration = spinDuration / 3; // Each slot animates for 1 second
      
      // Animate each slot
      const animateSlot = (slotIndex: number) => {
        const startTime = Date.now();
        const endTime = startTime + slotDuration;
        
        const animate = () => {
          const now = Date.now();
          const progress = Math.min((now - startTime) / slotDuration, 1);
          
          if (progress < 1) {
            // Show random prizes while spinning
            setDisplayPrizes(prev => {
              const newPrizes = [...prev];
              const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
              newPrizes[slotIndex] = randomPrize;
              return newPrizes;
            });
            requestAnimationFrame(animate);
          } else {
            // Final prize for this slot
            setDisplayPrizes(prev => {
              const newPrizes = [...prev];
              // All slots end with the winning prize
              newPrizes[slotIndex] = winningPrize;
              return newPrizes;
            });
            
            // If this is the last slot, complete the spin
            if (slotIndex === 2) {
              setTimeout(() => {
                setIsAnimating(false);
                onSpinComplete(winningPrize);
              }, 500);
            }
          }
        };
        
        requestAnimationFrame(animate);
      };

      // Start animating slots sequentially with slight delay
      setTimeout(() => animateSlot(0), 0);
      setTimeout(() => animateSlot(1), slotDuration * 0.3);
      setTimeout(() => animateSlot(2), slotDuration * 0.6);
    }
  }, [isSpinning, winningPrize, prizes, onSpinComplete, isAnimating]);

  const getPrizeDisplay = (prize: JackpotPrize) => {
    return prize.emoji || prize.icon || '🎁';
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* Jackpot Title */}
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-bold text-gradient-green mb-2">
          🎰 Jackpot Machine 🎰
        </h2>
        <p className="text-white/60">Spin to win amazing prizes!</p>
      </div>

      {/* Slot Machine Display */}
      <div className="relative">
        {/* Machine Frame */}
        <div className="glass-strong rounded-3xl p-8 border-2 border-[var(--color-padel-green)]/50">
          {/* Three Slots */}
          <div className="flex gap-4 items-center justify-center">
            {[0, 1, 2].map((slotIndex) => {
              const prize = displayPrizes[slotIndex];
              return (
                <motion.div
                  key={slotIndex}
                  className="relative"
                  initial={false}
                  animate={isAnimating ? {
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  } : {}}
                  transition={{
                    duration: 0.3,
                    repeat: isAnimating ? Infinity : 0,
                    repeatDelay: 0.1
                  }}
                >
                  {/* Slot Window */}
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-[var(--color-padel-green)]/20 to-[var(--color-electric-blue)]/20 border-2 border-[var(--color-padel-green)]/50 flex items-center justify-center relative overflow-hidden">
                    {/* Slot Content */}
                    <motion.div
                      className="text-6xl md:text-8xl"
                      animate={isAnimating ? {
                        y: [0, -100, 0],
                      } : {}}
                      transition={{
                        duration: 0.2,
                        repeat: isAnimating ? Infinity : 0,
                        ease: "linear"
                      }}
                    >
                      {prize ? getPrizeDisplay(prize) : '🎁'}
                    </motion.div>
                    
                    {/* Slot Border Glow */}
                    {isAnimating && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl border-2 border-[var(--color-padel-green)]"
                        animate={{
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity
                        }}
                      />
                    )}
                  </div>
                  
                  {/* Slot Label */}
                  <div className="text-center mt-2">
                    <p className="text-white/40 text-xs">Slot {slotIndex + 1}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Win Indicator (when all match) */}
        <AnimatePresence>
          {!isAnimating && displayPrizes.length === 3 && 
           displayPrizes[0]?.id === displayPrizes[1]?.id && 
           displayPrizes[1]?.id === displayPrizes[2]?.id && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute -top-16 left-1/2 transform -translate-x-1/2"
            >
              <div className="bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg glow-green">
                🎉 WINNER! 🎉
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Prize Name Display */}
      {!isAnimating && winningPrize && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-center"
        >
          <p className="text-2xl font-bold text-[var(--color-padel-green)]">
            {winningPrize.name}
          </p>
          {winningPrize.description && (
            <p className="text-white/60 mt-2">{winningPrize.description}</p>
          )}
        </motion.div>
      )}
    </div>
  );
};
