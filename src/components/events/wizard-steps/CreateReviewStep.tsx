import { useFormContext } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { CalendarCheck, MapPin, Palette, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { eventTemplates } from "../EventTemplates";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { CreateEventFormData } from "../CreateEventWizard";

export function CreateReviewStep() {
  const { getValues } = useFormContext<CreateEventFormData>();
  const values = getValues();
  
  // Get template name from ID
  const templateName = eventTemplates.find(t => t.id === values.templateId)?.name || "Custom";
  
  // Format the date
  const formattedDate = values.date ? format(new Date(values.date), "PPP 'at' p") : "Not set";

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Review & Create Draft</h3>
        <p className="text-sm text-muted-foreground">
          Review your event details. This will create a draft that you can complete later.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Your event will be created as a draft. You'll need to complete guest settings, guest list, and communication preferences before publishing.
        </AlertDescription>
      </Alert>

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

            <div>
              <Label className="text-sm text-muted-foreground">Still needed to publish:</Label>
              <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                <li>• Guest settings (capacity, RSVP deadline)</li>
                <li>• Guest list or invitation method</li>
                <li>• Communication preferences</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}