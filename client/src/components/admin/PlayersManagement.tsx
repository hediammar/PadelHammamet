import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { User, Search, TrendingUp, Calendar, Phone, Mail } from 'lucide-react';

interface Player {
  id: string;
  username: string;
  name?: string;
  email?: string;
  phone_prefix?: string;
  phone_number?: string;
  picture?: string;
  created_at?: string;
  reservation_count?: number;
}

export function PlayersManagement() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Fetch reservation counts for each user
      const { data: reservationsData } = await supabase
        .from('reservations')
        .select('user_id');

      // Count reservations per user
      const reservationCounts: Record<string, number> = {};
      reservationsData?.forEach((r) => {
        reservationCounts[r.user_id] = (reservationCounts[r.user_id] || 0) + 1;
      });

      // Combine user data with reservation counts
      const playersWithStats: Player[] = (usersData || []).map((user) => ({
        id: user.id,
        username: user.username || '',
        name: user.name,
        email: user.email,
        phone_prefix: user.phone_prefix,
        phone_number: user.phone_number,
        picture: user.picture,
        created_at: user.created_at,
        reservation_count: reservationCounts[user.id] || 0,
      }));

      setPlayers(playersWithStats);
    } catch (error) {
      console.error('Error loading players:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = players.filter((player) =>
    player.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalReservations = players.reduce((sum, p) => sum + (p.reservation_count || 0), 0);
  const totalPlayers = players.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-white/60">Loading players...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 border-2 border-[var(--color-padel-green)]/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm mb-1">Total Players</p>
              <p className="text-3xl font-bold text-white">{totalPlayers}</p>
            </div>
            <User className="w-12 h-12 text-[var(--color-padel-green)]" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 border-2 border-[var(--color-padel-green)]/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm mb-1">Total Reservations</p>
              <p className="text-3xl font-bold text-white">{totalReservations}</p>
            </div>
            <Calendar className="w-12 h-12 text-[var(--color-padel-green)]" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 border-2 border-[var(--color-padel-green)]/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm mb-1">Avg. per Player</p>
              <p className="text-3xl font-bold text-white">
                {totalPlayers > 0 ? (totalReservations / totalPlayers).toFixed(1) : '0'}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-[var(--color-padel-green)]" />
          </div>
        </motion.div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          type="text"
          placeholder="Search players by username, name, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl glass border border-white/10 focus:border-[var(--color-padel-green)] focus:outline-none focus:ring-2 focus:ring-[var(--color-padel-green)]/20 text-white placeholder-white/40"
        />
      </div>

      {/* Players List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlayers.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setSelectedPlayer(player)}
            className="glass rounded-2xl p-6 border-2 border-[var(--color-padel-green)]/30 hover:border-[var(--color-padel-green)]/50 cursor-pointer transition-all"
          >
            <div className="flex items-start space-x-4">
              {player.picture ? (
                <img
                  src={player.picture}
                  alt={player.username}
                  className="w-16 h-16 rounded-full border-2 border-[var(--color-padel-green)]"
                />
              ) : (
                <div className="w-16 h-16 rounded-full border-2 border-[var(--color-padel-green)] bg-gradient-to-br from-[var(--color-padel-green)] to-[var(--color-electric-blue)] flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {player.username?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white truncate">
                  {player.username}
                </h3>
                {player.name && (
                  <p className="text-sm text-white/60 truncate">{player.name}</p>
                )}
                <div className="mt-2 space-y-1">
                  {player.email && (
                    <div className="flex items-center space-x-2 text-xs text-white/60">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{player.email}</span>
                    </div>
                  )}
                  {player.phone_prefix && player.phone_number && (
                    <div className="flex items-center space-x-2 text-xs text-white/60">
                      <Phone className="w-3 h-3" />
                      <span>{player.phone_prefix}{player.phone_number}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-[var(--color-padel-green)]" />
                  <span className="text-sm font-semibold text-[var(--color-padel-green)]">
                    {player.reservation_count || 0} reservations
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/60">No players found</p>
        </div>
      )}

      {/* Player Detail Modal */}
      {selectedPlayer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPlayer(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong rounded-2xl p-8 max-w-md w-full border-2 border-[var(--color-padel-green)]/30"
          >
            <div className="flex items-center space-x-4 mb-6">
              {selectedPlayer.picture ? (
                <img
                  src={selectedPlayer.picture}
                  alt={selectedPlayer.username}
                  className="w-20 h-20 rounded-full border-2 border-[var(--color-padel-green)]"
                />
              ) : (
                <div className="w-20 h-20 rounded-full border-2 border-[var(--color-padel-green)] bg-gradient-to-br from-[var(--color-padel-green)] to-[var(--color-electric-blue)] flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {selectedPlayer.username?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedPlayer.username}</h2>
                {selectedPlayer.name && (
                  <p className="text-white/60">{selectedPlayer.name}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {selectedPlayer.email && (
                <div>
                  <p className="text-white/60 text-sm mb-1">Email</p>
                  <p className="text-white">{selectedPlayer.email}</p>
                </div>
              )}
              {selectedPlayer.phone_prefix && selectedPlayer.phone_number && (
                <div>
                  <p className="text-white/60 text-sm mb-1">Phone</p>
                  <p className="text-white">
                    {selectedPlayer.phone_prefix}{selectedPlayer.phone_number}
                  </p>
                </div>
              )}
              <div>
                <p className="text-white/60 text-sm mb-1">Total Reservations</p>
                <p className="text-2xl font-bold text-[var(--color-padel-green)]">
                  {selectedPlayer.reservation_count || 0}
                </p>
              </div>
              {selectedPlayer.created_at && (
                <div>
                  <p className="text-white/60 text-sm mb-1">Member Since</p>
                  <p className="text-white">
                    {new Date(selectedPlayer.created_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedPlayer(null)}
              className="mt-6 w-full px-6 py-3 rounded-xl glass hover:bg-white/10 transition-colors text-white font-semibold"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

