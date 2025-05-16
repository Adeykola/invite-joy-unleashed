import React, { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, Smartphone, Check, X } from "lucide-react";
import QRCode from "@/components/QRCode";

interface WhatsAppSession {
  id: string;
  status: string;
  last_connected_at: string | null;
  display_name: string | null;
  phone_number: string | null;
}

export function WhatsAppConnect() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [session, setSession] = useState<WhatsAppSession | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusCheckInterval, setStatusCheckInterval] = useState<number | null>(null);

  // Function to fetch current active session if exists
  const fetchActiveSession = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("whatsapp_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "connected")
        .order("last_connected_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.log("No active session found:", error.message);
        return;
      }

      if (data) {
        setSession(data);
        setSessionId(data.id);
      }
    } catch (err) {
      console.error("Error fetching active session:", err);
    }
  };

  // Function to check session status
  const checkSessionStatus = async () => {
    if (!user || !sessionId) return;

    try {
      const { data: statusData } = await supabase
        .functions.invoke("whatsapp-status", {
          body: { sessionId }
        });

      if (statusData?.status === "connected") {
        // Session is connected, update UI
        setQrCode(null);
        setSession({
          id: sessionId,
          status: statusData.status,
          last_connected_at: statusData.lastConnected,
          display_name: statusData.displayName,
          phone_number: statusData.phoneNumber
        });

        // Clear the interval if we're connected
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
      console.error("Error checking session status:", err);
    }
  };

  // Initialize component - check for active session
  useEffect(() => {
    fetchActiveSession();
  }, [user]);

  // Start new WhatsApp session
  const startNewSession = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .functions.invoke("whatsapp-connect", {
          method: "POST"
        });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.qrCode && data?.sessionId) {
        setQrCode(data.qrCode);
        setSessionId(data.sessionId);
        
        // Start polling for status updates
        const intervalId = window.setInterval(checkSessionStatus, 5000);
        setStatusCheckInterval(intervalId);
        
        toast({
          title: "QR Code Generated",
          description: "Please scan this QR code with your WhatsApp"
        });
      }
    } catch (err: any) {
      console.error("Error starting WhatsApp session:", err);
      setError(err.message || "Failed to generate QR code");
      toast({
        title: "Connection Failed",
        description: "Failed to connect to WhatsApp. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect session
  const disconnectSession = async () => {
    if (!user || !sessionId) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("whatsapp_sessions")
        .update({ status: "disconnected" })
        .eq("id", sessionId);

      if (error) throw error;

      setSession(null);
      setSessionId(null);
      toast({
        title: "WhatsApp Disconnected",
        description: "Your WhatsApp account has been disconnected."
      });
    } catch (err) {
      console.error("Error disconnecting session:", err);
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect WhatsApp. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Clean up interval on component unmount
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [statusCheckInterval]);

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
          WhatsApp Connection
        </CardTitle>
        <CardDescription>
          Connect your WhatsApp account to send messages to your event guests.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {session?.status === "connected" ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <Check className="h-5 w-5" />
              <span>WhatsApp Connected</span>
            </div>
            
            {session.display_name && (
              <div className="text-sm">
                <span className="font-medium">Account Name:</span> {session.display_name}
              </div>
            )}
            
            {session.phone_number && (
              <div className="text-sm">
                <span className="font-medium">Phone Number:</span> {session.phone_number}
              </div>
            )}
            
            {session.last_connected_at && (
              <div className="text-sm">
                <span className="font-medium">Connected since:</span> {new Date(session.last_connected_at).toLocaleString()}
              </div>
            )}
          </div>
        ) : qrCode ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <QRCode value={qrCode} size={200} />
            </div>
            <p className="text-center text-sm max-w-md">
              Open WhatsApp on your phone, go to Settings &gt; Linked Devices &gt; 
              Link a Device, then scan this QR code.
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="mb-4">
              Connect your WhatsApp account to send messages to your event guests.
              This uses WhatsApp's multi-device feature and does not store your credentials.
            </p>
            <Button
              onClick={startNewSession}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating QR Code...
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
      {(session?.status === "connected" || qrCode) && (
        <CardFooter className="flex justify-between">
          {session?.status === "connected" ? (
            <Button 
              variant="destructive" 
              onClick={disconnectSession}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <X className="mr-2 h-4 w-4" />
              )}
              Disconnect WhatsApp
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={startNewSession}
              disabled={isLoading}
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
