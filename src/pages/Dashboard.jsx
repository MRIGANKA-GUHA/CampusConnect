import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, User, Mail, Shield, ArrowLeft } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!user) return null;

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans bg-slate-50 dark:bg-black flex flex-col">


      {/* ── Top Nav ── */}
      <nav className="w-full px-8 py-6 flex justify-between items-center z-20">
        <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Site
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 transition-all text-sm font-bold"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </nav>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="relative rounded-3xl bg-white/70 dark:bg-white/[0.05] backdrop-blur-[100px] backdrop-saturate-[180%] border border-white/40 dark:border-white/10 border-t-white/30 p-10 shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center mb-4 border-4 border-white dark:border-white/10 shadow-xl overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                )}
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">Welcome, {user.displayName || 'Friend'}!</h1>
              <p className="text-slate-500 mt-1">Status: Logged in via {user.provider?.toUpperCase() || 'Firebase'}</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/8">
                <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Email Address</p>
                  <p className="text-slate-900 dark:text-white font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/8">
                <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">User ID</p>
                  <p className="text-slate-900 dark:text-white font-mono text-xs">{user.uid}</p>
                </div>
              </div>
            </div>

            <div className="mt-10 text-center">
              <p className="text-sm text-slate-500 italic max-w-sm mx-auto">
                "Small steps today, big strides tomorrow. Your CampusConnect journey has just begun!"
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
