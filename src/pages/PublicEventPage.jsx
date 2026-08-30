import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Calendar, MapPin, Clock, IndianRupee, Users,
  Loader2, AlertCircle, Image as ImageIcon,
  ArrowLeft, LogIn, CheckCircle, FileText
} from 'lucide-react';

const BASE_URL = import.meta.env.DEV
  ? 'http://localhost:5000/api'
  : 'https://campuscon-backend.vercel.app/api';

export default function PublicEventPage() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/admin/events/${eventId}/public`);
        setEvent(res.data.event);
      } catch (err) {
        setError(err.response?.data?.error || 'Event not found.');
      } finally {
        setLoading(false);
      }
    };
    if (eventId) fetchEvent();
  }, [eventId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    if (/\b(AM|PM)\b/i.test(timeString)) return timeString.trim();
    const match = timeString.match(/^(\d{1,2}):(\d{2})/);
    if (!match) return timeString;
    const [, hour, minute] = match;
    const h = parseInt(hour, 10);
    return `${h % 12 || 12}:${minute} ${h >= 12 ? 'PM' : 'AM'}`;
  };

  const handleRegister = () => {
    if (user) {
      navigate('/student/events');
    } else {
      navigate('/login', { state: { from: `/events/${eventId}` } });
    }
  };

  const isFree = !event?.price || event.price === 0;
  const isCompleted = event?.status === 'completed';
  const isCancelled = event?.status === 'cancelled';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30">

      <main className="max-w-2xl mx-auto px-4 pt-8 pb-16">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            <p className="text-sm font-semibold">Loading event...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Event Not Found</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs">{error}</p>
            <Link to="/" className="mt-2 font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              Go to Homepage
            </Link>
          </div>
        )}

        {/* Event Card */}
        {!loading && event && (
          <div className="bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/60 dark:shadow-black/60">

            {/* Banner */}
            <div className="relative h-52 sm:h-64 w-full bg-slate-100 dark:bg-white/5">
              {event.bannerURL ? (
                <img src={event.bannerURL} alt={event.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10">
                  <ImageIcon className="w-14 h-14 text-indigo-300 dark:text-indigo-700 opacity-40" />
                </div>
              )}
              {(isCompleted || isCancelled) && (
                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${isCompleted ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'}`}>
                  {event.status}
                </div>
              )}
              <div className="absolute bottom-4 right-4 bg-white/95 dark:bg-black/90 backdrop-blur-md border border-white/50 dark:border-white/10 shadow-xl px-3 py-2 rounded-2xl flex flex-col items-center min-w-[3.5rem]">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">
                  {event.date ? new Date(event.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short' }) : '—'}
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                  {event.date ? new Date(event.date + 'T00:00:00').getDate() : '—'}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-7 sm:p-9">

              {/* Category + Club */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {event.category && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                    {event.category}
                  </span>
                )}
                {event.clubName && (
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    by {event.clubName}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-6 leading-tight">
                {event.title}
              </h1>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7 p-5 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center shadow-sm shrink-0">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Date</p>
                    <p className="font-bold text-sm leading-tight text-slate-800 dark:text-slate-200">{formatDate(event.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center shadow-sm shrink-0">
                    <Clock className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Time</p>
                    <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{formatTime(event.time) || 'TBA'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center shadow-sm shrink-0">
                    <MapPin className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Venue</p>
                    <p className="font-bold text-sm leading-tight text-slate-800 dark:text-slate-200">{event.venue || 'TBA'}</p>
                  </div>
                </div>
              </div>

              {/* Price + Capacity */}
              <div className="flex flex-wrap items-center gap-3 mb-7">
                <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-black text-sm border ${
                  isFree
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                    : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                }`}>
                  <IndianRupee className="w-4 h-4" />
                  {isFree ? 'Free Entry' : `₹${event.price}`}
                </div>
                {event.capacity && (
                  <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-sm bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                    <Users className="w-4 h-4" />
                    {event.attendeesCount || 0} / {event.capacity} registered
                  </div>
                )}
              </div>

              {/* Description */}
              {event.description && (
                <div className="mb-7">
                  <h2 className="text-base font-black text-slate-900 dark:text-white mb-3">About this Event</h2>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap text-sm">
                    {event.description}
                  </p>
                </div>
              )}

              {/* PDF */}
              {event.pdfURL && (
                <div className="mb-7">
                  <a
                    href={event.pdfURL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20 transition-colors border border-indigo-200 dark:border-indigo-500/20"
                  >
                    <FileText className="w-4 h-4" />
                    Download Event Brochure
                  </a>
                </div>
              )}

              {/* CTA */}
              <div className="border-t border-slate-100 dark:border-white/10 pt-7">
                {isCompleted ? (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                    <CheckCircle className="w-5 h-5 text-blue-500 shrink-0" />
                    <p className="text-sm font-bold text-blue-700 dark:text-blue-400">This event has already taken place.</p>
                  </div>
                ) : isCancelled ? (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <p className="text-sm font-bold text-red-700 dark:text-red-400">This event has been cancelled.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={handleRegister}
                      className="w-full py-4 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-black font-black text-base tracking-wide transition-all hover:scale-[1.01] active:scale-[0.99] shadow-xl hover:shadow-slate-500/20 dark:hover:shadow-white/20 flex items-center justify-center gap-2"
                    >
                      {user ? (
                        <><CheckCircle className="w-5 h-5" /> Go to Events &amp; Register</>
                      ) : (
                        <><LogIn className="w-5 h-5" /> Sign in to Register</>
                      )}
                    </button>
                    {!user && (
                      <p className="text-center text-xs font-medium text-slate-400">
                        Need an account?{' '}
                        <Link to="/register" state={{ from: `/events/${eventId}` }} className="text-indigo-500 font-bold hover:underline">
                          Register free
                        </Link>
                      </p>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
