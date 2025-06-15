import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, MapPin, Search, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PageLayout from "@/components/PageLayout";

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

  const handleQuickRsvp = async (event: any, status: 'confirmed' | 'maybe') => {
    setRsvpProcessing(prev => ({ ...prev, [event.id]: true }));
    try {
      toast({
        title: "Sign up required",
        description: "Please create an account to RSVP to this event"
      });
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
    <PageLayout showBackButton={true} backButtonLabel="Back to Home">
      <div className="container mx-auto py-8 px-4 bg-gradient-to-br from-green-50 via-white to-yellow-50 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <header className="space-y-3 mb-10">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-green-800">Upcoming Events</h1>
              <Users className="h-8 w-8 text-yellow-500" />
            </div>
            <p className="text-green-600">
              Discover and register for vibrant events in your area and online.
            </p>
            <div className="relative mt-5">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-300" />
              <Input
                type="text"
                placeholder="Search events by title, location, or description..."
                className="pl-10 border-green-200 focus:border-yellow-500 focus:ring-yellow-500 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </header>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-400"></div>
            </div>
          ) : filteredEvents?.length === 0 ? (
            <Card className="text-center p-12 border-0 shadow-lg shadow-yellow-100/60">
              <CardContent>
                <p className="text-yellow-500">No events found matching your search criteria.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {filteredEvents?.map((event) => {
                const eventDate = new Date(event.date);
                const isPastEvent = eventDate < new Date();
                const meta = typeof event.meta === "string" ? JSON.parse(event.meta) : event.meta || {};
                const isVirtual = meta?.virtualMeetingUrl || meta?.virtualMeetingId;
                return (
                  <Card key={event.id} className="overflow-hidden hover:shadow-2xl transition-all border-0 shadow shadow-green-100/30 rounded-lg">
                    <div className="h-48 bg-gradient-to-r from-green-500 to-yellow-400 relative flex flex-col justify-between">
                      {/* Event date badge */}
                      <div className="absolute top-4 right-4 bg-white rounded p-2 shadow-md text-center min-w-[60px] border border-yellow-100">
                        <div className="text-sm font-bold text-yellow-500">{format(eventDate, "MMM")}</div>
                        <div className="text-2xl font-bold text-green-700">{format(eventDate, "d")}</div>
                      </div>
                      {/* Status badges */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        {isPastEvent && (
                          <Badge variant="outline" className="bg-gray-100 border-gray-300 text-gray-400">
                            Past
                          </Badge>
                        )}
                        {isVirtual && (
                          <Badge variant="outline" className="bg-yellow-50 border-yellow-400 text-yellow-500">
                            Virtual
                          </Badge>
                        )}
                        {event.capacity && (
                          <Badge variant="outline" className="bg-green-50 border-green-300 text-green-700">
                            Cap: {event.capacity}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-semibold mb-2 text-green-800">{event.title}</h3>
                        <p className="text-green-700 line-clamp-3 text-sm mb-3">
                          {event.description || "No description provided"}
                        </p>
                        <div className="space-y-1 text-sm mb-4">
                          <div className="flex items-center text-green-600">
                            <Calendar className="mr-2 h-4 w-4 text-yellow-500" />
                            {format(eventDate, "EEEE, MMMM d, yyyy")}
                          </div>
                          <div className="flex items-center text-green-600">
                            <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                            {format(eventDate, "h:mm a")}
                          </div>
                          <div className="flex items-center text-green-600">
                            <MapPin className="mr-2 h-4 w-4 text-yellow-500" />
                            {event.location}
                          </div>
                          {/* Hosts field is unavailable, so we skip displaying hosts */}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Link to={`/guest-portal/${event.id}`} className="w-full">
                          <Button
                            variant="default"
                            className="w-full bg-gradient-to-r from-green-600 to-yellow-400 hover:from-green-700 hover:to-yellow-400 text-white"
                          >
                            View Details
                          </Button>
                        </Link>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1 border-green-300 text-green-700 hover:text-yellow-600 hover:border-yellow-500"
                            onClick={() => handleQuickRsvp(event, "confirmed")}
                            disabled={rsvpProcessing[event.id]}
                          >
                            {rsvpProcessing[event.id] ? "..." : "Going"}
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 border-green-300 text-green-700 hover:text-yellow-600 hover:border-yellow-500"
                            onClick={() => handleQuickRsvp(event, "maybe")}
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
    </PageLayout>
  );
};

export default PublicEvents;
