
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "lucide-react";
import { FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { EventFormData } from "../EventWizard";
import { useWatch } from "react-hook-form";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function GuestSettingsStep() {
  const { register, control, formState: { errors } } = useFormContext<EventFormData>();
  const eventDate = useWatch({ control, name: "date" });
  const allowPlusOnes = useWatch({ control, name: "allowPlusOnes" });

  // Validate RSVP deadline is before event date
  const validateRsvpDeadline = (value: string) => {
    if (!value) return true; // Optional field
    
    const deadline = new Date(value);
    const event = new Date(eventDate || Date.now());
    
    if (deadline >= event) {
      return "RSVP deadline must be before the event date";
    }
    
    return true;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Guest Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure options for your guest list and RSVPs.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            type="number"
            min="0"
            {...register("capacity", {
              valueAsNumber: true,
              min: { value: 0, message: "Capacity cannot be negative" }
            })}
            placeholder="Leave blank for unlimited"
          />
          {errors.capacity && (
            <p className="text-sm text-destructive">{errors.capacity.message}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Maximum number of guests allowed. Leave blank for unlimited.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rsvpDeadline">RSVP Deadline</Label>
          <div className="relative">
            <Input
              id="rsvpDeadline"
              type="datetime-local"
              {...register("rsvpDeadline", {
                validate: validateRsvpDeadline
              })}
            />
            <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
          {errors.rsvpDeadline && (
            <p className="text-sm text-destructive">{errors.rsvpDeadline.message}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Set a deadline for guests to RSVP to your event.
          </p>
        </div>

        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">Allow Plus Ones</FormLabel>
            <FormDescription>
              Let guests bring additional attendees with them
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={allowPlusOnes}
              onCheckedChange={(value) => register("allowPlusOnes").onChange({ target: { value } })}
            />
          </FormControl>
        </FormItem>

        <Accordion type="single" collapsible>
          <AccordionItem value="advanced-options">
            <AccordionTrigger>Advanced Options</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Private Event</FormLabel>
                    <FormDescription>
                      Make this event visible only to invited guests
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch defaultChecked />
                  </FormControl>
                </FormItem>

                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Require Approval</FormLabel>
                    <FormDescription>
                      Manually approve each RSVP before confirming attendance
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch />
                  </FormControl>
                </FormItem>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
