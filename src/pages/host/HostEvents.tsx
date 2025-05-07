
// Update HostEvents to use the improved storage initialization and add a back button
import { EventManagement } from "@/components/EventManagement";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { initStorageBuckets, checkStorageAvailability } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const HostEvents = () => {
  const { toast } = useToast();
  const [storageInitialized, setStorageInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  
  // Initialize storage buckets for event images when page loads
  useEffect(() => {
    initStorage();
  }, [retryAttempt]);

  const initStorage = async () => {
    try {
      setIsInitializing(true);
      setErrorMessage(null);
      console.log("Starting storage bucket initialization from HostEvents page...");
      
      // First check if buckets already exist
      const isAvailable = await checkStorageAvailability();
      
      if (!isAvailable) {
        console.log("Storage buckets not found, initializing...");
        const success = await initStorageBuckets();
        if (success) {
          console.log("Storage buckets initialized successfully");
          setStorageInitialized(true);
          toast({
            title: "Storage Ready",
            description: "File storage for event images has been successfully set up.",
          });
        } else {
          throw new Error("Failed to initialize storage buckets. This may be due to permissions or connectivity issues.");
        }
      } else {
        console.log("Storage buckets already available");
        setStorageInitialized(true);
      }
    } catch (error: any) {
      console.error("Error initializing storage buckets:", error);
      const errorMsg = error?.message || "Could not initialize storage for uploads";
      setErrorMessage(errorMsg);
      
      toast({
        title: "Storage Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsInitializing(false);
    }
  };
  
  const handleRetry = () => {
    setRetryAttempt(prev => prev + 1);
  };
  
  return (
    <DashboardLayout userType="host">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Event Management</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/host-dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
        
        {errorMessage ? (
          <Alert variant="destructive">
            <AlertTitle className="font-medium mb-1">Storage Error</AlertTitle>
            <AlertDescription>
              <p className="text-sm">{errorMessage}</p>
              <p className="text-sm mt-2">
                Some event features may not work properly. Please try initializing storage again.
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2 bg-background" 
                onClick={handleRetry}
                disabled={isInitializing}
              >
                {isInitializing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          !storageInitialized && isInitializing && (
            <Alert>
              <Loader2 className="h-4 w-4 mr-2 animate-spin inline-block" />
              <AlertDescription className="inline-block">Setting up file storage...</AlertDescription>
            </Alert>
          )
        )}
        
        <Card className="p-6">
          <EventManagement storageInitialized={storageInitialized} />
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default HostEvents;
