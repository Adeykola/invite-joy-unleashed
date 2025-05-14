
import PageLayout from "@/components/layouts/PageLayout";
import { GuestCheckIn } from "@/components/events/GuestCheckIn";

const GuestCheckInConfirmation = () => {
  return (
    <PageLayout>
      <div className="container max-w-md mx-auto py-12">
        <GuestCheckIn />
      </div>
    </PageLayout>
  );
};

export default GuestCheckInConfirmation;
