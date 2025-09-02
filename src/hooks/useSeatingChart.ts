import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Seat {
  id: string;
  seat_number: string;
  position_x: number;
  position_y: number;
  seat_type: 'regular' | 'vip' | 'accessible' | 'blocked';
  table_number?: string;
  notes?: string;
  assigned_rsvp_id?: string;
  guest_name?: string;
  guest_email?: string;
}

export interface SeatingChart {
  id: string;
  name: string;
  layout_data: any;
  venue_width: number;
  venue_height: number;
  seats: Seat[];
}

export const useSeatingChart = (eventId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch seating chart details
  const { data: seatingChart, isLoading: isLoadingChart } = useQuery({
    queryKey: ["seating-chart", eventId],
    queryFn: async () => {
      if (!eventId) return null;

      const { data, error } = await supabase.rpc('get_seating_chart_details', {
        p_event_id: eventId
      });

      if (error) throw error;
      
      if (!data || data.length === 0) return null;

      // Group data into chart and seats
      const chartData = data[0];
      const seats = data
        .filter((row: any) => row.seat_id)
        .map((row: any) => ({
          id: row.seat_id,
          seat_number: row.seat_number,
          position_x: row.position_x,
          position_y: row.position_y,
          seat_type: row.seat_type,
          table_number: row.table_number,
          notes: row.seat_notes,
          assigned_rsvp_id: row.assigned_rsvp_id,
          guest_name: row.guest_name,
          guest_email: row.guest_email,
        }));

      return {
        id: chartData.chart_id,
        name: chartData.chart_name,
        layout_data: chartData.layout_data,
        venue_width: chartData.venue_width,
        venue_height: chartData.venue_height,
        seats,
      } as SeatingChart;
    },
    enabled: !!eventId,
  });

  // Fetch available seats
  const { data: availableSeats } = useQuery({
    queryKey: ["available-seats", eventId],
    queryFn: async () => {
      if (!eventId) return [];

      const { data, error } = await supabase.rpc('get_available_seats', {
        p_event_id: eventId
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!eventId,
  });

  // Create seating chart
  const createChartMutation = useMutation({
    mutationFn: async (chartData: {
      name: string;
      venue_width?: number;
      venue_height?: number;
    }) => {
      if (!eventId) throw new Error("Event ID is required");

      const { data, error } = await supabase
        .from("seating_charts")
        .insert({
          event_id: eventId,
          name: chartData.name,
          venue_width: chartData.venue_width || 800,
          venue_height: chartData.venue_height || 600,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seating-chart", eventId] });
      toast({
        title: "Seating Chart Created",
        description: "Your seating chart has been successfully created.",
      });
    },
    onError: (error) => {
      console.error("Error creating seating chart:", error);
      toast({
        title: "Error",
        description: "Failed to create seating chart. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update seating chart
  const updateChartMutation = useMutation({
    mutationFn: async (updates: {
      name?: string;
      layout_data?: any;
      venue_width?: number;
      venue_height?: number;
    }) => {
      if (!seatingChart?.id) throw new Error("No seating chart found");

      const { data, error } = await supabase
        .from("seating_charts")
        .update(updates)
        .eq("id", seatingChart.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seating-chart", eventId] });
      toast({
        title: "Chart Updated",
        description: "Seating chart has been successfully updated.",
      });
    },
    onError: (error) => {
      console.error("Error updating seating chart:", error);
      toast({
        title: "Error",
        description: "Failed to update seating chart. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Add seat
  const addSeatMutation = useMutation({
    mutationFn: async (seatData: {
      seat_number: string;
      position_x: number;
      position_y: number;
      seat_type?: 'regular' | 'vip' | 'accessible' | 'blocked';
      table_number?: string;
      notes?: string;
    }) => {
      if (!seatingChart?.id) throw new Error("No seating chart found");

      const { data, error } = await supabase
        .from("seats")
        .insert({
          seating_chart_id: seatingChart.id,
          ...seatData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seating-chart", eventId] });
      queryClient.invalidateQueries({ queryKey: ["available-seats", eventId] });
    },
    onError: (error) => {
      console.error("Error adding seat:", error);
      toast({
        title: "Error",
        description: "Failed to add seat. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update seat
  const updateSeatMutation = useMutation({
    mutationFn: async ({ seatId, updates }: {
      seatId: string;
      updates: Partial<Seat>;
    }) => {
      const { data, error } = await supabase
        .from("seats")
        .update(updates)
        .eq("id", seatId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seating-chart", eventId] });
      queryClient.invalidateQueries({ queryKey: ["available-seats", eventId] });
    },
    onError: (error) => {
      console.error("Error updating seat:", error);
      toast({
        title: "Error",
        description: "Failed to update seat. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete seat
  const deleteSeatMutation = useMutation({
    mutationFn: async (seatId: string) => {
      const { error } = await supabase
        .from("seats")
        .delete()
        .eq("id", seatId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seating-chart", eventId] });
      queryClient.invalidateQueries({ queryKey: ["available-seats", eventId] });
    },
    onError: (error) => {
      console.error("Error deleting seat:", error);
      toast({
        title: "Error",
        description: "Failed to delete seat. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Assign seat to RSVP
  const assignSeatMutation = useMutation({
    mutationFn: async ({ seatId, rsvpId }: {
      seatId: string;
      rsvpId: string;
    }) => {
      const { data, error } = await supabase
        .from("seat_assignments")
        .insert({
          seat_id: seatId,
          rsvp_id: rsvpId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seating-chart", eventId] });
      queryClient.invalidateQueries({ queryKey: ["available-seats", eventId] });
      toast({
        title: "Seat Assigned",
        description: "Seat has been successfully assigned.",
      });
    },
    onError: (error) => {
      console.error("Error assigning seat:", error);
      toast({
        title: "Error",
        description: "Failed to assign seat. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Unassign seat
  const unassignSeatMutation = useMutation({
    mutationFn: async (seatId: string) => {
      const { error } = await supabase
        .from("seat_assignments")
        .delete()
        .eq("seat_id", seatId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seating-chart", eventId] });
      queryClient.invalidateQueries({ queryKey: ["available-seats", eventId] });
      toast({
        title: "Seat Unassigned",
        description: "Seat assignment has been removed.",
      });
    },
    onError: (error) => {
      console.error("Error unassigning seat:", error);
      toast({
        title: "Error",
        description: "Failed to unassign seat. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    seatingChart,
    availableSeats,
    isLoadingChart,
    createChart: createChartMutation.mutate,
    updateChart: updateChartMutation.mutate,
    addSeat: addSeatMutation.mutate,
    updateSeat: updateSeatMutation.mutate,
    deleteSeat: deleteSeatMutation.mutate,
    assignSeat: assignSeatMutation.mutate,
    unassignSeat: unassignSeatMutation.mutate,
    isCreatingChart: createChartMutation.isPending,
    isUpdatingChart: updateChartMutation.isPending,
    isAddingSeat: addSeatMutation.isPending,
    isUpdatingSeat: updateSeatMutation.isPending,
    isDeletingSeat: deleteSeatMutation.isPending,
    isAssigningSeat: assignSeatMutation.isPending,
    isUnassigningSeat: unassignSeatMutation.isPending,
  };
};