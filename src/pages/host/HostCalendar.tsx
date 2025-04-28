
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description?: string;
}

const HostCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);

  const { data: events } = useQuery({
    queryKey: ["calendar-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      return data as Event[];
    },
  });

  // Find events for the selected date
  const eventsForSelectedDate = events?.filter((event) => {
    const eventDate = new Date(event.date);
    return selectedDate && isSameDay(eventDate, selectedDate);
  });

  // Function to highlight dates with events
  const isDayWithEvent = (day: Date): boolean => {
    return events?.some((event) => {
      const eventDate = new Date(event.date);
      return isSameDay(eventDate, day);
    }) || false;
  };

  return (
    <DashboardLayout userType="host">
      <div className="space-y-8">
        <h2 className="text-2xl font-bold">Event Calendar</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                modifiersStyles={{
                  selected: { backgroundColor: 'hsl(var(--primary))' }
                }}
                modifiers={{
                  event: (date) => isDayWithEvent(date)
                }}
                styles={{
                  day_event: { 
                    backgroundColor: 'rgba(var(--primary), 0.1)',
                    borderBottom: '2px solid hsl(var(--primary))'
                  }
                }}
              />
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                {selectedDate ? `Events on ${format(selectedDate, 'PPP')}` : 'Events'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eventsForSelectedDate && eventsForSelectedDate.length > 0 ? (
                <div className="space-y-4">
                  {eventsForSelectedDate.map((event) => (
                    <div 
                      key={event.id} 
                      className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        setSelectedEvent(event);
                        setIsEventDetailsOpen(true);
                      }}
                    >
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.date), 'p')} • {event.location}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No events scheduled for this date.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Event details dialog */}
      <Dialog open={isEventDetailsOpen} onOpenChange={setIsEventDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <h4 className="font-semibold text-sm">Date and Time</h4>
              <p>{selectedEvent && format(new Date(selectedEvent.date), 'PPP p')}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm">Location</h4>
              <p>{selectedEvent?.location}</p>
            </div>
            {selectedEvent?.description && (
              <div>
                <h4 className="font-semibold text-sm">Description</h4>
                <p>{selectedEvent.description}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default HostCalendar;
