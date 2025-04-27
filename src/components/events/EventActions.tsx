
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EventForm } from "../EventForm";
import { Edit, Trash2, ChevronDown } from "lucide-react";

interface EventActionsProps {
  eventId: string;
  onDelete: () => void;
}

export function EventActions({ eventId, onDelete }: EventActionsProps) {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDeleteEvent = async () => {
    try {
      // First delete RSVPs linked to the event
      await supabase
        .from("rsvps")
        .delete()
        .eq("event_id", eventId);
        
      // Then delete the event itself
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;

      toast({
        title: "Event Deleted",
        description: "The event and all its RSVPs have been deleted.",
      });
      
      onDelete();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "Failed to delete the event. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Event
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-red-500"
            onClick={handleDeleteEvent}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Event
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <EventForm 
            eventId={eventId} 
            onSuccess={() => {
              setIsEditDialogOpen(false);
              onDelete(); // Refetch events after edit
            }} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
