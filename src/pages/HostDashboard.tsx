
import { EventManagement } from "@/components/EventManagement";

const HostDashboard = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Host Dashboard</h1>
      <EventManagement />
    </div>
  );
};

export default HostDashboard;
