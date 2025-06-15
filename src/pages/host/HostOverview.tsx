
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
          <h1 className="text-3xl font-bold text-green-800">Overview</h1>
          <p className="text-yellow-600 mt-2">Complete dashboard with analytics and quick actions</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Total Events</CardTitle>
              <CalendarDays className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{overviewStats?.totalEvents || 0}</div>
              <p className="text-xs text-yellow-600 font-semibold">
                +{overviewStats?.eventsThisMonth || 0} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">Upcoming Events</CardTitle>
              <CalendarDays className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{overviewStats?.upcomingEvents || 0}</div>
              <p className="text-xs text-gray-500">Scheduled ahead</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Total RSVPs</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{overviewStats?.totalRsvps || 0}</div>
              <p className="text-xs text-gray-500">All time responses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Confirmed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{overviewStats?.confirmedRsvps || 0}</div>
              <p className="text-xs text-gray-500">Will attend</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Activity className="h-5 w-5 text-green-500" />
                RSVP Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-green-600">Confirmed</span>
                <span className="font-medium text-green-700">{overviewStats?.confirmedRsvps || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-yellow-600">Pending</span>
                <span className="font-medium text-yellow-700">{overviewStats?.pendingRsvps || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Conversion Rate</span>
                <span className="font-medium text-green-800">{overviewStats?.conversionRate || 0}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <BarChart3 className="h-5 w-5 text-yellow-500" />
                Event Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Events Created</span>
                <span className="font-medium text-green-600">{overviewStats?.totalEvents || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-yellow-600">This Month</span>
                <span className="font-medium text-yellow-600">{overviewStats?.eventsThisMonth || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Avg. Attendance</span>
                <span className="font-medium text-green-700">
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
              <CardTitle className="text-green-700">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <Link to="/host-dashboard/events">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Manage Events
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full border-yellow-400 text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800">
                  <Link to="/host-dashboard/guests">
                    <Users className="mr-2 h-4 w-4" />
                    View Guests
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full border-yellow-400 text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800">
                  <Link to="/host-dashboard/calendar">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Calendar View
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full border-green-400 text-green-700 hover:bg-green-50 hover:text-green-800">
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
              <CardTitle className="flex items-center text-green-700">
                <Smartphone className="w-5 h-5 mr-2 text-green-600" />
                WhatsApp Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Connection Status:</span>
                  <span className={`text-sm font-medium ${
                    whatsappSession?.status === 'connected' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {whatsappSession?.status === 'connected' ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full border-green-400 text-green-700 hover:bg-green-50 hover:text-green-800">
                    <Link to="/host-dashboard/whatsapp">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Manage WhatsApp
                    </Link>
                  </Button>
                  {whatsappSession?.status === 'connected' && (
                    <Button asChild size="sm" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">
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

