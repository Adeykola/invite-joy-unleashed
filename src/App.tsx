import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminRoute, HostRoute, UserRoute } from "./components/layouts/ProtectedRoute";
import Index from "./pages/Index";
import Event from "./pages/Event";
import Features from "./pages/Features";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import HostDashboard from "./pages/HostDashboard";
import UserDashboard from "./pages/UserDashboard";
import HostOverview from "./pages/host/HostOverview";
import HostEvents from "./pages/host/HostEvents";
import HostGuests from "./pages/host/HostGuests";
import HostCalendar from "./pages/host/HostCalendar";
import CheckIn from "./pages/host/CheckIn";
import HostWhatsApp from "./pages/host/HostWhatsApp";
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
import UserFavorites from "./pages/user/UserFavorites";
import UserReviews from "./pages/user/UserReviews";
import PublicEvents from "./pages/PublicEvents";
import AdminSendTestInvitation from "./pages/admin/AdminSendTestInvitation";

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
            <Route path="/features" element={<Features />} />
            <Route path="/events" element={<PublicEvents />} />
            <Route path="/event/:id" element={<Event />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Admin Dashboard Routes - Protected */}
            <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin-dashboard/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
            <Route path="/admin-dashboard/events" element={<AdminRoute><AdminEvents /></AdminRoute>} />
            <Route path="/admin-dashboard/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin-dashboard/roles" element={<AdminRoute><AdminRoles /></AdminRoute>} />
            <Route path="/admin-dashboard/communications" element={<AdminRoute><AdminCommunications /></AdminRoute>} />
            <Route path="/admin-dashboard/send-test-invitation" element={<AdminRoute><AdminSendTestInvitation /></AdminRoute>} />
            <Route path="/admin-dashboard/system" element={<AdminRoute><AdminSystem /></AdminRoute>} />
            <Route path="/admin-dashboard/security" element={<AdminRoute><AdminSecurity /></AdminRoute>} />
            <Route path="/admin-dashboard/integrations" element={<AdminRoute><AdminIntegrations /></AdminRoute>} />
            <Route path="/admin-dashboard/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
            
            {/* Host Dashboard Routes - Protected */}
            <Route path="/host-dashboard" element={<HostRoute><HostDashboard /></HostRoute>} />
            <Route path="/host-dashboard/overview" element={<HostRoute><HostOverview /></HostRoute>} />
            <Route path="/host-dashboard/events" element={<HostRoute><HostEvents /></HostRoute>} />
            <Route path="/host-dashboard/guests" element={<HostRoute><HostGuests /></HostRoute>} />
            <Route path="/host-dashboard/calendar" element={<HostRoute><HostCalendar /></HostRoute>} />
            <Route path="/host-dashboard/check-in" element={<HostRoute><CheckIn /></HostRoute>} />
            <Route path="/host-dashboard/whatsapp" element={<HostRoute><HostWhatsApp /></HostRoute>} />
            <Route path="/host-dashboard/settings" element={<HostRoute><HostSettings /></HostRoute>} />
            
            {/* User Dashboard Routes - Protected */}
            <Route path="/user-dashboard" element={<UserRoute><UserDashboard /></UserRoute>} />
            <Route path="/user-dashboard/events" element={<UserRoute><UserEvents /></UserRoute>} />
            <Route path="/user-dashboard/profile" element={<UserRoute><UserProfile /></UserRoute>} />
            <Route path="/user-dashboard/favorites" element={<UserRoute><UserFavorites /></UserRoute>} />
            <Route path="/user-dashboard/reviews" element={<UserRoute><UserReviews /></UserRoute>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
