import { Link } from 'react-router-dom';
import { Ghost } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="h-[80vh] flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-500">
      <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-8">
        <Ghost className="w-12 h-12 text-indigo-500" />
      </div>
      <h1 className="text-5xl font-black text-slate-900 mb-4">404</h1>
      <p className="text-xl text-slate-500 mb-8 max-w-md">Oops! We couldn't find the page you're looking for.</p>
      <Link to="/" className="bg-indigo-600 text-white px-8 py-3 rounded-full font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/30">
        Return Home
      </Link>
    </div>
  );
}
