
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventManagement } from "@/components/EventManagement";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { format } from "date-fns";
import { useState } from "react";

const HostDashboard = () => {
  const [summary, setSummary] = useState({
    total: 0,
    confirmed: 0,
    declined: 0,
    pending: 0
  });

  // Query to get all RSVPs for statistics
  const { data: rsvpStats } = useQuery({
    queryKey: ["rsvps-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rsvps")
        .select(`
          id,
          response_status
        `);

      if (error) throw error;
      
      // Calculate summary stats
      const stats = {
        total: data.length,
        confirmed: data.filter(rsvp => rsvp.response_status === 'confirmed').length,
        declined: data.filter(rsvp => rsvp.response_status === 'declined').length,
        pending: data.filter(rsvp => rsvp.response_status === 'maybe').length
      };
      
      setSummary(stats);
      return data;
    },
  });

  // Query to get upcoming events
  const { data: upcomingEvents } = useQuery({
    queryKey: ["upcoming-events"],
    queryFn: async () => {
      const today = new Date().toISOString();
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gt("date", today)
        .order("date", { ascending: true })
        .limit(3);

      if (error) throw error;
      return data;
    },
  });

  return (
    <DashboardLayout userType="host">
      <div className="space-y-8">
        {/* RSVP Summary Cards */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Host Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total RSVPs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.total}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Confirmed Guests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{summary.confirmed}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Declined RSVPs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{summary.declined}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Responses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{summary.pending}</div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Upcoming Events Quick View */}
        {upcomingEvents && upcomingEvents.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Your Next Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingEvents.map(event => (
                <Card key={event.id} className="bg-muted/50">
                  <CardContent className="p-4">
                    <p className="font-semibold truncate">{event.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(new Date(event.date), "PPP")}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Main Event Management Section */}
        <Card className="p-6">
          <EventManagement />
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default HostDashboard;
