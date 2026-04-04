import { Users, BookOpen, Activity, ArrowUpRight } from 'lucide-react';

export default function HomePage() {
  const stats = [
    { label: 'Active Students', value: '1,482', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Courses Online', value: '342', icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Server Load', value: '98.2%', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors duration-500">Overview</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg transition-colors duration-500 font-medium">Welcome back. Here is what's happening today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#080808] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-white/5 hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:border-indigo-500/30 transition-all duration-500 group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} dark:bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-6 h-6 ${stat.color} dark:text-white`} />
              </div>
              <span className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full transition-colors duration-500">
                +12% <ArrowUpRight className="w-3 h-3 ml-1" />
              </span>
            </div>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white transition-colors duration-500">{stat.value}</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 transition-colors duration-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#080808] rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 p-8 min-h-[400px] flex items-center justify-center transition-all duration-500">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-900/20 mb-6 transition-colors duration-500">
            <Activity className="w-10 h-10 text-indigo-500 dark:text-indigo-400 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors duration-500">Activity Graph</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-md mx-auto transition-colors duration-500">This section can be populated with charts and rich data visualizations powered by libraries like Recharts or Chart.js.</p>
        </div>
      </div>
    </div>
  );
}
