import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import logoUrl from '../assets/images/technoLogo.png';
import ThemeSwitch from './ThemeSwitch';
import { useAuth } from '../context/AuthContext';

/**
 * StudentHeader — Navigation bar exclusively for student/convenor pages.
 * Shows: Dashboard | Clubs | Events | Notices | Chat
 */
export default function StudentHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/');
  };

  const dashboardPath = '/student/dashboard';

  const navLinks = [
    { label: 'Clubs',   href: '/student/clubs' },
    { label: 'Events',  href: '/student/events' },
    { label: 'Notices', href: '/student/notices' },
    { label: 'Chat',    href: '/student/chat' },
  ];

  return (
    <>
      {/* Floating Pill Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 pb-2 px-3 pointer-events-none bg-slate-50 dark:bg-black transition-colors duration-300">
        <header className="pointer-events-auto w-full max-w-6xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-full h-14 sm:h-16 flex items-center justify-between px-3 sm:px-5 transition-all duration-300">

          {/* Logo and Name */}
          <Link to={dashboardPath} className="flex items-center gap-2.5 group hover:opacity-90 transition-opacity" onClick={() => setMenuOpen(false)}>
            <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <img src={logoUrl} alt="CampusConnect Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-base sm:text-xl font-extrabold bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 bg-clip-text text-transparent dark:bg-none dark:bg-clip-border dark:text-white tracking-tight">
              CampusConnect
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center justify-center gap-6 lg:gap-8 font-medium text-sm text-slate-600 dark:text-slate-300">
            <Link 
              to={dashboardPath} 
              className={`transition-colors font-bold ${location.pathname === dashboardPath ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
            >
              Dashboard
            </Link>
            {navLinks.map(({ label, href }) => {
              const isActive = location.pathname.startsWith(href);
              return (
                <Link
                  key={label}
                  to={href}
                  className={`transition-colors font-semibold ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right Side Controls */}
          <div className="flex items-center gap-1 sm:gap-3">
            <ThemeSwitch />

            {user && (
              <Link to="/profile" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-[1.5px] sm:border-2 border-slate-200 dark:border-white/10 overflow-hidden shrink-0 shadow-sm cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-500 hover:-translate-y-0.5 active:scale-95 transition-all bg-slate-100 dark:bg-white/5" title="My Profile">
                <img
                  src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName || user.email || 'Student'}&backgroundColor=4f46e5&textColor=ffffff`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </Link>
            )}

            {/* Logout (Desktop) */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-all border border-slate-200 dark:border-white/10"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Hamburger */}
            <button
              className="flex md:hidden items-center justify-center w-9 h-9 rounded-full bg-transparent hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-white transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="fixed top-[4.5rem] left-3 right-3 z-40 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/10 rounded-3xl shadow-xl p-5 flex flex-col gap-3 md:hidden">
          <Link 
            to={dashboardPath} 
            onClick={() => setMenuOpen(false)} 
            className={`text-base px-2 py-2.5 rounded-xl transition-all ${location.pathname === dashboardPath ? 'font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10' : 'font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
          >
            Dashboard
          </Link>
          {navLinks.map(({ label, href }) => {
            const isActive = location.pathname.startsWith(href);
            return (
              <Link
                key={label}
                to={href}
                onClick={() => setMenuOpen(false)}
                className={`text-base px-2 py-2.5 rounded-xl transition-all ${isActive ? 'font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10' : 'font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
              >
                {label}
              </Link>
            );
          })}

          <div className="border-t border-slate-100 dark:border-white/10 pt-3">
            <button
              onClick={handleLogout}
              className="w-full text-center text-sm font-bold text-red-600 dark:text-red-400 py-3 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 transition-all border border-slate-100 dark:border-white/10 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </>
  );
}
