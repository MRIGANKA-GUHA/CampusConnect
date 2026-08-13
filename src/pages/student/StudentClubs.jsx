import React, { useState, useEffect, useRef } from 'react';
import SmartHeader from '../../components/SmartHeader';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Users, Search, Loader2, CheckCircle, Plus, X, Tag, Bell, Check } from 'lucide-react';

const CLUB_CATEGORIES = ['All', 'Technical', 'Cultural', 'Literature', 'Sports', 'Social', 'Academic', 'Other'];

export default function StudentClubs() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [toastMessage, setToastMessage] = useState('');
  const toastTimerRef = useRef(null);
  
  // Local state for joined clubs to make UI responsive
  const [joinedClubs, setJoinedClubs] = useState(user?.joinedClubs || []);
  const [actionLoading, setActionLoading] = useState(null); // clubId

  const showToast = (msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => setToastMessage(''), 3500);
  };

  useEffect(() => {
    fetchClubs();
    return () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
  }, []);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/clubs/public');
      setClubs(res.data.clubs || []);
    } catch (err) {
      console.error('Failed to fetch clubs:', err);
      showToast('Failed to load clubs.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClub = async (clubId) => {
    try {
      setActionLoading(clubId);
      await api.post(`/student/clubs/${clubId}/join`);
      setJoinedClubs(prev => [...prev, clubId]);
      showToast('Joined club successfully!');
    } catch (err) {
      console.error('Join error:', err);
      showToast(err.response?.data?.error || 'Failed to join club.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeaveClub = async (clubId) => {
    try {
      setActionLoading(clubId);
      await api.delete(`/student/clubs/${clubId}/leave`);
      setJoinedClubs(prev => prev.filter(id => id !== clubId));
      showToast('Left club successfully.');
    } catch (err) {
      console.error('Leave error:', err);
      showToast(err.response?.data?.error || 'Failed to leave club.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          club.tagline?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || club.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

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
              placeholder="Search clubs by name or category..."
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


        </div>

        {/* Clubs Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="group bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden flex flex-col h-full animate-pulse">
                <div className="flex items-start justify-between mb-10 relative z-10">
                  <div className="w-16 h-16 rounded-[1.25rem] bg-slate-200 dark:bg-white/10 shrink-0"></div>
                  <div className="w-20 h-6 rounded-full bg-slate-200 dark:bg-white/5"></div>
                </div>
                <div className="flex-grow relative z-10">
                  <div className="w-3/4 h-8 rounded-lg bg-slate-200 dark:bg-white/10 mb-2"></div>
                  <div className="w-1/2 h-4 rounded bg-slate-200 dark:bg-white/5 mb-10"></div>
                </div>
                <div className="pt-8 border-t border-slate-100 dark:border-white/10 relative z-10 mt-auto">
                  <div className="w-24 h-3 rounded bg-slate-200 dark:bg-white/5 mb-5"></div>
                  <div className="flex items-center gap-5">
                    <div className="shrink-0 w-14 h-14 rounded-full bg-slate-200 dark:bg-white/10"></div>
                    <div className="min-w-0 flex-1">
                      <div className="w-2/3 h-5 rounded bg-slate-200 dark:bg-white/10 mb-1"></div>
                      <div className="w-1/2 h-3 rounded bg-slate-200 dark:bg-white/5"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredClubs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredClubs.map(club => {
              const isMember = joinedClubs.includes(club.id);
              const isActionLoading = actionLoading === club.id;

              return (
                <div 
                  key={club.id}
                  className="group bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-10 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-400 relative overflow-hidden flex flex-col h-full"
                >
                  {/* Background Decor */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[40px] -mr-10 -mt-10 group-hover:bg-indigo-500/15 transition-colors duration-500"></div>

                  <div className="flex items-start justify-between mb-10 relative z-10">
                    <div className="w-16 h-16 rounded-[1.25rem] bg-slate-50 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm group-hover:scale-110 group-hover:shadow-indigo-500/20 transition-all duration-300">
                      {club.logoURL ? (
                        <img 
                          src={club.logoURL} 
                          alt={club.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="w-7 h-7 text-slate-400 dark:text-slate-500" />
                      )}
                    </div>
                  </div>

                  <div className="flex-grow relative z-10">
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors drop-shadow-sm">
                      {club.name}
                    </h3>
                    <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">
                      {club.category}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-10 line-clamp-3">
                      {club.tagline || 'No tagline available.'}
                    </p>
                  </div>

                  <div className="pt-8 border-t border-slate-100 dark:border-white/10 relative z-10 mt-auto">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-5">Lead Convenor</p>
                    <div className="flex items-center gap-5">
                      <div className="shrink-0 w-14 h-14 rounded-full border-2 border-slate-100 dark:border-white/5 flex items-center justify-center bg-slate-50 dark:bg-white/5 shadow-sm group-hover:border-indigo-500/30 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:scale-105 transition-all duration-300 overflow-hidden">
                        {club.convenorPhoto ? (
                          <img src={club.convenorPhoto} alt="Convenor" className="w-full h-full object-cover" />
                        ) : (
                          <Users className="w-6 h-6 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-lg font-black text-slate-900 dark:text-white truncate tracking-tight mb-0.5">{club.convenorName || 'TBD'}</p>
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider truncate">Authorized Rep.</p>
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      {isMember ? (
                        <button
                          onClick={() => handleLeaveClub(club.id)}
                          disabled={isActionLoading}
                          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 transition-all border border-rose-200 dark:border-rose-500/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                        >
                          {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                          Leave Club
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoinClub(club.id)}
                          disabled={isActionLoading}
                          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[1.25rem] font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                        >
                          {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                          Join Club
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-32 bg-white dark:bg-white/5 rounded-[3rem] border border-dashed border-slate-200 dark:border-white/10">
            <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No organizations found</h3>
            <p className="text-slate-500 max-w-xs mx-auto">
              We couldn't find any clubs matching your search criteria.
            </p>
            {(searchQuery || activeCategory !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                }}
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
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

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
