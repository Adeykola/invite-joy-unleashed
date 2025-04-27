
import { CreateEventDialog } from "./events/CreateEventDialog";
import { EventList } from "./events/EventList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export function EventManagement() {
  const [activeTab, setActiveTab] = useState("upcoming");

  // Fetch event stats for the host
  const { data: eventStats } = useQuery({
    queryKey: ["event-stats"],
    queryFn: async () => {
      const { data: events, error } = await supabase
        .from("events")
        .select("*");

      if (error) throw error;
      
      // Calculate stats
      const total = events?.length || 0;
      const upcoming = events?.filter(event => new Date(event.date) > new Date()).length || 0;
      const past = events?.filter(event => new Date(event.date) <= new Date()).length || 0;
      
      return { total, upcoming, past };
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Event Management</h2>
        <CreateEventDialog />
      </div>
      
      {/* Event Statistics */}
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
      
      {/* Tabs for Event Lists */}
      <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
          <TabsTrigger value="all">All Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          <EventList filter="upcoming" />
        </TabsContent>
        
        <TabsContent value="past" className="space-y-4">
          <EventList filter="past" />
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          <EventList filter="all" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
