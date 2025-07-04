
import HostDashboardLayout from "@/components/layouts/HostDashboardLayout";
import EnhancedWhatsAppDashboard from "@/components/whatsapp/EnhancedWhatsAppDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, AlertCircle } from "lucide-react";

const HostWhatsApp = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <HostDashboardLayout>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              <AlertCircle className="h-5 w-5 mr-2" />
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700">
              Please log in to access WhatsApp messaging features.
            </p>
          </CardContent>
        </Card>
      </HostDashboardLayout>
    );
  }

  return (
    <HostDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <MessageSquare className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">WhatsApp Messaging</h1>
            <p className="text-gray-600">
              Connect WhatsApp to send messages to your event guests
            </p>
          </div>
        </div>

        {/* Enhanced WhatsApp Dashboard */}
        <EnhancedWhatsAppDashboard />
      </div>
    </HostDashboardLayout>
  );
};

export default HostWhatsApp;
