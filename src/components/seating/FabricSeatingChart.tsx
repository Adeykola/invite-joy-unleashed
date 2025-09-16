import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Circle, Rect, Group, Text, FabricObject } from 'fabric';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSeatingChart } from '@/hooks/useSeatingChart';
import { useGuestManagement } from '@/hooks/useGuestManagement';
import { toast } from 'sonner';
import { Plus, Save, Users, Settings } from 'lucide-react';

interface FabricSeatingChartProps {
  eventId: string;
}

interface TableConfig {
  type: 'round' | 'rectangle' | 'cocktail';
  seats: number;
  label: string;
}

export const FabricSeatingChart: React.FC<FabricSeatingChartProps> = ({ eventId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [isAddTableDialogOpen, setIsAddTableDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<FabricObject | null>(null);
  const [newTableConfig, setNewTableConfig] = useState<TableConfig>({
    type: 'round',
    seats: 8,
    label: ''
  });

  const { 
    seatingChart, 
    createChart, 
    updateChart,
    addSeat,
    updateSeat,
    deleteSeat,
    assignSeat,
    isCreatingChart,
    isAddingSeat
  } = useSeatingChart(eventId);

  const { guests } = useGuestManagement(eventId);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 1200,
      height: 800,
      backgroundColor: '#f8fafc',
      selection: true
    });

    setFabricCanvas(canvas);

    // Create seating chart if it doesn't exist
    if (!seatingChart && !isCreatingChart) {
      createChart({
        name: 'Main Seating Chart',
        venue_width: 1200,
        venue_height: 800
      });
    }

    return () => {
      canvas.dispose();
    };
  }, [eventId, seatingChart, isCreatingChart, createChart]);

  // Load existing seats and tables
  useEffect(() => {
    if (!fabricCanvas || !seatingChart?.seats) return;

    fabricCanvas.clear();
    
    // Group seats by table and create table objects
    const tableGroups = seatingChart.seats.reduce((acc, seat) => {
      const tableNumber = seat.table_number || 'No Table';
      if (!acc[tableNumber]) acc[tableNumber] = [];
      acc[tableNumber].push(seat);
      return acc;
    }, {} as Record<string, any[]>);

    Object.entries(tableGroups).forEach(([tableNumber, seats]) => {
      if (tableNumber === 'No Table') {
        // Create individual seats
        seats.forEach(seat => {
          const chair = createChair(seat.position_x, seat.position_y, seat);
          fabricCanvas.add(chair);
        });
      } else {
        // Create table with chairs
        const avgX = seats.reduce((sum, seat) => sum + seat.position_x, 0) / seats.length;
        const avgY = seats.reduce((sum, seat) => sum + seat.position_y, 0) / seats.length;
        
        const table = createTable(avgX, avgY, {
          type: seats.length > 6 ? 'round' : 'rectangle',
          seats: seats.length,
          label: tableNumber
        }, seats);
        
        fabricCanvas.add(table);
      }
    });

    fabricCanvas.renderAll();
  }, [fabricCanvas, seatingChart]);

  const createTable = (x: number, y: number, config: TableConfig, existingSeats?: any[]) => {
    const group = new Group();
    
    // Create table surface
    let tableSurface: FabricObject;
    
    if (config.type === 'round') {
      tableSurface = new Circle({
        radius: 60,
        fill: 'hsl(var(--card))',
        stroke: 'hsl(var(--border))',
        strokeWidth: 2
      });
    } else {
      tableSurface = new Rect({
        width: config.type === 'cocktail' ? 40 : 120,
        height: config.type === 'cocktail' ? 40 : 80,
        fill: 'hsl(var(--card))',
        stroke: 'hsl(var(--border))',
        strokeWidth: 2,
        rx: 8,
        ry: 8
      });
    }

    group.add(tableSurface);

    // Add table label
    const label = new Text(config.label || `Table ${Math.floor(Math.random() * 100)}`, {
      fontSize: 12,
      fill: 'hsl(var(--foreground))',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
      top: config.type === 'cocktail' ? 0 : -5
    });
    
    group.add(label);

    // Create chairs around the table
    if (config.type !== 'cocktail') {
      const chairs = [];
      const radius = config.type === 'round' ? 80 : 70;
      
      for (let i = 0; i < config.seats; i++) {
        const angle = (i / config.seats) * 2 * Math.PI;
        const chairX = Math.cos(angle) * radius;
        const chairY = Math.sin(angle) * radius;
        
        const existingSeat = existingSeats?.[i];
        const chair = createChairForTable(chairX, chairY, existingSeat);
        chairs.push(chair);
        group.add(chair);
      }
    }

    group.set({
      left: x,
      top: y,
      selectable: true,
      hasControls: true,
      hasBorders: true
    });

    // Store metadata
    group.set('tableConfig', config);
    group.set('tableId', `table_${Date.now()}`);

    return group;
  };

  const createChair = (x: number, y: number, seatData?: any) => {
    const chair = new Circle({
      radius: 15,
      left: x,
      top: y,
      fill: getSeatColor(seatData?.seat_type, !!seatData?.assigned_rsvp_id),
      stroke: 'hsl(var(--border))',
      strokeWidth: 1,
      selectable: true,
      hasControls: false,
      hasBorders: false
    });

    // Store seat data
    if (seatData) {
      chair.set('seatData', seatData);
      chair.set('seatId', seatData.id);
    }

    return chair;
  };

  const createChairForTable = (relativeX: number, relativeY: number, seatData?: any) => {
    const chair = new Circle({
      radius: 12,
      left: relativeX,
      top: relativeY,
      fill: getSeatColor(seatData?.seat_type, !!seatData?.assigned_rsvp_id),
      stroke: 'hsl(var(--border))',
      strokeWidth: 1,
      selectable: false,
      evented: false
    });

    if (seatData) {
      chair.set('seatData', seatData);
      chair.set('seatId', seatData.id);
    }

    return chair;
  };

  const getSeatColor = (seatType?: string, isAssigned?: boolean) => {
    if (isAssigned) return '#10b981'; // success color
    
    switch (seatType) {
      case 'vip': return '#f59e0b'; // warning color
      case 'accessible': return '#3b82f6'; // info color
      case 'blocked': return '#6b7280'; // muted color
      default: return '#8b5cf6'; // primary color
    }
  };

  const handleAddTable = () => {
    if (!fabricCanvas) return;

    const centerX = fabricCanvas.width! / 2;
    const centerY = fabricCanvas.height! / 2;

    const table = createTable(centerX, centerY, newTableConfig);
    fabricCanvas.add(table);
    fabricCanvas.setActiveObject(table);
    fabricCanvas.renderAll();

    // Save table and seats to database
    saveTableToDatabase(table, newTableConfig);

    setIsAddTableDialogOpen(false);
    setNewTableConfig({ type: 'round', seats: 8, label: '' });
    toast.success('Table added successfully');
  };

  const saveTableToDatabase = async (tableGroup: Group, config: TableConfig) => {
    if (!seatingChart) return;

    try {
      const tableLabel = config.label || `Table ${Math.floor(Math.random() * 100)}`;
      
      // Create seats for this table
      for (let i = 0; i < config.seats; i++) {
        await addSeat({
          seat_number: `${tableLabel}-${i + 1}`,
          position_x: tableGroup.left! + (i * 5), // Temporary positions
          position_y: tableGroup.top! + (i * 5),
          seat_type: 'regular',
          table_number: tableLabel
        });
      }
    } catch (error) {
      console.error('Error saving table:', error);
      toast.error('Failed to save table');
    }
  };

  const handleSaveLayout = async () => {
    if (!fabricCanvas || !seatingChart) return;

    try {
      const canvasData = fabricCanvas.toJSON();
      
      await updateChart({
        layout_data: canvasData,
        venue_width: fabricCanvas.width!,
        venue_height: fabricCanvas.height!
      });

      toast.success('Layout saved successfully');
    } catch (error) {
      console.error('Error saving layout:', error);
      toast.error('Failed to save layout');
    }
  };

  const getSeatingStats = () => {
    if (!seatingChart?.seats) return { total: 0, assigned: 0, vip: 0, accessible: 0 };

    const total = seatingChart.seats.length;
    const assigned = seatingChart.seats.filter(seat => seat.assigned_rsvp_id).length;
    const vip = seatingChart.seats.filter(seat => seat.seat_type === 'vip').length;
    const accessible = seatingChart.seats.filter(seat => seat.seat_type === 'accessible').length;

    return { total, assigned, vip, accessible };
  };

  const stats = getSeatingStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Event Hall Designer</h2>
          <p className="text-muted-foreground">Create your perfect seating arrangement</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsAddTableDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Table
          </Button>
          <Button onClick={handleSaveLayout} variant="outline" className="gap-2">
            <Save className="h-4 w-4" />
            Save Layout
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Seats</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold" style={{ color: '#10b981' }}>{stats.assigned}</div>
            <div className="text-sm text-muted-foreground">Assigned</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold" style={{ color: '#f59e0b' }}>{stats.vip}</div>
            <div className="text-sm text-muted-foreground">VIP Seats</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold" style={{ color: '#3b82f6' }}>{stats.accessible}</div>
            <div className="text-sm text-muted-foreground">Accessible</div>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#8b5cf6' }}></div>
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#10b981' }}></div>
              <span className="text-sm">Assigned</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#f59e0b' }}></div>
              <span className="text-sm">VIP</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#3b82f6' }}></div>
              <span className="text-sm">Accessible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#6b7280' }}></div>
              <span className="text-sm">Blocked</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Canvas */}
      <Card>
        <CardContent className="p-0">
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="border border-border rounded-lg w-full"
              style={{ maxHeight: '600px' }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Add Table Dialog */}
      <Dialog open={isAddTableDialogOpen} onOpenChange={setIsAddTableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Table</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="tableType">Table Type</Label>
              <Select 
                value={newTableConfig.type} 
                onValueChange={(value: any) => setNewTableConfig(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="round">Round Table</SelectItem>
                  <SelectItem value="rectangle">Rectangular Table</SelectItem>
                  <SelectItem value="cocktail">Cocktail Table</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="seats">Number of Seats</Label>
              <Select 
                value={newTableConfig.seats.toString()} 
                onValueChange={(value) => setNewTableConfig(prev => ({ ...prev, seats: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2, 4, 6, 8, 10, 12].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num} seats</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="label">Table Label</Label>
              <Input
                id="label"
                placeholder="e.g., Family Table, VIP Section"
                value={newTableConfig.label}
                onChange={(e) => setNewTableConfig(prev => ({ ...prev, label: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddTableDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTable} disabled={isAddingSeat}>
                Add Table
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};