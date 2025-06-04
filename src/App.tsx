
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminRoute, HostRoute, UserRoute } from "./components/layouts/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Features from "./pages/Features";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import HostDashboard from "./pages/HostDashboard";
import HostEvents from "./pages/host/HostEvents";
import HostGuests from "./pages/host/HostGuests";
import HostCalendar from "./pages/host/HostCalendar";
import HostSettings from "./pages/host/HostSettings";
import CheckIn from "./pages/host/CheckIn";
import UserDashboard from "./pages/UserDashboard";
import ResetPassword from "./pages/ResetPassword";
import Event from "./pages/Event";
import PublicEvents from "./pages/PublicEvents";
import GuestPortal from "./components/events/GuestPortal";
import GuestCheckInConfirmation from "./pages/GuestCheckInConfirmation";
import HostWhatsApp from "./pages/host/HostWhatsApp";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/features" element={<Features />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/event/:id" element={<Event />} />
            <Route path="/events" element={<PublicEvents />} />
            <Route path="/guest-portal/:id" element={<GuestPortal />} />
            <Route path="/check-in/:eventId/:rsvpId" element={<GuestCheckInConfirmation />} />
            
            <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/host-dashboard" element={<HostRoute><HostDashboard /></HostRoute>} />
            <Route path="/host-dashboard/events" element={<HostRoute><HostEvents /></HostRoute>} />
            <Route path="/host-dashboard/guests" element={<HostRoute><HostGuests /></HostRoute>} />
            <Route path="/host-dashboard/calendar" element={<HostRoute><HostCalendar /></HostRoute>} />
            <Route path="/host-dashboard/settings" element={<HostRoute><HostSettings /></HostRoute>} />
            <Route path="/host-dashboard/whatsapp" element={<HostRoute><HostWhatsApp /></HostRoute>} />
            <Route path="/host-dashboard/check-in/:eventId" element={<HostRoute><CheckIn /></HostRoute>} />
            <Route path="/user-dashboard" element={<UserRoute><UserDashboard /></UserRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
