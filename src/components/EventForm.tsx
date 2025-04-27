
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

type EventFormData = {
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
};

export function EventForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset } = useForm<EventFormData>();

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("events").insert([{
        ...data,
        capacity: Number(data.capacity)
      }]);

      if (error) throw error;

      toast({
        title: "Event Created",
        description: "Your event has been created successfully!",
      });
      reset();
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
        {isSubmitting ? "Creating..." : "Create Event"}
      </Button>
    </form>
  );
}
