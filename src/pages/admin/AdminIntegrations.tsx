
import AdminDashboardLayout from "@/components/layouts/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Zap, 
  Mail, 
  MessageSquare, 
  Calendar,
  Database,
  Webhook,
  Settings,
  CheckCircle,
  XCircle,
  Plus
} from "lucide-react";

const AdminIntegrations = () => {
  const integrations = [
    {
      id: 1,
      name: "WhatsApp Business API",
      description: "Send event notifications via WhatsApp",
      icon: MessageSquare,
      status: "connected",
      category: "Communication"
    },
    {
      id: 2,
      name: "Mailgun",
      description: "Email delivery service for notifications",
      icon: Mail,
      status: "connected",
      category: "Email"
    },
    {
      id: 3,
      name: "Google Calendar",
      description: "Sync events with Google Calendar",
      icon: Calendar,
      status: "disconnected",
      category: "Calendar"
    },
    {
      id: 4,
      name: "Zapier",
      description: "Connect with 3000+ apps and services",
      icon: Zap,
      status: "available",
      category: "Automation"
    },
    {
      id: 5,
      name: "Webhook Endpoints",
      description: "Custom webhook integrations",
      icon: Webhook,
      status: "configured",
      category: "Custom"
    },
    {
      id: 6,
      name: "Analytics API",
      description: "Export data to external analytics tools",
      icon: Database,
      status: "available",
      category: "Analytics"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
      case "configured":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "disconnected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "available":
        return <Plus className="h-4 w-4 text-blue-500" />;
      default:
        return <Settings className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge variant="default" className="bg-green-100 text-green-800">Connected</Badge>;
      case "configured":
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Configured</Badge>;
      case "disconnected":
        return <Badge variant="destructive">Disconnected</Badge>;
      case "available":
        return <Badge variant="secondary">Available</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getActionButton = (status: string, name: string) => {
    switch (status) {
      case "connected":
      case "configured":
        return (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">Configure</Button>
            <Button variant="ghost" size="sm">Disconnect</Button>
          </div>
        );
      case "disconnected":
        return <Button size="sm">Reconnect</Button>;
      case "available":
        return <Button size="sm">Connect</Button>;
      default:
        return <Button variant="outline" size="sm">Manage</Button>;
    }
  };

  const categoryStats = {
    Communication: integrations.filter(i => i.category === "Communication").length,
    Email: integrations.filter(i => i.category === "Email").length,
    Calendar: integrations.filter(i => i.category === "Calendar").length,
    Automation: integrations.filter(i => i.category === "Automation").length,
    Custom: integrations.filter(i => i.category === "Custom").length,
    Analytics: integrations.filter(i => i.category === "Analytics").length,
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
            <p className="text-muted-foreground">
              Manage third-party integrations and API connections
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        </div>

        {/* Integration Overview */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {Object.entries(categoryStats).map(([category, count]) => (
            <Card key={category}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{category}</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground">integrations</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Active Integrations */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {integrations.map((integration) => {
                const IconComponent = integration.icon;
                return (
                  <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{integration.name}</h3>
                          {getStatusIcon(integration.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {integration.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {integration.category}
                          </Badge>
                          {getStatusBadge(integration.status)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Switch 
                        checked={integration.status === "connected" || integration.status === "configured"} 
                        disabled={integration.status === "available"}
                      />
                      {getActionButton(integration.status, integration.name)}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Webhook Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              Webhook Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">Event Webhooks</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive real-time notifications when events are created, updated, or RSVPs change.
                  </p>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Configure</Button>
                    <Button variant="ghost" size="sm">Test</Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">User Webhooks</h4>
                  <p className="text-sm text-muted-foreground">
                    Get notified when users register, update profiles, or change roles.
                  </p>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Configure</Button>
                    <Button variant="ghost" size="sm">Test</Button>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800">API Documentation</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Complete API documentation and integration guides are available for developers.
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  View API Docs
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminIntegrations;
