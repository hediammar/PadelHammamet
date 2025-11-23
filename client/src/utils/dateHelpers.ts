/**
 * Date utility functions for booking system
 */

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format date as YYYY-MM-DD using local time (not UTC)
 * This prevents timezone issues when saving dates
 */
export const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Generate 90-minute time slots for padel matches
 * Format: "08:00-09:30", "09:30-11:00", etc.
 */
export interface TimeSlot {
  start: string;
  end: string;
  display: string;
  id: string;
}

export const generatePadelSlots = (startHour: number = 8, endHour: number = 23): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  let currentHour = startHour;
  let currentMinute = 0;

  while (currentHour < endHour || (currentHour === endHour && currentMinute === 0)) {
    const startTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    // Calculate end time (90 minutes later)
    let endHourCalc = currentHour;
    let endMinuteCalc = currentMinute + 90;
    
    while (endMinuteCalc >= 60) {
      endMinuteCalc -= 60;
      endHourCalc += 1;
    }
    
    // Stop if end time exceeds closing time
    if (endHourCalc > endHour || (endHourCalc === endHour && endMinuteCalc > 0)) {
      break;
    }
    
    const endTime = `${endHourCalc.toString().padStart(2, '0')}:${endMinuteCalc.toString().padStart(2, '0')}`;
    const display = `${formatTimeForDisplay(startTime)} - ${formatTimeForDisplay(endTime)}`;
    const id = `${startTime}-${endTime}`;
    
    slots.push({ start: startTime, end: endTime, display, id });
    
    // Move to next slot start (90 minutes from current start)
    currentMinute += 90;
    while (currentMinute >= 60) {
      currentMinute -= 60;
      currentHour += 1;
    }
  }
  
  return slots;
};

/**
 * Format time string (HH:MM) to display format (HH:MM AM/PM)
 */
const formatTimeForDisplay = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Legacy function for backward compatibility (returns simple time strings)
 */
export const getTimeSlots = (startHour: number = 8, endHour: number = 22): string[] => {
  const slots: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
};

