
import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Calendar, Users, Settings, MessageSquare, BarChart3, Home } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  userType: "user" | "host" | "admin";
}

const DashboardLayout = ({ children, userType }: DashboardLayoutProps) => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getNavItems = () => {
    switch (userType) {
      case "admin":
        return [
          { href: "/admin", label: "Dashboard", icon: Home },
          { href: "/admin/users", label: "Users", icon: Users },
          { href: "/admin/events", label: "Events", icon: Calendar },
          { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
          { href: "/admin/settings", label: "Settings", icon: Settings },
        ];
      case "host":
        return [
          { href: "/host", label: "Dashboard", icon: Home },
          { href: "/host/events", label: "Events", icon: Calendar },
          { href: "/host/calendar", label: "Calendar", icon: Calendar },
          { href: "/host/guests", label: "Guests", icon: Users },
          { href: "/host/whatsapp", label: "WhatsApp", icon: MessageSquare },
          { href: "/host/settings", label: "Settings", icon: Settings },
        ];
      case "user":
      default:
        return [
          { href: "/dashboard", label: "Dashboard", icon: Home },
          { href: "/events", label: "Browse Events", icon: Calendar },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-indigo-600">
                EventManager
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {profile?.full_name || user?.email || 'User'}
              </span>
              <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">
                {profile?.role || userType}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen border-r">
          <div className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
