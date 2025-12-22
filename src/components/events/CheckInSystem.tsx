import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  QrCode, 
  Nfc, 
  CheckCircle, 
  Search, 
  User, 
  Clock, 
  XCircle,
  Users,
  Loader2,
  Camera,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Html5Qrcode } from "html5-qrcode";

interface CheckInSystemProps {
  eventId: string;
}

export function CheckInSystem({ eventId }: CheckInSystemProps) {
  const [activeTab, setActiveTab] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [nfcSupported, setNfcSupported] = useState(false);
  const [nfcReading, setNfcReading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check NFC support
  useEffect(() => {
    if ('NDEFReader' in window) {
      setNfcSupported(true);
    }
  }, []);

  // Fetch all RSVPs for this event
  const { data: guests, isLoading } = useQuery({
    queryKey: ["event-checkin-guests", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rsvps")
        .select("*")
        .eq("event_id", eventId)
        .order("guest_name", { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async (rsvpId: string) => {
      const { error } = await supabase
        .from("rsvps")
        .update({ 
          checked_in: true, 
          check_in_time: new Date().toISOString() 
        })
        .eq("id", rsvpId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-checkin-guests", eventId] });
    },
  });

  // Filter guests based on search
  const filteredGuests = guests?.filter(guest => 
    guest.guest_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.guest_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.ticket_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const totalGuests = guests?.length || 0;
  const checkedIn = guests?.filter(g => g.checked_in).length || 0;
  const pending = totalGuests - checkedIn;

  // Handle check-in
  const handleCheckIn = async (guest: any) => {
    if (guest.checked_in) {
      toast({
        title: "Already Checked In",
        description: `${guest.guest_name} was checked in at ${new Date(guest.check_in_time).toLocaleTimeString()}.`,
      });
      return;
    }

    try {
      await checkInMutation.mutateAsync(guest.id);
      toast({
        title: "Check-In Successful",
        description: `${guest.guest_name} has been checked in.`,
      });
    } catch (error) {
      toast({
        title: "Check-In Failed",
        description: "Failed to check in guest. Please try again.",
        variant: "destructive",
      });
    }
  };

  // QR Code Scanner
  const startQrScanner = async () => {
    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;
      
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // Find guest by ticket code or email
          const guest = guests?.find(
            g => g.ticket_code === decodedText || g.guest_email === decodedText
          );
          
          if (guest) {
            await handleCheckIn(guest);
            stopQrScanner();
          } else {
            toast({
              title: "Guest Not Found",
              description: "No guest found with this QR code.",
              variant: "destructive",
            });
          }
        },
        () => {} // Ignore errors during scanning
      );
      
      setIsScanning(true);
    } catch (error) {
      console.error("QR Scanner error:", error);
      toast({
        title: "Camera Error",
        description: "Failed to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopQrScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (error) {
        // Ignore - scanner may already be stopped
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  // Clean up scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [isScanning]);

  // NFC Reader
  const startNfcReader = async () => {
    if (!('NDEFReader' in window)) {
      toast({
        title: "NFC Not Supported",
        description: "Your device does not support NFC reading.",
        variant: "destructive",
      });
      return;
    }

    try {
      // @ts-ignore - NDEFReader is not in TypeScript types yet
      const ndef = new NDEFReader();
      await ndef.scan();
      setNfcReading(true);

      ndef.addEventListener("reading", ({ message }: any) => {
        for (const record of message.records) {
          if (record.recordType === "text") {
            const decoder = new TextDecoder();
            const ticketCode = decoder.decode(record.data);
            
            const guest = guests?.find(g => g.ticket_code === ticketCode);
            if (guest) {
              handleCheckIn(guest);
            } else {
              toast({
                title: "Guest Not Found",
                description: "No guest found with this NFC tag.",
                variant: "destructive",
              });
            }
          }
        }
      });

      toast({
        title: "NFC Ready",
        description: "Hold an NFC tag near your device to check in.",
      });
    } catch (error) {
      console.error("NFC error:", error);
      toast({
        title: "NFC Error",
        description: "Failed to start NFC reader. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Guests</p>
                <p className="text-2xl font-bold">{totalGuests}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Checked In</p>
                <p className="text-2xl font-bold text-green-600">{checkedIn}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{pending}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or ticket code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Check-in Methods */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="list">Guest List</TabsTrigger>
          <TabsTrigger value="qr">QR Code</TabsTrigger>
          <TabsTrigger value="nfc">NFC</TabsTrigger>
          <TabsTrigger value="manual">Manual</TabsTrigger>
        </TabsList>

        {/* Guest List Tab */}
        <TabsContent value="list" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Guest List</CardTitle>
              <CardDescription>
                Click on a guest to check them in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {filteredGuests?.map((guest) => (
                    <div
                      key={guest.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        guest.checked_in 
                          ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' 
                          : 'hover:bg-accent'
                      }`}
                      onClick={() => handleCheckIn(guest)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          guest.checked_in ? 'bg-green-100 dark:bg-green-900' : 'bg-muted'
                        }`}>
                          <User className={`h-4 w-4 ${
                            guest.checked_in ? 'text-green-600' : 'text-muted-foreground'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">{guest.guest_name}</p>
                          <p className="text-sm text-muted-foreground">{guest.guest_email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {guest.checked_in ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Checked In
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {filteredGuests?.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No guests found matching your search.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* QR Code Tab */}
        <TabsContent value="qr" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>QR Code Scanner</CardTitle>
              <CardDescription>
                Scan QR codes from guests' tickets or confirmation emails
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div 
                id="qr-reader" 
                className={`w-full max-w-md ${isScanning ? '' : 'hidden'}`}
              />
              
              {!isScanning && (
                <div className="w-48 h-48 bg-muted flex items-center justify-center rounded-lg mb-4">
                  <Camera className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
              
              <Button 
                onClick={isScanning ? stopQrScanner : startQrScanner}
                className="w-full max-w-xs"
                variant={isScanning ? "destructive" : "default"}
              >
                {isScanning ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Stop Scanner
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4 mr-2" />
                    Start QR Scanner
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NFC Tab */}
        <TabsContent value="nfc" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>NFC Check-In</CardTitle>
              <CardDescription>
                Use NFC-enabled wristbands or badges for quick check-in
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className={`w-48 h-48 flex items-center justify-center rounded-lg mb-4 ${
                nfcReading ? 'bg-primary/10 animate-pulse' : 'bg-muted'
              }`}>
                <Nfc className={`w-16 h-16 ${
                  nfcReading ? 'text-primary' : 'text-muted-foreground'
                }`} />
              </div>
              
              {!nfcSupported && (
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  NFC is not supported on this device or browser.
                </p>
              )}
              
              <Button 
                onClick={startNfcReader}
                disabled={!nfcSupported || nfcReading}
                className="w-full max-w-xs"
              >
                {nfcReading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Waiting for NFC...
                  </>
                ) : (
                  <>
                    <Nfc className="h-4 w-4 mr-2" />
                    Start NFC Reader
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual Entry Tab */}
        <TabsContent value="manual" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Manual Check-In</CardTitle>
              <CardDescription>
                Enter guest email or ticket code to check them in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Enter email or ticket code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                {searchQuery && filteredGuests && filteredGuests.length > 0 && (
                  <div className="space-y-2">
                    {filteredGuests.slice(0, 5).map((guest) => (
                      <div
                        key={guest.id}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer ${
                          guest.checked_in 
                            ? 'bg-green-50 border-green-200 dark:bg-green-950/20' 
                            : 'hover:bg-accent'
                        }`}
                        onClick={() => handleCheckIn(guest)}
                      >
                        <div>
                          <p className="font-medium">{guest.guest_name}</p>
                          <p className="text-sm text-muted-foreground">{guest.guest_email}</p>
                        </div>
                        <Button 
                          size="sm"
                          variant={guest.checked_in ? "outline" : "default"}
                          disabled={checkInMutation.isPending}
                        >
                          {guest.checked_in ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Done
                            </>
                          ) : (
                            "Check In"
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                {searchQuery && (!filteredGuests || filteredGuests.length === 0) && (
                  <div className="text-center py-4 text-muted-foreground">
                    <XCircle className="h-8 w-8 mx-auto mb-2" />
                    No guests found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
