
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { format } from "date-fns";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Users, Activity } from "lucide-react";

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

  // Query to get event statistics
  const { data: eventStats } = useQuery({
    queryKey: ["event-stats"],
    queryFn: async () => {
      const { data: events, error } = await supabase
        .from("events")
        .select("*");

      if (error) throw error;
      
      // Calculate stats
      const today = new Date();
      const total = events?.length || 0;
      const upcoming = events?.filter(event => new Date(event.date) > today).length || 0;
      const past = events?.filter(event => new Date(event.date) <= today).length || 0;
      
      return { total, upcoming, past };
    },
  });

  return (
    <DashboardLayout userType="host">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Host Dashboard</h2>
          <Link to="/host/events">
            <Button>Manage Events</Button>
          </Link>
        </div>
        
        {/* Event Statistics */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            Event Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{eventStats?.total || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{eventStats?.upcoming || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Past Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-500">{eventStats?.past || 0}</div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* RSVP Summary */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="mr-2 h-5 w-5" />
            RSVP Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        
        {/* Upcoming Events */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Upcoming Events
          </h3>
          {upcomingEvents && upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingEvents.map(event => (
                <Link to={`/event/${event.id}`} key={event.id}>
                  <Card className="bg-muted/50 hover:bg-muted transition-colors">
                    <CardContent className="p-4">
                      <p className="font-semibold truncate">{event.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(event.date), "PPP")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Location: {event.location}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No upcoming events scheduled.</p>
                <Link to="/host/events">
                  <Button variant="outline" className="mt-4">Create Your First Event</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link to="/host/events">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Calendar className="h-8 w-8 mb-2" />
                <h4 className="font-semibold text-lg">Manage Events</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Create, edit, and delete your events
                </p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/host/guests">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Users className="h-8 w-8 mb-2" />
                <h4 className="font-semibold text-lg">Guest Lists</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  View and manage your event attendees
                </p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/host/calendar">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Calendar className="h-8 w-8 mb-2" />
                <h4 className="font-semibold text-lg">Calendar View</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  See all your events in a calendar format
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/host/whatsapp">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Users className="h-8 w-8 mb-2" />
                <h4 className="font-semibold text-lg">WhatsApp</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Send messages and manage broadcasts
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HostDashboard;
