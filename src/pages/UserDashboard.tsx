
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const UserDashboard = () => {
  // Mock data for the dashboard
  const upcomingEvents = [
    { 
      id: 1, 
      name: "Tech Conference 2025", 
      date: "May 15, 2025", 
      time: "9:00 AM - 5:00 PM",
      location: "Convention Center, San Francisco",
      status: "confirmed",
      ticketType: "VIP Pass"
    },
    { 
      id: 2, 
      name: "Sarah's Wedding", 
      date: "June 10, 2025", 
      time: "4:00 PM - 11:00 PM",
      location: "Sunset Gardens, Los Angeles",
      status: "confirmed",
      ticketType: "Guest"
    },
  ];
  
  const pendingInvitations = [
    { 
      id: 1, 
      name: "Networking Mixer", 
      date: "May 22, 2025", 
      time: "6:30 PM - 9:00 PM",
      location: "Skyline Lounge, Downtown",
      host: "Business Professionals Association"
    },
    { 
      id: 2, 
      name: "Charity Gala Dinner", 
      date: "June 5, 2025", 
      time: "7:00 PM - 10:00 PM",
      location: "Grand Plaza Hotel",
      host: "Global Relief Foundation"
    },
    { 
      id: 3, 
      name: "Product Design Workshop", 
      date: "May 28, 2025", 
      time: "10:00 AM - 2:00 PM",
      location: "Innovation Hub",
      host: "Design Thinking Institute"
    },
  ];

  return (
    <DashboardLayout userType="user">
      <h2 className="text-2xl font-bold mb-6">Welcome Back!</h2>
      
      {/* Upcoming Events */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Your Upcoming Events</h3>
          <Link to="/user-dashboard/rsvps" className="text-sm text-indigo-600 hover:text-indigo-500">
            View all RSVPs
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcomingEvents.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-semibold text-lg">{event.name}</h4>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {event.status === "confirmed" && <CheckCircle className="mr-1 h-3 w-3" />}
                    {event.status === "confirmed" ? "Confirmed" : "Pending"}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="mr-2 h-4 w-4" />
                    {event.date} • {event.time}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="mr-2 h-4 w-4" />
                    {event.location}
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-2 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-gray-500">Ticket Type</span>
                    <p className="font-medium">{event.ticketType}</p>
                  </div>
                  <Button variant="outline">View Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Pending Invitations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Pending Invitations</h3>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="divide-y">
              {pendingInvitations.map((invitation) => (
                <div key={invitation.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{invitation.name}</h4>
                      <p className="text-sm text-gray-500">Hosted by {invitation.host}</p>
                    </div>
                    <div className="flex items-center mt-2 md:mt-0">
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 mr-3">
                        <Clock className="mr-1 h-3 w-3" />
                        Awaiting Response
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row text-sm text-gray-600 mb-3">
                    <div className="flex items-center md:mr-4">
                      <Calendar className="mr-1 h-4 w-4" />
                      {invitation.date}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="mr-1 h-4 w-4" />
                      {invitation.location}
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 mt-2">
                    <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600">
                      Respond
                    </Button>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
