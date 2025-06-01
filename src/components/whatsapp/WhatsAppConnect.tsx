
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, RefreshCw, Smartphone, Check, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWhatsAppConnection } from "@/hooks/useWhatsAppConnection";

// QR Code component using external API
const QRCode = ({ value, size = 200 }: { value: string; size?: number }) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;
  
  return (
    <img 
      src={qrUrl} 
      alt="QR Code" 
      className="rounded-lg border"
      style={{ width: size, height: size }}
    />
  );
};

export function WhatsAppConnect() {
  const { user } = useAuth();
  const {
    session,
    qrCode,
    isConnecting,
    isLoading,
    error,
    startConnection,
    disconnect,
    isConnected
  } = useWhatsAppConnection();

  if (!user) {
    return (
      <Alert>
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          You need to be logged in to connect your WhatsApp account.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          WhatsApp Web Connection
        </CardTitle>
        <CardDescription>
          Connect your WhatsApp account using WhatsApp Web to send messages to your event guests.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isConnected && session ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <Check className="h-5 w-5" />
              <span>WhatsApp Connected</span>
            </div>
            
            {session.displayName && (
              <div className="text-sm">
                <span className="font-medium">Account Name:</span> {session.displayName}
              </div>
            )}
            
            {session.phoneNumber && (
              <div className="text-sm">
                <span className="font-medium">Phone Number:</span> {session.phoneNumber}
              </div>
            )}
            
            {session.lastConnected && (
              <div className="text-sm">
                <span className="font-medium">Connected since:</span> {new Date(session.lastConnected).toLocaleString()}
              </div>
            )}
          </div>
        ) : qrCode ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <QRCode value={qrCode} size={200} />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-medium">Scan QR Code with WhatsApp</p>
              <p className="text-xs text-muted-foreground max-w-md">
                1. Open WhatsApp on your phone<br/>
                2. Go to Settings → Linked Devices<br/>
                3. Tap "Link a Device"<br/>
                4. Scan this QR code
              </p>
              {isConnecting && (
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Waiting for connection...</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Connect WhatsApp Web</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Use WhatsApp's multi-device feature to connect your account. 
                This allows sending messages without keeping your phone connected.
              </p>
            </div>
            
            <Button
              onClick={startConnection}
              disabled={isLoading || isConnecting}
              size="lg"
            >
              {isLoading || isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isConnecting ? 'Connecting...' : 'Loading...'}
                </>
              ) : (
                <>
                  <Smartphone className="mr-2 h-4 w-4" />
                  Connect WhatsApp
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
      
      {(isConnected || qrCode) && (
        <CardFooter className="flex justify-between">
          {isConnected ? (
            <Button 
              variant="destructive" 
              onClick={disconnect}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <X className="mr-2 h-4 w-4" />
              )}
              Disconnect
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={startConnection}
              disabled={isConnecting || isLoading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate New QR Code
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
