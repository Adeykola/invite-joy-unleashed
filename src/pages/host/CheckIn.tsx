import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import HostDashboardLayout from "@/components/layouts/HostDashboardLayout";
import { CheckInSystem } from "@/components/events/CheckInSystem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

const CheckIn = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  
  // Fetch host's events for selection if no eventId provided
  const { data: hostEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ["host-events-for-checkin", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("host_id", user.id)
        .eq("status", "published")
        .order("date", { ascending: true });
        
      if (error) throw error;
      return data || [];
    },
    enabled: !eventId && !!user?.id
  });
  
  // Fetch specific event details if eventId is provided
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      if (!eventId) return null;
      
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!eventId
  });

  // Show event selector if no eventId is provided
  if (!eventId) {
    return (
      <HostDashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Check-in System</h1>
            <p className="text-muted-foreground">
              Select an event to start checking in guests
            </p>
          </div>

          {eventsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : hostEvents && hostEvents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {hostEvents.map((evt) => (
                <Card key={evt.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{evt.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {format(new Date(evt.date), "PPP 'at' p")}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {evt.location}
                    </div>
                    {evt.capacity && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-2" />
                        {evt.capacity} guests capacity
                      </div>
                    )}
                    <Button asChild className="w-full mt-2">
                      <Link to={`/host-dashboard/check-in/${evt.id}`}>
                        Start Check-in
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No published events found. Create and publish an event first.
                </p>
                <Button asChild>
                  <Link to="/host-dashboard/events">Go to Events</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </HostDashboardLayout>
    );
  }

  if (eventLoading) {
    return (
      <HostDashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </HostDashboardLayout>
    );
  }

  if (!event) {
    return (
      <HostDashboardLayout>
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-destructive">Event not found</h2>
          <p className="mt-2 text-muted-foreground">The event you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button asChild className="mt-4">
            <Link to="/host-dashboard/check-in">Back to Event Selection</Link>
          </Button>
        </div>
      </HostDashboardLayout>
    );
  }

  return (
    <HostDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button asChild variant="ghost" size="sm" className="mb-2">
              <Link to="/host-dashboard/check-in">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Event Selection
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Check-in System</h1>
            <p className="text-muted-foreground">
              Event: {event.title} ({format(new Date(event.date), "PPP")})
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Guest Check-in</CardTitle>
          </CardHeader>
          <CardContent>
            <CheckInSystem eventId={eventId} />
          </CardContent>
        </Card>
      </div>
    </HostDashboardLayout>
  );
};

export default CheckIn;
