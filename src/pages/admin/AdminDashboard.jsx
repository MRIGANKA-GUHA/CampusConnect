import React, { useState, useEffect } from 'react';
import { Shield, Users, Calendar, BarChart3, Plus, FileText, LayoutGrid, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import SmartHeader from '../../components/SmartHeader';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

// ─── Relative time helper ─────────────────────────────────────────────────────
function timeAgo(timestamp) {
  if (!timestamp) return 'Unknown time';
  const diff = (new Date(timestamp).getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const abs = Math.abs(diff);
  if (abs < 60) return rtf.format(Math.round(diff), 'second');
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
  if (abs < 86400 * 30) return rtf.format(Math.round(diff / 86400), 'day');
  if (abs < 86400 * 365) return rtf.format(Math.round(diff / (86400 * 30)), 'month');
  return rtf.format(Math.round(diff / (86400 * 365)), 'year');
}

// ─── Icon + color config per activity type ────────────────────────────────────
const TYPE_CONFIG = {
  user:  { Icon: Users,      bg: 'bg-blue-100 dark:bg-blue-500/15',    icon: 'text-blue-600 dark:text-blue-400',      dot: 'bg-blue-500'    },
  event: { Icon: Calendar,   bg: 'bg-emerald-100 dark:bg-emerald-500/15', icon: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  club:  { Icon: LayoutGrid, bg: 'bg-purple-100 dark:bg-purple-500/15', icon: 'text-purple-600 dark:text-purple-400',  dot: 'bg-purple-500'  },
};

export default function AdminDashboard() {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats/dashboard');
        setDashboardStats(res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };

    const fetchActivities = async () => {
      try {
        const res = await api.get('/admin/stats/activities');
        setActivities(res.data.activities || []);
      } catch (err) {
        console.error('Failed to fetch activities:', err);
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchStats();
    fetchActivities();
  }, []);

  const stats = [
    {
      label: 'Total Students',
      value: loadingStats ? '...' : dashboardStats?.totalStudents?.toLocaleString() ?? '0',
      icon: Users, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-500/10'
    },
    {
      label: 'Active Events',
      value: loadingStats ? '...' : dashboardStats?.activeEvents?.toLocaleString() ?? '0',
      icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-500/10'
    },
    {
      label: 'Pending Approvals',
      value: loadingStats ? '...' : dashboardStats?.pendingApprovals?.toLocaleString() ?? '0',
      icon: Shield, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-500/10'
    },
    {
      label: 'Total Clubs',
      value: loadingStats ? '...' : dashboardStats?.totalClubs?.toLocaleString() ?? '0',
      icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-500/10'
    },
  ];

  const displayedActivities = showAll ? activities : activities.slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-sans">
      <SmartHeader />
      <div className="max-w-7xl mx-auto pt-24 sm:pt-32 px-4 sm:px-8 pb-8 sm:pb-12">

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
          {stats.map((stat, i) => (
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* ── Recent Activities ── */}
          <div className="lg:col-span-2">
            <section className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[1.5rem] sm:rounded-3xl p-6 sm:p-8 overflow-hidden transition-all duration-300">
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Recent Activities</h2>
                  {activities.length > 0 && (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400">
                      {activities.length} total
                    </span>
                  )}
                </div>
                {activities.length > 5 && (
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    {showAll ? 'Show less' : 'View all'}
                    {showAll ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              {loadingActivities ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 animate-pulse">
                      <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-white/10 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 dark:bg-white/10 rounded-lg w-3/4" />
                        <div className="h-3 bg-slate-100 dark:bg-white/5 rounded-lg w-1/2" />
                      </div>
                      <div className="h-3 bg-slate-100 dark:bg-white/5 rounded-lg w-14 shrink-0" />
                    </div>
                  ))}
                </div>
              ) : activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                    <Activity className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                  </div>
                  <p className="font-bold text-slate-400">No recent activity</p>
                  <p className="text-xs text-slate-400 mt-1">Activity will appear here as students, events and clubs are added.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayedActivities.map((act, i) => {
                    const cfg = TYPE_CONFIG[act.type] || TYPE_CONFIG.user;
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 hover:border-indigo-200 dark:hover:border-indigo-500/20 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-all group"
                      >
                        <div className={`w-11 h-11 rounded-full ${cfg.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                          <cfg.Icon className={`w-5 h-5 ${cfg.icon}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{act.label}</p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{act.sublabel}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`w-2 h-2 rounded-full ${cfg.dot} opacity-70`} />
                          <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                            {timeAgo(act.timestamp)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* ── Quick Actions ── */}
          <aside>
            <section className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[1.5rem] sm:rounded-3xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-6 tracking-tight">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/admin/events')}
                  className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all font-bold text-sm border border-indigo-100 dark:border-indigo-500/20 active:scale-95"
                >
                  <Plus className="w-6 h-6" />
                  New Event
                </button>
                <button
                  onClick={() => navigate('/admin/students')}
                  className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all font-bold text-sm border border-slate-100 dark:border-white/5 active:scale-95"
                >
                  <Users className="w-6 h-6" />
                  Students
                </button>
                <button
                  onClick={() => navigate('/admin/clubs')}
                  className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all font-bold text-sm border border-slate-100 dark:border-white/5 active:scale-95"
                >
                  <LayoutGrid className="w-6 h-6" />
                  Clubs
                </button>
                <button
                  onClick={() => navigate('/admin/notices')}
                  className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all font-bold text-sm border border-slate-100 dark:border-white/5 active:scale-95"
                >
                  <FileText className="w-6 h-6" />
                  Notices
                </button>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

