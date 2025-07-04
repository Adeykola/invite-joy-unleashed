
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { QrCode, UserCheck, Clock, AlertCircle, CheckCircle } from "lucide-react";
import QRCode from "@/components/QRCode";

interface QRCheckInSystemProps {
  eventId: string;
}

export function QRCheckInSystem({ eventId }: QRCheckInSystemProps) {
  const [ticketCode, setTicketCode] = useState("");
  const [checkInResult, setCheckInResult] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const checkInMutation = useMutation({
    mutationFn: async (code: string) => {
      // First, find the RSVP with this ticket code
      const { data: rsvp, error: findError } = await supabase
        .from("rsvps")
        .select("*")
        .eq("ticket_code", code)
        .eq("event_id", eventId)
        .single();

      if (findError || !rsvp) {
        throw new Error("Invalid ticket code or ticket not found for this event");
      }

      if (rsvp.response_status !== "confirmed") {
        throw new Error("This ticket is not confirmed for the event");
      }

      if (rsvp.checked_in) {
        throw new Error("This ticket has already been used for check-in");
      }

      // Update the RSVP to mark as checked in
      const { data, error } = await supabase
        .from("rsvps")
        .update({
          checked_in: true,
          check_in_time: new Date().toISOString(),
        })
        .eq("id", rsvp.id)
        .select()
        .single();

      if (error) throw error;
      
      return { ...data, guest_name: rsvp.guest_name, guest_email: rsvp.guest_email };
    },
    onSuccess: (data) => {
      setCheckInResult(data);
      queryClient.invalidateQueries({ queryKey: ["event-rsvps", eventId] });
      toast({
        title: "Check-in Successful",
        description: `${data.guest_name} has been checked in successfully.`,
      });
    },
    onError: (error: any) => {
      setCheckInResult({ error: error.message });
      toast({
        title: "Check-in Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCheckIn = () => {
    if (!ticketCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a ticket code.",
        variant: "destructive",
      });
      return;
    }

    checkInMutation.mutate(ticketCode.trim().toUpperCase());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCheckIn();
    }
  };

  const resetForm = () => {
    setTicketCode("");
    setCheckInResult(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <QrCode className="h-5 w-5 mr-2" />
            QR Code Check-In System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter ticket code or scan QR"
              value={ticketCode}
              onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              className="font-mono"
            />
            <Button 
              onClick={handleCheckIn}
              disabled={checkInMutation.isPending}
            >
              {checkInMutation.isPending ? "Checking..." : "Check In"}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              Reset
            </Button>
          </div>

          {/* Check-in Result */}
          {checkInResult && (
            <Card className={checkInResult.error ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
              <CardContent className="p-4">
                {checkInResult.error ? (
                  <div className="flex items-center space-x-2 text-red-800">
                    <AlertCircle className="h-5 w-5" />
                    <div>
                      <h4 className="font-medium">Check-in Failed</h4>
                      <p className="text-sm">{checkInResult.error}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    <div>
                      <h4 className="font-medium">Check-in Successful!</h4>
                      <p className="text-sm">
                        <strong>{checkInResult.guest_name}</strong> ({checkInResult.guest_email})
                      </p>
                      <p className="text-xs">
                        Checked in at: {new Date(checkInResult.check_in_time).toLocaleString()}
                      </p>
                      {checkInResult.plus_one_count > 0 && (
                        <Badge variant="secondary" className="mt-1">
                          +{checkInResult.plus_one_count} guests
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* QR Code Scanner Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">How to Use QR Check-In</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <UserCheck className="h-5 w-5 mt-0.5 text-muted-foreground" />
            <div>
              <h4 className="font-medium text-sm">Guests show their QR code</h4>
              <p className="text-sm text-muted-foreground">
                Each confirmed RSVP receives a unique QR code in their confirmation email
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <QrCode className="h-5 w-5 mt-0.5 text-muted-foreground" />
            <div>
              <h4 className="font-medium text-sm">Scan or enter the code manually</h4>
              <p className="text-sm text-muted-foreground">
                Use a QR scanner app or type the ticket code directly
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 mt-0.5 text-muted-foreground" />
            <div>
              <h4 className="font-medium text-sm">Instant verification</h4>
              <p className="text-sm text-muted-foreground">
                System immediately verifies and records the check-in time
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
