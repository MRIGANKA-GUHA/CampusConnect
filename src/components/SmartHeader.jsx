import { useAuth } from '../context/AuthContext';
import AdminHeader from './AdminHeader';
import Header from './Header';

/**
 * SmartHeader — Renders AdminHeader for admins, public Header for everyone else.
 * Use this on all shared pages (Profile, Dashboard, etc.) so the
 * header never changes mid-session regardless of navigation.
 */
export default function SmartHeader() {
  const { user } = useAuth();
  return user?.role === 'admin' ? <AdminHeader /> : <Header />;
}
