import { useFormContext, Controller } from "react-hook-form";
import { EventTemplateSelector, eventTemplates } from "../EventTemplates";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Image } from "lucide-react";
import { useWatch } from "react-hook-form";
import { EventFormData } from "../EventWizard";
import { useState } from "react";

interface CustomizationStepProps {
  customLogo: string | null;
  customBanner: string | null;
  setCustomLogo: (url: string | null) => void;
  setCustomBanner: (url: string | null) => void;
}

export function CustomizationStep({
  customLogo,
  customBanner,
  setCustomLogo,
  setCustomBanner
}: CustomizationStepProps) {
  const { control, setValue, register } = useFormContext<EventFormData>();
  const templateId = useWatch({ control, name: "templateId" });
  const primaryColor = useWatch({ control, name: "primaryColor" });
  const accentColor = useWatch({ control, name: "accentColor" });
  
  const [activeTab, setActiveTab] = useState<string>("templates");
  
  // Preview the selected template
  const selectedTemplate = eventTemplates.find((t) => t.id === templateId) || eventTemplates[0];
  
  // Handle file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setValue("customLogo", file);
      
      // Preview the image
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomLogo(event.target.result as string);
          
          // Note: The actual upload to storage happens when the form is submitted,
          // and the URL is saved to the event meta data
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setValue("customBanner", file);
      
      // Preview the image
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomBanner(event.target.result as string);
          
          // Note: The actual upload to storage happens when the form is submitted,
          // and the URL is saved to the event meta data
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Customize Your Event</h3>
        <p className="text-sm text-muted-foreground">
          Choose a design template or create your own custom branded event.
        </p>
      </div>
      
      <Tabs
        defaultValue="templates"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Template Gallery</TabsTrigger>
          <TabsTrigger value="custom">Custom Branding</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className="pt-4">
          <Controller
            name="templateId"
            control={control}
            render={({ field }) => (
              <EventTemplateSelector
                selectedTemplate={field.value}
                onSelectTemplate={(id) => {
                  field.onChange(id);
                  if (id !== "custom") {
                    setActiveTab("templates");
                  } else {
                    setActiveTab("custom");
                  }
                }}
              />
            )}
          />
        </TabsContent>
        
        <TabsContent value="custom" className="pt-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>Custom Logo</Label>
                <div className="mt-2 flex items-center justify-center border rounded-md p-4">
                  {customLogo ? (
                    <div className="relative w-full h-32 flex items-center justify-center">
                      <img
                        src={customLogo}
                        alt="Custom logo"
                        className="max-h-full max-w-full object-contain"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute bottom-0 right-0"
                        onClick={() => {
                          setValue("customLogo", null);
                          setCustomLogo(null);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <label className="w-full h-32 flex flex-col items-center justify-center cursor-pointer">
                      <Upload className="h-10 w-10 text-muted-foreground" />
                      <span className="mt-2 text-sm text-muted-foreground">
                        Click to upload logo
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleLogoChange}
                      />
                    </label>
                  )}
                </div>
              </div>
              
              <div>
                <Label>Event Banner</Label>
                <div className="mt-2 flex items-center justify-center border rounded-md p-4">
                  {customBanner ? (
                    <div className="relative w-full h-40 flex items-center justify-center">
                      <img
                        src={customBanner}
                        alt="Custom banner"
                        className="max-h-full max-w-full object-contain"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute bottom-0 right-0"
                        onClick={() => {
                          setValue("customBanner", null);
                          setCustomBanner(null);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <label className="w-full h-40 flex flex-col items-center justify-center cursor-pointer">
                      <Image className="h-10 w-10 text-muted-foreground" />
                      <span className="mt-2 text-sm text-muted-foreground">
                        Click to upload banner image
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleBannerChange}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Theme Colors</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex">
                      <Input
                        id="primaryColor"
                        type="color"
                        {...register("primaryColor")}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={primaryColor}
                        onChange={(e) => setValue("primaryColor", e.target.value)}
                        className="flex-1 ml-2"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="accentColor">Accent Color</Label>
                    <div className="flex">
                      <Input
                        id="accentColor"
                        type="color"
                        {...register("accentColor")}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={accentColor}
                        onChange={(e) => setValue("accentColor", e.target.value)}
                        className="flex-1 ml-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Label>Preview</Label>
                <Card className="mt-2 overflow-hidden">
                  <div 
                    className="h-20 w-full" 
                    style={{ backgroundColor: primaryColor }}
                  >
                    {customBanner && (
                      <img 
                        src={customBanner} 
                        alt="Banner preview" 
                        className="w-full h-full object-cover opacity-90"
                      />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      {customLogo && (
                        <div className="w-12 h-12 mr-4 rounded overflow-hidden bg-white shadow">
                          <img 
                            src={customLogo} 
                            alt="Logo preview" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium" style={{ color: primaryColor }}>
                          Event Preview
                        </h3>
                        <p className="text-sm">
                          Custom design with your brand colors
                        </p>
                        <div 
                          className="mt-2 px-2 py-1 text-xs inline-block rounded" 
                          style={{ backgroundColor: accentColor, color: primaryColor }}
                        >
                          Sample Button
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
