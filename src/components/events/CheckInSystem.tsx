
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Nfc, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CheckInSystemProps {
  eventId: string;
}

export function CheckInSystem({ eventId }: CheckInSystemProps) {
  const [activeTab, setActiveTab] = useState("qr");
  const [guestCode, setGuestCode] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckedGuest, setLastCheckedGuest] = useState<any>(null);
  const { toast } = useToast();

  const handleQrScan = () => {
    // This would use a QR code scanner library in a real implementation
    toast({
      title: "QR Scanner",
      description: "QR code scanner would open here in a real implementation.",
    });
  };

  const handleManualCheckIn = async () => {
    if (!guestCode) {
      toast({
        title: "Error",
        description: "Please enter a guest code or email",
        variant: "destructive",
      });
      return;
    }

    setIsChecking(true);
    try {
      // Look up guest by email
      const { data: rsvpData, error: rsvpError } = await supabase
        .from("rsvps")
        .select("*")
        .eq("event_id", eventId)
        .eq("guest_email", guestCode.trim())
        .maybeSingle();

      if (rsvpError) throw rsvpError;

      if (!rsvpData) {
        toast({
          title: "Guest Not Found",
          description: "No guest found with that code or email.",
          variant: "destructive",
        });
        return;
      }

      // In a real implementation, we would update a "checked_in" status
      // For this demo, we'll just show success
      setLastCheckedGuest({
        name: rsvpData.guest_name,
        email: rsvpData.guest_email,
        status: rsvpData.response_status,
        checkedInAt: new Date().toISOString()
      });

      toast({
        title: "Check-In Successful",
        description: `${rsvpData.guest_name} has been checked in.`,
      });
      
      setGuestCode("");
    } catch (error) {
      console.error("Error checking in guest:", error);
      toast({
        title: "Error",
        description: "Failed to check in guest. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <QrCode className="h-5 w-5 text-purple-600" />
        <h2 className="text-xl font-bold">Contactless Check-In</h2>
      </div>
      
      <p className="text-muted-foreground">
        Quickly check in guests using QR codes or NFC to minimize contact.
      </p>
      
      <Tabs defaultValue="qr" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="qr">QR Code</TabsTrigger>
          <TabsTrigger value="nfc">NFC</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        </TabsList>
        
        <TabsContent value="qr" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>QR Code Check-In</CardTitle>
              <CardDescription>
                Scan QR codes from guests' confirmation emails or phones
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-6">
              <div className="w-48 h-48 bg-muted flex items-center justify-center rounded-lg mb-4">
                <QrCode className="w-24 h-24 text-primary/20" />
              </div>
              <p className="text-sm text-center text-muted-foreground mb-4">
                Tap the button below to start scanning QR codes
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={handleQrScan} className="w-full">
                Start QR Scanner
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="nfc" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>NFC Check-In</CardTitle>
              <CardDescription>
                Use NFC-enabled devices to check in guests
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-6">
              <div className="w-48 h-48 bg-muted flex items-center justify-center rounded-lg mb-4">
                <Nfc className="w-24 h-24 text-primary/20" />
              </div>
              <p className="text-sm text-center text-muted-foreground mb-4">
                NFC check-in requires a compatible device
              </p>
            </CardContent>
            <CardFooter>
              <Button disabled className="w-full">
                Start NFC Check-In
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="manual" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Manual Check-In</CardTitle>
              <CardDescription>
                Enter guest code or email address manually
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="guestCode">Guest Code or Email</Label>
                  <Input
                    id="guestCode"
                    placeholder="Enter code or guest@example.com"
                    value={guestCode}
                    onChange={(e) => setGuestCode(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleManualCheckIn} 
                disabled={isChecking || !guestCode}
                className="w-full"
              >
                {isChecking ? "Checking..." : "Check In Guest"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {lastCheckedGuest && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <CheckCircle className="h-5 w-5 mr-2" />
              Last Check-In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              <li className="text-sm"><strong>Name:</strong> {lastCheckedGuest.name}</li>
              <li className="text-sm"><strong>Email:</strong> {lastCheckedGuest.email}</li>
              <li className="text-sm"><strong>Status:</strong> {lastCheckedGuest.status}</li>
              <li className="text-sm"><strong>Checked in at:</strong> {new Date(lastCheckedGuest.checkedInAt).toLocaleTimeString()}</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
