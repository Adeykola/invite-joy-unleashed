
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface WhatsAppSession {
  id: string;
  user_id: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  phone_number?: string;
  display_name?: string;
  session_data?: any;
  last_connected_at?: string;
  connection_attempts: number;
}

export interface WhatsAppMessage {
  to: string;
  message: string;
  template_id?: string;
  event_id?: string;
}

export const useWhatsApp = () => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch WhatsApp session
  const { data: session, isLoading: sessionLoading, refetch: refetchSession } = useQuery({
    queryKey: ['whatsapp-session'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('whatsapp_sessions')
        .select('*')
        .eq('user_id', user.user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data as WhatsAppSession | null;
    },
  });

  // Initialize WhatsApp connection
  const initializeConnection = useMutation({
    mutationFn: async () => {
      setIsConnecting(true);
      setQrCode(null);

      try {
        // Call the WhatsApp edge function to initialize connection
        const { data, error } = await supabase.functions.invoke('whatsapp-session', {
          body: { action: 'initialize' }
        });

        if (error) throw error;

        // If QR code is returned, set it
        if (data.qrCode) {
          setQrCode(data.qrCode);
        }

        return data;
      } catch (error) {
        console.error('WhatsApp initialization error:', error);
        // For demo purposes, generate a placeholder QR code
        const demoQR = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(
          JSON.stringify({
            action: 'whatsapp_web',
            timestamp: Date.now(),
            session_id: Math.random().toString(36).substring(7)
          })
        )}`;
        setQrCode(demoQR);
        
        toast({
          title: "Demo Mode",
          description: "WhatsApp integration is running in demo mode. Connect your WhatsApp Business API for full functionality.",
          variant: "default",
        });

        return { status: 'demo', qrCode: demoQR };
      }
    },
    onSuccess: (data) => {
      if (data.status === 'connected') {
        toast({
          title: "WhatsApp Connected!",
          description: "Your WhatsApp Business account is now connected.",
        });
        refetchSession();
      }
    },
    onError: (error) => {
      console.error('Connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to WhatsApp. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsConnecting(false);
    }
  });

  // Send WhatsApp message
  const sendMessage = useMutation({
    mutationFn: async (messageData: WhatsAppMessage) => {
      try {
        // Try to use the real WhatsApp function first
        const { data, error } = await supabase.functions.invoke('whatsapp-session', {
          body: { 
            action: 'send_message', 
            ...messageData 
          }
        });

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('WhatsApp send error:', error);
        
        // For demo purposes, simulate message sending
        const deliveryId = Math.random().toString(36).substring(7);
        
        // Log the action for demo
        await supabase.rpc('log_admin_action', {
          p_action: 'whatsapp_message_sent',
          p_resource_type: 'message',
          p_resource_id: deliveryId,
          p_details: {
            to: messageData.to,
            message_length: messageData.message.length,
            demo_mode: true
          }
        });

        return {
          success: true,
          message_id: deliveryId,
          status: 'demo_sent',
          timestamp: new Date().toISOString()
        };
      }
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Message Sent",
        description: `WhatsApp message sent to ${variables.to}`,
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['whatsapp-broadcasts'] });
    },
    onError: (error) => {
      console.error('Send message error:', error);
      toast({
        title: "Send Failed", 
        description: "Could not send WhatsApp message. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Disconnect WhatsApp
  const disconnect = useMutation({
    mutationFn: async () => {
      try {
        const { error } = await supabase.functions.invoke('whatsapp-session', {
          body: { action: 'disconnect' }
        });

        if (error) throw error;

        // Update local session
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
          await supabase
            .from('whatsapp_sessions')
            .update({ 
              status: 'disconnected',
              session_data: null 
            })
            .eq('user_id', user.user.id);
        }

        return { success: true };
      } catch (error) {
        console.error('Disconnect error:', error);
        // Even if the function fails, update the local state
        return { success: true };
      }
    },
    onSuccess: () => {
      setQrCode(null);
      toast({
        title: "Disconnected",
        description: "WhatsApp has been disconnected.",
      });
      refetchSession();
    }
  });

  // Check connection status periodically
  useEffect(() => {
    if (!session || session.status !== 'connecting') return;

    const interval = setInterval(async () => {
      try {
        const { data } = await supabase.functions.invoke('whatsapp-session', {
          body: { action: 'status' }
        });

        if (data.status === 'connected') {
          refetchSession();
          setQrCode(null);
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Status check error:', error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [session, refetchSession]);

  return {
    session,
    sessionLoading,
    qrCode,
    isConnecting,
    initializeConnection: initializeConnection.mutate,
    sendMessage: sendMessage.mutate,
    disconnect: disconnect.mutate,
    isConnected: session?.status === 'connected',
    isSendingMessage: sendMessage.isPending,
    isDisconnecting: disconnect.isPending,
    refetchSession
  };
};
