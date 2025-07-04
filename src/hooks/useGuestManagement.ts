
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface DetailedGuest {
  id: string;
  name: string;
  email: string;
  phone_number?: string;
  category?: string;
  is_vip?: boolean;
  plus_one_allowed?: boolean;
  plus_one_name?: string;
  dietary_restrictions?: string;
  notes?: string;
  invite_sent?: boolean;
  invited_at?: string;
  rsvp_status?: string;
  rsvp_date?: string;
  ticket_code?: string;
  checked_in?: boolean;
  payment_status?: string;
}

export interface GuestStats {
  total_guests: number;
  invited_guests: number;
  rsvp_confirmed: number;
  rsvp_declined: number;
  rsvp_pending: number;
  vip_guests: number;
  checked_in_guests: number;
  pending_invites: number;
}

export const useGuestManagement = (eventId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch detailed guest list
  const { data: guests, isLoading: isLoadingGuests } = useQuery({
    queryKey: ["event-guests-detailed", eventId],
    queryFn: async () => {
      if (!eventId) return [];

      const { data, error } = await supabase.rpc('get_event_guests_detailed', {
        p_event_id: eventId
      });

      if (error) throw error;
      return data as DetailedGuest[];
    },
    enabled: !!eventId,
  });

  // Fetch guest statistics
  const { data: guestStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["event-guest-stats", eventId],
    queryFn: async () => {
      if (!eventId) return null;

      const { data, error } = await supabase.rpc('get_event_guest_stats', {
        p_event_id: eventId
      });

      if (error) throw error;
      return data[0] as GuestStats;
    },
    enabled: !!eventId,
  });

  // Add new guest
  const addGuestMutation = useMutation({
    mutationFn: async (guestData: {
      name: string;
      email: string;
      phone_number?: string;
      category?: string;
      is_vip?: boolean;
      plus_one_allowed?: boolean;
      plus_one_name?: string;
      dietary_restrictions?: string;
      notes?: string;
    }) => {
      if (!eventId) throw new Error("Event ID is required");

      const { data, error } = await supabase
        .from("event_guests")
        .insert({
          event_id: eventId,
          ...guestData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-guests-detailed", eventId] });
      queryClient.invalidateQueries({ queryKey: ["event-guest-stats", eventId] });
      toast({
        title: "Guest Added",
        description: "Guest has been successfully added to the event.",
      });
    },
    onError: (error) => {
      console.error("Error adding guest:", error);
      toast({
        title: "Error",
        description: "Failed to add guest. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update guest
  const updateGuestMutation = useMutation({
    mutationFn: async ({ guestId, updates }: {
      guestId: string;
      updates: Partial<DetailedGuest>;
    }) => {
      const { data, error } = await supabase
        .from("event_guests")
        .update(updates)
        .eq("id", guestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-guests-detailed", eventId] });
      queryClient.invalidateQueries({ queryKey: ["event-guest-stats", eventId] });
      toast({
        title: "Guest Updated",
        description: "Guest information has been successfully updated.",
      });
    },
    onError: (error) => {
      console.error("Error updating guest:", error);
      toast({
        title: "Error",
        description: "Failed to update guest. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete guest
  const deleteGuestMutation = useMutation({
    mutationFn: async (guestId: string) => {
      const { error } = await supabase
        .from("event_guests")
        .delete()
        .eq("id", guestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-guests-detailed", eventId] });
      queryClient.invalidateQueries({ queryKey: ["event-guest-stats", eventId] });
      toast({
        title: "Guest Removed",
        description: "Guest has been successfully removed from the event.",
      });
    },
    onError: (error) => {
      console.error("Error deleting guest:", error);
      toast({
        title: "Error",
        description: "Failed to remove guest. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Bulk invite guests
  const bulkInviteMutation = useMutation({
    mutationFn: async (guestEmails: string[]) => {
      if (!eventId) throw new Error("Event ID is required");

      const { data, error } = await supabase.rpc('bulk_invite_guests', {
        p_event_id: eventId,
        p_guest_emails: guestEmails
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["event-guests-detailed", eventId] });
      queryClient.invalidateQueries({ queryKey: ["event-guest-stats", eventId] });
      
      const successful = results?.filter((r: any) => r.status === 'updated').length || 0;
      const errors = results?.filter((r: any) => r.status === 'error').length || 0;

      toast({
        title: "Bulk Invite Complete",
        description: `${successful} invites sent, ${errors} errors.`,
      });
    },
    onError: (error) => {
      console.error("Error sending bulk invites:", error);
      toast({
        title: "Error",
        description: "Failed to send bulk invites. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    guests,
    guestStats,
    isLoadingGuests,
    isLoadingStats,
    addGuest: addGuestMutation.mutate,
    updateGuest: updateGuestMutation.mutate,
    deleteGuest: deleteGuestMutation.mutate,
    bulkInvite: bulkInviteMutation.mutate,
    isAddingGuest: addGuestMutation.isPending,
    isUpdatingGuest: updateGuestMutation.isPending,
    isDeletingGuest: deleteGuestMutation.isPending,
    isBulkInviting: bulkInviteMutation.isPending,
  };
};
