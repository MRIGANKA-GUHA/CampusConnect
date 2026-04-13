import { Outlet } from 'react-router-dom';
import SmartHeader from '../components/SmartHeader';

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-black transition-colors duration-500 font-sans text-slate-900 dark:text-gray-100 relative">
      <SmartHeader />
      {/* Added pt-28 to account for the fixed floating header */}
      <main className="flex-1 w-full relative z-0">
        <Outlet />
      </main>
    </div>
  );
}
