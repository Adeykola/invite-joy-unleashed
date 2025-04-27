
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EventForm } from "@/components/EventForm";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, UserPlus, Calendar, Users, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isViewingRsvps, setIsViewingRsvps] = useState(false);
  
  // Admin dashboard analytics
  const { data: eventStats, refetch: refetchEvents } = useQuery({
    queryKey: ["admin-event-stats"],
    queryFn: async () => {
      const today = new Date();
      const { data: events, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      
      // Calculate stats
      const pastEvents = events.filter(e => new Date(e.date) < today);
      const upcomingEvents = events.filter(e => new Date(e.date) >= today);
      
      return {
        total: events.length,
        past: pastEvents.length,
        upcoming: upcomingEvents.length,
        events: events
      };
    },
  });

  // Query for RSVPs when viewing them
  const { data: rsvps } = useQuery({
    queryKey: ["rsvps", selectedEventId],
    enabled: !!selectedEventId && isViewingRsvps,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rsvps")
        .select("*")
        .eq("event_id", selectedEventId);

      if (error) throw error;
      return data;
    },
  });

  // Delete event function
  const handleDeleteEvent = async (eventId: string) => {
    try {
      // First delete RSVPs linked to the event
      await supabase
        .from("rsvps")
        .delete()
        .eq("event_id", eventId);
        
      // Then delete the event itself
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;

      toast({
        title: "Event Deleted",
        description: "The event and all its RSVPs have been deleted.",
      });
      
      refetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "Failed to delete the event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const viewRsvps = (eventId: string) => {
    setSelectedEventId(eventId);
    setIsViewingRsvps(true);
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        <h2 className="text-3xl font-bold">Admin Dashboard</h2>
        <p className="text-gray-600">
          Complete management of all events and platform data.
        </p>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="text-2xl font-bold">{eventStats?.total || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-2xl font-bold text-green-600">{eventStats?.upcoming || 0}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Past Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-2xl font-bold text-gray-600">{eventStats?.past || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Admin Features */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50">
            <div className="flex justify-between items-center">
              <CardTitle>Event Management</CardTitle>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Create New Event</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                  </DialogHeader>
                  <EventForm onSuccess={() => {
                    setIsCreateDialogOpen(false);
                    refetchEvents();
                    toast({
                      title: "Event Created",
                      description: "The new event has been added successfully.",
                    });
                  }} />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventStats?.events && eventStats.events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        {format(new Date(event.date), "PP")}
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(event.date), "p")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{event.location}</TableCell>
                    <TableCell>{event.capacity || "Unlimited"}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewRsvps(event.id)}
                        >
                          <Users className="h-4 w-4 mr-1" />
                          RSVPs
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Event
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-500"
                              onClick={() => handleDeleteEvent(event.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Event
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!eventStats?.events || eventStats.events.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      No events found. Create your first event to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* RSVP Dialog */}
        <Dialog open={isViewingRsvps} onOpenChange={setIsViewingRsvps}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                Event RSVPs
                {eventStats?.events && selectedEventId && (
                  <span className="ml-2 font-normal text-muted-foreground">
                    for {eventStats.events.find(e => e.id === selectedEventId)?.title}
                  </span>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Comments</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rsvps && rsvps.map((rsvp) => (
                    <TableRow key={rsvp.id}>
                      <TableCell>{rsvp.guest_name}</TableCell>
                      <TableCell>{rsvp.guest_email}</TableCell>
                      <TableCell>
                        <Badge variant={
                          rsvp.response_status === 'confirmed' ? 'default' :
                          rsvp.response_status === 'declined' ? 'destructive' : 'secondary'
                        }>
                          {rsvp.response_status}
                        </Badge>
                      </TableCell>
                      <TableCell>{rsvp.comments || "No comments"}</TableCell>
                    </TableRow>
                  ))}
                  {(!rsvps || rsvps.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        No RSVPs found for this event.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
