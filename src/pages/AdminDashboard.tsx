
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { LayoutGrid, Users, Calendar, TrendingUp } from "lucide-react";

const AdminDashboard = () => {
  // Mock data for the dashboard
  const stats = [
    { name: "Total Events", value: "2,543", icon: <Calendar className="h-8 w-8 text-indigo-600" />, trend: "+5.3%" },
    { name: "Active Users", value: "12,361", icon: <Users className="h-8 w-8 text-violet-600" />, trend: "+12.7%" },
    { name: "Event Responses", value: "89,726", icon: <TrendingUp className="h-8 w-8 text-emerald-600" />, trend: "+16.2%" },
    { name: "New Sign-ups", value: "342", icon: <LayoutGrid className="h-8 w-8 text-amber-600" />, trend: "+7.1%" },
  ];

  const recentEvents = [
    { id: 1, name: "Annual Tech Conference", date: "May 15, 2025", host: "TechCorp Inc.", attendees: 450, status: "active" },
    { id: 2, name: "Summer Music Festival", date: "June 5, 2025", host: "Sound Productions", attendees: 1250, status: "active" },
    { id: 3, name: "Startup Networking Mixer", date: "April 28, 2025", host: "Founder's Club", attendees: 120, status: "active" },
    { id: 4, name: "Charity Gala Dinner", date: "May 22, 2025", host: "Global Relief Foundation", attendees: 300, status: "active" },
  ];

  const recentUsers = [
    { id: 1, name: "Emma Wilson", email: "emma@example.com", joined: "Apr 23, 2025", role: "Host" },
    { id: 2, name: "James Chen", email: "james@example.com", joined: "Apr 22, 2025", role: "User" },
    { id: 3, name: "Sofia Rodriguez", email: "sofia@example.com", joined: "Apr 21, 2025", role: "Host" },
    { id: 4, name: "Michael Johnson", email: "michael@example.com", joined: "Apr 20, 2025", role: "User" },
  ];

  return (
    <DashboardLayout userType="admin">
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-emerald-600 mt-1">{stat.trend}</p>
              </div>
              {stat.icon}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-500 border-b">
                  <tr>
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Host</th>
                    <th className="pb-2 font-medium">Attendees</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEvents.map((event) => (
                    <tr key={event.id} className="border-b hover:bg-gray-50">
                      <td className="py-3">{event.name}</td>
                      <td className="py-3">{event.date}</td>
                      <td className="py-3">{event.host}</td>
                      <td className="py-3">{event.attendees}</td>
                      <td className="py-3">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          {event.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-500 border-b">
                  <tr>
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium">Email</th>
                    <th className="pb-2 font-medium">Joined</th>
                    <th className="pb-2 font-medium">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3">{user.name}</td>
                      <td className="py-3">{user.email}</td>
                      <td className="py-3">{user.joined}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === "Host" ? "bg-indigo-100 text-indigo-800" : "bg-blue-100 text-blue-800"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
