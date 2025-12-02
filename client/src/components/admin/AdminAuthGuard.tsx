import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, Lock } from 'lucide-react';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to home if not authenticated
      navigate('/');
      return;
    }

    if (user?.role !== 'admin') {
      // User is authenticated but not an admin
      // We'll show an unauthorized message instead of redirecting
    }
  }, [user, isAuthenticated, navigate]);

  // Show loading state while checking auth
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/60">Checking authentication...</div>
      </div>
    );
  }

  // Show unauthorized message if user is not an admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="glass-strong rounded-2xl p-8 md:p-12 max-w-md w-full border-2 border-red-500/30 text-center"
        >
          <div className="mb-6">
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white">
              Access Denied
            </h2>
            <p className="text-white/60">
              You don't have permission to access the admin panel.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-white/40 text-sm">
              Only administrators can access this section.
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Go to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // User is authenticated and is an admin, render children
  return <>{children}</>;
}

