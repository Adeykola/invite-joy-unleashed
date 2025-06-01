
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { whatsappWebAPI, WhatsAppWebSession } from '@/lib/whatsapp-web-api';

export function useWhatsAppConnection() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [session, setSession] = useState<WhatsAppWebSession | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusCheckInterval, setStatusCheckInterval] = useState<number | null>(null);

  // Check for existing active session
  const checkExistingSession = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('whatsapp_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'connected')
        .order('last_connected_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        const sessionData: WhatsAppWebSession = {
          id: data.id,
          status: data.status as 'connected',
          displayName: data.display_name,
          phoneNumber: data.phone_number,
          lastConnected: data.last_connected_at
        };
        setSession(sessionData);
      }
    } catch (err) {
      console.log('No existing session found:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Check session status
  const checkSessionStatus = useCallback(async (sessionId: string) => {
    try {
      const sessionData = await whatsappWebAPI.checkSessionStatus(sessionId);
      
      if (sessionData.status === 'connected') {
        setSession(sessionData);
        setQrCode(null);
        setIsConnecting(false);
        
        // Clear status check interval
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval);
          setStatusCheckInterval(null);
        }
        
        toast({
          title: "WhatsApp Connected",
          description: "Your WhatsApp account is now connected and ready to use."
        });
      }
    } catch (err) {
      console.error('Error checking session status:', err);
    }
  }, [statusCheckInterval, toast]);

  // Initialize new connection
  const startConnection = useCallback(async () => {
    if (!user) return;

    try {
      setIsConnecting(true);
      setError(null);
      
      const { sessionId, qrCode: newQrCode } = await whatsappWebAPI.initializeSession();
      
      setQrCode(newQrCode);
      
      // Start polling for connection status
      const intervalId = window.setInterval(() => {
        checkSessionStatus(sessionId);
      }, 3000);
      
      setStatusCheckInterval(intervalId);
      
      toast({
        title: "QR Code Generated",
        description: "Scan the QR code with your WhatsApp to connect"
      });
      
    } catch (err: any) {
      setError(err.message);
      setIsConnecting(false);
      toast({
        title: "Connection Failed",
        description: err.message || "Failed to start WhatsApp connection",
        variant: "destructive"
      });
    }
  }, [user, checkSessionStatus, toast]);

  // Disconnect session
  const disconnect = useCallback(async () => {
    if (!session) return;

    try {
      setIsLoading(true);
      await whatsappWebAPI.disconnectSession(session.id);
      
      // Update database
      await supabase
        .from('whatsapp_sessions')
        .update({ status: 'disconnected' })
        .eq('id', session.id);
      
      setSession(null);
      setQrCode(null);
      
      toast({
        title: "WhatsApp Disconnected",
        description: "Your WhatsApp account has been disconnected."
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Disconnection Failed",
        description: err.message || "Failed to disconnect WhatsApp",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [session, toast]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [statusCheckInterval]);

  // Initialize on mount
  useEffect(() => {
    checkExistingSession();
  }, [checkExistingSession]);

  return {
    session,
    qrCode,
    isConnecting,
    isLoading,
    error,
    startConnection,
    disconnect,
    isConnected: session?.status === 'connected'
  };
}
