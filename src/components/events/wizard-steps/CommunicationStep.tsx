
import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { EventFormData } from "../EventWizard";

const inviteOptions = [
  { id: "email", label: "Email" },
  { id: "sms", label: "SMS/Text" },
  { id: "link", label: "Shareable Link" },
  { id: "whatsapp", label: "WhatsApp" }
];

export function CommunicationStep() {
  const { control, watch } = useFormContext<EventFormData>();
  const { toast } = useToast();
  
  const sendReminders = watch("sendReminders");
  const reminderDays = watch("reminderDays");
  const inviteMethods = watch("inviteMethod") || [];
  
  const hasEmail = inviteMethods.includes("email");
  const hasSms = inviteMethods.includes("sms");
  const hasWhatsapp = inviteMethods.includes("whatsapp");
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Communication Settings</h3>
        <p className="text-sm text-muted-foreground">
          Choose how to invite guests and manage communication.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <Label>Invitation Methods</Label>
          <Controller
            name="inviteMethod"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {inviteOptions.map((option) => (
                  <FormItem
                    key={option.id}
                    className="flex items-center space-x-3 space-y-0 rounded-md border p-4"
                  >
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(option.id)}
                        onCheckedChange={(checked) => {
                          const updatedValue = checked
                            ? [...(field.value || []), option.id]
                            : (field.value || []).filter(
                                (value) => value !== option.id
                              );
                          field.onChange(updatedValue);
                        }}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer font-normal">
                      {option.label}
                    </FormLabel>
                  </FormItem>
                ))}
              </div>
            )}
          />
          <p className="text-sm text-muted-foreground">
            Select all the ways you want to invite guests to your event.
          </p>
        </div>

        {/* Email template section - only shown if email is selected */}
        {hasEmail && (
          <div className="space-y-4 rounded-md border p-4">
            <h4 className="font-medium">Email Settings</h4>
            <Controller
              name="emailSubject"
              control={control}
              defaultValue="You're invited!"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="You're invited!" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Controller
              name="emailTemplate"
              control={control}
              defaultValue="Hello, you're invited to my event! Please RSVP at the link below."
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Message</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Hello, you're invited to my event! Please RSVP at the link below."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Personalization tags: {"{guest_name}"}, {"{event_title}"}, {"{event_date}"}, {"{rsvp_link}"}
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>
        )}

        {/* SMS template section - only shown if SMS is selected */}
        {hasSms && (
          <div className="space-y-4 rounded-md border p-4">
            <h4 className="font-medium">SMS Settings</h4>
            <Controller
              name="smsTemplate"
              control={control}
              defaultValue="Hi {guest_name}! You're invited to {event_title}. RSVP here: {rsvp_link}"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SMS Message</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Hi {guest_name}! You're invited to {event_title}. RSVP here: {rsvp_link}" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Keep message short. Tags: {"{guest_name}"}, {"{event_title}"}, {"{rsvp_link}"}
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>
        )}

        {/* WhatsApp template section - only shown if WhatsApp is selected */}
        {hasWhatsapp && (
          <div className="space-y-4 rounded-md border p-4">
            <h4 className="font-medium">WhatsApp Settings</h4>
            <Controller
              name="whatsappTemplate"
              control={control}
              defaultValue="Hello {guest_name},\n\nYou're invited to {event_title} on {event_date}!\n\nPlease RSVP at: {rsvp_link}\n\nLooking forward to seeing you!"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp Message</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Hello {guest_name},\n\nYou're invited to {event_title} on {event_date}!\n\nPlease RSVP at: {rsvp_link}" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Personalization tags: {"{guest_name}"}, {"{event_title}"}, {"{event_date}"}, {"{rsvp_link}"}
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>
        )}

        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">Send Reminders</FormLabel>
            <FormDescription>
              Automatically send reminders to guests before the event
            </FormDescription>
          </div>
          <FormControl>
            <Controller
              name="sendReminders"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </FormControl>
        </FormItem>

        {sendReminders && (
          <div className="space-y-4">
            <Label>Days Before Event</Label>
            <Controller
              name="reminderDays"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Slider
                    value={[field.value]}
                    min={1}
                    max={14}
                    step={1}
                    onValueChange={(vals) => field.onChange(vals[0])}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>1 day</span>
                    <span>{reminderDays} {reminderDays === 1 ? 'day' : 'days'}</span>
                    <span>14 days</span>
                  </div>
                </div>
              )}
            />
            <p className="text-sm text-muted-foreground">
              Send reminders {reminderDays} {reminderDays === 1 ? 'day' : 'days'} before the event.
            </p>
          </div>
        )}

        <Accordion type="single" collapsible>
          <AccordionItem value="advanced-options">
            <AccordionTrigger>Advanced Options</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Send Thank You</FormLabel>
                    <FormDescription>
                      Automatically send thank you emails after the event
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Controller
                      name="sendThankYou"
                      control={control}
                      defaultValue={false}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </FormControl>
                </FormItem>

                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Collect Feedback</FormLabel>
                    <FormDescription>
                      Send a survey to attendees after the event
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Controller
                      name="collectFeedback"
                      control={control}
                      defaultValue={false}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
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
