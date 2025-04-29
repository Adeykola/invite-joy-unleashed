
import { EventManagement } from "@/components/EventManagement";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { initStorageBuckets, checkStorageAvailability } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const HostEvents = () => {
  const { toast } = useToast();
  const [storageInitialized, setStorageInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Initialize storage buckets for event images when page loads
  useEffect(() => {
    const initStorage = async () => {
      try {
        setIsInitializing(true);
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
      } catch (error) {
        console.error("Error initializing storage buckets:", error);
        toast({
          title: "Storage Error",
          description: "Could not initialize storage for uploads. Some features may not work.",
          variant: "destructive",
        });
      } finally {
        setIsInitializing(false);
      }
    };
    
    initStorage();
  }, [toast]);
  
  return (
    <DashboardLayout userType="host">
      <div className="space-y-8">
        <h2 className="text-2xl font-bold">Event Management</h2>
        
        <Card className="p-6">
          <EventManagement />
        </Card>
        
        {!storageInitialized && isInitializing && (
          <div className="flex items-center space-x-2 text-xs text-gray-500 mt-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Setting up file storage...</span>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HostEvents;
