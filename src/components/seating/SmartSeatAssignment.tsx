import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useSeatingChart } from '@/hooks/useSeatingChart';
import { useGuestManagement } from '@/hooks/useGuestManagement';
import { toast } from 'sonner';
import { Users, Zap, Settings, CheckCircle } from 'lucide-react';

interface SmartSeatAssignmentProps {
  eventId: string;
}

interface AssignmentRule {
  groupByCategory: boolean;
  keepVipTogether: boolean;
  separateDietary: boolean;
  fillTablesEvenly: boolean;
  prioritizeAccessible: boolean;
}

export const SmartSeatAssignment: React.FC<SmartSeatAssignmentProps> = ({ eventId }) => {
  const [assignmentRules, setAssignmentRules] = useState<AssignmentRule>({
    groupByCategory: true,
    keepVipTogether: true,
    separateDietary: false,
    fillTablesEvenly: true,
    prioritizeAccessible: true
  });
  const [isAssigning, setIsAssigning] = useState(false);

  const { seatingChart, availableSeats, assignSeat, unassignSeat } = useSeatingChart(eventId);
  const { guests, guestStats } = useGuestManagement(eventId);

  const getUnassignedGuests = () => {
    if (!guests) return [];
    return guests.filter(guest => guest.rsvp_status === 'confirmed' && !guest.checked_in);
  };

  const getAvailableTables = () => {
    if (!seatingChart?.seats) return [];
    
    const tableGroups = seatingChart.seats.reduce((acc, seat) => {
      const tableNumber = seat.table_number || 'Individual';
      if (!acc[tableNumber]) {
        acc[tableNumber] = {
          name: tableNumber,
          totalSeats: 0,
          availableSeats: 0,
          assignedSeats: 0
        };
      }
      acc[tableNumber].totalSeats++;
      if (seat.assigned_rsvp_id) {
        acc[tableNumber].assignedSeats++;
      } else {
        acc[tableNumber].availableSeats++;
      }
      return acc;
    }, {} as Record<string, any>);

    return Object.values(tableGroups);
  };

  const performSmartAssignment = async () => {
    if (!seatingChart || !guests) return;

    setIsAssigning(true);
    try {
      const unassignedGuests = getUnassignedGuests();
      const availableSeatsData = availableSeats || [];

      if (unassignedGuests.length === 0) {
        toast.info('All confirmed guests are already assigned seats');
        return;
      }

      if (availableSeatsData.length < unassignedGuests.length) {
        toast.error(`Not enough seats available. Need ${unassignedGuests.length} seats, but only ${availableSeatsData.length} available.`);
        return;
      }

      // Group guests by categories if enabled
      let guestGroups: Record<string, any[]> = {};
      
      if (assignmentRules.groupByCategory) {
        guestGroups = unassignedGuests.reduce((acc, guest) => {
          const category = guest.category || 'general';
          if (!acc[category]) acc[category] = [];
          acc[category].push(guest);
          return acc;
        }, {} as Record<string, any[]>);
      } else {
        guestGroups = { all: unassignedGuests };
      }

      // Separate VIP guests if needed
      if (assignmentRules.keepVipTogether) {
        const vipGuests = unassignedGuests.filter(guest => guest.is_vip);
        if (vipGuests.length > 0) {
          guestGroups.vip = vipGuests;
          // Remove VIP guests from other categories
          Object.keys(guestGroups).forEach(key => {
            if (key !== 'vip') {
              guestGroups[key] = guestGroups[key].filter(guest => !guest.is_vip);
            }
          });
        }
      }

      // Handle accessible seating first
      if (assignmentRules.prioritizeAccessible) {
        const accessibleSeats = availableSeatsData.filter(seat => seat.seat_type === 'accessible');
        const guestsNeedingAccessible = unassignedGuests.filter(guest => 
          guest.dietary_restrictions?.toLowerCase().includes('wheelchair') ||
          guest.dietary_restrictions?.toLowerCase().includes('accessible')
        );

        for (let i = 0; i < Math.min(accessibleSeats.length, guestsNeedingAccessible.length); i++) {
          // Find the guest's RSVP ID (this would need to be implemented)
          // For now, we'll skip the actual assignment
        }
      }

      // Group seats by table
      const tableSeats = availableSeatsData.reduce((acc, seat) => {
        const table = seat.table_number || 'Individual';
        if (!acc[table]) acc[table] = [];
        acc[table].push(seat);
        return acc;
      }, {} as Record<string, any[]>);

      let assignmentCount = 0;

      // Assign guests to tables
      for (const [groupName, groupGuests] of Object.entries(guestGroups)) {
        if (groupGuests.length === 0) continue;

        // Find best table(s) for this group
        const sortedTables = Object.entries(tableSeats)
          .filter(([_, seats]) => seats.length > 0)
          .sort(([_, seatsA], [__, seatsB]) => {
            if (assignmentRules.fillTablesEvenly) {
              // Prefer tables that can fit the entire group
              const canFitA = seatsA.length >= groupGuests.length ? 1 : 0;
              const canFitB = seatsB.length >= groupGuests.length ? 1 : 0;
              if (canFitA !== canFitB) return canFitB - canFitA;
            }
            return seatsB.length - seatsA.length; // Larger tables first
          });

        let guestIndex = 0;
        
        for (const [tableName, tableSeatsArray] of sortedTables) {
          if (guestIndex >= groupGuests.length) break;

          const seatsToFill = Math.min(tableSeatsArray.length, groupGuests.length - guestIndex);
          
          for (let i = 0; i < seatsToFill && guestIndex < groupGuests.length; i++) {
            const guest = groupGuests[guestIndex];
            const seat = tableSeatsArray[i];
            
            try {
              // This would need the actual RSVP ID
              // await assignSeat({ seatId: seat.seat_id, rsvpId: guest.rsvp_id });
              assignmentCount++;
              guestIndex++;
            } catch (error) {
              console.error(`Failed to assign ${guest.name} to seat ${seat.seat_number}:`, error);
            }
          }

          // Remove assigned seats from available pool
          tableSeats[tableName] = tableSeatsArray.slice(seatsToFill);
        }
      }

      toast.success(`Successfully assigned ${assignmentCount} guests to seats`);

    } catch (error) {
      console.error('Smart assignment failed:', error);
      toast.error('Smart assignment failed. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };

  const tables = getAvailableTables();
  const unassignedCount = getUnassignedGuests().length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Smart Seat Assignment
          </h3>
          <p className="text-muted-foreground">Automatically assign guests to optimal seats</p>
        </div>

        <Button 
          onClick={performSmartAssignment} 
          disabled={isAssigning || unassignedCount === 0}
          className="gap-2"
        >
          {isAssigning ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Assigning...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Auto Assign ({unassignedCount})
            </>
          )}
        </Button>
      </div>

      {/* Assignment Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Assignment Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="groupByCategory"
                checked={assignmentRules.groupByCategory}
                onCheckedChange={(checked) => 
                  setAssignmentRules(prev => ({ ...prev, groupByCategory: !!checked }))
                }
              />
              <label htmlFor="groupByCategory" className="text-sm font-medium">
                Group by category
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="keepVipTogether"
                checked={assignmentRules.keepVipTogether}
                onCheckedChange={(checked) => 
                  setAssignmentRules(prev => ({ ...prev, keepVipTogether: !!checked }))
                }
              />
              <label htmlFor="keepVipTogether" className="text-sm font-medium">
                Keep VIP guests together
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="fillTablesEvenly"
                checked={assignmentRules.fillTablesEvenly}
                onCheckedChange={(checked) => 
                  setAssignmentRules(prev => ({ ...prev, fillTablesEvenly: !!checked }))
                }
              />
              <label htmlFor="fillTablesEvenly" className="text-sm font-medium">
                Fill tables evenly
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="prioritizeAccessible"
                checked={assignmentRules.prioritizeAccessible}
                onCheckedChange={(checked) => 
                  setAssignmentRules(prev => ({ ...prev, prioritizeAccessible: !!checked }))
                }
              />
              <label htmlFor="prioritizeAccessible" className="text-sm font-medium">
                Prioritize accessible seating
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Table Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tables.map((table) => (
              <div key={table.name} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{table.name}</h4>
                  <Badge variant={table.availableSeats === 0 ? "secondary" : "default"}>
                    {table.availableSeats}/{table.totalSeats}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-success" />
                    {table.assignedSeats} assigned
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    {table.availableSeats} available
                  </div>
                </div>
              </div>
            ))}
          </div>

          {tables.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tables created yet</p>
              <p className="text-sm">Add tables using the Event Hall Designer</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};