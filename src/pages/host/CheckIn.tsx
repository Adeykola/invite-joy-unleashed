import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import HostDashboardLayout from "@/components/layouts/HostDashboardLayout";
import { CheckInSystem } from "@/components/events/CheckInSystem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CheckIn = () => {
  const { eventId } = useParams<{ eventId: string }>();
  
  // Fetch event details
  const { data: event, isLoading } = useQuery({
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

  if (isLoading) {
    return (
      <HostDashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </HostDashboardLayout>
    );
  }

  if (!event) {
    return (
      <HostDashboardLayout>
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-500">Event not found</h2>
          <p className="mt-2">The event you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button asChild className="mt-4">
            <Link to="/host-dashboard/events">Back to Events</Link>
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
              <Link to="/host-dashboard/events">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Events
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Check-in System</h1>
            <p className="text-muted-foreground">
              Event: {event.title} ({new Date(event.date).toLocaleDateString()})
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Guest Check-in</CardTitle>
          </CardHeader>
          <CardContent>
            {eventId && <CheckInSystem eventId={eventId} />}
          </CardContent>
        </Card>
      </div>
    </HostDashboardLayout>
  );
};

export default CheckIn;
