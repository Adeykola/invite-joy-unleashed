import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SeatingChartDesigner } from '@/components/seating/SeatingChartDesigner';
import { SeatAssignmentDialog } from '@/components/seating/SeatAssignmentDialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Users, Settings, Calendar } from 'lucide-react';

const AdminSeating = () => {
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);

  // Fetch all events for admin
  const { data: events, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, date, location')
        .order('date', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Fetch seating statistics for all events
  const { data: seatingStats } = useQuery({
    queryKey: ['admin-seating-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seating_charts')
        .select(`
          id,
          event_id,
          name,
          events (
            title,
            date
          ),
          seats (
            id,
            seat_type,
            seat_assignments (
              id
            )
          )
        `);

      if (error) throw error;
      
      return data?.map(chart => ({
        eventId: chart.event_id,
        eventTitle: chart.events?.title,
        eventDate: chart.events?.date,
        chartName: chart.name,
        totalSeats: chart.seats?.length || 0,
        assignedSeats: chart.seats?.filter(seat => 
          seat.seat_assignments && Array.isArray(seat.seat_assignments) && seat.seat_assignments.length > 0
        ).length || 0,
        vipSeats: chart.seats?.filter(seat => seat.seat_type === 'vip').length || 0,
        accessibleSeats: chart.seats?.filter(seat => seat.seat_type === 'accessible').length || 0,
      })) || [];
    },
  });

  if (isLoadingEvents) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Seating Management</h1>
          <p className="text-muted-foreground">Manage seating charts and assignments across all events</p>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <Badge variant="outline">Admin Access</Badge>
        </div>
      </div>

      {/* Statistics Overview */}
      {seatingStats && seatingStats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {seatingStats.length}
                </div>
                <p className="text-sm text-muted-foreground">Events with Seating</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {seatingStats.reduce((sum, stat) => sum + stat.totalSeats, 0)}
                </div>
                <p className="text-sm text-muted-foreground">Total Seats</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {seatingStats.reduce((sum, stat) => sum + stat.assignedSeats, 0)}
                </div>
                <p className="text-sm text-muted-foreground">Assigned Seats</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {seatingStats.reduce((sum, stat) => sum + stat.vipSeats, 0)}
                </div>
                <p className="text-sm text-muted-foreground">VIP Seats</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Event Selection and Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Event Seating Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-sm">
                <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an event to manage..." />
                  </SelectTrigger>
                  <SelectContent>
                  {events?.map((event) => (
                    <SelectItem key={`event-${event.id}`} value={event.id}>
                      {event.title} - {new Date(event.date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedEventId && (
                <Button 
                  onClick={() => setIsAssignmentDialogOpen(true)}
                  variant="outline"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Assignments
                </Button>
              )}
            </div>

            {!selectedEventId && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select an event above to manage its seating chart</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Seating Chart Designer */}
      {selectedEventId && (
        <Card>
          <CardContent className="p-0">
            <SeatingChartDesigner eventId={selectedEventId} />
          </CardContent>
        </Card>
      )}

      {/* Events with Seating Statistics */}
      {seatingStats && seatingStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Seating Overview by Event</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {seatingStats.map((stat) => (
                <div key={`stat-${stat.eventId}`} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{stat.eventTitle}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(stat.eventDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-semibold">{stat.totalSeats}</div>
                      <div className="text-muted-foreground">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-green-600">{stat.assignedSeats}</div>
                      <div className="text-muted-foreground">Assigned</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-yellow-600">{stat.vipSeats}</div>
                      <div className="text-muted-foreground">VIP</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-blue-600">{stat.accessibleSeats}</div>
                      <div className="text-muted-foreground">Accessible</div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedEventId(stat.eventId);
                        setTimeout(() => {
                          document.getElementById('seating-chart')?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }}
                    >
                      Manage
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seat Assignment Dialog */}
      <SeatAssignmentDialog
        open={isAssignmentDialogOpen}
        onOpenChange={setIsAssignmentDialogOpen}
        eventId={selectedEventId}
      />
    </div>
  );
};

export default AdminSeating;