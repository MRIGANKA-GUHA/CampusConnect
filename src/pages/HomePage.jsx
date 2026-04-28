import { useEffect, useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ArrowDown, Star, ChevronRight } from 'lucide-react';
import ConvenorSection from './ConvenorSection';
import EventsSection from './EventsSection';
import api from '../services/api';

const FULL_TEXT = 'One Platform for Every College Club';

export default function HomePage() {
  const location = useLocation();
  const [displayed, setDisplayed] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const [typingDone, setTypingDone] = useState(false);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [stats, setStats] = useState({ clubs: 0, events: 0, members: 0 });
  const indexRef = useRef(0);

  // Typewriter effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (indexRef.current < FULL_TEXT.length) {
        setDisplayed(FULL_TEXT.slice(0, indexRef.current + 1));
        indexRef.current += 1;
      } else {
        clearInterval(interval);
        setTypingDone(true);
      }
    }, 55);
    return () => clearInterval(interval);
  }, []);

  // Cursor blink
  useEffect(() => {
    const blink = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(blink);
  }, []);

  // Smooth scroll to hash on load/navigation
  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  // Fetch Stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats/public');
        setStats(res.data);
        // Small delay to ensure the smooth skeleton animation is visible if data loads too fast
        setTimeout(() => setStatsLoaded(true), 800);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setStatsLoaded(true); // default to 0 on error
      }
    };
    fetchStats();
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Determine which part of typed text is before/within 'College Club'
  const gradientStart = FULL_TEXT.indexOf('College Club');
  const plainPart = displayed.slice(0, gradientStart);
  const gradientPart = displayed.slice(gradientStart);

  return (
    <div className="w-full">

      {/* ───── HERO SECTION ───── */}
      <section id="home" className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-32 pb-20">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-6 max-w-4xl">
          {displayed.length <= gradientStart ? (
            <>
              {displayed}
              <span className={`inline-block w-[3px] h-[0.85em] align-middle ml-[2px] rounded-sm transition-opacity duration-100 ${cursorVisible ? 'opacity-100' : 'opacity-0'}`}
                style={{ background: 'linear-gradient(to bottom, #4f46e5, #7c3aed, #ec4899, #f59e0b)' }}
              />
            </>
          ) : (
            <>
              {plainPart}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {gradientPart}
              </span>
              {!typingDone && (
                <span className={`inline-block w-[3px] h-[0.85em] align-middle ml-[2px] rounded-sm transition-opacity duration-100 ${cursorVisible ? 'opacity-100' : 'opacity-0'}`}
                  style={{ background: 'linear-gradient(to bottom, #4f46e5, #7c3aed, #ec4899, #f59e0b)' }}
                />
              )}
            </>
          )}
        </h1>

        {/* Content revealed after typing completes */}
        <div className={`flex flex-col items-center transition-all duration-500 ${typingDone ? '' : 'pointer-events-none'}`}>

          <p className={`text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed text-center ${typingDone ? 'animate-fade-up-slow' : 'opacity-0'}`}
            style={{ animationDelay: '100ms' }}>
            The ultimate hub for campus life. Effortlessly discover new communities, seamlessly manage events, and give your college full visibility into student engagement.
          </p>

          <div className={`flex flex-row w-full justify-center items-center gap-3 sm:gap-4 px-2 max-w-sm sm:max-w-none ${typingDone ? 'animate-fade-up-slow' : 'opacity-0'}`}
            style={{ animationDelay: '300ms' }}>
            <Link to="/register" className="px-5 py-3 sm:px-8 sm:py-4 text-sm sm:text-base bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2 flex-1 sm:flex-none">
              Get Started
            </Link>
            <button
              onClick={() => scrollTo('convenors')}
              className="px-5 py-3 sm:px-8 sm:py-4 text-sm sm:text-base bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200 font-bold rounded-full border border-slate-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all flex-1 sm:flex-none text-center whitespace-nowrap"
            >
              Learn More
            </button>
          </div>

          {/* Stats */}
          <div className={`mt-16 sm:mt-20 w-full max-w-3xl mx-auto flex flex-row items-center justify-between divide-x divide-slate-200 dark:divide-white/10 py-5 sm:py-0 rounded-3xl sm:rounded-none bg-white/40 dark:bg-white/5 sm:bg-transparent sm:dark:bg-transparent border border-slate-200/60 dark:border-white/10 sm:border-0 shadow-sm sm:shadow-none backdrop-blur-md sm:backdrop-blur-none ${typingDone ? 'animate-fade-up-slow' : 'opacity-0'}`}
            style={{ animationDelay: '500ms' }}>

            {!statsLoaded ? (
              /* Inline Skeleton Loader for Stats */
              [1, 2, 3].map((_, i) => (
                <div key={`skeleton-${i}`} className="flex-1 flex flex-col items-center justify-center px-1 sm:px-8">
                  <div className="h-8 sm:h-10 w-16 sm:w-20 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse mb-1 sm:mb-2"></div>
                  <div className="h-3 sm:h-4 w-12 sm:w-16 bg-slate-200 dark:bg-white/10 rounded animate-pulse mt-1"></div>
                </div>
              ))
            ) : (
              /* Actual Real-Time Stats */
              [
                { value: stats.clubs > 0 ? `${stats.clubs}` : '0', label: 'Clubs' },
                { value: stats.events > 0 ? `${stats.events}` : '0', label: 'Events' },
                { value: stats.members >= 1000 ? `${(stats.members / 1000).toFixed(1)}k+` : stats.members, label: 'Members' },
              ].map((stat, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-center px-1 sm:px-8 animate-fade-in">
                  <p className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white drop-shadow-sm">{stat.value}</p>
                  <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 font-bold uppercase tracking-wider">{stat.label}</p>
                </div>
              ))
            )}
          </div>



        </div>
      </section>

      {/* ───── CONVENOR SECTION ───── */}
      <ConvenorSection />

      {/* ───── EVENTS SECTION ───── */}
      <EventsSection />

    </div>
  );
}
