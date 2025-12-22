import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EventWizard } from "./EventWizard";
import { useToast } from "@/hooks/use-toast";

interface EditEventDialogProps {
  eventId: string;
  eventTitle: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditEventDialog({ 
  eventId, 
  eventTitle, 
  isOpen, 
  onOpenChange, 
  onSuccess 
}: EditEventDialogProps) {
  const { toast } = useToast();

  const handleSuccess = () => {
    onOpenChange(false);
    toast({
      title: "Event Updated",
      description: "Your event has been updated successfully!",
    });
    if (onSuccess) {
      onSuccess();
    }
  };

  if (!eventId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
