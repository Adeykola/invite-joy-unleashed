
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRealAnalytics } from "@/hooks/useRealAnalytics";
import { CalendarDays, Users, CheckCircle, TrendingUp, Activity, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function RealAnalyticsDashboard() {
  const { platformAnalytics, eventPerformance, hostEventStats, isLoadingPlatform, isLoadingEvents } = useRealAnalytics();

  if (isLoadingPlatform) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Platform-wide Analytics (Admin View) */}
      {platformAnalytics && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-green-500" />
            Platform Analytics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Total Events</CardTitle>
                <CalendarDays className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{platformAnalytics.total_events}</div>
                <p className="text-xs text-gray-500">
                  {platformAnalytics.upcoming_events} upcoming
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Total RSVPs</CardTitle>
                <Users className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{platformAnalytics.total_confirmed_rsvps}</div>
                <p className="text-xs text-gray-500">Confirmed attendees</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Checked In</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{platformAnalytics.total_checked_in}</div>
                <p className="text-xs text-gray-500">
                  {platformAnalytics.total_confirmed_rsvps > 0 
                    ? Math.round((platformAnalytics.total_checked_in / platformAnalytics.total_confirmed_rsvps) * 100)
                    : 0}% attendance rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Active Hosts</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{platformAnalytics.active_hosts}</div>
                <p className="text-xs text-gray-500">
                  {platformAnalytics.total_users} total users
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Host-specific Analytics */}
      {hostEventStats && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-yellow-500" />
            Your Event Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Your Events</CardTitle>
                <CalendarDays className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{hostEventStats.totalEvents}</div>
                <p className="text-xs text-yellow-600 font-semibold">
                  +{hostEventStats.eventsThisMonth} this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-yellow-700">Upcoming</CardTitle>
                <CalendarDays className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">{hostEventStats.upcomingEvents}</div>
                <p className="text-xs text-gray-500">Scheduled ahead</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Total RSVPs</CardTitle>
                <Users className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{hostEventStats.totalRsvps}</div>
                <p className="text-xs text-gray-500">All responses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Conversion</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{hostEventStats.conversionRate}%</div>
                <p className="text-xs text-gray-500">RSVP to confirmed</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Event Performance Table */}
      {eventPerformance && eventPerformance.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Event Performance Details</h3>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="p-4 font-medium">Event</th>
                      <th className="p-4 font-medium">Date</th>
                      <th className="p-4 font-medium">RSVPs</th>
                      <th className="p-4 font-medium">Confirmed</th>
                      <th className="p-4 font-medium">Checked In</th>
                      <th className="p-4 font-medium">Fill Rate</th>
                      <th className="p-4 font-medium">Response Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventPerformance.slice(0, 10).map((event) => (
                      <tr key={event.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-medium">{event.title}</td>
                        <td className="p-4 text-gray-600">
                          {new Date(event.date).toLocaleDateString()}
                        </td>
                        <td className="p-4">{event.total_rsvps}</td>
                        <td className="p-4 text-green-600">{event.confirmed_rsvps}</td>
                        <td className="p-4 text-blue-600">{event.checked_in_count}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            event.fill_rate >= 80 ? 'bg-green-100 text-green-800' :
                            event.fill_rate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {event.fill_rate}%
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            event.response_rate >= 80 ? 'bg-green-100 text-green-800' :
                            event.response_rate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {event.response_rate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
