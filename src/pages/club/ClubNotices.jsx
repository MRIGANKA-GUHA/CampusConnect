import { useState, useEffect } from 'react';
import SmartHeader from '../../components/SmartHeader';
import api from '../../services/api';
import {
  Search, Plus, Bell, Megaphone, AlertCircle,
  Calendar, Users, Info, X, Loader2,
  Tag, Clock, FileText, Download, Trash2, Zap,
  CheckCircle2, ChevronDown, Sparkles, UploadCloud, FileCheck2
} from 'lucide-react';

const CATEGORIES = ['General', 'Event', 'Recruitment', 'Achievement', 'Workshop', 'Other'];
const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-white/5' },
  { value: 'normal', label: 'Normal', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
  { value: 'high', label: 'High Priority', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' },
];

const EMPTY_FORM = { title: '', content: '', category: 'General', priority: 'normal', attachments: '' };

export default function ClubNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [pendingFile, setPendingFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState('');

  useEffect(() => { fetchNotices(); }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setSelectedNotice(null);
        setShowCreateModal(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown && !event.target.closest('.relative')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/club/notices');
      setNotices(res.data.notices || []);
    } catch (err) {
      console.error('Failed to fetch notices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setPdfError('Only PDF files are accepted.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPdfError('File is too large. Maximum size is 5MB.');
      return;
    }

    setPdfError('');
    setPdfLoading(true);
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      const res = await api.post('/ai/parse-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = res.data;
      setPendingFile(file); // Save file for submission

      setForm(prev => ({
        ...prev,
        title: data.title || prev.title,
        content: data.content || prev.content,
        category: data.category || prev.category,
        priority: data.priority || prev.priority,
        attachments: file.name,
      }));
      setErrors({});
    } catch (err) {
      setPdfError(err.response?.data?.error || 'Failed to analyse PDF. Please try again.');
    } finally {
      setPdfLoading(false);
      e.target.value = '';
    }
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required.';
    if (!form.content.trim()) e.content = 'Content is required.';
    if (!form.category) e.category = 'Select a category.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('content', form.content);
      formData.append('category', form.category);
      formData.append('priority', form.priority);
      if (pendingFile) formData.append('pdf', pendingFile);

      await api.post('/club/notices', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSubmitSuccess(true);
      setTimeout(() => {
        setShowCreateModal(false);
        setSubmitSuccess(false);
        setForm(EMPTY_FORM);
        setPendingFile(null);
        setErrors({});
        setActiveDropdown(null);
        fetchNotices();
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to post notice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (notice, e) => {
    e?.stopPropagation();
    setDeleteTarget(notice);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/club/notices/${deleteTarget.id}`);
      setNotices(prev => prev.filter(n => n.id !== deleteTarget.id));
      if (selectedNotice?.id === deleteTarget.id) setSelectedNotice(null);
      setDeleteTarget(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete notice');
    } finally {
      setDeleting(false);
    }
  };

  const setField = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: undefined }));
  };

  const filteredNotices = notices.filter(n =>
    n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityConfig = (priorityKey) => {
    const found = PRIORITIES.find(p => p.value === priorityKey?.toLowerCase());
    if (found) return { color: found.color, bg: found.bg, label: found.label, icon: found.value === 'urgent' ? Zap : (found.value === 'high' ? AlertCircle : Bell) };
    return { color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', label: 'Normal', icon: Bell };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
              placeholder="Search announcements, titles, or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-14 pr-6 py-4 rounded-[2rem] bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 shadow-sm hover:shadow-md transition-all font-medium text-sm sm:text-base"
            />
          </div>
          <button
            onClick={() => { setForm(EMPTY_FORM); setPendingFile(null); setPdfError(''); setErrors({}); setSubmitSuccess(false); setShowCreateModal(true); }}
            className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all w-full lg:w-auto justify-center shrink-0 text-sm sm:text-base group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            Draft New Notice
          </button>
        </div>

        {/* Notices Feed Grid */}
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
          <div className="flex flex-col items-center justify-center py-32 px-4 text-center bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-3xl shadow-sm">
            <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Megaphone className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No active notices</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md">Create your first notice from the action bar to broadcast an announcement to your members.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max">
            {filteredNotices.map((notice) => {
              const pc = getPriorityConfig(notice.priority);
              const PriorityIcon = pc.icon;
              return (
                <div key={notice.id} className="group relative flex flex-col bg-white dark:bg-[#080808] border border-slate-200 dark:border-white/5 rounded-3xl p-6 sm:p-8 hover:border-indigo-200 dark:hover:border-white/10 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300">
                  {/* Card click area */}
                  <div className="cursor-pointer flex-1" onClick={() => setSelectedNotice(notice)}>
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase ${pc.bg} ${pc.color}`}>
                          <PriorityIcon className="w-3.5 h-3.5" />
                          {pc.label}
                        </span>
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                          {notice.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                        {notice.title}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm line-clamp-3">
                        {notice.content}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100 dark:border-white/5 text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 opacity-70" />
                        <span>{formatDate(notice.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  {/* Card action buttons */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                    <button
                      onClick={(e) => handleDelete(notice, e)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-600 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 text-xs font-bold transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ───── NOTICE DETAIL MODAL ───── */}
      {selectedNotice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedNotice(null)}></div>
          <div className="relative pointer-events-auto w-full max-w-2xl bg-white dark:bg-[#0a0a0a] border border-white/20 dark:border-white/10 rounded-[3rem] p-8 sm:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <button
              onClick={() => setSelectedNotice(null)}
              className="absolute top-6 right-6 p-3 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-wrap items-center gap-2 mb-6">
              {(() => {
                const pc = getPriorityConfig(selectedNotice.priority);
                const PriorityIcon = pc.icon;
                return (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase ${pc.bg} ${pc.color}`}>
                    <PriorityIcon className="w-3.5 h-3.5" />
                    {pc.label}
                  </span>
                );
              })()}
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                {selectedNotice.category}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
              {selectedNotice.title}
            </h2>

            <div className="flex items-center gap-4 text-xs text-slate-500 mb-6 pb-6 border-b border-slate-100 dark:border-white/10">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(selectedNotice.createdAt)}
              </span>
            </div>

            <div className="overflow-y-auto flex-1 pr-2 space-y-6 text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
              <p className="whitespace-pre-wrap">{selectedNotice.content}</p>

              {selectedNotice.attachments?.length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-white/10">
                  <a
                    href={selectedNotice.attachments[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    {selectedNotice.attachmentName || 'Download PDF Attachment'}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ───── CREATE NOTICE MODAL (Matching Admin UI + AI Autofill) ───── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => { setShowCreateModal(false); setForm(EMPTY_FORM); setPendingFile(null); setErrors({}); }}></div>
          <div className="relative pointer-events-auto w-full max-w-2xl bg-white dark:bg-[#0a0a0a] border border-white/20 dark:border-white/10 rounded-[3rem] p-8 sm:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="flex justify-between items-center mb-10 shrink-0">
              <h2 className="text-3xl font-black tracking-tight leading-tight">Draft Notice</h2>
              <button
                onClick={() => { setShowCreateModal(false); setForm(EMPTY_FORM); setPendingFile(null); setErrors({}); }}
                className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                type="button"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 px-8 text-center">
                <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-3xl font-black mb-3 tracking-tight">Notice Published!</h3>
                <p className="text-slate-500 font-medium text-sm">Your notice has been saved to the database.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-8 pr-2">
                <div className="space-y-8">

                  {/* ── AI Autofill from PDF ── */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-1 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      AI Autofill from PDF
                      <span className="ml-1 normal-case font-medium text-slate-400/70 tracking-normal">optional</span>
                    </label>
                    <label
                      htmlFor="pdf-upload"
                      className={`group relative flex flex-col items-center justify-center gap-3 w-full p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${pdfLoading
                          ? 'border-indigo-400 dark:border-indigo-500/60 bg-indigo-50/50 dark:bg-indigo-500/5 cursor-wait'
                          : 'border-slate-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5'
                        }`}
                    >
                      {pdfLoading ? (
                        <>
                          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-spin" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">Analysing PDF...</p>
                            <p className="text-xs text-slate-400 mt-0.5">AI is extracting notice data</p>
                          </div>
                        </>
                      ) : form.attachments ? (
                        <>
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                            <FileCheck2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">PDF Attached Successfully</p>
                            <p className="text-xs text-slate-400 mt-0.5">PDF attached · Summarized by AI</p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setField('attachments', ''); setPendingFile(null); }}
                            className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors">
                            <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              Upload PDF to autofill fields
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">PDF only · Max 5MB · AI-powered</p>
                          </div>
                        </>
                      )}
                      <input
                        id="pdf-upload"
                        type="file"
                        accept="application/pdf"
                        className="sr-only"
                        disabled={pdfLoading}
                        onChange={handlePdfUpload}
                      />
                    </label>
                    {pdfError && (
                      <p className="text-xs text-red-500 mt-2 ml-1 font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />{pdfError}
                      </p>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">Notice Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Annual Tech Symposium & Hackathon"
                      value={form.title}
                      onChange={(e) => setField('title', e.target.value)}
                      className="w-full p-4.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-white/15 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    />
                    {errors.title && <p className="text-xs text-red-500 mt-2 ml-1 font-bold">{errors.title}</p>}
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">Full Content *</label>
                    <textarea
                      rows={4}
                      placeholder="Write the complete body of the notice here..."
                      value={form.content}
                      onChange={(e) => setField('content', e.target.value)}
                      className="w-full p-4.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-white/15 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none"
                    />
                    {errors.content && <p className="text-xs text-red-500 mt-2 ml-1 font-bold">{errors.content}</p>}
                  </div>

                  {/* Category & Priority Grid */}
                  <div className="grid grid-cols-2 gap-5 relative">
                    <div className="col-span-2 sm:col-span-1 relative">
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">Category *</label>
                      <button
                        type="button"
                        onClick={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')}
                        className={`w-full p-4.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/15 flex items-center justify-between transition-all font-bold ${activeDropdown === 'category' ? 'ring-4 ring-indigo-500/10 border-indigo-500' : ''}`}
                      >
                        <span className={form.category ? 'text-slate-900 dark:text-white' : 'text-slate-400'}>{form.category || 'Choose Category'}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeDropdown === 'category' ? 'rotate-180' : ''}`} />
                      </button>

                      {activeDropdown === 'category' && (
                        <div className="absolute z-[110] left-0 right-0 mt-2 p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/15 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-150 max-h-60 overflow-y-auto custom-scrollbar">
                          {CATEGORIES.map(cat => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => { setField('category', cat); setActiveDropdown(null); }}
                              className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-sm font-bold text-slate-700 dark:text-slate-200 transition-colors"
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      )}
                      {errors.category && <p className="text-xs text-red-500 mt-2 ml-1 font-bold">{errors.category}</p>}
                    </div>

                    <div className="col-span-2 sm:col-span-1 relative">
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">Priority</label>
                      <button
                        type="button"
                        onClick={() => setActiveDropdown(activeDropdown === 'priority' ? null : 'priority')}
                        className={`w-full p-4.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/15 flex items-center justify-between transition-all font-bold ${activeDropdown === 'priority' ? 'ring-4 ring-indigo-500/10 border-indigo-500' : ''}`}
                      >
                        <span className="text-slate-900 dark:text-white capitalize">{PRIORITIES.find(p => p.value === form.priority)?.label || 'Normal'}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeDropdown === 'priority' ? 'rotate-180' : ''}`} />
                      </button>

                      {activeDropdown === 'priority' && (
                        <div className="absolute z-[110] left-0 right-0 mt-2 p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/15 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-150 max-h-60 overflow-y-auto custom-scrollbar">
                          {PRIORITIES.map(p => (
                            <button
                              key={p.value}
                              type="button"
                              onClick={() => { setField('priority', p.value); setActiveDropdown(null); }}
                              className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-sm font-bold text-slate-700 dark:text-slate-200 transition-colors"
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-3 py-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-black text-base shadow-xl shadow-indigo-500/25 active:scale-[0.99] transition-all"
                  >
                    {submitting ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Publishing Notice...</>
                    ) : (
                      <><Bell className="w-5 h-5" /> Publish Notice</>
                    )}
                  </button>

                </div>
              </form>
            )}
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
            <h3 className="text-xl font-black text-center text-slate-900 dark:text-white mb-2">Delete Notice?</h3>
            <p className="text-sm text-slate-500 text-center leading-relaxed mb-2">
              <span className="font-bold text-slate-700 dark:text-slate-300">&ldquo;{deleteTarget.title}&rdquo;</span>
            </p>
            <p className="text-xs text-slate-400 text-center mb-8">
              This will permanently delete this notice and any attached files. This action cannot be undone.
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
