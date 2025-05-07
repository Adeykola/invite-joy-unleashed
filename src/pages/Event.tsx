import { useParams } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RsvpForm } from "@/components/RsvpForm";
import { format } from "date-fns";
import { Video, Utensils, QrCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const EventPage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [qrVisible, setQrVisible] = useState(false);
  
  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Event not found</h1>
        <p className="mt-2 text-gray-600">The event you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  // Check if event has virtual meeting details
  const meta = typeof event.meta === 'string' ? JSON.parse(event.meta) : event.meta;
  const hasVirtualDetails = meta?.virtualMeetingUrl || meta?.virtualMeetingId;

  const generateQrCode = () => {
    setQrVisible(true);
    toast({
      title: "QR Code Generated",
      description: "You can now use this code for contactless check-in",
    });
  };

  return (
    <PageLayout showBackButton={true} backButtonLabel="Back to Events" backTo="/events">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Event Details</h2>
              
              <div className="flex flex-col space-y-3 mb-4">
                <p className="text-gray-600">
                  <strong>Date:</strong> {format(new Date(event.date), "PPP")}
                </p>
                
                {/* Show location or virtual badge */}
                <p className="text-gray-600">
                  <strong>Location:</strong> {event.location}
                  {hasVirtualDetails && (
                    <Badge variant="outline" className="ml-2 bg-blue-50">
                      <Video className="h-3 w-3 mr-1" /> Virtual
                    </Badge>
                  )}
                </p>
                
                <p className="text-gray-600">{event.description}</p>
              </div>
              
              {/* Virtual Meeting Details Section */}
              {hasVirtualDetails && (
                <div className="border rounded-md p-3 bg-blue-50 mb-4">
                  <div className="flex items-center text-blue-700 mb-2">
                    <Video className="h-4 w-4 mr-2" />
                    <h3 className="font-medium">Virtual Meeting Details</h3>
                  </div>
                  {meta.virtualMeetingUrl && (
                    <p className="text-sm mb-2">
                      <strong>Meeting Link:</strong>{" "}
                      <a 
                        href={meta.virtualMeetingUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Join Meeting
                      </a>
                    </p>
                  )}
                  {meta.virtualMeetingId && (
                    <p className="text-sm mb-2">
                      <strong>Meeting ID:</strong> {meta.virtualMeetingId}
                    </p>
                  )}
                  {meta.virtualMeetingPassword && (
                    <p className="text-sm">
                      <strong>Password:</strong> {meta.virtualMeetingPassword}
                    </p>
                  )}
                </div>
              )}
              
              {/* Meal Options Section */}
              {meta?.mealOptions && meta.mealOptions.length > 0 && (
                <div className="border rounded-md p-3 mb-4">
                  <div className="flex items-center mb-2">
                    <Utensils className="h-4 w-4 mr-2" />
                    <h3 className="font-medium">Meal Options</h3>
                  </div>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {meta.mealOptions.map((option: string, index: number) => (
                      <li key={index}>{option}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Contactless Check-In */}
              <div className="mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateQrCode}
                  className="flex items-center"
                >
                  <QrCode className="h-4 w-4 mr-1" />
                  {qrVisible ? "Refresh QR Code" : "Get Check-in QR Code"}
                </Button>
                
                {qrVisible && (
                  <div className="mt-3 border p-4 rounded-md text-center">
                    <div className="mx-auto w-32 h-32 bg-gray-200 flex items-center justify-center mb-2">
                      {/* This is a placeholder for a real QR code */}
                      <QrCode className="w-24 h-24 text-gray-800" />
                    </div>
                    <p className="text-xs text-gray-500">
                      Show this QR code at the event entrance for contactless check-in
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold mb-4">RSVP to this event</h2>
              <RsvpForm eventId={event.id} mealOptions={meta?.mealOptions} />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default EventPage;
