
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
import { format } from "date-fns";
import { RsvpDialog } from "./RsvpDialog";
import { EventActions } from "./EventActions";

type EventListProps = {
  filter?: "upcoming" | "past" | "all";
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
        query = query.gt("date", today);
      } else if (filter === "past") {
        query = query.lte("date", today);
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>RSVPs</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events?.map((event) => (
            <TableRow key={event.id}>
              <TableCell>{event.title}</TableCell>
              <TableCell>{format(new Date(event.date), "PPP")}</TableCell>
              <TableCell>{event.location}</TableCell>
              <TableCell>{event.capacity || "Unlimited"}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedEventId(event.id);
                    setIsViewingRsvps(true);
                  }}
                >
                  View RSVPs
                </Button>
              </TableCell>
              <TableCell>
                <EventActions 
                  eventId={event.id} 
                  eventTitle={event.title} 
                  onDelete={refetch} 
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <RsvpDialog
        eventId={selectedEventId}
        isOpen={isViewingRsvps}
        onOpenChange={setIsViewingRsvps}
      />
    </>
  );
}
