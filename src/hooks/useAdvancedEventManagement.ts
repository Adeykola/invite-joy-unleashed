
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AdvancedEventData {
  id?: string;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity?: number;
  event_type: string;
  is_private: boolean;
  require_approval: boolean;
  max_guests_per_rsvp: number;
  registration_deadline?: string;
  tags: string[];
  custom_fields?: Record<string, any>;
  banner_image?: string;
}

export const useAdvancedEventManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createAdvancedEventMutation = useMutation({
    mutationFn: async (eventData: AdvancedEventData) => {
      const { data, error } = await supabase
        .from("events")
        .insert({
          ...eventData,
          host_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Event Created",
        description: `"${data.title}" has been created successfully.`,
      });
    },
    onError: (error) => {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, ...eventData }: AdvancedEventData & { id: string }) => {
      const { data, error } = await supabase
        .from("events")
        .update(eventData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Event Updated",
        description: `"${data.title}" has been updated successfully.`,
      });
    },
  });

  const duplicateEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { data: originalEvent, error: fetchError } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (fetchError) throw fetchError;

      const { id, created_at, updated_at, ...eventDataToCopy } = originalEvent;
      
      const { data, error } = await supabase
        .from("events")
        .insert({
          ...eventDataToCopy,
          title: `${originalEvent.title} (Copy)`,
          host_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Event Duplicated",
        description: `"${data.title}" has been created as a copy.`,
      });
    },
  });

  const bulkUpdateEventsMutation = useMutation({
    mutationFn: async ({ eventIds, updates }: { eventIds: string[]; updates: Partial<AdvancedEventData> }) => {
      const { data, error } = await supabase
        .from("events")
        .update(updates)
        .in("id", eventIds)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Events Updated",
        description: `${data.length} events have been updated successfully.`,
      });
    },
  });

  const getEventAnalytics = useQuery({
    queryKey: ["event-analytics"],
    queryFn: async () => {
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("id, title, created_at, capacity");

      if (eventsError) throw eventsError;

      const { data: rsvps, error: rsvpsError } = await supabase
        .from("rsvps")
        .select("event_id, response_status");

      if (rsvpsError) throw rsvpsError;

      // Calculate analytics
      const analytics = events.map(event => {
        const eventRsvps = rsvps.filter(rsvp => rsvp.event_id === event.id);
        const confirmed = eventRsvps.filter(rsvp => rsvp.response_status === "confirmed").length;
        const pending = eventRsvps.filter(rsvp => rsvp.response_status === "pending").length;
        const declined = eventRsvps.filter(rsvp => rsvp.response_status === "declined").length;
        
        return {
          ...event,
          rsvp_stats: {
            total: eventRsvps.length,
            confirmed,
            pending,
            declined,
            response_rate: eventRsvps.length > 0 ? ((confirmed + declined) / eventRsvps.length) * 100 : 0,
            fill_rate: event.capacity ? (confirmed / event.capacity) * 100 : 0,
          },
        };
      });

      return analytics;
    },
  });

  return {
    createAdvancedEvent: createAdvancedEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    duplicateEvent: duplicateEventMutation.mutate,
    bulkUpdateEvents: bulkUpdateEventsMutation.mutate,
    eventAnalytics: getEventAnalytics.data,
    isCreating: createAdvancedEventMutation.isPending,
    isUpdating: updateEventMutation.isPending,
    isDuplicating: duplicateEventMutation.isPending,
    isBulkUpdating: bulkUpdateEventsMutation.isPending,
    isLoadingAnalytics: getEventAnalytics.isLoading,
  };
};
