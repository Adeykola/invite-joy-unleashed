
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
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { BasicInfoStep } from "./wizard-steps/BasicInfoStep";
import { GuestSettingsStep } from "./wizard-steps/GuestSettingsStep";
import { CommunicationStep } from "./wizard-steps/CommunicationStep";
import { CustomizationStep } from "./wizard-steps/CustomizationStep";
import { ReviewStep } from "./wizard-steps/ReviewStep";
import { GuestListStep, Guest } from "./wizard-steps/GuestListStep";
import { EventTemplate, eventTemplates } from "./EventTemplates";
import { validateImageFile } from "@/lib/storage";

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
  
  // Guest List
  guests: Guest[];
  
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
  { id: "guestList", label: "Guest List" },
  { id: "communication", label: "Communication" },
  { id: "design", label: "Design" },
  { id: "review", label: "Review" }
];

export function EventWizard({ eventId: initialEventId, onSuccess }: EventWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [customBanner, setCustomBanner] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState({ logo: 0, banner: 0 });
  const [uploadError, setUploadError] = useState<string | null>(null);
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
      guests: [],
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
    if (initialEventId) {
      setIsLoading(true);
      const fetchEvent = async () => {
        try {
          const { data, error } = await supabase
            .from("events")
            .select("*")
            .eq("id", initialEventId)
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
            
            // Check if we have meta data 
            let metaData: any = null;
            
            // Try to parse meta data from the meta field if it exists
            if (data.meta !== undefined) {
              try {
                // Handle string or object meta
                const metaField = data.meta;
                metaData = typeof metaField === 'string' ? JSON.parse(metaField) : metaField;
                console.log("Found meta data:", metaData);
              } catch (e) {
                console.error("Error parsing meta data:", e);
              }
            }
            
            // If we couldn't get meta from the meta field, try to parse from description as fallback
            if (!metaData && data.description && data.description.startsWith('{') && data.description.endsWith('}')) {
              try {
                metaData = JSON.parse(data.description);
                console.log("Parsed meta data from description:", metaData);
              } catch (e) {
                console.error("Error parsing meta data from description:", e);
              }
            }
            
            // Process the meta data if we have it
            if (metaData) {
              processMetaData(metaData);
            }
            
            // Fetch guest list if editing an existing event
            fetchGuestList(initialEventId);
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
  }, [initialEventId, setValue, toast]);
  
  // Fetch guest list for an existing event
  const fetchGuestList = async (eventId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_event_guests', {
        p_event_id: eventId
      });
      
      if (error) {
        console.error("Error fetching guest list:", error);
        return;
      }
      
      if (data && data.length > 0) {
        console.log("Fetched guest list:", data);
        setValue("guests", data);
      }
    } catch (error) {
      console.error("Error fetching guest list:", error);
    }
  };

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
      // Clear any previous upload errors when moving forward
      setUploadError(null);
    }
  };

  const handleBack = (e?: React.MouseEvent) => {
    // Prevent default form submission behavior
    if (e) e.preventDefault();
    
    setCurrentStep(prev => Math.max(prev - 1, 0));
    // Clear any previous upload errors when moving back
    setUploadError(null);
  };
  
  const getCurrentStepFields = (): (keyof EventFormData)[] => {
    switch (currentStep) {
      case 0: // Basic Info
        return ["title", "date", "location", "eventType"];
      case 1: // Guest Settings
        return ["capacity", "rsvpDeadline", "allowPlusOnes"];
      case 2: // Guest List
        return ["guests"];
      case 3: // Communication
        return ["inviteMethod", "sendReminders", "reminderDays"];
      case 4: // Customization
        return ["templateId", "primaryColor", "accentColor"];
      case 5: // Review
        return [];
      default:
        return [];
    }
  };
  
  // Improved file upload function with better error handling and progress tracking
  const uploadFile = async (file: File | null | undefined, bucket: string): Promise<string | null> => {
    if (!file) {
      console.log(`No file provided for ${bucket}`);
      return null;
    }
    
    // Reset progress and errors
    setUploadProgress(prev => ({ ...prev, [bucket === 'event-logos' ? 'logo' : 'banner']: 0 }));
    setUploadError(null);
    
    try {
      // Validate file before upload
      if (!validateImageFile(file)) {
        const errorMsg = `Invalid file: ${file.name}. Must be an image under 10MB.`;
        setUploadError(errorMsg);
        throw new Error(errorMsg);
      }
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      console.log(`Uploading file to ${bucket}/${fileName}`, file);
      
      // First verify bucket exists and is accessible
      const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(bucket);
      
      if (bucketError) {
        console.error(`Bucket check error for ${bucket}:`, bucketError);
        setUploadError(`Storage bucket ${bucket} is not accessible. Please try again later.`);
        throw new Error(`Storage bucket ${bucket} does not exist or is not accessible.`);
      }
      
      // Upload to storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });
      
      if (error) {
        console.error(`Storage upload error:`, error);
        setUploadError(`Failed to upload your ${bucket === 'event-logos' ? 'logo' : 'banner'} file. ${error.message}`);
        throw error;
      }
      
      console.log(`File uploaded successfully:`, data);
      
      // Update progress
      setUploadProgress(prev => ({ ...prev, [bucket === 'event-logos' ? 'logo' : 'banner']: 100 }));
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);
      
      if (!publicUrlData || !publicUrlData.publicUrl) {
        const errorMsg = "Failed to get public URL for uploaded file";
        setUploadError(errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log(`Public URL generated:`, publicUrlData.publicUrl);
      
      return publicUrlData.publicUrl;
    } catch (error: any) {
      console.error(`Error uploading ${bucket} file:`, error);
      
      // Provide more detailed error messages
      const errorMessage = error?.message || `Failed to upload your ${bucket === 'event-logos' ? 'logo' : 'banner'} file.`;
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return null;
    }
  };

  const onSubmit = async (data: EventFormData) => {
    console.log("Form submission started with data:", data);
    setUploadError(null);
    
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
      let uploadFailed = false;
      
      // Only upload new files if they've been selected
      if (data.customLogo) {
        console.log("Uploading custom logo...");
        try {
          customLogoUrl = await uploadFile(data.customLogo, "event-logos");
          if (!customLogoUrl) {
            setUploadError("Logo upload failed. Please check the file type and size.");
            uploadFailed = true;
          }
        } catch (error) {
          console.error("Logo upload error:", error);
          setUploadError("Logo upload failed. Please try again.");
          uploadFailed = true;
        }
      }
      
      if (data.customBanner && !uploadFailed) {
        console.log("Uploading custom banner...");
        try {
          customBannerUrl = await uploadFile(data.customBanner, "event-banners");
          if (!customBannerUrl) {
            setUploadError("Banner upload failed. Please check the file type and size.");
            uploadFailed = true;
          }
        } catch (error) {
          console.error("Banner upload error:", error);
          setUploadError("Banner upload failed. Please try again.");
          uploadFailed = true;
        }
      }
      
      if (uploadFailed) {
        setIsSubmitting(false);
        return;
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
        meta: metaData
      };
      
      console.log("Submitting event with data:", eventData);
      console.log("User ID:", user.id);
      
      let newEventId = initialEventId;
      
      if (initialEventId) {
        // Update existing event
        console.log("Updating existing event:", initialEventId);
        const { error } = await supabase
          .from("events")
          .update({
            ...eventData,
            updated_at: new Date().toISOString()
          })
          .eq("id", initialEventId);

        if (error) {
          console.error("Error updating event:", error);
          throw error;
        }

        console.log("Event updated successfully");
      } else {
        // Create new event
        console.log("Creating new event with host_id:", user.id);
        const { data: newEvent, error } = await supabase
          .from("events")
          .insert([{
            ...eventData,
            host_id: user.id
          }])
          .select();

        if (error) {
          console.error("Error creating event:", error);
          throw error;
        }

        console.log("Event created successfully:", newEvent);
        newEventId = newEvent?.[0]?.id;
      }
      
      // If we have a valid eventId, save the guest list
      if (newEventId && data.guests && data.guests.length > 0) {
        console.log("Saving guest list for event:", newEventId);
        
        // First, if we're updating an existing event, remove old guests
        if (initialEventId) {
          const { error: deleteError } = await supabase
            .from("event_guests")
            .delete()
            .eq("event_id", initialEventId);
          
          if (deleteError) {
            console.error("Error removing old guests:", deleteError);
            // Continue anyway, as this is not critical
          }
        }
        
        // Prepare guest data for insertion
        const guestData = data.guests.map(guest => ({
          event_id: newEventId,
          name: guest.name,
          email: guest.email
        }));
        
        // Insert new guests
        const { error: insertError } = await supabase
          .from("event_guests")
          .insert(guestData);
        
        if (insertError) {
          console.error("Error saving guest list:", insertError);
          toast({
            title: "Warning",
            description: "Event was saved but there was an error saving the guest list.",
            variant: "destructive",
          });
        } else {
          console.log("Guest list saved successfully");
        }
      }
      
      toast({
        title: initialEventId ? "Event Updated" : "Event Created",
        description: `Your event has been ${initialEventId ? "updated" : "created"} successfully!`,
      });
      
      if (!initialEventId) {
        methods.reset();
      }
      
      if (onSuccess) {
        console.log("Calling onSuccess callback");
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error saving event:", error);
      
      // Provide a more specific error message
      const errorMessage = error?.message || `Failed to ${initialEventId ? "update" : "create"} event. Please try again.`;
      setUploadError(`Error: ${errorMessage}`);
      
      toast({
        title: "Error",
        description: `Failed to ${initialEventId ? "update" : "create"} event: ${errorMessage}`,
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
        return <GuestListStep />;
      case 3:
        return <CommunicationStep />;
      case 4:
        return <CustomizationStep 
          customLogo={customLogo}
          customBanner={customBanner}
          setCustomLogo={setCustomLogo}
          setCustomBanner={setCustomBanner}
        />;
      case 5:
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
                {initialEventId ? "Edit Event" : "Create New Event"}
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
            
            {uploadError && (
              <div className="mt-4 p-3 text-sm border border-red-300 bg-red-50 text-red-800 rounded-md">
                <strong>Error:</strong> {uploadError}
              </div>
            )}
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
                type="submit"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {initialEventId ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  initialEventId ? "Update Event" : "Create Event"
                )}
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
