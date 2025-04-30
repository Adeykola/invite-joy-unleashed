
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InviteGuestsDialogProps {
  eventId: string;
  eventTitle: string;
}

type Guest = {
  id: string;
  name: string;
  email: string;
  invited_at: string | null;
  invite_sent: boolean;
};

export function InviteGuestsDialog({ eventId, eventTitle }: InviteGuestsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Fetch guests for this event
  const { data: guests, isLoading, refetch } = useQuery({
    queryKey: ["event-guests", eventId],
    enabled: isOpen,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_event_guests', {
        p_event_id: eventId
      });
      
      if (error) throw error;
      return data as Guest[];
    },
  });

  const toggleSelectAll = () => {
    if (guests && guests.length > 0) {
      if (selectedGuests.length === guests.length) {
        setSelectedGuests([]);
      } else {
        setSelectedGuests(guests.map(guest => guest.id));
      }
    }
  };

  const toggleSelect = (guestId: string) => {
    if (selectedGuests.includes(guestId)) {
      setSelectedGuests(selectedGuests.filter(id => id !== guestId));
    } else {
      setSelectedGuests([...selectedGuests, guestId]);
    }
  };

  const handleSendInvites = async () => {
    if (!selectedGuests.length) {
      toast({
        title: "No guests selected",
        description: "Please select at least one guest to invite.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // In a real application, this would call an API to send emails
      // For now, we'll just mark them as invited in the database
      
      // Update the selected guests to mark them as invited
      const { error } = await supabase
        .from("event_guests")
        .update({
          invite_sent: true,
          invited_at: new Date().toISOString()
        })
        .in("id", selectedGuests);

      if (error) throw error;

      toast({
        title: "Invitations Sent",
        description: `Successfully sent invitations to ${selectedGuests.length} guests.`,
      });

      // Refresh the guest list
      refetch();
      
      // Clear selection
      setSelectedGuests([]);
    } catch (error) {
      console.error("Error sending invites:", error);
      toast({
        title: "Failed to Send Invites",
        description: "There was an error sending the invitations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <Mail className="mr-2 h-4 w-4" />
          Manage Invites
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Manage Guest Invitations</DialogTitle>
          <DialogDescription>
            Send invitations to guests for {eventTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading guests...</div>
          ) : guests && guests.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="selectAll"
                    checked={selectedGuests.length === guests.length}
                    onCheckedChange={toggleSelectAll}
                  />
                  <label 
                    htmlFor="selectAll"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Select All
                  </label>
                </div>
                <Button
                  onClick={handleSendInvites}
                  disabled={isProcessing || selectedGuests.length === 0}
                >
                  Send Invitations
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Invited At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guests.map((guest) => (
                    <TableRow key={guest.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedGuests.includes(guest.id)}
                          onCheckedChange={() => toggleSelect(guest.id)}
                        />
                      </TableCell>
                      <TableCell>{guest.name}</TableCell>
                      <TableCell>{guest.email}</TableCell>
                      <TableCell>
                        {guest.invite_sent ? (
                          <span className="inline-flex items-center text-green-600">
                            <Check className="mr-1 h-4 w-4" /> Invited
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-amber-600">
                            <X className="mr-1 h-4 w-4" /> Not Invited
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {guest.invited_at 
                          ? new Date(guest.invited_at).toLocaleDateString() 
                          : "Not sent"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No guests added to this event yet.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
