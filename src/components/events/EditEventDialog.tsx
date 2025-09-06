import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EventWizard } from "./EventWizard";
import { useToast } from "@/hooks/use-toast";
import { Edit } from "lucide-react";

interface EditEventDialogProps {
  eventId: string;
  eventTitle: string;
  onSuccess?: () => void;
}

export function EditEventDialog({ eventId, eventTitle, onSuccess }: EditEventDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSuccess = () => {
    setIsOpen(false);
    toast({
      title: "Event Updated",
      description: "Your event has been updated successfully!",
    });
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Event: {eventTitle}</DialogTitle>
        </DialogHeader>
        
        <EventWizard 
          eventId={eventId}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}