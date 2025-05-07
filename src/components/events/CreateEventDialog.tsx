
// Update CreateEventDialog.tsx to use the improved storage initialization
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

interface CreateEventDialogProps {
  storageInitialized?: boolean;
}

export function CreateEventDialog({ storageInitialized = false }: CreateEventDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [isCheckingStorage, setIsCheckingStorage] = useState(false);
  const [initRetries, setInitRetries] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  // Check storage availability when dialog opens
  useEffect(() => {
    const prepareStorage = async () => {
      if (isOpen && !storageReady && !isCheckingStorage) {
        setIsCheckingStorage(true);
        setErrorMessage(null);
        
        try {
          console.log("Starting storage preparation process...");
          
          // If storage is already initialized from the parent component, use that
          if (storageInitialized) {
            console.log("Storage already initialized by parent component");
            setStorageReady(true);
            setIsCheckingStorage(false);
            return;
          }
          
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
            
            // Double-check availability after init
            const isNowAvailable = await checkStorageAvailability();
            if (!isNowAvailable) {
              throw new Error("Storage buckets were created but are not properly configured");
            }
          }
          
          console.log("Storage is ready for use");
          setStorageReady(true);
        } catch (error: any) {
          console.error("Failed to initialize storage:", error);
          
          const errorMsg = error?.message || "Could not prepare storage for uploads";
          setErrorMessage(errorMsg);
          
          toast({
            title: "Storage Error",
            description: errorMsg,
            variant: "destructive",
          });
          
          // Still set storageReady to true after a certain number of retries to allow user to try using the form
          if (initRetries >= 2) {
            console.log("Max retries reached, proceeding anyway...");
            setStorageReady(true);
          }
        } finally {
          setIsCheckingStorage(false);
        }
      }
    };
    
    prepareStorage();
  }, [isOpen, storageReady, isCheckingStorage, toast, initRetries, storageInitialized]);

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
        ) : errorMessage ? (
          <div className="py-8">
            <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-md mb-4">
              <h3 className="font-medium mb-1">Storage Error</h3>
              <p className="text-sm">{errorMessage}</p>
              <p className="text-sm mt-2">You can still try to create an event, but file uploads might not work.</p>
            </div>
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => {
                  setErrorMessage(null);
                  setStorageReady(false);
                  setInitRetries(0);
                  setIsCheckingStorage(false);
                }}
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <EventWizard onSuccess={handleSuccess} />
        )}
      </DialogContent>
    </Dialog>
  );
}
