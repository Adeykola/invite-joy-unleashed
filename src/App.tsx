
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Event from "./pages/Event";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import HostDashboard from "./pages/HostDashboard";
import UserDashboard from "./pages/UserDashboard";
import HostEvents from "./pages/host/HostEvents";
import HostGuests from "./pages/host/HostGuests";
import HostCalendar from "./pages/host/HostCalendar";
import CheckIn from "./pages/host/CheckIn";
import HostWhatsApp from "./pages/host/HostWhatsApp";
import HostAnalytics from "./pages/host/HostAnalytics";
import HostSettings from "./pages/host/HostSettings";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminCommunications from "./pages/admin/AdminCommunications";
import AdminSystem from "./pages/admin/AdminSystem";
import AdminSecurity from "./pages/admin/AdminSecurity";
import AdminIntegrations from "./pages/admin/AdminIntegrations";
import AdminRoles from "./pages/admin/AdminRoles";
import UserEvents from "./pages/user/UserEvents";
import UserProfile from "./pages/user/UserProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/event/:id" element={<Event />} />
            <Route path="/login" element={<Login />} />
            
            {/* Admin Dashboard Routes */}
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin-dashboard/analytics" element={<AdminAnalytics />} />
            <Route path="/admin-dashboard/events" element={<AdminEvents />} />
            <Route path="/admin-dashboard/users" element={<AdminUsers />} />
            <Route path="/admin-dashboard/roles" element={<AdminRoles />} />
            <Route path="/admin-dashboard/communications" element={<AdminCommunications />} />
            <Route path="/admin-dashboard/system" element={<AdminSystem />} />
            <Route path="/admin-dashboard/security" element={<AdminSecurity />} />
            <Route path="/admin-dashboard/integrations" element={<AdminIntegrations />} />
            <Route path="/admin-dashboard/settings" element={<AdminSettings />} />
            
            {/* Host Dashboard Routes */}
            <Route path="/host-dashboard" element={<HostDashboard />} />
            <Route path="/host-dashboard/analytics" element={<HostAnalytics />} />
            <Route path="/host-dashboard/events" element={<HostEvents />} />
            <Route path="/host-dashboard/guests" element={<HostGuests />} />
            <Route path="/host-dashboard/calendar" element={<HostCalendar />} />
            <Route path="/host-dashboard/check-in" element={<CheckIn />} />
            <Route path="/host-dashboard/whatsapp" element={<HostWhatsApp />} />
            <Route path="/host-dashboard/settings" element={<HostSettings />} />
            
            {/* User Dashboard Routes */}
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/user-dashboard/events" element={<UserEvents />} />
            <Route path="/user-dashboard/profile" element={<UserProfile />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
