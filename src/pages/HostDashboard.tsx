
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Ticket, TrendingUp, Mail, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

const HostDashboard = () => {
  // Mock data for the dashboard
  const stats = [
    { name: "Active Events", value: 8, icon: <Calendar className="h-8 w-8 text-indigo-600" /> },
    { name: "Total RSVPs", value: 527, icon: <Users className="h-8 w-8 text-violet-600" /> },
    { name: "Tickets Sold", value: 342, icon: <Ticket className="h-8 w-8 text-emerald-600" /> },
    { name: "Email Open Rate", value: "73%", icon: <Mail className="h-8 w-8 text-amber-600" /> },
  ];

  const upcomingEvents = [
    { 
      id: 1, 
      name: "Product Launch Party", 
      date: "May 15, 2025", 
      location: "Downtown Convention Center",
      confirmed: 78,
      pending: 23,
      capacity: 150
    },
    { 
      id: 2, 
      name: "Annual Team Retreat", 
      date: "June 10, 2025", 
      location: "Mountain Resort",
      confirmed: 42,
      pending: 3,
      capacity: 50 
    },
    { 
      id: 3, 
      name: "Client Appreciation Dinner", 
      date: "May 28, 2025", 
      location: "Riverside Restaurant",
      confirmed: 34,
      pending: 12,
      capacity: 60
    },
  ];

  const recentActivity = [
    { id: 1, text: "Sarah Johnson RSVP'd to Product Launch Party", time: "10 minutes ago" },
    { id: 2, text: "5 new tickets sold for Annual Team Retreat", time: "1 hour ago" },
    { id: 3, text: "You sent reminder emails to 23 pending guests", time: "3 hours ago" },
    { id: 4, text: "Michael Chen updated his meal preference", time: "5 hours ago" },
    { id: 5, text: "Guest list for Client Appreciation Dinner exported", time: "Yesterday" },
  ];

  return (
    <DashboardLayout userType="host">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold">Event Host Dashboard</h2>
        <Button className="mt-4 md:mt-0 bg-gradient-to-r from-indigo-600 to-purple-600">
          <Plus className="mr-2 h-4 w-4" /> Create New Event
        </Button>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              {stat.icon}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Events */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upcoming Events</CardTitle>
              <Link to="/host-dashboard/events" className="text-sm text-indigo-600 hover:text-indigo-500">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                      <h3 className="font-semibold">{event.name}</h3>
                      <span className="text-sm text-gray-500">{event.date}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{event.location}</p>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Attendance: {event.confirmed + event.pending}/{event.capacity}</span>
                        <span className="text-green-600">
                          {Math.round(((event.confirmed + event.pending) / event.capacity) * 100)}%
                        </span>
                      </div>
                      <Progress value={((event.confirmed + event.pending) / event.capacity) * 100} className="h-2" />
                      <div className="flex justify-between text-xs mt-2 text-gray-500">
                        <span>{event.confirmed} confirmed</span>
                        <span>{event.pending} pending</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Activity */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <p className="text-sm">{activity.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HostDashboard;
