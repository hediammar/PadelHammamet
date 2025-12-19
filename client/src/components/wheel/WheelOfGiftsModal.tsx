import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Sparkles } from 'lucide-react';
import { JackpotMachine } from './JackpotMachine';
import type { JackpotPrize } from './JackpotMachine';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface WheelOfGiftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpinComplete?: (prize: JackpotPrize | null) => void;
}

export const WheelOfGiftsModal = ({ isOpen, onClose, onSpinComplete }: WheelOfGiftsModalProps) => {
  const { user } = useAuth();
  const [prizes, setPrizes] = useState<JackpotPrize[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningPrize, setWinningPrize] = useState<JackpotPrize | null>(null);
  const [canSpin, setCanSpin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [daysUntilNextSpin, setDaysUntilNextSpin] = useState<number | null>(null);

  // Check if user can spin
  useEffect(() => {
    const checkCanSpin = async () => {
      if (!user || !isOpen) return;

      try {
        setIsLoading(true);
        
        // Check if user can spin using the database function
        const { data, error: checkError } = await supabase.rpc('can_user_spin_jackpot', {
          check_user_id: user.id,
        });

        if (checkError) throw checkError;

        setCanSpin(data === true);

        // If can't spin, calculate days until next spin
        if (data === false) {
          const { data: lastSpin, error: spinError } = await supabase
            .from('user_jackpot_spins')
            .select('spin_date')
            .eq('user_id', user.id)
            .order('spin_date', { ascending: false })
            .limit(1)
            .single();

          if (!spinError && lastSpin) {
            const lastSpinDate = new Date(lastSpin.spin_date);
            const nextSpinDate = new Date(lastSpinDate);
            nextSpinDate.setDate(nextSpinDate.getDate() + 7);
            const today = new Date();
            const diffTime = nextSpinDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setDaysUntilNextSpin(diffDays > 0 ? diffDays : 0);
          }
        }

        // Load prizes
        const { data: prizesData, error: prizesError } = await supabase
          .from('jackpot_prizes')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: true });

        if (prizesError) throw prizesError;

        setPrizes(prizesData || []);
      } catch (err: any) {
        console.error('Error checking spin eligibility:', err);
        setError(err.message || 'Failed to check spin eligibility');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      checkCanSpin();
    }
  }, [user, isOpen]);

  const handleSpin = async () => {
    if (!user || !canSpin || isSpinning) return;

    try {
      setError(null);
      setWinningPrize(null); // Clear any previous win

      // Ensure user.id is a valid UUID string
      if (!user.id || typeof user.id !== 'string') {
        throw new Error('Invalid user ID');
      }

      // Call the spin function first to get the winning prize
      const { data, error: spinError } = await supabase.rpc('spin_jackpot', {
        spin_user_id: user.id,
      });

      if (spinError) {
        console.error('Spin function error:', spinError);
        throw new Error(spinError.message || 'Failed to spin the wheel');
      }

      if (data && data.length > 0) {
        const win = data[0];
        
        // Debug: Log the backend response
        console.log('WheelOfGiftsModal: Backend returned prize:', {
          prize_id: win.prize_id,
          prize_name: win.prize_name,
          prize_type: win.prize_type,
          prize_description: win.prize_description,
          allPrizesInArray: prizes.map(p => ({ id: p.id, name: p.name }))
        });
        
        // Find the full prize details from the prizes array to get color and icon
        const fullPrize = prizes.find(p => p.id === win.prize_id);
        
        if (!fullPrize) {
          console.warn('WheelOfGiftsModal: Prize from backend not found in prizes array!', {
            backendPrizeId: win.prize_id,
            backendPrizeName: win.prize_name,
            availablePrizeIds: prizes.map(p => p.id)
          });
        }
        
        const prize: JackpotPrize = {
          id: win.prize_id,
          name: win.prize_name, // Use name from backend, not from prizes array
          description: win.prize_description,
          prize_type: win.prize_type,
          color: fullPrize?.color,
          icon: fullPrize?.icon,
        };

        console.log('WheelOfGiftsModal: Created prize object:', {
          id: prize.id,
          name: prize.name,
          prize_type: prize.prize_type
        });

        // Set winning prize first, then start spinning
        // This ensures the wheel knows where to land
        setWinningPrize(prize);
        
        // Start spinning immediately - the wheel component will handle the animation
        setIsSpinning(true);
        
        setCanSpin(false); // User can't spin again until next week
      } else {
        throw new Error('No prize returned from spin');
      }
    } catch (err: any) {
      console.error('Error spinning wheel:', err);
      const errorMessage = err.message || err.error?.message || 'Failed to spin the wheel. Please try again.';
      setError(errorMessage);
      setIsSpinning(false);
      setWinningPrize(null);
    }
  };

  const handleSpinComplete = (prize: JackpotPrize) => {
    setIsSpinning(false);
    
    // Debug: Log the prize received from WheelOfGifts
    console.log('WheelOfGiftsModal: handleSpinComplete received prize:', {
      id: prize?.id,
      name: prize?.name,
      prize_type: prize?.prize_type,
      currentWinningPrizeState: winningPrize?.name
    });
    
    // Small delay to see the wheel stop, then close modal and trigger prize modal
    setTimeout(() => {
      onClose(); // Close wheel modal
      // Pass the prize to parent so it can show the prize modal
      // Use the prize parameter (from WheelOfGifts) not the state, to ensure we have the latest
      if (onSpinComplete) {
        console.log('WheelOfGiftsModal: Passing prize to parent:', prize?.name);
        onSpinComplete(prize);
      }
    }, 500); // Small delay to see the wheel stop
  };

  const handleClose = () => {
    if (!isSpinning) {
      setWinningPrize(null);
      setError(null);
      onClose();
    }
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
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-3xl p-6 md:p-8 max-w-2xl w-full border-2 border-[var(--color-padel-green)]/30 relative max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              {!isSpinning && (
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 transition-colors z-10"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-white/80" />
                </button>
              )}

              {/* Header */}
              <div className="text-center mb-6">
               
                
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-white/60">Loading...</div>
                </div>
              )}

              {/* Error State */}
              {error && !isLoading && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {/* Can't Spin State */}
              {!isLoading && !error && !canSpin && !isSpinning && (
                <div className="text-center py-8">
                  <Sparkles className="w-16 h-16 text-[var(--color-padel-green)] mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    Come Back Next Week!
                  </h3>
                  <p className="text-white/60 mb-4">
                    You've already spun the wheel this week.
                  </p>
                  {daysUntilNextSpin !== null && daysUntilNextSpin > 0 && (
                    <p className="text-[var(--color-padel-green)] font-semibold">
                      {daysUntilNextSpin} day{daysUntilNextSpin !== 1 ? 's' : ''} until your next spin!
                    </p>
                  )}
                </div>
              )}

              {/* Jackpot Machine */}
              {!isLoading && !error && prizes.length > 0 && (
                <div className="flex flex-col items-center">
                  <div className="mb-6 w-full">
                    <JackpotMachine
                      prizes={prizes}
                      onSpinComplete={handleSpinComplete}
                      isSpinning={isSpinning}
                      winningPrize={winningPrize}
                    />
                  </div>

                  {/* Spin Button */}
                  {!isSpinning && canSpin && !winningPrize && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSpin}
                      className="px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-white font-bold text-lg hover:shadow-lg hover:shadow-[var(--color-padel-green)]/50 glow-green transition-all"
                    >
                      Spin the Wheel!
                    </motion.button>
                  )}


                  {/* Spinning Message */}
                  {isSpinning && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-6 text-center"
                    >
                      <p className="text-white/80 text-lg font-semibold">
                        Spinning...
                      </p>
                    </motion.div>
                  )}
                </div>
              )}

              {/* No Prizes State */}
              {!isLoading && !error && prizes.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-white/60">
                    No prizes available at the moment. Please check back later.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
