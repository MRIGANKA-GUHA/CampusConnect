import React, { useState, useEffect, useRef } from 'react';
import SmartHeader from '../../components/SmartHeader';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Search, X, Calendar, MapPin, Users, Check,
  Loader2, Image as ImageIcon, IndianRupee, Clock, AlertCircle
} from 'lucide-react';

const EVENT_CATEGORIES = ['All', 'Technical', 'Cultural', 'Academic', 'Sports', 'Other'];

export default function StudentEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const toastTimerRef = useRef(null);

  // Registration state
  const [registering, setRegistering] = useState(null); // stores event ID
  // Map of eventId → { paymentStatus, upiTransactionId } for registered events
  const [registrationMap, setRegistrationMap] = useState({});

  // UPI form state (shown inside modal for paid events)
  const [upiInput, setUpiInput] = useState('');
  const [upiSubmitting, setUpiSubmitting] = useState(false);
  const [showUpiForm, setShowUpiForm] = useState(false);

  const showToast = (msg, type = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    setToastType(type);
    toastTimerRef.current = setTimeout(() => setToastMessage(''), 3500);
  };

  useEffect(() => {
    fetchEvents();
    if (user) fetchMyRegistrations();
    return () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
  }, [user]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/events/public');
      setEvents(res.data.events || []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      showToast('Failed to load events.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRegistrations = async () => {
    try {
      const res = await api.get('/student/registrations');
      const map = {};
      (res.data.registrations || []).forEach(reg => {
        map[reg.eventId] = reg;
      });
      setRegistrationMap(map);
    } catch (err) {
      console.error('Failed to fetch registrations:', err);
    }
  };

  // For free events — instant register
  const handleFreeRegister = async (eventId) => {
    setRegistering(eventId);
    try {
      const res = await api.post(`/student/events/${eventId}/register`, {});
      const reg = res.data.registration;
      setRegistrationMap(prev => ({ ...prev, [eventId]: reg }));
      showToast('Successfully registered for the event!');
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed.';
      showToast(msg, 'error');
    } finally {
      setRegistering(null);
    }
  };

  // For paid events — submit with UPI transaction ID
  const handlePaidRegister = async (eventId) => {
    if (!upiInput.trim()) {
      showToast('Please enter your UPI Transaction ID.', 'error');
      return;
    }
    setUpiSubmitting(true);
    try {
      const res = await api.post(`/student/events/${eventId}/register`, {
        upiTransactionId: upiInput.trim()
      });
      const reg = res.data.registration;
      setRegistrationMap(prev => ({ ...prev, [eventId]: reg }));
      setShowUpiForm(false);
      setUpiInput('');
      showToast('Registration submitted! Awaiting payment verification.');
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed.';
      showToast(msg, 'error');
    } finally {
      setUpiSubmitting(false);
    }
  };

  // When the user clicks Register on a card or in the modal
  const handleRegisterClick = (event) => {
    const isFree = !event.price || event.price === 0;
    if (isFree) {
      handleFreeRegister(event.id);
    } else {
      // Open event modal if not already open, and show UPI form
      if (!selectedEvent || selectedEvent.id !== event.id) {
        setSelectedEvent(event);
      }
      setShowUpiForm(true);
    }
  };

  const getRegistrationStatus = (eventId) => registrationMap[eventId] || null;

  const filteredEvents = events.filter(event => {
    const searchMatch = (event.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.clubName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = activeCategory === 'All' || event.category === activeCategory;
    return searchMatch && categoryMatch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'TBA';
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hour, minute] = timeString.split(':');
    if (!hour || !minute) return timeString;
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${minute} ${ampm}`;
  };

  // Renders the register button based on registration state
  const RegisterButton = ({ event, fullWidth = false }) => {
    const reg = getRegistrationStatus(event.id);
    const isFree = !event.price || event.price === 0;
    const baseClass = `flex items-center justify-center gap-2 py-3.5 rounded-[1.25rem] font-bold text-sm transition-all active:scale-95 ${fullWidth ? 'w-full' : 'flex-1'}`;

    if (reg) {
      if (reg.paymentStatus === 'verified') {
        return (
          <button disabled className={`${baseClass} bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20`}>
            <Check className="w-4 h-4" /> Registered
          </button>
        );
      }
      if (reg.paymentStatus === 'pending') {
        return (
          <button disabled className={`${baseClass} bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20`}>
            <Clock className="w-4 h-4" /> Pending Verification
          </button>
        );
      }
      if (reg.paymentStatus === 'rejected') {
        return (
          <button disabled className={`${baseClass} bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20`}>
            <X className="w-4 h-4" /> Payment Rejected
          </button>
        );
      }
    }

    // Not registered
    return (
      <button
        onClick={() => handleRegisterClick(event)}
        disabled={registering === event.id}
        className={`${baseClass} bg-slate-900 text-white dark:bg-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 shadow-lg hover:shadow-slate-500/20 dark:hover:shadow-white/20 disabled:opacity-50 disabled:active:scale-100`}
      >
        {registering === event.id ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          isFree ? 'Register Free' : `Register · ₹${event.price}`
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30">
      <SmartHeader />

      <main className="max-w-7xl mx-auto pt-32 px-6 sm:px-8 pb-12">
        {/* Action Bar (Search & Categories) */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-10 w-full">
          {/* Search Bar */}
          <div className="flex-1 w-full max-w-xl relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search events by title, description or club..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-14 pr-12 py-4 rounded-[2rem] bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 shadow-sm hover:shadow-md transition-all font-medium text-sm sm:text-base"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Categories Pill List */}
          <div className="w-full lg:w-auto overflow-x-auto hide-scrollbar pb-2 lg:pb-0">
            <div className="flex gap-2 min-w-max">
              {EVENT_CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${activeCategory === category
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-black dark:border-white shadow-md shadow-slate-900/10 dark:shadow-white/10'
                    : 'bg-white dark:bg-[#0a0a0a] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="group bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 relative overflow-hidden flex flex-col h-full animate-pulse">
                <div className="w-full h-48 rounded-[1.5rem] bg-slate-200 dark:bg-white/10 mb-6"></div>
                <div className="w-3/4 h-8 rounded-lg bg-slate-200 dark:bg-white/10 mb-3"></div>
                <div className="w-full h-4 rounded bg-slate-200 dark:bg-white/5 mb-2"></div>
                <div className="w-5/6 h-4 rounded bg-slate-200 dark:bg-white/5 mb-8"></div>
                <div className="mt-auto pt-6 border-t border-slate-100 dark:border-white/10">
                  <div className="w-full h-12 rounded-[1.25rem] bg-slate-200 dark:bg-white/10"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredEvents.map(event => {
              const reg = getRegistrationStatus(event.id);
              const isFree = !event.price || event.price === 0;
              return (
                <div
                  key={event.id}
                  className="group relative flex flex-col bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden hover:border-indigo-200 dark:hover:border-white/10 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-400 h-full"
                >
                  {/* Banner */}
                  <div className="h-40 bg-slate-100 dark:bg-white/5 relative overflow-hidden shrink-0 border-b border-slate-200/50 dark:border-white/10">
                    {event.bannerURL ? (
                      <img
                        src={event.bannerURL}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10">
                        <ImageIcon className="w-12 h-12 text-indigo-300 dark:text-indigo-700 opacity-50" />
                      </div>
                    )}
                    {/* Price Badge */}
                    <div className={`absolute top-4 left-4 px-2.5 py-1 rounded-lg text-xs font-bold ${isFree ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                      {isFree ? 'Free' : `₹${event.price}`}
                    </div>
                    {/* Date Badge over image */}
                    <div className="absolute bottom-4 right-4 bg-white/95 dark:bg-black/90 backdrop-blur-md border border-white/50 dark:border-white/10 shadow-xl px-3 py-1.5 rounded-[1rem] flex flex-col items-center justify-center min-w-[3.5rem] group-hover:-translate-y-1 transition-transform">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mb-1">
                        {new Date(event.date).toLocaleDateString(undefined, { month: 'short' })}
                      </span>
                      <span className="text-xl font-black text-slate-900 dark:text-white leading-none">
                        {new Date(event.date).getDate()}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 sm:p-7 flex-1 flex flex-col relative z-10">
                    <div className="flex-grow flex flex-col relative z-10 mb-6">
                      {/* Category Pill */}
                      <div className="mb-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                          {event.category || 'Event'}
                        </span>
                      </div>

                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors drop-shadow-sm line-clamp-2 leading-snug">
                        {event.title}
                      </h3>

                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-6 line-clamp-2">
                        {event.description || 'No description available.'}
                      </p>

                      {/* Metadata Icons */}
                      <div className="flex flex-col gap-0.5 mt-auto">
                        <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                          <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          </div>
                          <span className="truncate">{event.venue || 'TBA'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                          <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0">
                            <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          </div>
                          <span className="truncate">{formatTime(event.time)}</span>
                        </div>
                        {event.clubName && (
                          <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0">
                              <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            </div>
                            <span className="truncate">{event.clubName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-white/10 flex gap-3">
                      <button
                        onClick={() => { setSelectedEvent(event); setShowUpiForm(false); setUpiInput(''); }}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[1.25rem] font-bold text-sm bg-slate-100 text-slate-900 dark:bg-white/5 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95"
                      >
                        View Details
                      </button>
                      <RegisterButton event={event} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-32 bg-white dark:bg-white/5 rounded-[3rem] border border-dashed border-slate-200 dark:border-white/10">
            <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No events found</h3>
            <p className="text-slate-500 max-w-xs mx-auto">
              We couldn't find any events matching your search criteria.
            </p>
            {(searchQuery || activeCategory !== 'All') && (
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                className="mt-6 font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </main>

      {/* Hide scrollbar utility class */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:top-24 sm:right-8 z-[999] animate-in slide-in-from-top-2 fade-in duration-300">
          <div className={`px-6 py-3.5 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-3 text-white ${toastType === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
            {toastType === 'error' ? <AlertCircle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
            {toastMessage}
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={() => { setSelectedEvent(null); setShowUpiForm(false); setUpiInput(''); }}
          ></div>
          <div className="relative bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

            {/* Absolute Fixed Close Button */}
            <button
              onClick={() => { setSelectedEvent(null); setShowUpiForm(false); setUpiInput(''); }}
              className="absolute top-4 right-4 z-[60] w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Scrollable Area */}
            <div className="overflow-y-auto hide-scrollbar flex-grow">
              {/* Modal Header/Banner */}
              <div className="relative h-48 sm:h-64 w-full bg-slate-100 dark:bg-white/5 shrink-0">
                {selectedEvent.bannerURL ? (
                  <img src={selectedEvent.bannerURL} alt={selectedEvent.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10">
                    <ImageIcon className="w-16 h-16 text-indigo-300 dark:text-indigo-700 opacity-50" />
                  </div>
                )}
                {/* Price badge in modal banner */}
                {selectedEvent.price > 0 ? (
                  <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1.5">
                    <IndianRupee className="w-4 h-4" /> {selectedEvent.price} Entry Fee
                  </div>
                ) : (
                  <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1 rounded-lg text-sm font-bold">
                    Free Event
                  </div>
                )}
              </div>

              {/* Modal Content */}
              <div className="p-6 sm:p-8 sm:pt-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                    {selectedEvent.category || 'Event'}
                  </span>
                  {selectedEvent.clubName && (
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                      by {selectedEvent.clubName}
                    </span>
                  )}
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-8">
                  {selectedEvent.title}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 bg-slate-50 dark:bg-white/5 p-5 rounded-3xl border border-slate-100 dark:border-white/10">
                  <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
                    <div className="w-12 h-12 rounded-[1rem] bg-white dark:bg-white/10 flex items-center justify-center shadow-sm shrink-0">
                      <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Date & Time</p>
                      <p className="font-bold">{formatDate(selectedEvent.date)}</p>
                      <p className="text-sm">{formatTime(selectedEvent.time)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
                    <div className="w-12 h-12 rounded-[1rem] bg-white dark:bg-white/10 flex items-center justify-center shadow-sm shrink-0">
                      <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Location</p>
                      <p className="font-bold">{selectedEvent.venue || 'TBA'}</p>
                    </div>
                  </div>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none mb-8">
                  <h3 className="text-lg font-bold mb-3">About the Event</h3>
                  <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">
                    {selectedEvent.description || 'No detailed description provided.'}
                  </p>
                </div>

                {selectedEvent.pdfURL && (
                  <div className="mb-4">
                    <a
                      href={selectedEvent.pdfURL}
                      target="_blank"
                      rel="noreferrer"
                      download={selectedEvent.pdfName || "event_document.pdf"}
                      className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20 transition-colors border border-indigo-200 dark:border-indigo-500/20"
                    >
                      Download Attached Document
                    </a>
                  </div>
                )}

                {/* UPI Payment Form (for paid events) */}
                {showUpiForm && selectedEvent.price > 0 && !getRegistrationStatus(selectedEvent.id) && (
                  <div className="mt-6 p-5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                        <IndianRupee className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 dark:text-white text-sm">Payment Required — ₹{selectedEvent.price}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                          Pay ₹{selectedEvent.price} via UPI to the club's UPI ID, then enter your UPI Transaction ID below to confirm your registration.
                        </p>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Enter UPI Transaction ID (e.g. UPI123456789)"
                      value={upiInput}
                      onChange={e => setUpiInput(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black/40 border border-amber-300 dark:border-amber-500/30 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 placeholder-slate-400 mb-3"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setShowUpiForm(false); setUpiInput(''); }}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handlePaidRegister(selectedEvent.id)}
                        disabled={upiSubmitting || !upiInput.trim()}
                        className="flex-2 flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-amber-500/20"
                      >
                        {upiSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Confirm Registration
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer (Sticky at bottom) */}
            <div className="p-6 sm:px-8 border-t border-slate-100 dark:border-white/10 shrink-0 bg-slate-50 dark:bg-black/40 z-10">
              {!showUpiForm ? (
                <RegisterButton event={selectedEvent} fullWidth />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
