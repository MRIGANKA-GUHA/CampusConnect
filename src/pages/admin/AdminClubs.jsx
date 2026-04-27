import React, { useState, useEffect } from 'react';
import {
  Users, Search, Loader2, Plus, X, ShieldCheck,
  Trash2, LayoutGrid, Info, CheckCircle, Ban,
  Copy, Check, ChevronDown
} from 'lucide-react';
import SmartHeader from '../../components/SmartHeader';
import api from '../../services/api';

const CLUB_CATEGORIES = ['Technical', 'Cultural', 'Literature', 'Sports', 'Social', 'Academic', 'Other'];

export default function AdminClubs() {
  const [clubs, setClubs] = useState([]);
  const [convenors, setConvenors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);
  const [newClubData, setNewClubData] = useState({
    name: '',
    category: '',
    clubEmail: '',
    convenorName: '',
    convenorEmail: '',
    description: ''
  });
  const [createdAccountInfo, setCreatedAccountInfo] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    fetchClubs();
    fetchConvenors();
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

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/clubs');
      setClubs(res.data.clubs || []);
    } catch (err) {
      console.error('Failed to fetch clubs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConvenors = async () => {
    try {
      const res = await api.get('/admin/convenors');
      setConvenors(res.data.convenors || []);
    } catch (err) {
      console.error('Failed to fetch convenors:', err);
    }
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();
    setLoadingAction('create');
    try {
      const res = await api.post('/admin/clubs', newClubData);
      setClubs([...clubs, res.data.club]);
      setCreatedAccountInfo(res.data);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create club");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    if (loadingAction) return;
    setLoadingAction('status');
    try {
      await api.patch(`/admin/clubs/${id}/status`, { status: newStatus });
      setClubs(clubs.map(c => c.id === id ? { ...c, status: newStatus } : c));
      if (selectedClub?.id === id) setSelectedClub({ ...selectedClub, status: newStatus });
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeleteClub = async (id) => {
    if (!window.confirm("Are you sure you want to delete this club? This will NOT delete the convenor's account, only the club connection.")) return;
    setLoadingAction('delete');
    try {
      await api.delete(`/admin/clubs/${id}`);
      setClubs(clubs.filter(c => c.id !== id));
      setSelectedClub(null);
    } catch (err) {
      alert("Failed to delete club");
    } finally {
      setLoadingAction(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const filteredClubs = clubs.filter(club =>
    club.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.convenorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: clubs.length,
    active: clubs.filter(c => c.status === 'active').length,
    pending: clubs.filter(c => c.status === 'pending').length
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30">
      <SmartHeader />

      <main className="max-w-7xl mx-auto pt-24 sm:pt-32 px-4 sm:px-8 pb-12">
        {/* Action Bar (Search & Initialize) */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8 mt-2 w-full">
          <div className="flex-1 w-full max-w-xl relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search clubs, categories, or convenors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-14 pr-6 py-4 rounded-[2rem] bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 shadow-sm hover:shadow-md transition-all font-medium text-sm sm:text-base"
            />
          </div>

          <button
            onClick={() => {
              setNewClubData({ name: '', category: '', clubEmail: '', convenorName: '', convenorEmail: '', description: '' });
              setCreatedAccountInfo(null);
              fetchConvenors();
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all w-full lg:w-auto justify-center shrink-0 text-sm sm:text-base"
          >
            <Plus className="w-5 h-5" />
            Initialize New Club
          </button>
        </div>


        {/* Club Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            <p className="text-slate-500 font-medium animate-pulse">Synchronizing with central database...</p>
          </div>
        ) : filteredClubs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredClubs.map((club, idx) => (
              <div
                key={club.id}
                onClick={() => setSelectedClub(club)}
                className="group bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-10 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-400 cursor-pointer relative overflow-hidden flex flex-col h-full"
              >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[40px] -mr-10 -mt-10 group-hover:bg-indigo-500/15 transition-colors duration-500"></div>

                <div className="flex items-start justify-between mb-10 relative z-10">
                  <div className="w-16 h-16 rounded-[1.25rem] bg-slate-50 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm group-hover:scale-110 group-hover:shadow-indigo-500/20 transition-all duration-300">
                    {club.logoURL ? (
                      <img src={club.logoURL} alt={club.name} className="w-full h-full object-cover" />
                    ) : (
                      <LayoutGrid className="w-7 h-7 text-slate-400 dark:text-slate-500" />
                    )}
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${club.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                    'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                    }`}>
                    {club.status}
                  </span>
                </div>

                <div className="flex-grow relative z-10">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors drop-shadow-sm">
                    {club.name}
                  </h3>
                  <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-10">
                    {club.category}
                  </p>
                </div>

                <div className="pt-8 border-t border-slate-100 dark:border-white/10 relative z-10 mt-auto">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-5">Lead Convenor</p>
                  <div className="flex items-center gap-5">
                    <div className="shrink-0 w-14 h-14 rounded-full border-2 border-slate-100 dark:border-white/5 flex items-center justify-center bg-slate-50 dark:bg-white/5 shadow-sm group-hover:border-indigo-500/30 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:scale-105 transition-all duration-300 overflow-hidden">
                      {club.convenorPhoto ? (
                        <img src={club.convenorPhoto} alt={club.convenorName} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-6 h-6 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-black text-slate-900 dark:text-white truncate tracking-tight mb-0.5">{club.convenorName}</p>
                      <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider truncate">Authorized Rep.</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white dark:bg-white/5 rounded-[3rem] border border-dashed border-slate-200 dark:border-white/10">
            <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <LayoutGrid className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No organizations found</h3>
            <p className="text-slate-500 max-w-xs mx-auto">Try refining your search filters or register a new campus club.</p>
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowCreateModal(false)}></div>
          <div className="relative bg-white dark:bg-[#0a0a0a] border border-white/20 dark:border-white/10 rounded-[3rem] w-full max-w-xl p-8 sm:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200 overflow-hidden">

            {createdAccountInfo ? (
              <div className="text-center py-4">
                <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                  <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-3xl font-black mb-3 tracking-tight">Club Initialized!</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium leading-relaxed text-sm">
                  <span className="font-bold text-slate-900 dark:text-white">{createdAccountInfo?.club?.name}</span> has been registered. Share the credentials below with the club.
                </p>

                <div className="space-y-3 mb-8 text-left">
                  <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">Club Email</p>
                      <code className="text-sm font-mono text-slate-700 dark:text-slate-300">{createdAccountInfo?.clubEmail}</code>
                    </div>
                    <button
                      onClick={() => { navigator.clipboard.writeText(createdAccountInfo?.clubEmail); setCopiedLink('email'); setTimeout(() => setCopiedLink(false), 2000); }}
                      className="shrink-0 p-3 rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/20 transition-all active:scale-90"
                    >
                      {copiedLink === 'email' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">Generated Password</p>
                      <code className="text-sm font-mono text-slate-700 dark:text-slate-300">{createdAccountInfo?.password}</code>
                    </div>
                    <button
                      onClick={() => { navigator.clipboard.writeText(createdAccountInfo?.password); setCopiedLink('pass'); setTimeout(() => setCopiedLink(false), 2000); }}
                      className="shrink-0 p-3 rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/20 transition-all active:scale-90"
                    >
                      {copiedLink === 'pass' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-amber-500 dark:text-amber-400 font-bold mb-8">⚠️ Save these credentials now — they won't be shown again.</p>

                <button
                  onClick={() => { setShowCreateModal(false); setCreatedAccountInfo(null); fetchClubs(); }}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-indigo-700 active:scale-95 transition-all shadow-xl shadow-indigo-500/20"
                >
                  Finalize & Return
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-black tracking-tight leading-tight">Register Club</h2>
                  </div>
                  <button onClick={() => setShowCreateModal(false)} className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleCreateClub} className="space-y-8">
                  <div className="grid grid-cols-2 gap-5 relative">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Official Name</label>
                      <input
                        required
                        type="text"
                        value={newClubData.name}
                        onChange={(e) => setNewClubData({ ...newClubData, name: e.target.value })}
                        className="w-full p-4.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 dark:text-white placeholder-slate-400"
                        placeholder="Club/Society name..."
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <div className="relative">
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Category</label>
                        <button
                          type="button"
                          onClick={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')}
                          className={`w-full p-4.5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between transition-all font-bold ${activeDropdown === 'category' ? 'ring-4 ring-indigo-500/10 border-indigo-500' : ''}`}
                        >
                          <span className={newClubData.category ? 'text-slate-900 dark:text-white' : 'text-slate-400'}>{newClubData.category || 'Choose Category'}</span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeDropdown === 'category' ? 'rotate-180' : ''}`} />
                        </button>

                        {activeDropdown === 'category' && (
                          <div className="absolute z-[110] left-0 right-0 mt-2 p-2 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl animate-in zoom-in-95 duration-150 max-h-60 overflow-y-auto custom-scrollbar">
                            <button
                              type="button"
                              onClick={() => { setNewClubData({ ...newClubData, category: '' }); setActiveDropdown(null); }}
                              className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-sm font-bold text-slate-400 transition-colors"
                            >
                              Choose Category
                            </button>
                            {CLUB_CATEGORIES.map(cat => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => { setNewClubData({ ...newClubData, category: cat }); setActiveDropdown(null); }}
                                className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors"
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="relative">
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Assign Convenor</label>
                      <button
                        type="button"
                        onClick={() => setActiveDropdown(activeDropdown === 'convenor' ? null : 'convenor')}
                        className={`w-full p-4.5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between transition-all font-bold ${activeDropdown === 'convenor' ? 'ring-4 ring-indigo-500/10 border-indigo-500' : ''}`}
                      >
                        <span className={newClubData.convenorName ? 'text-slate-900 dark:text-white' : 'text-slate-400'}>{newClubData.convenorName || 'Select Registered Convenor'}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeDropdown === 'convenor' ? 'rotate-180' : ''}`} />
                      </button>

                      {activeDropdown === 'convenor' && (
                        <div className="absolute z-[110] left-0 right-0 mt-2 p-2 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl animate-in zoom-in-95 duration-150 max-h-60 overflow-y-auto custom-scrollbar">
                          <button
                            type="button"
                            onClick={() => { setNewClubData({ ...newClubData, convenorName: '', convenorEmail: '' }); setActiveDropdown(null); }}
                            className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-sm font-bold text-slate-400 transition-colors"
                          >
                            Unselect Convenor
                          </button>
                          {convenors.length > 0 ? convenors.map(conv => (
                            <button
                              key={conv.id}
                              type="button"
                              onClick={() => {
                                setNewClubData({ ...newClubData, convenorName: conv.displayName, convenorEmail: conv.email });
                                setActiveDropdown(null);
                              }}
                              className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                            >
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-500 transition-colors">{conv.displayName}</p>
                              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{conv.email}</p>
                            </button>
                          )) : (
                            <div className="px-4 py-6 text-center">
                              <p className="text-xs text-slate-500 font-medium italic">No registered convenors found.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Club Email ID</label>
                      <input
                        required
                        type="email"
                        value={newClubData.clubEmail}
                        onChange={(e) => setNewClubData({ ...newClubData, clubEmail: e.target.value })}
                        className="w-full p-4.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 dark:text-white placeholder-slate-400"
                        placeholder="e.g. samarth.club@campus.edu"
                      />
                      <p className="text-[10px] text-slate-400 font-medium mt-2 ml-1">A random password will be auto-generated and shown after registration.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Convenor Email (auto-filled)</label>
                      <input
                        required
                        type="email"
                        readOnly
                        value={newClubData.convenorEmail}
                        className="w-full p-4.5 rounded-2xl bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-500 font-bold cursor-not-allowed"
                        placeholder="Select a convenor to auto-fill..."
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loadingAction === 'create'}
                    className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                  >
                    {loadingAction === 'create' ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShieldCheck className="w-6 h-6" />}
                    Initialize & Grant Access
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedClub && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedClub(null)}></div>
          <div className="relative bg-white dark:bg-[#0a0a0a] border border-white/20 dark:border-white/10 rounded-[3.5rem] w-full max-w-3xl shadow-[0_32px_80px_-16px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom-10 duration-500 flex flex-col max-h-[90vh] overflow-hidden">

            <button onClick={() => setSelectedClub(null)} className="absolute top-8 right-8 p-3 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors z-20">
              <X className="w-6 h-6" />
            </button>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-10 sm:p-14">
              <div className="flex flex-col items-center text-center mb-12">
                <div className="w-32 h-32 rounded-[2.5rem] bg-slate-50 dark:bg-white/5 border-2 border-white dark:border-white/10 flex items-center justify-center mb-8 overflow-hidden shadow-2xl relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent"></div>
                  {selectedClub.logoURL ? (
                    <img src={selectedClub.logoURL} alt={selectedClub.name} className="w-full h-full object-cover relative z-10" />
                  ) : (
                    <LayoutGrid className="w-12 h-12 text-slate-300 relative z-10" />
                  )}
                </div>
                <h2 className="text-5xl font-black tracking-tight mb-4 text-slate-900 dark:text-white leading-tight">{selectedClub.name}</h2>
                <div className="flex items-center gap-3">
                  <span className="px-6 py-2 bg-indigo-600 text-white font-black text-[10px] rounded-full uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20">
                    {selectedClub.category}
                  </span>
                  <span className={`px-6 py-2 font-black text-[10px] rounded-full uppercase tracking-[0.2em] border ${selectedClub.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                    {selectedClub.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 transition-all hover:border-indigo-500/30">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Leadership</p>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="font-black text-lg text-slate-800 dark:text-white leading-tight">{selectedClub.convenorName}</p>
                      <p className="text-xs text-indigo-500 font-bold uppercase tracking-widest mt-1">Lead Convenor</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 transition-all hover:border-emerald-500/30">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Operations</p>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <LayoutGrid className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="font-black text-lg text-slate-800 dark:text-white leading-tight">{selectedClub.status === 'active' ? 'Operational' : 'Suspended'}</p>
                      <p className="text-xs text-indigo-500 font-bold uppercase tracking-widest mt-1">Platform Status</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6 ml-2">
                  <Info className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">About the Organization</h3>
                </div>
                <div className="bg-slate-50 dark:bg-white/[0.02] p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 relative">
                  <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic text-lg text-center">
                    "{selectedClub.description || "This organization has not yet finalized its vision statement and mission parameters within the platform database."}"
                  </p>
                </div>
              </div>

              {/* Security & Access Section */}
              <div className="pt-10 border-t-2 border-dashed border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-2 mb-8 ml-2 text-rose-500">
                  <ShieldCheck className="w-5 h-5" />
                  <h3 className="font-black tracking-[0.2em] uppercase text-[10px]">Administrative Overwatch</h3>
                </div>

                <div className="flex flex-col sm:flex-row gap-5">
                  <button
                    onClick={() => handleUpdateStatus(selectedClub.id, selectedClub.status === 'active' ? 'inactive' : 'active')}
                    disabled={loadingAction !== null}
                    className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl disabled:opacity-50 ${selectedClub.status === 'active'
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                      }`}
                  >
                    {loadingAction === 'status' ? <Loader2 className="w-5 h-5 animate-spin" /> : (selectedClub.status === 'active' ? <Ban className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />)}
                    {selectedClub.status === 'active' ? 'Restrict Access' : 'Restore Operations'}
                  </button>
                  <button
                    onClick={() => handleDeleteClub(selectedClub.id)}
                    disabled={loadingAction !== null}
                    className="flex-1 flex items-center justify-center gap-3 py-5 bg-rose-600 hover:bg-rose-700 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-rose-500/20 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {loadingAction === 'delete' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                    Dissolve Club
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); }
      `}} />
    </div>
  );
}
