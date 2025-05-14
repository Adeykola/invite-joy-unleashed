
import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { CheckInManager } from "@/components/events/CheckInManager";

const CheckIn = () => {
  const { eventId } = useParams();
  
  if (!eventId) {
    return (
      <DashboardLayout userType="host">
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
          <p className="text-muted-foreground">No event ID was provided.</p>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout userType="host">
      <CheckInManager eventId={eventId} />
    </DashboardLayout>
  );
};

export default CheckIn;
