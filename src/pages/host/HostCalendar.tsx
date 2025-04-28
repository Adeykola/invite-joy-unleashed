
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Calendar as CalendarIcon, Clock, Info, MapPin } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format, isToday, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import DashboardLayout from "@/components/layouts/DashboardLayout";

const HostCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const { data: events, isLoading } = useQuery({
    queryKey: ["host-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });
        
      if (error) throw error;
      return data || [];
    }
  });
  
  // Filter events for the selected date
  const eventsForSelectedDate = events?.filter(event => {
    const eventDate = new Date(event.date);
    const selected = selectedDate || new Date();
    
    return (
      eventDate.getDate() === selected.getDate() &&
      eventDate.getMonth() === selected.getMonth() &&
      eventDate.getFullYear() === selected.getFullYear()
    );
  });
  
  // Get all dates that have events
  const eventDates = events?.map(event => new Date(event.date)) || [];
  
  return (
    <DashboardLayout userType="host">
      <div className="space-y-8">
        <h2 className="text-2xl font-bold">Event Calendar</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                modifiers={{
                  event: eventDates
                }}
                modifiersStyles={{
                  event: {
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    borderRadius: '100%'
                  }
                }}
              />
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                {selectedDate ? (
                  <span className="flex items-center">
                    <CalendarIcon className="mr-2 h-5 w-5" />
                    {isToday(selectedDate) ? (
                      <span>Today's Events</span>
                    ) : (
                      <span>Events for {format(selectedDate, "MMMM d, yyyy")}</span>
                    )}
                  </span>
                ) : (
                  <span>No Date Selected</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : eventsForSelectedDate && eventsForSelectedDate.length > 0 ? (
                <div className="space-y-4">
                  {eventsForSelectedDate.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium">{event.title}</h3>
                        <Badge variant={event.status === 'active' ? "default" : "secondary"}>
                          {event.status === 'active' ? 'Active' : 'Draft'}
                        </Badge>
                      </div>
                      
                      <div className="mt-2 space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          {format(parseISO(event.date), "h:mm a")}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4" />
                          {event.location}
                        </div>
                        {event.capacity && (
                          <div className="flex items-center">
                            <Info className="mr-2 h-4 w-4" />
                            Capacity: {event.capacity} guests
                          </div>
                        )}
                      </div>
                      
                      <Separator className="my-3" />
                      
                      <div className="flex justify-end">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" className="mr-2">Manage RSVPs</Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View and manage guest responses</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <Button size="sm">Edit Event</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No events scheduled for this date.</p>
                  <Button variant="outline" className="mt-4">
                    Create New Event
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HostCalendar;
