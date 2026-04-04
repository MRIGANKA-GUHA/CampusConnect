import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowDown, Star, ChevronRight } from 'lucide-react';
import ConvenorSection from './ConvenorSection';
import EventsSection from './EventsSection';

export default function HomePage() {
  const location = useLocation();

  // Smooth scroll to hash on load/navigation
  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full">

      {/* ───── HERO SECTION ───── */}
      <section id="home" className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-32 pb-20">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-6 max-w-4xl">
          One Platform for Every{' '}
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            College Club
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed">
          The ultimate hub for campus life. Effortlessly discover new communities, seamlessly manage events, and give your college full visibility into student engagement.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5 flex items-center gap-2">
            Get Started Free <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => scrollTo('convenors')}
            className="px-8 py-4 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200 font-bold rounded-full border border-slate-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all"
          >
            Learn More
          </button>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-16">
          {[
            { value: '42+', label: 'Active Clubs' },
            { value: '18', label: 'Upcoming Events' },
            { value: '3,500+', label: 'Student Members' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Scroll Cue */}
        <button
          onClick={() => scrollTo('convenors')}
          className="mt-16 flex flex-col items-center gap-2 text-slate-400 hover:text-indigo-500 transition-colors"
        >
          <span className="text-xs font-medium">Meet the Convenors</span>
          <ArrowDown className="w-5 h-5 animate-bounce" />
        </button>
      </section>

      {/* ───── CONVENOR SECTION ───── */}
      <ConvenorSection />

      {/* ───── EVENTS SECTION ───── */}
      <EventsSection />

    </div>
  );
}
