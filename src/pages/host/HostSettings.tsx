
import HostDashboardLayout from "@/components/layouts/HostDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, User, Bell, Mail, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const HostSettings = () => {
  const { profile } = useAuth();

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
                <Input id="full-name" defaultValue={profile?.full_name || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue={profile?.email || ""} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" placeholder="Tell your guests about yourself..." />
            </div>

            <Button>Save Profile</Button>
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
              <Input id="default-location" placeholder="Your usual event location" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="default-capacity">Default Capacity</Label>
              <Input id="default-capacity" type="number" placeholder="50" />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-approve RSVPs</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically confirm guest RSVPs without manual approval
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Button>Save Defaults</Button>
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
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Event Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminded 24 hours before your events
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Guest Messages</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications for guest comments and questions
                </p>
              </div>
              <Switch />
            </div>

            <Button>Save Preferences</Button>
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
              <Input id="reply-to" defaultValue={profile?.email || ""} />
              <p className="text-sm text-muted-foreground">
                Guests will reply to this email address
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signature">Email Signature</Label>
              <Textarea id="signature" placeholder="Your event invitation signature..." />
            </div>

            <Button>Save Communication Settings</Button>
          </CardContent>
        </Card>
      </div>
    </HostDashboardLayout>
  );
};

export default HostSettings;
