
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GuestCheckInConfirmation = () => {
  const { eventId, rsvpId } = useParams();
  const { toast } = useToast();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Fetch RSVP and event details
  const { data, isLoading, error } = useQuery({
    queryKey: ["check-in", eventId, rsvpId],
    queryFn: async () => {
      const { data: rsvp, error: rsvpError } = await supabase
        .from("rsvps")
        .select("*, events(*)")
        .eq("id", rsvpId)
        .eq("event_id", eventId)
        .single();
        
      if (rsvpError) throw rsvpError;
      return rsvp;
    },
  });

  const handleCheckIn = async () => {
    try {
      setIsProcessing(true);
      
      // We're just demonstrating the UI flow here
      // In a real app, you'd update a checked_in field in the database
      
      // Simulating database update delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      toast({
        title: "Check-in Successful",
        description: `${data.guest_name} has been checked in to ${data.events.title}`,
      });
      
      setIsCheckedIn(true);
    } catch (error) {
      console.error("Check-in error:", error);
      toast({
        title: "Check-in Failed",
        description: "There was an error checking in this guest",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-md mx-auto py-16 px-4">
        <Card className="text-center p-6">
          <CardContent>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Verifying guest information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container max-w-md mx-auto py-16 px-4">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Invalid Check-in</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <X className="mx-auto h-16 w-16 text-red-500" />
            <p className="mt-4 text-gray-700">
              This QR code is invalid or expired. Please contact the event host.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-16 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Guest Check-in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isCheckedIn ? (
            <div className="text-center">
              <div className="rounded-full bg-green-100 p-4 w-24 h-24 mx-auto flex items-center justify-center">
                <Check className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">Check-in Confirmed</h3>
              <div className="mt-4 space-y-2 text-left">
                <p><strong>Guest:</strong> {data.guest_name}</p>
                <p><strong>Email:</strong> {data.guest_email}</p>
                <p><strong>Event:</strong> {data.events.title}</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-medium">Guest Information</h3>
                  <p className="text-gray-700">{data.guest_name}</p>
                  <p className="text-gray-500 text-sm">{data.guest_email}</p>
                </div>
                
                <div className="border-b pb-4">
                  <h3 className="font-medium">Event</h3>
                  <p className="text-gray-700">{data.events.title}</p>
                </div>
                
                {data.response_status !== "confirmed" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                    Warning: This guest's RSVP status is "{data.response_status}" not "confirmed".
                  </div>
                )}
              </div>
              
              <Button 
                className="w-full mt-6" 
                onClick={handleCheckIn}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Confirm Check-in"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestCheckInConfirmation;
