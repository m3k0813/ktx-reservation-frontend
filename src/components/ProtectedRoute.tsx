import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute() {
  const { token, loading } = useAuth();
  if (loading) return <p className="loading-text">인증 확인 중...</p>;
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}


