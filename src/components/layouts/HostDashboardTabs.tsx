
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventManagement } from "@/components/EventManagement";
import { EventTemplateManager } from "@/components/events/EventTemplateManager";
import { EmailTemplateManager } from "@/components/events/EmailTemplateManager";
import { NotificationCenter } from "@/components/events/NotificationCenter";
import { QRCheckInSystem } from "@/components/events/QRCheckInSystem";
import { Calendar, FileText, Mail, Bell, QrCode, BarChart3 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function HostDashboardTabs() {
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const { user } = useAuth();

  // Fetch user's events for check-in selection
  const { data: events } = useQuery({
    queryKey: ["host-events", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("events")
        .select("id, title, date")
        .eq("host_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  return (
    <Tabs defaultValue="events" className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="events" className="flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <span>Events</span>
        </TabsTrigger>
        <TabsTrigger value="templates" className="flex items-center space-x-2">
          <FileText className="h-4 w-4" />
          <span>Templates</span>
        </TabsTrigger>
        <TabsTrigger value="communications" className="flex items-center space-x-2">
          <Mail className="h-4 w-4" />
          <span>Communications</span>
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center space-x-2">
          <Bell className="h-4 w-4" />
          <span>Notifications</span>
        </TabsTrigger>
        <TabsTrigger value="checkin" className="flex items-center space-x-2">
          <QrCode className="h-4 w-4" />
          <span>Check-In</span>
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex items-center space-x-2">
          <BarChart3 className="h-4 w-4" />
          <span>Analytics</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="events" className="mt-6">
        <EventManagement storageInitialized={true} />
      </TabsContent>
      
      <TabsContent value="templates" className="mt-6">
        <EventTemplateManager />
      </TabsContent>
      
      <TabsContent value="communications" className="mt-6">
        <EmailTemplateManager />
      </TabsContent>
      
      <TabsContent value="notifications" className="mt-6">
        <NotificationCenter />
      </TabsContent>
      
      <TabsContent value="checkin" className="mt-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Event for Check-In</label>
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an event..." />
              </SelectTrigger>
              <SelectContent>
                {events?.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title} - {new Date(event.date).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedEventId && <QRCheckInSystem eventId={selectedEventId} />}
        </div>
      </TabsContent>
      
      <TabsContent value="analytics" className="mt-6">
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Analytics Coming Soon</h3>
          <p className="text-muted-foreground">Host-specific analytics will be available here.</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
