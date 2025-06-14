
import { useFormContext, Controller } from "react-hook-form";
import { EventTemplateSelector, eventTemplates } from "../EventTemplates";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Image, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useWatch } from "react-hook-form";
import { EventFormData } from "../EventWizard";
import { useState } from "react";
import { uploadEventImage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

interface CustomizationStepProps {
  customLogo: string | null;
  customBanner: string | null;
  setCustomLogo: (url: string | null) => void;
  setCustomBanner: (url: string | null) => void;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

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
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<string>("templates");
  const [logoUploadStatus, setLogoUploadStatus] = useState<UploadStatus>('idle');
  const [bannerUploadStatus, setBannerUploadStatus] = useState<UploadStatus>('idle');
  
  // Preview the selected template
  const selectedTemplate = eventTemplates.find((t) => t.id === templateId) || eventTemplates[0];
  
  // Handle logo upload with immediate processing
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoUploadStatus('uploading');
      
      try {
        const { url, error } = await uploadEventImage(file, 'logo');
        
        if (error) {
          console.error('Logo upload error:', error);
          setLogoUploadStatus('error');
          toast({
            title: "Upload Failed",
            description: error,
            variant: "destructive",
          });
          return;
        }
        
        if (url) {
          setCustomLogo(url);
          setValue("customLogo", null); // Clear the file from form since we have the URL
          setLogoUploadStatus('success');
          toast({
            title: "Logo Uploaded",
            description: "Your logo has been uploaded successfully!",
          });
        }
      } catch (error: any) {
        console.error('Unexpected logo upload error:', error);
        setLogoUploadStatus('error');
        toast({
          title: "Upload Failed",
          description: "An unexpected error occurred while uploading your logo.",
          variant: "destructive",
        });
      }
    }
  };
  
  // Handle banner upload with immediate processing
  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerUploadStatus('uploading');
      
      try {
        const { url, error } = await uploadEventImage(file, 'banner');
        
        if (error) {
          console.error('Banner upload error:', error);
          setBannerUploadStatus('error');
          toast({
            title: "Upload Failed",
            description: error,
            variant: "destructive",
          });
          return;
        }
        
        if (url) {
          setCustomBanner(url);
          setValue("customBanner", null); // Clear the file from form since we have the URL
          setBannerUploadStatus('success');
          toast({
            title: "Banner Uploaded",
            description: "Your banner has been uploaded successfully!",
          });
        }
      } catch (error: any) {
        console.error('Unexpected banner upload error:', error);
        setBannerUploadStatus('error');
        toast({
          title: "Upload Failed",
          description: "An unexpected error occurred while uploading your banner.",
          variant: "destructive",
        });
      }
    }
  };

  const getUploadStatusIcon = (status: UploadStatus) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
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
                <div className="flex items-center gap-2 mb-2">
                  <Label>Custom Logo</Label>
                  {getUploadStatusIcon(logoUploadStatus)}
                </div>
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
                          setCustomLogo(null);
                          setLogoUploadStatus('idle');
                        }}
                        disabled={logoUploadStatus === 'uploading'}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <label className="w-full h-32 flex flex-col items-center justify-center cursor-pointer">
                      {logoUploadStatus === 'uploading' ? (
                        <>
                          <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                          <span className="mt-2 text-sm text-muted-foreground">
                            Uploading logo...
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-10 w-10 text-muted-foreground" />
                          <span className="mt-2 text-sm text-muted-foreground">
                            Click to upload logo (max 5MB)
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleLogoChange}
                        disabled={logoUploadStatus === 'uploading'}
                      />
                    </label>
                  )}
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label>Event Banner</Label>
                  {getUploadStatusIcon(bannerUploadStatus)}
                </div>
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
                          setCustomBanner(null);
                          setBannerUploadStatus('idle');
                        }}
                        disabled={bannerUploadStatus === 'uploading'}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <label className="w-full h-40 flex flex-col items-center justify-center cursor-pointer">
                      {bannerUploadStatus === 'uploading' ? (
                        <>
                          <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                          <span className="mt-2 text-sm text-muted-foreground">
                            Uploading banner...
                          </span>
                        </>
                      ) : (
                        <>
                          <Image className="h-10 w-10 text-muted-foreground" />
                          <span className="mt-2 text-sm text-muted-foreground">
                            Click to upload banner (max 10MB)
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleBannerChange}
                        disabled={bannerUploadStatus === 'uploading'}
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
