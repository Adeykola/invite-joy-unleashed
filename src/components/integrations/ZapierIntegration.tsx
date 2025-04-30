
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type WebhookFormData = {
  webhookUrl: string;
};

export function ZapierIntegration() {
  const [activeTab, setActiveTab] = useState("setup");
  const [isLoading, setIsLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<WebhookFormData>();

  const handleSaveWebhook = (data: WebhookFormData) => {
    setWebhookUrl(data.webhookUrl);
    toast({
      title: "Webhook Saved",
      description: "Your Zapier webhook URL has been saved.",
    });
    setActiveTab("test");
  };

  const handleTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!webhookUrl) {
      toast({
        title: "Error",
        description: "Please enter your Zapier webhook URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log("Triggering Zapier webhook:", webhookUrl);

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors", // Add this to handle CORS
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          triggered_from: window.location.origin,
          event_type: "test_trigger",
          data: {
            message: "This is a test webhook from your event app."
          }
        }),
      });

      // Since we're using no-cors, we won't get a proper response status
      // Instead, we'll show a more informative message
      toast({
        title: "Request Sent",
        description: "The request was sent to Zapier. Please check your Zap's history to confirm it was triggered.",
      });
    } catch (error) {
      console.error("Error triggering webhook:", error);
      toast({
        title: "Error",
        description: "Failed to trigger the Zapier webhook. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Zap className="h-5 w-5 text-amber-500" />
        <h2 className="text-xl font-bold">Zapier Integration</h2>
      </div>
      
      <p className="text-muted-foreground">
        Connect your events to other apps and services using Zapier webhooks.
      </p>
      
      <Tabs defaultValue="setup" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="test" disabled={!webhookUrl}>Test</TabsTrigger>
          <TabsTrigger value="events">Event Triggers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="setup" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configure Zapier Webhook</CardTitle>
              <CardDescription>
                Enter your Zapier webhook URL to connect your events with other services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(handleSaveWebhook)}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl">Webhook URL</Label>
                    <Input
                      id="webhookUrl"
                      placeholder="https://hooks.zapier.com/hooks/catch/..."
                      {...register("webhookUrl", {
                        required: "Webhook URL is required",
                        pattern: {
                          value: /^https:\/\/hooks\.zapier\.com\/hooks\/catch\/.+/i,
                          message: "Please enter a valid Zapier webhook URL"
                        }
                      })}
                      defaultValue={webhookUrl}
                    />
                    {errors.webhookUrl && (
                      <p className="text-sm text-red-500">{errors.webhookUrl.message}</p>
                    )}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p className="mb-2">How to get your Zapier webhook URL:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Create a new Zap in Zapier</li>
                      <li>Select "Webhook" as your trigger</li>
                      <li>Choose "Catch Hook" as the event</li>
                      <li>Copy the webhook URL provided by Zapier</li>
                    </ol>
                  </div>
                  
                  <Button type="submit">Save Webhook</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="test" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Your Webhook</CardTitle>
              <CardDescription>
                Send a test payload to your Zapier webhook
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-mono text-sm break-all">{webhookUrl}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm">Send a test webhook to verify your integration is working:</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleTrigger} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Sending..." : "Send Test Webhook"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="events" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Event Triggers</CardTitle>
              <CardDescription>
                These are the events that can trigger your Zap
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="p-2 rounded bg-muted flex items-center">
                  <span className="bg-green-100 text-green-800 rounded-full px-2 py-1 text-xs font-medium mr-2">
                    Active
                  </span>
                  <span>New RSVP</span>
                </li>
                <li className="p-2 rounded bg-muted flex items-center">
                  <span className="bg-green-100 text-green-800 rounded-full px-2 py-1 text-xs font-medium mr-2">
                    Active
                  </span>
                  <span>Event Created</span>
                </li>
                <li className="p-2 rounded bg-muted flex items-center">
                  <span className="bg-amber-100 text-amber-800 rounded-full px-2 py-1 text-xs font-medium mr-2">
                    Coming Soon
                  </span>
                  <span>Check-in Completed</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
