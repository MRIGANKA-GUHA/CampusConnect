import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { User as UserIcon, Loader2, Save } from 'lucide-react';
import api from '../services/api';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [phoneNo, setPhoneNo] = useState(user?.phoneNo || '');
  const [rollNo, setRollNo] = useState(user?.rollNo || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.put('/auth/profile', { displayName, phoneNo, rollNo, bio, department });
      setMessage({ type: 'success', text: response.data.message });
      // Update the global auth state instantly without a full page reload
      updateUser(response.data.user);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-sans transition-colors duration-300">
      <Header />

      <main className="max-w-2xl mx-auto pt-32 px-4 sm:px-8 pb-12">
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[1.5rem] sm:rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">

          <div className="flex items-center gap-4 sm:gap-6 mb-8 pb-8 border-b border-slate-100 dark:border-white/10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0 border-2 border-indigo-200 dark:border-indigo-500/40 overflow-hidden shadow-md">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.displayName || user?.email || 'A'}&backgroundColor=4f46e5&textColor=ffffff`} alt="Avatar" className="w-full h-full object-cover" />
              )}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{user?.displayName || "My Profile"}</h1>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">{user?.role} Account</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            {message.text && (
              <div className={`p-4 rounded-xl text-sm font-bold ${message.type === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'}`}>
                {message.text}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full bg-slate-100 dark:bg-black border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Phone Number</label>
              <input
                type="tel"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                className="w-full bg-slate-100 dark:bg-black border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-900 dark:text-white"
                placeholder="e.g. +91"
              />
            </div>

            {user?.role === 'student' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-black border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-900 dark:text-white"
                    placeholder="e.g. Computer Science"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Roll Number</label>
                  <input
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-black border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-900 dark:text-white"
                    placeholder="e.g. 12345678"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-100 dark:bg-black border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-900 dark:text-white resize-none"
                    placeholder="Tell us a bit about yourself..."
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email <span className="text-slate-400 font-normal">(Cannot be changed)</span></label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                className="w-full bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/5 rounded-2xl px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-4 rounded-full bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-400 text-white font-black tracking-wide shadow-[0_8px_30px_rgb(79,70,229,0.3)] dark:shadow-[0_8px_30px_rgb(99,102,241,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:scale-100"
            >
              <span className="text-base lowercase first-letter:uppercase">
                {loading ? 'Saving details...' : 'Save profile details'}
              </span>
            </button>

          </form>
        </div>
      </main>
    </div>
  );
}
