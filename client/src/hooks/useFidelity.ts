import { useMemo } from 'react';
import { useBooking } from '../context/BookingContext';

const XP_PER_BOOKING = 100;
const BOOKINGS_FOR_DISCOUNT = 5;

export const useFidelity = (userId?: string) => {
  const { bookings } = useBooking();

  // Filter bookings by user (if userId provided, otherwise use all bookings)
  const userBookings = useMemo(() => {
    if (userId) {
      return bookings.filter((booking) => booking.userId === userId);
    }
    return bookings;
  }, [bookings, userId]);

  const totalBookings = userBookings.length;
  const totalXP = totalBookings * XP_PER_BOOKING;
  
  // Calculate bookings until discount
  const bookingsUntilDiscount = Math.max(0, BOOKINGS_FOR_DISCOUNT - totalBookings);
  
  // Calculate progress percentage (0-100)
  const discountProgress = Math.min(100, (totalBookings / BOOKINGS_FOR_DISCOUNT) * 100);
  
  // Check if discount is unlocked
  const hasDiscount = totalBookings >= BOOKINGS_FOR_DISCOUNT;
  
  // Calculate level based on total bookings
  const level = useMemo(() => {
    if (totalBookings === 0) return 'Rookie';
    if (totalBookings < 5) return 'Bronze';
    if (totalBookings < 10) return 'Silver';
    if (totalBookings < 20) return 'Gold';
    return 'Platinum';
  }, [totalBookings]);

  return {
    totalBookings,
    totalXP,
    xpEarned: XP_PER_BOOKING, // XP earned per booking
    bookingsUntilDiscount,
    discountProgress,
    hasDiscount,
    level,
    discountPercentage: hasDiscount ? 10 : 0,
  };
};

