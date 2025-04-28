
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import { EventFormData } from "../EventWizard";
import { FormItem, FormLabel, FormControl, FormMessage, FormField } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function BasicInfoStep() {
  const { register, formState: { errors }, control } = useFormContext<EventFormData>();

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
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="social">Social Gathering</SelectItem>
                  <SelectItem value="corporate">Corporate Event</SelectItem>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="conference">Conference</SelectItem>
                  <SelectItem value="workshop">Workshop/Training</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Label htmlFor="date">Date and Time <span className="text-destructive">*</span></Label>
          <div className="relative">
            <Input
              id="date"
              type="datetime-local"
              {...register("date", { required: "Event date is required" })}
            />
            <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
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
