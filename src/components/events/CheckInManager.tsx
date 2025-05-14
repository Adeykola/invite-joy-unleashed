
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import QRCode from "@/components/QRCode";
import { Alert, AlertDescription } from "@/components/ui/alert-custom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Search, RefreshCw, Info } from "lucide-react";
import { format } from "date-fns";

interface CheckInManagerProps {
  eventId: string;
}

export function CheckInManager({ eventId }: CheckInManagerProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [checkinUrl, setCheckinUrl] = useState("");
  
  // Get event details
  const { data: event, isLoading: isEventLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();
        
      if (error) throw error;
      return data;
    },
  });
  
  // Get RSVPs for the event
  const { data: rsvps, isLoading: isRsvpsLoading, refetch } = useQuery({
    queryKey: ["event-rsvps", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rsvps")
        .select("*")
        .eq("event_id", eventId);
        
      if (error) throw error;
      
      // Add checked_in property if it doesn't exist
      return data.map((rsvp: any) => ({
        ...rsvp,
        checked_in: rsvp.checked_in || false,
        check_in_time: rsvp.check_in_time || null,
      }));
    },
  });
  
  // Generate check-in URL
  useEffect(() => {
    if (eventId) {
      // Use window location to create a base URL for the check-in page
      const baseUrl = window.location.origin;
      setCheckinUrl(`${baseUrl}/check-in/${eventId}`);
    }
  }, [eventId]);
  
  // Filter RSVPs based on search
  const filteredRsvps = rsvps?.filter((rsvp: any) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      rsvp.guest_name.toLowerCase().includes(query) ||
      rsvp.guest_email.toLowerCase().includes(query)
    );
  });
  
  // Calculate stats
  const totalConfirmed = rsvps?.filter((rsvp: any) => rsvp.response_status === 'confirmed').length || 0;
  const totalCheckedIn = rsvps?.filter((rsvp: any) => rsvp.checked_in).length || 0;
  
  // Handle manual check-in
  const handleCheckIn = async (rsvpId: string, isCheckedIn: boolean) => {
    try {
      const updateData: any = {
        checked_in: isCheckedIn
      };
      
      if (isCheckedIn) {
        updateData.check_in_time = new Date().toISOString();
      } else {
        updateData.check_in_time = null;
      }
      
      const { error } = await supabase
        .from("rsvps")
        .update(updateData)
        .eq("id", rsvpId);
        
      if (error) throw error;
      
      toast({
        title: isCheckedIn ? "Guest Checked In" : "Check-in Reversed",
        description: isCheckedIn 
          ? "Guest has been marked as present" 
          : "Guest has been marked as not checked in",
      });
      
      refetch();
    } catch (error) {
      console.error("Error updating check-in status:", error);
      toast({
        title: "Check-in Error",
        description: "Failed to update check-in status",
        variant: "destructive",
      });
    }
  };
  
  if (isEventLoading) {
    return <div>Loading event details...</div>;
  }
  
  if (!event) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Event not found. Please check the event ID.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{event.title}</h2>
          <p className="text-muted-foreground">
            {format(new Date(event.date), "PPPP")}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Confirmed Guests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConfirmed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Checked In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalCheckedIn}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Check-in Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalConfirmed > 0 
                ? `${Math.round((totalCheckedIn / totalConfirmed) * 100)}%` 
                : "0%"}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="qrcode">
        <TabsList>
          <TabsTrigger value="qrcode">QR Code Check-in</TabsTrigger>
          <TabsTrigger value="manual">Manual Check-in</TabsTrigger>
        </TabsList>
        
        <TabsContent value="qrcode" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Check-in QR Code</CardTitle>
              <CardDescription>
                Display this QR code at your event entrance for easy guest check-in
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="bg-white p-6 rounded-lg">
                <QRCode 
                  value={checkinUrl}
                  size={250}
                  className="mx-auto"
                />
              </div>
              
              <p className="mt-4 text-sm text-muted-foreground text-center max-w-md">
                Guests can scan this code to check in to your event. The code directs to a check-in page specific for this event.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={() => {
                navigator.clipboard.writeText(checkinUrl);
                toast({
                  title: "Link Copied",
                  description: "Check-in link copied to clipboard",
                });
              }}>
                Copy Check-in Link
              </Button>
            </CardFooter>
          </Card>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Guests who scan this code will be taken to a check-in page where they can confirm their attendance.
            </AlertDescription>
          </Alert>
        </TabsContent>
        
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Manual Check-in</CardTitle>
              <CardDescription>
                Check in guests manually as they arrive
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search guests by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Check-in Time</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isRsvpsLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          Loading guest list...
                        </TableCell>
                      </TableRow>
                    ) : filteredRsvps && filteredRsvps.length > 0 ? (
                      filteredRsvps.map((rsvp: any) => (
                        <TableRow key={rsvp.id}>
                          <TableCell className="font-medium">{rsvp.guest_name}</TableCell>
                          <TableCell>{rsvp.guest_email}</TableCell>
                          <TableCell>
                            <Badge variant={rsvp.response_status === 'confirmed' ? 'default' : 'secondary'}>
                              {rsvp.response_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {rsvp.check_in_time ? format(new Date(rsvp.check_in_time), "PPp") : "-"}
                          </TableCell>
                          <TableCell>
                            {rsvp.checked_in ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCheckIn(rsvp.id, false)}
                                className="flex items-center"
                              >
                                <XCircle className="h-4 w-4 mr-1 text-red-500" />
                                Undo
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCheckIn(rsvp.id, true)}
                                className="flex items-center"
                              >
                                <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                                Check In
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          {searchQuery ? "No matching guests found" : "No guests have RSVP'd yet"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
