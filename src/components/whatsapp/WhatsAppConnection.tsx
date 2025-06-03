
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { QrCode, Smartphone, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const WhatsAppConnection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Fetch WhatsApp session status
  const { data: session, isLoading } = useQuery({
    queryKey: ['whatsapp-session', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('whatsapp_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Create new WhatsApp session
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('whatsapp-session', {
        body: {
          action: 'create_session',
          userId: user?.id,
          sessionData: { timestamp: Date.now() }
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-session'] });
      setIsConnecting(true);
      // Simulate QR code generation (in real implementation, this would come from WhatsApp Web API)
      setQrCode('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=whatsapp-connection-' + Date.now());
      
      toast({
        title: "Connection Started",
        description: "Scan the QR code with your WhatsApp mobile app",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update session status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, connectionData }: { status: string; connectionData?: any }) => {
      const { data, error } = await supabase.functions.invoke('whatsapp-session', {
        body: {
          action: 'update_status',
          sessionData: {
            sessionId: session?.id,
            status,
            connectionData
          }
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-session'] });
      setIsConnecting(false);
      setQrCode(null);
    }
  });

  const handleConnect = () => {
    createSessionMutation.mutate();
  };

  const handleDisconnect = async () => {
    if (session) {
      await updateStatusMutation.mutateAsync({ status: 'disconnected' });
      toast({
        title: "Disconnected",
        description: "WhatsApp session has been disconnected",
      });
    }
  };

  // Simulate connection success after QR scan (in real implementation, this would be triggered by WhatsApp Web API)
  useEffect(() => {
    if (isConnecting && qrCode) {
      const timer = setTimeout(() => {
        updateStatusMutation.mutate({
          status: 'connected',
          connectionData: {
            displayName: 'User WhatsApp',
            phoneNumber: '+1234567890'
          }
        });
        toast({
          title: "Connected Successfully",
          description: "WhatsApp is now connected and ready to send messages",
        });
      }, 10000); // Simulate 10 second connection time

      return () => clearTimeout(timer);
    }
  }, [isConnecting, qrCode]);

  const getStatusBadge = () => {
    if (!session) return <Badge variant="secondary">Not Connected</Badge>;
    
    switch (session.status) {
      case 'connected':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Connected</Badge>;
      case 'connecting':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Connecting</Badge>;
      case 'disconnected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Disconnected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading WhatsApp status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Smartphone className="w-5 h-5 mr-2 text-green-600" />
            WhatsApp Connection
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {session?.status === 'connected' ? (
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                Connected as: {session.display_name || 'WhatsApp User'}
              </div>
              {session.phone_number && (
                <div className="flex items-center text-sm text-gray-600">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Phone: {session.phone_number}
                </div>
              )}
              <Button 
                variant="outline" 
                onClick={handleDisconnect}
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Disconnect
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {qrCode && isConnecting ? (
                <div className="text-center space-y-3">
                  <div className="flex justify-center">
                    <img src={qrCode} alt="WhatsApp QR Code" className="border rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Scan QR Code with WhatsApp</p>
                    <p className="text-xs text-gray-600">
                      1. Open WhatsApp on your phone<br/>
                      2. Go to Settings &gt; Linked Devices<br/>
                      3. Tap "Link a Device" and scan this code
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <QrCode className="w-12 h-12 mx-auto text-gray-400" />
                  <div>
                    <p className="font-medium">Connect WhatsApp</p>
                    <p className="text-sm text-gray-600">
                      Connect your WhatsApp to send invitations and updates to guests
                    </p>
                  </div>
                  <Button 
                    onClick={handleConnect}
                    disabled={createSessionMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {createSessionMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <QrCode className="w-4 h-4 mr-2" />
                    )}
                    Connect WhatsApp
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
