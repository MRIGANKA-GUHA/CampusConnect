import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginWithEmail, loginWithGoogle, loginWithGithub } = useAuth();
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (providerFn) => {
    setError('');
    setLoading(true);
    try {
      await providerFn();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full font-sans flex items-center justify-center py-8 sm:py-12 bg-slate-50 dark:bg-black selection:bg-indigo-500/30">



      {/* ── Top Bar ── */}
      <div className="absolute top-6 left-6 z-20">
        <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors text-sm font-semibold bg-white/50 dark:bg-black/20 p-2 rounded-full backdrop-blur-md">
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      {/* ── Main Container ── */}
      <div className="relative z-10 w-full max-w-[480px] sm:max-w-[560px] md:max-w-[640px] mx-4 sm:mx-auto">

        {/* Glow behind card */}
        <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-b from-indigo-500/20 to-purple-500/0 blur-xl opacity-50 dark:opacity-20 pointer-events-none" />

        <div className="relative bg-white/70 dark:bg-white/[0.05] backdrop-blur-[100px] backdrop-saturate-[180%] rounded-[2.5rem] border border-white/40 dark:border-white/10 border-t-white/30 p-8 sm:p-12 shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)]">

          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Welcome back</h1>
            <p className="text-sm text-slate-500 mt-2">Sign in to your CampusConnect account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-medium">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">

            {/* Form Fields using robust squircle inputs */}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="University Email Address"
              className="w-full px-5 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm font-semibold"
            />

            <div className="relative w-full">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="w-full px-5 py-4 pr-12 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm font-semibold"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer select-none group">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" className="peer appearance-none w-[18px] h-[18px] rounded-[5px] border border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-[#13131a] checked:bg-indigo-600 dark:checked:bg-indigo-500 checked:border-indigo-600 dark:checked:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-1 dark:focus:ring-offset-[#060608] transition-all cursor-pointer m-0" />
                  <svg className="absolute w-[18px] h-[18px] p-1 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">Remember me</span>
              </label>
              <a href="#" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full py-4 rounded-full bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-black tracking-wide shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </button>

            {/* Fancy Divider */}
            <div className="flex items-center gap-4 my-2">
              <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Or continue with</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
            </div>

            {/* Social Oauth */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSocialLogin(loginWithGoogle)}
                className="flex items-center justify-center gap-3 py-3.5 bg-white dark:bg-[#13131a] border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-all text-sm font-bold text-slate-700 dark:text-slate-300 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSocialLogin(loginWithGithub)}
                className="flex items-center justify-center gap-3 py-3.5 bg-white dark:bg-[#13131a] border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-all text-sm font-bold text-slate-700 dark:text-slate-300 disabled:opacity-50"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                GitHub
              </button>
            </div>

            {/* Login Link Area */}
            <div className="mt-4 text-center">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">New here? </span>
              <Link to="/register" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 underline underline-offset-4 decoration-2 decoration-indigo-200 dark:decoration-indigo-900 transition-all">
                Create an account
              </Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
