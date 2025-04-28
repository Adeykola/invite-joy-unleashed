
import { EventManagement } from "@/components/EventManagement";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";
import { initStorageBuckets } from "@/lib/storage";

const HostEvents = () => {
  // Initialize storage buckets for event images when page loads
  useEffect(() => {
    initStorageBuckets();
  }, []);
  
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
