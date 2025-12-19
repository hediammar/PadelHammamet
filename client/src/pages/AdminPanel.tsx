import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AdminCalendar } from '../components/admin/AdminCalendar';
import { PlayersManagement } from '../components/admin/PlayersManagement';
import { JackpotManagement } from '../components/admin/JackpotManagement';
import { AddReservationModal } from '../components/admin/AddReservationModal';
import { ReservationDetailModal } from '../components/admin/ReservationDetailModal';
import { AdminAuthGuard } from '../components/admin/AdminAuthGuard';
import { supabase } from '../lib/supabase';
import { Calendar, Users, Plus, Gift } from 'lucide-react';
import { parse, format } from 'date-fns';
import { generatePadelSlots, formatDateLocal } from '../utils/dateHelpers';

type Tab = 'calendar' | 'players' | 'jackpot';

interface CalendarEvent {
  id: string;
  name: string;
  time: string;
  datetime: string;
  courtId: string;
  userId: string;
}

interface CalendarData {
  day: Date;
  events: CalendarEvent[];
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('calendar');
  const [reservations, setReservations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedDayForList, setSelectedDayForList] = useState<Date | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<any | null>(null);
  const [editReservation, setEditReservation] = useState<any | null>(null);

  useEffect(() => {
    loadData();
    
    // Subscribe to real-time changes
    const subscription = supabase
      .channel('admin-reservations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load reservations
      const { data: reservationsData, error: reservationsError } = await supabase
        .from('reservations')
        .select('*')
        .order('date', { ascending: true });

      if (reservationsError) throw reservationsError;

      // Load users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*');

      if (usersError) throw usersError;

      setReservations(reservationsData || []);
      setUsers(usersData || []);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Transform reservations into calendar data format
  const calendarData: CalendarData[] = useMemo(() => {
    const timeSlots = generatePadelSlots(8, 23);
    const dataMap = new Map<string, CalendarEvent[]>();

    reservations.forEach((reservation) => {
      const date = parse(reservation.date, 'yyyy-MM-dd', new Date());
      const dateKey = date.toISOString();
      
      // Find user info
      const user = users.find((u) => u.id === reservation.user_id);
      const userName = user?.username || user?.name || 'Unknown User';
      
      // Find time slot display
      const slot = timeSlots.find((s) => s.id === reservation.time_slot);
      const timeDisplay = slot?.display || reservation.time_slot;

      if (!dataMap.has(dateKey)) {
        dataMap.set(dateKey, []);
      }

      dataMap.get(dateKey)!.push({
        id: reservation.id,
        name: userName,
        time: timeDisplay,
        datetime: `${reservation.date}T${reservation.time_slot}`,
        courtId: reservation.court_id,
        userId: reservation.user_id,
      });
    });

    return Array.from(dataMap.entries()).map(([dateKey, events]) => ({
      day: new Date(dateKey),
      events,
    }));
  }, [reservations, users]);

  const handleDayClick = (day: Date) => {
    setSelectedDayForList(day);
  };

  const handleAddEvent = () => {
    setSelectedDate(undefined);
    setSelectedDayForList(null);
    setShowAddModal(true);
  };

  // Get reservations for selected day
  const selectedDayReservations = useMemo(() => {
    if (!selectedDayForList) return [];
    
    const dateString = formatDateLocal(selectedDayForList);
    return reservations
      .filter((r) => r.date === dateString)
      .map((reservation) => {
        const user = users.find((u) => u.id === reservation.user_id);
        return { ...reservation, user };
      })
      .sort((a, b) => a.time_slot.localeCompare(b.time_slot));
  }, [selectedDayForList, reservations, users]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/60">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <AdminAuthGuard>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gradient-green">
            Admin Panel
          </h1>
          <p className="text-white/60">
            Manage reservations and track players
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-6 py-3 font-semibold transition-colors relative ${
              activeTab === 'calendar'
                ? 'text-[var(--color-padel-green)]'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Calendar</span>
            </div>
            {activeTab === 'calendar' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-padel-green)]"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('players')}
            className={`px-6 py-3 font-semibold transition-colors relative ${
              activeTab === 'players'
                ? 'text-[var(--color-padel-green)]'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Players</span>
            </div>
            {activeTab === 'players' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-padel-green)]"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('jackpot')}
            className={`px-6 py-3 font-semibold transition-colors relative ${
              activeTab === 'jackpot'
                ? 'text-[var(--color-padel-green)]'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Gift className="w-5 h-5" />
              <span>Jackpot Machine</span>
            </div>
            {activeTab === 'jackpot' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-padel-green)]"
              />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-4 md:p-6 border-2 border-[var(--color-padel-green)]/30"
        >
          {activeTab === 'calendar' ? (
            <div className="space-y-6">
              <AdminCalendar
                data={calendarData}
                onDayClick={handleDayClick}
                onAddEvent={handleAddEvent}
              />
              
              {/* Reservations List for Selected Day */}
              {selectedDayForList && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl p-6 border-2 border-[var(--color-padel-green)]/30"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        Reservations for {format(selectedDayForList, 'EEEE, MMMM d, yyyy')}
                      </h3>
                      <p className="text-white/60 text-sm">
                        {selectedDayReservations.length} reservation{selectedDayReservations.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedDate(selectedDayForList);
                        setShowAddModal(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-white font-semibold hover:opacity-90 transition-opacity flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>

                  {selectedDayReservations.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDayReservations.map((reservation) => {
                        const user = reservation.user;
                        const timeSlot = reservation.time_slot;
                        return (
                          <motion.div
                            key={reservation.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => setSelectedReservation(reservation)}
                            className="p-4 rounded-xl glass border border-white/10 hover:border-[var(--color-padel-green)]/50 cursor-pointer transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 flex-1">
                                {user?.picture ? (
                                  <img
                                    src={user.picture}
                                    alt={user.username || user.name}
                                    className="w-12 h-12 rounded-full border-2 border-[var(--color-padel-green)]"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-full border-2 border-[var(--color-padel-green)] bg-gradient-to-br from-[var(--color-padel-green)] to-[var(--color-electric-blue)] flex items-center justify-center">
                                    <span className="text-lg font-bold text-white">
                                      {(user?.username || user?.name || '?')[0]?.toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-semibold truncate">
                                    {user?.username || user?.name || 'Unknown User'}
                                  </p>
                                  <div className="flex items-center space-x-4 mt-1">
                                    <span className="text-white/60 text-sm">
                                      {reservation.court_id === 'court-1' ? 'Court 1' : 'Court 2'}
                                    </span>
                                    <span className="text-white/60 text-sm">{timeSlot}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="w-2 h-2 rounded-full bg-[var(--color-padel-green)]"></div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-white/60">No reservations for this day</p>
                      <button
                        onClick={() => {
                          setSelectedDate(selectedDayForList);
                          setShowAddModal(true);
                        }}
                        className="mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-white font-semibold hover:opacity-90 transition-opacity"
                      >
                        Add Reservation
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          ) : activeTab === 'players' ? (
            <PlayersManagement />
          ) : (
            <JackpotManagement />
          )}
        </motion.div>

        {/* Add/Edit Reservation Modal */}
        <AddReservationModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setSelectedDate(undefined);
            setEditReservation(null);
          }}
          onSuccess={() => {
            loadData();
            setEditReservation(null);
          }}
          selectedDate={selectedDate}
          reservations={reservations}
          editReservation={editReservation}
        />

        {/* Reservation Detail Modal */}
        <ReservationDetailModal
          isOpen={!!selectedReservation}
          onClose={() => setSelectedReservation(null)}
          onEdit={() => {
            setEditReservation(selectedReservation);
            setSelectedReservation(null);
            setShowAddModal(true);
          }}
          onCancel={() => {
            loadData();
            if (selectedDayForList) {
              // Refresh the selected day list
            }
          }}
          reservation={selectedReservation}
          user={selectedReservation?.user || null}
        />
        </div>
      </div>
    </AdminAuthGuard>
  );
}

