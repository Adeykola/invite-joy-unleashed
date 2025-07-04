
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, Calendar, MapPin, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity?: number;
  max_guests_per_rsvp: number;
  require_approval: boolean;
  custom_fields?: any;
}

interface EnhancedRsvpFormProps {
  event: EventData;
  onSuccess?: () => void;
}

export function EnhancedRsvpForm({ event, onSuccess }: EnhancedRsvpFormProps) {
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [responseStatus, setResponseStatus] = useState<"confirmed" | "declined" | "maybe">("confirmed");
  const [comments, setComments] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");
  const [mealChoice, setMealChoice] = useState("");
  const [needsAccommodation, setNeedsAccommodation] = useState(false);
  const [plusOneCount, setPlusOneCount] = useState(0);
  const [customResponses, setCustomResponses] = useState<Record<string, any>>({});
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const rsvpMutation = useMutation({
    mutationFn: async (rsvpData: any) => {
      const { data, error } = await supabase
        .from("rsvps")
        .insert(rsvpData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["event-rsvps", event.id] });
      toast({
        title: "RSVP Submitted",
        description: `Your ticket code is: ${data.ticket_code}`,
      });
      onSuccess?.();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!guestName || !guestEmail) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const rsvpData = {
      event_id: event.id,
      guest_name: guestName,
      guest_email: guestEmail,
      phone_number: phoneNumber || null,
      response_status: responseStatus,
      comments: comments || null,
      dietary_restrictions: dietaryRestrictions || null,
      meal_choice: mealChoice || null,
      needs_accommodation: needsAccommodation,
      plus_one_count: plusOneCount,
      custom_responses: Object.keys(customResponses).length > 0 ? customResponses : null,
      payment_status: "pending",
    };

    rsvpMutation.mutate(rsvpData);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "declined":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "maybe":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "declined":
        return "bg-red-100 text-red-800 border-red-200";
      case "maybe":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Event Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            {event.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">{event.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              {new Date(event.date).toLocaleString()}
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              {event.location}
            </div>
            {event.capacity && (
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                Capacity: {event.capacity}
              </div>
            )}
            {event.max_guests_per_rsvp > 1 && (
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                Max guests: {event.max_guests_per_rsvp}
              </div>
            )}
          </div>
          {event.require_approval && (
            <Badge variant="outline" className="w-fit">
              Requires Approval
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* RSVP Form */}
      <Card>
        <CardHeader>
          <CardTitle>RSVP to This Event</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guest-name">Full Name *</Label>
                <Input
                  id="guest-name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="guest-email">Email Address *</Label>
                <Input
                  id="guest-email"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone-number">Phone Number</Label>
              <Input
                id="phone-number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>

            {/* Response Status */}
            <div>
              <Label>Response Status</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {["confirmed", "maybe", "declined"].map((status) => (
                  <Button
                    key={status}
                    type="button"
                    variant={responseStatus === status ? "default" : "outline"}
                    className={responseStatus === status ? getStatusColor(status) : ""}
                    onClick={() => setResponseStatus(status as any)}
                  >
                    {getStatusIcon(status)}
                    <span className="ml-2 capitalize">{status === "maybe" ? "Maybe" : status}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Plus One Section */}
            {event.max_guests_per_rsvp > 1 && responseStatus === "confirmed" && (
              <div>
                <Label htmlFor="plus-one-count">Additional Guests</Label>
                <Select value={plusOneCount.toString()} onValueChange={(value) => setPlusOneCount(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: event.max_guests_per_rsvp }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i} {i === 1 ? "guest" : "guests"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Meal and Dietary Preferences */}
            {responseStatus === "confirmed" && (
              <>
                <div>
                  <Label htmlFor="meal-choice">Meal Preference</Label>
                  <Select value={mealChoice} onValueChange={setMealChoice}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select meal preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="vegan">Vegan</SelectItem>
                      <SelectItem value="meat">Meat</SelectItem>
                      <SelectItem value="fish">Fish</SelectItem>
                      <SelectItem value="gluten-free">Gluten Free</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dietary-restrictions">Dietary Restrictions</Label>
                  <Textarea
                    id="dietary-restrictions"
                    value={dietaryRestrictions}
                    onChange={(e) => setDietaryRestrictions(e.target.value)}
                    placeholder="Please specify any dietary restrictions or allergies"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="needs-accommodation"
                    checked={needsAccommodation}
                    onCheckedChange={setNeedsAccommodation}
                  />
                  <Label htmlFor="needs-accommodation">
                    I require special accommodations
                  </Label>
                </div>
              </>
            )}

            {/* Comments */}
            <div>
              <Label htmlFor="comments">Additional Comments</Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Any additional comments or questions"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="submit" disabled={rsvpMutation.isPending}>
                {rsvpMutation.isPending ? "Submitting..." : "Submit RSVP"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
