
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

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
      <AuthProvider>
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
            
            {/* Protected user routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } />
            
            {/* Protected host routes */}
            <Route path="/host" element={
              <ProtectedRoute requiredRole="host">
                <HostDashboard />
              </ProtectedRoute>
            } />
            <Route path="/host/events" element={
              <ProtectedRoute requiredRole="host">
                <HostEvents />
              </ProtectedRoute>
            } />
            <Route path="/host/calendar" element={
              <ProtectedRoute requiredRole="host">
                <HostCalendar />
              </ProtectedRoute>
            } />
            <Route path="/host/check-in" element={
              <ProtectedRoute requiredRole="host">
                <CheckIn />
              </ProtectedRoute>
            } />
            <Route path="/host/guests" element={
              <ProtectedRoute requiredRole="host">
                <HostGuests />
              </ProtectedRoute>
            } />
            <Route path="/host/settings" element={
              <ProtectedRoute requiredRole="host">
                <HostSettings />
              </ProtectedRoute>
            } />
            <Route path="/host/whatsapp" element={
              <ProtectedRoute requiredRole="host">
                <WhatsAppDashboard />
              </ProtectedRoute>
            } />
            
            {/* Protected admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
