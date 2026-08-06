import { useState, useEffect, useRef } from 'react';
import SmartHeader from '../../components/SmartHeader';
import api from '../../services/api';
import {
  Calendar, Plus, Loader2, Trash2, Pencil, X,
  MapPin, Clock, Users, IndianRupee, Search, CalendarClock,
  Sparkles, AlertCircle, ChevronDown, CheckCircle2, ChevronLeft, ChevronRight,
  Image, FileText, Upload, Tag, Download
} from 'lucide-react';

const STATUS_COLORS = {
  draft:     'bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300',
  published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
};

const EMPTY_FORM = {
  title: '', description: '', date: '', time: '', venue: '',
  category: '', capacity: '', price: '', registrationDeadline: '',
  status: 'draft', options: {}
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '02:00 PM', '03:30 PM', '05:00 PM', '06:30 PM', '08:00 PM'
];

export default function ClubEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [calMonthDate, setCalMonthDate] = useState(new Date());

  // ── Upload state ──
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfName, setPdfName] = useState('');
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const bannerInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  useEffect(() => { fetchEvents(); }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setShowModal(false);
        setActiveDropdown(null);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown && !event.target.closest('.relative-dropdown')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/club/events');
      setEvents(res.data.events || []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetUploadState = () => {
    setBannerFile(null);
    setBannerPreview('');
    setPdfFile(null);
    setPdfName('');
  };

  const openCreate = () => {
    setEditingEvent(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setActiveDropdown(null);
    setCalMonthDate(new Date());
    resetUploadState();
    setShowModal(true);
  };

  const openEdit = (event, e) => {
    e?.stopPropagation();
    setEditingEvent(event);
    setForm({
      title: event.title || '',
      description: event.description || '',
      date: event.date || '',
      time: event.time || '',
      venue: event.venue || '',
      category: event.category || 'Workshop',
      capacity: event.capacity || '',
      price: event.price || '',
      registrationDeadline: event.registrationDeadline || '',
      status: event.status || 'draft',
      options: event.options || {}
    });
    setErrors({});
    setActiveDropdown(null);
    resetUploadState();
    // Show existing banner/pdf previews
    if (event.bannerURL) setBannerPreview(event.bannerURL);
    if (event.pdfURL) setPdfName(event.pdfURL.split('/').pop() || 'Existing PDF');
    if (event.date) {
      const d = new Date(event.date + 'T00:00:00');
      if (!isNaN(d.getTime())) setCalMonthDate(d);
    } else {
      setCalMonthDate(new Date());
    }
    setShowModal(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required.';
    if (!form.date) errs.date = 'Date is required.';
    if (!form.venue.trim()) errs.venue = 'Venue is required.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      let savedEventId;
      if (editingEvent) {
        await api.put(`/club/events/${editingEvent.id}`, form);
        savedEventId = editingEvent.id;
      } else {
        const res = await api.post('/club/events', form);
        savedEventId = res.data.event?.id;
      }

      // Upload banner if a new file was selected
      if (bannerFile && savedEventId) {
        setUploadingBanner(true);
        const fd = new FormData();
        fd.append('image', bannerFile);
        await api.post(`/club/events/${savedEventId}/banner`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setUploadingBanner(false);
      }

      // Upload PDF if a new file was selected
      if (pdfFile && savedEventId) {
        setUploadingPdf(true);
        const fd = new FormData();
        fd.append('pdf', pdfFile);
        await api.post(`/club/events/${savedEventId}/pdf`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setUploadingPdf(false);
      }

      setShowModal(false);
      await fetchEvents();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save event');
    } finally {
      setSubmitting(false);
      setUploadingBanner(false);
      setUploadingPdf(false);
    }
  };

  const handleDelete = (event, e) => {
    e?.stopPropagation();
    setDeleteTarget(event);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/club/events/${deleteTarget.id}`);
      setEvents(prev => prev.filter(n => n.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete event');
    } finally {
      setDeleting(false);
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfFile(file);
    setPdfName(file.name);
  };

  const setField = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: undefined }));
  };

  const filteredEvents = events.filter(e =>
    e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.venue?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Custom Calendar Helpers ──
  const getDownloadUrl = (url) => {
    if (url && url.includes('cloudinary.com') && url.includes('/upload/')) {
      return url.replace('/upload/', '/upload/fl_attachment/');
    }
    return url;
  };

  const year = calMonthDate.getFullYear();
  const month = calMonthDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handleSelectDay = (dayNum) => {
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(dayNum).padStart(2, '0');
    setField('date', `${year}-${mStr}-${dStr}`);
    setActiveDropdown(null);
  };

  const handlePresetDate = (daysAhead) => {
    const target = new Date();
    target.setDate(target.getDate() + daysAhead);
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, '0');
    const d = String(target.getDate()).padStart(2, '0');
    setCalMonthDate(target);
    setField('date', `${y}-${m}-${d}`);
    setActiveDropdown(null);
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return 'Select Event Date';
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30">
      <SmartHeader />

      <main className="max-w-7xl mx-auto pt-24 sm:pt-32 px-4 sm:px-8 pb-12">

        {/* Action Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-12 w-full">
          <div className="flex-1 w-full max-w-xl relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search events, venues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-14 pr-6 py-4 rounded-[2rem] bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 shadow-sm hover:shadow-md transition-all font-medium text-sm sm:text-base"
            />
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all w-full lg:w-auto justify-center shrink-0 text-sm sm:text-base group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            Create New Event
          </button>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-slate-500 font-medium tracking-widest uppercase text-sm">Retrieving Events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 px-4 text-center bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-3xl shadow-sm">
            <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
              <CalendarClock className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No active events</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md">Create your first event from the action bar to publish workshops or hackathons for students.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max">
            {filteredEvents.map(event => (
              <div key={event.id} className="group relative flex flex-col bg-white dark:bg-[#080808] border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden hover:border-indigo-200 dark:hover:border-white/10 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300">
                {/* Banner */}
                <div
                  className="h-36 bg-gradient-to-r from-slate-950 via-zinc-900 to-black relative overflow-hidden shrink-0 border-b border-slate-200/50 dark:border-white/10"
                  style={event.bannerURL ? { backgroundImage: `url(${event.bannerURL})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                >
                  <span className={`absolute top-4 right-4 px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${STATUS_COLORS[event.status]}`}>
                    {event.status}
                  </span>
                  <span className="absolute bottom-3 left-4 px-3 py-1 text-xs font-bold rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 uppercase tracking-wider">
                    {event.category || 'Event'}
                  </span>
                </div>

                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
                      {event.description || 'No description provided.'}
                    </p>

                    <div className="space-y-2.5 mb-6 text-xs font-medium text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span>{formatDisplayDate(event.date)}{event.time && ` · ${event.time}`}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                      {event.capacity && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span>{(event.attendees || []).length} / {event.capacity} seats registered</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                          <IndianRupee className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{event.price > 0 ? `₹${event.price}` : 'Free'}</span>
                        </div>
                        {event.pdfURL && (
                          <a 
                            href={getDownloadUrl(event.pdfURL)} 
                            target="_blank" 
                            rel="noreferrer"
                            download="brochure.pdf"
                            className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Download className="w-3 h-3" />
                            Brochure
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
                    <button
                      onClick={(e) => openEdit(event, e)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-bold transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={(e) => handleDelete(event, e)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-600 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 text-xs font-bold transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ───── CREATE / EDIT EVENT MODAL ───── */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowModal(false)}></div>
          <div className="relative pointer-events-auto w-full max-w-2xl bg-white dark:bg-[#0a0a0a] border border-white/20 dark:border-white/10 rounded-[3rem] p-8 sm:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-8 shrink-0">
              <h2 className="text-3xl font-black tracking-tight leading-tight">
                {editingEvent ? 'Edit Event' : 'Create Event'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                type="button"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">Event Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Hackathon 2026 / Tech Symposium"
                  value={form.title}
                  onChange={(e) => setField('title', e.target.value)}
                  className="w-full p-4.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-white/15 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                />
                {errors.title && <p className="text-xs text-red-500 mt-2 ml-1 font-bold">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">Description</label>
                <textarea
                  rows={4}
                  placeholder="Describe the event, rules, schedule, prizes..."
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  className="w-full p-4.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-white/15 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none"
                />
              </div>

              {/* MODERN DATE & TIME SELECTORS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* ── CUSTOM DATE PICKER ── */}
                <div className="relative relative-dropdown">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">Event Date *</label>
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(activeDropdown === 'date' ? null : 'date')}
                    className={`w-full p-4.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-white/15 flex items-center justify-between transition-all font-bold text-sm ${activeDropdown === 'date' ? 'ring-4 ring-indigo-500/10 border-indigo-500' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-indigo-500 shrink-0" />
                      <span className={form.date ? 'text-slate-900 dark:text-white' : 'text-slate-400'}>
                        {formatDisplayDate(form.date)}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeDropdown === 'date' ? 'rotate-180' : ''}`} />
                  </button>

                  {activeDropdown === 'date' && (
                    <div className="absolute z-[120] top-full left-0 mt-2 w-full sm:w-80 bg-white/95 dark:bg-[#121215]/95 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-[2.5rem] p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-200">
                      
                      {/* Month Header */}
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/10">
                        <button
                          type="button"
                          onClick={() => setCalMonthDate(new Date(year, month - 1, 1))}
                          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white tracking-wide">
                          {MONTH_NAMES[month]} {year}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCalMonthDate(new Date(year, month + 1, 1))}
                          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Day Names */}
                      <div className="grid grid-cols-7 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                      </div>

                      {/* Days Grid */}
                      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold mb-4">
                        {Array.from({ length: firstDayIndex }).map((_, i) => (
                          <div key={`empty-${i}`} />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const dayNum = i + 1;
                          const mStr = String(month + 1).padStart(2, '0');
                          const dStr = String(dayNum).padStart(2, '0');
                          const fullDateStr = `${year}-${mStr}-${dStr}`;
                          const isSelected = form.date === fullDateStr;

                          return (
                            <button
                              key={dayNum}
                              type="button"
                              onClick={() => handleSelectDay(dayNum)}
                              className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/40 font-black scale-105'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-white/10'
                              }`}
                            >
                              {dayNum}
                            </button>
                          );
                        })}
                      </div>

                      {/* Quick Presets */}
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-white/10">
                        <button
                          type="button"
                          onClick={() => handlePresetDate(0)}
                          className="flex-1 py-2 px-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 text-slate-600 dark:text-slate-300 hover:text-indigo-600 text-[11px] font-bold transition-all text-center"
                        >
                          Today
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePresetDate(1)}
                          className="flex-1 py-2 px-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 text-slate-600 dark:text-slate-300 hover:text-indigo-600 text-[11px] font-bold transition-all text-center"
                        >
                          Tomorrow
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePresetDate(7)}
                          className="flex-1 py-2 px-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 text-slate-600 dark:text-slate-300 hover:text-indigo-600 text-[11px] font-bold transition-all text-center"
                        >
                          +1 Week
                        </button>
                      </div>
                    </div>
                  )}
                  {errors.date && <p className="text-xs text-red-500 mt-2 ml-1 font-bold">{errors.date}</p>}
                </div>

                {/* ── CUSTOM TIME PICKER ── */}
                <div className="relative relative-dropdown">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">Start Time</label>
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(activeDropdown === 'time' ? null : 'time')}
                    className={`w-full p-4.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-white/15 flex items-center justify-between transition-all font-bold text-sm ${activeDropdown === 'time' ? 'ring-4 ring-indigo-500/10 border-indigo-500' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-indigo-500 shrink-0" />
                      <span className={form.time ? 'text-slate-900 dark:text-white' : 'text-slate-400'}>
                        {form.time || 'Select Time'}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeDropdown === 'time' ? 'rotate-180' : ''}`} />
                  </button>

                  {activeDropdown === 'time' && (
                    <div className="absolute z-[120] top-full right-0 mt-2 w-full sm:w-80 bg-white/95 dark:bg-[#121215]/95 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-[2.5rem] p-5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-200">
                      
                      {/* Large Glowing Digital Clock Display Header */}
                      <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-500/10 dark:to-blue-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-3.5 mb-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          <span className="font-mono text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-wider">
                            {form.time || '10:00 AM'}
                          </span>
                        </div>

                        {/* AM / PM Toggle Pill */}
                        <div className="flex rounded-xl bg-white dark:bg-black/40 p-1 border border-slate-200/60 dark:border-white/10 shadow-inner">
                          <button
                            type="button"
                            onClick={() => {
                              const parts = form.time?.split(' ') || ['10:00', 'AM'];
                              const timePart = parts[0] || '10:00';
                              setField('time', `${timePart} AM`);
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                              form.time?.includes('AM') || !form.time?.includes('PM')
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 scale-105'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            AM
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const parts = form.time?.split(' ') || ['10:00', 'AM'];
                              const timePart = parts[0] || '10:00';
                              setField('time', `${timePart} PM`);
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                              form.time?.includes('PM')
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 scale-105'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            PM
                          </button>
                        </div>
                      </div>

                      {/* Hours Pill Grid */}
                      <div className="mb-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Hour</p>
                        <div className="grid grid-cols-6 gap-1.5">
                          {['01','02','03','04','05','06','07','08','09','10','11','12'].map(h => {
                            const curH = form.time?.split(' ')?.[0]?.split(':')?.[0] || '10';
                            const isSel = curH === h;
                            return (
                              <button
                                key={h}
                                type="button"
                                onClick={() => {
                                  const parts = form.time?.split(' ') || ['10:00', 'AM'];
                                  const timePart = parts[0] || '10:00';
                                  const currentMin = timePart.split(':')[1] || '00';
                                  const currentAmpm = parts[1] || 'AM';
                                  setField('time', `${h}:${currentMin} ${currentAmpm}`);
                                }}
                                className={`py-2 text-xs font-extrabold rounded-xl transition-all ${
                                  isSel
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 font-black scale-105'
                                    : 'bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {h}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Minutes Pill Grid */}
                      <div className="mb-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Minute</p>
                        <div className="grid grid-cols-4 gap-2">
                          {['00','15','30','45'].map(m => {
                            const curM = form.time?.split(' ')?.[0]?.split(':')?.[1] || '00';
                            const isSel = curM === m;
                            return (
                              <button
                                key={m}
                                type="button"
                                onClick={() => {
                                  const parts = form.time?.split(' ') || ['10:00', 'AM'];
                                  const timePart = parts[0] || '10:00';
                                  const currentHour = timePart.split(':')[0] || '10';
                                  const currentAmpm = parts[1] || 'AM';
                                  setField('time', `${currentHour}:${m} ${currentAmpm}`);
                                }}
                                className={`py-2 text-xs font-extrabold rounded-xl transition-all ${
                                  isSel
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 font-black scale-105'
                                    : 'bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                :{m}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Quick Slots */}
                      <div className="pt-3 border-t border-slate-100 dark:border-white/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Quick Slots</p>
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                          {['10:00 AM', '02:00 PM', '05:00 PM', '07:30 PM'].map(slot => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => { setField('time', slot); setActiveDropdown(null); }}
                              className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 text-slate-600 dark:text-slate-300 hover:text-indigo-600 text-[11px] font-bold transition-all whitespace-nowrap shrink-0"
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">Venue *</label>
                <input
                  type="text"
                  placeholder="e.g. Auditorium Hall A / Lab 3"
                  value={form.venue}
                  onChange={(e) => setField('venue', e.target.value)}
                  className="w-full p-4.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-white/15 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                />
                {errors.venue && <p className="text-xs text-red-500 mt-2 ml-1 font-bold">{errors.venue}</p>}
              </div>

              {/* ── CUSTOM STATUS DROPDOWN ── */}
              <div className="relative relative-dropdown">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">Event Status</label>
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
                  className={`w-full p-4.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/15 flex items-center justify-between transition-all font-bold ${activeDropdown === 'status' ? 'ring-4 ring-indigo-500/10 border-indigo-500' : ''}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      form.status === 'published' ? 'bg-emerald-500' :
                      form.status === 'completed' ? 'bg-blue-500' :
                      form.status === 'cancelled' ? 'bg-red-500' : 'bg-slate-400'
                    }`} />
                    <span className="text-slate-900 dark:text-white capitalize">{form.status || 'Draft'}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${activeDropdown === 'status' ? 'rotate-180' : ''}`} />
                </button>

                {activeDropdown === 'status' && (
                  <div className="absolute z-[110] left-0 right-0 mt-2 p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/15 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-150">
                    {[
                      { value: 'draft', label: 'Draft', desc: 'Hidden from public feed', dot: 'bg-slate-400' },
                      { value: 'published', label: 'Published', desc: 'Live for all students', dot: 'bg-emerald-500' },
                      { value: 'completed', label: 'Completed', desc: 'Event concluded', dot: 'bg-blue-500' },
                      { value: 'cancelled', label: 'Cancelled', desc: 'Event called off', dot: 'bg-red-500' },
                    ].map(st => (
                      <button
                        key={st.value}
                        type="button"
                        onClick={() => { setField('status', st.value); setActiveDropdown(null); }}
                        className={`w-full text-left px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors flex items-center justify-between group ${form.status === st.value ? 'bg-slate-50 dark:bg-white/5' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-2.5 h-2.5 rounded-full ${st.dot}`} />
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{st.label}</p>
                            <p className="text-xs text-slate-400 font-medium">{st.desc}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">Event Type / Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Workshop, Hackathon, Seminar"
                    value={form.category}
                    onChange={(e) => setField('category', e.target.value)}
                    className="w-full p-4.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-white/15 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">Reg. Deadline (Optional)</label>
                  <input
                    type="date"
                    value={form.registrationDeadline}
                    onChange={(e) => setField('registrationDeadline', e.target.value)}
                    className="w-full p-4.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-white/15 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
              </div>

              {/* File Uploads */}
              <div className="space-y-5">
                {/* Banner Upload */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">Event Banner (Optional)</label>
                  <div 
                    onClick={() => bannerInputRef.current?.click()}
                    className="relative w-full h-40 rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50 dark:bg-zinc-900/50 flex flex-col items-center justify-center gap-3 cursor-pointer overflow-hidden transition-all group"
                  >
                    <input 
                      type="file" 
                      ref={bannerInputRef} 
                      onChange={handleBannerChange} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    {bannerPreview ? (
                      <>
                        <img src={bannerPreview} alt="Banner Preview" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                        <div className="relative z-10 flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl text-white font-bold text-sm">
                          <Image className="w-4 h-4" /> Change Banner
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          <Image className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Click to upload banner image</p>
                      </>
                    )}
                  </div>
                </div>

                {/* PDF Upload */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">Event Brochure / PDF (Optional)</label>
                  <div 
                    onClick={() => pdfInputRef.current?.click()}
                    className="w-full p-4.5 rounded-2xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-zinc-900/90 hover:border-indigo-500 dark:hover:border-indigo-500 flex items-center justify-between cursor-pointer transition-all group"
                  >
                    <input 
                      type="file" 
                      ref={pdfInputRef} 
                      onChange={handlePdfChange} 
                      accept="application/pdf" 
                      className="hidden" 
                    />
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 shrink-0 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {pdfName || 'Upload a PDF document'}
                      </span>
                    </div>
                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors shrink-0 ml-3" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">Max Capacity</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 150"
                    value={form.capacity}
                    onChange={(e) => setField('capacity', e.target.value)}
                    className="w-full p-4.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-white/15 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">Ticket Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 for Free"
                    value={form.price}
                    onChange={(e) => setField('price', e.target.value)}
                    className="w-full p-4.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-white/15 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-3 py-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-black text-base shadow-xl shadow-indigo-500/25 active:scale-[0.99] transition-all"
              >
                {submitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Saving Event...</>
                ) : (
                  <><Calendar className="w-5 h-5" /> {editingEvent ? 'Update Event' : 'Publish Event'}</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* ───── DELETE CONFIRMATION DIALOG ───── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setDeleteTarget(null)} />
          <div className="relative pointer-events-auto w-full max-w-sm bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-black text-center text-slate-900 dark:text-white mb-2">Delete Event?</h3>
            <p className="text-sm text-slate-500 text-center leading-relaxed mb-2">
              <span className="font-bold text-slate-700 dark:text-slate-300">&ldquo;{deleteTarget.title}&rdquo;</span>
            </p>
            <p className="text-xs text-slate-400 text-center mb-8">
              This will permanently delete this event and any attached files. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold flex items-center justify-center gap-2 transition-all text-sm shadow-lg shadow-red-500/20 active:scale-95"
              >
                {deleting ? <><Loader2 className="w-4 h-4 animate-spin" />Deleting...</> : <><Trash2 className="w-4 h-4" />Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
