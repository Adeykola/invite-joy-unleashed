import React, { useState } from 'react';
import { FabricSeatingChart } from './FabricSeatingChart';
import { SmartSeatAssignment } from './SmartSeatAssignment';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout, Zap } from 'lucide-react';

interface SeatingChartDesignerProps {
  eventId: string;
  onClose?: () => void;
}

export const SeatingChartDesigner: React.FC<SeatingChartDesignerProps> = ({ eventId, onClose }) => {
  return (
    <div className="space-y-6" id="seating-chart">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Seating Management</h2>
          <p className="text-muted-foreground">Design your event layout and manage guest seating</p>
        </div>
      </div>

      <Tabs defaultValue="designer" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="designer" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Hall Designer
          </TabsTrigger>
          <TabsTrigger value="assignment" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Smart Assignment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="designer" className="space-y-6">
          <FabricSeatingChart eventId={eventId} />
        </TabsContent>

        <TabsContent value="assignment" className="space-y-6">
          <SmartSeatAssignment eventId={eventId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};