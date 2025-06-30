import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import { EventFormData } from "../EventWizard";
import { FormItem, FormLabel, FormControl, FormMessage, FormField } from "@/components/ui/form";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const eventTypes = [
  { value: "social", label: "Social" },
  { value: "corporate", label: "Corporate" },
  { value: "wedding", label: "Wedding" },
  { value: "conference", label: "Conference" },
  { value: "workshop", label: "Workshop" },
  { value: "other", label: "Other" },
];

export function BasicInfoStep() {
  const { register, formState: { errors }, control, setValue, watch } = useFormContext<EventFormData>();
  const selectedDate = watch("date");

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Event Details</h3>
        <p className="text-sm text-muted-foreground">
          Fill in the basic information about your event.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Event Title <span className="text-destructive">*</span></Label>
          <Input
            id="title"
            {...register("title", { required: "Event title is required" })}
            placeholder="e.g., Company Annual Conference"
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Event Description</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Describe your event..."
            rows={4}
          />
        </div>

        <FormField
          control={control}
          name="eventType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Type <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <ToggleGroup
                  type="single"
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex flex-wrap"
                >
                  {eventTypes.map((type) => (
                    <ToggleGroupItem key={type.value} value={type.value} aria-label={type.label}>
                      {type.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Label>Date and Time <span className="text-destructive">*</span></Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-full justify-start text-left font-normal"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {selectedDate ? format(new Date(selectedDate), "PPP p") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <ShadcnCalendar
                mode="single"
                selected={new Date(selectedDate)}
                onSelect={(date) => {
                  if (date) {
                    const time = selectedDate ? new Date(selectedDate).toTimeString().split(' ')[0] : '00:00';
                    const newDate = new Date(date.toDateString() + ' ' + time);
                    setValue("date", newDate.toISOString().slice(0, 16));
                  }
                }}
                initialFocus
              />
               <div className="p-3 border-t border-border">
                <Input
                    type="time"
                    value={selectedDate ? new Date(selectedDate).toTimeString().split(' ')[0] : ''}
                    onChange={(e) => {
                        const newTime = e.target.value;
                        const datePart = selectedDate ? new Date(selectedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
                        setValue("date", `${datePart}T${newTime}`);
                    }}
                />
              </div>
            </PopoverContent>
          </Popover>
          {errors.date && (
            <p className="text-sm text-destructive">{errors.date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location <span className="text-destructive">*</span></Label>
          <Input
            id="location"
            {...register("location", { required: "Event location is required" })}
            placeholder="e.g., Grand Hotel or Virtual Meeting Link"
          />
          {errors.location && (
            <p className="text-sm text-destructive">{errors.location.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
