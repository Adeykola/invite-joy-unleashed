
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/sonner";

// Page imports
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import ResetPassword from '@/pages/ResetPassword';
import NotFound from '@/pages/NotFound';
import HostEvents from '@/pages/host/HostEvents';
import HostDashboard from '@/pages/HostDashboard';
import HostCalendar from '@/pages/host/HostCalendar';
import CheckIn from '@/pages/host/CheckIn';
import HostGuests from '@/pages/host/HostGuests';
import HostSettings from '@/pages/host/HostSettings';
import WhatsAppDashboard from '@/pages/host/WhatsAppDashboard';
import UserDashboard from '@/pages/UserDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import Features from '@/pages/Features';
import Pricing from '@/pages/Pricing';
import FAQ from '@/pages/FAQ';
import Testimonials from '@/pages/Testimonials';
import Event from '@/pages/Event';
import PublicEvents from '@/pages/PublicEvents';
import GuestCheckInConfirmation from '@/pages/GuestCheckInConfirmation';

import './App.css';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/events" element={<PublicEvents />} />
          <Route path="/event/:eventId" element={<Event />} />
          <Route path="/check-in/confirmation" element={<GuestCheckInConfirmation />} />
          
          {/* User routes */}
          <Route path="/dashboard" element={<UserDashboard />} />
          
          {/* Host routes */}
          <Route path="/host" element={<HostDashboard />} />
          <Route path="/host/events" element={<HostEvents />} />
          <Route path="/host/calendar" element={<HostCalendar />} />
          <Route path="/host/check-in" element={<CheckIn />} />
          <Route path="/host/guests" element={<HostGuests />} />
          <Route path="/host/settings" element={<HostSettings />} />
          <Route path="/host/whatsapp" element={<WhatsAppDashboard />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
