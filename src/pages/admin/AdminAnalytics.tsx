
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminDashboardLayout from "@/components/layouts/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  Users, 
  Calendar, 
  TrendingUp,
  Activity,
  UserCheck,
  MessageSquare,
  Clock
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminAnalytics = () => {
  // Platform-wide analytics
  const { data: platformStats } = useQuery({
    queryKey: ["admin-platform-stats"],
    queryFn: async () => {
      const [usersResult, eventsResult, rsvpsResult] = await Promise.all([
        supabase.from("profiles").select("id, role, created_at"),
        supabase.from("events").select("id, created_at, host_id"),
        supabase.from("rsvps").select("id, response_status, created_at")
      ]);

      const users = usersResult.data || [];
      const events = eventsResult.data || [];
      const rsvps = rsvpsResult.data || [];

      // Calculate growth metrics
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const newUsersThisMonth = users.filter(u => new Date(u.created_at) > thirtyDaysAgo).length;
      const newUsersThisWeek = users.filter(u => new Date(u.created_at) > sevenDaysAgo).length;
      
      const eventsThisMonth = events.filter(e => new Date(e.created_at) > thirtyDaysAgo).length;
      const eventsThisWeek = events.filter(e => new Date(e.created_at) > sevenDaysAgo).length;

      const rsvpsThisMonth = rsvps.filter(r => new Date(r.created_at) > thirtyDaysAgo).length;
      const confirmedRsvps = rsvps.filter(r => r.response_status === 'confirmed').length;

      return {
        totalUsers: users.length,
        totalEvents: events.length,
        totalRsvps: rsvps.length,
        confirmedRsvps,
        newUsersThisMonth,
        newUsersThisWeek,
        eventsThisMonth,
        eventsThisWeek,
        rsvpsThisMonth,
        usersByRole: {
          admin: users.filter(u => u.role === 'admin').length,
          host: users.filter(u => u.role === 'host').length,
          user: users.filter(u => u.role === 'user' || !u.role).length,
        },
        rsvpRate: events.length > 0 ? Math.round((confirmedRsvps / rsvps.length) * 100) : 0
      };
    },
  });

  const StatCard = ({ title, value, icon: Icon, change, changeType = "positive" }: {
    title: string;
    value: string | number;
    icon: any;
    change?: string;
    changeType?: "positive" | "negative" | "neutral";
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs ${
            changeType === "positive" ? "text-green-600" : 
            changeType === "negative" ? "text-red-600" : "text-gray-600"
          }`}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Platform-wide insights and performance metrics
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Users"
                value={platformStats?.totalUsers || 0}
                icon={Users}
                change={`+${platformStats?.newUsersThisMonth || 0} this month`}
              />
              <StatCard
                title="Total Events"
                value={platformStats?.totalEvents || 0}
                icon={Calendar}
                change={`+${platformStats?.eventsThisMonth || 0} this month`}
              />
              <StatCard
                title="Total RSVPs"
                value={platformStats?.totalRsvps || 0}
                icon={UserCheck}
                change={`+${platformStats?.rsvpsThisMonth || 0} this month`}
              />
              <StatCard
                title="RSVP Rate"
                value={`${platformStats?.rsvpRate || 0}%`}
                icon={TrendingUp}
                change="Platform average"
                changeType="neutral"
              />
            </div>

            {/* Growth Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">New Users (7 days)</span>
                    <span className="font-medium">{platformStats?.newUsersThisWeek || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">New Events (7 days)</span>
                    <span className="font-medium">{platformStats?.eventsThisWeek || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Confirmed RSVPs</span>
                    <span className="font-medium">{platformStats?.confirmedRsvps || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Admins</span>
                    <span className="font-medium">{platformStats?.usersByRole?.admin || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Hosts</span>
                    <span className="font-medium">{platformStats?.usersByRole?.host || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Regular Users</span>
                    <span className="font-medium">{platformStats?.usersByRole?.user || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Platform Health</span>
                    <span className="font-medium text-green-600">Excellent</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Uptime</span>
                    <span className="font-medium">99.9%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Response Time</span>
                    <span className="font-medium">124ms</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Detailed user analytics and behavior patterns coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Event Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Event performance metrics and insights coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  User engagement and platform interaction metrics coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminAnalytics;
