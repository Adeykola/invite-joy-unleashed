
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { WhatsAppDashboard } from "@/components/whatsapp/WhatsAppDashboard";

const HostWhatsApp = () => {
  return (
    <DashboardLayout userType="host">
      <WhatsAppDashboard />
    </DashboardLayout>
  );
};

export default HostWhatsApp;
