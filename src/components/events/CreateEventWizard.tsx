import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { BasicInfoStep } from "./wizard-steps/BasicInfoStep";
import { CustomizationStep } from "./wizard-steps/CustomizationStep";
import { CreateReviewStep } from "./wizard-steps/CreateReviewStep";
import { eventTemplates } from "./EventTemplates";

export type CreateEventFormData = {
  // Basic Info
  title: string;
  description?: string;
  date: string;
  location: string;
  eventType: string;
  
  // Customization
  templateId: string;
  customLogo?: File | null;
  customBanner?: File | null;
  primaryColor: string;
  accentColor: string;
};

interface CreateEventWizardProps {
  onSuccess?: () => void;
}

const CREATE_STEPS = [
  { id: "basic", label: "Basic Info" },
  { id: "design", label: "Design" },
  { id: "review", label: "Review & Create Draft" }
];

export function CreateEventWizard({ onSuccess }: CreateEventWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [customBanner, setCustomBanner] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const methods = useForm<CreateEventFormData>({
    defaultValues: {
      title: "",
      description: "",
      date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      location: "",
      eventType: "social",
      templateId: "party",
      primaryColor: eventTemplates[2].primaryColor,  // Party template default
      accentColor: eventTemplates[2].accentColor,
    }
  });
  
  const { watch, setValue } = methods;
  
  // Watch template selection to update colors
  const selectedTemplateId = watch("templateId");
  
  React.useEffect(() => {
    if (selectedTemplateId) {
      const template = eventTemplates.find(t => t.id === selectedTemplateId);
      if (template && selectedTemplateId !== "custom") {
        setValue("primaryColor", template.primaryColor);
        setValue("accentColor", template.accentColor);
      }
    }
  }, [selectedTemplateId, setValue]);

  const handleNext = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    
    const isValid = await methods.trigger(getCurrentStepFields());
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, CREATE_STEPS.length - 1));
    }
  };

  const handleBack = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };
  
  const getCurrentStepFields = (): (keyof CreateEventFormData)[] => {
    switch (currentStep) {
      case 0: // Basic Info
        return ["title", "date", "location", "eventType"];
      case 1: // Design
        return ["templateId", "primaryColor", "accentColor"];
      case 2: // Review
        return [];
      default:
        return [];
    }
  };

  const onSubmit = async (data: CreateEventFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create events.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare meta data for design settings
      const metaData = {
        templateId: data.templateId,
        primaryColor: data.primaryColor,
        accentColor: data.accentColor,
        eventType: data.eventType,
        customLogoUrl: customLogo,
        customBannerUrl: customBanner
      };
      
      // Create draft event with basic completion checklist
      const eventData = {
        title: data.title,
        description: data.description,
        date: data.date,
        location: data.location,
        status: 'draft',
        completion_checklist: {
          basic_info: true,
          guest_settings: false,
          guest_list: false,
          communication: false,
          design: true
        },
        meta: metaData,
        host_id: user.id
      };
      
      const { data: newEvent, error } = await supabase
        .from("events")
        .insert([eventData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Draft Event Created",
        description: "Your event draft has been created. Complete the setup to publish it.",
      });
      
      methods.reset();
      setCustomLogo(null);
      setCustomBanner(null);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: `Failed to create event: ${error?.message || "Please try again."}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = ((currentStep + 1) / CREATE_STEPS.length) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <BasicInfoStep />;
      case 1:
        return <CustomizationStep 
          customLogo={customLogo}
          customBanner={customBanner}
          setCustomLogo={setCustomLogo}
          setCustomBanner={setCustomBanner}
        />;
      case 2:
        return <CreateReviewStep />;
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
              <h2 className="text-lg font-medium">Create New Event</h2>
              <p className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {CREATE_STEPS.length}: {CREATE_STEPS[currentStep].label}
              </p>
            </div>
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
            
            {currentStep === CREATE_STEPS.length - 1 ? (
              <Button 
                onClick={methods.handleSubmit(onSubmit)}
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Draft...
                  </>
                ) : (
                  "Create Event Draft"
                )}
              </Button>
            ) : (
              <Button onClick={handleNext} type="button">
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </form>
    </FormProvider>
  );
}