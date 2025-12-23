import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Heart, MessageSquare, MapPin, Loader2, Star, CheckCircle } from "lucide-react";
import UserDashboardLayout from "@/components/layouts/UserDashboardLayout";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const UserDashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  // Fetch upcoming events
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["upcoming-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gte("date", new Date().toISOString())
        .order("date", { ascending: true })
        .limit(6);

      if (error) throw error;
      return data;
    },
  });

  // Fetch user's RSVPs count
  const { data: rsvpStats } = useQuery({
    queryKey: ["user-rsvp-stats", user?.email],
    queryFn: async () => {
      if (!user?.email) return { total: 0, confirmed: 0, upcoming: 0 };
      
      const { data, error } = await supabase
        .from("rsvps")
        .select("id, response_status, events(date)")
        .eq("guest_email", user.email);

      if (error) throw error;
      
      const total = data?.length || 0;
      const confirmed = data?.filter(r => r.response_status === "confirmed").length || 0;
      const upcoming = data?.filter(r => r.events && new Date(r.events.date) > new Date()).length || 0;
      
      return { total, confirmed, upcoming };
    },
    enabled: !!user?.email,
  });

  // Fetch user's favorites count
  const { data: favoritesCount } = useQuery({
    queryKey: ["user-favorites-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      const { count, error } = await supabase
        .from("user_favorites")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
  });

  // Fetch user's reviews count
  const { data: reviewsCount } = useQuery({
    queryKey: ["user-reviews-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      const { count, error } = await supabase
        .from("event_reviews")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
  });

  // Function to handle quick RSVP response
  const handleRsvp = async (eventId: string, status: string) => {
    if (!user?.email) {
      toast({
        title: "Sign in required",
        description: "Please sign in to RSVP to events.",
        variant: "destructive",
      });
      return;
    }

    setLoadingStates(prev => ({ ...prev, [eventId]: true }));
    try {
      const { error } = await supabase.from("rsvps").insert([{
        event_id: eventId,
        guest_name: profile?.full_name || user.email.split("@")[0],
        guest_email: user.email,
        response_status: status,
        comments: `Quick ${status} from dashboard`
      }]);
      
      if (error) throw error;
      
      toast({
        title: status === "confirmed" ? "You're going!" : "Event skipped",
        description: status === "confirmed" 
          ? "Your RSVP has been confirmed." 
          : "You've declined this event.",
      });
    } catch (error: any) {
      console.error("Error creating RSVP:", error);
      toast({
        title: "Error",
        description: error.message?.includes("duplicate") 
          ? "You've already responded to this event."
          : "Failed to submit RSVP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const isLoading = eventsLoading;

  if (isLoading) {
    return (
      <UserDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="mt-3 text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">
            Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}!
          </h2>
          <p className="text-muted-foreground">
            Here's what's happening with your events.
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rsvpStats?.upcoming || 0}</div>
              <p className="text-xs text-muted-foreground">Events you're attending</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed RSVPs</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{rsvpStats?.confirmed || 0}</div>
              <p className="text-xs text-muted-foreground">Total confirmations</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorites</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{favoritesCount || 0}</div>
              <p className="text-xs text-muted-foreground">Saved events</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reviews</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reviewsCount || 0}</div>
              <p className="text-xs text-muted-foreground">Events reviewed</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Upcoming Events Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Upcoming Events</h3>
            <Link to="/events">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          
          {events && events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="mb-2">
                      <h4 className="font-semibold text-lg mb-2">{event.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description || "No description available"}
                      </p>
                    </div>
                    
                    <div className="space-y-2 text-sm my-4">
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        {format(new Date(event.date), "PPP")}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4" />
                        {event.location}
                      </div>
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
                          {loadingStates[event.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : "Going"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleRsvp(event.id, "declined")}
                          disabled={loadingStates[event.id]}
                        >
                          {loadingStates[event.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : "Skip"}
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
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No upcoming events available right now.</p>
                <p className="text-muted-foreground mt-2">Check back soon for new events!</p>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/user-dashboard/events">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    My Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    View and manage your event invitations and RSVPs.
                  </p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/user-dashboard/favorites">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Favorites
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Browse your saved and favorite events.
                  </p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/user-dashboard/reviews">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    My Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    View and manage your event reviews.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  );
};

export default UserDashboard;
