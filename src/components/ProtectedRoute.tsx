
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'host' | 'admin';
  redirectTo?: string;
}

const ProtectedRoute = ({ 
  children, 
  requiredRole,
  redirectTo = '/login' 
}: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return; // Wait for auth to load

    if (!user) {
      navigate(redirectTo);
      return;
    }

    if (requiredRole && profile?.role !== requiredRole) {
      // Redirect based on actual user role
      if (profile?.role === 'admin') {
        navigate('/admin');
      } else if (profile?.role === 'host') {
        navigate('/host');
      } else {
        navigate('/dashboard');
      }
      return;
    }
  }, [user, profile, loading, navigate, requiredRole, redirectTo]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (requiredRole && profile?.role !== requiredRole) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
};

export default ProtectedRoute;
