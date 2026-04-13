import React, { useState, useEffect } from 'react';
import { Shield, Users, Calendar, BarChart3, Plus, Settings, FileText } from 'lucide-react';
import SmartHeader from '../../components/SmartHeader';
import api from '../../services/api';

export default function AdminDashboard() {
  const [studentCount, setStudentCount] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStudentCount = async () => {
      try {
        const res = await api.get('/admin/stats/students');
        setStudentCount(res.data.count);
      } catch (err) {
        console.error('Failed to fetch student count:', err);
        setStudentCount('—');
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStudentCount();
  }, []);

  const stats = [
    {
      label: 'Total Students',
      value: loadingStats ? '...' : studentCount?.toLocaleString() ?? '—',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100 dark:bg-blue-500/10'
    },
    { label: 'Active Events', value: '42', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-500/10' },
    { label: 'Pending Approvals', value: '12', icon: Shield, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-500/10' },
    { label: 'Revenue', value: '$4.2k', icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-500/10' },
  ];

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

        {/* Placeholder Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <section className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[1.5rem] sm:rounded-3xl p-6 sm:p-8 overflow-hidden relative">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Recent Activities</h2>
              <div className="space-y-4 sm:space-y-6">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
                      <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-800 dark:text-slate-200">New user registered: John Doe</p>
                      <p className="text-xs sm:text-sm text-slate-500">2 minutes ago • ID: user_8271</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6 sm:space-y-8">
            {/* Quick Actions */}
            <section className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[1.5rem] sm:rounded-3xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-6 tracking-tight">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all font-bold text-sm border border-indigo-100 dark:border-indigo-500/20 active:scale-95">
                  <Plus className="w-6 h-6" />
                  New Event
                </button>
                <button className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all font-bold text-sm border border-slate-100 dark:border-white/5 active:scale-95">
                  <Users className="w-6 h-6" />
                  Add User
                </button>
                <button className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all font-bold text-sm border border-slate-100 dark:border-white/5 active:scale-95">
                  <FileText className="w-6 h-6" />
                  Reports
                </button>
                <button className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all font-bold text-sm border border-slate-100 dark:border-white/5 active:scale-95">
                  <Settings className="w-6 h-6" />
                  Settings
                </button>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
