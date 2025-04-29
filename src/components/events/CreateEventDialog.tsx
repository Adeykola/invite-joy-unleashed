
import { useState, useEffect } from "react";
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
import { initStorageBuckets, checkStorageAvailability } from "@/lib/storage";

export function CreateEventDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [isCheckingStorage, setIsCheckingStorage] = useState(false);
  const { toast } = useToast();

  // Check storage availability when dialog opens
  useEffect(() => {
    const prepareStorage = async () => {
      if (isOpen && !storageReady && !isCheckingStorage) {
        setIsCheckingStorage(true);
        
        try {
          // Check if storage buckets exist
          const isAvailable = await checkStorageAvailability();
          
          if (!isAvailable) {
            console.log("Storage buckets not found, initializing...");
            await initStorageBuckets();
          }
          
          setStorageReady(true);
        } catch (error) {
          console.error("Failed to initialize storage:", error);
          toast({
            title: "Storage Error",
            description: "Could not prepare storage for uploads. Some features may not work.",
            variant: "destructive",
          });
        } finally {
          setIsCheckingStorage(false);
        }
      }
    };
    
    prepareStorage();
  }, [isOpen, storageReady, isCheckingStorage, toast]);

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
        {isCheckingStorage ? (
          <div className="py-4 text-center">Preparing storage for uploads...</div>
        ) : (
          <EventWizard onSuccess={handleSuccess} />
        )}
      </DialogContent>
    </Dialog>
  );
}
