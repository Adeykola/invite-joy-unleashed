import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import UserDashboardLayout from "@/components/layouts/UserDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Shield, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Preferences {
  notifications: {
    eventInvitations: boolean;
    eventReminders: boolean;
    eventUpdates: boolean;
    marketingEmails: boolean;
  };
  privacy: {
    profileVisibility: boolean;
    contactSharing: boolean;
  };
}

const defaultPreferences: Preferences = {
  notifications: {
    eventInvitations: true,
    eventReminders: true,
    eventUpdates: true,
    marketingEmails: false,
  },
  privacy: {
    profileVisibility: true,
    contactSharing: false,
  },
};

const UserProfile = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);

  // Fetch full profile data including bio and preferences
  const { data: fullProfile, isLoading } = useQuery({
    queryKey: ["user-profile-full", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Initialize form with profile data
  useEffect(() => {
    if (fullProfile) {
      setFullName(fullProfile.full_name || "");
      setBio((fullProfile as any).bio || "");
      if ((fullProfile as any).preferences) {
        setPreferences({
          ...defaultPreferences,
          ...(fullProfile as any).preferences,
        });
      }
    }
  }, [fullProfile]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { full_name?: string; bio?: string; preferences?: Preferences }) => {
      if (!user?.id) throw new Error("No user ID");
      
      // Cast preferences to a plain object for Supabase
      const updateData: Record<string, unknown> = { ...data };
      if (data.preferences) {
        updateData.preferences = JSON.parse(JSON.stringify(data.preferences));
      }
      
      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile-full"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating profile:", error);
    },
  });

  const saveProfile = () => {
    updateProfileMutation.mutate({ full_name: fullName, bio });
  };

  const saveNotificationPreferences = () => {
    updateProfileMutation.mutate({ preferences });
  };

  const savePrivacySettings = () => {
    updateProfileMutation.mutate({ preferences });
  };

  const updateNotificationPref = (key: keyof Preferences["notifications"], value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }));
  };

  const updatePrivacyPref = (key: keyof Preferences["privacy"], value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      privacy: { ...prev.privacy, [key]: value },
    }));
  };

  if (isLoading) {
    return (
      <UserDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="mt-3 text-muted-foreground">Loading your profile...</p>
          </div>
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your personal information and preferences
          </p>
        </div>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input 
                  id="full-name" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email || ""} disabled />
                <p className="text-sm text-muted-foreground">
                  Contact support to change your email address
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                placeholder="Tell others about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <Button 
              onClick={saveProfile}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Event Invitations</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications when you're invited to events
                </p>
              </div>
              <Switch 
                checked={preferences.notifications.eventInvitations}
                onCheckedChange={(checked) => updateNotificationPref("eventInvitations", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Event Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminded 24 hours before confirmed events
                </p>
              </div>
              <Switch 
                checked={preferences.notifications.eventReminders}
                onCheckedChange={(checked) => updateNotificationPref("eventReminders", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Event Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications when event details change
                </p>
              </div>
              <Switch 
                checked={preferences.notifications.eventUpdates}
                onCheckedChange={(checked) => updateNotificationPref("eventUpdates", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Receive occasional updates about new features
                </p>
              </div>
              <Switch 
                checked={preferences.notifications.marketingEmails}
                onCheckedChange={(checked) => updateNotificationPref("marketingEmails", checked)}
              />
            </div>

            <Button 
              onClick={saveNotificationPreferences}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Preferences"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Profile Visibility</Label>
                <p className="text-sm text-muted-foreground">
                  Allow event hosts to see your profile information
                </p>
              </div>
              <Switch 
                checked={preferences.privacy.profileVisibility}
                onCheckedChange={(checked) => updatePrivacyPref("profileVisibility", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Contact Sharing</Label>
                <p className="text-sm text-muted-foreground">
                  Allow other guests to see your contact information
                </p>
              </div>
              <Switch 
                checked={preferences.privacy.contactSharing}
                onCheckedChange={(checked) => updatePrivacyPref("contactSharing", checked)}
              />
            </div>

            <Button 
              onClick={savePrivacySettings}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Privacy Settings"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Change Password</h4>
                <p className="text-sm text-muted-foreground">
                  Update your account password
                </p>
              </div>
              <Button 
                variant="outline"
                onClick={async () => {
                  if (user?.email) {
                    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
                      redirectTo: `${window.location.origin}/reset-password`,
                    });
                    if (error) {
                      toast({
                        title: "Error",
                        description: "Failed to send password reset email.",
                        variant: "destructive",
                      });
                    } else {
                      toast({
                        title: "Email sent",
                        description: "Check your email for the password reset link.",
                      });
                    }
                  }
                }}
              >
                Change Password
              </Button>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-destructive">Delete Account</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button 
                variant="destructive"
                onClick={() => {
                  toast({
                    title: "Contact Support",
                    description: "Please contact support to delete your account.",
                  });
                }}
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </UserDashboardLayout>
  );
};

export default UserProfile;
