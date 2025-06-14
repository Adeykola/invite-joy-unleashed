
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Calendar, MapPin, MessageSquare } from "lucide-react";
import UserDashboardLayout from "@/components/layouts/UserDashboardLayout";

const UserReviews = () => {
  // This would normally fetch user's reviews from the database
  const userReviews = [
    {
      id: "1",
      eventTitle: "Summer Music Festival",
      eventDate: "2024-06-01",
      eventLocation: "Austin, TX",
      rating: 5,
      review: "Amazing event! Great lineup and fantastic organization. Would definitely attend again.",
      reviewDate: "2024-06-02",
    },
    {
      id: "2",
      eventTitle: "Food & Wine Expo",
      eventDate: "2024-05-15", 
      eventLocation: "Napa Valley, CA",
      rating: 4,
      review: "Excellent food selections and knowledgeable vendors. Could have used better crowd management.",
      reviewDate: "2024-05-16",
    },
  ];

  const editReview = (reviewId: string) => {
    // This would open an edit dialog for the review
    console.log("Editing review:", reviewId);
  };

  const deleteReview = (reviewId: string) => {
    // This would delete the review from the database
    console.log("Deleting review:", reviewId);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <UserDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Reviews</h1>
          <p className="text-gray-600 mt-2">Reviews you've written for events you've attended</p>
        </div>

        {userReviews.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-500">Attend some events and share your experience!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {userReviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{review.eventTitle}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(review.eventDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {review.eventLocation}
                          </div>
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editReview(review.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteReview(review.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(review.rating)}</div>
                      <span className="text-sm text-gray-500">
                        Reviewed on {new Date(review.reviewDate).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{review.review}</p>
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

export default UserReviews;
