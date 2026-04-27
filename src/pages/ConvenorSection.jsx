import { useEffect, useState } from 'react';
import { Mail, Users } from 'lucide-react';
import api from '../services/api';

const CATEGORY_COLORS = {
  Technical:  'from-blue-500 to-indigo-500',
  Cultural:   'from-purple-500 to-pink-500',
  Literature: 'from-amber-400 to-orange-500',
  Sports:     'from-emerald-400 to-teal-500',
  Social:     'from-rose-400 to-red-500',
  Academic:   'from-sky-400 to-cyan-500',
  Other:      'from-slate-400 to-slate-600',
};

export default function ConvenorSection() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await api.get('/admin/clubs/public');
        setClubs(res.data.clubs || []);
      } catch (err) {
        console.error('Failed to fetch clubs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClubs();
  }, []);

  // Need at least 1 club; duplicate for marquee effect
  const marqueeItems = clubs.length > 0
    ? [...clubs, ...clubs, ...clubs]
    : [];

  if (loading) {
    return (
      <section id="convenors" className="min-h-[calc(100vh-6rem)] flex flex-col justify-center items-center px-4">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
      </section>
    );
  }

  if (clubs.length === 0) return null;

  return (
    <section id="convenors" className="min-h-[calc(100vh-6rem)] flex flex-col justify-start px-4 pt-8 pb-16 scroll-mt-24">
      <div className="max-w-6xl mx-auto w-full">
        {/* Section Title */}
        <div className="text-center mb-10 px-4">
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Meet the Convenors
          </h2>
        </div>

        {/* Marquee */}
        <div className="relative w-full max-w-[100vw] overflow-hidden -mx-4 px-4 sm:px-0">
          {/* Fading Edges */}
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-24 bg-gradient-to-r from-slate-50 dark:from-black to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-24 bg-gradient-to-l from-slate-50 dark:from-black to-transparent z-10 pointer-events-none" />

          <div className="flex w-max animate-marquee-ltr pause-on-hover gap-6 sm:gap-14 py-4">
            {marqueeItems.map((club, i) => {
              const color = CATEGORY_COLORS[club.category] || CATEGORY_COLORS.Other;
              return (
                <div
                  key={`${club.id}-${i}`}
                  className="w-[17.5rem] sm:w-[26.25rem] shrink-0 group relative bg-white dark:bg-[#080808] rounded-3xl p-10 sm:p-12 border border-slate-100 dark:border-white/5 sm:hover:border-indigo-100 sm:dark:hover:border-white/10 sm:hover:shadow-2xl sm:hover:shadow-indigo-500/10 sm:dark:hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col items-center text-center overflow-hidden"
                >
                  {/* Top Accent */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${color} opacity-0 sm:group-hover:opacity-100 transition-opacity`} />

                  {/* Profile Image */}
                  <div className="relative mb-8 mt-4">
                    <div className={`absolute inset-0 bg-gradient-to-br ${color} rounded-full blur-xl opacity-20 sm:group-hover:opacity-40 transition-opacity duration-300 scale-125`} />
                    <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full border-4 border-white dark:border-[#111] overflow-hidden shadow-xl sm:group-hover:scale-105 transition-transform duration-300 bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                      {club.convenorPhoto ? (
                        <img
                          src={club.convenorPhoto}
                          alt={club.convenorName || club.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-2 sm:group-hover:text-indigo-600 sm:dark:group-hover:text-indigo-400 transition-colors tracking-tight min-h-[2.5rem]">
                    {club.convenorName || ''}
                  </h3>

                  {/* Role label */}
                  <span className="text-base sm:text-lg font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
                    Lead Convenor
                  </span>

                  {/* Club Badge */}
                  <div className="mt-4 w-full py-4 px-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                    <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">{club.name}</p>
                    {club.category ? (
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">{club.category}</p>
                    ) : null}
                  </div>

                  {/* Email button — only show if email available */}
                  {club.convenorEmail ? (
                    <div className="mt-8 flex gap-4 opacity-100 translate-y-0 pointer-events-auto sm:opacity-0 sm:translate-y-4 sm:pointer-events-none sm:group-hover:opacity-100 sm:group-hover:translate-y-0 sm:group-hover:pointer-events-auto transition-all duration-300">
                      <a
                        href={`mailto:${club.convenorEmail}`}
                        className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                      >
                        <Mail className="w-6 h-6" />
                      </a>
                    </div>
                  ) : (
                    <div className="mt-8 h-12" /> /* keep height consistent */
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
