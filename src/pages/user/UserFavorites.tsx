import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, MapPin, Loader2 } from "lucide-react";
import UserDashboardLayout from "@/components/layouts/UserDashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { format } from "date-fns";

const UserFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's favorite events
  const { data: favoriteEvents, isLoading } = useQuery({
    queryKey: ["user-favorites", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("user_favorites")
        .select(`
          id,
          event_id,
          created_at,
          events (
            id,
            title,
            date,
            location,
            description
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Remove favorite mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async (favoriteId: string) => {
      const { error } = await supabase
        .from("user_favorites")
        .delete()
        .eq("id", favoriteId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
      toast({
        title: "Removed from favorites",
        description: "Event has been removed from your favorites.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove from favorites. Please try again.",
        variant: "destructive",
      });
      console.error("Error removing favorite:", error);
    },
  });

  if (isLoading) {
    return (
      <UserDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="mt-3 text-muted-foreground">Loading your favorites...</p>
          </div>
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Favorite Events</h1>
          <p className="text-muted-foreground mt-2">Events you've marked as favorites</p>
        </div>

        {!favoriteEvents || favoriteEvents.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No favorite events yet</h3>
                <p className="text-muted-foreground">Start exploring events and add them to your favorites!</p>
                <Link to="/events">
                  <Button className="mt-4">Browse Events</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {favoriteEvents.map((favorite) => {
              const event = favorite.events;
              if (!event) return null;
              
              return (
                <Card key={favorite.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{event.title}</CardTitle>
                        <CardDescription>{event.description}</CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFavoriteMutation.mutate(favorite.id)}
                        disabled={removeFavoriteMutation.isPending}
                        className="text-destructive hover:text-destructive/80"
                      >
                        {removeFavoriteMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Heart className="h-4 w-4 fill-current" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(event.date), "PPP")}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link to={`/event/${event.id}`}>
                        <Button variant="outline">View Event</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </UserDashboardLayout>
  );
};

export default UserFavorites;
