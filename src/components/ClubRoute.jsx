import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ClubRoute — Protects club-specific pages.
 * Only allows users with role "club".
 * Students → /student/dashboard | Admins → /admin
 */
const ClubRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;

  if (user.role !== 'club') {
    console.warn("Access denied: User is not a club account", user);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ClubRoute;
