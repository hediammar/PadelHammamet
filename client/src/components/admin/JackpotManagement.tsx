import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Gift, Plus, Edit2, Trash2, Users, TrendingUp, X, Power } from 'lucide-react';

interface JackpotPrize {
  id: string;
  name: string;
  description?: string;
  prize_type: string;
  emoji?: string;
  icon?: string;
  weight: number;
  is_active: boolean;
  created_at?: string;
}

export function JackpotManagement() {
  const [prizes, setPrizes] = useState<JackpotPrize[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPrize, setEditingPrize] = useState<JackpotPrize | null>(null);
  const [jackpotEnabled, setJackpotEnabled] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prize_type: 'physical',
    emoji: '🎁',
    weight: 5,
  });

  useEffect(() => {
    loadPrizes();
    loadJackpotSettings();
  }, []);

  const loadJackpotSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('jackpot_settings')
        .select('is_enabled')
        .eq('id', 'jackpot_settings')
        .single();

      if (error) throw error;
      setJackpotEnabled(data?.is_enabled ?? true);
    } catch (error) {
      console.error('Error loading jackpot settings:', error);
    }
  };

  const loadPrizes = async () => {
    try {
      setLoading(true);
      
      const { data: prizesData, error: prizesError } = await supabase
        .from('jackpot_prizes')
        .select('*')
        .order('created_at', { ascending: false });

      if (prizesError) throw prizesError;
      setPrizes(prizesData || []);
    } catch (error) {
      console.error('Error loading prizes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleJackpot = async () => {
    try {
      const { error } = await supabase
        .from('jackpot_settings')
        .update({ 
          is_enabled: !jackpotEnabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', 'jackpot_settings');

      if (error) throw error;
      setJackpotEnabled(!jackpotEnabled);
    } catch (error: any) {
      console.error('Error toggling jackpot:', error);
      alert(error.message || 'Failed to update jackpot settings');
    }
  };

  const handleAddPrize = () => {
    setEditingPrize(null);
    setFormData({
      name: '',
      description: '',
      prize_type: 'physical',
      emoji: '🎁',
      weight: 5,
    });
    setShowAddModal(true);
  };

  const handleEditPrize = (prize: JackpotPrize) => {
    setEditingPrize(prize);
    setFormData({
      name: prize.name,
      description: prize.description || '',
      prize_type: prize.prize_type,
      emoji: prize.emoji || '🎁',
      weight: prize.weight || 5,
    });
    setShowAddModal(true);
  };

  const handleSavePrize = async () => {
    try {
      if (!formData.name.trim()) {
        alert('Please enter a prize name');
        return;
      }

      if (!formData.emoji) {
        alert('Please enter an emoji');
        return;
      }

      if (editingPrize) {
        // Update existing prize
        const { error: updateError } = await supabase
          .from('jackpot_prizes')
          .update({
            name: formData.name,
            description: formData.description,
            prize_type: formData.prize_type,
            emoji: formData.emoji,
            weight: formData.weight,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingPrize.id);

        if (updateError) throw updateError;
      } else {
        // Create new prize
        const { error: insertError } = await supabase
          .from('jackpot_prizes')
          .insert({
            name: formData.name,
            description: formData.description,
            prize_type: formData.prize_type,
            emoji: formData.emoji,
            weight: formData.weight,
            is_active: true,
          });

        if (insertError) throw insertError;
      }

      setShowAddModal(false);
      loadPrizes();
    } catch (error: any) {
      console.error('Error saving prize:', error);
      alert(error.message || 'Failed to save prize');
    }
  };

  const handleToggleActive = async (prize: JackpotPrize) => {
    try {
      const { error } = await supabase
        .from('jackpot_prizes')
        .update({ is_active: !prize.is_active })
        .eq('id', prize.id);

      if (error) throw error;
      loadPrizes();
    } catch (error: any) {
      console.error('Error toggling prize:', error);
      alert(error.message || 'Failed to update prize');
    }
  };

  const handleDeletePrize = async (prize: JackpotPrize) => {
    if (!confirm(`Are you sure you want to delete "${prize.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('jackpot_prizes')
        .delete()
        .eq('id', prize.id);

      if (error) throw error;
      loadPrizes();
    } catch (error: any) {
      console.error('Error deleting prize:', error);
      alert(error.message || 'Failed to delete prize');
    }
  };

  // Calculate stats
  const activePrizes = prizes.filter((p) => p.is_active);
  const totalWeight = prizes.reduce((sum, p) => sum + (p.weight || 0), 0);
  const noWinPrizes = prizes.filter((p) => p.prize_type === 'no_win' && p.is_active).length;
  const realPrizes = prizes.filter((p) => p.prize_type !== 'no_win' && p.is_active).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-white/60">Loading prizes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Jackpot Enable/Disable Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 border-2 border-[var(--color-padel-green)]/30"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              jackpotEnabled 
                ? 'bg-[var(--color-padel-green)]/20' 
                : 'bg-gray-500/20'
            }`}>
              <Power className={`w-6 h-6 ${
                jackpotEnabled 
                  ? 'text-[var(--color-padel-green)]' 
                  : 'text-gray-400'
              }`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Jackpot Machine Feature</h3>
              <p className="text-sm text-white/60">
                {jackpotEnabled 
                  ? 'The jackpot is currently active and will show to eligible users' 
                  : 'The jackpot is disabled and will not show to users'}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleJackpot}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              jackpotEnabled 
                ? 'bg-[var(--color-padel-green)]' 
                : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                jackpotEnabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 border-2 border-[var(--color-padel-green)]/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm mb-1">Active Prizes</p>
              <p className="text-3xl font-bold text-white">{activePrizes.length}</p>
            </div>
            <Gift className="w-12 h-12 text-[var(--color-padel-green)]" />
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
              <p className="text-white/60 text-sm mb-1">Real Prizes</p>
              <p className="text-3xl font-bold text-white">{realPrizes}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-[var(--color-padel-green)]" />
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
              <p className="text-white/60 text-sm mb-1">Total Weight</p>
              <p className="text-3xl font-bold text-white">{totalWeight}</p>
            </div>
            <Users className="w-12 h-12 text-[var(--color-padel-green)]" />
          </div>
        </motion.div>
      </div>

      {/* Add Prize Button */}
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddPrize}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-white font-semibold hover:shadow-lg hover:shadow-[var(--color-padel-green)]/50 glow-green transition-all flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Prize</span>
        </motion.button>
      </div>

      {/* Prizes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {prizes.map((prize, index) => (
          <motion.div
            key={prize.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`glass rounded-2xl p-6 border-2 ${
              prize.is_active
                ? 'border-[var(--color-padel-green)]/30'
                : 'border-white/10 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-3xl bg-gradient-to-br from-[var(--color-padel-green)]/20 to-[var(--color-electric-blue)]/20">
                  {prize.emoji || prize.icon || '🎁'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{prize.name}</h3>
                  <p className="text-xs text-white/60 capitalize">{prize.prize_type}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEditPrize(prize)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4 text-white/60" />
                </button>
                <button
                  onClick={() => handleDeletePrize(prize)}
                  className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>

            {prize.description && (
              <p className="text-sm text-white/60 mb-4">{prize.description}</p>
            )}

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/60">Weight (Probability)</span>
                <span className="text-sm font-semibold text-white">
                  {prize.weight || 1}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-[var(--color-padel-green)] h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((prize.weight / totalWeight) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-white/40 mt-1">
                {(prize.weight / totalWeight * 100).toFixed(1)}% chance
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-xs text-white/60">
                Status: {prize.is_active ? 'Active' : 'Inactive'}
              </span>
              <button
                onClick={() => handleToggleActive(prize)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  prize.is_active
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-gray-500/20 text-gray-400'
                }`}
              >
                {prize.is_active ? 'Active' : 'Inactive'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {prizes.length === 0 && (
        <div className="text-center py-12">
          <Gift className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">No prizes configured yet</p>
          <button
            onClick={handleAddPrize}
            className="mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-white font-semibold"
          >
            Add Your First Prize
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong rounded-2xl p-8 max-w-md w-full border-2 border-[var(--color-padel-green)]/30"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gradient-green">
                {editingPrize ? 'Edit Prize' : 'Add Prize'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/80" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Prize Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Shark Energy Drink"
                  className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-[var(--color-padel-green)] focus:outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-[var(--color-padel-green)] focus:outline-none text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Prize Type *</label>
                <select
                  value={formData.prize_type}
                  onChange={(e) => setFormData({ ...formData, prize_type: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-[var(--color-padel-green)] focus:outline-none text-white"
                >
                  <option value="physical">Physical Prize</option>
                  <option value="discount">Discount Prize</option>
                  <option value="no_win">No Win (Tirage au sort)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Emoji *</label>
                <input
                  type="text"
                  value={formData.emoji}
                  onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                  placeholder="🎁"
                  maxLength={2}
                  className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-[var(--color-padel-green)] focus:outline-none text-white text-center text-3xl"
                />
                <p className="text-xs text-white/40 mt-1">Enter an emoji to display in the jackpot machine</p>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Weight (Probability) *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: parseInt(e.target.value) || 1 })
                  }
                  className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-[var(--color-padel-green)] focus:outline-none text-white"
                />
                <p className="text-xs text-white/40 mt-1">
                  Higher weight = more likely to win. No-win prizes typically have weight 10, real prizes 3-5.
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-6 py-3 rounded-xl glass hover:bg-white/10 transition-colors text-white font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePrize}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-white font-semibold hover:shadow-lg hover:shadow-[var(--color-padel-green)]/50 glow-green transition-all"
              >
                {editingPrize ? 'Update' : 'Add'} Prize
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
