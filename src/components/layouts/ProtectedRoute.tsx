
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  
  console.log('ProtectedRoute check:', { 
    user: !!user, 
    profile: profile?.role, 
    loading, 
    allowedRoles 
  });
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If no user is logged in, redirect to login
  if (!user) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // If user is logged in but no profile exists, redirect to login
  if (!profile) {
    console.log('No profile found, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // If user has a role but it's not in the allowed roles, redirect to their correct dashboard
  if (!allowedRoles.includes(profile.role)) {
    console.log('Role mismatch:', profile.role, 'allowed:', allowedRoles);
    
    // Redirect to the correct dashboard based on user role
    const dashboardMap = {
      admin: '/admin-dashboard',
      host: '/host-dashboard',
      user: '/user-dashboard'
    };
    
    const correctDashboard = dashboardMap[profile.role];
    if (correctDashboard) {
      return <Navigate to={correctDashboard} replace />;
    }
    
    // If no valid role, redirect to login
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Specific route components for different roles
export const AdminRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute allowedRoles={["admin"]}>{children}</ProtectedRoute>
);

export const HostRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute allowedRoles={["host"]}>{children}</ProtectedRoute>
);

export const UserRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute allowedRoles={["user"]}>{children}</ProtectedRoute>
);
