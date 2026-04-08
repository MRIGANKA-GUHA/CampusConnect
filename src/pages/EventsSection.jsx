import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';

export default function EventsSection() {
  const events = [
    {
      month: 'OCT',
      day: '24',
      title: 'Tech Innovators Hackathon',
      club: 'Tech & Coding Club',
      time: '9:00 AM - 9:00 PM',
      location: 'Main Auditorium',
      color: 'from-blue-500 to-indigo-600',
      active: true
    },
    {
      month: 'OCT',
      day: '28',
      title: 'Cultural Night & Dance Festival',
      club: 'Cultural Society',
      time: '6:30 PM - 10:00 PM',
      location: 'Open Air Theatre',
      color: 'from-purple-500 to-pink-600',
      active: true
    },
    {
      month: 'NOV',
      day: '05',
      title: 'Inter-College Debate Championship',
      club: 'Debate & Literature',
      time: '10:00 AM - 3:00 PM',
      location: 'Seminar Hall B',
      color: 'from-emerald-500 to-teal-600',
      active: false
    },
    {
      month: 'NOV',
      day: '12',
      title: 'Annual Sports Meet: Track & Field',
      club: 'Sports Council',
      time: '8:00 AM - 5:00 PM',
      location: 'Campus Stadium',
      color: 'from-orange-500 to-red-600',
      active: false
    }
  ];

  return (
    <section id="events" className="min-h-[calc(100vh-6rem)] flex flex-col justify-start px-4 pt-16 pb-24 scroll-mt-24">
      <div className="max-w-6xl mx-auto w-full">
        {/* Section Title */}
        <div className="text-center mb-16 px-4">
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Upcoming Events
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-4 text-lg max-w-2xl mx-auto leading-relaxed">
            Don't miss out on the action. Discover, RSVP, and participate in the most highly anticipated club events across the campus this semester.
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {events.map((evt, i) => (
            <div 
              key={i}
              className="group relative bg-white dark:bg-[#080808] rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-100 dark:border-white/5 sm:hover:border-indigo-100 sm:dark:hover:border-white/10 sm:hover:shadow-2xl sm:hover:shadow-indigo-500/10 transition-all duration-300 flex flex-row gap-3 sm:gap-8 items-center sm:items-start text-left overflow-hidden"
            >
              {/* Date Block */}
              <div className="shrink-0 relative w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden flex flex-col items-center justify-center shadow-sm sm:shadow-lg sm:group-hover:scale-105 transition-transform duration-300">
                <div className={`absolute inset-0 bg-gradient-to-br ${evt.color} opacity-90`}></div>
                <span className="relative text-white/90 text-[10px] sm:text-sm font-bold tracking-widest uppercase mb-0.5 sm:mb-1">{evt.month}</span>
                <span className="relative text-white text-xl sm:text-3xl font-black leading-none">{evt.day}</span>
              </div>

              {/* Event Details */}
              <div className="flex-1 flex flex-col justify-center min-w-0">
                <div className="flex items-center justify-start gap-2 mb-1 sm:mb-2">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full truncate">
                    {evt.club}
                  </span>
                  {evt.active && (
                    <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 relative shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-full w-full bg-red-500"></span>
                    </span>
                  )}
                </div>
                
                <h3 className="text-sm sm:text-2xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-4 sm:group-hover:text-indigo-600 sm:dark:group-hover:text-indigo-400 transition-colors truncate sm:whitespace-normal">
                  {evt.title}
                </h3>
                
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-6 text-[11px] sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                  <div className="flex items-center justify-start gap-1.5">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-70 shrink-0" />
                    <span className="truncate">{evt.time}</span>
                  </div>
                  <div className="flex items-center justify-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-70 shrink-0" />
                    <span className="truncate">{evt.location}</span>
                  </div>
                </div>
              </div>

              {/* RSVP Action */}
              <div className="shrink-0 flex items-center justify-center pl-2 sm:pl-4 sm:border-l sm:border-slate-100 sm:dark:border-white/5 h-full">
                <button className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 sm:group-hover:bg-indigo-600 sm:group-hover:text-white transition-all shadow-sm sm:group-hover:shadow-lg sm:group-hover:-rotate-45 duration-300">
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Explore All Action */}
        <div className="mt-16 sm:mt-20 flex justify-center">
          <button className="group px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-full hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white dark:hover:text-white transition-all shadow-lg hover:-translate-y-0.5 flex items-center gap-2">
            Explore All Events
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
