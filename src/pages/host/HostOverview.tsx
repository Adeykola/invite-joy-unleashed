
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CalendarDays, 
  Users, 
  Settings, 
  MessageCircle, 
  Smartphone, 
  BarChart3,
  Activity,
  CheckCircle,
  TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";
import HostDashboardLayout from "@/components/layouts/HostDashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { WhatsAppConnection } from "@/components/whatsapp/WhatsAppConnection";

const HostOverview = () => {
  const { user } = useAuth();

  // Fetch WhatsApp session status
  const { data: whatsappSession } = useQuery({
    queryKey: ['whatsapp-session', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('whatsapp_sessions')
        .select('status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  return (
    <HostDashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-green-800">Overview</h1>
          <p className="text-yellow-600 mt-2">Complete dashboard with real-time analytics and quick actions</p>
        </div>

        {/* Quick Actions and WhatsApp Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-700">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <Link to="/host-dashboard/events">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Manage Events
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full border-yellow-400 text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800">
                  <Link to="/host-dashboard/guests">
                    <Users className="mr-2 h-4 w-4" />
                    View Guests
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full border-yellow-400 text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800">
                  <Link to="/host-dashboard/calendar">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Calendar View
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full border-green-400 text-green-700 hover:bg-green-50 hover:text-green-800">
                  <Link to="/host-dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-green-700">
                <Smartphone className="w-5 h-5 mr-2 text-green-600" />
                WhatsApp Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Connection Status:</span>
                  <span className={`text-sm font-medium ${
                    whatsappSession?.status === 'connected' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {whatsappSession?.status === 'connected' ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full border-green-400 text-green-700 hover:bg-green-50 hover:text-green-800">
                    <Link to="/host-dashboard/whatsapp">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Manage WhatsApp
                    </Link>
                  </Button>
                  {whatsappSession?.status === 'connected' && (
                    <Button asChild size="sm" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">
                      <Link to="/host-dashboard/whatsapp?tab=broadcasts">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Send Broadcast
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* WhatsApp Connection Widget */}
        {(!whatsappSession || whatsappSession.status !== 'connected') && (
          <WhatsAppConnection />
        )}
      </div>
    </HostDashboardLayout>
  );
};

export default HostOverview;
