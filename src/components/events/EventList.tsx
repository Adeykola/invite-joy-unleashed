
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, MapPin, Users, FileText, CheckCircle } from "lucide-react";
import { RsvpDialog } from "./RsvpDialog";
import { EventActions } from "./EventActions";

type EventListProps = {
  filter?: "upcoming" | "past" | "all" | "drafts" | "published";
};

export function EventList({ filter = "all" }: EventListProps) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isViewingRsvps, setIsViewingRsvps] = useState(false);

  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ["events", filter],
    queryFn: async () => {
      let query = supabase.from("events").select("*");
      
      // Apply filter
      const today = new Date().toISOString();
      if (filter === "upcoming") {
        query = query.gt("date", today).eq("status", "published");
      } else if (filter === "past") {
        query = query.lte("date", today).eq("status", "published");
      } else if (filter === "drafts") {
        query = query.eq("status", "draft");
      } else if (filter === "published") {
        query = query.eq("status", "published");
      }
      
      // Sort events
      const sortOrder = filter === "past" ? { ascending: false } : { ascending: true };
      query = query.order("date", sortOrder);
      
      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading events...</div>;
  }

  if (events?.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No {filter !== "all" ? filter : ""} events found.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {events?.map((event) => (
          <Card key={event.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  {event.status === 'draft' ? (
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      <FileText className="h-3 w-3 mr-1" />
                      Draft
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Published
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <EventActions 
                    eventId={event.id}
                    eventTitle={event.title}
                    onDelete={refetch}
                    event={event}
                  />
                </div>
              </div>
              {event.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {event.description}
                </p>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {format(new Date(event.date), "PPP")}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {event.location}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  {event.capacity || "Unlimited"} capacity
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <RsvpDialog
        eventId={selectedEventId}
        isOpen={isViewingRsvps}
        onOpenChange={setIsViewingRsvps}
      />
    </>
  );
}
