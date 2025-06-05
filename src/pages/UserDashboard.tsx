import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Clock, MapPin } from "lucide-react";
import UserDashboardLayout from "@/components/layouts/UserDashboardLayout";
import { useState } from "react";

const UserDashboard = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  // Fetch all events
  const { data: events, isLoading } = useQuery({
    queryKey: ["public-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Function to handle quick RSVP response
  const handleRsvp = async (eventId: string, status: string, name = "Guest", email = "guest@example.com") => {
    setLoadingStates(prev => ({ ...prev, [eventId]: true }));
    try {
      const { error } = await supabase.from("rsvps").insert([{
        event_id: eventId,
        guest_name: name,
        guest_email: email,
        response_status: status,
        comments: `Quick ${status} from dashboard`
      }]);
      
      if (error) throw error;
      
      // Show success in UI
      setLoadingStates(prev => ({ ...prev, [eventId]: false }));
    } catch (error) {
      console.error("Error creating RSVP:", error);
      setLoadingStates(prev => ({ ...prev, [eventId]: false }));
    }
  };

  if (isLoading) {
    return (
      <UserDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-3 text-gray-600">Loading events...</p>
          </div>
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-6">Welcome to Our Event Platform!</h2>
          <p className="text-gray-600 mb-6">
            Browse through upcoming events and RSVP directly from your dashboard. 
            Click on any event to see more details.
          </p>
        </div>
        
        {/* Upcoming Events Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>
          
          {events && events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((event) => (
                <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="mb-2">
                      <h4 className="font-semibold text-lg mb-2">{event.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {event.description || "No description available"}
                      </p>
                    </div>
                    
                    <div className="space-y-2 text-sm my-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="mr-2 h-4 w-4" />
                        {format(new Date(event.date), "PPP")}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="mr-2 h-4 w-4" />
                        {event.location}
                      </div>
                      {event.capacity && (
                        <div className="flex items-center text-gray-600">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Capacity: {event.capacity} guests
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 mt-4">
                      <Link to={`/event/${event.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      </Link>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="default" 
                          className="flex-1"
                          onClick={() => handleRsvp(event.id, "confirmed")}
                          disabled={loadingStates[event.id]}
                        >
                          {loadingStates[event.id] ? "..." : "Going"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50"
                          onClick={() => handleRsvp(event.id, "declined")}
                          disabled={loadingStates[event.id]}
                        >
                          {loadingStates[event.id] ? "..." : "Skip"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No upcoming events available right now.</p>
                <p className="text-gray-500 mt-2">Check back soon for new events!</p>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Features Overview Section */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Platform Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Browse Events</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Discover upcoming events in your area. Filter by date, location, or category.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Easy RSVP</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Quickly respond to event invitations with a single click. No login required.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Event Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get all the information you need: time, location, description, and more.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  );
};

export default UserDashboard;
