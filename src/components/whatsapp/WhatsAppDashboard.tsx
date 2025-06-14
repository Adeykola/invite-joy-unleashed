
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  WifiOff
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useWhatsApp } from "@/hooks/useWhatsApp";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const WhatsAppDashboard = () => {
  const [isQuickSendOpen, setIsQuickSendOpen] = useState(false);
  const [quickMessage, setQuickMessage] = useState({ phone: "", message: "" });
  const { toast } = useToast();
  
  const {
    session,
    sessionLoading,
    qrCode,
    isConnecting,
    initializeConnection,
    sendMessage,
    disconnect,
    isConnected,
    isSendingMessage,
    isDisconnecting
  } = useWhatsApp();

  // Fetch WhatsApp stats
  const { data: stats } = useQuery({
    queryKey: ['whatsapp-stats'],
    queryFn: async () => {
      const { data: broadcasts } = await supabase
        .from('whatsapp_broadcasts')
        .select('*');

      const { data: templates } = await supabase
        .from('message_templates')
        .select('*');

      const totalSent = broadcasts?.reduce((sum, b) => sum + (b.sent_count || 0), 0) || 0;
      const totalDelivered = broadcasts?.reduce((sum, b) => sum + (b.delivered_count || 0), 0) || 0;
      const deliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : 0;

      return {
        totalMessages: totalSent,
        deliveryRate,
        activeBroadcasts: broadcasts?.filter(b => b.status === 'active').length || 0,
        messageTemplates: templates?.length || 0
      };
    }
  });

  const handleQuickSend = () => {
    if (!quickMessage.phone || !quickMessage.message) {
      toast({
        title: "Missing Information",
        description: "Please enter both phone number and message.",
        variant: "destructive",
      });
      return;
    }

    sendMessage({
      to: quickMessage.phone,
      message: quickMessage.message
    });

    setQuickMessage({ phone: "", message: "" });
    setIsQuickSendOpen(false);
  };

  const getConnectionStatus = () => {
    if (sessionLoading) return { icon: Clock, text: "Loading...", color: "text-gray-500" };
    if (isConnecting) return { icon: Clock, text: "Connecting...", color: "text-blue-500" };
    if (isConnected) return { icon: Wifi, text: "Connected", color: "text-green-500" };
    return { icon: WifiOff, text: "Disconnected", color: "text-red-500" };
  };

  const connectionStatus = getConnectionStatus();
  const StatusIcon = connectionStatus.icon;

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              WhatsApp Business Connection
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon className={`h-4 w-4 ${connectionStatus.color}`} />
              <span className={`text-sm ${connectionStatus.color}`}>
                {connectionStatus.text}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Connect your WhatsApp Business account to start sending messages to your event guests.
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={initializeConnection}
                  disabled={isConnecting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isConnecting ? "Connecting..." : "Connect WhatsApp"}
                </Button>
              </div>
              
              {qrCode && (
                <div className="mt-4 p-4 border rounded-lg bg-white text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    Scan this QR code with your WhatsApp Business app:
                  </p>
                  <img 
                    src={qrCode} 
                    alt="WhatsApp QR Code" 
                    className="mx-auto w-64 h-64 border"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Open WhatsApp Business → Settings → Business Tools → WhatsApp Web → Scan QR Code
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">WhatsApp Connected</p>
                    <p className="text-sm text-green-600">
                      {session?.phone_number || 'Business Account'} • {session?.display_name || 'Unknown'}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={disconnect}
                  disabled={isDisconnecting}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  {isDisconnecting ? "Disconnecting..." : "Disconnect"}
                </Button>
              </div>

              <Dialog open={isQuickSendOpen} onOpenChange={setIsQuickSendOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Send Quick Message
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send Quick Message</DialogTitle>
                    <DialogDescription>
                      Send an instant WhatsApp message to a phone number.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Phone Number</label>
                      <Input
                        placeholder="+1234567890"
                        value={quickMessage.phone}
                        onChange={(e) => setQuickMessage({...quickMessage, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Message</label>
                      <Textarea
                        placeholder="Enter your message here..."
                        value={quickMessage.message}
                        onChange={(e) => setQuickMessage({...quickMessage, message: e.target.value})}
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsQuickSendOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleQuickSend}
                      disabled={isSendingMessage}
                    >
                      {isSendingMessage ? "Sending..." : "Send Message"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
            <div className="text-2xl font-bold">{stats?.totalMessages || 0}</div>
            <p className="text-xs text-muted-foreground">Total sent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.deliveryRate || 0}%</div>
            <p className="text-xs text-muted-foreground">Message delivery</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Broadcasts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeBroadcasts || 0}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Message Templates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.messageTemplates || 0}</div>
            <p className="text-xs text-muted-foreground">Ready to use</p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Broadcast Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Send targeted messages to event guests based on their RSVP status.
            </p>
            <div className="space-y-2">
              <Badge variant="secondary">Event Reminders</Badge>
              <Badge variant="secondary">RSVP Confirmations</Badge>
              <Badge variant="secondary">Check-in Instructions</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Message Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Pre-built message templates for common event communications.
            </p>
            <div className="space-y-2">
              <Badge variant="outline">Welcome Messages</Badge>
              <Badge variant="outline">Event Updates</Badge>
              <Badge variant="outline">Thank You Notes</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {!isConnected && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-orange-800">WhatsApp Business API Required</h3>
                <p className="text-sm text-orange-700 mt-1">
                  To send WhatsApp messages, you need a WhatsApp Business API account. 
                  Contact WhatsApp Business or an authorized provider to set up your account.
                </p>
                <p className="text-xs text-orange-600 mt-2">
                  Current functionality is running in demo mode for testing purposes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WhatsAppDashboard;
