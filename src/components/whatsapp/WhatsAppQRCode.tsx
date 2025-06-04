
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WhatsAppQRCodeProps {
  onConnected?: () => void;
}

export const WhatsAppQRCode = ({ onConnected }: WhatsAppQRCodeProps) => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const generateQRCode = async () => {
    if (!user) return;

    setIsLoading(true);
    setStatus('connecting');
    
    try {
      // Call the edge function to start WhatsApp session
      const { data, error } = await supabase.functions.invoke('whatsapp-session', {
        body: { action: 'start', user_id: user.id }
      });

      if (error) throw error;

      if (data.qr) {
        setQrCode(data.qr);
        // Start polling for connection status
        pollConnectionStatus();
      } else if (data.status === 'connected') {
        setStatus('connected');
        onConnected?.();
        toast({
          title: "WhatsApp Connected",
          description: "Your WhatsApp is already connected and ready to use!",
        });
      }
    } catch (error: any) {
      console.error('Error generating QR code:', error);
      setStatus('error');
      toast({
        title: "Connection Error",
        description: error.message || "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pollConnectionStatus = () => {
    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('whatsapp-session', {
          body: { action: 'status', user_id: user?.id }
        });

        if (error) throw error;

        if (data.status === 'connected') {
          setStatus('connected');
          setQrCode(null);
          clearInterval(interval);
          onConnected?.();
          toast({
            title: "WhatsApp Connected",
            description: "Successfully connected to WhatsApp!",
          });
        } else if (data.status === 'disconnected' && data.qr) {
          setQrCode(data.qr);
        }
      } catch (error) {
        console.error('Error polling status:', error);
        clearInterval(interval);
      }
    }, 3000); // Poll every 3 seconds

    // Clear interval after 5 minutes
    setTimeout(() => clearInterval(interval), 300000);
  };

  const disconnect = async () => {
    if (!user) return;

    try {
      await supabase.functions.invoke('whatsapp-session', {
        body: { action: 'disconnect', user_id: user.id }
      });

      setStatus('disconnected');
      setQrCode(null);
      toast({
        title: "WhatsApp Disconnected",
        description: "Successfully disconnected from WhatsApp.",
      });
    } catch (error: any) {
      console.error('Error disconnecting:', error);
      toast({
        title: "Disconnect Error",
        description: error.message || "Failed to disconnect. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          WhatsApp Connection
          {status === 'connected' && (
            <CheckCircle className="w-5 h-5 ml-2 text-green-600" />
          )}
          {status === 'error' && (
            <AlertCircle className="w-5 h-5 ml-2 text-red-600" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === 'disconnected' && (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Connect your WhatsApp to send messages to your event guests.
            </p>
            <Button onClick={generateQRCode} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating QR Code...
                </>
              ) : (
                'Connect WhatsApp'
              )}
            </Button>
          </div>
        )}

        {status === 'connecting' && qrCode && (
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Scan this QR code with your WhatsApp to connect:
            </p>
            <div className="flex justify-center">
              <img
                src={`data:image/png;base64,${qrCode}`}
                alt="WhatsApp QR Code"
                className="w-64 h-64 border rounded-lg"
              />
            </div>
            <p className="text-sm text-gray-500">
              Open WhatsApp → Settings → Linked Devices → Link a Device
            </p>
            <Button variant="outline" onClick={generateQRCode}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh QR Code
            </Button>
          </div>
        )}

        {status === 'connected' && (
          <div className="text-center space-y-4">
            <div className="text-green-600">
              <CheckCircle className="w-12 h-12 mx-auto mb-2" />
              <p className="font-medium">WhatsApp Connected!</p>
              <p className="text-sm text-gray-600">
                You can now send messages to your event guests.
              </p>
            </div>
            <Button variant="outline" onClick={disconnect}>
              Disconnect WhatsApp
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center space-y-4">
            <div className="text-red-600">
              <AlertCircle className="w-12 h-12 mx-auto mb-2" />
              <p className="font-medium">Connection Failed</p>
              <p className="text-sm text-gray-600">
                There was an error connecting to WhatsApp.
              </p>
            </div>
            <Button onClick={generateQRCode}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
