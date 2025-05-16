
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import HostDashboard from "./pages/HostDashboard";
import UserDashboard from "./pages/UserDashboard";
import Features from "./pages/Features";
import FAQ from "./pages/FAQ";
import Pricing from "./pages/Pricing";
import Testimonials from "./pages/Testimonials";
import NotFound from "./pages/NotFound";
import Event from "./pages/Event";
import PublicEvents from "./pages/PublicEvents";
import GuestCheckInConfirmation from "./pages/GuestCheckInConfirmation";

// Host Dashboard Pages
import CheckIn from "./pages/host/CheckIn";
import HostCalendar from "./pages/host/HostCalendar";
import HostEvents from "./pages/host/HostEvents";
import HostGuests from "./pages/host/HostGuests";
import HostSettings from "./pages/host/HostSettings";
import WhatsAppDashboard from "./pages/host/WhatsAppDashboard"; // New import

// Toaster
import { Toaster } from "@/components/ui/toaster";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/host-dashboard" element={<HostDashboard />} />
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/features" element={<Features />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/event/:eventId" element={<Event />} />
            <Route path="/events" element={<PublicEvents />} />
            <Route path="/check-in-confirmation/:eventId" element={<GuestCheckInConfirmation />} />
            
            {/* Host Dashboard Pages */}
            <Route path="/host/checkin/:eventId" element={<CheckIn />} />
            <Route path="/host/calendar" element={<HostCalendar />} />
            <Route path="/host/events" element={<HostEvents />} />
            <Route path="/host/guests" element={<HostGuests />} />
            <Route path="/host/settings" element={<HostSettings />} />
            <Route path="/host/whatsapp" element={<WhatsAppDashboard />} /> {/* New Route */}
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
