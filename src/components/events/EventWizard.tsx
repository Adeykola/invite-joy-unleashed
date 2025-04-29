
import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BasicInfoStep } from "./wizard-steps/BasicInfoStep";
import { GuestSettingsStep } from "./wizard-steps/GuestSettingsStep";
import { CommunicationStep } from "./wizard-steps/CommunicationStep";
import { CustomizationStep } from "./wizard-steps/CustomizationStep";
import { ReviewStep } from "./wizard-steps/ReviewStep";
import { EventTemplate, eventTemplates } from "./EventTemplates";

export type EventFormData = {
  // Basic Info
  title: string;
  description?: string;
  date: string;
  location: string;
  eventType: string;
  
  // Guest Settings
  capacity?: number;
  rsvpDeadline?: string;
  allowPlusOnes: boolean;
  
  // Communication
  inviteMethod: string[];
  sendReminders: boolean;
  reminderDays: number;
  
  // Customization
  templateId: string;
  customLogo?: File | null;
  customBanner?: File | null;
  primaryColor: string;
  accentColor: string;
};

interface EventWizardProps {
  eventId?: string;
  onSuccess?: () => void;
}

const STEPS = [
  { id: "basic", label: "Basic Info" },
  { id: "guests", label: "Guest Settings" },
  { id: "communication", label: "Communication" },
  { id: "design", label: "Design" },
  { id: "review", label: "Review" }
];

export function EventWizard({ eventId, onSuccess }: EventWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [customBanner, setCustomBanner] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const methods = useForm<EventFormData>({
    defaultValues: {
      title: "",
      description: "",
      date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      location: "",
      eventType: "social",
      capacity: 0,
      rsvpDeadline: "",
      allowPlusOnes: false,
      inviteMethod: ["email"],
      sendReminders: true,
      reminderDays: 2,
      templateId: "party",
      primaryColor: eventTemplates[2].primaryColor,  // Party template default
      accentColor: eventTemplates[2].accentColor,
    }
  });
  
  const { watch, setValue } = methods;
  
  // Watch template selection to update colors
  const selectedTemplateId = watch("templateId");
  
  useEffect(() => {
    if (selectedTemplateId) {
      const template = eventTemplates.find(t => t.id === selectedTemplateId);
      if (template && selectedTemplateId !== "custom") {
        setValue("primaryColor", template.primaryColor);
        setValue("accentColor", template.accentColor);
      }
    }
  }, [selectedTemplateId, setValue]);
  
  // Load event data if eventId is provided (edit mode)
  useEffect(() => {
    if (eventId) {
      setIsLoading(true);
      const fetchEvent = async () => {
        try {
          const { data, error } = await supabase
            .from("events")
            .select("*")
            .eq("id", eventId)
            .single();
            
          if (error) throw error;
          
          if (data) {
            console.log("Fetched event data:", data);
            
            // Format the date to match the datetime-local input
            const dateObj = new Date(data.date);
            const formattedDate = format(dateObj, "yyyy-MM-dd'T'HH:mm");
            
            // Set basic form data from existing event
            setValue("title", data.title);
            setValue("description", data.description || "");
            setValue("date", formattedDate);
            setValue("location", data.location);
            setValue("capacity", data.capacity || 0);
            
            // Check if we have meta data as a string and try to parse it
            if (data.description && data.description.startsWith('{') && data.description.endsWith('}')) {
              try {
                // Try to parse meta from description as a fallback
                const metaData = JSON.parse(data.description);
                processMetaData(metaData);
              } catch (e) {
                console.error("Error parsing meta data from description:", e);
              }
            } else {
              // Check if data has a meta property that's a string
              const metaField = (data as any).meta;
              if (metaField) {
                try {
                  // If meta is a string, parse it as JSON
                  const metaData = typeof metaField === 'string' ? JSON.parse(metaField) : metaField;
                  processMetaData(metaData);
                } catch (e) {
                  console.error("Error parsing event meta data:", e);
                }
              }
            }
          }
        } catch (error) {
          console.error("Error fetching event:", error);
          toast({
            title: "Error",
            description: "Failed to load event data.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchEvent();
    }
  }, [eventId, setValue, toast]);

  // Helper function to process meta data from various sources
  const processMetaData = (meta: any) => {
    if (!meta) return;
    
    console.log("Processing meta data:", meta);
    
    if (meta.templateId) setValue("templateId", meta.templateId);
    if (meta.primaryColor) setValue("primaryColor", meta.primaryColor);
    if (meta.accentColor) setValue("accentColor", meta.accentColor);
    if (meta.rsvpDeadline) setValue("rsvpDeadline", meta.rsvpDeadline);
    if (meta.allowPlusOnes !== undefined) setValue("allowPlusOnes", meta.allowPlusOnes);
    if (meta.inviteMethod) setValue("inviteMethod", meta.inviteMethod);
    if (meta.sendReminders !== undefined) setValue("sendReminders", meta.sendReminders);
    if (meta.reminderDays) setValue("reminderDays", meta.reminderDays);
    if (meta.eventType) setValue("eventType", meta.eventType);
    
    // Handle existing custom images if there are any
    if (meta.customLogoUrl) setCustomLogo(meta.customLogoUrl);
    if (meta.customBannerUrl) setCustomBanner(meta.customBannerUrl);
  };

  const handleNext = async (e?: React.MouseEvent) => {
    // Prevent default form submission behavior
    if (e) e.preventDefault();
    
    const isValid = await methods.trigger(getCurrentStepFields());
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handleBack = (e?: React.MouseEvent) => {
    // Prevent default form submission behavior
    if (e) e.preventDefault();
    
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };
  
  const getCurrentStepFields = (): (keyof EventFormData)[] => {
    switch (currentStep) {
      case 0: // Basic Info
        return ["title", "date", "location", "eventType"];
      case 1: // Guest Settings
        return ["capacity", "rsvpDeadline", "allowPlusOnes"];
      case 2: // Communication
        return ["inviteMethod", "sendReminders", "reminderDays"];
      case 3: // Customization
        return ["templateId", "primaryColor", "accentColor"];
      case 4: // Review
        return [];
      default:
        return [];
    }
  };
  
  // Handle file uploads
  const uploadFile = async (file: File, bucket: string): Promise<string | null> => {
    if (!file) return null;
    
    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      console.log(`Uploading file to ${bucket}/${fileName}`, file);
      
      // Upload to storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);
      
      if (error) {
        console.error(`Storage upload error:`, error);
        throw error;
      }
      
      console.log(`File uploaded successfully:`, data);
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);
      
      console.log(`Public URL generated:`, publicUrlData);
      
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error(`Error uploading ${bucket} file:`, error);
      toast({
        title: "Upload Failed",
        description: `Failed to upload your ${bucket} file.`,
        variant: "destructive",
      });
      return null;
    }
  };

  const onSubmit = async (data: EventFormData) => {
    console.log("Form submission started with data:", data);
    
    if (!user) {
      console.error("No authenticated user found");
      toast({
        title: "Error",
        description: "You must be logged in to create or edit events.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload custom files if any
      let customLogoUrl = customLogo;
      let customBannerUrl = customBanner;
      
      // Only upload new files if they've been selected
      if (data.customLogo) {
        console.log("Uploading custom logo...");
        customLogoUrl = await uploadFile(data.customLogo, "event-logos");
      }
      
      if (data.customBanner) {
        console.log("Uploading custom banner...");
        customBannerUrl = await uploadFile(data.customBanner, "event-banners");
      }
      
      // Prepare meta data to store additional fields
      const metaData = {
        templateId: data.templateId,
        primaryColor: data.primaryColor,
        accentColor: data.accentColor,
        rsvpDeadline: data.rsvpDeadline,
        allowPlusOnes: data.allowPlusOnes,
        inviteMethod: data.inviteMethod,
        sendReminders: data.sendReminders,
        reminderDays: data.reminderDays,
        eventType: data.eventType,
        customLogoUrl,
        customBannerUrl
      };
      
      // Gather basic event data
      const eventData = {
        title: data.title,
        description: data.description,
        date: data.date,
        location: data.location,
        capacity: Number(data.capacity) || null,
        meta: JSON.stringify(metaData)
      };
      
      console.log("Submitting event with data:", eventData);
      console.log("User ID:", user.id);
      
      if (eventId) {
        // Update existing event
        console.log("Updating existing event:", eventId);
        const { error } = await supabase
          .from("events")
          .update({
            ...eventData,
            updated_at: new Date().toISOString()
          })
          .eq("id", eventId);

        if (error) {
          console.error("Error updating event:", error);
          throw error;
        }

        console.log("Event updated successfully");
        toast({
          title: "Event Updated",
          description: "Your event has been updated successfully!",
        });
      } else {
        // Create new event
        console.log("Creating new event with host_id:", user.id);
        const { data: newEvent, error } = await supabase
          .from("events")
          .insert([{
            ...eventData,
            host_id: user.id
          }]);

        if (error) {
          console.error("Error creating event:", error);
          throw error;
        }

        console.log("Event created successfully:", newEvent);
        toast({
          title: "Event Created",
          description: "Your event has been created successfully!",
        });
        methods.reset();
      }
      
      if (onSuccess) {
        console.log("Calling onSuccess callback");
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving event:", error);
      toast({
        title: "Error",
        description: `Failed to ${eventId ? "update" : "create"} event. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="py-4 text-center">Loading event data...</div>;
  }

  const progressPercentage = ((currentStep + 1) / STEPS.length) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <BasicInfoStep />;
      case 1:
        return <GuestSettingsStep />;
      case 2:
        return <CommunicationStep />;
      case 3:
        return <CustomizationStep 
          customLogo={customLogo}
          customBanner={customBanner}
          setCustomLogo={setCustomLogo}
          setCustomBanner={setCustomBanner}
        />;
      case 4:
        return <ReviewStep />;
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium">
                {eventId ? "Edit Event" : "Create New Event"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].label}
              </p>
            </div>
            <Tabs value={STEPS[currentStep].id} className="hidden sm:block">
              <TabsList>
                {STEPS.map((step, index) => (
                  <TabsTrigger 
                    key={step.id} 
                    value={step.id} 
                    disabled={index > currentStep}
                    onClick={() => {
                      if (index <= currentStep) {
                        setCurrentStep(index);
                      }
                    }}
                  >
                    {step.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <Progress value={progressPercentage} className="h-2" />
        </div>

        <Card>
          <CardContent className="pt-6 md:min-h-[400px]">
            {renderStepContent()}
          </CardContent>
          <CardFooter className="flex justify-between border-t p-4">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={currentStep === 0}
              type="button"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            
            {currentStep === STEPS.length - 1 ? (
              <Button 
                onClick={methods.handleSubmit(onSubmit)}
                disabled={isSubmitting}
                type="button"
              >
                {isSubmitting ? (eventId ? "Updating..." : "Creating...") : (eventId ? "Update Event" : "Create Event")}
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                type="button"
              >
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </form>
    </FormProvider>
  );
}
