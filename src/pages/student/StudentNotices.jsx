import React from 'react';
import SmartHeader from '../../components/SmartHeader';
import { Bell } from 'lucide-react';

export default function StudentNotices() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-sans selection:bg-amber-500/30">
      <SmartHeader />
      
      <main className="max-w-7xl mx-auto pt-32 sm:pt-40 px-6 sm:px-8 pb-12 flex flex-col items-center justify-center">
        <div className="relative group overflow-hidden">
          <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-[3rem] blur-2xl opacity-20 dark:opacity-10 group-hover:opacity-30 transition-opacity duration-500 animate-pulse" />
          
          <div className="relative bg-white/70 dark:bg-white/[0.05] backdrop-blur-[100px] rounded-[3rem] border border-white/40 dark:border-white/10 p-12 sm:p-24 shadow-2xl text-center max-w-2xl">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-amber-50 dark:bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white dark:border-white/10 shadow-inner">
              <Bell className="w-10 h-10 sm:w-12 sm:h-12 text-amber-600 dark:text-amber-400" />
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">
              Student Notices <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">Coming Soon</span>
            </h1>
            
            <p className="text-slate-500 dark:text-slate-400 text-base sm:text-xl font-medium max-w-md mx-auto leading-relaxed">
              Stay informed with the latest official announcements, circulars, and updates from the campus administration.
            </p>
            
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="h-1.5 w-32 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-1/2 animate-[loading_2.5s_ease-in-out_infinite]" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-500 dark:text-amber-400">Broadcasting soon</span>
            </div>
          </div>
        </div>
      </main>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}
