import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { Loader2, Camera } from 'lucide-react';
import api from '../services/api';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [phoneNo, setPhoneNo] = useState(user?.phoneNo || '');
  const [rollNo, setRollNo] = useState(user?.rollNo || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // ── Save profile details ───────────────────────────────────────────────────
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await api.put('/auth/profile', { displayName, phoneNo, rollNo, bio, department });
      updateUser(response.data.user);
      setMessage({ type: 'success', text: response.data.message });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  // ── Upload profile picture ─────────────────────────────────────────────────
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 2MB' });
      return;
    }

    setUploading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.post('/auth/profile/picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser({ photoURL: response.data.photoURL });
      setMessage({ type: 'success', text: 'Profile picture updated!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to upload image' });
    } finally {
      setUploading(false);
      // Reset the input so the same file can be selected again
      e.target.value = '';
    }
  };

  const avatarSrc = user?.photoURL
    ? user.photoURL
    : `https://api.dicebear.com/7.x/initials/svg?seed=${user?.displayName || user?.email || 'A'}&backgroundColor=4f46e5&textColor=ffffff`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-sans transition-colors duration-300">
      <Header />

      <main className="max-w-2xl mx-auto pt-32 px-4 sm:px-8 pb-12">
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[1.5rem] sm:rounded-3xl p-6 sm:p-10 shadow-sm">

          {/* ── Avatar ── */}
          <div className="flex items-center gap-5 mb-8 pb-8 border-b border-slate-100 dark:border-white/10">
            <div className="relative shrink-0 group w-fit">
              {/* Hidden file input */}
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                disabled={uploading}
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
              
              {/* Avatar image container */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-[3px] border-indigo-100 dark:border-indigo-500/30 overflow-hidden shadow-xl group-hover:border-indigo-400 dark:group-hover:border-indigo-500 transition-colors">
                <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
                
                {/* Loading overlay inside the container */}
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 pointer-events-none">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
              </div>

              {/* Premium Edit Icon Badge */}
              {!uploading && (
                <div className="absolute bottom-0 right-0 bg-gradient-to-tr from-indigo-600 to-violet-500 text-white p-2 sm:p-2.5 rounded-full shadow-[0_4px_20px_rgb(99,102,241,0.5)] ring-4 ring-white dark:ring-[#13131a] z-10 group-hover:scale-110 transition-transform pointer-events-none">
                  <Camera className="w-4 h-4" strokeWidth={2.5} />
                </div>
              )}
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{user?.displayName || 'My Profile'}</h1>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">{user?.role} Account</p>
            </div>
          </div>

          {/* ── Feedback message ── */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-bold ${message.type === 'error'
              ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
              : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'}`}>
              {message.text}
            </div>
          )}

          {/* ── Profile form ── */}
          <form onSubmit={handleUpdateProfile} className="space-y-5">

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
                placeholder="e.g. +91 98765 43210"
                className="w-full bg-slate-100 dark:bg-black border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-900 dark:text-white"
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
                    placeholder="e.g. Computer Science"
                    className="w-full bg-slate-100 dark:bg-black border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Roll Number</label>
                  <input
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    placeholder="e.g. 12345678"
                    className="w-full bg-slate-100 dark:bg-black border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    placeholder="Tell us a bit about yourself..."
                    className="w-full bg-slate-100 dark:bg-black border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-900 dark:text-white resize-none"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                Email <span className="text-slate-400 font-normal">(Cannot be changed)</span>
              </label>
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
              className="w-full mt-2 py-4 rounded-full bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-400 text-white font-black tracking-wide shadow-[0_8px_30px_rgb(79,70,229,0.3)] dark:shadow-[0_8px_30px_rgb(99,102,241,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-70 disabled:hover:scale-100"
            >
              <span className="text-base">
                {loading ? 'Saving details...' : 'Save profile details'}
              </span>
            </button>

          </form>
        </div>
      </main>
    </div>
  );
}
