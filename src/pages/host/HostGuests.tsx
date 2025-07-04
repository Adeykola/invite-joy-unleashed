
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import HostDashboardLayout from "@/components/layouts/HostDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EnhancedGuestList } from "@/components/events/guests/EnhancedGuestList";
import { useAuth } from "@/contexts/AuthContext";

const HostGuests = () => {
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const { user } = useAuth();

  // Fetch user's events
  const { data: events } = useQuery({
    queryKey: ["host-events", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("events")
        .select("id, title, date, location")
        .eq("host_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Get event statistics
  const { data: eventStats } = useQuery({
    queryKey: ["host-event-stats", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("id, title, date")
        .eq("host_id", user.id);

      if (eventsError) throw eventsError;

      const { data: guests, error: guestsError } = await supabase
        .from("event_guests")
        .select("id, event_id, invite_sent, is_vip")
        .in("event_id", events?.map(e => e.id) || []);

      if (guestsError) throw guestsError;

      const { data: rsvps, error: rsvpsError } = await supabase
        .from("rsvps")
        .select("id, event_id, response_status, checked_in")
        .in("event_id", events?.map(e => e.id) || []);

      if (rsvpsError) throw rsvpsError;

      return events?.map(event => {
        const eventGuests = guests?.filter(g => g.event_id === event.id) || [];
        const eventRsvps = rsvps?.filter(r => r.event_id === event.id) || [];
        
        return {
          ...event,
          totalGuests: eventGuests.length,
          invitedGuests: eventGuests.filter(g => g.invite_sent).length,
          vipGuests: eventGuests.filter(g => g.is_vip).length,
          confirmedRsvps: eventRsvps.filter(r => r.response_status === 'confirmed').length,
          checkedInGuests: eventRsvps.filter(r => r.checked_in).length,
        };
      }) || [];
    },
    enabled: !!user?.id,
  });

  const upcomingEvents = eventStats?.filter(event => new Date(event.date) >= new Date()) || [];
  const pastEvents = eventStats?.filter(event => new Date(event.date) < new Date()) || [];

  return (
    <HostDashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-green-800">Guest Management</h2>
          <p className="text-yellow-600 mt-2">Manage your event guests, track RSVPs, and send invitations</p>
        </div>

        {/* Event Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Event</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose an event to manage guests..." />
              </SelectTrigger>
              <SelectContent>
                {events?.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title} - {new Date(event.date).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedEventId ? (
          <EnhancedGuestList eventId={selectedEventId} />
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
              <TabsTrigger value="past">Past Events</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-700">Total Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{eventStats?.length || 0}</div>
                    <p className="text-sm text-muted-foreground">All your events</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-yellow-700">Total Guests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {eventStats?.reduce((sum, event) => sum + event.totalGuests, 0) || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Across all events</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-700">Confirmed RSVPs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {eventStats?.reduce((sum, event) => sum + event.confirmedRsvps, 0) || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Ready to attend</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="upcoming" className="mt-6">
              <div className="grid gap-4">
                {upcomingEvents.map((event) => (
                  <Card key={event.id} className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedEventId(event.id)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">{event.totalGuests}</div>
                          <div className="text-xs text-muted-foreground">guests</div>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-3 text-sm">
                        <span>Invited: {event.invitedGuests}</span>
                        <span>Confirmed: {event.confirmedRsvps}</span>
                        <span>VIP: {event.vipGuests}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {upcomingEvents.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">No upcoming events</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="past" className="mt-6">
              <div className="grid gap-4">
                {pastEvents.map((event) => (
                  <Card key={event.id} className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedEventId(event.id)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{event.checkedInGuests}</div>
                          <div className="text-xs text-muted-foreground">attended</div>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-3 text-sm">
                        <span>Total Guests: {event.totalGuests}</span>
                        <span>Confirmed: {event.confirmedRsvps}</span>
                        <span>Checked In: {event.checkedInGuests}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {pastEvents.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">No past events</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </HostDashboardLayout>
  );
};

export default HostGuests;
