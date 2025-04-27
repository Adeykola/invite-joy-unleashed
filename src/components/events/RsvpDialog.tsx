
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface RsvpDialogProps {
  eventId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RsvpDialog({ eventId, isOpen, onOpenChange }: RsvpDialogProps) {
  const { data: event } = useQuery({
    queryKey: ["event", eventId],
    enabled: !!eventId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("title")
        .eq("id", eventId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: rsvps } = useQuery({
    queryKey: ["rsvps", eventId],
    enabled: !!eventId && isOpen,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rsvps")
        .select("*")
        .eq("event_id", eventId);

      if (error) throw error;
      return data;
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            RSVPs for {event?.title}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Comments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rsvps?.map((rsvp) => (
                <TableRow key={rsvp.id}>
                  <TableCell>{rsvp.guest_name}</TableCell>
                  <TableCell>{rsvp.guest_email}</TableCell>
                  <TableCell>
                    <Badge variant={
                      rsvp.response_status === 'confirmed' ? 'default' :
                      rsvp.response_status === 'declined' ? 'destructive' : 'secondary'
                    }>
                      {rsvp.response_status}
                    </Badge>
                  </TableCell>
                  <TableCell>{rsvp.comments || "No comments"}</TableCell>
                </TableRow>
              ))}
              {(!rsvps || rsvps.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    No RSVPs found for this event.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
