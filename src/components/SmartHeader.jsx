import { useAuth } from '../context/AuthContext';
import AdminHeader from './AdminHeader';
import StudentHeader from './StudentHeader';
import ClubHeader from './ClubHeader';
import Header from './Header';

/**
 * SmartHeader — Renders the correct header based on the user's role:
 *   - admin  → AdminHeader
 *   - club   → ClubHeader
 *   - student/convenor → StudentHeader
 *   - not logged in → public Header
 */
export default function SmartHeader() {
  const { user } = useAuth();

  if (!user) return <Header />;
  if (user.role === 'admin') return <AdminHeader />;
  if (user.role === 'club')  return <ClubHeader />;
  return <StudentHeader />;
}
