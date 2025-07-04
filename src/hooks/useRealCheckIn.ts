
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CheckInResult {
  ticket_code: string;
  guest_name: string;
  status: 'success' | 'warning' | 'error';
  message: string;
}

export const useRealCheckIn = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const singleCheckInMutation = useMutation({
    mutationFn: async ({ eventId, ticketCode }: { eventId: string; ticketCode: string }) => {
      const { data: rsvp, error: findError } = await supabase
        .from("rsvps")
        .select("*")
        .eq("ticket_code", ticketCode)
        .eq("event_id", eventId)
        .single();

      if (findError || !rsvp) {
        throw new Error("Ticket not found");
      }

      if (rsvp.response_status !== 'confirmed') {
        throw new Error("Ticket not confirmed");
      }

      if (rsvp.checked_in) {
        throw new Error("Already checked in");
      }

      const { error: updateError } = await supabase
        .from("rsvps")
        .update({ 
          checked_in: true, 
          check_in_time: new Date().toISOString() 
        })
        .eq("id", rsvp.id);

      if (updateError) throw updateError;

      return {
        ticket_code: ticketCode,
        guest_name: rsvp.guest_name,
        status: 'success' as const,
        message: 'Checked in successfully'
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["event-check-in-stats"] });
      queryClient.invalidateQueries({ queryKey: ["rsvps"] });
      toast({
        title: "Check-in Successful",
        description: `${data.guest_name} has been checked in successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Check-in Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const bulkCheckInMutation = useMutation({
    mutationFn: async ({ eventId, ticketCodes }: { eventId: string; ticketCodes: string[] }) => {
      const { data, error } = await supabase.rpc('bulk_check_in', {
        p_ticket_codes: ticketCodes,
        p_event_id: eventId
      });

      if (error) throw error;
      return data as CheckInResult[];
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["event-check-in-stats"] });
      queryClient.invalidateQueries({ queryKey: ["rsvps"] });
      
      const successful = results.filter(r => r.status === 'success').length;
      const warnings = results.filter(r => r.status === 'warning').length;
      const errors = results.filter(r => r.status === 'error').length;

      toast({
        title: "Bulk Check-in Complete",
        description: `${successful} successful, ${warnings} warnings, ${errors} errors`,
      });
    },
  });

  const getEventCheckInStats = (eventId: string) => {
    return useQuery({
      queryKey: ["event-check-in-stats", eventId],
      queryFn: async () => {
        const { data, error } = await supabase.rpc('get_event_check_in_stats', {
          p_event_id: eventId
        });

        if (error) throw error;
        return data[0];
      },
      enabled: !!eventId,
    });
  };

  return {
    singleCheckIn: singleCheckInMutation.mutate,
    bulkCheckIn: bulkCheckInMutation.mutate,
    getEventCheckInStats,
    isCheckingIn: singleCheckInMutation.isPending || bulkCheckInMutation.isPending,
  };
};
