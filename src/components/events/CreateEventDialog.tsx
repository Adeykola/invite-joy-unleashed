
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
import { checkStorageAvailability, initStorageBuckets } from "@/lib/storage";
import { Loader2, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { ensureStorageBuckets } from "@/lib/supabase";

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
        
        // Use improved storage initialization with automatic bucket creation
        const success = await ensureStorageBuckets();
        
        if (success) {
          console.log("Storage is ready for use");
          setStorageReady(true);
        } else {
          console.log("Storage initialization failed, proceed anyway...");
          // Still allow the user to create events, but warn them about image uploads
          setErrorMessage("Storage buckets could not be accessed. You can still create events, but image uploads may not work.");
          setStorageReady(true);  // Allow them to continue anyway
        }
      } catch (error: any) {
        console.error("Failed to initialize storage:", error);
        
        const errorMsg = error?.message || "Could not prepare storage for uploads";
        setErrorMessage(errorMsg);
        
        toast({
          title: "Storage Warning",
          description: "Storage access is limited. You can still create events, but image uploads may not work.",
        });
        
        // Still set storageReady to true to allow event creation without images
        console.log("Setting storageReady to true despite errors to allow event creation");
        setStorageReady(true);
      } finally {
        setIsCheckingStorage(false);
      }
    };
    
    prepareStorage();
  }, [isOpen, storageReady, isCheckingStorage, toast, initRetries, storageInitialized, user]);

  const handleStorageRetry = () => {
    setErrorMessage(null);
    setStorageReady(false);
    setInitRetries(prev => prev + 1);
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
            <Alert className="mb-4">
              <AlertTitle>Storage Notice</AlertTitle>
              <AlertDescription>
                <p>{errorMessage}</p>
                <p className="text-sm mt-2">You can still create an event, but custom images may not work properly.</p>
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
