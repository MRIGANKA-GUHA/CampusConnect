import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/student/StudentDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentsPage from './pages/admin/StudentsPage';
import ProfilePage from './pages/ProfilePage';
import StudentClubs from './pages/student/StudentClubs';
import StudentEvents from './pages/student/StudentEvents';
import StudentNotices from './pages/student/StudentNotices';
import StudentChat from './pages/student/StudentChat';
import AdminClubs from './pages/admin/AdminClubs';
import AdminEvents from './pages/admin/AdminEvents';
import AdminNotices from './pages/admin/AdminNotices';
import AdminRoute from './components/AdminRoute';
import StudentRoute from './components/StudentRoute';
import ClubRoute from './components/ClubRoute';
import ClubDashboard from './pages/club/ClubDashboard';
import ClubProfile from './pages/club/ClubProfile';
import ClubEvents from './pages/club/ClubEvents';
import ClubNotices from './pages/club/ClubNotices';
import ClubMembers from './pages/club/ClubMembers';
import NotFound from './pages/NotFound';
import PublicEventPage from './pages/PublicEventPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// ─── Protected Route Component ─────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

// ─── Public Route Component (Redirects to dashboard if logged in) ───────────
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (user) {
    const dashboardPath =
      user.role === 'admin' ? '/admin'
      : user.role === 'club'  ? '/club/dashboard'
      : '/student/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};
// ─── Dashboard Redirect Component ──────────────────────────────────────────────
const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const dashboardPath =
    user.role === 'admin' ? '/admin'
    : user.role === 'club'  ? '/club/dashboard'
    : '/student/dashboard';
  return <Navigate to={dashboardPath} replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={
        <PublicRoute>
          <MainLayout />
        </PublicRoute>
      }>
        <Route index element={<HomePage />} />
      </Route>

      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />

      <Route path="/forgot-password" element={
        <PublicRoute>
          <ForgotPasswordPage />
        </PublicRoute>
      } />

      <Route path="/register" element={
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      } />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/dashboard"
        element={
          <StudentRoute>
            <StudentDashboard />
          </StudentRoute>
        }
      />

      {/* ─── QR Code Deep-link: /events/:eventId ──────────────────────── */}
      {/* PUBLIC — no login needed. Shows event info + Sign in to Register. */}
      <Route path="/events/:eventId" 
      element={
      <PublicEventPage />
      } />

      <Route
        path="/student/clubs"
        element={
          <StudentRoute>
            <StudentClubs />
          </StudentRoute>
        }
      />

      <Route
        path="/student/events"
        element={
          <StudentRoute>
            <StudentEvents />
          </StudentRoute>
        }
      />

      <Route
        path="/student/notices"
        element={
          <StudentRoute>
            <StudentNotices />
          </StudentRoute>
        }
      />

      <Route
        path="/student/chat"
        element={
          <StudentRoute>
            <StudentChat />
          </StudentRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/students"
        element={
          <AdminRoute>
            <StudentsPage />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/clubs"
        element={
          <AdminRoute>
            <AdminClubs />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/events"
        element={
          <AdminRoute>
            <AdminEvents />
          </AdminRoute>
        }
      />

      <Route 
        path="/admin/notices"
        element={
          <AdminRoute>
            <AdminNotices />
          </AdminRoute>
        }
      />

      {/* ─── Club Routes ─────────────────────────────────────── */}
      <Route path="/club/dashboard"
        element={
          <ClubRoute>
            <ClubDashboard />
          </ClubRoute>
        }
      />
      <Route path="/club/profile"
        element={
          <ClubRoute>
            <ClubProfile />
          </ClubRoute>
        }
      />
      <Route path="/club/events"
        element={
          <ClubRoute>
            <ClubEvents />
          </ClubRoute>
        }
      />
      <Route path="/club/notices"
        element={
          <ClubRoute>
            <ClubNotices />
          </ClubRoute>
        }
      />
      <Route path="/club/members"
        element={
          <ClubRoute>
            <ClubMembers />
          </ClubRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Analytics />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
