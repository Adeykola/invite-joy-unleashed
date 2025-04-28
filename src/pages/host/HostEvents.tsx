
import { EventManagement } from "@/components/EventManagement";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";

const HostEvents = () => {
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
