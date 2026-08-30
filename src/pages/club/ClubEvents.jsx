import { useState, useEffect, useRef } from 'react';
import SmartHeader from '../../components/SmartHeader';
import api from '../../services/api';
import {
  Calendar, Plus, Loader2, Trash2, Pencil, X,
  MapPin, Clock, Users, IndianRupee, Search, CalendarClock,
  ChevronDown, ChevronLeft, ChevronRight,
  Image, FileText, Upload, Tag, Download,
  CheckCircle, XCircle, ClipboardList, AlertCircle,
  GraduationCap, CreditCard, UserCircle,
  Eye, ExternalLink, Copy, Check, Sparkles
} from 'lucide-react';

const STATUS_COLORS = {
  draft: 'bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
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
  const [toast, setToast] = useState(null);
  const [regGlobalStats, setRegGlobalStats] = useState(null);

  // ── Registrations Drawer state ──
  const [registrationsEvent, setRegistrationsEvent] = useState(null); // event for which drawer is open
  const [registrations, setRegistrations] = useState([]);
  const [regStats, setRegStats] = useState(null);
  const [regLoading, setRegLoading] = useState(false);
  const [regSearch, setRegSearch] = useState('');
  const [regFilter, setRegFilter] = useState('all'); // 'all' | 'pending' | 'verified' | 'rejected'
  const [updatingReg, setUpdatingReg] = useState(null); // reg id being updated

  const openRegistrationsDrawer = async (event) => {
    setRegistrationsEvent(event);
    setRegSearch('');
    setRegFilter('all');
    setRegistrations([]);
    setRegStats(null);
    setRegLoading(true);
    try {
      const res = await api.get(`/club/events/${event.id}/registrations`);
      setRegistrations(res.data.registrations || []);
      setRegStats(res.data.stats || null);
    } catch (err) {
      console.error('Failed to fetch registrations:', err);
      showToast('Failed to load registrations.', 'error');
    } finally {
      setRegLoading(false);
    }
  };

  const handleRegStatusUpdate = async (regId, newStatus) => {
    setUpdatingReg(regId);
    try {
      await api.patch(`/club/registrations/${regId}/status`, { status: newStatus });
      setRegistrations(prev =>
        prev.map(r => r.id === regId ? { ...r, paymentStatus: newStatus } : r)
      );

      // Synchronize attendees count on event card and detail panel
      const targetReg = registrations.find(r => r.id === regId);
      if (targetReg) {
        const studentUid = targetReg.studentUid;
        const targetEventId = targetReg.eventId || registrationsEvent?.id;

        const updateAttendeesForEvent = (ev) => {
          if (ev.id !== targetEventId) return ev;
          const curAttendees = ev.attendees || [];
          const nextAttendees = newStatus === 'rejected'
            ? curAttendees.filter(uid => uid !== studentUid)
            : curAttendees.includes(studentUid) ? curAttendees : [...curAttendees, studentUid];
          return { ...ev, attendees: nextAttendees };
        };

        setEvents(prev => prev.map(updateAttendeesForEvent));

        if (registrationsEvent && registrationsEvent.id === targetEventId) {
          setRegistrationsEvent(prev => prev ? updateAttendeesForEvent(prev) : null);
        }
      }

      // Refresh stats
      if (registrationsEvent) {
        const res = await api.get(`/club/events/${registrationsEvent.id}/registrations`);
        setRegStats(res.data.stats || null);
      }
      fetchGlobalStats();
      showToast(`Registration ${newStatus === 'verified' ? 'verified' : 'rejected'} successfully.`);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update status.', 'error');
    } finally {
      setUpdatingReg(null);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Upload state ──
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfName, setPdfName] = useState('');
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const bannerInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  const fetchGlobalStats = async () => {
    try {
      const res = await api.get('/club/registrations/stats');
      setRegGlobalStats(res.data.stats || { total: 0, pending: 0, verified: 0, revenue: 0 });
    } catch (_) {
      setRegGlobalStats({ total: 0, pending: 0, verified: 0, revenue: 0 });
    }
  };

  useEffect(() => { fetchEvents(); fetchGlobalStats(); }, []);

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
    if (!form.date) {
      errs.date = 'Date is required.';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const eventDate = new Date(form.date + 'T00:00:00');
      if (eventDate < today) {
        errs.date = 'Event date cannot be in the past.';
      } else if (form.date === new Date().toISOString().split('T')[0] && form.time) {
        // Same day — check time
        const match = form.time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (match) {
          let [, h, m, ampm] = match;
          h = parseInt(h, 10);
          m = parseInt(m, 10);
          if (ampm.toUpperCase() === 'PM' && h !== 12) h += 12;
          if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;
          const eventMinutes = h * 60 + m;
          const now = new Date();
          const nowMinutes = now.getHours() * 60 + now.getMinutes();
          if (eventMinutes <= nowMinutes) {
            errs.time = 'Event time cannot be in the past for today.';
          }
        }
      }
    }
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
      showToast(`Event ${editingEvent ? 'updated' : 'created'} successfully!`);
      await fetchEvents();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to save event', 'error');
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
      showToast('Event deleted successfully.');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete event', 'error');
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

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold transition-all duration-300 animate-in slide-in-from-top-10 fade-in ${toast.type === 'error'
          ? 'bg-red-600 text-white'
          : 'bg-emerald-600 text-white'
          }`}>
          {toast.type === 'error' ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      <main className="max-w-7xl mx-auto pt-24 sm:pt-32 px-4 sm:px-8 pb-12">

        {/* Global Registration Stats Bar */}
        {!regGlobalStats ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-4 sm:p-6 shadow-sm animate-pulse">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-slate-200 dark:bg-white/5"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-3 w-20 bg-slate-200 dark:bg-white/5 rounded"></div>
                    <div className="h-6 w-12 bg-slate-200 dark:bg-white/10 rounded-md"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
            {[
              {
                label: 'Total Registrations',
                value: regGlobalStats.total?.toLocaleString() ?? '0',
                icon: Users,
                color: 'text-blue-600 dark:text-blue-400',
                bg: 'bg-blue-100 dark:bg-blue-500/10'
              },
              {
                label: 'Pending Approval',
                value: regGlobalStats.pending?.toLocaleString() ?? '0',
                icon: Clock,
                color: 'text-amber-600 dark:text-amber-400',
                bg: 'bg-amber-100 dark:bg-amber-500/10'
              },
              {
                label: 'Verified Registrations',
                value: regGlobalStats.verified?.toLocaleString() ?? '0',
                icon: CheckCircle,
                color: 'text-emerald-600 dark:text-emerald-400',
                bg: 'bg-emerald-100 dark:bg-emerald-500/10'
              },
              {
                label: 'Revenue Collected',
                value: `₹${(regGlobalStats.revenue || 0).toLocaleString()}`,
                icon: IndianRupee,
                color: 'text-indigo-600 dark:text-indigo-400',
                bg: 'bg-indigo-100 dark:bg-indigo-500/10'
              },
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-4 sm:p-6 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  <div className={`p-3 sm:p-4 rounded-2xl ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-sm font-bold text-slate-400 uppercase tracking-widest leading-tight mb-0.5 sm:mb-0">{stat.label}</p>
                    <p className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col bg-white dark:bg-[#080808] border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden animate-pulse">
                <div className="h-36 bg-slate-200 dark:bg-white/5"></div>
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="h-6 bg-slate-200 dark:bg-white/10 rounded-lg w-3/4 mb-4"></div>
                    <div className="space-y-2 mb-6">
                      <div className="h-4 bg-slate-200 dark:bg-white/5 rounded w-full"></div>
                      <div className="h-4 bg-slate-200 dark:bg-white/5 rounded w-5/6"></div>
                    </div>
                    <div className="space-y-3 mb-6">
                      <div className="h-4 bg-slate-200 dark:bg-white/5 rounded w-1/2"></div>
                      <div className="h-4 bg-slate-200 dark:bg-white/5 rounded w-2/3"></div>
                      <div className="h-4 bg-slate-200 dark:bg-white/5 rounded w-1/3"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
                    <div className="h-10 bg-slate-200 dark:bg-white/5 rounded-xl flex-1"></div>
                    <div className="h-10 bg-slate-200 dark:bg-white/5 rounded-xl flex-1"></div>
                  </div>
                </div>
              </div>
            ))}
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
              <div key={event.id} className="group relative flex flex-col bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden hover:border-indigo-200 dark:hover:border-white/10 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-400 h-full">
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
                      <Calendar className="w-12 h-12 text-indigo-300 dark:text-indigo-700 opacity-50" />
                    </div>
                  )}
                  {/* Status badge */}
                  <span className={`absolute top-4 right-4 px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${STATUS_COLORS[event.status]}`}>
                    {event.status}
                  </span>
                  {/* Date Badge */}
                  <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-black/90 backdrop-blur-md border border-white/50 dark:border-white/10 shadow-xl px-3 py-1.5 rounded-[1rem] flex flex-col items-center justify-center min-w-[3.5rem] group-hover:-translate-y-1 transition-transform">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mb-1">
                      {event.date ? new Date(event.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short' }) : '—'}
                    </span>
                    <span className="text-xl font-black text-slate-900 dark:text-white leading-none">
                      {event.date ? new Date(event.date + 'T00:00:00').getDate() : '—'}
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-7 flex-1 flex flex-col">
                  <div className="flex-grow flex flex-col mb-6">
                    {/* Category Pill */}
                    <div className="mb-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                        {event.category || 'Event'}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-5 line-clamp-2">
                      {event.description || 'No description provided.'}
                    </p>

                    {/* Metadata rows */}
                    <div className="flex flex-col gap-0.5 mt-auto">
                      <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                        <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        </div>
                        <span className="truncate">{formatDisplayDate(event.date)}{event.time && ` · ${event.time}`}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                        <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        </div>
                        <span className="truncate">{event.venue}</span>
                      </div>
                      {event.capacity && (
                        <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                          <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0">
                            <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          </div>
                          <span>{(event.attendees || []).length} / {event.capacity} seats registered</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm font-bold text-slate-900 dark:text-white">
                          <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0">
                            <IndianRupee className="w-4 h-4 text-emerald-500" />
                          </div>
                          <span>{event.price > 0 ? `₹${event.price}` : 'Free'}</span>
                        </div>
                        {event.pdfURL && (
                          <a
                            href={getDownloadUrl(event.pdfURL)}
                            target="_blank"
                            rel="noreferrer"
                            download={event.pdfName || `${event.title?.replace(/[^a-z0-9]/gi, '_') || 'brochure'}.pdf`}
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
                  <div className="flex items-center gap-2 pt-5 border-t border-slate-100 dark:border-white/10">
                    <button
                      onClick={() => openRegistrationsDrawer(event)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-[1rem] bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all"
                    >
                      REGISTRATIONS
                    </button>
                    <button
                      onClick={(e) => openEdit(event, e)}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-[1rem] bg-slate-100 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-bold transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(event, e)}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-[1rem] bg-slate-100 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-600 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 text-xs font-bold transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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

                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const currentDate = new Date(fullDateStr + 'T00:00:00');
                          const isPast = currentDate < today;

                          return (
                            <button
                              key={dayNum}
                              type="button"
                              disabled={isPast}
                              onClick={() => handleSelectDay(dayNum)}
                              className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all ${isSelected
                                ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/40 font-black scale-105'
                                : isPast
                                  ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-50'
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
                            className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${form.time?.includes('AM') || !form.time?.includes('PM')
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
                            className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${form.time?.includes('PM')
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
                          {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(h => {
                            const curH = form.time?.split(' ')?.[0]?.split(':')?.[0] || '10';
                            const isSel = curH === h;
                            const curMin = form.time?.split(' ')?.[0]?.split(':')?.[1] || '00';
                            const curAmpm = form.time?.split(' ')?.[1] || 'AM';
                            const isToday = form.date === new Date().toISOString().split('T')[0];
                            let isPastHour = false;
                            if (isToday) {
                              let hNum = parseInt(h, 10);
                              if (curAmpm.toUpperCase() === 'PM' && hNum !== 12) hNum += 12;
                              if (curAmpm.toUpperCase() === 'AM' && hNum === 12) hNum = 0;
                              const mNum = parseInt(curMin, 10);
                              const now = new Date();
                              isPastHour = (hNum * 60 + mNum) <= (now.getHours() * 60 + now.getMinutes());
                            }
                            return (
                              <button
                                key={h}
                                type="button"
                                disabled={isPastHour}
                                onClick={() => {
                                  const parts = form.time?.split(' ') || ['10:00', 'AM'];
                                  const timePart = parts[0] || '10:00';
                                  const currentMin = timePart.split(':')[1] || '00';
                                  const currentAmpm = parts[1] || 'AM';
                                  setField('time', `${h}:${currentMin} ${currentAmpm}`);
                                }}
                                className={`py-2 text-xs font-extrabold rounded-xl transition-all ${isSel
                                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 font-black scale-105'
                                  : isPastHour
                                    ? 'opacity-30 cursor-not-allowed bg-slate-50 dark:bg-white/5 text-slate-400'
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
                          {['00', '15', '30', '45'].map(m => {
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
                                className={`py-2 text-xs font-extrabold rounded-xl transition-all ${isSel
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
                          {['10:00 AM', '02:00 PM', '05:00 PM', '07:30 PM'].map(slot => {
                            const isToday = form.date === new Date().toISOString().split('T')[0];
                            let isPastSlot = false;
                            if (isToday) {
                              const match = slot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
                              if (match) {
                                let [, sh, sm, sampm] = match;
                                sh = parseInt(sh, 10);
                                sm = parseInt(sm, 10);
                                if (sampm.toUpperCase() === 'PM' && sh !== 12) sh += 12;
                                if (sampm.toUpperCase() === 'AM' && sh === 12) sh = 0;
                                const now = new Date();
                                isPastSlot = (sh * 60 + sm) <= (now.getHours() * 60 + now.getMinutes());
                              }
                            }
                            return (
                              <button
                                key={slot}
                                type="button"
                                disabled={isPastSlot}
                                onClick={() => { setField('time', slot); setActiveDropdown(null); }}
                                className={`py-1.5 px-3 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap shrink-0 ${isPastSlot
                                  ? 'opacity-30 cursor-not-allowed bg-slate-100 dark:bg-white/5 text-slate-400'
                                  : 'bg-slate-100 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 text-slate-600 dark:text-slate-300 hover:text-indigo-600'
                                  }`}
                              >
                                {slot}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                  {errors.time && <p className="text-xs text-red-500 mt-2 ml-1 font-bold">{errors.time}</p>}
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
                    <span className={`w-2.5 h-2.5 rounded-full ${form.status === 'pending' ? 'bg-amber-500' :
                      form.status === 'cancelled' ? 'bg-red-500' : 'bg-slate-400'
                      }`} />
                    <span className="text-slate-900 dark:text-white">{
                      form.status === 'pending' ? 'Submit for Review' :
                        form.status === 'cancelled' ? 'Cancelled' : 'Draft'
                    }</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${activeDropdown === 'status' ? 'rotate-180' : ''}`} />
                </button>

                {activeDropdown === 'status' && (
                  <div className="absolute z-[110] left-0 right-0 mt-2 p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/15 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-150">
                    {[
                      { value: 'draft', label: 'Draft', desc: 'Save as work-in-progress', dot: 'bg-slate-400' },
                      { value: 'pending', label: 'Submit for Review', desc: 'Send to admin for approval', dot: 'bg-amber-500' },
                      { value: 'cancelled', label: 'Cancelled', desc: 'Cancel this event', dot: 'bg-red-500' },
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

      {/* ───── REGISTRATIONS DRAWER ───── */}
      {registrationsEvent && (
        <RegistrationsDrawer
          event={registrationsEvent}
          registrations={registrations}
          stats={regStats}
          loading={regLoading}
          search={regSearch}
          setSearch={setRegSearch}
          filter={regFilter}
          setFilter={setRegFilter}
          updatingReg={updatingReg}
          onUpdateStatus={handleRegStatusUpdate}
          onClose={() => setRegistrationsEvent(null)}
        />
      )}
    </div>
  );
}

// ─── Registrations Slide-Over Drawer ──────────────────────────────────────────
function RegistrationsDrawer({
  event, registrations, stats, loading,
  search, setSearch, filter, setFilter,
  updatingReg, onUpdateStatus, onClose
}) {
  const FILTERS = ['all', 'pending', 'verified', 'rejected'];
  const [previewReceipt, setPreviewReceipt] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const copyToClipboard = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = registrations.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (r.studentName || '').toLowerCase().includes(q) ||
      (r.studentRollNo || '').toLowerCase().includes(q) ||
      (r.studentEmail || '').toLowerCase().includes(q) ||
      (r.upiTransactionId || '').toLowerCase().includes(q);
    const matchFilter = filter === 'all' || r.paymentStatus === filter;
    return matchSearch && matchFilter;
  });

  return (
    <>
      <div className="fixed inset-0 z-[300] flex justify-end">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />

        {/* Drawer Panel - Styled like Notice detail slide-over drawer */}
        <div className="relative w-full max-w-lg lg:max-w-xl bg-white dark:bg-[#09090b] border-l border-slate-200 dark:border-white/10 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">

          {/* Drawer Top Header */}
          <div className="flex items-start justify-between px-6 sm:px-7 pt-7 pb-5 border-b border-slate-100 dark:border-white/5 shrink-0">
            <div className="min-w-0 pr-3">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20">
                  <Users className="w-3.5 h-3.5" />
                  Registrations
                </span>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border ${event.price > 0
                    ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                    : 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                  }`}>
                  {event.price > 0 ? `Paid (₹${event.price})` : 'Free Entry'}
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight truncate">
                {event.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-all shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notice-styled Stats Summary */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] shrink-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-200 dark:bg-white/5 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : stats ? (
              <div className={`grid gap-2.5 ${event.price > 0 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'}`}>
                <div className="flex items-center gap-3 bg-white dark:bg-[#121214] border border-slate-200/80 dark:border-white/10 rounded-2xl p-3.5 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total</p>
                    <p className="text-base font-black text-slate-900 dark:text-white leading-tight">{stats.total}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-[#121214] border border-slate-200/80 dark:border-white/10 rounded-2xl p-3.5 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Pending</p>
                    <p className="text-base font-black text-amber-600 dark:text-amber-400 leading-tight">{stats.pending}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-[#121214] border border-slate-200/80 dark:border-white/10 rounded-2xl p-3.5 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Verified</p>
                    <p className="text-base font-black text-emerald-600 dark:text-emerald-400 leading-tight">{stats.verified}</p>
                  </div>
                </div>

                {event.price > 0 && (
                  <div className="flex items-center gap-3 bg-white dark:bg-[#121214] border border-slate-200/80 dark:border-white/10 rounded-2xl p-3.5 shadow-xs">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                      <IndianRupee className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Revenue</p>
                      <p className="text-base font-black text-indigo-600 dark:text-indigo-400 leading-tight">₹{stats.revenue}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Search & Filter */}
          <div className="px-6 py-4 shrink-0 border-b border-slate-100 dark:border-white/5 space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search member by name, roll no, or UPI ref..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                  className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${filter === f
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-[1.02]'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Registrations Member List */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-xs font-bold uppercase tracking-wider">Loading registrations...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3 opacity-60" />
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                {registrations.length === 0 ? 'No registrations yet.' : 'No members match your search.'}
              </p>
            </div>
          ) : (
            filtered.map(reg => {
              const regDate = reg.createdAt ? (
                typeof reg.createdAt === 'object' && reg.createdAt._seconds
                  ? new Date(reg.createdAt._seconds * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                  : new Date(reg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
              ) : null;

              const isCopied = copiedId === reg.id;

              return (
                <div
                  key={reg.id}
                  className="group relative flex flex-col bg-white dark:bg-[#0c0c0e] border border-slate-200/90 dark:border-white/10 rounded-3xl p-5 sm:p-6 hover:border-indigo-400 dark:hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
                >
                  {/* Card Top: Badges & Date */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase border ${reg.paymentStatus === 'verified'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                          : reg.paymentStatus === 'pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                      }`}>
                        {reg.paymentStatus === 'verified' && <CheckCircle className="w-3.5 h-3.5" />}
                        {reg.paymentStatus === 'pending' && <Clock className="w-3.5 h-3.5" />}
                        {reg.paymentStatus === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
                        {reg.paymentStatus}
                      </span>
                    </div>

                    {regDate && (
                      <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                        <Calendar className="w-3.5 h-3.5 opacity-70" />
                        <span>{regDate}</span>
                      </div>
                    )}
                  </div>

                  {/* Student Profile Info */}
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="relative shrink-0">
                      {reg.studentPhotoURL ? (
                        <img
                          src={reg.studentPhotoURL}
                          alt={reg.studentName}
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-100 dark:border-white/10 shadow-xs"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-lg shadow-xs">
                          {(reg.studentName || 'S')[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-black text-slate-900 dark:text-white text-base leading-snug truncate">
                        {reg.studentName || 'Anonymous Student'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold truncate mt-0.5">
                        {reg.studentRollNo || reg.studentEmail}
                      </p>
                    </div>
                  </div>

                  {/* Notice-styled Mini Info Grid */}
                  <div className="grid grid-cols-2 gap-2.5 mb-3.5">
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl p-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-4 h-4 text-indigo-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Dept</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{reg.studentDepartment || 'General'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl p-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <CreditCard className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Payment</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{reg.isFree ? 'Free Entry' : `₹${reg.amount}`}</p>
                      </div>
                    </div>
                  </div>

                  {/* Receipt & UPI Details */}
                  {!reg.isFree && (
                    <div className="space-y-2 mb-3.5">
                      {/* Extracted UPI Ref */}
                      {reg.upiTransactionId && (
                        <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">UPI Ref:</span>
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300 select-all">{reg.upiTransactionId}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(reg.upiTransactionId, reg.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            title="Copy UPI Transaction ID"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          </div>
                      )}

                      {/* View Receipt Button */}
                      {reg.paymentImageURL && (
                        <button
                          type="button"
                          onClick={() => setPreviewReceipt(reg)}
                          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-500/20 text-xs font-bold transition-all shadow-xs group"
                        >
                          <Eye className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                          <span>View Uploaded Receipt</span>
                          <ExternalLink className="w-3 h-3 opacity-60 ml-auto" />
                        </button>
                      )}
                    </div>
                  )}

                    {/* Verify / Reject Actions */}
                    {!reg.isFree && reg.paymentStatus === 'pending' && (
                    <div className="flex items-center gap-2.5 pt-3.5 border-t border-slate-100 dark:border-white/5 mt-auto">
                      <button
                          onClick={() => onUpdateStatus(reg.id, 'verified')}
                          disabled={updatingReg === reg.id}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 disabled:opacity-60"
                      >
                          {updatingReg === reg.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          Verify Payment
                      </button>
                      <button
                          onClick={() => onUpdateStatus(reg.id, 'rejected')}
                          disabled={updatingReg === reg.id}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 text-xs font-bold transition-all border border-slate-200 dark:border-white/10 disabled:opacity-60"
                      >
                          {updatingReg === reg.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                          Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      </div>

      {/* Payment Receipt Preview Modal */}
      {previewReceipt && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setPreviewReceipt(null)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Top */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/10 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-slate-900 dark:text-white text-base leading-tight truncate">
                    Payment Receipt Verification
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {previewReceipt.studentName} ({previewReceipt.studentRollNo || previewReceipt.studentEmail})
                  </p>
                </div>
              </div>
                <button
                  type="button"
                  onClick={() => setPreviewReceipt(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

            {/* Modal Image/Document Preview */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-900/5 dark:bg-black/40 flex items-center justify-center min-h-[300px]">
              {previewReceipt.paymentImageURL?.endsWith('.pdf') ? (
                <div className="text-center p-8">
                  <FileText className="w-16 h-16 text-indigo-500 mx-auto mb-3" />
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-4">PDF Payment Receipt</p>
                  <a
                    href={previewReceipt.paymentImageURL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md"
                  >
                    <Download className="w-4 h-4" /> Open / Download PDF
                  </a>
                </div>
              ) : (
                <img
                  src={previewReceipt.paymentImageURL}
                  alt="Payment Receipt"
                  className="max-h-[55vh] max-w-full rounded-2xl object-contain shadow-lg border border-slate-200 dark:border-white/10"
                />
              )}
            </div>

            {/* Modal Info Strip & Actions */}
            <div className="p-6 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-[#0c0c0e] shrink-0 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Amount</p>
                  <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">₹{previewReceipt.amount}</p>
                </div>

                <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-3 sm:col-span-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Extracted UPI Reference</p>
                    <p className="text-xs sm:text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 truncate select-all">
                      {previewReceipt.upiTransactionId || 'Not automatically detected'}
                    </p>
                  </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <a
                  href={previewReceipt.paymentImageURL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Full Image
                </a>

                {previewReceipt.paymentStatus === 'pending' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                      onClick={() => {
                        onUpdateStatus(previewReceipt.id, 'rejected');
                        setPreviewReceipt(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-red-500 hover:text-white text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
                  >
                      Reject
                  </button>
                  <button
                    type="button"
                      onClick={() => {
                        onUpdateStatus(previewReceipt.id, 'verified');
                        setPreviewReceipt(null);
                      }}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
                  >
                      Verify Payment
                  </button>
                </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
