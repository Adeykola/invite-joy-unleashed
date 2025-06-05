
import AdminDashboardLayout from "@/components/layouts/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Mail, Bell, Users, Send } from "lucide-react";

const AdminCommunications = () => {
  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Communications Center</h1>
          <p className="text-muted-foreground">
            Platform-wide communication tools and messaging
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Broadcast Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Email Campaigns</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Active campaigns</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Push Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">Sent today</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">Users reached</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Communication Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Advanced communication features including broadcast messaging, email campaigns, and push notifications coming soon...
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <Send className="h-5 w-5 text-blue-500" />
                  <h3 className="font-medium">Broadcast Messages</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Send platform-wide announcements to all users
                </p>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-green-500" />
                  <h3 className="font-medium">Email Campaigns</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Create and manage targeted email campaigns
                </p>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-orange-500" />
                  <h3 className="font-medium">Push Notifications</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Send real-time notifications to users
                </p>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminCommunications;
