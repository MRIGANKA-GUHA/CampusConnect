import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logoUrl from '../assets/images/technoLogo.png';
import ThemeSwitch from './ThemeSwitch';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Floating Pill Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 pb-2 px-3 pointer-events-none bg-slate-50 dark:bg-black transition-colors duration-300">
        <header className="pointer-events-auto w-full max-w-6xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-full h-14 sm:h-16 flex items-center justify-between px-3 sm:px-5 transition-all duration-300">

          {/* Logo and Name */}
          <Link to="/" className="flex items-center gap-2.5 group" onClick={() => setMenuOpen(false)}>
            <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <img src={logoUrl} alt="CampusConnect Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-base sm:text-xl font-extrabold bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 bg-clip-text text-transparent dark:bg-none dark:bg-clip-border dark:text-white tracking-tight">
              CampusConnect
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center justify-center gap-8 font-medium text-sm text-slate-600 dark:text-slate-300">
            <a href="#home" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Home</a>
            <a href="#convenors" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Convenors</a>
            <a href="#events" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Events</a>
          </nav>

          {/* Right Side Controls */}
          <div className="flex items-center gap-1 sm:gap-3">
            <ThemeSwitch />

            {/* Desktop Auth Buttons */}
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hidden md:block px-4 py-2 rounded-full hover:bg-slate-100/50 dark:hover:bg-white/10 transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-black hidden md:block px-5 py-2 rounded-full hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-all shadow-md"
            >
              Get Started
            </Link>

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
          <a
            href="#home"
            onClick={() => setMenuOpen(false)}
            className="text-base font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 px-2 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            Home
          </a>
          <a
            href="#convenors"
            onClick={() => setMenuOpen(false)}
            className="text-base font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 px-2 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            Convenors
          </a>
          <a
            href="#events"
            onClick={() => setMenuOpen(false)}
            className="text-base font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 px-2 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            Events
          </a>

          <div className="border-t border-slate-100 dark:border-white/10 pt-3 flex flex-col gap-2">
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="w-full text-center text-sm font-semibold text-slate-700 dark:text-slate-200 py-3 rounded-2xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/register"
              onClick={() => setMenuOpen(false)}
              className="w-full text-center text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-black py-3 rounded-2xl hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors shadow-md"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
