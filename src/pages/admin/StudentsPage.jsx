import React, { useState, useEffect } from 'react';
import { Users, Search, Loader2, Mail, Phone, BookOpen, Hash, Calendar, X, ShieldCheck, Clock, ShieldAlert, Trash2, Ban, CheckCircle } from 'lucide-react';
import SmartHeader from '../../components/SmartHeader';
import api from '../../services/api';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedStudent) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedStudent]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/students');
      setStudents(res.data.students || []);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setError('Failed to load students data.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (newRole) => {
    if (!selectedStudent || loadingAction) return;
    if (newRole === selectedStudent.role) return;
    
    // Ask for confidence confirmation
    if (!window.confirm(`Are you sure you want to change ${selectedStudent.displayName}'s role to ${newRole.toUpperCase()}?`)) return;

    setLoadingAction('role');
    try {
      await api.patch(`/admin/students/${selectedStudent.id}/role`, { role: newRole });
      
      // Update local state 
      setSelectedStudent(prev => ({ ...prev, role: newRole }));
      setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, role: newRole } : s));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to update role");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedStudent || loadingAction) return;
    
    // Very strict danger confirmation
    const confirmDelete = window.confirm(`DANGER: Are you absolutely sure you want to permanently delete ${selectedStudent.displayName}? This action CANNOT be undone and will erase all their data.`);
    if (!confirmDelete) return;

    setLoadingAction('delete');
    try {
      await api.delete(`/admin/students/${selectedStudent.id}`);
      
      // Remove from lists and close modal instantly on success
      setStudents(prev => prev.filter(s => s.id !== selectedStudent.id));
      setSelectedStudent(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to delete user");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedStudent || loadingAction) return;
    
    const newStatus = !selectedStudent.isDisabled;
    const actionText = newStatus ? 'DISABLE' : 'ENABLE';
    
    if (!window.confirm(`Are you sure you want to ${actionText} ${selectedStudent.displayName}'s account? ${
      newStatus ? 'They will be immediately logged out and blocked from signing in.' : 'They will be able to sign in again.'
    }`)) return;

    setLoadingAction('disable');
    try {
      await api.patch(`/admin/students/${selectedStudent.id}/status`, { disabled: newStatus });
      setSelectedStudent(prev => ({ ...prev, isDisabled: newStatus }));
      setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, isDisabled: newStatus } : s));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || `Failed to ${actionText.toLowerCase()} account`);
    } finally {
      setLoadingAction(null);
    }
  };

  const filteredStudents = students.filter(student => 
    student.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-sans transition-colors duration-300">
      <SmartHeader />
      
      <main className="max-w-7xl mx-auto pt-28 sm:pt-36 px-4 sm:px-8 pb-12">
        {/* Top Action Bar (Search) */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 w-full">
          <div className="flex-1 w-full max-w-xl relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by name, roll no, department, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-14 pr-6 py-4 rounded-[2rem] bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 shadow-sm hover:shadow-md transition-all font-medium text-sm sm:text-base"
            />
          </div>
          
          <div className="bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 px-6 py-4 rounded-[2rem] font-bold flex items-center gap-3 border border-slate-200 dark:border-white/10 shadow-sm shrink-0 w-full md:w-auto justify-center md:justify-start">
            <Users className="w-5 h-5 text-indigo-500" />
            <span>{students.length} Total Students</span>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-5 rounded-2xl text-sm font-bold bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-100 dark:border-red-500/20 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col justify-center items-center py-32 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
            <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse tracking-wide">Loading student directory...</p>
          </div>
        ) : (
          <>
            {filteredStudents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                {filteredStudents.map((student, idx) => {
                  const avatarSrc = student.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${student.displayName || student.email || 'S'}&backgroundColor=4f46e5&textColor=ffffff`;
                  
                  return (
                    <div 
                      key={student.id} 
                      className="group bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(79,70,229,0.05)] hover:-translate-y-1 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden"
                      style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}
                    >
                      {/* Card Header (Avatar + Name) */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-8">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-full border-[3px] border-indigo-50 dark:border-indigo-500/20 overflow-hidden shadow-sm group-hover:scale-105 group-hover:border-indigo-200 dark:group-hover:border-indigo-400/50 transition-all duration-300 bg-slate-100 dark:bg-white/5">
                          <img src={avatarSrc} alt={student.displayName} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight truncate">
                            {student.displayName || "Unknown Student"}
                          </h3>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                              <Hash className="w-3.5 h-3.5 opacity-70" />
                              <span className="truncate">{student.rollNo || "NO ROLL INFO"}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Body (Details) */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 group/item">
                          <div className="w-10 h-10 rounded-[1rem] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover/item:scale-110 group-hover/item:bg-indigo-100 group-hover/item:dark:bg-indigo-500/20 transition-all border border-indigo-100 dark:border-indigo-500/20">
                            <BookOpen className="w-4.5 h-4.5" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">Department</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{student.department || 'Not Provided'}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 group/item">
                          <div className="w-10 h-10 rounded-[1rem] bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 group-hover/item:scale-110 group-hover/item:text-slate-700 group-hover/item:dark:text-white transition-all border border-slate-200 dark:border-white/5">
                            <Mail className="w-4.5 h-4.5" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">Email</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{student.email}</span>
                          </div>
                        </div>

                        {student.phoneNo && (
                          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 group/item">
                            <div className="w-10 h-10 rounded-[1rem] bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 group-hover/item:scale-110 group-hover/item:text-slate-700 group-hover/item:dark:text-white transition-all border border-slate-200 dark:border-white/5">
                              <Phone className="w-4.5 h-4.5" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">Phone</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{student.phoneNo}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Footer */}
                      <div className="mt-8 pt-5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-white/[0.02] px-3 py-1.5 rounded-lg border border-slate-100 dark:border-white/5">
                            <Calendar className="w-3.5 h-3.5 opacity-70" />
                            JOINED {new Date(student.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                          </div>
                         <button 
                           onClick={() => setSelectedStudent(student)}
                           className="text-sm font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors uppercase tracking-widest flex items-center gap-1 group/btn"
                         >
                            View
                            <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                         </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-12 sm:p-20 text-center flex flex-col items-center shadow-sm max-w-2xl mx-auto mt-10">
                <div className="w-24 h-24 bg-slate-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mb-8 border border-slate-100 dark:border-white/5">
                  <Search className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-3">No students found</h3>
                <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
                  {searchTerm 
                    ? `We couldn't find any students matching "${searchTerm}". Try adjusting your search criteria.` 
                    : 'There are currently no students registered on the platform.'}
                </p>
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="mt-8 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-widest rounded-full hover:bg-slate-800 dark:hover:bg-slate-100 hover:-translate-y-1 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] active:scale-95 text-sm"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modern Blur Overlay Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Backdrop with Frosted Glass Effect */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity cursor-pointer"
            onClick={() => setSelectedStudent(null)}
          ></div>
          
          {/* Detailed Modal Container */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-[2.5rem] w-full max-w-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedStudent(null)}
              className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="relative pt-12 pb-8 px-8 flex flex-col items-center bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5 shrink-0">
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-[#0a0a0a] shadow-xl overflow-hidden bg-slate-100 dark:bg-white/5 mb-5 relative z-10">
                <img 
                  src={selectedStudent.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedStudent.displayName || selectedStudent.email || 'S'}&backgroundColor=4f46e5&textColor=ffffff`} 
                  alt={selectedStudent.displayName} 
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white text-center leading-tight flex items-center gap-2">
                {selectedStudent.displayName || 'Unknown Student'}
                {selectedStudent.isVerified && (
                  <ShieldCheck className="w-6 h-6 text-emerald-500" title="Verified User" />
                )}
              </h2>
              <div className="flex flex-wrap justify-center items-center gap-3 mt-5">
                <span className="px-5 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs sm:text-sm rounded-full uppercase tracking-widest border border-indigo-100 dark:border-indigo-500/20 shadow-sm flex items-center gap-1.5">
                  <Hash className="w-4 h-4 opacity-80" />
                  {selectedStudent.rollNo || 'NO ROLL NUMBER'}
                </span>
                <span className={`px-5 py-2 font-bold text-xs sm:text-sm rounded-full uppercase tracking-widest border shadow-sm ${
                  selectedStudent.role === 'admin' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' : 
                  selectedStudent.role === 'convenor' ? 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20' :
                  'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                }`}>
                  {selectedStudent.role || 'STUDENT'}
                </span>
                {selectedStudent.isDisabled && (
                  <span className="px-5 py-2 bg-rose-600 text-white font-bold text-xs sm:text-sm rounded-full uppercase tracking-widest shadow-sm flex items-center gap-1.5 animate-pulse">
                    <Ban className="w-4 h-4" />
                    SUSPENDED
                  </span>
                )}
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar">
              
              {/* Bio Section */}
              {selectedStudent.bio && (
                 <div className="bg-indigo-50/50 dark:bg-indigo-500/5 p-5 rounded-3xl border border-indigo-100/50 dark:border-indigo-500/10">
                   <p className="text-sm sm:text-base text-indigo-900 dark:text-indigo-200 italic leading-relaxed text-center font-medium">
                     "{selectedStudent.bio}"
                   </p>
                 </div>
              )}

              {/* General Info Group */}
              <div className="bg-white dark:bg-[#111111] rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
                <div className="p-5 sm:p-6 flex items-center gap-4 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">Department</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{selectedStudent.department || 'Not Provided'}</p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 flex items-center gap-4 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <div className="w-12 h-12 rounded-full bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">Email Address</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 break-all">{selectedStudent.email}</p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">Phone Number</p>
                    {selectedStudent.phoneNo ? (
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{selectedStudent.phoneNo}</p>
                    ) : (
                      <p className="font-semibold text-slate-500 italic truncate">Not provided</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center px-2">
                 <div className="flex items-center gap-2 text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <Calendar className="w-4 h-4 opacity-70" /> 
                    Joined {new Date(selectedStudent.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                 </div>
                 {selectedStudent.updatedAt && (
                   <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500">
                      <Clock className="w-3.5 h-3.5" /> 
                      Updated: {new Date(selectedStudent.updatedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}
                   </div>
                 )}
              </div>

              {/* Admin Actions Zone */}
              <div className="pt-6 mt-6 border-t-2 border-dashed border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  <h3 className="font-black tracking-tight text-slate-900 dark:text-white uppercase text-xs">Admin Controls</h3>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-slate-50 dark:bg-[#111111] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/10 mb-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">System Role</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Modify access privileges</p>
                  </div>
                  <div className="w-full sm:w-auto relative">
                    <select
                      value={selectedStudent.role || 'student'}
                      onChange={(e) => handleUpdateRole(e.target.value)}
                      disabled={loadingAction !== null}
                      className="w-full sm:w-40 appearance-none bg-white dark:bg-[#1a1a1a] border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold text-xs py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                      <option value="student">Student</option>
                      <option value="convenor">Convenor</option>
                      <option value="admin">Admin</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                      <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M5.5 7.5L10 12l4.5-4.5H5.5z"/></svg>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-rose-50/50 dark:bg-rose-500/5 p-4 sm:p-5 rounded-2xl border border-rose-100 dark:border-rose-500/10 mb-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-rose-700 dark:text-rose-400 text-sm">Account Access</h4>
                    <p className="text-xs text-rose-500/80 dark:text-rose-400/70 mt-0.5">Block or restore login for this user</p>
                  </div>
                  <button 
                    onClick={handleToggleStatus}
                    disabled={loadingAction !== null}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 font-bold text-xs uppercase tracking-widest rounded-xl transition-colors disabled:opacity-50 shadow-sm active:scale-95 ${
                      selectedStudent.isDisabled 
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_4px_14px_rgba(5,150,105,0.3)]" 
                        : "bg-rose-500 hover:bg-rose-600 text-white shadow-[0_4px_14px_rgba(244,63,94,0.3)]"
                    }`}
                  >
                    {loadingAction === 'disable' ? <Loader2 className="w-4 h-4 animate-spin" /> : (selectedStudent.isDisabled ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />)}
                    {selectedStudent.isDisabled ? 'Re-enable Account' : 'Suspend Account'}
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-red-50/50 dark:bg-red-500/5 p-4 sm:p-5 rounded-2xl border border-red-100 dark:border-red-500/10">
                  <div className="flex-1">
                    <h4 className="font-bold text-red-700 dark:text-red-400 text-sm">Account Deletion</h4>
                    <p className="text-xs text-red-500/80 dark:text-red-400/70 mt-0.5">Permanently erase this user</p>
                  </div>
                  <button 
                    onClick={handleDeleteUser}
                    disabled={loadingAction !== null}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors disabled:opacity-50 shadow-[0_4px_14px_rgba(220,38,38,0.3)] active:scale-95"
                  >
                    {loadingAction === 'delete' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Delete User
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
