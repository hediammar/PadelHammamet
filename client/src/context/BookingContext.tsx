import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';

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
  // Initialize bookings from Supabase and localStorage
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [guestUsers, setGuestUsers] = useState<GuestUser[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

  // Load bookings from Supabase on mount
  useEffect(() => {
    const loadBookings = async () => {
      try {
        // First, try to load from Supabase
        const { data: supabaseBookings, error } = await supabase
          .from('reservations')
          .select('*')
          .order('date', { ascending: true });

        if (error) {
          console.error('Error loading bookings from Supabase:', error);
          // Fallback to localStorage if Supabase fails
          const stored = loadBookingsFromStorage();
          setBookings(stored);
        } else if (supabaseBookings && supabaseBookings.length > 0) {
          // Map Supabase data to Booking format
          const mappedBookings: Booking[] = supabaseBookings.map((b: any) => ({
            id: b.id,
            courtId: b.court_id,
            date: b.date,
            timeSlot: b.time_slot,
            userId: b.user_id,
          }));
          setBookings(mappedBookings);
          saveBookingsToStorage(mappedBookings);
        } else {
          // No Supabase data, try localStorage
          const stored = loadBookingsFromStorage();
          setBookings(stored);
        }
      } catch (error) {
        console.error('Error loading bookings:', error);
        // Fallback to localStorage
        const stored = loadBookingsFromStorage();
        setBookings(stored);
      } finally {
        setIsLoadingBookings(false);
      }
    };

    loadBookings();

    // Subscribe to real-time changes in reservations table
    const subscription = supabase
      .channel('reservations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
        },
        async () => {
          // Reload bookings when changes occur
          const { data: supabaseBookings } = await supabase
            .from('reservations')
            .select('*')
            .order('date', { ascending: true });

          if (supabaseBookings) {
            const mappedBookings: Booking[] = supabaseBookings.map((b: any) => ({
              id: b.id,
              courtId: b.court_id,
              date: b.date,
              timeSlot: b.time_slot,
              userId: b.user_id,
            }));
            setBookings(mappedBookings);
            saveBookingsToStorage(mappedBookings);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Save bookings to localStorage whenever bookings change (as backup)
  useEffect(() => {
    if (!isLoadingBookings) {
      saveBookingsToStorage(bookings);
    }
  }, [bookings, isLoadingBookings]);

  const createGuestUser = useCallback(async (userData: Omit<GuestUser, 'id' | 'createdAt'>): Promise<string> => {
    try {
      // Check if user already exists by email in Supabase
      const { data: existingUsers } = await supabase
        .from('guest_users')
        .select('*')
        .eq('email', userData.email)
        .limit(1);

      if (existingUsers && existingUsers.length > 0) {
        const existingUser = existingUsers[0];
        const guestUser: GuestUser = {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          phone: existingUser.phone,
          createdAt: existingUser.created_at,
        };
        setGuestUsers((prev) => {
          const exists = prev.find((u) => u.id === guestUser.id);
          if (!exists) return [...prev, guestUser];
          return prev;
        });
        return existingUser.id;
      }

      // Create new guest user in Supabase
      const newUser: GuestUser = {
        ...userData,
        id: `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('guest_users')
        .insert({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          created_at: newUser.createdAt,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating guest user in Supabase:', error);
        // Still return the user ID even if Supabase insert fails
        setGuestUsers((prev) => [...prev, newUser]);
        return newUser.id;
      }

      setGuestUsers((prev) => [...prev, newUser]);
      return newUser.id;
    } catch (error) {
      console.error('Error creating guest user:', error);
      // Fallback: create user locally
      const newUser: GuestUser = {
        ...userData,
        id: `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      };
      setGuestUsers((prev) => [...prev, newUser]);
      return newUser.id;
    }
  }, [guestUsers]);

  const createBooking = useCallback(async (booking: Omit<Booking, 'id'>) => {
    try {
      // Generate a simple ID
      const newBooking: Booking = {
        ...booking,
        id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };

      // Save to Supabase
      const { error } = await supabase
        .from('reservations')
        .insert({
          id: newBooking.id,
          court_id: newBooking.courtId,
          date: newBooking.date,
          time_slot: newBooking.timeSlot,
          user_id: newBooking.userId,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating booking in Supabase:', error);
        // Still add to local state even if Supabase insert fails
        setBookings((prev) => [...prev, newBooking]);
        saveBookingsToStorage([...bookings, newBooking]);
        throw error;
      }

      // Booking will be updated via real-time subscription, but we can also update immediately
      setBookings((prev) => [...prev, newBooking]);
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }, [bookings]);

  const cancelBooking = useCallback(async (bookingId: string) => {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', bookingId);

      if (error) {
        console.error('Error cancelling booking in Supabase:', error);
        // Still remove from local state even if Supabase delete fails
        setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
        throw error;
      }

      // Booking will be updated via real-time subscription, but we can also update immediately
      setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
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

