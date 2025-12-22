import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import HostDashboardLayout from "@/components/layouts/HostDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Mail, Calendar, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const HostSettings = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Profile state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");

  // Event defaults state (stored in localStorage for now)
  const [defaultLocation, setDefaultLocation] = useState("");
  const [defaultCapacity, setDefaultCapacity] = useState("");
  const [autoApprove, setAutoApprove] = useState(true);

  // Notification preferences (stored in localStorage for now)
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [guestMessages, setGuestMessages] = useState(false);

  // Communication settings
  const [replyToEmail, setReplyToEmail] = useState("");
  const [emailSignature, setEmailSignature] = useState("");

  // Initialize state from profile and localStorage
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setEmail(profile.email || "");
      setReplyToEmail(profile.email || "");
    }

    // Load settings from localStorage
    const savedSettings = localStorage.getItem(`host_settings_${user?.id}`);
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setBio(settings.bio || "");
      setDefaultLocation(settings.defaultLocation || "");
      setDefaultCapacity(settings.defaultCapacity || "");
      setAutoApprove(settings.autoApprove ?? true);
      setEmailNotifications(settings.emailNotifications ?? true);
      setEventReminders(settings.eventReminders ?? true);
      setGuestMessages(settings.guestMessages ?? false);
      setEmailSignature(settings.emailSignature || "");
    }
  }, [profile, user?.id]);

  // Save profile mutation
  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Save settings to localStorage
  const saveToLocalStorage = (key: string, updates: Record<string, any>) => {
    const savedSettings = localStorage.getItem(`host_settings_${user?.id}`);
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    const newSettings = { ...settings, ...updates };
    localStorage.setItem(`host_settings_${user?.id}`, JSON.stringify(newSettings));
  };

  const handleSaveProfile = () => {
    saveToLocalStorage("bio", { bio });
    saveProfileMutation.mutate();
  };

  const handleSaveDefaults = () => {
    saveToLocalStorage("defaults", {
      defaultLocation,
      defaultCapacity,
      autoApprove,
    });
    toast({
      title: "Defaults Saved",
      description: "Your event defaults have been saved.",
    });
  };

  const handleSaveNotifications = () => {
    saveToLocalStorage("notifications", {
      emailNotifications,
      eventReminders,
      guestMessages,
    });
    toast({
      title: "Preferences Saved",
      description: "Your notification preferences have been saved.",
    });
  };

  const handleSaveCommunication = () => {
    saveToLocalStorage("communication", {
      replyToEmail,
      emailSignature,
    });
    toast({
      title: "Settings Saved",
      description: "Your communication settings have been saved.",
    });
  };

  return (
    <HostDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your hosting preferences and account settings
          </p>
        </div>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                <Input
                  id="email"
                  value={email}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell your guests about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={saveProfileMutation.isPending}
            >
              {saveProfileMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* Event Defaults */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Event Defaults
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default-location">Default Location</Label>
              <Input
                id="default-location"
                placeholder="Your usual event location"
                value={defaultLocation}
                onChange={(e) => setDefaultLocation(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="default-capacity">Default Capacity</Label>
              <Input
                id="default-capacity"
                type="number"
                placeholder="50"
                value={defaultCapacity}
                onChange={(e) => setDefaultCapacity(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-approve RSVPs</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically confirm guest RSVPs without manual approval
                </p>
              </div>
              <Switch
                checked={autoApprove}
                onCheckedChange={setAutoApprove}
              />
            </div>

            <Button onClick={handleSaveDefaults}>Save Defaults</Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
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
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications when guests RSVP
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Event Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminded 24 hours before your events
                </p>
              </div>
              <Switch
                checked={eventReminders}
                onCheckedChange={setEventReminders}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Guest Messages</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications for guest comments and questions
                </p>
              </div>
              <Switch
                checked={guestMessages}
                onCheckedChange={setGuestMessages}
              />
            </div>

            <Button onClick={handleSaveNotifications}>Save Preferences</Button>
          </CardContent>
        </Card>

        {/* Communication Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Communication Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reply-to">Reply-to Email</Label>
              <Input
                id="reply-to"
                value={replyToEmail}
                onChange={(e) => setReplyToEmail(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Guests will reply to this email address
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signature">Email Signature</Label>
              <Textarea
                id="signature"
                placeholder="Your event invitation signature..."
                value={emailSignature}
                onChange={(e) => setEmailSignature(e.target.value)}
              />
            </div>

            <Button onClick={handleSaveCommunication}>
              Save Communication Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </HostDashboardLayout>
  );
};

export default HostSettings;
