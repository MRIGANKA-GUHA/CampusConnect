import React, { useState, useEffect, useMemo } from 'react';
import SmartHeader from '../../components/SmartHeader';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Search, Bell, Megaphone, AlertCircle, Calendar, Users, Info, X, Loader2,
  UserCircle, Tag, Clock, Paperclip, Building2, Hash, FileText, Download,
  Bookmark, BookmarkCheck, Share2, Filter, Check, ChevronRight,
  Layers, ChevronDown
} from 'lucide-react';

const CATEGORIES = ['All', 'Academic', 'Administrative', 'Infrastructure', 'Cultural', 'Technical', 'Sports', 'Social', 'Other'];

const PRIORITIES = [
  { value: 'all',    label: 'All Priorities' },
  { value: 'urgent', label: 'Urgent',    color: 'text-red-600 dark:text-red-400',     bg: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20' },
  { value: 'high',   label: 'High',      color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' },
  { value: 'normal', label: 'Normal',    color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20' },
  { value: 'low',    label: 'Low',       color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10' },
];

export default function StudentNotices() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'saved'
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'priority'
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // All logged-in users can bookmark notices
  const canBookmark = !!user;

  // Backend API-backed bookmarks: array of bookmarked notice IDs
  const [savedNoticeIds, setSavedNoticeIds] = useState([]);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState('');

  // ── Load notices ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchNotices();
  }, []);

  // ── Load bookmarks from backend when user is available ────────────────────
  useEffect(() => {
    if (!canBookmark || !user?.uid) return;
    const loadBookmarks = async () => {
      try {
        const res = await api.get('/student/bookmarks');
        setSavedNoticeIds(res.data?.bookmarks || []);
      } catch (err) {
        console.warn('Failed to load bookmarks:', err);
      }
    };
    loadBookmarks();
  }, [user?.uid, canBookmark]);

  // ── Close sort dropdown on outside click ───────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showSortDropdown && !e.target.closest('.sort-dropdown-container')) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSortDropdown]);

  // ── Escape key closes drawer ────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setSelectedNotice(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/notices');
      if (res.data?.notices) {
        setNotices(res.data.notices);
      }
    } catch (err) {
      console.warn('Backend notices call failed or unreachable:', err);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  const toggleBookmark = async (noticeId, e) => {
    e?.stopPropagation();
    if (!canBookmark || !user?.uid) return;

    const isCurrentlySaved = savedNoticeIds.includes(noticeId);

    // Optimistic UI update
    setSavedNoticeIds(prev =>
      isCurrentlySaved ? prev.filter(id => id !== noticeId) : [...prev, noticeId]
    );

    try {
      if (isCurrentlySaved) {
        await api.delete(`/student/bookmarks/${noticeId}`);
        showToast('Removed from saved notices');
      } else {
        await api.post(`/student/bookmarks/${noticeId}`);
        showToast('Saved to your bookmarks!');
      }
    } catch (err) {
      // Revert optimistic update on failure
      console.error('Bookmark sync failed:', err);
      setSavedNoticeIds(prev =>
        isCurrentlySaved ? [...prev, noticeId] : prev.filter(id => id !== noticeId)
      );
      showToast('Could not save bookmark. Try again.');
    }
  };

  const handleShare = (notice, e) => {
    e?.stopPropagation();
    const shareData = {
      title: notice.title,
      text: `${notice.title} - ${notice.content.slice(0, 100)}...`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${notice.title}\n\n${notice.content}`);
      showToast('Notice copied to clipboard!');
    }
  };

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case 'low':
        return {
          color: 'text-slate-500 dark:text-slate-400',
          bg: 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10',
          icon: Info,
          label: 'Low'
        };
      case 'urgent':
        return {
          color: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20',
          icon: AlertCircle,
          label: 'Urgent'
        };
      case 'high':
        return {
          color: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
          icon: Bell,
          label: 'High Priority'
        };
      default:
        return {
          color: 'text-indigo-600 dark:text-indigo-400',
          bg: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20',
          icon: Info,
          label: 'Normal'
        };
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      }).format(new Date(isoString));
    } catch {
      return '—';
    }
  };

  const formatRelativeTime = (isoString) => {
    if (!isoString) return '';
    try {
      const now = new Date();
      const past = new Date(isoString);
      const diffInHours = Math.floor((now - past) / (1000 * 60 * 60));
      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours}h ago`;
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) return 'Yesterday';
      if (diffInDays < 7) return `${diffInDays}d ago`;
      return formatDate(isoString);
    } catch {
      return '';
    }
  };

  const getFileName = (url) => {
    if (!url) return 'Document.pdf';
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    const fileName = lastPart.split('?')[0];
    try {
      return decodeURIComponent(fileName);
    } catch {
      return fileName;
    }
  };

  const getDownloadUrl = (url, originalName) => {
    if (!url) return '';
    if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
      const nameWithoutExt = originalName
        ? originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_')
        : 'notice_document';
      return url.replace('/upload/', `/upload/fl_attachment:${nameWithoutExt}/`);
    }
    return url;
  };

  // Filter notices based on search, category, priority, and audience (students or clubs based on role)
  const filteredNotices = useMemo(() => {
    const requiredAudience = user?.role === 'club' ? 'clubs' : 'students';
    return notices
      .filter(n => {
        const audience = n.targetAudience?.toLowerCase() || 'students';
        return audience === requiredAudience;
      })
      .filter(n => {
        if (activeTab === 'saved') {
          return savedNoticeIds.includes(n.id);
        }
        return true;
      })
      .filter(n => {
        if (selectedCategory !== 'All' && n.category !== selectedCategory) return false;
        if (selectedPriority !== 'all' && n.priority !== selectedPriority) return false;
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
          n.title?.toLowerCase().includes(q) ||
          n.content?.toLowerCase().includes(q) ||
          n.category?.toLowerCase().includes(q) ||
          n.authorName?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          const priorityWeights = { urgent: 4, high: 3, normal: 2, low: 1 };
          const weightA = priorityWeights[a.priority] || 2;
          const weightB = priorityWeights[b.priority] || 2;
          if (weightA !== weightB) return weightB - weightA;
        }
        // Default: newest first
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
  }, [notices, searchTerm, selectedCategory, selectedPriority, activeTab, savedNoticeIds, sortBy, user?.role]);

  // Statistics
  const stats = useMemo(() => {
    const requiredAudience = user?.role === 'club' ? 'clubs' : 'students';
    const studentAudienceNotices = notices.filter(n => {
      const audience = n.targetAudience?.toLowerCase() || 'students';
      return audience === requiredAudience;
    });
    const urgentCount = studentAudienceNotices.filter(n => n.priority === 'urgent').length;
    const academicCount = studentAudienceNotices.filter(n => n.category === 'Academic').length;
    return {
      total: studentAudienceNotices.length,
      urgent: urgentCount,
      academic: academicCount,
      saved: savedNoticeIds.length,
    };
  }, [notices, savedNoticeIds, user?.role]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30 pb-20">
      <SmartHeader />


      <main className="max-w-7xl mx-auto pt-24 sm:pt-32 px-4 sm:px-8">
        
        {/* ── Action Bar (Matching AdminNotices & Platform Style) ── */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-10 w-full">
          {/* Search Bar */}
          <div className="flex-1 w-full max-w-xl relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search announcements, titles, or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-14 pr-12 py-4 rounded-[2rem] bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 shadow-sm hover:shadow-md transition-all font-medium text-sm sm:text-base"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Controls: Tab Switcher (All vs Bookmarked) & Sort Dropdown */}
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-between lg:justify-end shrink-0">
            <div className="flex items-center bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-[2rem] p-1.5 shadow-sm">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-[1.5rem] text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'all'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" />
                All Notices ({stats.total})
              </button>
              {canBookmark && (
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-[1.5rem] text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'saved'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  Bookmarked ({savedNoticeIds.length})
                </button>
              )}
            </div>

            <div className="relative sort-dropdown-container">
              <button
                type="button"
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="px-5 py-3.5 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-[2rem] flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 shadow-sm hover:shadow-md transition-all"
              >
                <span>{sortBy === 'newest' ? 'Sort: Newest First' : 'Sort: Highest Priority'}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showSortDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showSortDropdown && (
                <div className="absolute right-0 z-[110] mt-2 w-52 p-2 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl animate-in zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={() => { setSortBy('newest'); setShowSortDropdown(false); }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-colors ${
                      sortBy === 'newest'
                        ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    Sort: Newest First
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSortBy('priority'); setShowSortDropdown(false); }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-colors ${
                      sortBy === 'priority'
                        ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    Sort: Highest Priority
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Category Pill Filters ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 custom-scrollbar mb-8 no-scrollbar">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400 shrink-0 mr-2 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md scale-105'
                  : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* ── Priority Filter Pills ── */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400 mr-2">Priority:</span>
          {PRIORITIES.map(p => (
            <button
              key={p.value}
              onClick={() => setSelectedPriority(p.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                selectedPriority === p.value
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              {p.label}
            </button>
          ))}
          {(selectedCategory !== 'All' || selectedPriority !== 'all' || searchTerm) && (
            <button
              onClick={() => { setSelectedCategory('All'); setSelectedPriority('all'); setSearchTerm(''); }}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* ── Notices Feed Content ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col bg-white dark:bg-[#080808] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-7 animate-pulse">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-20 bg-slate-200 dark:bg-white/5 rounded-full"></div>
                    <div className="h-6 w-16 bg-slate-200 dark:bg-white/5 rounded-full"></div>
                  </div>
                  <div className="h-8 w-8 bg-slate-200 dark:bg-white/5 rounded-xl"></div>
                </div>
                <div className="h-6 w-3/4 bg-slate-200 dark:bg-white/10 rounded-lg mb-4"></div>
                <div className="space-y-2 mb-6 flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-white/5 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 dark:bg-white/5 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 dark:bg-white/5 rounded w-2/3"></div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                  <div className="h-4 w-24 bg-slate-200 dark:bg-white/5 rounded"></div>
                  <div className="h-8 w-24 bg-slate-200 dark:bg-white/5 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-3xl shadow-sm">
            <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
              {activeTab === 'saved' ? (
                <Bookmark className="w-8 h-8 text-slate-400" />
              ) : (
                <Megaphone className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {activeTab === 'saved' ? 'No bookmarked notices' : 'No notices match your criteria'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8 text-sm">
              {activeTab === 'saved'
                ? 'Click the bookmark icon on any notice card to save it for quick access here.'
                : 'Try adjusting your search terms or filters to find what you are looking for.'}
            </p>
            {(selectedCategory !== 'All' || selectedPriority !== 'all' || searchTerm) && (
              <button
                onClick={() => { setSelectedCategory('All'); setSelectedPriority('all'); setSearchTerm(''); setActiveTab('all'); }}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/20"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredNotices.map((notice, idx) => {
              const pc = getPriorityConfig(notice.priority);
              const PriorityIcon = pc.icon;
              const isSaved = savedNoticeIds.includes(notice.id);
              const hasAttachment = notice.attachments?.length > 0 || notice.attachmentUrl;

              return (
                <div
                  key={notice.id}
                  onClick={() => setSelectedNotice(notice)}
                  className={`group relative flex flex-col bg-white dark:bg-[#080808] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-7 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer animate-fade-up-slow ${
                    notice.priority === 'urgent' ? 'ring-2 ring-red-500/30' : ''
                  }`}
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  {/* Card Top Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase border ${pc.bg} ${pc.color}`}>
                        <PriorityIcon className="w-3.5 h-3.5" />
                        {pc.label}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                        {notice.category || 'General'}
                      </span>
                    </div>

                    {/* Bookmark Toggle Button */}
                    {canBookmark && (
                      <button
                        onClick={(e) => toggleBookmark(notice.id, e)}
                        title={isSaved ? 'Remove bookmark' : 'Bookmark notice'}
                        className={`p-2 rounded-xl transition-all ${
                          isSaved
                            ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-500'
                            : 'bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                        }`}
                      >
                        {isSaved ? <BookmarkCheck className="w-4 h-4 fill-amber-500" /> : <Bookmark className="w-4 h-4" />}
                      </button>
                    )}
                  </div>

                  {/* Notice Title */}
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {notice.title}
                  </h3>

                  {/* Notice Preview Body */}
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm line-clamp-3 mb-6 flex-1">
                    {notice.content}
                  </p>

                  {/* Attachment Badge if present */}
                  {hasAttachment && (
                    <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                      <Paperclip className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Includes Attachment (PDF)</span>
                    </div>
                  )}

                  {/* Footer Meta */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 opacity-70" />
                      <span>{formatDate(notice.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleShare(notice, e)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                        title="Share notice"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                        Read <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* ───── DETAIL SLIDE-OVER DRAWER (IDENTICAL TO ADMIN) ───── */}
      <div
        onClick={() => setSelectedNotice(null)}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          selectedNotice ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-xl z-50 bg-white dark:bg-[#090909] border-l border-slate-200 dark:border-white/10 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col ${
          selectedNotice ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedNotice && (() => {
          const pc = getPriorityConfig(selectedNotice.priority);
          const PriorityIcon = pc.icon;
          const isSaved = savedNoticeIds.includes(selectedNotice.id);
          const attachmentsList = selectedNotice.attachments || (selectedNotice.attachmentUrl ? [selectedNotice.attachmentUrl] : []);

          return (
            <>
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between px-6 sm:px-8 pt-8 pb-6 border-b border-slate-100 dark:border-white/5 shrink-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase ${pc.bg} ${pc.color}`}>
                    <PriorityIcon className="w-3.5 h-3.5" />
                    {pc.label}
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                    {selectedNotice.category || 'General'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {canBookmark && (
                    <button
                      onClick={(e) => toggleBookmark(selectedNotice.id, e)}
                      title={isSaved ? 'Remove bookmark' : 'Bookmark notice'}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        isSaved
                          ? 'bg-amber-500 text-white shadow-md'
                          : 'bg-slate-100 dark:bg-white/5 hover:bg-amber-50 dark:hover:bg-amber-500/10 text-slate-500 hover:text-amber-500'
                      }`}
                    >
                      {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  )}

                  <button
                    onClick={(e) => handleShare(selectedNotice, e)}
                    title="Share notice"
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setSelectedNotice(null)}
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Drawer Main Body */}
              <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-8 space-y-8 custom-scrollbar">
                
                {/* Notice Title */}
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-snug">
                  {selectedNotice.title}
                </h2>

                {/* Notice Content */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-3">Notice Content</p>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl p-5 whitespace-pre-line">
                    {selectedNotice.content}
                  </p>
                </div>

                {/* Metadata Grid (Identical 2x2 layout to Admin) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl p-4">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <UserCircle className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Author</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{selectedNotice.authorName || '—'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl p-4">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Tag className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Category</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{selectedNotice.category || '—'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl p-4">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Building2 className="w-4 h-4 text-teal-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Club</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{selectedNotice.clubId || 'N/A (General)'}</p>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl">
                    <div className="flex items-center gap-2.5 text-slate-500">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">Date Posted</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{formatDate(selectedNotice.createdAt)}</span>
                  </div>
                </div>

                {/* Attachments Section */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-3 flex items-center gap-2">
                    <Paperclip className="w-3.5 h-3.5" /> Attachments
                  </p>

                  {attachmentsList.length > 0 ? (
                    <div className="space-y-3">
                      {attachmentsList.map((attUrl, i) => {
                        const displayName = selectedNotice.attachmentName || getFileName(attUrl) || `Attachment-${i + 1}.pdf`;
                        return (
                          <div
                            key={i}
                            className="flex items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5 text-indigo-500" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                                  {displayName}
                                </p>
                                <p className="text-[11px] text-slate-400 font-medium">PDF Document</p>
                              </div>
                            </div>

                            <a
                              href={getDownloadUrl(attUrl, displayName)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-500/10 transition-all shrink-0"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic px-1">No attachments.</p>
                  )}
                </div>
              </div>
            </>
          );
        })()}
      </div>

      <div className="fixed top-0 inset-x-0 h-64 pointer-events-none -z-10 bg-gradient-to-b from-indigo-500/5 to-transparent" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg font-bold text-sm flex items-center gap-3">
            <Check className="w-5 h-5" />
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
}

