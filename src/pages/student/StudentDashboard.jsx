import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  LogOut, User, Mail, Hash, BookOpen, Shield, Calendar,
  Bell, ClipboardList, Users, Megaphone, ChevronRight, Settings
} from 'lucide-react';
import SmartHeader from '../../components/SmartHeader';

const QuickLinkCard = ({ icon: Icon, label, description, to, color }) => (
  <Link
    to={to}
    className={`group flex items-center gap-5 p-5 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-2xl hover:shadow-md dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all duration-200 hover:border-${color}-200 dark:hover:border-${color}-500/30`}
  >
    <div className={`w-12 h-12 rounded-xl bg-${color}-50 dark:bg-${color}-500/10 flex items-center justify-center shrink-0 border border-${color}-100 dark:border-${color}-500/20 group-hover:scale-110 transition-transform`}>
      <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{label}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{description}</p>
    </div>
    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 group-hover:translate-x-1 transition-all shrink-0" />
  </Link>
);

const InfoRow = ({ icon: Icon, label, value, iconColor = 'indigo' }) => (
  <div className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors rounded-xl">
    <div className={`w-10 h-10 rounded-xl bg-${iconColor}-50 dark:bg-${iconColor}-500/10 flex items-center justify-center shrink-0 border border-${iconColor}-100 dark:border-${iconColor}-500/20`}>
      <Icon className={`w-4 h-4 text-${iconColor}-600 dark:text-${iconColor}-400`} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</p>
      <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate mt-0.5">{value || 'Not provided'}</p>
    </div>
  </div>
);

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) return null;

  const avatarSrc = user.photoURL ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName || user.email}&backgroundColor=4f46e5&textColor=ffffff`;

  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : 'N/A';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-sans">
      <SmartHeader />

      <main className="max-w-6xl mx-auto pt-28 sm:pt-36 px-4 sm:px-8 pb-16">

        {/* ── Welcome Banner ── */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-indigo-100 dark:border-indigo-500/30 shadow-lg shrink-0">
            <img src={avatarSrc} alt={user.displayName} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-1">Welcome back</p>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {user.displayName || 'Student'} 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {user.role === 'convenor' ? 'Club Convenor' : 'Student'} · Joined {joinedDate}
            </p>
            {user.isVerified && (
              <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                <Shield className="w-3 h-3" /> Verified Account
              </span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/20 transition-all text-sm font-bold shrink-0"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left Column: Profile Info ── */}
          <div className="lg:col-span-1 flex flex-col gap-6">

            {/* Profile Card */}
            <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden">
              <div className="px-6 pt-6 pb-2 border-b border-slate-100 dark:border-white/5">
                <h2 className="font-black text-slate-900 dark:text-white text-base">Profile Details</h2>
              </div>
              <div className="p-3">
                <InfoRow icon={Mail} label="Email" value={user.email} iconColor="sky" />
                <InfoRow icon={Hash} label="Roll No" value={user.rollNo} iconColor="indigo" />
                <InfoRow icon={BookOpen} label="Department" value={user.department} iconColor="purple" />
                <InfoRow icon={Calendar} label="Member Since" value={joinedDate} iconColor="slate" />
              </div>
              <div className="px-5 pb-5">
                <Link
                  to="/profile"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 font-bold text-sm hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                >
                  <Settings className="w-4 h-4" /> Edit Profile
                </Link>
              </div>
            </div>

            {/* Role Badge */}
            <div className={`p-5 rounded-2xl border flex items-center gap-4 ${
              user.role === 'convenor'
                ? 'bg-purple-50 dark:bg-purple-500/5 border-purple-100 dark:border-purple-500/10'
                : 'bg-indigo-50 dark:bg-indigo-500/5 border-indigo-100 dark:border-indigo-500/10'
            }`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                user.role === 'convenor'
                  ? 'bg-purple-100 dark:bg-purple-500/20'
                  : 'bg-indigo-100 dark:bg-indigo-500/20'
              }`}>
                <Shield className={`w-5 h-5 ${
                  user.role === 'convenor' ? 'text-purple-600 dark:text-purple-400' : 'text-indigo-600 dark:text-indigo-400'
                }`} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Your Role</p>
                <p className={`font-black text-lg capitalize ${
                  user.role === 'convenor' ? 'text-purple-700 dark:text-purple-300' : 'text-indigo-700 dark:text-indigo-300'
                }`}>{user.role || 'Student'}</p>
              </div>
            </div>

          </div>

          {/* ── Right Column: Quick Actions ── */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Quick Links */}
            <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden">
              <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-white/5">
                <h2 className="font-black text-slate-900 dark:text-white text-base">Quick Access</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Navigate to key sections</p>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <QuickLinkCard
                  icon={Bell}
                  label="Notices"
                  description="View latest announcements"
                  to="/notices"
                  color="amber"
                />
                <QuickLinkCard
                  icon={Users}
                  label="Clubs"
                  description="Browse and join clubs"
                  to="/clubs"
                  color="indigo"
                />
                <QuickLinkCard
                  icon={ClipboardList}
                  label="Events"
                  description="Upcoming and past events"
                  to="/events"
                  color="emerald"
                />
                <QuickLinkCard
                  icon={Megaphone}
                  label="Announcements"
                  description="Important updates for you"
                  to="/announcements"
                  color="rose"
                />
              </div>
            </div>

            {/* Motivational Quote */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10 border border-indigo-100 dark:border-indigo-500/15 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium italic leading-relaxed max-w-md mx-auto">
                "Small steps today, big strides tomorrow. Your CampusConnect journey is just getting started!"
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
