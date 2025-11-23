import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';

const registrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface GuestRegistrationFormProps {
  onSubmit: (data: RegistrationFormData) => Promise<void>;
  isLoading?: boolean;
}

const GuestRegistrationForm = ({ onSubmit, isLoading = false }: GuestRegistrationFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  const handleFormSubmit = async (data: RegistrationFormData) => {
    await onSubmit(data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 border-2 border-[var(--color-padel-green)]/30"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-gradient-green">
          Complete Your Booking
        </h2>
        <p className="text-white/60 text-sm">
          We just need a few details to confirm your reservation
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
            Full Name
          </label>
          <input
            {...register('name')}
            type="text"
            id="name"
            placeholder="John Doe"
            className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-[var(--color-padel-green)] focus:outline-none focus:ring-2 focus:ring-[var(--color-padel-green)]/20 text-white placeholder-white/40 transition-all duration-200"
            disabled={isLoading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
            Email Address
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            placeholder="john@example.com"
            className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-[var(--color-padel-green)] focus:outline-none focus:ring-2 focus:ring-[var(--color-padel-green)]/20 text-white placeholder-white/40 transition-all duration-200"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-white/80 mb-2">
            Phone Number
          </label>
          <input
            {...register('phone')}
            type="tel"
            id="phone"
            placeholder="+1 (555) 123-4567"
            className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-[var(--color-padel-green)] focus:outline-none focus:ring-2 focus:ring-[var(--color-padel-green)]/20 text-white placeholder-white/40 transition-all duration-200"
            disabled={isLoading}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-6 px-6 py-4 rounded-xl bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-[var(--color-dark-bg)] font-semibold text-lg hover:shadow-lg hover:shadow-[var(--color-padel-green)]/50 transition-all duration-200 glow-green disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center space-x-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Processing...</span>
            </span>
          ) : (
            'Confirm & Book'
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default GuestRegistrationForm;

