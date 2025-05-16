
import React, { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, RefreshCw, Send, Check, Clock, Users } from "lucide-react";
import { format } from "date-fns";

interface Broadcast {
  id: string;
  name: string;
  status: string;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
  created_at: string;
  scheduled_for: string | null;
  template: {
    title: string;
  };
  event: {
    title: string;
  } | null;
}

export function BroadcastList() {
  const { user } = useAuth();
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadBroadcasts();
    }
  }, [user]);

  const loadBroadcasts = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('whatsapp_broadcasts')
        .select(`
          *,
          template:template_id (title),
          event:event_id (title)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBroadcasts(data || []);
    } catch (err: any) {
      console.error("Error loading broadcasts:", err);
      setError(err.message || "Failed to load broadcasts");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'scheduled':
        return <Badge variant="secondary">Scheduled</Badge>;
      case 'pending':
        return <Badge>Pending</Badge>;
      case 'processing':
        return <Badge className="bg-amber-500">Processing</Badge>;
      case 'completed':
        return <Badge className="bg-green-600">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (broadcasts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <Send className="h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium">No Broadcasts Yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first WhatsApp broadcast to engage with your audience
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Recent Broadcasts</h2>
        <Button variant="outline" size="sm" onClick={loadBroadcasts}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <div className="grid gap-4">
        {broadcasts.map((broadcast) => (
          <Card key={broadcast.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {broadcast.name}
                    {getStatusBadge(broadcast.status)}
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {broadcast.template?.title || "Untitled Template"}
                    {broadcast.event && ` • ${broadcast.event.title}`}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                <div>
                  <div className="flex items-center text-muted-foreground">
                    <Users className="h-3 w-3 mr-1" />
                    Total
                  </div>
                  <div className="font-medium">{broadcast.total_recipients}</div>
                </div>
                <div>
                  <div className="flex items-center text-muted-foreground">
                    <Send className="h-3 w-3 mr-1" />
                    Sent
                  </div>
                  <div className="font-medium">{broadcast.sent_count}</div>
                </div>
                <div>
                  <div className="flex items-center text-muted-foreground">
                    <Check className="h-3 w-3 mr-1" />
                    Delivered
                  </div>
                  <div className="font-medium">{broadcast.delivered_count}</div>
                </div>
                <div>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    Created
                  </div>
                  <div className="font-medium">
                    {format(new Date(broadcast.created_at), 'PP')}
                  </div>
                </div>
              </div>
              
              {broadcast.status === 'scheduled' && broadcast.scheduled_for && (
                <div className="text-sm mt-2">
                  <span className="font-medium">Scheduled for:</span> {format(new Date(broadcast.scheduled_for), 'PPp')}
                </div>
              )}
              
              {(broadcast.status === 'processing' || broadcast.status === 'completed') && (
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${(broadcast.sent_count / broadcast.total_recipients) * 100}%` }}
                  ></div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
