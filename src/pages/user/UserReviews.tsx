import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Calendar, MapPin, MessageSquare, Loader2, Trash2, Edit } from "lucide-react";
import UserDashboardLayout from "@/components/layouts/UserDashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const UserReviews = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [editingReview, setEditingReview] = useState<any>(null);
  const [editRating, setEditRating] = useState(0);
  const [editText, setEditText] = useState("");
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  // Fetch user's reviews
  const { data: userReviews, isLoading } = useQuery({
    queryKey: ["user-reviews", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("event_reviews")
        .select(`
          id,
          rating,
          review_text,
          created_at,
          updated_at,
          event_id,
          events (
            id,
            title,
            date,
            location
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Update review mutation
  const updateReviewMutation = useMutation({
    mutationFn: async ({ reviewId, rating, reviewText }: { reviewId: string; rating: number; reviewText: string }) => {
      const { error } = await supabase
        .from("event_reviews")
        .update({ rating, review_text: reviewText })
        .eq("id", reviewId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-reviews"] });
      setEditingReview(null);
      toast({
        title: "Review updated",
        description: "Your review has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update review. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating review:", error);
    },
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from("event_reviews")
        .delete()
        .eq("id", reviewId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-reviews"] });
      setDeletingReviewId(null);
      toast({
        title: "Review deleted",
        description: "Your review has been deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete review. Please try again.",
        variant: "destructive",
      });
      console.error("Error deleting review:", error);
    },
  });

  const openEditDialog = (review: any) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditText(review.review_text || "");
  };

  const handleEditSubmit = () => {
    if (editingReview && editRating > 0) {
      updateReviewMutation.mutate({
        reviewId: editingReview.id,
        rating: editRating,
        reviewText: editText,
      });
    }
  };

  const renderStars = (rating: number, interactive = false, onSelect?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating ? "text-yellow-400 fill-current" : "text-muted-foreground/30"
        } ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
        onClick={() => interactive && onSelect && onSelect(i + 1)}
      />
    ));
  };

  if (isLoading) {
    return (
      <UserDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="mt-3 text-muted-foreground">Loading your reviews...</p>
          </div>
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Reviews</h1>
          <p className="text-muted-foreground mt-2">Reviews you've written for events you've attended</p>
        </div>

        {!userReviews || userReviews.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
                <p className="text-muted-foreground">Attend some events and share your experience!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {userReviews.map((review) => {
              const event = review.events;
              if (!event) return null;
              
              return (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{event.title}</CardTitle>
                        <CardDescription>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(event.date), "PPP")}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {event.location}
                            </div>
                          </div>
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(review)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingReviewId(review.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <span className="text-sm text-muted-foreground">
                          Reviewed on {format(new Date(review.created_at), "PPP")}
                        </span>
                      </div>
                      {review.review_text && (
                        <p className="text-foreground">{review.review_text}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Review Dialog */}
      <Dialog open={!!editingReview} onOpenChange={() => setEditingReview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
            <DialogDescription>
              Update your review for {editingReview?.events?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {renderStars(editRating, true, setEditRating)}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-text">Your Review</Label>
              <Textarea
                id="review-text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder="Share your experience..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingReview(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditSubmit}
              disabled={updateReviewMutation.isPending || editRating === 0}
            >
              {updateReviewMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingReviewId} onOpenChange={() => setDeletingReviewId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingReviewId && deleteReviewMutation.mutate(deletingReviewId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteReviewMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </UserDashboardLayout>
  );
};

export default UserReviews;
