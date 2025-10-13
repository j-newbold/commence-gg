import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ProfileGuard({ children }: { children: any }) {
  const { session, profile } = useAuth();
  const location = useLocation();

  if (session && !profile?.tag) {
    return <Navigate to="/createprofile" state={{ previous: location.pathname }} replace />;
  }

  return children;
}