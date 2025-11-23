import { motion } from 'framer-motion';
import { useFidelity } from '../../hooks/useFidelity';

interface ProfileCardProps {
  userId?: string;
  userName?: string;
  userEmail?: string;
  userPicture?: string;
}

const ProfileCard = ({ 
  userId, 
  userName = 'Player',
  userEmail,
  userPicture 
}: ProfileCardProps) => {
  const { level, totalXP, hasDiscount, totalBookings } = useFidelity(userId);
  
  // Use totalBookings from useFidelity hook (already filtered by userId)
  const userBookings = totalBookings;

  // Placeholder win rate (would come from match results in real app)
  const winRate = 0.75; // 75% placeholder

  const levelColors: Record<string, string> = {
    Rookie: 'from-gray-400 to-gray-600',
    Bronze: 'from-amber-600 to-amber-800',
    Silver: 'from-gray-300 to-gray-500',
    Gold: 'from-yellow-400 to-yellow-600',
    Platinum: 'from-purple-400 to-purple-600',
  };

  const levelColor = levelColors[level] || levelColors.Rookie;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden glass-strong rounded-2xl p-8 border-2 border-white/10"
    >
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Gradient overlay */}
      <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${levelColor} opacity-20 blur-3xl`} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            {userPicture && (
              <motion.img
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring' }}
                src={userPicture}
                alt={userName}
                className="w-16 h-16 rounded-full border-2 border-[var(--color-padel-green)] shadow-lg"
              />
            )}
            <div>
              <h2 className="text-3xl font-bold mb-2 text-gradient-green">{userName}</h2>
              {userEmail ? (
                <p className="text-white/60 text-sm">{userEmail}</p>
              ) : (
                <p className="text-white/60 text-sm">Padel Player</p>
              )}
            </div>
          </div>
          
          {/* Level Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className={`px-4 py-2 rounded-xl bg-gradient-to-r ${levelColor} text-white font-bold text-sm shadow-lg`}
          >
            {level}
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Matches */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl p-4 border border-white/10"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--color-padel-green)] to-[var(--color-electric-blue)] flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[var(--color-dark-bg)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-white/60 text-xs uppercase tracking-wider">Matches</p>
                <p className="text-2xl font-bold text-white">{userBookings}</p>
              </div>
            </div>
          </motion.div>

          {/* Win Rate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-xl p-4 border border-white/10"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--color-electric-blue)] to-[var(--color-padel-green)] flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[var(--color-dark-bg)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <div>
                <p className="text-white/60 text-xs uppercase tracking-wider">Win Rate</p>
                <p className="text-2xl font-bold text-white">{(winRate * 100).toFixed(0)}%</p>
              </div>
            </div>
          </motion.div>

          {/* XP Points */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-xl p-4 border border-white/10"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[var(--color-dark-bg)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <div>
                <p className="text-white/60 text-xs uppercase tracking-wider">XP Points</p>
                <p className="text-2xl font-bold text-gradient-green">{totalXP}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Discount Badge */}
        {hasDiscount && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 p-4 glass rounded-xl border-2 border-[var(--color-padel-green)]/50 bg-gradient-to-r from-[var(--color-padel-green)]/10 to-[var(--color-electric-blue)]/10"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[var(--color-padel-green)] flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[var(--color-dark-bg)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gradient-green">10% Discount Active</p>
                <p className="text-xs text-white/60">Apply on your next booking</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ProfileCard;

