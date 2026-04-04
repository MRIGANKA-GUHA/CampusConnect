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
              className="group relative bg-white dark:bg-[#080808] rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-white/5 hover:border-indigo-100 dark:hover:border-white/10 hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start text-center sm:text-left overflow-hidden"
            >
              {/* Date Block */}
              <div className="shrink-0 relative w-24 h-24 rounded-2xl overflow-hidden flex flex-col items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <div className={`absolute inset-0 bg-gradient-to-br ${evt.color} opacity-90`}></div>
                <span className="relative text-white/90 text-sm font-bold tracking-widest uppercase mb-1">{evt.month}</span>
                <span className="relative text-white text-3xl font-black leading-none">{evt.day}</span>
              </div>

              {/* Event Details */}
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full">
                    {evt.club}
                  </span>
                  {evt.active && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {evt.title}
                </h3>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Clock className="w-4 h-4 opacity-70" />
                    {evt.time}
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <MapPin className="w-4 h-4 opacity-70" />
                    {evt.location}
                  </div>
                </div>
              </div>

              {/* RSVP Action */}
              <div className="shrink-0 flex items-center justify-center pt-4 sm:pt-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-white/5 w-full sm:w-auto h-full">
                <button className="w-12 h-12 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-lg group-hover:-rotate-45 duration-300">
                  <ArrowRight className="w-5 h-5" />
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
