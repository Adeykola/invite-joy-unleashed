
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventManagement } from "@/components/EventManagement";
import { EventTemplateManager } from "@/components/events/EventTemplateManager";
import { EmailTemplateManager } from "@/components/events/EmailTemplateManager";
import { NotificationCenter } from "@/components/events/NotificationCenter";
import { QRCheckInSystem } from "@/components/events/QRCheckInSystem";
import { Calendar, FileText, Mail, Bell, QrCode, BarChart3 } from "lucide-react";
import { useState } from "react";

export function HostDashboardTabs() {
  const [selectedEventId, setSelectedEventId] = useState<string>("");

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
            <select 
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select an event...</option>
              {/* This would be populated with actual events */}
            </select>
          </div>
          {selectedEventId && <QRCheckInSystem eventId={selectedEventId} />}
        </div>
      </TabsContent>
      
      <TabsContent value="analytics" className="mt-6">
        <div className="text-center py-8 text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Analytics Dashboard</h3>
          <p>Advanced analytics and reporting features coming soon...</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
