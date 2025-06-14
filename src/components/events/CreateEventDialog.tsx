
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
import { checkStorageAvailability } from "@/lib/storage";
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
        
        console.log("Starting event storage preparation process...");
        
        // If storage is already initialized from the parent component, use that
        if (storageInitialized) {
          console.log("Storage already initialized by parent component");
          setStorageReady(true);
          setIsCheckingStorage(false);
          return;
        }
        
        // Check if event storage buckets are available
        const isAvailable = await checkStorageAvailability();
        
        if (isAvailable) {
          console.log("Event storage buckets are available");
          setStorageReady(true);
        } else {
          console.log("Event storage buckets not available, attempting to create...");
          const createSuccess = await ensureStorageBuckets();
          
          if (createSuccess) {
            console.log("Successfully created event storage buckets");
            setStorageReady(true);
            toast({
              title: "Storage Ready",
              description: "File storage for event images is now available.",
            });
          } else {
            // Allow event creation without images
            console.log("Couldn't create event storage buckets, proceeding with limited functionality");
            setStorageReady(true);
            setErrorMessage("Image uploads are currently unavailable. You can still create events with text and templates.");
          }
        }
      } catch (error: any) {
        console.error("Error checking event storage:", error);
        const errorMsg = error?.message || "Could not access storage for image uploads";
        setErrorMessage(errorMsg);
        
        // Still allow event creation
        setStorageReady(true);
        
        toast({
          title: "Storage Warning",
          description: "Image uploads may not work properly. Core event functionality will still be available.",
        });
      } finally {
        setIsCheckingStorage(false);
      }
    };
    
    prepareStorage();
  }, [isOpen, storageReady, isCheckingStorage, toast, storageInitialized, user]);

  const handleStorageRetry = () => {
    setErrorMessage(null);
    setStorageReady(false);
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
              <p>Preparing event storage...</p>
              <p className="text-xs text-muted-foreground mt-1">Setting up image upload functionality</p>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="py-8">
            <Alert className="mb-4">
              <AlertTitle>Storage Notice</AlertTitle>
              <AlertDescription>
                <p>{errorMessage}</p>
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
