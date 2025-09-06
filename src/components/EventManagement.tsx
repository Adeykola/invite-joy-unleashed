
import { CreateEventDialog } from "./events/CreateEventDialog";
import { EventList } from "./events/EventList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

interface EventManagementProps {
  storageInitialized?: boolean;
}

export function EventManagement({ storageInitialized = false }: EventManagementProps) {
  const [activeTab, setActiveTab] = useState<"upcoming" | "drafts" | "published" | "past" | "all">("upcoming");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Event Management</h2>
        <CreateEventDialog storageInitialized={storageInitialized} />
      </div>
      
      {/* Tabs for Event Lists */}
      <Tabs 
        defaultValue="upcoming" 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as typeof activeTab)} 
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="all">All Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          <EventList filter="upcoming" />
        </TabsContent>
        
        <TabsContent value="drafts" className="space-y-4">
          <EventList filter="drafts" />
        </TabsContent>
        
        <TabsContent value="published" className="space-y-4">
          <EventList filter="published" />
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
