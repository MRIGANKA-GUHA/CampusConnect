import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full font-sans flex items-center justify-center py-8 sm:py-12 bg-slate-50 dark:bg-black selection:bg-indigo-500/30">

      {/* ── Top Bar ── */}
      <div className="absolute top-6 left-6 z-20">
        <Link to="/login" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors text-sm font-semibold bg-white/50 dark:bg-black/20 p-2 rounded-full backdrop-blur-md">
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      {/* ── Main Container ── */}
      <div className="relative z-10 w-full max-w-[480px] sm:max-w-[560px] md:max-w-[640px] mx-4 sm:mx-auto">

        {/* Glow behind card */}
        <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-b from-indigo-500/20 to-purple-500/0 blur-xl opacity-50 dark:opacity-20 pointer-events-none" />

        <div className="relative bg-white/70 dark:bg-white/[0.05] backdrop-blur-[100px] backdrop-saturate-[180%] rounded-[2.5rem] border border-white/40 dark:border-white/10 border-t-white/30 p-8 sm:p-12 shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)]">

          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Reset Password</h1>
            <p className="text-sm text-slate-500 mt-2">Enter your email to receive a password reset link.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-medium">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="flex flex-col items-center gap-4 animate-fade-up">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Check your email</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                  We've sent a password reset link to <br/>
                  <span className="font-semibold text-slate-900 dark:text-white">{email}</span>
                </p>
                <Link
                  to="/login"
                  className="w-full block text-center py-4 rounded-full bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-black tracking-wide shadow-lg shadow-indigo-600/20 transition-all"
                >
                  Return to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="University Email Address"
                className="w-full px-5 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm font-semibold"
              />

              <button
                type="submit"
                disabled={loading || !email}
                className="mt-4 w-full py-4 rounded-full bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-black tracking-wide shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
              </button>

              <p className="text-center text-xs font-medium text-slate-400 mt-4">
                Remember your password?{' '}
                <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
