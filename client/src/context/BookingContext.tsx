import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface Booking {
  id: string;
  courtId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  timeSlot: string; // Slot ID format: "08:00-09:30"
  userId: string;
}

export interface GuestUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

interface BookingContextType {
  bookings: Booking[];
  guestUsers: GuestUser[];
  selectedDate: Date | null;
  selectedCourt: string | null;
  selectedSlot: string | null;
  setSelectedDate: (date: Date | null) => void;
  setSelectedCourt: (courtId: string | null) => void;
  setSelectedSlot: (slotId: string | null) => void;
  createBooking: (booking: Omit<Booking, 'id'>) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
  createGuestUser: (userData: Omit<GuestUser, 'id' | 'createdAt'>) => Promise<string>;
  isSlotTaken: (courtId: string, date: string, slotId: string) => boolean;
  clearSelection: () => void;
  getUpcomingBookings: (userId?: string) => Booking[];
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const BOOKINGS_STORAGE_KEY = 'Padel Hammamet_bookings';

// Load bookings from localStorage
const loadBookingsFromStorage = (): Booking[] => {
  // Check if we're in the browser (not SSR)
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    const stored = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading bookings from storage:', error);
  }
  return [];
};

// Save bookings to localStorage
const saveBookingsToStorage = (bookings: Booking[]) => {
  // Check if we're in the browser (not SSR)
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
  } catch (error) {
    console.error('Error saving bookings to storage:', error);
  }
};

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  // Initialize bookings from localStorage (only on client-side)
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Load bookings from storage on mount (client-side only)
  useEffect(() => {
    const stored = loadBookingsFromStorage();
    console.log('Initial bookings loaded from storage:', stored);
    setBookings(stored);
  }, []);
  const [guestUsers, setGuestUsers] = useState<GuestUser[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Save bookings to localStorage whenever bookings change
  useEffect(() => {
    console.log('Bookings changed, saving to storage:', bookings);
    saveBookingsToStorage(bookings);
  }, [bookings]);

  const createGuestUser = useCallback(async (userData: Omit<GuestUser, 'id' | 'createdAt'>): Promise<string> => {
    // Check if user already exists by email
    const existingUser = guestUsers.find((u) => u.email === userData.email);
    if (existingUser) {
      return existingUser.id;
    }

    // Create new guest user
    const newUser: GuestUser = {
      ...userData,
      id: `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    setGuestUsers((prev) => [...prev, newUser]);

    // TODO: Make API call to create user account
    // await authApi.createGuestUser(newUser);

    return newUser.id;
  }, [guestUsers]);

  const createBooking = useCallback(async (booking: Omit<Booking, 'id'>) => {
    // Generate a simple ID (in production, this would come from the backend)
    const newBooking: Booking = {
      ...booking,
      id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    
    setBookings((prev) => [...prev, newBooking]);
    
    // TODO: Make API call to persist booking
    // await bookingApi.createBooking(newBooking);
  }, []);

  const cancelBooking = useCallback(async (bookingId: string) => {
    setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
    
    // TODO: Make API call to cancel booking
    // await bookingApi.cancelBooking(bookingId);
  }, []);

  const getUpcomingBookings = useCallback((userId?: string): Booking[] => {
    let filteredBookings = [...bookings];

    // Filter by userId if provided
    if (userId) {
      filteredBookings = filteredBookings.filter((booking) => booking.userId === userId);
    }

    // Sort by date (earliest first, but show all dates including past)
    return filteredBookings.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return a.timeSlot.localeCompare(b.timeSlot);
    });
  }, [bookings]);

  const isSlotTaken = useCallback(
    (courtId: string, date: string, slotId: string): boolean => {
      return bookings.some(
        (booking) =>
          booking.courtId === courtId &&
          booking.date === date &&
          booking.timeSlot === slotId
      );
    },
    [bookings]
  );

  const clearSelection = useCallback(() => {
    setSelectedDate(null);
    setSelectedCourt(null);
    setSelectedSlot(null);
  }, []);

  return (
    <BookingContext.Provider
      value={{
        bookings,
        guestUsers,
        selectedDate,
        selectedCourt,
        selectedSlot,
        setSelectedDate,
        setSelectedCourt,
        setSelectedSlot,
        createBooking,
        cancelBooking,
        createGuestUser,
        isSlotTaken,
        clearSelection,
        getUpcomingBookings,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

