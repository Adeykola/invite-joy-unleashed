
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Form,
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { PlusOneManager } from "./events/PlusOneManager";

type RsvpFormData = {
  guest_name: string;
  guest_email: string;
  response_status: "confirmed" | "declined" | "maybe";
  comments?: string;
  meal_choice?: string;
  dietary_restrictions?: string;
  needs_accommodation?: boolean;
  plusOnes?: Array<{
    id: string;
    name: string;
    email: string;
  }>;
};

export function RsvpForm({ eventId, mealOptions }: { eventId: string, mealOptions?: string[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const methods = useForm<RsvpFormData>({
    defaultValues: {
      guest_name: "",
      guest_email: "",
      response_status: "confirmed",
      comments: "",
      needs_accommodation: false,
      plusOnes: []
    }
  });

  const onSubmit = async (data: RsvpFormData) => {
    setIsSubmitting(true);
    try {
      const { plusOnes, ...rsvpData } = data;
      
      // Insert the main RSVP
      const { data: mainRsvp, error } = await supabase.from("rsvps").insert([
        {
          event_id: eventId,
          ...rsvpData,
        },
      ]).select();

      if (error) throw error;

      // Insert any plus-ones
      if (plusOnes && plusOnes.length > 0) {
        for (const guest of plusOnes) {
          await supabase.from("rsvps").insert([
            {
              event_id: eventId,
              guest_name: guest.name,
              guest_email: guest.email,
              response_status: "confirmed",
              comments: `Plus-one of ${data.guest_name}`,
            },
          ]);
        }
      }

      toast({
        title: "RSVP Submitted",
        description: "Thank you for your response!",
      });
      methods.reset();
    } catch (error) {
      console.error("Error submitting RSVP:", error);
      toast({
        title: "Error",
        description: "Failed to submit RSVP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const responseStatus = methods.watch("response_status");
  const showDetailFields = responseStatus === "confirmed" || responseStatus === "maybe";

  return (
    <FormProvider {...methods}>
      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={methods.control}
            name="guest_name"
            rules={{ required: "Name is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={methods.control}
            name="guest_email"
            rules={{ 
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address"
              }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="your@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={methods.control}
            name="response_status"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Will you attend?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="confirmed" id="confirmed" />
                      <Label htmlFor="confirmed">Yes, I'll be there</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="maybe" id="maybe" />
                      <Label htmlFor="maybe">Maybe</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="declined" id="declined" />
                      <Label htmlFor="declined">No, I can't make it</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {showDetailFields && (
            <>
              {mealOptions && mealOptions.length > 0 && (
                <FormField
                  control={methods.control}
                  name="meal_choice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meal Preference</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a meal option" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mealOptions.map((option, index) => (
                            <SelectItem key={index} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={methods.control}
                name="dietary_restrictions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dietary Restrictions</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Vegetarian, vegan, gluten-free, allergies, etc."
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={methods.control}
                name="needs_accommodation"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I require special accommodations
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              {responseStatus === "confirmed" && <PlusOneManager />}
            </>
          )}

          <FormField
            control={methods.control}
            name="comments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comments (optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Any dietary requirements, special accommodations, or messages for the host?"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Submit RSVP"}
          </Button>
        </form>
      </Form>
    </FormProvider>
  );
}
