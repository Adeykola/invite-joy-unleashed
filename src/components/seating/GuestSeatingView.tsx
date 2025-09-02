import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSeatingChart } from '@/hooks/useSeatingChart';
import { MapPin, Users, Calendar } from 'lucide-react';

interface GuestSeatingViewProps {
  eventId: string;
  guestEmail?: string;
}

export const GuestSeatingView: React.FC<GuestSeatingViewProps> = ({
  eventId,
  guestEmail,
}) => {
  const { seatingChart, isLoadingChart } = useSeatingChart(eventId);

  const guestSeat = seatingChart?.seats.find(seat => seat.guest_email === guestEmail);

  if (isLoadingChart) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading seating information...</p>
        </div>
      </div>
    );
  }

  if (!seatingChart) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Seating Chart Available</h3>
          <p className="text-muted-foreground">
            The host hasn't set up a seating chart for this event yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!guestSeat) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Seat Not Assigned</h3>
          <p className="text-muted-foreground">
            Your seat will be assigned closer to the event date. Check back soon!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Seat Assignment Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Your Seat Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default" className="text-lg py-2 px-4">
                  Seat {guestSeat.seat_number}
                </Badge>
                {guestSeat.seat_type !== 'regular' && (
                  <Badge variant="secondary">
                    {guestSeat.seat_type.toUpperCase()}
                  </Badge>
                )}
              </div>
              
              {guestSeat.table_number && (
                <p className="text-muted-foreground">
                  Table {guestSeat.table_number}
                </p>
              )}
              
              {guestSeat.notes && (
                <p className="text-sm text-muted-foreground mt-2">
                  Note: {guestSeat.notes}
                </p>
              )}
            </div>
            
            <div className="text-right">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary">
                <span className="text-primary font-bold">
                  {guestSeat.seat_number}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seating Chart Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Event Seating Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {seatingChart.seats.length}
              </div>
              <p className="text-sm text-muted-foreground">Total Seats</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {seatingChart.seats.filter(s => s.assigned_rsvp_id).length}
              </div>
              <p className="text-sm text-muted-foreground">Assigned</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {seatingChart.seats.filter(s => s.seat_type === 'vip').length}
              </div>
              <p className="text-sm text-muted-foreground">VIP Seats</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {seatingChart.seats.filter(s => s.seat_type === 'accessible').length}
              </div>
              <p className="text-sm text-muted-foreground">Accessible</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seat Types Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Seat Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm">Regular</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">VIP</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Accessible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary rounded-full"></div>
              <span className="text-sm">Your Seat</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};