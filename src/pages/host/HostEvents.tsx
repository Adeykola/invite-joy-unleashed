
import { EventManagement } from "@/components/EventManagement";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { initStorageBuckets, checkStorageAvailability } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

const HostEvents = () => {
  const { toast } = useToast();
  const [storageInitialized, setStorageInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Initialize storage buckets for event images when page loads
  useEffect(() => {
    initStorage();
  }, [toast]);

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
        } else {
          throw new Error("Failed to initialize storage buckets");
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
  
  return (
    <DashboardLayout userType="host">
      <div className="space-y-8">
        <h2 className="text-2xl font-bold">Event Management</h2>
        
        {errorMessage ? (
          <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-md mb-6">
            <h3 className="font-medium mb-1">Storage Error</h3>
            <p className="text-sm">{errorMessage}</p>
            <p className="text-sm mt-2">
              Some event features may not work properly. Please try initializing storage again.
            </p>
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-2" 
              onClick={initStorage}
              disabled={isInitializing}
            >
              {isInitializing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Retry
            </Button>
          </div>
        ) : (
          !storageInitialized && isInitializing && (
            <div className="flex items-center space-x-2 text-sm text-gray-500 mt-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Setting up file storage...</span>
            </div>
          )
        )}
        
        <Card className="p-6">
          <EventManagement />
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default HostEvents;
