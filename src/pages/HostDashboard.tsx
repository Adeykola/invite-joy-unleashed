
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, Settings, MessageCircle, Smartphone, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { WhatsAppConnection } from "@/components/whatsapp/WhatsAppConnection";

const HostDashboard = () => {
  const { user } = useAuth();

  // Fetch event stats
  const { data: eventStats } = useQuery({
    queryKey: ["event-stats", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data: events, error } = await supabase
        .from("events")
        .select("*, rsvps(response_status)")
        .eq("host_id", user.id);

      if (error) throw error;
      
      const total = events?.length || 0;
      const upcoming = events?.filter(event => new Date(event.date) > new Date()).length || 0;
      const totalRsvps = events?.reduce((acc, event) => acc + (event.rsvps?.length || 0), 0) || 0;
      const confirmedRsvps = events?.reduce((acc, event) => 
        acc + (event.rsvps?.filter((rsvp: any) => rsvp.response_status === 'confirmed').length || 0), 0) || 0;
      
      return { total, upcoming, totalRsvps, confirmedRsvps };
    },
    enabled: !!user?.id,
  });

  // Fetch WhatsApp session status
  const { data: whatsappSession } = useQuery({
    queryKey: ['whatsapp-session', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('whatsapp_sessions')
        .select('status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  return (
    <DashboardLayout userType="host">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Host Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your events and connect with guests</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{eventStats?.total || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{eventStats?.upcoming || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total RSVPs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{eventStats?.totalRsvps || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{eventStats?.confirmedRsvps || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button asChild className="w-full">
                  <Link to="/host-dashboard/events">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Manage Events
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/host-dashboard/guests">
                    <Users className="mr-2 h-4 w-4" />
                    View Guests
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/host-dashboard/calendar">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Calendar View
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/host-dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp Quick Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Smartphone className="w-5 h-5 mr-2 text-green-600" />
                WhatsApp Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Connection Status:</span>
                  <span className={`text-sm font-medium ${
                    whatsappSession?.status === 'connected' ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {whatsappSession?.status === 'connected' ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/host-dashboard/whatsapp">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Manage WhatsApp
                    </Link>
                  </Button>
                  {whatsappSession?.status === 'connected' && (
                    <Button asChild size="sm" className="w-full bg-green-600 hover:bg-green-700">
                      <Link to="/host-dashboard/whatsapp?tab=broadcasts">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Send Broadcast
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* WhatsApp Connection Widget */}
        {(!whatsappSession || whatsappSession.status !== 'connected') && (
          <WhatsAppConnection />
        )}
      </div>
    </DashboardLayout>
  );
};

export default HostDashboard;
