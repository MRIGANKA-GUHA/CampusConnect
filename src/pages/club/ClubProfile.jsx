import { useState, useEffect, useRef } from 'react';
import SmartHeader from '../../components/SmartHeader';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Save, Loader2, Globe, Link2, Upload, CheckCircle2, Camera, User, Sparkles, Image as ImageIcon
} from 'lucide-react';

export default function ClubProfile() {
  const { updateUser } = useAuth();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    description: '',
    tagline: '',
    instagram: '',
    linkedin: '',
    website: ''
  });

  const logoInputRef = useRef(null);
  const coverInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/club/profile');
        const c = res.data.club;
        setClub(c);
        if (c.logoURL) {
          updateUser({ photoURL: c.logoURL });
        }
        setForm({
          description: c.description || '',
          tagline: c.tagline || '',
          instagram: c.socialLinks?.instagram || '',
          linkedin: c.socialLinks?.linkedin || '',
          website: c.socialLinks?.website || ''
        });
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/club/profile', {
        description: form.description,
        tagline: form.tagline,
        socialLinks: {
          instagram: form.instagram,
          linkedin: form.linkedin,
          website: form.website
        }
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/club/profile/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setClub(prev => ({ ...prev, logoURL: res.data.logoURL }));
      updateUser({ photoURL: res.data.logoURL });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/club/profile/cover', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setClub(prev => ({ ...prev, coverURL: res.data.coverURL }));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to upload cover banner');
    } finally {
      setUploadingCover(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
      <p className="text-slate-500 font-medium tracking-widest uppercase text-sm">Loading Club Profile...</p>
    </div>
  );

  const avatarSrc = club?.logoURL ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${club?.name || 'Club'}&backgroundColor=4f46e5&textColor=ffffff`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30 transition-colors duration-300">
      <SmartHeader />

      <main className="max-w-3xl mx-auto pt-24 sm:pt-32 px-4 sm:px-8 pb-16">
        
        {/* Main Profile Card Container */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-sm">

          {/* ── Cover Banner Header ── */}
          <div className="relative h-44 sm:h-56 bg-gradient-to-r from-slate-950 via-zinc-900 to-black overflow-hidden group border-b border-slate-200/50 dark:border-white/10">
            {!club?.coverURL && (
              <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
            )}
            {club?.coverURL && (
              <img src={club.coverURL} alt="Cover Banner" className="w-full h-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
              className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
            >
              {uploadingCover ? (
                <Loader2 className="w-7 h-7 text-white animate-spin" />
              ) : (
                <>
                  <ImageIcon className="w-5 h-5 text-white" />
                  <span className="text-white text-xs sm:text-sm font-extrabold tracking-wide">Update Cover Banner</span>
                </>
              )}
            </button>
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
          </div>

          {/* ── Header Avatar & Basic Info ── */}
          <div className="px-6 sm:px-10 pb-6 pt-0 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-6">
              
              {/* Overlapping Avatar */}
              <div className="relative shrink-0 group">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  disabled={uploadingLogo}
                  onChange={handleLogoUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />

                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white dark:border-[#0a0a0a] overflow-hidden shadow-2xl bg-slate-100 dark:bg-white/5">
                  <img src={avatarSrc} alt="Club Logo" className="w-full h-full object-cover" />
                  {uploadingLogo && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 pointer-events-none">
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                    </div>
                  )}
                </div>

                {!uploadingLogo && (
                  <div className="absolute bottom-1 right-1 bg-gradient-to-tr from-indigo-600 to-violet-500 text-white p-2 rounded-full shadow-lg ring-4 ring-white dark:ring-[#0a0a0a] z-10 group-hover:scale-110 transition-transform pointer-events-none">
                    <Camera className="w-4 h-4" strokeWidth={2.5} />
                  </div>
                )}
              </div>

              {/* Category Badge */}
              <span className="px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-widest rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                {club?.category || 'Technical Club'}
              </span>
            </div>

            {/* Club Name & Tagline */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {club?.name || 'Club Profile'}
              </h1>
              {form.tagline && (
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  "{form.tagline}"
                </p>
              )}
            </div>

            {/* Convenor Info Bar */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 mb-8">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Convenor: <strong className="text-slate-900 dark:text-white font-extrabold">{club?.convenorName || '—'}</strong></span>
              </div>
              {club?.convenorEmail && (
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{club.convenorEmail}</span>
              )}
            </div>

            {/* ── Form Inputs ── */}
            <form onSubmit={handleSave} className="flex flex-col gap-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">Tagline</label>
              <input
                type="text"
                name="tagline"
                value={form.tagline}
                onChange={handleChange}
                placeholder="e.g. Building tomorrow's tech leaders"
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-white/15 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm"
              />
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-2 ml-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Tell students about your club's vision, activities, and achievements..."
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-white/15 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-900 dark:text-white resize-none placeholder-slate-400 dark:placeholder-slate-500 text-sm"
              />
            </div>

            {/* Social Links */}
            <div className="space-y-4 pt-2">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 ml-1">Social & Web Links</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Instagram */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Instagram</label>
                  <input
                    type="text"
                    name="instagram"
                    value={form.instagram}
                    onChange={handleChange}
                    placeholder="https://instagram.com/..."
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-white/15 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>

                {/* LinkedIn */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">LinkedIn</label>
                  <input
                    type="text"
                    name="linkedin"
                    value={form.linkedin}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/..."
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-white/15 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Official Website</label>
                  <input
                    type="text"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-white/15 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>

              </div>
            </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-3.5 sm:py-4 rounded-2xl transition-all shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:scale-95 mt-4 text-sm sm:text-base"
              >
                {saving ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Saving Changes...</>
                ) : success ? (
                  <><CheckCircle2 className="w-5 h-5 text-emerald-300" /> Saved Successfully!</>
                ) : (
                  <><Save className="w-5 h-5" /> Save Changes</>
                )}
              </button>
            </form>

          </div>
        </div>
      </main>
    </div>
  );
}
