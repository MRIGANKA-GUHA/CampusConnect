import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Bell, Megaphone, AlertCircle,
  Calendar, Users, Info, X, Loader2,
  UserCircle, Tag, Clock, Paperclip, Building2, Hash,
  ChevronDown, CheckCircle2, UploadCloud, FileText, Sparkles, FileCheck2
} from 'lucide-react';
import SmartHeader from '../../components/SmartHeader';
import api from '../../services/api';

const CATEGORIES = ['Academic', 'Administrative', 'Infrastructure', 'Cultural', 'Technical', 'Sports', 'Social', 'Other'];
const PRIORITIES = [
  { value: 'normal', label: 'Normal', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
  { value: 'high',   label: 'High Priority', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' },
];
const AUDIENCES = [
  { value: 'everyone',  label: 'Everyone' },
  { value: 'students',  label: 'Students Only' },
  { value: 'convenors', label: 'Convenors Only' },
];

const EMPTY_FORM = {
  title: '',
  content: '',
  category: '',
  priority: 'normal',
  targetAudience: 'everyone',
  clubId: '',
};

export default function AdminNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const [pendingFile, setPendingFile] = useState(null);

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
      const res = await api.get('/admin/notices');
      if (res.data?.notices) setNotices(res.data.notices);
    } catch (err) {
      console.warn('Notices endpoint not ready — showing empty state.');
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())   e.title   = 'Title is required.';
    if (!form.content.trim()) e.content = 'Content is required.';
    if (!form.category)       e.category = 'Select a category.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      // Use FormData to support file upload
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (form[key]) formData.append(key, form[key]);
      });
      
      if (pendingFile) {
        formData.append('pdf', pendingFile);
      }

      const res = await api.post('/admin/notices', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setNotices(prev => [res.data.notice, ...prev]);
      setSubmitSuccess(true);
      setTimeout(() => {
        setShowCreateModal(false);
        setSubmitSuccess(false);
        setForm(EMPTY_FORM);
        setPendingFile(null); // Reset
        setErrors({});
        setActiveDropdown(null);
      }, 1500);
    } catch (err) {
      console.error('Failed to create notice:', err);
      setErrors({ submit: err.response?.data?.error || 'Failed to save notice. Try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const setField = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: undefined, submit: undefined }));
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
      setPendingFile(file); // Save the actual file for final submission
      
      setForm(prev => ({
        ...prev,
        title:          data.title          || prev.title,
        content:        data.content        || prev.content,
        category:       data.category       || prev.category,
        priority:       data.priority       || prev.priority,
        targetAudience: data.targetAudience || prev.targetAudience,
        attachments:    file.name, // Mark as having a pending attachment
      }));
      setErrors({});
    } catch (err) {
      setPdfError(err.response?.data?.error || 'Failed to analyse PDF. Please try again.');
    } finally {
      setPdfLoading(false);
      // Reset file input so same file can be re-uploaded
      e.target.value = '';
    }
  };

  const filteredNotices = notices.filter(n =>
    n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case 'urgent': return { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10', icon: AlertCircle, label: 'Urgent' };
      case 'high':   return { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', icon: Bell, label: 'High Priority' };
      default:       return { color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', icon: Info, label: 'Normal' };
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(isoString));
  };

  const inputClass = (field) =>
    `w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border ${errors[field] ? 'border-red-400 dark:border-red-500/60 focus:ring-red-500/20' : 'border-slate-200 dark:border-white/10 focus:border-indigo-500/50'} text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-medium`;

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
            onClick={() => { setForm(EMPTY_FORM); setErrors({}); setSubmitSuccess(false); setShowCreateModal(true); }}
            className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all w-full lg:w-auto justify-center shrink-0 text-sm sm:text-base group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            Draft New Notice
          </button>
        </div>

        {/* Notices Feed */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-slate-500 font-medium tracking-widest uppercase text-sm">Retrieving Database...</p>
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 px-4 text-center bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-3xl shadow-sm">
            <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Megaphone className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No active notices</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">Draft your first official notice to broadcast an announcement to the campus.</p>
            <button
              onClick={() => { setForm(EMPTY_FORM); setErrors({}); setShowCreateModal(true); }}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full transition-all text-sm"
            >
              <Plus className="w-4 h-4" /> Draft First Notice
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max">
            {filteredNotices.map((notice, idx) => {
              const pc = getPriorityConfig(notice.priority);
              const PriorityIcon = pc.icon;
              return (
                <div
                  key={notice.id}
                  onClick={() => setSelectedNotice(notice)}
                  className="group flex flex-col bg-white dark:bg-[#080808] border border-slate-200 dark:border-white/5 rounded-3xl p-6 sm:p-8 hover:border-indigo-200 dark:hover:border-white/10 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300 cursor-pointer animate-fade-up-slow"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
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
                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-full">
                      <Users className="w-3.5 h-3.5 opacity-70" />
                      <span className="capitalize">{notice.targetAudience}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ───── CREATE NOTICE MODAL ───── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowCreateModal(false)}></div>
          <div className="relative pointer-events-auto w-full max-w-2xl bg-white dark:bg-[#0a0a0a] border border-white/20 dark:border-white/10 rounded-[3rem] p-8 sm:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-10 shrink-0">
              <div className="flex items-center gap-4">
                <h2 className="text-3xl font-black tracking-tight leading-tight">Draft Notice</h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
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
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-8 custom-scrollbar pr-2">
                <div className="space-y-8">

                  {/* ── PDF Upload Zone ── */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-1 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      AI Autofill from PDF
                      <span className="ml-1 normal-case font-medium text-slate-400/70 tracking-normal">optional</span>
                    </label>
                    <label
                      htmlFor="pdf-upload"
                      className={`group relative flex flex-col items-center justify-center gap-3 w-full p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer
                        ${
                          pdfLoading
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
                            <p className="text-xs text-slate-400 mt-0.5">Stored in Cloudinary · Summarized by AI</p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setField('attachments', ''); }}
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
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Notice Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Mid-Semester Examination Guidelines"
                      value={form.title}
                      onChange={(e) => setField('title', e.target.value)}
                      className="w-full p-4.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 dark:text-white placeholder-slate-400"
                    />
                    {errors.title && <p className="text-xs text-red-500 mt-2 ml-1 font-bold">{errors.title}</p>}
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Full Content *</label>
                    <textarea
                      rows={4}
                      placeholder="Write the complete body of the notice here..."
                      value={form.content}
                      onChange={(e) => setField('content', e.target.value)}
                      className="w-full p-4.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-900 dark:text-white placeholder-slate-400 resize-none"
                    />
                    {errors.content && <p className="text-xs text-red-500 mt-2 ml-1 font-bold">{errors.content}</p>}
                  </div>

                  {/* Category & Priority Grid */}
                  <div className="grid grid-cols-2 gap-5 relative">
                    <div className="col-span-2 sm:col-span-1 relative">
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Category *</label>
                      <button
                        type="button"
                        onClick={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')}
                        className={`w-full p-4.5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between transition-all font-bold ${activeDropdown === 'category' ? 'ring-4 ring-indigo-500/10 border-indigo-500' : ''}`}
                      >
                        <span className={form.category ? 'text-slate-900 dark:text-white' : 'text-slate-400'}>{form.category || 'Choose Category'}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeDropdown === 'category' ? 'rotate-180' : ''}`} />
                      </button>

                      {activeDropdown === 'category' && (
                        <div className="absolute z-[110] left-0 right-0 mt-2 p-2 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl animate-in zoom-in-95 duration-150 max-h-60 overflow-y-auto custom-scrollbar">
                          {CATEGORIES.map(cat => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => { setField('category', cat); setActiveDropdown(null); }}
                              className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors"
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      )}
                      {errors.category && <p className="text-xs text-red-500 mt-2 ml-1 font-bold">{errors.category}</p>}
                    </div>

                    <div className="col-span-2 sm:col-span-1 relative">
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Priority</label>
                      <button
                        type="button"
                        onClick={() => setActiveDropdown(activeDropdown === 'priority' ? null : 'priority')}
                        className={`w-full p-4.5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between transition-all font-bold ${activeDropdown === 'priority' ? 'ring-4 ring-indigo-500/10 border-indigo-500' : ''}`}
                      >
                        <span className="text-slate-900 dark:text-white capitalize">{PRIORITIES.find(p => p.value === form.priority)?.label || 'Normal'}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeDropdown === 'priority' ? 'rotate-180' : ''}`} />
                      </button>

                      {activeDropdown === 'priority' && (
                        <div className="absolute z-[110] left-0 right-0 mt-2 p-2 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl animate-in zoom-in-95 duration-150 max-h-60 overflow-y-auto custom-scrollbar">
                          {PRIORITIES.map(p => (
                            <button
                              key={p.value}
                              type="button"
                              onClick={() => { setField('priority', p.value); setActiveDropdown(null); }}
                              className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors"
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Target Audience */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Target Audience</label>
                    <div className="flex bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-1.5 font-bold cursor-pointer transition-all">
                      {AUDIENCES.map(a => (
                        <button
                          type="button"
                          key={a.value}
                          onClick={() => setField('targetAudience', a.value)}
                          className={`flex-1 py-3 px-2 rounded-xl text-xs font-black transition-all duration-300 ${form.targetAudience === a.value ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 shadow-sm ring-1 ring-indigo-200 dark:ring-indigo-500/30' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-white/5'}`}
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Club ID (optional) */}
                  <div className="col-span-2">
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Club ID <span className="normal-case text-slate-400/60 font-medium">(optional)</span></label>
                    <input
                      type="text"
                      placeholder="Leave blank for a general notice"
                      value={form.clubId}
                      onChange={(e) => setField('clubId', e.target.value)}
                      className="w-full p-4.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 dark:text-white placeholder-slate-400"
                    />
                  </div>
                </div>

                {errors.submit && (
                  <div className="px-5 py-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-sm text-red-600 dark:text-red-400 font-bold flex items-center gap-3 mt-8">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {errors.submit}
                  </div>
                )}

                <div className="pt-8">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 text-sm"
                  >
                    {submitting ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Publishing...</>
                    ) : (
                      <>Publish Notice</>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ───── DETAIL SLIDE-IN PANEL ───── */}
      <div
        onClick={() => setSelectedNotice(null)}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${selectedNotice ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-xl z-50 bg-white dark:bg-[#090909] border-l border-slate-200 dark:border-white/10 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col ${selectedNotice ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {selectedNotice && (() => {
          const pc = getPriorityConfig(selectedNotice.priority);
          const PriorityIcon = pc.icon;
          return (
            <>
              <div className="flex items-center justify-between px-6 sm:px-8 pt-8 pb-6 border-b border-slate-100 dark:border-white/5 shrink-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase ${pc.bg} ${pc.color}`}>
                    <PriorityIcon className="w-3.5 h-3.5" />
                    {pc.label}
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                    {selectedNotice.category}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedNotice(null)}
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-8 space-y-8 custom-scrollbar">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-snug">
                  {selectedNotice.title}
                </h2>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-3">Notice Content</p>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl p-5">
                    {selectedNotice.content}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl p-4">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <UserCircle className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Author</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{selectedNotice.authorName || '—'}</p>
                      {selectedNotice.authorId && <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">{selectedNotice.authorId}</p>}
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl p-4">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Users className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Target Audience</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 capitalize">{selectedNotice.targetAudience || 'everyone'}</p>
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
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl">
                    <div className="flex items-center gap-2.5 text-slate-500">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">Created</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{formatDate(selectedNotice.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl">
                    <div className="flex items-center gap-2.5 text-slate-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">Last Updated</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{formatDate(selectedNotice.updatedAt)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-3 flex items-center gap-2">
                    <Paperclip className="w-3.5 h-3.5" /> Attachments
                  </p>
                  {selectedNotice.attachments?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedNotice.attachments.map((att, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl text-sm font-semibold text-indigo-700 dark:text-indigo-400">
                          <Paperclip className="w-4 h-4 shrink-0" />{att}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic px-1">No attachments.</p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-300 dark:text-slate-700 pt-2">
                  <Hash className="w-3 h-3" />{selectedNotice.id}
                </div>
              </div>
            </>
          );
        })()}
      </div>

      <div className="fixed top-0 inset-x-0 h-64 pointer-events-none -z-10 bg-gradient-to-b from-indigo-500/5 to-transparent" />
    </div>
  );
}
