import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ProfileCard from '../components/profile/ProfileCard';
import UpcomingReservations from '../components/profile/UpcomingReservations';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { GoogleLogin } from '@react-oauth/google';
import { Link } from 'react-router-dom';

const UserProfile = () => {
  const { user, isAuthenticated, handleGoogleSuccess, logout } = useAuth();
  const [signOutModalOpen, setSignOutModalOpen] = useState(false);

  const handleGoogleSuccessCallback = async (credentialResponse: any) => {
    await handleGoogleSuccess(credentialResponse);
  };

  const handleSignOutClick = () => {
    setSignOutModalOpen(true);
  };

  const handleSignOutConfirm = () => {
    logout();
    setSignOutModalOpen(false);
  };

  const handleSignOutClose = () => {
    setSignOutModalOpen(false);
  };

  if (!isAuthenticated || !user) {
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
            Profile
          </motion.h1>

          <div className="flex items-center justify-center min-h-[60vh]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-8 border-2 border-[var(--color-padel-green)]/30 max-w-md w-full text-center"
            >
              <h2 className="text-2xl font-bold mb-4 text-gradient-green">
                Sign in to View Your Profile
              </h2>
              <p className="text-white/60 mb-6">
                Please sign in with your Google account to access your profile, bookings, and stats.
              </p>
              
              <div className="flex flex-col items-center space-y-4">
                <GoogleLogin
                  onSuccess={handleGoogleSuccessCallback}
                  onError={() => {
                    // Error handling - Google OAuth onError doesn't provide error details
                    console.error('Google login error occurred');
                  }}
                  useOneTap={true}
                  theme="filled_blue"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                />
                
                <p className="text-sm text-white/40 mt-4">
                  Or{' '}
                  <Link
                    to="/booking-alternative"
                    className="text-[var(--color-padel-green)] hover:underline"
                  >
                    book a court first
                  </Link>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }

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
          Profile
        </motion.h1>

        <div className="space-y-8">
          {/* Profile Card */}
          <ProfileCard 
            userId={user.id} 
            userName={user.name}
            userEmail={user.email}
            userPicture={user.picture}
          />

          {/* Upcoming Reservations */}
          <UpcomingReservations userId={user.id} />

          {/* Logout Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <button
              onClick={handleSignOutClick}
              className="px-6 py-3 rounded-xl glass hover:bg-white/10 transition-all duration-200 text-white/80 hover:text-white flex items-center space-x-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Sign Out</span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      <ConfirmationModal
        isOpen={signOutModalOpen}
        onClose={handleSignOutClose}
        onConfirm={handleSignOutConfirm}
        title="Sign Out"
        message="Are you sure you want to sign out? You'll need to sign in again to access your profile and bookings."
        confirmText="Yes, Sign Out"
        cancelText="Stay Signed In"
        type="info"
        icon="logout"
      />
    </motion.div>
  );
};

export default UserProfile;

