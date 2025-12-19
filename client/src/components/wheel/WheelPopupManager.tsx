import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { WheelOfGiftsModal } from './WheelOfGiftsModal';
import { PrizeModal } from './PrizeModal';
import type { JackpotPrize } from './JackpotMachine';
import { supabase } from '../../lib/supabase';

export const WheelPopupManager = () => {
  const { user, isAuthenticated } = useAuth();
  const [showWheel, setShowWheel] = useState(false);
  const [showPrize, setShowPrize] = useState(false);
  const [winningPrize, setWinningPrize] = useState<JackpotPrize | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const checkAndShowWheel = async () => {
      // Only check if user is authenticated and we haven't checked yet
      if (!isAuthenticated || !user || hasChecked) return;

      try {
        // First check if jackpot feature is enabled
        const { data: settings, error: settingsError } = await supabase
          .from('jackpot_settings')
          .select('is_enabled')
          .eq('id', 'jackpot_settings')
          .single();

        if (settingsError) {
          console.error('Error checking jackpot settings:', settingsError);
          setHasChecked(true);
          return;
        }

        // If jackpot is disabled, don't show it
        if (!settings?.is_enabled) {
          setHasChecked(true);
          return;
        }

        // Check if user can spin using the database function
        const { data: canSpin, error } = await supabase.rpc('can_user_spin_jackpot', {
          check_user_id: user.id,
        });

        if (error) {
          console.error('Error checking jackpot eligibility:', error);
          setHasChecked(true);
          return;
        }

        // Check if user has already seen the jackpot today (to avoid showing it multiple times)
        const today = new Date().toISOString().split('T')[0];
        const { data: todaySpin } = await supabase
          .from('user_jackpot_spins')
          .select('id')
          .eq('user_id', user.id)
          .eq('spin_date', today)
          .maybeSingle();

        // Show jackpot if user can spin and hasn't spun today
        if (canSpin === true && !todaySpin) {
          // Small delay to ensure page is loaded
          setTimeout(() => {
            setShowWheel(true);
          }, 2000);
        }

        setHasChecked(true);
      } catch (error) {
        console.error('Error in jackpot popup check:', error);
        setHasChecked(true);
      }
    };

    // Only check once when user becomes authenticated
    if (isAuthenticated && user && !hasChecked) {
      checkAndShowWheel();
    }

    // Reset check when user logs out
    if (!isAuthenticated) {
      setHasChecked(false);
      setShowWheel(false);
    }
  }, [isAuthenticated, user, hasChecked]);

  const handleClose = () => {
    setShowWheel(false);
  };

  const handleSpinComplete = (prize: JackpotPrize | null) => {
    // Debug: Log the prize received
    console.log('WheelPopupManager: handleSpinComplete received prize:', {
      id: prize?.id,
      name: prize?.name,
      prize_type: prize?.prize_type,
      isNull: prize === null
    });
    
    // Close wheel modal and show prize modal
    setShowWheel(false);
    if (prize) {
      console.log('WheelPopupManager: Setting winning prize and showing modal:', prize.name);
      setWinningPrize(prize);
      // Small delay to allow wheel modal to close, then show prize modal
      setTimeout(() => {
        setShowPrize(true);
      }, 300);
    } else {
      console.warn('WheelPopupManager: Received null prize, not showing prize modal');
    }
  };

  const handleClosePrize = () => {
    setShowPrize(false);
    setWinningPrize(null);
  };

  if (!isAuthenticated || !user) return null;

  return (
    <>
      <WheelOfGiftsModal
        isOpen={showWheel}
        onClose={handleClose}
        onSpinComplete={handleSpinComplete}
      />
      <PrizeModal
        isOpen={showPrize}
        onClose={handleClosePrize}
        prize={winningPrize}
      />
    </>
  );
};
