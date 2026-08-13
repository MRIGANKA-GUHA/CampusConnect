import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  LogOut, Shield, Calendar, Loader2,
  CalendarCheck, CalendarClock, CreditCard, BadgeCheck,
  Bell, ClipboardList, Users, Megaphone, Settings, Plus, MessageSquare, ArrowRight
} from 'lucide-react';
import { useState, useEffect } from 'react';
import SmartHeader from '../../components/SmartHeader';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [stats, setStats] = useState({
    eventsJoined: null,
    upcomingEvents: null,
    savedNotices: null,
    clubsJoined: null,
  });
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/student/stats');
        if (res.data?.stats) {
          setStats(res.data.stats);
        }
      } catch (err) {
        setStats({ eventsJoined: '0', upcomingEvents: '0', savedNotices: '0', clubsJoined: '0' });
      } finally {
        setLoadingStats(false);
      }
    };
    
    const fetchActivities = async () => {
      try {
        const res = await api.get('/admin/notices');
        const notices = res.data?.notices || [];
        const recent = notices
          .filter(n => !n.targetAudience || n.targetAudience.toLowerCase() === 'students')
          .slice(0, 3)
          .map(n => ({
            icon: Bell,
            label: `New Notice: ${n.title}`,
            time: new Date(n.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
            color: 'bg-indigo-100 dark:bg-indigo-500/20',
            iconColor: 'text-indigo-600 dark:text-indigo-400'
          }));
        
        if (recent.length === 0) {
          recent.push({
            icon: Users,
            label: 'Welcome to CampusConnect!',
            time: 'Just now',
            color: 'bg-emerald-100 dark:bg-emerald-500/20',
            iconColor: 'text-emerald-600 dark:text-emerald-400'
          });
        }
        setRecentActivities(recent);
      } catch (err) {
        console.error('Failed to fetch activities:', err);
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchStats();
    fetchActivities();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) return null;

  const statCards = [
    { label: 'Events Joined', value: stats.eventsJoined, icon: CalendarCheck, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-500/10' },
    { label: 'Upcoming Events', value: stats.upcomingEvents, icon: CalendarClock, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-500/10' },
    { label: 'Saved Notices', value: stats.savedNotices, icon: Bell, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-500/10' },
    { label: 'Clubs Joined', value: stats.clubsJoined, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-500/10' },
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
                  <p className="text-xl sm:text-3xl font-black tracking-tight">
                    {loadingStats ? <Loader2 className="w-5 h-5 animate-spin text-slate-400 mt-1" /> : stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

          {/* ── Left: Recent Activity ── */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Recent Activity */}
            <section className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[1.5rem] sm:rounded-3xl p-6 sm:p-8 overflow-hidden">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold">Recent Activity</h2>
                <Link to="/student/notices" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-4 sm:space-y-6">
                {loadingActivities ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                  </div>
                ) : (
                  recentActivities.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                      <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center shrink-0`}>
                        <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.label}</p>
                        <p className="text-xs sm:text-sm text-slate-500">{item.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* ── Right: Quick Access ── */}
          <aside className="space-y-6 sm:space-y-8">
            <section className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[1.5rem] sm:rounded-3xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-6 tracking-tight">Quick Access</h3>
              <div className="grid grid-cols-2 gap-4">
                <Link to="/student/notices" className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all font-bold text-sm border border-amber-100 dark:border-amber-500/20 active:scale-95 text-center">
                  <Bell className="w-6 h-6" />
                  Notices
                </Link>
                <Link to="/student/clubs" className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all font-bold text-sm border border-indigo-100 dark:border-indigo-500/20 active:scale-95 text-center">
                  <Users className="w-6 h-6" />
                  Clubs
                </Link>
                <Link to="/student/events" className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all font-bold text-sm border border-slate-100 dark:border-white/5 active:scale-95 text-center">
                  <ClipboardList className="w-6 h-6" />
                  Events
                </Link>
                <Link to="/student/chat" className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all font-bold text-sm border border-slate-100 dark:border-white/5 active:scale-95 text-center">
                  <MessageSquare className="w-6 h-6" />
                  Chat
                </Link>
              </div>
            </section>
          </aside>

        </div>
      </div>
    </div>
  );
}
