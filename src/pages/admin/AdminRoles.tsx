
import AdminDashboardLayout from "@/components/layouts/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  UserCheck, 
  Shield, 
  Users, 
  Plus,
  Edit,
  Trash2,
  Settings
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const AdminRoles = () => {
  const roles = [
    {
      id: 1,
      name: "Admin",
      users: 3,
      permissions: ["Full Access", "User Management", "System Settings", "Security"],
      description: "Complete system access and management capabilities",
      color: "red"
    },
    {
      id: 2,
      name: "Host",
      users: 12,
      permissions: ["Event Management", "Guest Management", "Analytics", "Communications"],
      description: "Can create and manage events, invite guests, and access hosting tools",
      color: "blue"
    },
    {
      id: 3,
      name: "User",
      users: 156,
      permissions: ["RSVP to Events", "View Public Events", "Profile Management"],
      description: "Standard user with basic event participation capabilities",
      color: "green"
    },
    {
      id: 4,
      name: "Moderator",
      users: 5,
      permissions: ["Content Moderation", "User Support", "Event Review"],
      description: "Can moderate content and assist with user support",
      color: "yellow"
    }
  ];

  const getRoleBadge = (role: string, color: string) => {
    const variants: Record<string, any> = {
      red: "destructive",
      blue: "default", 
      green: "secondary",
      yellow: "outline"
    };
    
    return <Badge variant={variants[color] || "secondary"}>{role}</Badge>;
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Roles</h1>
            <p className="text-muted-foreground">
              Manage user roles and permissions across the platform
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        </div>

        {/* Role Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roles.length}</div>
              <p className="text-xs text-muted-foreground">Active roles</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administrators</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {roles.find(r => r.name === "Admin")?.users || 0}
              </div>
              <p className="text-xs text-muted-foreground">Admin users</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Event Hosts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {roles.find(r => r.name === "Host")?.users || 0}
              </div>
              <p className="text-xs text-muted-foreground">Host users</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {roles.find(r => r.name === "User")?.users || 0}
              </div>
              <p className="text-xs text-muted-foreground">Standard users</p>
            </CardContent>
          </Card>
        </div>

        {/* Roles Table */}
        <Card>
          <CardHeader>
            <CardTitle>Role Management</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getRoleBadge(role.name, role.color)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{role.users}</div>
                      <div className="text-sm text-muted-foreground">
                        {role.users === 1 ? "user" : "users"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {role.permissions.slice(0, 3).map((permission, index) => (
                          <Badge key={index} variant="outline" className="text-xs mr-1">
                            {permission}
                          </Badge>
                        ))}
                        {role.permissions.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{role.permissions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {role.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        {role.name !== "Admin" && role.name !== "User" && (
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Permission Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Permission Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-4">
              Detailed permission configuration and role-based access control coming soon...
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Core Permissions</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• User Management</li>
                  <li>• Event Creation & Management</li>
                  <li>• System Settings</li>
                  <li>• Analytics Access</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Advanced Permissions</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Security Management</li>
                  <li>• Integration Configuration</li>
                  <li>• Role Management</li>
                  <li>• System Monitoring</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminRoles;
