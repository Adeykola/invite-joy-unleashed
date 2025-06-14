
import { useQuery } from "@tanstack/react-query";
import AdminDashboardLayout from "@/components/layouts/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Database, 
  Server, 
  Activity, 
  HardDrive,
  Cpu,
  MemoryStick,
  Wifi,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface SystemMetric {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  recorded_at: string;
}

const AdminSystem = () => {
  // Fetch real system metrics
  const { data: metrics, isLoading, refetch } = useQuery({
    queryKey: ['system-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_metrics')
        .select('*')
        .order('recorded_at', { ascending: false });

      if (error) throw error;

      // Group metrics by name and get latest values
      const latestMetrics = data.reduce((acc, metric) => {
        if (!acc[metric.metric_name]) {
          acc[metric.metric_name] = metric;
        }
        return acc;
      }, {} as Record<string, SystemMetric>);

      return latestMetrics;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch database connection info
  const { data: dbStats } = useQuery({
    queryKey: ['database-stats'],
    queryFn: async () => {
      try {
        // Test database connectivity
        const start = Date.now();
        const { data, error } = await supabase.from('events').select('count').limit(1);
        const responseTime = Date.now() - start;

        const { data: userCount } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true });

        const { data: eventCount } = await supabase
          .from('events')
          .select('id', { count: 'exact', head: true });

        return {
          status: error ? 'error' : 'healthy',
          responseTime,
          userCount: userCount || 0,
          eventCount: eventCount || 0,
          lastChecked: new Date().toISOString()
        };
      } catch (error) {
        return {
          status: 'error',
          responseTime: 0,
          userCount: 0,
          eventCount: 0,
          lastChecked: new Date().toISOString()
        };
      }
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>;
      case "warning":
        return <Badge variant="destructive" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getMetricValue = (metricName: string) => {
    return metrics?.[metricName]?.metric_value || 0;
  };

  const getMetricUnit = (metricName: string) => {
    return metrics?.[metricName]?.metric_unit || '';
  };

  // Determine system health based on metrics
  const systemHealth = {
    database: dbStats?.status || 'healthy',
    server: getMetricValue('cpu_usage') > 80 ? 'warning' : 'healthy',
    storage: getMetricValue('storage_used') > 80 ? 'warning' : 'healthy',
    memory: getMetricValue('memory_usage') > 85 ? 'warning' : 'healthy'
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
            <p className="text-muted-foreground">
              Monitor platform performance and system status
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* System Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Database</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {getStatusIcon(systemHealth.database)}
                {getStatusBadge(systemHealth.database)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Response: {dbStats?.responseTime || 0}ms
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Server CPU</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {getStatusIcon(systemHealth.server)}
                {getStatusBadge(systemHealth.server)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Usage: {getMetricValue('cpu_usage')}%
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {getStatusIcon(systemHealth.storage)}
                {getStatusBadge(systemHealth.storage)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Used: {getMetricValue('storage_used')} {getMetricUnit('storage_used')}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memory</CardTitle>
              <MemoryStick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {getStatusIcon(systemHealth.memory)}
                {getStatusBadge(systemHealth.memory)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Used: {getMetricValue('memory_usage')}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                CPU Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getMetricValue('cpu_usage')}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(getMetricValue('cpu_usage'), 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Current usage</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MemoryStick className="h-5 w-5" />
                Memory Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getMetricValue('memory_usage')}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(getMetricValue('memory_usage'), 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">System memory in use</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getMetricValue('response_time_avg')}ms</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min((getMetricValue('response_time_avg') / 1000) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Average response time</p>
            </CardContent>
          </Card>
        </div>

        {/* Platform Statistics */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Platform Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Users</span>
                  <span className="text-2xl font-bold">{getMetricValue('active_users')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Events</span>
                  <span className="text-2xl font-bold">{getMetricValue('total_events')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Database Connections</span>
                  <span className="text-2xl font-bold">{getMetricValue('database_connections')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform Version:</span>
                  <span>2.0.0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Environment:</span>
                  <span>Production</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Database Type:</span>
                  <span>PostgreSQL</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span>{metrics ? new Date(Object.values(metrics)[0]?.recorded_at).toLocaleString() : 'Never'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminSystem;
