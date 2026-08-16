import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar, Search, Loader2, CheckCircle, XCircle, Clock,
  Ban, Eye, ChevronDown, Filter, AlertCircle,
  Tag, MapPin, Users, Building2, AlertTriangle, IndianRupee, Download,
  ClipboardList, X, GraduationCap, CreditCard
} from 'lucide-react';
import SmartHeader from '../../components/SmartHeader';
import api from '../../services/api';

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-500/10', icon: Clock },
  pending: { label: 'Under Review', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-500/10', icon: Clock },
  published: { label: 'Published', color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-500/10', icon: CheckCircle },
  completed: { label: 'Completed', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-500/10', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-500/10', icon: Ban },
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

  // ── Registrations Drawer state ──
  const [registrationsEvent, setRegistrationsEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [regStats, setRegStats] = useState(null);
  const [regGlobalStats, setRegGlobalStats] = useState(null);
  const [regLoading, setRegLoading] = useState(false);
  const [regSearch, setRegSearch] = useState('');
  const [regFilter, setRegFilter] = useState('all');
  const [updatingReg, setUpdatingReg] = useState(null);

  const openRegistrationsDrawer = async (event) => {
    setRegistrationsEvent(event);
    setRegSearch('');
    setRegFilter('all');
    setRegistrations([]);
    setRegStats(null);
    setRegLoading(true);
    try {
      const res = await api.get('/admin/registrations', { params: { eventId: event.id } });
      setRegistrations(res.data.registrations || []);
      setRegStats(res.data.stats || null);
    } catch (err) {
      console.error('Failed to fetch registrations:', err);
      showToast('Failed to load registrations.', 'error');
    } finally {
      setRegLoading(false);
    }
  };

  const fetchGlobalStats = useCallback(async () => {
    try {
      const res = await api.get('/admin/registrations');
      const all = res.data.registrations || [];
      const stats = res.data.stats || { total: 0, pending: 0, verified: 0, revenue: 0 };
      setRegGlobalStats(stats);
    } catch (_) {
      setRegGlobalStats({ total: 0, pending: 0, verified: 0, revenue: 0 });
    }
  }, []);

  const handleRegStatusUpdate = async (regId, newStatus) => {
    setUpdatingReg(regId);
    try {
      await api.patch(`/admin/registrations/${regId}/status`, { status: newStatus });
      setRegistrations(prev =>
        prev.map(r => r.id === regId ? { ...r, paymentStatus: newStatus } : r)
      );
      if (registrationsEvent) {
        const res = await api.get('/admin/registrations', { params: { eventId: registrationsEvent.id } });
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

  useEffect(() => { fetchEvents(); fetchGlobalStats(); }, [fetchEvents, fetchGlobalStats]);

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
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold transition-all duration-300 ${toast.type === 'error'
            ? 'bg-red-600 text-white'
            : 'bg-emerald-600 text-white'
          }`}>
          {toast.type === 'error' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
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
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${isSelected
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
                onViewRegistrations={() => openRegistrationsDrawer(event)}
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

      {/* Registrations Drawer */}
      {registrationsEvent && (
        <AdminRegistrationsDrawer
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

function EventCard({ event, loadingAction, onRequestStatusChange, onView, onViewRegistrations, formatDisplayDate, getDownloadUrl }) {
  const isPending = event.status === 'pending';

  return (
    <div className={`group relative flex flex-col bg-white dark:bg-[#0a0a0a] border rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-400 h-full ${isPending ? 'border-amber-300 dark:border-amber-500/40' : 'border-slate-200 dark:border-white/10 hover:border-indigo-200 dark:hover:border-white/10'
      }`}>
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
        {/* Status Badge */}
        <div className="absolute top-4 right-4 z-10">
          <StatusBadge status={event.status} />
        </div>
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
                <Building2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </div>
              <span className="truncate font-bold">{event.clubName || 'Unknown Club'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </div>
              <span className="truncate">{event.venue || 'TBA'}</span>
            </div>
            {event.capacity && (
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </div>
                <span className="truncate">{(event.attendees || []).length} / {event.capacity} seats</span>
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
        <div className="flex items-center gap-2 pt-5 border-t border-slate-100 dark:border-white/10 flex-wrap">
          <button
            onClick={onViewRegistrations}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-[1rem] bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all whitespace-nowrap"
          >
            <ClipboardList className="w-3.5 h-3.5" /> Registrations
          </button>
          <button
            onClick={onView}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-[1rem] bg-slate-100 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-bold transition-all whitespace-nowrap"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {isPending && (
            <>
              <button
                id={`approve-${event.id}`}
                onClick={() => onRequestStatusChange(event, 'published')}
                disabled={!!loadingAction}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-[1rem] bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all disabled:opacity-60 whitespace-nowrap"
              >
                {loadingAction === event.id + 'published' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                Approve
              </button>
              <button
                id={`reject-${event.id}`}
                onClick={() => onRequestStatusChange(event, 'cancelled')}
                disabled={!!loadingAction}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-[1rem] bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-all disabled:opacity-60 whitespace-nowrap"
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
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-[1rem] bg-red-100 dark:bg-red-500/10 text-red-600 text-xs font-bold hover:bg-red-200 dark:hover:bg-red-500/20 transition-all border border-red-200 dark:border-red-500/20 disabled:opacity-60 whitespace-nowrap"
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

// ─── Admin Registrations Slide-Over Drawer ─────────────────────────────────────
function AdminRegistrationsDrawer({
  event, registrations, stats, loading,
  search, setSearch, filter, setFilter,
  updatingReg, onUpdateStatus, onClose
}) {
  const FILTERS = ['all', 'pending', 'verified', 'rejected'];

  const filtered = registrations.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (r.studentName || '').toLowerCase().includes(q) ||
      (r.studentRollNo || '').toLowerCase().includes(q) ||
      (r.studentEmail || '').toLowerCase().includes(q);
    const matchFilter = filter === 'all' || r.paymentStatus === filter;
    return matchSearch && matchFilter;
  });

  return (
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
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border ${
                event.price > 0
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
              placeholder="Search member by name, roll no..."
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
                className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${
                  filter === f
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

              return (
                <div
                  key={reg.id}
                  className="group relative flex flex-col bg-white dark:bg-[#0c0c0e] border border-slate-200/90 dark:border-white/10 rounded-3xl p-5 sm:p-6 hover:border-indigo-400 dark:hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
                >
                  {/* Card Top: Badges & Date */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase border ${
                        reg.paymentStatus === 'verified'
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
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                        {reg.isFree ? 'Free Pass' : `₹${reg.amount}`}
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

                  {/* UPI Ref Box if applicable */}
                  {!reg.isFree && reg.upiTransactionId && (
                    <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl mb-3.5 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">UPI Ref:</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{reg.upiTransactionId}</span>
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
  );
}

