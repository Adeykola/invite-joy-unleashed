
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CalendarDays, 
  Users, 
  Settings, 
  MessageCircle, 
  Smartphone, 
  BarChart3,
  Activity,
  CheckCircle,
  TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";
import HostDashboardLayout from "@/components/layouts/HostDashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { WhatsAppConnection } from "@/components/whatsapp/WhatsAppConnection";

const HostOverview = () => {
  const { user } = useAuth();

  // Fetch comprehensive stats combining dashboard and analytics
  const { data: overviewStats } = useQuery({
    queryKey: ["host-overview", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const [eventsResult, rsvpsResult] = await Promise.all([
        supabase
          .from("events")
          .select("id, created_at, title, date")
          .eq("host_id", user.id),
        supabase
          .from("rsvps")
          .select("id, response_status, created_at, event_id, events!inner(host_id)")
          .eq("events.host_id", user.id)
      ]);

      const events = eventsResult.data || [];
      const rsvps = rsvpsResult.data || [];

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const totalEvents = events.length;
      const upcomingEvents = events.filter(e => new Date(e.date) > now).length;
      const eventsThisMonth = events.filter(e => new Date(e.created_at) > thirtyDaysAgo).length;
      const totalRsvps = rsvps.length;
      const confirmedRsvps = rsvps.filter(r => r.response_status === 'confirmed').length;
      const pendingRsvps = rsvps.filter(r => r.response_status === 'pending').length;
      const conversionRate = rsvps.length > 0 ? Math.round((confirmedRsvps / rsvps.length) * 100) : 0;

      return {
        totalEvents,
        upcomingEvents,
        eventsThisMonth,
        totalRsvps,
        confirmedRsvps,
        pendingRsvps,
        conversionRate
      };
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
    <HostDashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
          <p className="text-gray-600 mt-2">Complete dashboard with analytics and quick actions</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overviewStats?.totalEvents || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{overviewStats?.eventsThisMonth || 0} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{overviewStats?.upcomingEvents || 0}</div>
              <p className="text-xs text-muted-foreground">Scheduled ahead</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total RSVPs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overviewStats?.totalRsvps || 0}</div>
              <p className="text-xs text-muted-foreground">All time responses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{overviewStats?.confirmedRsvps || 0}</div>
              <p className="text-xs text-muted-foreground">Will attend</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                RSVP Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Confirmed</span>
                <span className="font-medium text-green-600">{overviewStats?.confirmedRsvps || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className="font-medium text-yellow-600">{overviewStats?.pendingRsvps || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Conversion Rate</span>
                <span className="font-medium">{overviewStats?.conversionRate || 0}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Event Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Events Created</span>
                <span className="font-medium">{overviewStats?.totalEvents || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">This Month</span>
                <span className="font-medium text-blue-600">{overviewStats?.eventsThisMonth || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Avg. Attendance</span>
                <span className="font-medium">
                  {overviewStats?.totalEvents ? Math.round((overviewStats.confirmedRsvps || 0) / overviewStats.totalEvents) : 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions and WhatsApp Status */}
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
    </HostDashboardLayout>
  );
};

export default HostOverview;
