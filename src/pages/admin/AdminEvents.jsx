import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar, Search, Loader2, CheckCircle, XCircle, Clock,
  Ban, Eye, ChevronDown, Filter, AlertCircle,
  Tag, MapPin, Users, Building2, AlertTriangle, IndianRupee, Download
} from 'lucide-react';
import SmartHeader from '../../components/SmartHeader';
import api from '../../services/api';

const STATUS_CONFIG = {
  draft:     { label: 'Draft',          color: 'text-slate-500',   bg: 'bg-slate-100 dark:bg-slate-500/10',   icon: Clock },
  pending:   { label: 'Under Review',   color: 'text-amber-600',   bg: 'bg-amber-100 dark:bg-amber-500/10',   icon: Clock },
  published: { label: 'Published',      color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-500/10', icon: CheckCircle },
  completed: { label: 'Completed',      color: 'text-blue-600',    bg: 'bg-blue-100 dark:bg-blue-500/10',     icon: CheckCircle },
  cancelled: { label: 'Cancelled',      color: 'text-red-600',     bg: 'bg-red-100 dark:bg-red-500/10',       icon: Ban },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${cfg.color} ${cfg.bg}`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
};

const ALL_STATUSES = ['all', 'pending', 'draft', 'published', 'completed', 'cancelled'];

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loadingAction, setLoadingAction] = useState(null);
  const [toast, setToast] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null); // { event, newStatus, actionLabel }
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/events');
      setEvents(res.data.events || []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      showToast('Failed to load events.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showStatusDropdown && !event.target.closest('.status-dropdown-container')) {
        setShowStatusDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showStatusDropdown]);

  const handleStatusChange = async (eventId, newStatus) => {
    setLoadingAction(eventId + newStatus);
    try {
      await api.patch(`/admin/events/${eventId}/status`, { status: newStatus });
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: newStatus } : e));
      if (selectedEvent?.id === eventId) setSelectedEvent(prev => ({ ...prev, status: newStatus }));
      showToast(`Event ${newStatus === 'published' ? 'approved' : newStatus} successfully.`);
    } catch (err) {
      console.error('Failed to update event status:', err);
      showToast(err.response?.data?.error || 'Failed to update status.', 'error');
    } finally {
      setLoadingAction(null);
      setConfirmModal(null);
    }
  };

  const requestStatusChange = (event, newStatus) => {
    if (newStatus === 'cancelled') {
      const actionLabel = event.status === 'pending' ? 'Reject Submission' : 'Cancel Event';
      setConfirmModal({ event, newStatus, actionLabel });
    } else {
      handleStatusChange(event.id, newStatus);
    }
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return 'Select Event Date';
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDownloadUrl = (url) => {
    if (url && url.includes('cloudinary.com') && url.includes('/upload/')) {
      return url.replace('/upload/', '/upload/fl_attachment/');
    }
    return url;
  };

  const filtered = events.filter(e => {
    const matchSearch =
      e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.clubName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.venue?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || e.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const pendingCount = events.filter(e => e.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30">
      <SmartHeader />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold transition-all duration-300 ${
          toast.type === 'error'
            ? 'bg-red-600 text-white'
            : 'bg-emerald-600 text-white'
        }`}>
          {toast.type === 'error' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      <main className="max-w-7xl mx-auto pt-24 sm:pt-32 px-4 sm:px-8 pb-12">

        {/* Top Action Bar (Search & Filter) */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-10 mt-2 w-full">
          {/* Search bar */}
          <div className="flex-1 w-full max-w-xl relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by title, club, or venue..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="block w-full pl-14 pr-6 py-4 rounded-[2rem] bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 shadow-sm hover:shadow-md transition-all font-medium text-sm sm:text-base"
            />
          </div>

          {/* Filter & Stats */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto shrink-0">
            {/* Pending count if any */}
            {pendingCount > 0 && (
              <span className="flex items-center gap-2 px-6 py-4 rounded-[2rem] bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 text-sm font-bold uppercase tracking-wide shadow-sm shrink-0 w-full sm:w-auto justify-center">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                {pendingCount} pending
              </span>
            )}

            {/* Custom Filter Dropdown */}
            <div className="relative status-dropdown-container w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowStatusDropdown(prev => !prev)}
                className="w-full sm:w-auto pl-12 pr-14 py-4 rounded-[2rem] bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 text-sm sm:text-base font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer relative shadow-sm"
              >
                <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <span>
                  {filterStatus === 'all' ? 'All Statuses' : STATUS_CONFIG[filterStatus]?.label}
                </span>
                <ChevronDown className={`absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-transform duration-200 ${showStatusDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showStatusDropdown && (
                <div className="absolute right-0 z-50 mt-2 w-full sm:w-48 p-2 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl animate-in zoom-in-95 duration-150">
                  {ALL_STATUSES.map(s => {
                    const isSelected = filterStatus === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setFilterStatus(s);
                          setShowStatusDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                          isSelected 
                            ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white' 
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {s === 'all' ? 'All Statuses' : STATUS_CONFIG[s]?.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
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
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-semibold text-lg">No events found</p>
            <p className="text-sm mt-1">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max">
            {filtered.map(event => (
              <EventCard
                key={event.id}
                event={event}
                loadingAction={loadingAction}
                onRequestStatusChange={requestStatusChange}
                onView={() => setSelectedEvent(event)}
                formatDisplayDate={formatDisplayDate}
                getDownloadUrl={getDownloadUrl}
              />
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          loadingAction={loadingAction}
          onRequestStatusChange={requestStatusChange}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {/* Warning Confirmation Modal */}
      {confirmModal && (
        <ConfirmCancelModal
          modalData={confirmModal}
          loadingAction={loadingAction}
          onConfirm={() => handleStatusChange(confirmModal.event.id, confirmModal.newStatus)}
          onClose={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
}

function EventCard({ event, loadingAction, onRequestStatusChange, onView, formatDisplayDate, getDownloadUrl }) {
  const isPending = event.status === 'pending';

  return (
    <div className={`group relative flex flex-col bg-white dark:bg-[#080808] border rounded-3xl overflow-hidden hover:border-indigo-200 dark:hover:border-white/10 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300 ${
      isPending ? 'border-amber-200 dark:border-amber-500/30' : 'border-slate-200 dark:border-white/5'
    }`}>
      {/* Banner */}
      <div
        className="h-36 bg-gradient-to-r from-slate-950 via-zinc-900 to-black relative overflow-hidden shrink-0 border-b border-slate-200/50 dark:border-white/10"
        style={event.bannerURL ? { backgroundImage: `url(${event.bannerURL})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        <div className="absolute top-4 right-4 z-10">
          <StatusBadge status={event.status} />
        </div>
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
              <Building2 className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="truncate font-bold text-slate-800 dark:text-slate-200">{event.clubName || 'Unknown Club'}</span>
            </div>
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
        <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-white/5 flex-wrap">
          <button
            onClick={onView}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-bold transition-all whitespace-nowrap"
          >
            <Eye className="w-3.5 h-3.5" /> Details
          </button>

          {isPending && (
            <>
              <button
                id={`approve-${event.id}`}
                onClick={() => onRequestStatusChange(event, 'published')}
                disabled={!!loadingAction}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all disabled:opacity-60 whitespace-nowrap"
              >
                {loadingAction === event.id + 'published' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                Approve
              </button>
              <button
                id={`reject-${event.id}`}
                onClick={() => onRequestStatusChange(event, 'cancelled')}
                disabled={!!loadingAction}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-all disabled:opacity-60 whitespace-nowrap"
              >
                {loadingAction === event.id + 'cancelled' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                Reject
              </button>
            </>
          )}

          {event.status === 'published' && (
            <button
              onClick={() => onRequestStatusChange(event, 'cancelled')}
              disabled={!!loadingAction}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-red-100 dark:bg-red-500/10 text-red-600 text-xs font-bold hover:bg-red-200 dark:hover:bg-red-500/20 transition-all border border-red-200 dark:border-red-500/20 disabled:opacity-60 whitespace-nowrap"
            >
              {loadingAction === event.id + 'cancelled' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EventDetailModal({ event, loadingAction, onRequestStatusChange, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Banner */}
        {event.bannerURL ? (
          <img src={event.bannerURL} alt={event.title} className="w-full h-44 object-cover rounded-t-3xl" />
        ) : (
          <div className="w-full h-28 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-t-3xl flex items-center justify-center">
            <Calendar className="w-10 h-10 text-white/60" />
          </div>
        )}

        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <StatusBadge status={event.status} />
              <h2 className="text-xl font-black mt-2">{event.title}</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all shrink-0">
              <XCircle className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="space-y-3 text-sm mb-6">
            <Row icon={Building2} label="Club" value={event.clubName || '—'} />
            <Row icon={Calendar} label="Date" value={event.date ? `${event.date}${event.time ? ' at ' + event.time : ''}` : '—'} />
            <Row icon={MapPin} label="Venue" value={event.venue || '—'} />
            <Row icon={Tag} label="Category" value={event.category || '—'} />
            <Row icon={Users} label="Capacity" value={event.capacity ? `${event.capacity} seats` : 'Unlimited'} />
            {event.price > 0 && <Row icon={Tag} label="Price" value={`₹${event.price}`} />}
            {event.registrationDeadline && <Row icon={Clock} label="Reg. Deadline" value={event.registrationDeadline} />}
          </div>

          {event.description && (
            <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Admin Actions */}
          <div className="flex flex-wrap gap-3">
            {event.status === 'pending' && (
              <>
                <button
                  onClick={() => onRequestStatusChange(event, 'published')}
                  disabled={!!loadingAction}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all disabled:opacity-60"
                >
                  {loadingAction === event.id + 'published' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Approve & Publish
                </button>
                <button
                  onClick={() => onRequestStatusChange(event, 'cancelled')}
                  disabled={!!loadingAction}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-all disabled:opacity-60"
                >
                  {loadingAction === event.id + 'cancelled' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Reject
                </button>
              </>
            )}
            {event.status === 'published' && (
              <button
                onClick={() => onRequestStatusChange(event, 'cancelled')}
                disabled={!!loadingAction}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-all disabled:opacity-60"
              >
                {loadingAction === event.id + 'cancelled' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                Cancel Event
              </button>
            )}
            {event.status === 'draft' && (
              <p className="text-sm text-slate-400 text-center w-full italic">This event is a draft saved by the club. The club must submit it for review before you can approve it.</p>
            )}
            {(event.status === 'completed' || event.status === 'cancelled') && (
              <p className="text-sm text-slate-400 text-center w-full">This event is {event.status} and cannot be changed.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmCancelModal({ modalData, loadingAction, onConfirm, onClose }) {
  const { event, actionLabel } = modalData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-500/10 text-red-600 flex items-center justify-center mb-5 mx-auto border border-red-200 dark:border-red-500/20">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-black text-center text-slate-900 dark:text-white mb-2">
          {actionLabel}?
        </h3>

        <p className="text-sm text-center text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
          Are you sure you want to change the status of <span className="font-bold text-slate-800 dark:text-slate-200">"{event.title}"</span> by <span className="font-semibold text-slate-700 dark:text-slate-300">{event.clubName || 'Unknown Club'}</span> to <span className="font-bold text-red-600">Cancelled</span>?
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            disabled={!!loadingAction}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            disabled={!!loadingAction}
            className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 disabled:opacity-60"
          >
            {loadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Yes, {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex items-center gap-2 text-slate-400 w-28 shrink-0">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
      </span>
      <span className="font-semibold text-slate-800 dark:text-slate-200">{value}</span>
    </div>
  );
}
