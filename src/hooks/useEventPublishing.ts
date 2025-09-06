import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface CompletionChecklist {
  basic_info: boolean;
  guest_settings: boolean;
  guest_list: boolean;
  communication: boolean;
  design: boolean;
}

export const useEventPublishing = () => {
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();

  const validateEventCompletion = async (eventId: string): Promise<{ 
    isComplete: boolean; 
    checklist: CompletionChecklist;
    missingItems: string[];
  }> => {
    try {
      const { data: event, error } = await supabase
        .from("events")
        .select("*, completion_checklist")
        .eq("id", eventId)
        .single();

      if (error) throw error;

      const checklist = (event.completion_checklist as any as CompletionChecklist) || {
        basic_info: false,
        guest_settings: false,
        guest_list: false,
        communication: false,
        design: false
      };

      // Check if guest list has entries
      const { data: guests } = await supabase
        .from("event_guests")
        .select("id")
        .eq("event_id", eventId)
        .limit(1);

      if (guests && guests.length > 0) {
        checklist.guest_list = true;
      }

      const missingItems: string[] = [];
      if (!checklist.basic_info) missingItems.push("Basic information");
      if (!checklist.guest_settings) missingItems.push("Guest settings");
      if (!checklist.guest_list) missingItems.push("Guest list");
      if (!checklist.communication) missingItems.push("Communication preferences");
      if (!checklist.design) missingItems.push("Design customization");

      const isComplete = missingItems.length === 0;

      return { isComplete, checklist, missingItems };
    } catch (error) {
      console.error("Error validating event completion:", error);
      return { 
        isComplete: false, 
        checklist: {
          basic_info: false,
          guest_settings: false,
          guest_list: false,
          communication: false,
          design: false
        },
        missingItems: ["Unable to validate completion"]
      };
    }
  };

  const publishEvent = async (eventId: string): Promise<boolean> => {
    setIsPublishing(true);
    try {
      const validation = await validateEventCompletion(eventId);

      if (!validation.isComplete) {
        toast({
          title: "Cannot Publish Event",
          description: `Please complete: ${validation.missingItems.join(", ")}`,
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from("events")
        .update({ 
          status: 'published',
          completion_checklist: validation.checklist as any
        })
        .eq("id", eventId);

      if (error) throw error;

      toast({
        title: "Event Published",
        description: "Your event is now live and visible to guests!",
      });

      return true;
    } catch (error: any) {
      console.error("Error publishing event:", error);
      toast({
        title: "Publishing Failed",
        description: error?.message || "Failed to publish event",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsPublishing(false);
    }
  };

  const unpublishEvent = async (eventId: string): Promise<boolean> => {
    setIsPublishing(true);
    try {
      const { error } = await supabase
        .from("events")
        .update({ status: 'draft' })
        .eq("id", eventId);

      if (error) throw error;

      toast({
        title: "Event Unpublished",
        description: "Your event has been moved back to draft status.",
      });

      return true;
    } catch (error: any) {
      console.error("Error unpublishing event:", error);
      toast({
        title: "Unpublishing Failed",
        description: error?.message || "Failed to unpublish event",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsPublishing(false);
    }
  };

  return {
    publishEvent,
    unpublishEvent,
    validateEventCompletion,
    isPublishing
  };
};