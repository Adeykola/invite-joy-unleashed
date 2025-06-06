
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import HostDashboardLayout from "@/components/layouts/HostDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  Users, 
  Calendar, 
  TrendingUp,
  Activity,
  CheckCircle,
  Clock,
  Mail
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const HostAnalytics = () => {
  const { user } = useAuth();

  const { data: hostStats } = useQuery({
    queryKey: ["host-analytics", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const [eventsResult, rsvpsResult] = await Promise.all([
        supabase
          .from("events")
          .select("id, created_at, title")
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
      
      const eventsThisMonth = events.filter(e => new Date(e.created_at) > thirtyDaysAgo).length;
      const confirmedRsvps = rsvps.filter(r => r.response_status === 'confirmed').length;
      const pendingRsvps = rsvps.filter(r => r.response_status === 'pending').length;
      const totalAttendance = rsvps.length;

      return {
        totalEvents: events.length,
        eventsThisMonth,
        totalRsvps: rsvps.length,
        confirmedRsvps,
        pendingRsvps,
        totalAttendance,
        conversionRate: rsvps.length > 0 ? Math.round((confirmedRsvps / rsvps.length) * 100) : 0
      };
    },
    enabled: !!user?.id,
  });

  return (
    <HostDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your event performance and guest engagement
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hostStats?.totalEvents || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{hostStats?.eventsThisMonth || 0} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total RSVPs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hostStats?.totalRsvps || 0}</div>
              <p className="text-xs text-muted-foreground">All time responses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed Guests</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hostStats?.confirmedRsvps || 0}</div>
              <p className="text-xs text-muted-foreground">Will attend</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hostStats?.conversionRate || 0}%</div>
              <p className="text-xs text-muted-foreground">RSVP to confirmed</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                RSVP Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Confirmed</span>
                <span className="font-medium text-green-600">{hostStats?.confirmedRsvps || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className="font-medium text-yellow-600">{hostStats?.pendingRsvps || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Responses</span>
                <span className="font-medium">{hostStats?.totalRsvps || 0}</span>
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
                <span className="font-medium">{hostStats?.totalEvents || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">This Month</span>
                <span className="font-medium text-blue-600">{hostStats?.eventsThisMonth || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Avg. Attendance</span>
                <span className="font-medium">
                  {hostStats?.totalEvents ? Math.round((hostStats.confirmedRsvps || 0) / hostStats.totalEvents) : 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </HostDashboardLayout>
  );
};

export default HostAnalytics;
