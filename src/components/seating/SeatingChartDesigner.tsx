import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSeatingChart, Seat } from '@/hooks/useSeatingChart';
import { Plus, Save, Trash2, Users, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const {
    seatingChart,
    createChart,
    updateChart,
    addSeat,
    updateSeat,
    deleteSeat,
    isLoadingChart,
    isCreatingChart,
  } = useSeatingChart(eventId);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedTool, setSelectedTool] = useState<'seat' | 'table' | 'select'>('select');
  const [isAddSeatDialogOpen, setIsAddSeatDialogOpen] = useState(false);
  const [newSeatData, setNewSeatData] = useState({
    seat_number: '',
    seat_type: 'regular' as const,
    table_number: '',
    notes: '',
  });

  // Initialize chart if it doesn't exist
  useEffect(() => {
    if (!isLoadingChart && !seatingChart) {
      createChart({ name: 'Main Seating Chart' });
    }
  }, [isLoadingChart, seatingChart, createChart]);

  // Load existing seats as nodes
  useEffect(() => {
    if (seatingChart?.seats) {
      const seatNodes: Node[] = seatingChart.seats.map((seat) => ({
        id: seat.id,
        type: 'seat',
        position: { x: seat.position_x, y: seat.position_y },
        data: {
          seat_number: seat.seat_number,
          seat_type: seat.seat_type,
          table_number: seat.table_number,
          notes: seat.notes,
          assigned_rsvp_id: seat.assigned_rsvp_id,
          guest_name: seat.guest_name,
          guest_email: seat.guest_email,
        },
        draggable: true,
      }));
      setNodes(seatNodes);
    }
  }, [seatingChart, setNodes]);

  // Handle canvas click to add seats
  const onCanvasClick = useCallback((event: React.MouseEvent) => {
    if (selectedTool === 'select') return;
    
    const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (!reactFlowBounds) return;

    const position = {
      x: event.clientX - reactFlowBounds.left - 16, // Offset for seat size
      y: event.clientY - reactFlowBounds.top - 16,
    };

    if (selectedTool === 'seat') {
      setIsAddSeatDialogOpen(true);
    }
  }, [selectedTool]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const handleAddSeat = () => {
    if (!newSeatData.seat_number.trim()) {
      toast({
        title: "Error",
        description: "Seat number is required.",
        variant: "destructive",
      });
      return;
    }

    // Find a good position for the new seat
    const position = { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 };

    addSeat({
      ...newSeatData,
      position_x: position.x,
      position_y: position.y,
    });

    setNewSeatData({
      seat_number: '',
      seat_type: 'regular',
      table_number: '',
      notes: '',
    });
    setIsAddSeatDialogOpen(false);
  };

  const handleNodeDragStop = useCallback((event: any, node: Node) => {
    updateSeat({
      seatId: node.id,
      updates: {
        position_x: node.position.x,
        position_y: node.position.y,
      },
    });
  }, [updateSeat]);

  const handleSaveLayout = () => {
    if (seatingChart) {
      updateChart({
        layout_data: { nodes, edges },
      });
    }
  };

  const getSeatTypeStats = () => {
    const stats = {
      total: seatingChart?.seats.length || 0,
      assigned: seatingChart?.seats.filter(s => s.assigned_rsvp_id).length || 0,
      regular: seatingChart?.seats.filter(s => s.seat_type === 'regular').length || 0,
      vip: seatingChart?.seats.filter(s => s.seat_type === 'vip').length || 0,
      accessible: seatingChart?.seats.filter(s => s.seat_type === 'accessible').length || 0,
      blocked: seatingChart?.seats.filter(s => s.seat_type === 'blocked').length || 0,
    };
    return stats;
  };

  const stats = getSeatTypeStats();

  if (isLoadingChart) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading seating chart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header with tools and stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Seating Chart Designer</h2>
          <div className="flex gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {stats.total} Seats
            </Badge>
            <Badge variant="secondary">
              {stats.assigned} Assigned
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={isAddSeatDialogOpen} onOpenChange={setIsAddSeatDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Seat
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Seat</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="seat_number">Seat Number</Label>
                  <Input
                    id="seat_number"
                    value={newSeatData.seat_number}
                    onChange={(e) => setNewSeatData({ ...newSeatData, seat_number: e.target.value })}
                    placeholder="A1, B2, etc."
                  />
                </div>
                
                <div>
                  <Label htmlFor="seat_type">Seat Type</Label>
                  <Select value={newSeatData.seat_type} onValueChange={(value: any) => setNewSeatData({ ...newSeatData, seat_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="accessible">Accessible</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="table_number">Table Number (Optional)</Label>
                  <Input
                    id="table_number"
                    value={newSeatData.table_number}
                    onChange={(e) => setNewSeatData({ ...newSeatData, table_number: e.target.value })}
                    placeholder="Table 1, Table A, etc."
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={newSeatData.notes}
                    onChange={(e) => setNewSeatData({ ...newSeatData, notes: e.target.value })}
                    placeholder="Any special notes about this seat..."
                  />
                </div>
                
                <Button onClick={handleAddSeat} className="w-full">
                  Add Seat
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={handleSaveLayout} size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Layout
          </Button>
          
          {onClose && (
            <Button onClick={onClose} variant="outline" size="sm">
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Seat type legend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Seat Legend
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span>Regular ({stats.regular})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span>VIP ({stats.vip})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span>Accessible ({stats.accessible})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span>Assigned ({stats.assigned})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
              <span>Blocked ({stats.blocked})</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* React Flow Canvas */}
      <div className="flex-1 border border-border rounded-lg overflow-hidden" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={handleNodeDragStop}
          nodeTypes={nodeTypes}
          fitView
          className="bg-background"
          onClick={onCanvasClick}
        >
          <Controls />
          <MiniMap />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
};