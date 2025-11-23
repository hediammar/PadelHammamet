import { motion } from 'framer-motion';
import { Trophy, Medal, Award } from 'lucide-react';

const topPlayers = [
  {
    name: 'Mohamed Salah',
    rank: 1,
    matches: 24,
    winRate: 87,
    borderColor: 'border-yellow-400',
    icon: Trophy,
    gradient: 'from-yellow-400 to-yellow-600',
  },
  {
    name: 'Gadour Asmi',
    rank: 2,
    matches: 22,
    winRate: 82,
    borderColor: 'border-gray-300',
    icon: Medal,
    gradient: 'from-gray-300 to-gray-500',
  },
  {
    name: 'Haythem Salah',
    rank: 3,
    matches: 20,
    winRate: 78,
    borderColor: 'border-amber-600',
    icon: Award,
    gradient: 'from-amber-600 to-amber-800',
  },
];

const Leaderboard = () => {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gradient-green">
            Top Players This Week
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Compete, climb the ranks, and earn your place on the leaderboard
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topPlayers.map((player, index) => {
            const Icon = player.icon;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className={`
                  glass rounded-2xl p-6 border-2 ${player.borderColor} relative overflow-hidden
                  hover:shadow-lg hover:shadow-[var(--color-padel-green)]/30 transition-all duration-300
                `}
              >
                {/* Rank Badge */}
                <div className={`absolute top-4 right-4 w-12 h-12 rounded-full bg-gradient-to-br ${player.gradient} flex items-center justify-center text-white font-bold text-lg`}>
                  {player.rank}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${player.gradient} flex items-center justify-center mb-4`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Player Info */}
                <h3 className="text-xl font-bold text-white mb-2">{player.name}</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">Matches</span>
                    <span className="text-white font-semibold">{player.matches}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">Win Rate</span>
                    <span className="text-gradient-green font-semibold">{player.winRate}%</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 w-full h-2 glass rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${player.winRate}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                    className={`h-full bg-gradient-to-r ${player.gradient} rounded-full`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Leaderboard;

