
import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { 
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage 
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Video, Mic } from "lucide-react";

export function VirtualEventStep() {
  const { control, watch, setValue } = useFormContext();
  const isVirtual = watch("isVirtual") || false;
  const virtualPlatform = watch("virtualPlatform");
  
  const handleVirtualToggle = (value: boolean) => {
    setValue("isVirtual", value);
    if (!value) {
      // Reset virtual meeting fields if virtual is turned off
      setValue("virtualPlatform", "");
      setValue("virtualMeetingUrl", "");
      setValue("virtualMeetingId", "");
      setValue("virtualMeetingPassword", "");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Virtual Event Options</h3>
        <p className="text-sm text-muted-foreground">
          Configure virtual meeting details for remote attendees
        </p>
      </div>

      <FormField
        control={control}
        name="isVirtual"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">
                Virtual Event
              </FormLabel>
              <FormDescription>
                Enable virtual attendance for this event
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={handleVirtualToggle}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {isVirtual && (
        <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
          <div className="flex items-center space-x-2">
            <Video className="h-5 w-5 text-blue-500" />
            <h4 className="font-medium">Configure Virtual Meeting</h4>
          </div>

          <FormField
            control={control}
            name="virtualPlatform"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Platform</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="zoom">Zoom</SelectItem>
                    <SelectItem value="meet">Google Meet</SelectItem>
                    <SelectItem value="teams">Microsoft Teams</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the platform you'll use for your virtual event
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="virtualMeetingUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meeting URL</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://zoom.us/j/123456789" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  The link attendees will use to join your meeting
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="virtualMeetingId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting ID (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="123 456 789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="virtualMeetingPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Password (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="abc123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800 flex items-start">
            <Mic className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <p>
              Virtual meeting details will be shared with confirmed attendees in their RSVP confirmation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
