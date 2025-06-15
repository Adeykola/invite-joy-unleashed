
import { ReactNode, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  ChevronDown,
  MessageSquare,
  UserCheck,
  CheckSquare,
  Eye
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

interface HostDashboardLayoutProps {
  children: ReactNode;
}

const HostDashboardLayout = ({ children }: HostDashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, signOut } = useAuth();

  const navItems = [
    {
      name: "Overview",
      href: "/host-dashboard/overview",
      icon: <Eye className="h-5 w-5 text-green-700" />,
    },
    {
      name: "My Events",
      href: "/host-dashboard/events",
      icon: <Calendar className="h-5 w-5 text-green-700" />,
    },
    {
      name: "Guest Management",
      href: "/host-dashboard/guests",
      icon: <Users className="h-5 w-5 text-yellow-700" />,
    },
    {
      name: "Calendar",
      href: "/host-dashboard/calendar",
      icon: <Calendar className="h-5 w-5 text-yellow-700" />,
    },
    {
      name: "Check-in",
      href: "/host-dashboard/check-in",
      icon: <CheckSquare className="h-5 w-5 text-green-700" />,
    },
    {
      name: "WhatsApp",
      href: "/host-dashboard/whatsapp",
      icon: <MessageSquare className="h-5 w-5 text-green-500" />,
    },
    {
      name: "Settings",
      href: "/host-dashboard/settings",
      icon: <Settings className="h-5 w-5 text-yellow-600" />,
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
    <div className="flex h-screen bg-yellow-50">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex w-64 flex-col">
          <div className="flex flex-col flex-grow border-r border-green-200 bg-white pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <Link to="/" className="text-xl font-bold text-green-700">RSVPlatform</Link>
            </div>
            <div className="mt-8 flex-grow flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      location.pathname === item.href
                        ? "bg-green-50 text-green-700 font-semibold"
                        : "text-yellow-700 hover:bg-green-100 hover:text-green-800",
                      "group flex items-center px-2 py-2 text-sm rounded-md transition-colors"
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
                className="w-full justify-start border-green-400 text-green-700 hover:text-yellow-700 hover:border-yellow-400"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-5 w-5 text-yellow-600" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="w-[240px] sm:w-[300px] p-0 bg-yellow-50">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <Link to="/" className="text-xl font-bold text-green-700" onClick={() => setIsSidebarOpen(false)}>RSVPlatform</Link>
              <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(false)}>
                <X className="h-5 w-5 text-yellow-700" />
              </Button>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    location.pathname === item.href
                      ? "bg-green-50 text-green-700 font-semibold"
                      : "text-yellow-700 hover:bg-green-100 hover:text-green-800",
                    "group flex items-center px-3 py-3 text-base rounded-md transition-colors"
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
                className="w-full justify-start border-green-400 text-green-700 hover:text-yellow-700 hover:border-yellow-400"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-5 w-5 text-yellow-600" />
                Logout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <div className="flex-shrink-0 flex h-16 bg-white border-b border-yellow-200">
          <button
            type="button"
            className="md:hidden px-4 border-r border-yellow-200 text-yellow-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-600"
            onClick={() => setIsSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6 text-green-700" />
          </button>
          <div className="flex-1 flex justify-between px-4 md:px-0">
            <div className="flex-1 flex md:ml-6 items-center">
              <h1 className="text-lg font-semibold text-green-700 md:ml-6">
                Host Dashboard
              </h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              <Button variant="ghost" size="icon" className="rounded-full text-yellow-500">
                <Bell className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-1">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-green-700" />
                    </div>
                    <ChevronDown className="h-4 w-4 text-yellow-700" />
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
                  <DropdownMenuItem className="text-yellow-700" onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="flex-1 overflow-auto p-4 md:p-6 bg-yellow-50">
          {children}
        </div>
      </div>
    </div>
  );
};

export default HostDashboardLayout;

