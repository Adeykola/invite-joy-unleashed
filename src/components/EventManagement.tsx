
import { CreateEventDialog } from "./events/CreateEventDialog";
import { EventList } from "./events/EventList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

interface EventManagementProps {
  storageInitialized?: boolean;
}

export function EventManagement({ storageInitialized = false }: EventManagementProps) {
  const [activeTab, setActiveTab] = useState("upcoming");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Event Management</h2>
        <CreateEventDialog storageInitialized={storageInitialized} />
      </div>
      
      {/* Tabs for Event Lists */}
      <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
          <TabsTrigger value="all">All Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          <EventList filter="upcoming" />
        </TabsContent>
        
        <TabsContent value="past" className="space-y-4">
          <EventList filter="past" />
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          <EventList filter="all" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
