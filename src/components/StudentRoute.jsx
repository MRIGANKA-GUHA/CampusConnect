import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * StudentRoute - Protects student-specific pages.
 * Only allows users with roles 'student' or 'convenor'.
 * Admins are redirected to their admin dashboard.
 */
const StudentRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Not logged in at all → send to login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Redirect admin users to their own dashboard
  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  // Only allow students and convenors
  if (user.role !== 'student' && user.role !== 'convenor') {
    console.warn("Access denied: User is not a student or convenor", user);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default StudentRoute;
