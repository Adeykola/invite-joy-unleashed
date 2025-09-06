
// Import the necessary components and hooks
import { useState } from "react";
import { Link } from "react-router-dom";
import { MoreVertical, Edit, Trash2, Send, Users, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InviteGuestsDialog } from "./guests/InviteGuestsDialog";

// Define the props for EventActions
interface EventActionsProps {
  eventId: string;
  eventTitle: string;
  onEdit?: () => void;
  onDelete?: () => void;
  event?: any; // For accessing event status and other properties
}

// Component implementation
export function EventActions({ eventId, eventTitle, onEdit, onDelete, event }: EventActionsProps) {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Event
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowInviteDialog(true)}>
            <Send className="mr-2 h-4 w-4" />
            Manage Invites
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to={`/host-dashboard/check-in/${eventId}`}>
              <Check className="mr-2 h-4 w-4" />
              Check-in System
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={onDelete}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Event
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <InviteGuestsDialog 
        eventId={eventId} 
        eventTitle={eventTitle} 
        isOpen={showInviteDialog}
        onOpenChange={setShowInviteDialog}
      />
    </>
  );
}
