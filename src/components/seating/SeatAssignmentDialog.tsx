import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useSeatingChart } from '@/hooks/useSeatingChart';
import { useGuestManagement } from '@/hooks/useGuestManagement';
import { Users, MapPin, Search } from 'lucide-react';

interface SeatAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
}

export const SeatAssignmentDialog: React.FC<SeatAssignmentDialogProps> = ({
  open,
  onOpenChange,
  eventId,
}) => {
  const { seatingChart, availableSeats, assignSeat, unassignSeat, isAssigningSeat, isUnassigningSeat } = useSeatingChart(eventId);
  const { guests } = useGuestManagement(eventId);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeat, setSelectedSeat] = useState<string>('');
  const [selectedGuest, setSelectedGuest] = useState<string>('');

  // Filter guests without seat assignments
  const unassignedGuests = guests?.filter(guest => 
    guest.rsvp_status === 'confirmed' && 
    !seatingChart?.seats.some(seat => seat.assigned_rsvp_id === guest.id) &&
    guest.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const assignedSeats = seatingChart?.seats.filter(seat => seat.assigned_rsvp_id) || [];

  const handleAssignSeat = () => {
    if (!selectedSeat || !selectedGuest) return;
    
    assignSeat({
      seatId: selectedSeat,
      rsvpId: selectedGuest,
    });

    setSelectedSeat('');
    setSelectedGuest('');
  };

  const handleUnassignSeat = (seatId: string) => {
    unassignSeat(seatId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Seat Assignments
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Assignment Form */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Assign New Seat
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Available Seats</label>
                  <Select value={selectedSeat} onValueChange={setSelectedSeat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select seat..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSeats?.map((seat) => (
                        <SelectItem key={seat.seat_id} value={seat.seat_id}>
                          {seat.seat_number} ({seat.seat_type})
                          {seat.table_number && ` - Table ${seat.table_number}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Confirmed Guests</label>
                  <Select value={selectedGuest} onValueChange={setSelectedGuest}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select guest..." />
                    </SelectTrigger>
                    <SelectContent>
                      {unassignedGuests.map((guest) => (
                        <SelectItem key={guest.id} value={guest.id}>
                          {guest.name} ({guest.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={handleAssignSeat}
                    disabled={!selectedSeat || !selectedGuest || isAssigningSeat}
                    className="w-full"
                  >
                    {isAssigningSeat ? 'Assigning...' : 'Assign Seat'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search Unassigned Guests */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Search unassigned guests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {unassignedGuests.map((guest) => (
                <Card key={guest.id}>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{guest.name}</h4>
                        <p className="text-sm text-muted-foreground">{guest.email}</p>
                        {guest.is_vip && (
                          <Badge variant="secondary" className="mt-1">VIP</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {unassignedGuests.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'No guests found matching your search.' : 'All confirmed guests have been assigned seats.'}
              </div>
            )}
          </div>

          {/* Current Assignments */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Current Assignments ({assignedSeats.length})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {assignedSeats.map((seat) => (
                <Card key={seat.id}>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">Seat {seat.seat_number}</Badge>
                          {seat.seat_type !== 'regular' && (
                            <Badge variant="secondary">{seat.seat_type}</Badge>
                          )}
                        </div>
                        <h4 className="font-medium">{seat.guest_name}</h4>
                        <p className="text-sm text-muted-foreground">{seat.guest_email}</p>
                        {seat.table_number && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Table {seat.table_number}
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={() => handleUnassignSeat(seat.id)}
                        variant="ghost"
                        size="sm"
                        disabled={isUnassigningSeat}
                      >
                        Unassign
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {assignedSeats.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No seats assigned yet. Start assigning seats to your guests above.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};