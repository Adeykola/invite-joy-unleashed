
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export const ProtectedRoute = ({ children, allowedRoles, redirectTo }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  
  console.log('ProtectedRoute check:', { user: !!user, profile, loading, allowedRoles });
  
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
  
  // If user is logged in but no profile or role doesn't match, enforce strict role-based access
  if (!profile || !allowedRoles.includes(profile.role)) {
    console.log('Role mismatch or no profile:', profile?.role, 'allowed:', allowedRoles);
    
    // Strict redirect based on user role - no cross-access allowed
    if (profile?.role === "admin") {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (profile?.role === "host") {
      return <Navigate to="/host-dashboard" replace />;
    } else if (profile?.role === "user") {
      return <Navigate to="/user-dashboard" replace />;
    } else {
      // If no valid role, redirect to login
      return <Navigate to="/login" replace />;
    }
  }
  
  return <>{children}</>;
};

// Specific route components for different roles - now with strict separation
export const AdminRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute allowedRoles={["admin"]}>{children}</ProtectedRoute>
);

export const HostRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute allowedRoles={["host"]}>{children}</ProtectedRoute>
);

export const UserRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute allowedRoles={["user"]}>{children}</ProtectedRoute>
);
