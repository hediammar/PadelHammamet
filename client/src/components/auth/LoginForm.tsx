import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
}

const LoginForm = ({ onSuccess, onSwitchToSignup }: LoginFormProps) => {
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      await login(data.username, data.password);
      // onSuccess will be called after auth state change listener sets the user
      // Small delay to ensure state is updated
      setTimeout(() => {
        onSuccess?.();
      }, 100);
    } catch (error: any) {
      setError(error.message || 'Invalid username or password');
      // Ensure loading state is reset even if login fails
      // The login function should handle this, but adding safety check
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-3 sm:space-y-4 w-full"
    >
      {error && (
        <div className="p-2.5 sm:p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* Username Field */}
      <div>
        <label htmlFor="loginUsername" className="block text-xs sm:text-sm font-medium text-white/80 mb-2">
          Username
        </label>
        <input
          {...register('username')}
          type="text"
          id="loginUsername"
          placeholder="username"
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl glass border border-white/10 focus:border-[var(--color-padel-green)] focus:outline-none focus:ring-2 focus:ring-[var(--color-padel-green)]/20 text-white placeholder-white/40 transition-all duration-200"
          disabled={isLoading}
        />
        {errors.username && (
          <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.username.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="loginPassword" className="block text-xs sm:text-sm font-medium text-white/80 mb-2">
          Password
        </label>
        <div className="relative">
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            id="loginPassword"
            placeholder="••••••••"
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 text-sm sm:text-base rounded-xl glass border border-white/10 focus:border-[var(--color-padel-green)] focus:outline-none focus:ring-2 focus:ring-[var(--color-padel-green)]/20 text-white placeholder-white/40 transition-all duration-200"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.password.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            <span>Signing in...</span>
          </span>
        ) : (
          'Sign In'
        )}
      </button>

      {/* Switch to Signup */}
      {onSwitchToSignup && (
        <p className="text-center text-xs sm:text-sm text-white/60">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-[var(--color-padel-green)] hover:underline font-medium"
          >
            Sign up
          </button>
        </p>
      )}
    </motion.form>
  );
};

export default LoginForm;

