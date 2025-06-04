
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
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (profile && !allowedRoles.includes(profile.role)) {
    // Redirect based on user role if they don't have access
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    
    // Default redirects based on role
    if (profile.role === "admin") {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (profile.role === "host") {
      return <Navigate to="/host-dashboard" replace />;
    } else {
      return <Navigate to="/user-dashboard" replace />;
    }
  }
  
  return <>{children}</>;
};

// Specific route components for different roles
export const AdminRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute allowedRoles={["admin"]}>{children}</ProtectedRoute>
);

export const HostRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute allowedRoles={["host", "admin"]}>{children}</ProtectedRoute>
);

export const UserRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute allowedRoles={["user", "admin"]}>{children}</ProtectedRoute>
);
