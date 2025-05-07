
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, MapPin, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PublicEvents = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [rsvpProcessing, setRsvpProcessing] = useState<Record<string, boolean>>({});

  const { data: events, isLoading } = useQuery({
    queryKey: ["public-events"],
    queryFn: async () => {
      // In a real app, we'd filter to only public events
      // For now, we'll fetch all events in the future
      const today = new Date().toISOString();
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gt("date", today)
        .order("date", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const filteredEvents = events?.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleQuickRsvp = async (event: any, status: 'confirmed' | 'maybe' | 'declined') => {
    setRsvpProcessing(prev => ({ ...prev, [event.id]: true }));
    try {
      toast({
        title: "Sign up required",
        description: "Please create an account to RSVP to this event"
      });
      
      // Navigate to event page for full RSVP
      setTimeout(() => {
        window.location.href = `/guest-portal/${event.id}`;
      }, 1500);
    } catch (error) {
      console.error("RSVP error:", error);
      toast({
        title: "RSVP Failed",
        description: "There was an error processing your RSVP",
        variant: "destructive",
      });
    } finally {
      setRsvpProcessing(prev => ({ ...prev, [event.id]: false }));
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="space-y-3 mb-8">
          <h1 className="text-3xl font-bold">Upcoming Events</h1>
          <p className="text-gray-600">
            Discover and register for exciting events in your area
          </p>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search events by title, location, or description..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredEvents?.length === 0 ? (
          <Card className="text-center p-12">
            <CardContent>
              <p className="text-gray-500">No events found matching your search criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents?.map((event) => {
              const eventDate = new Date(event.date);
              const isPastEvent = eventDate < new Date();
              const meta = typeof event.meta === 'string' ? JSON.parse(event.meta) : event.meta || {};
              const isVirtual = meta?.virtualMeetingUrl || meta?.virtualMeetingId;
              
              return (
                <Card key={event.id} className="overflow-hidden hover:shadow-md transition-all">
                  <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
                    {/* Event date badge */}
                    <div className="absolute top-4 right-4 bg-white rounded p-2 shadow-md text-center min-w-[60px]">
                      <div className="text-sm font-bold">{format(eventDate, "MMM")}</div>
                      <div className="text-2xl font-bold">{format(eventDate, "d")}</div>
                    </div>
                    
                    {/* Status badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      {isPastEvent && (
                        <Badge variant="outline" className="bg-gray-100">Past</Badge>
                      )}
                      {isVirtual && (
                        <Badge variant="outline" className="bg-blue-100">Virtual</Badge>
                      )}
                      {event.capacity && (
                        <Badge variant="outline" className="bg-green-100">Capacity: {event.capacity}</Badge>
                      )}
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                      <p className="text-gray-600 line-clamp-2 text-sm mb-3">
                        {event.description || "No description provided"}
                      </p>
                      
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="mr-2 h-4 w-4" />
                          {format(eventDate, "EEEE, MMMM d, yyyy")}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="mr-2 h-4 w-4" />
                          {format(eventDate, "h:mm a")}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="mr-2 h-4 w-4" />
                          {event.location}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Link to={`/guest-portal/${event.id}`} className="w-full">
                        <Button variant="default" className="w-full">
                          View Details
                        </Button>
                      </Link>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleQuickRsvp(event, 'confirmed')}
                          disabled={rsvpProcessing[event.id]}
                        >
                          {rsvpProcessing[event.id] ? "..." : "Going"}
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleQuickRsvp(event, 'maybe')}
                          disabled={rsvpProcessing[event.id]}
                        >
                          {rsvpProcessing[event.id] ? "..." : "Maybe"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicEvents;
