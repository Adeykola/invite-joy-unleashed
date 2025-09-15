import React, { useState } from 'react';
import { FabricSeatingChart } from './FabricSeatingChart';
import { SmartSeatAssignment } from './SmartSeatAssignment';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout, Zap } from 'lucide-react';

// Custom seat node component
const SeatNode = ({ data, id }: { data: any; id: string }) => {
  const getSeatColor = () => {
    if (data.assigned_rsvp_id) return 'bg-red-500';
    switch (data.seat_type) {
      case 'vip': return 'bg-yellow-500';
      case 'accessible': return 'bg-blue-500';
      case 'blocked': return 'bg-gray-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div
      className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:scale-110 transition-transform ${getSeatColor()}`}
      title={`Seat ${data.seat_number}${data.guest_name ? ` - ${data.guest_name}` : ''}`}
    >
      {data.seat_number}
    </div>
  );
};

// Table node component
const TableNode = ({ data }: { data: any }) => (
  <div className="w-24 h-24 bg-amber-700 rounded-full border-4 border-amber-800 shadow-lg flex items-center justify-center text-white font-bold">
    Table {data.table_number}
  </div>
);

const nodeTypes: NodeTypes = {
  seat: SeatNode,
  table: TableNode,
};

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