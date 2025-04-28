
import { useFormContext } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { CalendarCheck, MapPin, Users, Bell, Palette } from "lucide-react";
import { EventFormData } from "../EventWizard";
import { Badge } from "@/components/ui/badge";
import { eventTemplates } from "../EventTemplates";

export function ReviewStep() {
  const { getValues } = useFormContext<EventFormData>();
  const values = getValues();
  
  // Get template name from ID
  const templateName = eventTemplates.find(t => t.id === values.templateId)?.name || "Custom";
  
  // Format the date
  const formattedDate = values.date ? format(new Date(values.date), "PPP 'at' p") : "Not set";
  
  // Format RSVP deadline
  const rsvpDeadlineFormatted = values.rsvpDeadline 
    ? format(new Date(values.rsvpDeadline), "PPP")
    : "No deadline";

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Review Your Event</h3>
        <p className="text-sm text-muted-foreground">
          Review all details before creating your event.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">Event Title</Label>
              <h3 className="text-lg font-medium">{values.title || "Untitled Event"}</h3>
            </div>
            
            {values.description && (
              <div>
                <Label className="text-sm text-muted-foreground">Description</Label>
                <p className="text-sm">{values.description}</p>
              </div>
            )}
            
            <div className="flex items-center text-sm">
              <Badge variant="outline">{values.eventType}</Badge>
            </div>
            
            <div className="flex items-center text-sm">
              <CalendarCheck className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{formattedDate}</span>
            </div>
            
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{values.location}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">Guest Settings</Label>
              <div className="mt-2 text-sm space-y-2">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    Capacity: {values.capacity ? `${values.capacity} guests` : "Unlimited"}
                  </span>
                </div>
                <div>RSVP Deadline: {rsvpDeadlineFormatted}</div>
                <div>Plus Ones: {values.allowPlusOnes ? "Allowed" : "Not allowed"}</div>
              </div>
            </div>
            
            <div>
              <Label className="text-sm text-muted-foreground">Communication</Label>
              <div className="mt-2 text-sm space-y-2">
                <div className="flex items-center">
                  <Bell className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    Invites via: {values.inviteMethod?.join(", ") || "Email"}
                  </span>
                </div>
                <div>
                  Reminders: {values.sendReminders 
                    ? `${values.reminderDays} days before event` 
                    : "Not enabled"}
                </div>
              </div>
            </div>
            
            <div>
              <Label className="text-sm text-muted-foreground">Design</Label>
              <div className="mt-2 text-sm space-y-2">
                <div className="flex items-center">
                  <Palette className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Template: {templateName}</span>
                </div>
                <div className="flex items-center">
                  <div 
                    className="h-4 w-4 rounded-full mr-2" 
                    style={{ backgroundColor: values.primaryColor }}
                  />
                  <span>Primary Color: {values.primaryColor}</span>
                </div>
                <div className="flex items-center">
                  <div 
                    className="h-4 w-4 rounded-full mr-2" 
                    style={{ backgroundColor: values.accentColor }}
                  />
                  <span>Accent Color: {values.accentColor}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
