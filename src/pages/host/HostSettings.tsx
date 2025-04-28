
import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

interface ProfileFormData {
  full_name: string;
  email: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  rsvpAlerts: boolean;
  eventReminders: boolean;
}

const HostSettings = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<ProfileFormData>({
    defaultValues: {
      full_name: profile?.full_name || '',
      email: user?.email || '',
    }
  });
  
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    rsvpAlerts: true,
    eventReminders: true,
  });

  const handleProfileUpdate = async (data: ProfileFormData) => {
    try {
      if (!user?.id) return;
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Error",
        description: "There was a problem updating your profile.",
        variant: "destructive",
      });
    }
  };

  const handleNotificationUpdate = (setting: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
    
    toast({
      title: "Settings Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  return (
    <DashboardLayout userType="host">
      <div className="space-y-8">
        <h2 className="text-2xl font-bold">Settings</h2>
        
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(handleProfileUpdate)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" {...register("full_name")} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" {...register("email")} disabled />
                    <p className="text-xs text-muted-foreground">
                      To change your email, please contact support.
                    </p>
                  </div>
                  
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Manage how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications" className="font-medium">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email updates about your events
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => 
                      handleNotificationUpdate("emailNotifications", checked)
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="rsvpAlerts" className="font-medium">
                      RSVP Alerts
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when someone RSVPs to your events
                    </p>
                  </div>
                  <Switch
                    id="rsvpAlerts"
                    checked={notificationSettings.rsvpAlerts}
                    onCheckedChange={(checked) => 
                      handleNotificationUpdate("rsvpAlerts", checked)
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="eventReminders" className="font-medium">
                      Event Reminders
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive reminders before your events start
                    </p>
                  </div>
                  <Switch
                    id="eventReminders"
                    checked={notificationSettings.eventReminders}
                    onCheckedChange={(checked) => 
                      handleNotificationUpdate("eventReminders", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences and security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                
                <Button>Update Password</Button>
                
                <div className="pt-6 border-t">
                  <h3 className="font-semibold text-destructive mb-2">Danger Zone</h3>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default HostSettings;
