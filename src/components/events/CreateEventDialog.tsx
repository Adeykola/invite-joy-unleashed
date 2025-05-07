
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
import { Loader2, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();

  // Check storage availability when dialog opens
  useEffect(() => {
    const prepareStorage = async () => {
      // Don't check if dialog is not open or storage is already ready
      if (!isOpen || storageReady || isCheckingStorage) return;

      // Only attempt to check storage if a user is logged in
      if (!user) {
        setErrorMessage("You need to be logged in to create events.");
        return;
      }
      
      try {
        setIsCheckingStorage(true);
        setErrorMessage(null);
        
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
          
          if (!initSuccess) {
            throw new Error("Failed to initialize storage buckets. This may be due to permissions issues.");
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
    };
    
    prepareStorage();
  }, [isOpen, storageReady, isCheckingStorage, toast, initRetries, storageInitialized, user]);

  const handleStorageRetry = () => {
    setErrorMessage(null);
    setStorageReady(false);
    setInitRetries(0);
    setIsCheckingStorage(false);
  };

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
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        
        {!user ? (
          <Alert variant="destructive" className="my-4">
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              You need to be logged in to create events. Please log in and try again.
            </AlertDescription>
          </Alert>
        ) : isCheckingStorage ? (
          <div className="py-8 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
            <div className="text-center">
              <p>Preparing storage for uploads...</p>
              <p className="text-xs text-muted-foreground mt-1">This may take a few moments</p>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="py-8">
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Storage Error</AlertTitle>
              <AlertDescription>
                <p>{errorMessage}</p>
                <p className="text-sm mt-2">You can still try to create an event, but file uploads might not work.</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleStorageRetry}
                  className="mt-2 bg-background"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
            <EventWizard onSuccess={handleSuccess} />
          </div>
        ) : (
          <EventWizard onSuccess={handleSuccess} />
        )}
      </DialogContent>
    </Dialog>
  );
}
