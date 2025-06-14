
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, MapPin } from "lucide-react";
import UserDashboardLayout from "@/components/layouts/UserDashboardLayout";

const UserFavorites = () => {
  // This would normally fetch user's favorite events from the database
  const favoriteEvents = [
    {
      id: "1",
      title: "Tech Conference 2024",
      date: "2024-07-15",
      location: "San Francisco, CA",
      description: "Annual technology conference featuring the latest innovations.",
    },
    {
      id: "2", 
      title: "Art Gallery Opening",
      date: "2024-06-20",
      location: "New York, NY", 
      description: "Contemporary art exhibition featuring local artists.",
    },
  ];

  const removeFavorite = (eventId: string) => {
    // This would normally remove the event from favorites in the database
    console.log("Removing favorite:", eventId);
  };

  return (
    <UserDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Favorite Events</h1>
          <p className="text-gray-600 mt-2">Events you've marked as favorites</p>
        </div>

        {favoriteEvents.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No favorite events yet</h3>
                <p className="text-gray-500">Start exploring events and add them to your favorites!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {favoriteEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{event.title}</CardTitle>
                      <CardDescription>{event.description}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFavorite(event.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline">View Event</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </UserDashboardLayout>
  );
};

export default UserFavorites;
