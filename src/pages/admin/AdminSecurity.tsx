
import AdminDashboardLayout from "@/components/layouts/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Lock, 
  Eye, 
  AlertTriangle,
  Users,
  Activity,
  Clock,
  Ban
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const AdminSecurity = () => {
  const securityEvents = [
    {
      id: 1,
      type: "login_attempt",
      user: "admin@rsvplatform.com",
      ip: "192.168.1.100",
      status: "success",
      timestamp: new Date().toISOString(),
    },
    {
      id: 2,
      type: "failed_login",
      user: "unknown@test.com",
      ip: "10.0.0.1",
      status: "blocked",
      timestamp: new Date(Date.now() - 300000).toISOString(),
    },
    {
      id: 3,
      type: "password_change",
      user: "host@example.com",
      ip: "192.168.1.50",
      status: "success",
      timestamp: new Date(Date.now() - 600000).toISOString(),
    },
  ];

  const getEventIcon = (type: string) => {
    switch (type) {
      case "login_attempt":
        return <Eye className="h-4 w-4 text-blue-500" />;
      case "failed_login":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "password_change":
        return <Lock className="h-4 w-4 text-green-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
      case "blocked":
        return <Badge variant="destructive">Blocked</Badge>;
      case "warning":
        return <Badge variant="destructive" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Center</h1>
          <p className="text-muted-foreground">
            Monitor security events and manage platform security settings
          </p>
        </div>

        {/* Security Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
              <p className="text-xs text-muted-foreground">Currently online</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
              <Ban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Auto-blocked</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Score</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">94%</div>
              <p className="text-xs text-muted-foreground">Excellent</p>
            </CardContent>
          </Card>
        </div>

        {/* Security Settings Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Security Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Button variant="outline" className="flex flex-col h-20 gap-2">
                <Lock className="h-5 w-5" />
                <span className="text-xs">Force Password Reset</span>
              </Button>
              
              <Button variant="outline" className="flex flex-col h-20 gap-2">
                <Ban className="h-5 w-5" />
                <span className="text-xs">Block IP Address</span>
              </Button>
              
              <Button variant="outline" className="flex flex-col h-20 gap-2">
                <Users className="h-5 w-5" />
                <span className="text-xs">Review Sessions</span>
              </Button>
              
              <Button variant="outline" className="flex flex-col h-20 gap-2">
                <Activity className="h-5 w-5" />
                <span className="text-xs">Security Audit</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Security Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Security Events
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Type</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {securityEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getEventIcon(event.type)}
                        <span className="capitalize">
                          {event.type.replace("_", " ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{event.user}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                        {event.ip}
                      </code>
                    </TableCell>
                    <TableCell>{getStatusBadge(event.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Security Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Enable Two-Factor Authentication</h4>
                  <p className="text-sm text-yellow-700">
                    Require 2FA for all admin accounts to improve security.
                  </p>
                  <Button size="sm" className="mt-2">
                    Configure 2FA
                  </Button>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Update Password Policy</h4>
                  <p className="text-sm text-blue-700">
                    Consider implementing stronger password requirements.
                  </p>
                  <Button size="sm" className="mt-2" variant="outline">
                    Review Policy
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminSecurity;
