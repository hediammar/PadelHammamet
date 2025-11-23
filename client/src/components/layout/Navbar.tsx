import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { InteractiveHoverButton } from '../common/InteractiveHoverButton';
import SignInModal from '../auth/SignInModal';
import { User } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated } = useAuth();
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const navItems: Array<{ label: string; path: string }> = [];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-padel-green)] to-[var(--color-electric-blue)] flex items-center justify-center glow-green"
              >
                <span className="text-[var(--color-dark-bg)] font-bold text-xl">P</span>
              </motion.div>
              <span className="text-xl md:text-2xl font-bold text-gradient-green">
                Padel Hammamet
              </span>
            </Link>

            {/* Navigation Items */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile: Reserve Button & Profile Button */}
            <div className="flex md:hidden items-center space-x-2">
              <Link to="/booking-alternative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-[var(--color-dark-bg)] font-semibold text-sm hover:shadow-lg hover:shadow-[var(--color-padel-green)]/50 transition-all duration-200 glow-green"
                >
                  Reserve
                </motion.button>
              </Link>
              
              {/* Profile Button - Mobile */}
              {isAuthenticated && user ? (
                <Link
                  to="/profile"
                  className="p-2 rounded-xl glass hover:bg-white/10 transition-all duration-200"
                >
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border border-[var(--color-padel-green)]"
                    />
                  ) : (
                    <User className="w-6 h-6 text-white/80" />
                  )}
                </Link>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsSignInModalOpen(true)}
                  className="p-2 rounded-xl glass hover:bg-white/10 transition-all duration-200"
                  aria-label="Sign in"
                >
                  <User className="w-6 h-6 text-white/80" />
                </motion.button>
              )}
            </div>

            {/* Desktop: Reserve Button & Profile Button */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Reserve Button - Always visible */}
              <Link to="/booking-alternative">
                <InteractiveHoverButton text="Reserve" />
              </Link>
              
              {/* Profile Button - Desktop */}
              {isAuthenticated && user ? (
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 px-4 py-2 rounded-xl glass hover:bg-white/10 transition-all duration-200"
                >
                  {user.picture && (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border border-[var(--color-padel-green)]"
                    />
                  )}
                  <span className="text-sm font-medium text-white/80">
                    {user.name.split(' ')[0]}
                  </span>
                </Link>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsSignInModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl glass hover:bg-white/10 transition-all duration-200"
                >
                  <User className="w-5 h-5 text-white/80" />
                  <span className="text-sm font-medium text-white/80">Sign In</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Sign In Modal */}
      <SignInModal isOpen={isSignInModalOpen} onClose={() => setIsSignInModalOpen(false)} />
    </>
  );
};

export default Navbar;

