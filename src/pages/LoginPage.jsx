import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(null);

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans flex items-center justify-center">

      {/* ── Animated Mesh Gradient Background ── */}
      <div className="absolute inset-0 -z-10 bg-slate-50 dark:bg-[#060608]">
        {/* Orb 1 */}
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full
          bg-gradient-to-br from-violet-400/30 to-indigo-400/20 dark:from-violet-600/20 dark:to-indigo-600/10
          blur-[80px] animate-pulse" style={{ animationDuration: '6s' }}
        />
        {/* Orb 2 */}
        <div className="absolute bottom-[-15%] right-[-5%] w-[700px] h-[700px] rounded-full
          bg-gradient-to-br from-indigo-300/25 to-purple-400/20 dark:from-indigo-600/15 dark:to-purple-600/10
          blur-[100px] animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }}
        />
        {/* Orb 3 */}
        <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] rounded-full
          bg-gradient-to-br from-sky-300/20 to-indigo-300/15 dark:from-sky-600/10 dark:to-indigo-600/5
          blur-[80px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }}
        />
      </div>

      {/* ── Top Bar ── */}
      <div className="absolute top-6 w-full px-8 flex justify-between items-center z-20">
        <Link to="/" className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>

      </div>

      {/* ── Main Glass Card ── */}
      <div className="relative z-10 w-full max-w-[560px] xl:max-w-[640px] mx-4 sm:mx-auto">

        {/* Decorative grid border card */}
        <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-indigo-400/50 via-violet-400/20 to-indigo-400/50 dark:from-indigo-500/30 dark:via-purple-500/10 dark:to-indigo-500/30 blur-[1px]" />

        {/* The actual glass card */}
        <div className="relative rounded-3xl bg-white/70 dark:bg-[#0e0e14]/80 backdrop-blur-2xl border border-white/80 dark:border-white/10 p-8 sm:p-12 shadow-2xl shadow-indigo-500/10 dark:shadow-black/50">

          {/* Brand + Title */}
          <div className="flex flex-col items-center mb-10">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Welcome back</h1>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Sign in to your account</p>
          </div>

          <form className="flex flex-col gap-5">
            {/* Email */}
            <div className={`group relative rounded-full transition-all duration-200 ${focused === 'email' ? 'ring-2 ring-indigo-500/40' : ''}`}>
              <label className={`absolute left-6 transition-all duration-200 pointer-events-none font-semibold top-2 text-[10px] text-indigo-600 dark:text-indigo-400 uppercase tracking-widest`}>
                Email
              </label>
              <input
                type="email"
                placeholder="you@college.edu"
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                className="w-full pt-6 pb-3 px-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/8 rounded-full text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors text-sm font-medium"
              />
            </div>

            {/* Password */}
            <div className={`group relative rounded-full transition-all duration-200 ${focused === 'password' ? 'ring-2 ring-indigo-500/40' : ''}`}>
              <label className="absolute left-6 transition-all duration-200 pointer-events-none font-semibold top-2 text-[10px] text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••"
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                className="w-full pt-6 pb-3 pl-6 pr-12 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/8 rounded-full text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors text-sm font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between px-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500/30" />
                <span className="text-sm text-slate-500 dark:text-slate-400">Remember me</span>
              </label>
              <a href="#" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
                Forgot password?
              </a>
            </div>

            {/* CTA */}
            <button
              type="submit"
              className="mt-2 w-full py-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold tracking-wide shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5 transition-all"
            >
              Sign In
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-slate-200 dark:bg-white/8" />
              <span className="text-xs text-slate-400 dark:text-slate-600 font-medium uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-white/8" />
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/8 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-sm font-semibold text-slate-700 dark:text-slate-300">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
              <button type="button" className="flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/8 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-sm font-semibold text-slate-700 dark:text-slate-300">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                GitHub
              </button>
            </div>

            {/* Sign up CTA box */}
            <div className="mt-2 p-4 rounded-full bg-slate-100/80 dark:bg-white/5 border border-slate-200 dark:border-white/8 text-center">
              <span className="text-sm text-slate-500 dark:text-slate-400">New here? </span>
              <Link to="/register" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
                Create an account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
