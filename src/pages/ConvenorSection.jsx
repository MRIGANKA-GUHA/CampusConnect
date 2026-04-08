import { Mail } from 'lucide-react';

export default function ConvenorSection() {
  const convenors = [
    {
      name: 'Sarah Mitchell',
      club: 'Tech & Coding Club',
      role: 'Lead Convenor',
      image: 'https://i.pravatar.cc/300?img=5', // Placeholder image
      color: 'from-blue-500 to-indigo-500'
    },
    {
      name: 'David Rodriguez',
      club: 'Cultural Society',
      role: 'President',
      image: 'https://i.pravatar.cc/300?img=11',
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Aisha Patel',
      club: 'Debate & Literature',
      role: 'Secretary',
      image: 'https://i.pravatar.cc/300?img=9',
      color: 'from-emerald-400 to-teal-500'
    },
    {
      name: 'James Wilson',
      club: 'Sports Council',
      role: 'Athletics Director',
      image: 'https://i.pravatar.cc/300?img=12',
      color: 'from-orange-400 to-red-500'
    }
  ];

  // Duplicate the array to create a seamless infinite marquee effect
  const marqueeItems = [...convenors, ...convenors, ...convenors];

  return (
    <section id="convenors" className="min-h-[calc(100vh-6rem)] flex flex-col justify-start px-4 pt-8 pb-16 scroll-mt-24">
      <div className="max-w-6xl mx-auto w-full">
        {/* Section Title */}
        <div className="text-center mb-10 px-4">
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Meet the Convenors
          </h2>
        </div>

        {/* Convenor Profile Cards Marquee */}
        <div className="relative w-full max-w-[100vw] overflow-hidden -mx-4 px-4 sm:px-0">
          {/* Fading Edges */}
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-24 bg-gradient-to-r from-slate-50 dark:from-black to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-24 bg-gradient-to-l from-slate-50 dark:from-black to-transparent z-10 pointer-events-none"></div>

          <div className="flex w-max animate-marquee-ltr pause-on-hover gap-6 sm:gap-14 py-4">
            {marqueeItems.map((person, i) => (
              <div
                key={i}
                className="w-[17.5rem] sm:w-[26.25rem] shrink-0 group relative bg-white dark:bg-[#080808] rounded-3xl p-10 sm:p-12 border border-slate-100 dark:border-white/5 sm:hover:border-indigo-100 sm:dark:hover:border-white/10 sm:hover:shadow-2xl sm:hover:shadow-indigo-500/10 sm:dark:hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col items-center text-center overflow-hidden"
              >
                {/* Top Accent Gradient (Visible on hover) */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${person.color} opacity-0 sm:group-hover:opacity-100 transition-opacity`}></div>

                {/* Profile Image Skeleton/Avatar */}
                <div className="relative mb-8 mt-4">
                  <div className={`absolute inset-0 bg-gradient-to-br ${person.color} rounded-full blur-xl opacity-20 sm:group-hover:opacity-40 transition-opacity duration-300 scale-125`}></div>
                  <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full border-4 border-white dark:border-[#111] overflow-hidden shadow-xl sm:group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={person.image}
                      alt={person.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Name & Role */}
                <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-2 sm:group-hover:text-indigo-600 sm:dark:group-hover:text-indigo-400 transition-colors tracking-tight">
                  {person.name}
                </h3>
                <span className="text-base sm:text-lg font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
                  {person.role}
                </span>

                {/* Club Badge */}
                <div className="mt-4 w-full py-4 px-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                  <p className="text-lg sm:text-xl font-bold text-slate-700 dark:text-slate-300">{person.club}</p>
                </div>

                {/* Social/Contact Links (Always visible on mobile, reveal on hover on desktop) */}
                <div className="mt-8 flex gap-4 opacity-100 translate-y-0 pointer-events-auto sm:opacity-0 sm:translate-y-4 sm:pointer-events-none sm:group-hover:opacity-100 sm:group-hover:translate-y-0 sm:group-hover:pointer-events-auto transition-all duration-300">
                  <button className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                    <Mail className="w-6 h-6" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
