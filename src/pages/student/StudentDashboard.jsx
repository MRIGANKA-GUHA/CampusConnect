import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  LogOut, Shield, Calendar, Loader2,
  CalendarCheck, CalendarClock, CreditCard, BadgeCheck,
  Bell, ClipboardList, Users, Megaphone, Settings, Plus, MessageSquare
} from 'lucide-react';
import { useState, useEffect } from 'react';
import SmartHeader from '../../components/SmartHeader';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loadingStats, setLoadingStats] = useState(true);
  const [stats, setStats] = useState({
    eventsJoined: null,
    upcomingEvents: null,
    paymentsPending: null,
    paymentsApproved: null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Placeholder — wire to real API when ready
        setStats({ eventsJoined: 0, upcomingEvents: 0, paymentsPending: 0, paymentsApproved: 0 });
      } catch (err) {
        setStats({ eventsJoined: '—', upcomingEvents: '—', paymentsPending: '—', paymentsApproved: '—' });
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
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

  const avatarSrc = user.photoURL ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName || user.email}&backgroundColor=4f46e5&textColor=ffffff`;

  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : 'N/A';

  const statCards = [
    { label: 'Events Joined', value: stats.eventsJoined, icon: CalendarCheck, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-500/10' },
    { label: 'Upcoming Events', value: stats.upcomingEvents, icon: CalendarClock, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-500/10' },
    { label: 'Payments Pending', value: stats.paymentsPending, icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-500/10' },
    { label: 'Payments Approved', value: stats.paymentsApproved, icon: BadgeCheck, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-500/10' },
  ];

  const recentActivities = [
    { icon: CalendarCheck, label: 'You joined Tech Fest 2026', time: 'Today, 02:30 AM', color: 'bg-indigo-100 dark:bg-indigo-500/20', iconColor: 'text-indigo-600 dark:text-indigo-400' },
    { icon: CreditCard, label: 'Payment submitted for Annual Day', time: 'Yesterday, 11:45 PM', color: 'bg-amber-100 dark:bg-amber-500/20', iconColor: 'text-amber-600 dark:text-amber-400' },
    { icon: Bell, label: 'New notice: Holiday on 15 Apr', time: '13 Apr, 09:00 AM', color: 'bg-rose-100 dark:bg-rose-500/20', iconColor: 'text-rose-600 dark:text-rose-400' },
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
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Recent Activity</h2>
              <div className="space-y-4 sm:space-y-6">
                {recentActivities.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                    <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center shrink-0`}>
                      <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.label}</p>
                      <p className="text-xs sm:text-sm text-slate-500">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── Right: Quick Access ── */}
          <aside className="space-y-6 sm:space-y-8">
            <section className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[1.5rem] sm:rounded-3xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-6 tracking-tight">Quick Access</h3>
              <div className="grid grid-cols-2 gap-4">
                <Link to="/student/notices" className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all font-bold text-sm border border-amber-100 dark:border-amber-500/20 active:scale-95">
                  <Bell className="w-6 h-6" />
                  Notices
                </Link>
                <Link to="/student/clubs" className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all font-bold text-sm border border-indigo-100 dark:border-indigo-500/20 active:scale-95">
                  <Users className="w-6 h-6" />
                  Clubs
                </Link>
                <Link to="/student/events" className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all font-bold text-sm border border-slate-100 dark:border-white/5 active:scale-95">
                  <ClipboardList className="w-6 h-6" />
                  Events
                </Link>
                <Link to="/student/chat" className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all font-bold text-sm border border-slate-100 dark:border-white/5 active:scale-95">
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
