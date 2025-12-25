import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import UserDashboardLayout from "@/components/layouts/UserDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  Calendar, 
  MapPin, 
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle,
  QrCode,
  Ticket
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import QRCodeStyling from "qr-code-styling";
import { useEffect, useRef, useState } from "react";

const UserEvents = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userRsvps, isLoading: rsvpsLoading, error } = useQuery({
    queryKey: ["user-events", user?.email],
    queryFn: async () => {
      if (!user?.email) {
        console.log("No user email available for fetching RSVPs");
        return [];
      }
      
      const { data, error } = await supabase
        .from("rsvps")
        .select(`
          *,
          events (
            id,
            title,
            description,
            date,
            location,
            host_id,
            banner_image
          )
        `)
        .eq("guest_email", user.email)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user RSVPs:", error);
        throw error;
      }
      return data || [];
    },
    enabled: !!user?.email && !authLoading,
    retry: 2,
  });

  // Update RSVP mutation
  const updateRsvpMutation = useMutation({
    mutationFn: async ({ rsvpId, status }: { rsvpId: string; status: string }) => {
      const { error } = await supabase
        .from("rsvps")
        .update({ response_status: status })
        .eq("id", rsvpId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-events"] });
      toast({
        title: "RSVP Updated",
        description: "Your response has been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update RSVP. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="default" className="bg-green-100 text-green-800">Confirmed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "declined":
        return <Badge variant="destructive">Declined</Badge>;
      case "maybe":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Maybe</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getEventStatus = (eventDate: string) => {
    const now = new Date();
    const date = new Date(eventDate);
    
    if (date < now) {
      return { label: "Past", variant: "secondary" as const };
    } else if (date.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return { label: "Today", variant: "destructive" as const };
    } else {
      return { label: "Upcoming", variant: "default" as const };
    }
  };

  // Show loading state
  if (authLoading) {
    return (
      <UserDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-3 text-gray-600">Loading your account...</p>
          </div>
        </div>
      </UserDashboardLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <UserDashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Events</h1>
            <p className="text-muted-foreground">
              View all events you've been invited to and manage your RSVPs
            </p>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <p className="text-red-600 font-medium">Failed to load your events</p>
                <p className="text-gray-500 mt-2">Please try refreshing the page</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="mt-4"
                  variant="outline"
                >
                  Refresh Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Events</h1>
          <p className="text-muted-foreground">
            View all events you've been invited to and manage your RSVPs
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invitations</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userRsvps?.length || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {userRsvps?.filter(r => r.response_status === "confirmed").length || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {userRsvps?.filter(r => r.response_status === "pending").length || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userRsvps?.filter(r => r.events && new Date(r.events.date) > new Date()).length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Event Invitations</CardTitle>
          </CardHeader>
          <CardContent>
            {rsvpsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                <p className="mt-3 text-gray-600">Loading your events...</p>
              </div>
            ) : userRsvps && userRsvps.length > 0 ? (
              <div className="space-y-4">
                {userRsvps.map((rsvp) => {
                  if (!rsvp.events) return null;
                  const event = rsvp.events;
                  const eventStatus = getEventStatus(event.date);
                  
                  return (
                    <div key={rsvp.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          <p className="text-muted-foreground line-clamp-2">{event.description}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Badge variant={eventStatus.variant}>{eventStatus.label}</Badge>
                          {getStatusBadge(rsvp.response_status)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{format(new Date(event.date), "PPP 'at' p")}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{event.location}</span>
                        </div>
                        {rsvp.ticket_code && (
                          <div className="flex items-center">
                            <Ticket className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="font-mono text-xs">{rsvp.ticket_code}</span>
                          </div>
                        )}
                      </div>
                      
                      {rsvp.comments && (
                        <div className="p-3 bg-gray-50 rounded">
                          <p className="text-sm"><strong>Your comment:</strong> {rsvp.comments}</p>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/event/${event.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        
                        {/* Show QR Code for confirmed guests */}
                        {rsvp.response_status === "confirmed" && rsvp.ticket_code && (
                          <TicketQRDialog ticketCode={rsvp.ticket_code} guestName={rsvp.guest_name} />
                        )}
                        
                        {/* RSVP actions for pending */}
                        {rsvp.response_status === "pending" && (
                          <>
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => updateRsvpMutation.mutate({ rsvpId: rsvp.id, status: "confirmed" })}
                              disabled={updateRsvpMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => updateRsvpMutation.mutate({ rsvpId: rsvp.id, status: "declined" })}
                              disabled={updateRsvpMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Decline
                            </Button>
                          </>
                        )}
                        
                        {/* Allow changing response for confirmed/declined */}
                        {(rsvp.response_status === "confirmed" || rsvp.response_status === "declined") && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateRsvpMutation.mutate({ 
                              rsvpId: rsvp.id, 
                              status: rsvp.response_status === "confirmed" ? "declined" : "confirmed" 
                            })}
                            disabled={updateRsvpMutation.isPending}
                          >
                            {rsvp.response_status === "confirmed" ? "Cancel RSVP" : "Re-confirm"}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>You haven't been invited to any events yet.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate("/events")}
                >
                  Explore Public Events
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </UserDashboardLayout>
  );
};

// QR Code Dialog Component
function TicketQRDialog({ ticketCode, guestName }: { ticketCode: string; guestName: string }) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [qrGenerated, setQrGenerated] = useState(false);

  useEffect(() => {
    if (qrRef.current && !qrGenerated) {
      const qrCode = new QRCodeStyling({
        width: 200,
        height: 200,
        data: ticketCode,
        dotsOptions: {
          color: "#4f46e5",
          type: "rounded"
        },
        backgroundOptions: {
          color: "#ffffff",
        },
        cornersSquareOptions: {
          type: "extra-rounded"
        }
      });
      
      qrRef.current.innerHTML = "";
      qrCode.append(qrRef.current);
      setQrGenerated(true);
    }
  }, [ticketCode, qrGenerated]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <QrCode className="h-4 w-4 mr-1" />
          Show Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Your Event Ticket</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          <div ref={qrRef} className="bg-white p-4 rounded-lg shadow" />
          <div className="text-center">
            <p className="font-medium">{guestName}</p>
            <p className="text-sm text-muted-foreground font-mono">{ticketCode}</p>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Show this QR code at the event entrance for check-in
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UserEvents;