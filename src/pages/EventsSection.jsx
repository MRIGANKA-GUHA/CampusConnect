import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, ArrowRight, CalendarDays, Ticket, X, AlignLeft, Download } from 'lucide-react';
import api from '../services/api';

const CATEGORY_STYLES = {
  Technical:  { bg: 'bg-blue-600',        text: 'text-blue-600',        light: 'bg-blue-50 dark:bg-blue-500/10' },
  Cultural:   { bg: 'bg-purple-600',      text: 'text-purple-600',      light: 'bg-purple-50 dark:bg-purple-500/10' },
  Literature: { bg: 'bg-teal-600',        text: 'text-teal-600',        light: 'bg-teal-50 dark:bg-teal-500/10' },
  Sports:     { bg: 'bg-orange-500',      text: 'text-orange-500',      light: 'bg-orange-50 dark:bg-orange-500/10' },
  Social:     { bg: 'bg-rose-500',        text: 'text-rose-500',        light: 'bg-rose-50 dark:bg-rose-500/10' },
  Academic:   { bg: 'bg-sky-500',         text: 'text-sky-500',         light: 'bg-sky-50 dark:bg-sky-500/10' },
  Other:      { bg: 'bg-slate-600',       text: 'text-slate-600',       light: 'bg-slate-100 dark:bg-slate-500/10' },
};

export default function EventsSection() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/admin/events/public');
        const publishedEvents = (res.data.events || []).filter(evt => evt.status === 'published');
        setEvents(publishedEvents.slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return {
        month: date.toLocaleString('default', { month: 'short' }).toUpperCase(),
        day: date.getDate().toString().padStart(2, '0')
      };
    } catch (e) {
      return { month: 'OCT', day: '00' };
    }
  };

  if (loading) {
    return (
      <section id="events" className="flex flex-col justify-center items-center px-4 py-24 min-h-[calc(100vh-5rem)]">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
      </section>
    );
  }

  if (events.length === 0) return null;

  return (
    <section id="events" className="py-12 sm:py-16 px-4 sm:px-6 scroll-mt-20 min-h-[calc(100vh-5rem)] flex flex-col justify-start">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Upcoming <span className="text-indigo-600 dark:text-indigo-400">Events</span>
            </h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400 text-lg max-w-xl">
              Discover fun club events, meet new friends, and make the most of your semester across campus.
            </p>
          </div>
          
          <Link
            to="/events"
            className="hidden sm:flex items-center gap-2 px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-full hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-sm shrink-0"
          >
            <CalendarDays className="w-4 h-4" />
            View All
          </Link>
        </div>

        {/* ── Events Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {events.map((evt, i) => {
            const { month, day } = formatDate(evt.date);
            const style = CATEGORY_STYLES[evt.category] || CATEGORY_STYLES.Other;

            return (
              <div 
                key={evt.id || i}
                onClick={() => setSelectedEvent(evt)}
                className="group relative bg-white dark:bg-[#0a0a0a] rounded-[2rem] border border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1 cursor-pointer"
              >
                {/* Top Section (Ticket Header) */}
                <div className={`relative px-6 pt-6 pb-8 overflow-hidden ${!evt.bannerURL ? style.bg : ''}`}
                  style={evt.bannerURL ? { backgroundImage: `url(${evt.bannerURL})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                >
                  {/* Dark overlay when banner image is present */}
                  {evt.bannerURL && <div className="absolute inset-0 bg-black/50" />}

                  {/* Decorative circles for ticket effect */}
                  <div className="absolute -bottom-4 -left-4 w-8 h-8 rounded-full bg-white dark:bg-[#0a0a0a] z-10" />
                  <div className="absolute -bottom-4 -right-4 w-8 h-8 rounded-full bg-white dark:bg-[#0a0a0a] z-10" />

                  {/* Dot pattern (only when no banner) */}
                  {!evt.bannerURL && <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />}

                  <div className="relative z-10 flex justify-between items-start">
                    {/* Date */}
                    <div className="flex flex-col items-center bg-white/20 backdrop-blur-md rounded-2xl px-4 py-2 text-white">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{month}</span>
                      <span className="text-3xl font-black leading-none mt-1">{day}</span>
                    </div>

                    {/* Category Pill */}
                    <div className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <Ticket className="w-3 h-3" />
                      {evt.category || 'Event'}
                    </div>
                  </div>
                </div>

                {/* Bottom Section (Details) */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col">
                  {/* Club Name & Live Dot */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${style.text} ${style.light} px-2.5 py-1 rounded-md truncate max-w-[70%]`}>
                      {evt.clubName || 'Campus Club'}
                    </span>
                    {evt.status === 'published' && (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-full w-full bg-emerald-500"></span>
                        </span>
                        Open
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {evt.title}
                  </h3>

                  {/* Meta (Time & Venue) */}
                  <div className="flex flex-col gap-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 mt-auto">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 opacity-70 shrink-0" />
                      <span className="truncate">{evt.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 opacity-70 shrink-0" />
                      <span className="truncate">{evt.venue}</span>
                    </div>
                  </div>
                  
                  {/* Hover Action */}
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      View Details
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                      <ArrowRight className="w-4 h-4 group-hover:-rotate-45 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile View All */}
        <div className="mt-10 flex justify-center sm:hidden">
          <Link
            to="/events"
            className="flex items-center gap-2 px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-full hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-sm"
          >
            <CalendarDays className="w-4 h-4" />
            View All Events
          </Link>
        </div>
      </div>

      {/* Modal */}
      {selectedEvent && (
        <EventModal 
          evt={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
          formatDate={formatDate}
        />
      )}
    </section>
  );
}

function EventModal({ evt, onClose, formatDate }) {
  const navigate = useNavigate();
  const { month, day } = formatDate(evt.date);
  const style = CATEGORY_STYLES[evt.category] || CATEGORY_STYLES.Other;

  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleReserve = () => {
    onClose();
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* Header / Banner */}
        <div 
          className={`relative shrink-0 ${!evt.bannerURL ? style.bg : ''} p-6 sm:p-8 min-h-[160px] sm:min-h-[200px] flex flex-col justify-end`}
          style={evt.bannerURL ? { backgroundImage: `url(${evt.bannerURL})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          {evt.bannerURL && <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />}
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 mt-8">
             <div className="flex items-center gap-2 mb-3">
               <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 text-white backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Ticket className="w-3 h-3" />
                  {evt.category || 'Event'}
               </span>
               <span className="text-[10px] font-black uppercase tracking-widest bg-black/40 text-white backdrop-blur-md px-3 py-1.5 rounded-full">
                  {evt.clubName || 'Campus Club'}
               </span>
             </div>
             <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
               {evt.title}
             </h2>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {/* Quick Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <div className="flex flex-col bg-slate-50 dark:bg-white/5 p-3 sm:p-4 rounded-2xl">
               <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Date</span>
               <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{day} {month}</span>
            </div>
            <div className="flex flex-col bg-slate-50 dark:bg-white/5 p-3 sm:p-4 rounded-2xl">
               <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Time</span>
               <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate" title={evt.time}>{evt.time || 'TBA'}</span>
            </div>
            <div className="flex flex-col bg-slate-50 dark:bg-white/5 p-3 sm:p-4 rounded-2xl">
               <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Venue</span>
               <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate" title={evt.venue}>{evt.venue || 'TBA'}</span>
            </div>
            <div className="flex flex-col bg-slate-50 dark:bg-white/5 p-3 sm:p-4 rounded-2xl">
               <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Entry</span>
               <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{evt.price > 0 ? `₹${evt.price}` : 'Free'}</span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
               
               About this event
            </h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {evt.description || 'No description provided.'}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="shrink-0 p-6 sm:p-8 pt-0 flex flex-col sm:flex-row gap-3 sm:gap-4">
           {evt.pdfURL && (
             <button
               onClick={async () => {
                 try {
                   const res = await fetch(evt.pdfURL);
                   const blob = await res.blob();
                   const url = URL.createObjectURL(blob);
                   const a = document.createElement('a');
                   a.href = url;
                   a.download = evt.pdfName || `${evt.title}_brochure.pdf`;
                   document.body.appendChild(a);
                   a.click();
                   a.remove();
                   URL.revokeObjectURL(url);
                 } catch {
                   window.open(evt.pdfURL, '_blank');
                 }
               }}
               className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
             >
               <Download className="w-4 h-4" />
               Brochure
             </button>
           )}
           <button 
             className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 ${style.bg} text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-opacity`}
             onClick={handleReserve}
           >
             RESERVE YOUR SEAT
           </button>
        </div>
      </div>
    </div>
  );
}
