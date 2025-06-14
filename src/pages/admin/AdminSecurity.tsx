
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminDashboardLayout from "@/components/layouts/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Shield, 
  Lock, 
  Eye, 
  AlertTriangle,
  Users,
  Activity,
  Clock,
  Ban,
  Search,
  RefreshCw
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";

const AdminSecurity = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  // Fetch audit logs
  const { data: auditLogs, isLoading, refetch } = useQuery({
    queryKey: ['audit-logs', searchTerm, actionFilter],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      if (searchTerm) {
        query = query.or(`action.ilike.%${searchTerm}%,resource_type.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch security stats
  const { data: securityStats } = useQuery({
    queryKey: ['security-stats'],
    queryFn: async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Get failed login attempts in last 24 hours
      const { data: failedLogins } = await supabase
        .from('audit_logs')
        .select('id')
        .eq('action', 'failed_login')
        .gte('created_at', yesterday.toISOString());

      // Get active sessions (users who logged in in last hour)
      const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const { data: activeSessions } = await supabase
        .from('audit_logs')
        .select('user_id')
        .eq('action', 'login_success')
        .gte('created_at', hourAgo.toISOString());

      // Get unique active users
      const uniqueActiveSessions = new Set(activeSessions?.map(s => s.user_id) || []);

      // Get blocked IPs (simulate with failed login attempts from same IP)
      const { data: suspiciousIPs } = await supabase
        .from('audit_logs')
        .select('ip_address')
        .eq('action', 'failed_login')
        .gte('created_at', yesterday.toISOString());

      // Count IPs with more than 5 failed attempts
      const ipCounts = suspiciousIPs?.reduce((acc, log) => {
        if (log.ip_address) {
          acc[log.ip_address] = (acc[log.ip_address] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      const blockedIPs = Object.entries(ipCounts).filter(([_, count]) => count > 5).length;

      return {
        activeSessions: uniqueActiveSessions.size,
        failedLogins: failedLogins?.length || 0,
        blockedIPs,
        securityScore: Math.max(85, 100 - (failedLogins?.length || 0) * 2 - blockedIPs * 5)
      };
    }
  });

  const getEventIcon = (action: string) => {
    switch (action) {
      case "login_success":
      case "login_attempt":
        return <Eye className="h-4 w-4 text-blue-500" />;
      case "failed_login":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "password_change":
      case "profile_update":
        return <Lock className="h-4 w-4 text-green-500" />;
      case "admin_action":
        return <Shield className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (action: string) => {
    switch (action) {
      case "login_success":
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case "failed_login":
        return <Badge variant="destructive">Failed</Badge>;
      case "password_change":
        return <Badge className="bg-blue-100 text-blue-800">Updated</Badge>;
      case "admin_action":
        return <Badge className="bg-purple-100 text-purple-800">Admin</Badge>;
      default:
        return <Badge variant="secondary">{action.replace('_', ' ')}</Badge>;
    }
  };

  // Log a demo security event
  const logSecurityEvent = async (action: string) => {
    try {
      await supabase.rpc('log_admin_action', {
        p_action: action,
        p_resource_type: 'security',
        p_details: { source: 'admin_dashboard', timestamp: new Date().toISOString() }
      });
      refetch();
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Security Center</h1>
            <p className="text-muted-foreground">
              Monitor security events and manage platform security
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Security Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securityStats?.activeSessions || 0}</div>
              <p className="text-xs text-muted-foreground">Currently online</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securityStats?.failedLogins || 0}</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suspicious IPs</CardTitle>
              <Ban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securityStats?.blockedIPs || 0}</div>
              <p className="text-xs text-muted-foreground">High risk</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Score</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                (securityStats?.securityScore || 0) >= 90 ? 'text-green-600' : 
                (securityStats?.securityScore || 0) >= 80 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {securityStats?.securityScore || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {(securityStats?.securityScore || 0) >= 90 ? 'Excellent' : 
                 (securityStats?.securityScore || 0) >= 80 ? 'Good' : 'Needs Attention'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Security Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Security Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Button 
                variant="outline" 
                className="flex flex-col h-20 gap-2"
                onClick={() => logSecurityEvent('security_scan')}
              >
                <Shield className="h-5 w-5" />
                <span className="text-xs">Security Scan</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col h-20 gap-2"
                onClick={() => logSecurityEvent('audit_review')}
              >
                <Activity className="h-5 w-5" />
                <span className="text-xs">Audit Review</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col h-20 gap-2"
                onClick={() => logSecurityEvent('session_review')}
              >
                <Users className="h-5 w-5" />
                <span className="text-xs">Review Sessions</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col h-20 gap-2"
                onClick={() => logSecurityEvent('policy_update')}
              >
                <Lock className="h-5 w-5" />
                <span className="text-xs">Update Policies</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Events Filter */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Security Events
              </CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="login_success">Successful Logins</SelectItem>
                    <SelectItem value="failed_login">Failed Logins</SelectItem>
                    <SelectItem value="password_change">Password Changes</SelectItem>
                    <SelectItem value="admin_action">Admin Actions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : auditLogs && auditLogs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Type</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getEventIcon(log.action)}
                          <span className="capitalize">
                            {log.action.replace("_", " ")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.profiles?.full_name || log.profiles?.email || 'System'}
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">{log.resource_type}</span>
                        {log.resource_id && (
                          <div className="text-xs text-muted-foreground">
                            ID: {log.resource_id.slice(0, 8)}...
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(log.action)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
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
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No security events found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminSecurity;
