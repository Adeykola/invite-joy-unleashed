import { ReactNode, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  Mail, 
  Shield, 
  Database,
  UserPlus,
  Globe,
  MapPin,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  ChevronDown,
  MessageSquare,
  UserCheck,
  Zap
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface AdminDashboardLayoutProps {
  children: ReactNode;
}

const AdminDashboardLayout = ({ children }: AdminDashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, signOut } = useAuth();

  // Insert "Send Test Invitation" into the navItems after "Communications"
  const navItems = [
    {
      name: "Dashboard",
      href: "/admin-dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Analytics",
      href: "/admin-dashboard/analytics",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      name: "Seating",
      href: "/admin-dashboard/seating", 
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      name: "Users Management",
      href: "/admin-dashboard/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "User Roles",
      href: "/admin-dashboard/roles",
      icon: <UserCheck className="h-5 w-5" />,
    },
    {
      name: "Communications",
      href: "/admin-dashboard/communications",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      name: "Send Test Invitation",
      href: "/admin-dashboard/send-test-invitation",
      icon: <Mail className="h-5 w-5" />,
    },
    {
      name: "System Health",
      href: "/admin-dashboard/system",
      icon: <Database className="h-5 w-5" />,
    },
    {
      name: "Security",
      href: "/admin-dashboard/security",
      icon: <Shield className="h-5 w-5" />,
    },
    {
      name: "Integrations",
      href: "/admin-dashboard/integrations",
      icon: <Zap className="h-5 w-5" />,
    },
    {
      name: "Settings",
      href: "/admin-dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out successfully",
        description: "Redirecting to home page...",
      });
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex w-64 flex-col">
          <div className="flex flex-col flex-grow border-r border-gray-200 bg-white pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <Link to="/" className="text-xl font-bold text-indigo-600">RSVPlatform</Link>
            </div>
            <div className="mt-8 flex-grow flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      location.pathname === item.href
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600",
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
                    )}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </Link>
                ))}
              </nav>
            </div>
            <div className="px-2 mt-4">
              <Button 
                variant="outline" 
                className="w-full justify-start text-gray-600 hover:text-indigo-600"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="w-[240px] sm:w-[300px] p-0">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <Link to="/" className="text-xl font-bold text-indigo-600" onClick={() => setIsSidebarOpen(false)}>RSVPlatform</Link>
              <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    location.pathname === item.href
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600",
                    "group flex items-center px-3 py-3 text-base font-medium rounded-md transition-colors"
                  )}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t">
              <Button 
                variant="outline" 
                className="w-full justify-start text-gray-600 hover:text-indigo-600"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <div className="flex-shrink-0 flex h-16 bg-white border-b border-gray-200">
          <button
            type="button"
            className="md:hidden px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setIsSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 flex justify-between px-4 md:px-0">
            <div className="flex-1 flex md:ml-6 items-center">
              <h1 className="text-lg font-semibold text-gray-800 md:ml-6">
                Admin Dashboard
              </h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-1">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-indigo-600" />
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {profile?.full_name || user?.email || 'My Account'}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
