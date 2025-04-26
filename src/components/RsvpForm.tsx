
import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type RsvpFormData = {
  guest_name: string;
  guest_email: string;
  response_status: "confirmed" | "declined" | "maybe";
  comments?: string;
};

export function RsvpForm({ eventId }: { eventId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset } = useForm<RsvpFormData>();

  const onSubmit = async (data: RsvpFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("rsvps").insert([
        {
          event_id: eventId,
          ...data,
        },
      ]);

      if (error) throw error;

      toast({
        title: "RSVP Submitted",
        description: "Thank you for your response!",
      });
      reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit RSVP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="guest_name">Name</Label>
        <Input
          id="guest_name"
          {...register("guest_name", { required: true })}
          placeholder="Your name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="guest_email">Email</Label>
        <Input
          id="guest_email"
          type="email"
          {...register("guest_email", { required: true })}
          placeholder="your@email.com"
        />
      </div>

      <div className="space-y-2">
        <Label>Will you attend?</Label>
        <RadioGroup defaultValue="confirmed">
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="confirmed"
              id="confirmed"
              {...register("response_status")}
            />
            <Label htmlFor="confirmed">Yes, I'll be there</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="maybe"
              id="maybe"
              {...register("response_status")}
            />
            <Label htmlFor="maybe">Maybe</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="declined"
              id="declined"
              {...register("response_status")}
            />
            <Label htmlFor="declined">No, I can't make it</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="comments">Comments (optional)</Label>
        <Textarea
          id="comments"
          {...register("comments")}
          placeholder="Any dietary requirements or messages for the host?"
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit RSVP"}
      </Button>
    </form>
  );
}
