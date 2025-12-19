import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Gift, Plus, Edit2, Trash2, Package, Users, TrendingUp, X, Power } from 'lucide-react';

interface WheelPrize {
  id: string;
  name: string;
  description?: string;
  prize_type: string;
  color?: string;
  icon?: string;
  is_active: boolean;
  created_at?: string;
}

interface PrizeInventory {
  id: string;
  prize_id: string;
  quantity: number;
  reserved_quantity: number;
}

interface PrizeWithInventory extends WheelPrize {
  inventory?: PrizeInventory;
}

export function WheelManagement() {
  const [prizes, setPrizes] = useState<PrizeWithInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPrize, setEditingPrize] = useState<PrizeWithInventory | null>(null);
  const [wheelEnabled, setWheelEnabled] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prize_type: 'physical',
    color: '#00ff88',
    icon: '🎁',
    quantity: 0,
  });

  useEffect(() => {
    loadPrizes();
    loadWheelSettings();
  }, []);

  const loadWheelSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('wheel_settings')
        .select('is_enabled')
        .eq('id', 'wheel_settings')
        .single();

      if (error) throw error;
      setWheelEnabled(data?.is_enabled ?? true);
    } catch (error) {
      console.error('Error loading wheel settings:', error);
    }
  };

  const loadPrizes = async () => {
    try {
      setLoading(true);
      
      // Load all prizes (including inactive)
      const { data: prizesData, error: prizesError } = await supabase
        .from('wheel_prizes')
        .select('*')
        .order('created_at', { ascending: false });

      if (prizesError) throw prizesError;

      // Load inventory for each prize
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('wheel_prize_inventory')
        .select('*');

      if (inventoryError) throw inventoryError;

      // Combine prizes with inventory
      const prizesWithInventory: PrizeWithInventory[] = (prizesData || []).map((prize) => {
        const inventory = inventoryData?.find((inv) => inv.prize_id === prize.id);
        return {
          ...prize,
          inventory,
        };
      });

      setPrizes(prizesWithInventory);
    } catch (error) {
      console.error('Error loading prizes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWheel = async () => {
    try {
      const { error } = await supabase
        .from('wheel_settings')
        .update({ 
          is_enabled: !wheelEnabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', 'wheel_settings');

      if (error) throw error;
      setWheelEnabled(!wheelEnabled);
    } catch (error: any) {
      console.error('Error toggling wheel:', error);
      alert(error.message || 'Failed to update wheel settings');
    }
  };

  const handleAddPrize = () => {
    setEditingPrize(null);
    setFormData({
      name: '',
      description: '',
      prize_type: 'physical',
      color: '#00ff88',
      icon: '🎁',
      quantity: 0,
    });
    setShowAddModal(true);
  };

  const handleEditPrize = (prize: PrizeWithInventory) => {
    setEditingPrize(prize);
    setFormData({
      name: prize.name,
      description: prize.description || '',
      prize_type: prize.prize_type,
      color: prize.color || '#00ff88',
      icon: prize.icon || '🎁',
      quantity: prize.inventory?.quantity || 0,
    });
    setShowAddModal(true);
  };

  const handleSavePrize = async () => {
    try {
      if (!formData.name.trim()) {
        alert('Please enter a prize name');
        return;
      }

      if (editingPrize) {
        // Update existing prize
        const { error: updateError } = await supabase
          .from('wheel_prizes')
          .update({
            name: formData.name,
            description: formData.description,
            prize_type: formData.prize_type,
            color: formData.color,
            icon: formData.icon,
          })
          .eq('id', editingPrize.id);

        if (updateError) throw updateError;

        // Update or create inventory
        if (formData.prize_type !== 'no_win') {
          if (editingPrize.inventory) {
            // Update existing inventory
            const { error: invError } = await supabase
              .from('wheel_prize_inventory')
              .update({
                quantity: formData.quantity,
              })
              .eq('id', editingPrize.inventory.id);

            if (invError) throw invError;
          } else {
            // Create new inventory
            const { error: invError } = await supabase
              .from('wheel_prize_inventory')
              .insert({
                prize_id: editingPrize.id,
                quantity: formData.quantity,
              });

            if (invError) throw invError;
          }
        }
      } else {
        // Create new prize
        const { data: newPrize, error: insertError } = await supabase
          .from('wheel_prizes')
          .insert({
            name: formData.name,
            description: formData.description,
            prize_type: formData.prize_type,
            color: formData.color,
            icon: formData.icon,
            is_active: true,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Create inventory if not no_win
        if (formData.prize_type !== 'no_win' && formData.quantity > 0) {
          const { error: invError } = await supabase
            .from('wheel_prize_inventory')
            .insert({
              prize_id: newPrize.id,
              quantity: formData.quantity,
            });

          if (invError) throw invError;
        }
      }

      setShowAddModal(false);
      loadPrizes();
    } catch (error: any) {
      console.error('Error saving prize:', error);
      alert(error.message || 'Failed to save prize');
    }
  };

  const handleToggleActive = async (prize: PrizeWithInventory) => {
    try {
      const { error } = await supabase
        .from('wheel_prizes')
        .update({ is_active: !prize.is_active })
        .eq('id', prize.id);

      if (error) throw error;
      loadPrizes();
    } catch (error: any) {
      console.error('Error toggling prize:', error);
      alert(error.message || 'Failed to update prize');
    }
  };

  const handleDeletePrize = async (prize: PrizeWithInventory) => {
    if (!confirm(`Are you sure you want to delete "${prize.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('wheel_prizes')
        .delete()
        .eq('id', prize.id);

      if (error) throw error;
      loadPrizes();
    } catch (error: any) {
      console.error('Error deleting prize:', error);
      alert(error.message || 'Failed to delete prize');
    }
  };

  const handleUpdateQuantity = async (prize: PrizeWithInventory, newQuantity: number) => {
    if (newQuantity < 0) return;

    try {
      if (prize.inventory) {
        // Update existing inventory, preserve reserved_quantity
        const { error } = await supabase
          .from('wheel_prize_inventory')
          .update({ 
            quantity: newQuantity,
            // Preserve reserved_quantity if it exists
            reserved_quantity: prize.inventory.reserved_quantity || 0
          })
          .eq('id', prize.inventory.id);

        if (error) throw error;
      } else {
        // Create new inventory
        const { error } = await supabase
          .from('wheel_prize_inventory')
          .insert({
            prize_id: prize.id,
            quantity: newQuantity,
            reserved_quantity: 0,
          });

        if (error) throw error;
      }

      loadPrizes();
    } catch (error: any) {
      console.error('Error updating quantity:', error);
      alert(error.message || 'Failed to update quantity');
    }
  };

  // Calculate stats
  const activePrizes = prizes.filter((p) => p.is_active);
  const totalQuantity = prizes.reduce((sum, p) => sum + (p.inventory?.quantity || 0), 0);
  const totalReserved = prizes.reduce((sum, p) => sum + (p.inventory?.reserved_quantity || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-white/60">Loading prizes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wheel Enable/Disable Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 border-2 border-[var(--color-padel-green)]/30"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              wheelEnabled 
                ? 'bg-[var(--color-padel-green)]/20' 
                : 'bg-gray-500/20'
            }`}>
              <Power className={`w-6 h-6 ${
                wheelEnabled 
                  ? 'text-[var(--color-padel-green)]' 
                  : 'text-gray-400'
              }`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Wheel of Gifts Feature</h3>
              <p className="text-sm text-white/60">
                {wheelEnabled 
                  ? 'The wheel is currently active and will show to eligible users' 
                  : 'The wheel is disabled and will not show to users'}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleWheel}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              wheelEnabled 
                ? 'bg-[var(--color-padel-green)]' 
                : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                wheelEnabled ? 'translate-x-7' : 'translate-x-1'
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
              <p className="text-white/60 text-sm mb-1">Total Available</p>
              <p className="text-3xl font-bold text-white">{totalQuantity}</p>
            </div>
            <Package className="w-12 h-12 text-[var(--color-padel-green)]" />
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
              <p className="text-white/60 text-sm mb-1">Reserved</p>
              <p className="text-3xl font-bold text-white">{totalReserved}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-[var(--color-padel-green)]" />
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
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: prize.color || '#00ff88' }}
                >
                  {prize.icon || '🎁'}
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

            {prize.prize_type !== 'no_win' && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/60">Quantity</span>
                  <span className="text-sm font-semibold text-white">
                    {prize.inventory?.quantity || 0} available
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    value={prize.inventory?.quantity || 0}
                    onChange={(e) =>
                      handleUpdateQuantity(prize, parseInt(e.target.value) || 0)
                    }
                    className="flex-1 px-3 py-2 rounded-lg glass border border-white/10 focus:border-[var(--color-padel-green)] focus:outline-none text-white text-sm"
                  />
                </div>
                {prize.inventory?.reserved_quantity > 0 && (
                  <p className="text-xs text-yellow-400 mt-1">
                    {prize.inventory.reserved_quantity} reserved
                  </p>
                )}
              </div>
            )}

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
                  <option value="digital">Digital Prize</option>
                  <option value="no_win">No Win (Tirage au sort)</option>
                </select>
              </div>

              {formData.prize_type !== 'no_win' && (
                <div>
                  <label className="block text-sm text-white/60 mb-2">Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-[var(--color-padel-green)] focus:outline-none text-white"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Color</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-12 rounded-xl cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Icon/Emoji</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="🎁"
                    maxLength={2}
                    className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-[var(--color-padel-green)] focus:outline-none text-white text-center text-2xl"
                  />
                </div>
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
