
import { EventManagement } from "@/components/EventManagement";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";
import { initStorageBuckets } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const HostEvents = () => {
  const { toast } = useToast();
  
  // Initialize storage buckets for event images when page loads
  useEffect(() => {
    const initStorage = async () => {
      try {
        await initStorageBuckets();
        console.log("Storage buckets initialized successfully");
      } catch (error) {
        console.error("Error initializing storage buckets:", error);
        toast({
          title: "Storage Error",
          description: "Could not initialize storage for uploads. Some features may not work.",
          variant: "destructive",
        });
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
      </div>
    </DashboardLayout>
  );
};

export default HostEvents;
