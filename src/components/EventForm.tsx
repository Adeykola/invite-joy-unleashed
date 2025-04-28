
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

type EventFormData = {
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
};

interface EventFormProps {
  eventId?: string;
  onSuccess?: () => void;
}

export function EventForm({ eventId, onSuccess }: EventFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue } = useForm<EventFormData>();
  const { user } = useAuth();
  
  // Load event data if eventId is provided (edit mode)
  useEffect(() => {
    if (eventId) {
      setIsLoading(true);
      const fetchEvent = async () => {
        try {
          const { data, error } = await supabase
            .from("events")
            .select("*")
            .eq("id", eventId)
            .single();
            
          if (error) throw error;
          
          if (data) {
            // Format the date to match the datetime-local input
            const dateObj = new Date(data.date);
            const formattedDate = format(dateObj, "yyyy-MM-dd'T'HH:mm");
            
            setValue("title", data.title);
            setValue("description", data.description || "");
            setValue("date", formattedDate);
            setValue("location", data.location);
            setValue("capacity", data.capacity || 0);
          }
        } catch (error) {
          console.error("Error fetching event:", error);
          toast({
            title: "Error",
            description: "Failed to load event data.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchEvent();
    }
  }, [eventId, setValue, toast]);

  const onSubmit = async (data: EventFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create or edit events.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (eventId) {
        // Update existing event
        const { error } = await supabase
          .from("events")
          .update({
            ...data,
            capacity: Number(data.capacity) || null,
            updated_at: new Date().toISOString()
          })
          .eq("id", eventId);

        if (error) throw error;

        toast({
          title: "Event Updated",
          description: "Your event has been updated successfully!",
        });
      } else {
        // Create new event
        const { error } = await supabase
          .from("events")
          .insert([{
            ...data,
            host_id: user.id,
            capacity: Number(data.capacity) || null
          }]);

        if (error) throw error;

        toast({
          title: "Event Created",
          description: "Your event has been created successfully!",
        });
        reset();
      }
      
      onSuccess?.();
    } catch (error) {
      console.error("Error saving event:", error);
      toast({
        title: "Error",
        description: `Failed to ${eventId ? "update" : "create"} event. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="py-4 text-center">Loading event data...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Input
          {...register("title", { required: true })}
          placeholder="Event Title"
        />
      </div>

      <div className="space-y-2">
        <Textarea
          {...register("description")}
          placeholder="Event Description"
        />
      </div>

      <div className="space-y-2">
        <Input
          type="datetime-local"
          {...register("date", { required: true })}
        />
      </div>

      <div className="space-y-2">
        <Input
          {...register("location", { required: true })}
          placeholder="Location"
        />
      </div>

      <div className="space-y-2">
        <Input
          type="number"
          {...register("capacity")}
          placeholder="Capacity (optional)"
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting 
          ? (eventId ? "Updating..." : "Creating...") 
          : (eventId ? "Update Event" : "Create Event")
        }
      </Button>
    </form>
  );
}
