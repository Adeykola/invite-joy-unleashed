
import { useState } from "react";
import { Link } from "react-router-dom";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { InviteGuestsDialog } from "./guests/InviteGuestsDialog";
import { MoreHorizontal, Pencil, Trash2, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface EventActionsProps {
  eventId: string;
  onDelete?: () => void;
}

export function EventActions({ eventId, onDelete }: EventActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Get event title for the invite dialog
  const { data: event } = useQuery({
    queryKey: ["event-basics", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("title")
        .eq("id", eventId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);
        
      if (error) throw error;
      
      toast({
        title: "Event Deleted",
        description: "Your event has been permanently deleted.",
      });
      
      if (onDelete) onDelete();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        {event && (
          <InviteGuestsDialog eventId={eventId} eventTitle={event.title} />
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/edit-event/${eventId}`}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Event
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/event/${eventId}`}>
                <Mail className="h-4 w-4 mr-2" />
                View Event
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Event
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <AlertDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the event, all RSVPs, and guest list. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
