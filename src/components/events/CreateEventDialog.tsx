
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
import { Loader2 } from "lucide-react";

export function CreateEventDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [isCheckingStorage, setIsCheckingStorage] = useState(false);
  const [initRetries, setInitRetries] = useState(0);
  const { toast } = useToast();

  // Check storage availability when dialog opens
  useEffect(() => {
    const prepareStorage = async () => {
      if (isOpen && !storageReady && !isCheckingStorage) {
        setIsCheckingStorage(true);
        
        try {
          console.log("Starting storage preparation process...");
          
          // Check if storage buckets exist
          const isAvailable = await checkStorageAvailability();
          
          if (!isAvailable) {
            console.log("Storage buckets not found or not properly configured, initializing...");
            const initSuccess = await initStorageBuckets();
            
            if (!initSuccess && initRetries < 3) {
              console.log(`Initialization failed, retrying... (${initRetries + 1}/3)`);
              setInitRetries(prev => prev + 1);
              setIsCheckingStorage(false); // Allow another retry
              return;
            } else if (!initSuccess) {
              throw new Error("Failed to initialize storage buckets after multiple attempts");
            }
          }
          
          console.log("Storage is ready for use");
          setStorageReady(true);
        } catch (error) {
          console.error("Failed to initialize storage:", error);
          toast({
            title: "Storage Error",
            description: "Could not prepare storage for uploads. Some features may not work.",
            variant: "destructive",
          });
          // Still set storageReady to true to allow user to try using the form
          setStorageReady(true);
        } finally {
          setIsCheckingStorage(false);
        }
      }
    };
    
    prepareStorage();
  }, [isOpen, storageReady, isCheckingStorage, toast, initRetries]);

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
          <div className="py-8 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
            <div className="text-center">
              <p>Preparing storage for uploads...</p>
              <p className="text-xs text-muted-foreground mt-1">This may take a few moments</p>
            </div>
          </div>
        ) : (
          <EventWizard onSuccess={handleSuccess} />
        )}
      </DialogContent>
    </Dialog>
  );
}
