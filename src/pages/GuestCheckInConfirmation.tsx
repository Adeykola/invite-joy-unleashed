
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GuestCheckInConfirmation = () => {
  const { eventId, rsvpId } = useParams();
  const { toast } = useToast();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  
  // Fetch RSVP and event details
  const { data, isLoading, error } = useQuery({
    queryKey: ["check-in", eventId, rsvpId],
    queryFn: async () => {
      const { data: rsvp, error: rsvpError } = await supabase
        .from("rsvps")
        .select(`
          *,
          events (
            id,
            title,
            date,
            location
          )
        `)
        .eq("id", rsvpId)
        .eq("event_id", eventId)
        .single();
        
      if (rsvpError) throw rsvpError;
      return rsvp;
    },
  });

  const checkInMutation = useMutation({
    mutationFn: async () => {
      if (!data) throw new Error("No RSVP data available");

      if (data.response_status !== 'confirmed') {
        throw new Error("Ticket not confirmed");
      }

      if (data.checked_in) {
        throw new Error("Already checked in");
      }

      const { error: updateError } = await supabase
        .from("rsvps")
        .update({ 
          checked_in: true, 
          check_in_time: new Date().toISOString() 
        })
        .eq("id", data.id);

      if (updateError) throw updateError;

      return data;
    },
    onSuccess: () => {
      setIsCheckedIn(true);
      toast({
        title: "Check-in Successful",
        description: `${data?.guest_name} has been checked in to ${data?.events?.title}`,
      });
    },
    onError: (error: Error) => {
      console.error("Check-in error:", error);
      toast({
        title: "Check-in Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
          {isCheckedIn || data.checked_in ? (
            <div className="text-center">
              <div className="rounded-full bg-green-100 p-4 w-24 h-24 mx-auto flex items-center justify-center">
                <Check className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">
                {data.checked_in && !isCheckedIn ? "Already Checked In" : "Check-in Confirmed"}
              </h3>
              <div className="mt-4 space-y-2 text-left">
                <p><strong>Guest:</strong> {data.guest_name}</p>
                <p><strong>Email:</strong> {data.guest_email}</p>
                <p><strong>Event:</strong> {data.events.title}</p>
                <p><strong>Date:</strong> {new Date(data.events.date).toLocaleDateString()}</p>
                <p><strong>Location:</strong> {data.events.location}</p>
                {data.check_in_time && (
                  <p><strong>Checked in at:</strong> {new Date(data.check_in_time).toLocaleString()}</p>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-medium">Guest Information</h3>
                  <p className="text-gray-700">{data.guest_name}</p>
                  <p className="text-gray-500 text-sm">{data.guest_email}</p>
                  {data.phone_number && (
                    <p className="text-gray-500 text-sm">{data.phone_number}</p>
                  )}
                </div>
                
                <div className="border-b pb-4">
                  <h3 className="font-medium">Event Details</h3>
                  <p className="text-gray-700">{data.events.title}</p>
                  <p className="text-gray-500 text-sm">{new Date(data.events.date).toLocaleDateString()}</p>
                  <p className="text-gray-500 text-sm">{data.events.location}</p>
                </div>
                
                {data.response_status !== "confirmed" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                    Warning: This guest's RSVP status is "{data.response_status}" not "confirmed".
                  </div>
                )}

                {data.plus_one_count > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                    This ticket includes {data.plus_one_count} guest(s).
                  </div>
                )}

                {data.dietary_restrictions && (
                  <div className="bg-purple-50 border border-purple-200 rounded p-3">
                    <p className="text-sm font-medium text-purple-800">Dietary Restrictions:</p>
                    <p className="text-sm text-purple-700">{data.dietary_restrictions}</p>
                  </div>
                )}

                {data.comments && (
                  <div className="bg-gray-50 border border-gray-200 rounded p-3">
                    <p className="text-sm font-medium text-gray-800">Special Notes:</p>
                    <p className="text-sm text-gray-700">{data.comments}</p>
                  </div>
                )}
              </div>
              
              <Button 
                className="w-full mt-6" 
                onClick={() => checkInMutation.mutate()}
                disabled={checkInMutation.isPending || data.response_status !== 'confirmed'}
              >
                {checkInMutation.isPending ? "Processing..." : "Confirm Check-in"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestCheckInConfirmation;
