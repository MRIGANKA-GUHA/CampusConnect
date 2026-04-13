import { useAuth } from '../context/AuthContext';
import AdminHeader from './AdminHeader';
import StudentHeader from './StudentHeader';
import Header from './Header';

/**
 * SmartHeader — Renders AdminHeader for admins, StudentHeader for logged in students/convenors,
 * and public Header for non-logged in users.
 * Use this on all shared pages (Profile, Dashboard, etc.) so the
 * header never changes mid-session regardless of navigation.
 */
export default function SmartHeader() {
  const { user } = useAuth();
  
  if (!user) return <Header />;
  if (user.role === 'admin') return <AdminHeader />;
  return <StudentHeader />;
}
