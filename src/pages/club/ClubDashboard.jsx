import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SmartHeader from '../../components/SmartHeader';
import api from '../../services/api';
import {
  Users, Calendar, CalendarCheck, Bell, ArrowRight,
  Loader2, Settings, ClipboardList
} from 'lucide-react';

export default function ClubDashboard() {
  const { user } = useAuth();
  const [club, setClub] = useState(null);
  const [stats, setStats] = useState(null);
  const [loadingClub, setLoadingClub] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/club/profile');
        setClub(res.data.club);
      } catch (err) {
        console.error('Failed to fetch club profile:', err);
      } finally {
        setLoadingClub(false);
      }
    };
    const fetchStats = async () => {
      try {
        const res = await api.get('/club/stats');
        setStats(res.data.stats);
      } catch (err) {
        console.error('Failed to fetch club stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };
    const fetchEvents = async () => {
      try {
        const res = await api.get('/club/events');
        // Just take top 3 most recent events for the activity feed
        setEvents((res.data.events || []).slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch events:', err);
      }
    };
    fetchProfile();
    fetchStats();
    fetchEvents();
  }, []);

  const statCards = [
    { label: 'Total Members', value: loadingStats ? '...' : (stats?.totalMembers?.toLocaleString() ?? '—'), icon: Users, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-500/10' },
    { label: 'Upcoming Events', value: loadingStats ? '...' : (stats?.upcomingEvents?.toLocaleString() ?? '—'), icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-500/10' },
    { label: 'Past Events', value: loadingStats ? '...' : (stats?.pastEvents?.toLocaleString() ?? '—'), icon: CalendarCheck, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-500/10' },
    { label: 'Notices Posted', value: loadingStats ? '...' : (stats?.noticesPosted?.toLocaleString() ?? '—'), icon: Bell, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-500/10' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-sans">
      <SmartHeader />

      <div className="max-w-7xl mx-auto pt-24 sm:pt-32 px-4 sm:px-8 pb-8 sm:pb-12">

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
          {statCards.map((stat, i) => (
            <div key={i} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-4 sm:p-6 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className={`p-3 sm:p-4 rounded-2xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-[10px] sm:text-sm font-bold text-slate-400 uppercase tracking-widest leading-tight mb-0.5 sm:mb-0">{stat.label}</p>
                    <p className="text-xl sm:text-3xl font-black tracking-tight">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

          {/* ── Left: Club Info & Recent Events ── */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            


            {/* Recent Events List */}
            <section className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[1.5rem] sm:rounded-3xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold">Recent Events</h2>
                <Link to="/club/events" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-4">
                {events.length > 0 ? events.map((event, i) => (
                  <div key={event.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
                      <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate pr-4">{event.title}</p>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">{event.status}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500">{event.date} {event.time && `• ${event.time}`}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-slate-500">No events posted yet.</p>
                )}
              </div>
            </section>
          </div>

          {/* ── Right: Quick Access ── */}
          <aside className="space-y-6 sm:space-y-8">
            <section className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[1.5rem] sm:rounded-3xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-6 tracking-tight">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <Link to="/club/events" className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all font-bold text-sm border border-indigo-100 dark:border-indigo-500/20 active:scale-95 text-center">
                  <ClipboardList className="w-6 h-6" />
                  Manage Events
                </Link>
                <Link to="/club/notices" className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all font-bold text-sm border border-slate-100 dark:border-white/5 active:scale-95 text-center">
                  <Bell className="w-6 h-6" />
                  Post Notice
                </Link>
                <Link to="/club/members" className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all font-bold text-sm border border-slate-100 dark:border-white/5 active:scale-95 text-center">
                  <Users className="w-6 h-6" />
                  Members
                </Link>
                <Link to="/club/profile" className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all font-bold text-sm border border-slate-100 dark:border-white/5 active:scale-95 text-center">
                  <Settings className="w-6 h-6" />
                  Edit Profile
                </Link>
              </div>
            </section>
          </aside>

        </div>
      </div>
    </div>
  );
}
