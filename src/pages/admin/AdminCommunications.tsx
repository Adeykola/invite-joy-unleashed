
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminDashboardLayout from "@/components/layouts/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Mail, Bell, Users, Send, Plus, Eye } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AdminCommunications = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    type: "whatsapp",
    subject: "",
    content: "",
    target_audience: {}
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch communication stats
  const { data: stats } = useQuery({
    queryKey: ['communication-stats'],
    queryFn: async () => {
      const { data: campaigns } = await supabase
        .from('communication_campaigns')
        .select('*');
      
      const { data: broadcasts } = await supabase
        .from('whatsapp_broadcasts')
        .select('*');

      const totalMessages = broadcasts?.reduce((sum, b) => sum + (b.sent_count || 0), 0) || 0;
      const totalReach = broadcasts?.reduce((sum, b) => sum + (b.total_recipients || 0), 0) || 0;

      return {
        totalCampaigns: campaigns?.length || 0,
        activeCampaigns: campaigns?.filter(c => c.status === 'sent').length || 0,
        totalMessages,
        totalReach
      };
    }
  });

  // Fetch campaigns
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['communication-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('communication_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Create campaign mutation
  const createCampaign = useMutation({
    mutationFn: async (campaign: typeof newCampaign) => {
      const { data, error } = await supabase
        .from('communication_campaigns')
        .insert([{
          ...campaign,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Campaign created successfully!",
        description: "Your communication campaign has been saved as draft.",
      });
      setIsCreateDialogOpen(false);
      setNewCampaign({
        name: "",
        type: "whatsapp",
        subject: "",
        content: "",
        target_audience: {}
      });
      queryClient.invalidateQueries({ queryKey: ['communication-campaigns'] });
    },
    onError: (error) => {
      toast({
        title: "Error creating campaign",
        description: "Please try again.",
        variant: "destructive",
      });
      console.error('Error creating campaign:', error);
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-100 text-green-800">Sent</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'whatsapp':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'email':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'sms':
        return <Bell className="h-4 w-4 text-orange-500" />;
      default:
        return <Send className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Communications Center</h1>
            <p className="text-muted-foreground">
              Manage platform-wide communications and campaigns
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Campaign</DialogTitle>
                <DialogDescription>
                  Set up a new communication campaign for your users.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Campaign Name</label>
                  <Input
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                    placeholder="Event Reminder Campaign"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select value={newCampaign.type} onValueChange={(value) => setNewCampaign({...newCampaign, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newCampaign.type === 'email' && (
                  <div>
                    <label className="text-sm font-medium">Subject</label>
                    <Input
                      value={newCampaign.subject}
                      onChange={(e) => setNewCampaign({...newCampaign, subject: e.target.value})}
                      placeholder="Important Event Update"
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium">Message Content</label>
                  <Textarea
                    value={newCampaign.content}
                    onChange={(e) => setNewCampaign({...newCampaign, content: e.target.value})}
                    placeholder="Enter your message here..."
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => createCampaign.mutate(newCampaign)}
                  disabled={!newCampaign.name || !newCampaign.content || createCampaign.isPending}
                >
                  {createCampaign.isPending ? "Creating..." : "Create Campaign"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCampaigns || 0}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeCampaigns || 0}</div>
              <p className="text-xs text-muted-foreground">Currently sent</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalMessages || 0}</div>
              <p className="text-xs text-muted-foreground">Total delivered</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalReach || 0}</div>
              <p className="text-xs text-muted-foreground">Users reached</p>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : campaigns && campaigns.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(campaign.type)}
                          <span className="capitalize">{campaign.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                      <TableCell>{campaign.total_recipients || 0}</TableCell>
                      <TableCell>
                        {campaign.total_recipients > 0 
                          ? `${Math.round((campaign.successful_sends / campaign.total_recipients) * 100)}%`
                          : "0%"
                        }
                      </TableCell>
                      <TableCell>
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No campaigns created yet</p>
                <p className="text-sm text-muted-foreground">Create your first campaign to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminCommunications;
