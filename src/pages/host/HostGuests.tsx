import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import HostDashboardLayout from "@/components/layouts/HostDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RsvpDialog } from "@/components/events/RsvpDialog";
import { TicketQRCodeDialog } from "@/components/events/TicketQRCodeDialog";
import { PaymentStatusBadge } from "@/components/events/payments/PaymentStatusBadge";
import { PayTicketButton } from "@/components/events/payments/PayTicketButton";
import QRCode from "@/components/QRCode";

const HostGuests = () => {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isRsvpDialogOpen, setIsRsvpDialogOpen] = useState(false);
  const [qrDialog, setQrDialog] = useState<{ guest: any } | null>(null);

  const { data: events } = useQuery({
    queryKey: ["host-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: rsvpStats } = useQuery({
    queryKey: ["rsvp-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rsvps")
        .select("event_id, response_status");

      if (error) throw error;
      
      // Group RSVPs by event and count responses
      const stats = (data || []).reduce((acc: Record<string, any>, rsvp) => {
        if (!acc[rsvp.event_id]) {
          acc[rsvp.event_id] = { confirmed: 0, declined: 0, maybe: 0, total: 0 };
        }
        
        acc[rsvp.event_id][rsvp.response_status] += 1;
        acc[rsvp.event_id].total += 1;
        
        return acc;
      }, {});
      
      return stats;
    },
  });

  // New function to get ticket code and payment info. This is just simulated for now.
  const getGuestExtraInfo = (guest: any) => ({
    ticketCode: guest.ticket_code || guest.id || "",
    paymentStatus: guest.payment_status || "pending",
    isVIP: guest.is_vip,
    category: guest.category,
    plusOne: guest.plus_one_name || (guest.plus_one_allowed ? "Allowed" : "-"),
  });

  return (
    <HostDashboardLayout>
      <div className="space-y-8">
        <h2 className="text-2xl font-bold">Guest Lists</h2>
        
        <Card>
          <CardHeader>
            <CardTitle>Event Guest Lists</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All Events</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
                <TabsTrigger value="past">Past Events</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total Guests</TableHead>
                      <TableHead>Confirmed</TableHead>
                      <TableHead>Declined</TableHead>
                      <TableHead>VIPs</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Tickets</TableHead>
                      <TableHead>Guest List</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events?.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>{event.title}</TableCell>
                        <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                        <TableCell>{rsvpStats?.[event.id]?.total || 0}</TableCell>
                        <TableCell className="text-green-600">{rsvpStats?.[event.id]?.confirmed || 0}</TableCell>
                        <TableCell className="text-red-600">{rsvpStats?.[event.id]?.declined || 0}</TableCell>
                         <TableCell>
                           {/* VIP count - will be implemented when guest management is added */}
                           0
                         </TableCell>
                         <TableCell>
                           {/* Payment status - will be implemented when payment features are added */}
                           <PaymentStatusBadge status="n/a" />
                         </TableCell>
                         <TableCell>
                           {/* QR codes - will be implemented when ticketing is added */}
                           -
                         </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedEventId(event.id);
                              setIsRsvpDialogOpen(true);
                            }}
                          >
                            View Guests
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="upcoming" className="mt-4">
                {/* Similar table for upcoming events */}
                <p className="text-muted-foreground">Filter for upcoming events</p>
              </TabsContent>
              <TabsContent value="past" className="mt-4">
                {/* Similar table for past events */}
                <p className="text-muted-foreground">Filter for past events</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {qrDialog && (
        <TicketQRCodeDialog
          open={!!qrDialog}
          onOpenChange={() => setQrDialog(null)}
          ticketCode={getGuestExtraInfo(qrDialog.guest).ticketCode}
          guestName={qrDialog.guest.name}
          guestEmail={qrDialog.guest.email}
        />
      )}

      <RsvpDialog
        eventId={selectedEventId}
        isOpen={isRsvpDialogOpen}
        onOpenChange={setIsRsvpDialogOpen}
      />
    </HostDashboardLayout>
  );
};

export default HostGuests;
