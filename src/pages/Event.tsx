
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RsvpForm } from "@/components/RsvpForm";
import { format } from "date-fns";

const EventPage = () => {
  const { id } = useParams();
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Event Details</h2>
            <p className="text-gray-600 mb-2">
              <strong>Date:</strong> {format(new Date(event.date), "PPP")}
            </p>
            <p className="text-gray-600 mb-2">
              <strong>Location:</strong> {event.location}
            </p>
            <p className="text-gray-600">{event.description}</p>
          </div>
          
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">RSVP to this event</h2>
            <RsvpForm eventId={event.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPage;
