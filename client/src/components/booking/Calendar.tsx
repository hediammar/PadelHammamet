import { motion } from 'framer-motion';
import { useBooking } from '../../context/BookingContext';
import { formatDate, isSameDay, addDays } from '../../utils/dateHelpers';

const Calendar = () => {
  const { selectedDate, setSelectedDate } = useBooking();

  // Get today's date at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate dates for the next 30 days
  const generateDates = () => {
    const dates: Date[] = [];
    const start = new Date(today);
    
    for (let i = 0; i < 30; i++) {
      dates.push(addDays(start, i));
    }
    
    return dates;
  };

  const dates = generateDates();

  const handleDateSelect = (date: Date) => {
    const dateCopy = new Date(date);
    dateCopy.setHours(0, 0, 0, 0);
    setSelectedDate(dateCopy);
  };

  const isToday = (date: Date): boolean => {
    return isSameDay(date, today);
  };

  const isPastDate = (date: Date): boolean => {
    const dateCopy = new Date(date);
    dateCopy.setHours(0, 0, 0, 0);
    return dateCopy < today;
  };

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-2xl font-bold mb-6 text-gradient-green">Select Date</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {dates.map((date, index) => {
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isPast = isPastDate(date);
          const isTodayDate = isToday(date);

          return (
            <motion.button
              key={index}
              onClick={() => !isPast && handleDateSelect(date)}
              disabled={isPast}
              whileHover={!isPast ? { scale: 1.05 } : {}}
              whileTap={!isPast ? { scale: 0.95 } : {}}
              className={`
                relative p-4 rounded-xl text-left transition-all duration-200
                ${isSelected
                  ? 'bg-gradient-to-br from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-[var(--color-dark-bg)] glow-green'
                  : isPast
                  ? 'glass opacity-40 cursor-not-allowed'
                  : 'glass hover:bg-white/10 cursor-pointer'
                }
                ${isTodayDate && !isSelected ? 'ring-2 ring-[var(--color-padel-green)] ring-opacity-50' : ''}
              `}
            >
              <div className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="text-lg font-bold">
                {date.getDate()}
              </div>
              <div className="text-xs opacity-60 mt-1">
                {date.toLocaleDateString('en-US', { month: 'short' })}
              </div>
              {isTodayDate && (
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--color-padel-green)]"></div>
              )}
            </motion.button>
          );
        })}
      </div>

      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 glass-strong rounded-xl"
        >
          <p className="text-sm text-white/60">Selected:</p>
          <p className="text-lg font-semibold text-gradient-green">
            {formatDate(selectedDate)}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Calendar;

