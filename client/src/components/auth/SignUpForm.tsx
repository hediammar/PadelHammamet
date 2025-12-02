import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import SignUpSuccessModal from './SignUpSuccessModal';

const signUpSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  phonePrefix: z.string().regex(/^\+\d{1,4}$/, 'Invalid phone prefix'),
  phoneNumber: z.string().regex(/^\d{8}$/, 'Phone number must be exactly 8 digits'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

interface SignUpFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const SignUpForm = ({ onSuccess, onSwitchToLogin }: SignUpFormProps) => {
  const { signup, checkUsernameAvailability, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdUsername, setCreatedUsername] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      phonePrefix: '+216',
    },
  });

  const username = watch('username');

  // Check username availability on blur
  const handleUsernameBlur = async () => {
    if (!username || username.length < 3) return;

    setIsCheckingUsername(true);
    setUsernameError(null);

    try {
      const isAvailable = await checkUsernameAvailability(username);
      if (!isAvailable) {
        setUsernameError('Username is already taken');
      }
    } catch (error) {
      setUsernameError('Error checking username availability');
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const onSubmit = async (data: SignUpFormData) => {
    if (usernameError) return;

    try {
      await signup(
        data.username,
        data.phonePrefix,
        data.phoneNumber,
        data.password
      );
      setCreatedUsername(data.username);
      setShowSuccessModal(true);
    } catch (error: any) {
      if (error.message === 'Username is already taken') {
        setUsernameError('Username is already taken');
      } else {
        alert(error.message || 'Failed to create account. Please try again.');
      }
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    onSuccess?.();
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-3 sm:space-y-4 w-full"
    >
      {/* Username Field */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-white/80 mb-2">
          Username
        </label>
        <div className="relative">
          <input
            {...register('username')}
            type="text"
            id="username"
            placeholder="username"
            onBlur={handleUsernameBlur}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl glass border border-white/10 focus:border-[var(--color-padel-green)] focus:outline-none focus:ring-2 focus:ring-[var(--color-padel-green)]/20 text-white placeholder-white/40 transition-all duration-200"
            disabled={isLoading}
          />
          {isCheckingUsername && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
            </div>
          )}
        </div>
        {errors.username && (
          <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.username.message}</p>
        )}
        {usernameError && (
          <p className="mt-1 text-xs sm:text-sm text-red-400">{usernameError}</p>
        )}
      </div>

      {/* Phone Number Field */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-white/80 mb-2">
          Phone Number
        </label>
        <div className="flex gap-2">
          <div className="w-20 sm:w-24 flex-shrink-0">
            <input
              {...register('phonePrefix')}
              type="text"
              id="phonePrefix"
              placeholder="+216"
              className="w-full px-2 sm:px-3 py-3 text-sm sm:text-base rounded-xl glass border border-white/10 focus:border-[var(--color-padel-green)] focus:outline-none focus:ring-2 focus:ring-[var(--color-padel-green)]/20 text-white placeholder-white/40 transition-all duration-200"
              disabled={isLoading}
            />
          </div>
          <div className="flex-1 min-w-0">
            <input
              {...register('phoneNumber')}
              type="tel"
              id="phoneNumber"
              placeholder="12345678"
              maxLength={8}
              inputMode="numeric"
              className="w-full px-3 sm:px-4 py-3 text-sm sm:text-base rounded-xl glass border border-white/10 focus:border-[var(--color-padel-green)] focus:outline-none focus:ring-2 focus:ring-[var(--color-padel-green)]/20 text-white placeholder-white/40 transition-all duration-200"
              disabled={isLoading}
            />
          </div>
        </div>
        {errors.phonePrefix && (
          <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.phonePrefix.message}</p>
        )}
        {errors.phoneNumber && (
          <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.phoneNumber.message}</p>
        )}
        <p className="mt-1 text-xs text-white/40">
          Enter 8 digits for Tunisia (+216)
        </p>
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
          Password
        </label>
        <div className="relative">
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            id="password"
            placeholder="••••••••"
            className="w-full px-4 py-3 pr-12 rounded-xl glass border border-white/10 focus:border-[var(--color-padel-green)] focus:outline-none focus:ring-2 focus:ring-[var(--color-padel-green)]/20 text-white placeholder-white/40 transition-all duration-200"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80 mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <input
            {...register('confirmPassword')}
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            placeholder="••••••••"
            className="w-full px-4 py-3 pr-12 rounded-xl glass border border-white/10 focus:border-[var(--color-padel-green)] focus:outline-none focus:ring-2 focus:ring-[var(--color-padel-green)]/20 text-white placeholder-white/40 transition-all duration-200"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !!usernameError}
        className="w-full px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            <span>Creating account...</span>
          </span>
        ) : (
          'Create Account'
        )}
      </button>

      {/* Switch to Login */}
      {onSwitchToLogin && (
        <p className="text-center text-xs sm:text-sm text-white/60">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-[var(--color-padel-green)] hover:underline font-medium"
          >
            Sign in
          </button>
        </p>
      )}

      {/* Success Modal */}
      <SignUpSuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        username={createdUsername}
      />
    </motion.form>
  );
};

export default SignUpForm;

