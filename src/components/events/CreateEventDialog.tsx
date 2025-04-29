
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

export function CreateEventDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSuccess = () => {
    setIsOpen(false);
    toast({
      title: "Event Created",
      description: "Your event has been created successfully!",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Create Event</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        <EventWizard onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
