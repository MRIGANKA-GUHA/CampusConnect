import { useState, useEffect } from 'react';
import SmartHeader from '../../components/SmartHeader';
import api from '../../services/api';
import { Users, Loader2, Search, GraduationCap } from 'lucide-react';

export default function ClubMembers() {
  const [members, setMembers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await api.get('/club/members');
        setMembers(res.data.members || []);
        setTotal(res.data.total || 0);
      } catch (err) {
        console.error('Failed to fetch members:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const filtered = members.filter(m =>
    m.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.department?.toLowerCase().includes(search.toLowerCase()) ||
    m.rollNo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-sans">
      <SmartHeader />

      <div className="max-w-7xl mx-auto pt-24 sm:pt-32 px-4 sm:px-8 pb-12">
        {/* Top Action Bar (Search & Total Tag) */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 w-full">
          <div className="flex-1 w-full max-w-xl relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by name, roll no, department, or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="block w-full pl-14 pr-6 py-4 rounded-[2rem] bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 shadow-sm hover:shadow-md transition-all font-medium text-sm sm:text-base"
            />
          </div>

          <div className="bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 px-6 py-4 rounded-[2rem] font-bold flex items-center gap-3 border border-slate-200 dark:border-white/10 shadow-sm shrink-0 w-full md:w-auto justify-center md:justify-start">
            <Users className="w-5 h-5 text-indigo-500" />
            <span>{total} Total Members</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-5 sm:p-6 flex items-center gap-4 shadow-sm animate-pulse">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-white/10 shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-slate-200 dark:bg-white/5 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-slate-200 dark:bg-white/5 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-24 gap-4 text-slate-400">
            <Users className="w-16 h-16 opacity-30" />
            <p className="text-lg font-semibold">{search ? 'No members match your search' : 'No members yet'}</p>
            {!search && <p className="text-sm text-center max-w-xs">Once students join your club from the Clubs page, they'll appear here.</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((member) => {
              const avatar = member.photoURL ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${member.displayName || member.email}&backgroundColor=7c3aed&textColor=ffffff`;

              return (
                <div key={member.uid}
                  className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-5 sm:p-6 flex items-center gap-4 shadow-sm hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200"
                >
                  {/* Avatar */}
                  <img
                    src={avatar}
                    alt={member.displayName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-200 dark:border-indigo-500/30 shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{member.displayName}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      {member.rollNo && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{member.rollNo}</span>
                      )}
                      {member.department && (
                        <span className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                          <GraduationCap className="w-3 h-3" />
                          {member.department}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{member.email}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
