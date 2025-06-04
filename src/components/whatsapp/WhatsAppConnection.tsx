
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WhatsAppQRCode } from './WhatsAppQRCode';
import { WhatsAppMessageSender } from './WhatsAppMessageSender';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Smartphone, Send } from 'lucide-react';

export const WhatsAppConnection = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  // Check connection status
  const { data: sessionStatus, refetch } = useQuery({
    queryKey: ['whatsapp-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('whatsapp_sessions')
        .select('status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const handleConnected = () => {
    setIsConnected(true);
    refetch();
  };

  const connectionStatus = sessionStatus?.status === 'connected' || isConnected;

  if (!connectionStatus) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Smartphone className="w-6 h-6 mr-2 text-green-600" />
              WhatsApp Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Connect your WhatsApp to send invitations and updates to your event guests.
            </p>
            <WhatsAppQRCode onConnected={handleConnected} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-green-600">
            <Smartphone className="w-6 h-6 mr-2" />
            WhatsApp Connected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Your WhatsApp is connected and ready to send messages to your guests.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="send" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="send" className="flex items-center">
            <Send className="w-4 h-4 mr-2" />
            Send Messages
          </TabsTrigger>
          <TabsTrigger value="connection" className="flex items-center">
            <Smartphone className="w-4 h-4 mr-2" />
            Connection Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="send">
          <WhatsAppMessageSender />
        </TabsContent>

        <TabsContent value="connection">
          <WhatsAppQRCode onConnected={handleConnected} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
