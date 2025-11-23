import { motion } from 'framer-motion';
import BookingWizard from '../components/booking/BookingWizard';

const BookingFlow = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen py-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold mb-8 text-gradient-green"
        >
          Book a Court
        </motion.h1>

        <BookingWizard />
      </div>
    </motion.div>
  );
};

export default BookingFlow;

