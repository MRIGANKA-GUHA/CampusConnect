import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
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
import NotFound from './pages/NotFound';
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
    const dashboardPath = user.role === 'admin' ? '/admin' : '/student/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};
// ─── Dashboard Redirect Component ──────────────────────────────────────────
const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const dashboardPath = user.role === 'admin' ? '/admin' : '/student/dashboard';
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
