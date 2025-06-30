import { useFormContext, useWatch, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar, Gem } from "lucide-react";
import { FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { EventFormData } from "../EventWizard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function GuestSettingsStep() {
  const { register, control, formState: { errors } } = useFormContext<EventFormData>();
  const eventDate = useWatch({ control, name: "date" });

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

        <FormField
          control={control}
          name="allowPlusOnes"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Allow Plus Ones</FormLabel>
                <FormDescription>
                  Let guests bring additional attendees with them.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Accordion type="single" collapsible>
          <AccordionItem value="advanced-options">
            <AccordionTrigger>Advanced Options</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base flex items-center">
                      Private Event
                      <Badge variant="outline" className="ml-2 border-yellow-400 text-yellow-600">
                        <Gem className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    </FormLabel>
                    <FormDescription>
                      Make this event visible only to invited guests.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                           <Switch disabled />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>This is a premium feature. Please upgrade to use.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
