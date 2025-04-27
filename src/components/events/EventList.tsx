
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

export function EventList() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isViewingRsvps, setIsViewingRsvps] = useState(false);

  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading events...</div>;
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
                <EventActions eventId={event.id} onDelete={refetch} />
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
