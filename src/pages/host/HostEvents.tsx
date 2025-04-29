
import { EventManagement } from "@/components/EventManagement";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { initStorageBuckets } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

const HostEvents = () => {
  const { toast } = useToast();
  const [storageInitialized, setStorageInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Initialize storage buckets for event images when page loads
  useEffect(() => {
    const initStorage = async () => {
      try {
        setIsInitializing(true);
        console.log("Starting storage bucket initialization...");
        await initStorageBuckets();
        console.log("Storage buckets initialized successfully");
        setStorageInitialized(true);
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
          <div className="text-xs text-gray-500 mt-2">
            Setting up file storage...
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HostEvents;
