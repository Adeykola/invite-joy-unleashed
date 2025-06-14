
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Send, 
  Users, 
  TrendingUp, 
  Phone,
  CheckCircle,
  Clock,
  AlertCircle,
  Wifi,
  WifiOff,
  Monitor,
  Building,
  Upload,
  Calendar,
  BarChart3,
  RefreshCw,
  Smartphone
} from "lucide-react";
import { useEnhancedWhatsApp } from "@/hooks/useEnhancedWhatsApp";
import { MediaUploadComponent } from "./MediaUploadComponent";
import { ContactManager } from "./ContactManager";
import { EnhancedMessageComposer } from "./EnhancedMessageComposer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export const EnhancedWhatsAppDashboard = () => {
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const { toast } = useToast();
  
  const {
    session,
    sessionLoading,
    connectionType,
    isConnected,
    qrCode,
    isConnecting,
    initializeConnection,
    messageQueue,
    contacts,
    mediaUploads,
    refetchSession
  } = useEnhancedWhatsApp();

  const getConnectionStatus = () => {
    if (sessionLoading) return { icon: Clock, text: "Loading...", color: "text-gray-500" };
    if (isConnecting || session?.status === 'connecting') return { icon: Clock, text: "Connecting...", color: "text-blue-500" };
    if (isConnected) return { icon: Wifi, text: "Connected", color: "text-green-500" };
    if (session?.status === 'error') return { icon: AlertCircle, text: "Error", color: "text-red-500" };
    return { icon: WifiOff, text: "Disconnected", color: "text-red-500" };
  };

  const connectionStatus = getConnectionStatus();
  const StatusIcon = connectionStatus.icon;

  const handleConnectionChoice = (type: 'web' | 'business_api') => {
    console.log('User selected connection type:', type);
    initializeConnection(type);
  };

  const handleRefreshQR = () => {
    setIsCheckingStatus(true);
    refetchSession().finally(() => {
      setIsCheckingStatus(false);
    });
  };

  const handleDisconnect = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-enhanced', {
        body: { action: 'disconnect' }
      });
      
      if (error) throw error;
      
      toast({
        title: "Disconnected",
        description: "WhatsApp has been disconnected successfully.",
      });
      refetchSession();
    } catch (error) {
      console.error('Disconnect error:', error);
      toast({
        title: "Disconnect Failed",
        description: "Failed to disconnect WhatsApp. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate stats
  const stats = {
    totalMessages: messageQueue.filter(m => m.status === 'sent').length,
    pendingMessages: messageQueue.filter(m => m.status === 'pending').length,
    failedMessages: messageQueue.filter(m => m.status === 'failed').length,
    deliveryRate: messageQueue.length > 0 
      ? ((messageQueue.filter(m => m.status === 'sent').length / messageQueue.length) * 100).toFixed(1)
      : 0
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              WhatsApp Integration
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon className={`h-4 w-4 ${connectionStatus.color}`} />
              <span className={`text-sm ${connectionStatus.color}`}>
                {connectionStatus.text}
              </span>
              {isConnected && (
                <Badge variant="outline">
                  {session?.connection_type === 'web' ? 'WhatsApp Web' : 'Business API'}
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="space-y-4">
              {session?.status === 'connecting' ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <Clock className="h-5 w-5 animate-spin text-blue-600" />
                      <span className="text-blue-800 font-medium">
                        Connecting to WhatsApp Web
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      Initializing WhatsApp Web client and generating QR code...
                    </p>
                  </div>
                  
                  {qrCode ? (
                    <div className="flex justify-center">
                      <div className="p-4 bg-white border rounded-lg shadow-sm">
                        <img 
                          src={qrCode} 
                          alt="WhatsApp QR Code" 
                          className="w-64 h-64 border rounded"
                        />
                        <div className="mt-3 text-center">
                          <p className="text-sm text-muted-foreground mb-2">
                            1. Open WhatsApp on your phone<br />
                            2. Go to Settings → Linked Devices<br />
                            3. Tap "Link a Device" and scan this QR code
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefreshQR}
                            disabled={isCheckingStatus}
                          >
                            {isCheckingStatus ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Checking Status...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh Status
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                      <p className="text-muted-foreground">
                        Starting WhatsApp Web client...
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        This may take up to 30 seconds
                      </p>
                    </div>
                  )}
                </div>
              ) : session?.status === 'error' ? (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-red-50 text-center">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
                    <h3 className="font-medium text-red-800 mb-2">Connection Failed</h3>
                    <p className="text-sm text-red-600 mb-4">
                      {session.session_data?.error_message || 'Failed to connect to WhatsApp'}
                    </p>
                    <Button 
                      onClick={() => handleConnectionChoice('web')}
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Choose your WhatsApp integration method to start sending messages to your event guests.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="cursor-pointer hover:shadow-md transition-shadow" 
                          onClick={() => handleConnectionChoice('web')}>
                      <CardContent className="p-4 text-center">
                        <Monitor className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <h3 className="font-medium mb-2">WhatsApp Web</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Connect your personal WhatsApp account for immediate messaging with full features.
                        </p>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center justify-center">
                            <Smartphone className="h-3 w-3 mr-1" />
                            Real WhatsApp Web integration
                          </div>
                          <div>✓ Full media support</div>
                          <div>✓ Real-time messaging</div>
                          <div>✓ Complete WhatsApp features</div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleConnectionChoice('business_api')}>
                      <CardContent className="p-4 text-center">
                        <Building className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <h3 className="font-medium mb-2">Business API</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Professional WhatsApp Business API with advanced features and analytics.
                        </p>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center justify-center">
                            <Building className="h-3 w-3 mr-1" />
                            Requires API credentials
                          </div>
                          <div>✓ Template messages</div>
                          <div>✓ Advanced analytics</div>
                          <div>✓ Webhook support</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {isConnecting && !qrCode && session?.status !== 'connecting' && (
                <div className="mt-4 p-4 border rounded-lg bg-blue-50 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-blue-800">
                      Initializing WhatsApp Web client...
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">WhatsApp Connected</p>
                  <p className="text-sm text-green-600">
                    {session?.connection_type === 'web' ? 'WhatsApp Web' : 'Business API'} • 
                    {session?.phone_number || 'Ready to send messages'}
                    {session?.display_name && ` • ${session.display_name}`}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleDisconnect}
              >
                Disconnect
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMessages}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingMessages} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.deliveryRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.failedMessages} failed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contacts.length}</div>
            <p className="text-xs text-muted-foreground">Active contacts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Media Files</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mediaUploads.length}</div>
            <p className="text-xs text-muted-foreground">Uploaded files</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="composer" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="composer">
            <Send className="w-4 h-4 mr-2" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="contacts">
            <Users className="w-4 h-4 mr-2" />
            Contacts
          </TabsTrigger>
          <TabsTrigger value="media">
            <Upload className="w-4 h-4 mr-2" />
            Media
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="composer" className="space-y-4">
          <EnhancedMessageComposer />
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <ContactManager />
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <MediaUploadComponent />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Message Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Analytics dashboard coming soon...
                <br />
                Track delivery rates, engagement, and campaign performance.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {!isConnected && session?.status !== 'connecting' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-800">WhatsApp Web Integration</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Click "WhatsApp Web" above to generate a QR code and connect your WhatsApp account.
                  Once connected, you can send real messages to your event guests.
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  Select WhatsApp Web above to start the integration process.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedWhatsAppDashboard;
