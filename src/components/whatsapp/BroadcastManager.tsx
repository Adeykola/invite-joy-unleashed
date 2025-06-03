
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Send, Users, Clock, CheckCircle, XCircle, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const BroadcastManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('');
  const [broadcastName, setBroadcastName] = useState('');

  // Fetch events for broadcast selection
  const { data: events } = useQuery({
    queryKey: ['events-for-broadcast', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('events')
        .select('id, title, date')
        .eq('host_id', user.id)
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch templates
  const { data: templates } = useQuery({
    queryKey: ['message-templates', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch broadcasts
  const { data: broadcasts, isLoading } = useQuery({
    queryKey: ['whatsapp-broadcasts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('whatsapp_broadcasts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Create broadcast mutation
  const createBroadcastMutation = useMutation({
    mutationFn: async (broadcastData: any) => {
      const { data, error } = await supabase
        .from('whatsapp_broadcasts')
        .insert({
          user_id: user?.id,
          name: broadcastData.name,
          event_id: broadcastData.eventId || null,
          template_id: broadcastData.templateId || null,
          status: 'draft',
          total_recipients: 0
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-broadcasts'] });
      setBroadcastName('');
      setSelectedEvent('');
      setSelectedTemplate('');
      setCustomMessage('');
      toast({
        title: "Broadcast Created",
        description: "Your WhatsApp broadcast has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleCreateBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!broadcastName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a broadcast name",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTemplate && !customMessage.trim()) {
      toast({
        title: "Error",
        description: "Please select a template or enter a custom message",
        variant: "destructive",
      });
      return;
    }

    createBroadcastMutation.mutate({
      name: broadcastName,
      eventId: selectedEvent,
      templateId: selectedTemplate,
      customMessage: customMessage
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Sent</Badge>;
      case 'sending':
        return <Badge className="bg-blue-500"><Clock className="w-3 h-3 mr-1" />Sending</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'scheduled':
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Scheduled</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Broadcast Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Send className="w-5 h-5 mr-2" />
            Create WhatsApp Broadcast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateBroadcast} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="broadcast-name">Broadcast Name</Label>
                <Input
                  id="broadcast-name"
                  value={broadcastName}
                  onChange={(e) => setBroadcastName(e.target.value)}
                  placeholder="e.g., Birthday Party Invitations"
                  required
                />
              </div>
              <div>
                <Label htmlFor="event-select">Select Event (Optional)</Label>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events?.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="template-select">Message Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates?.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="custom-message">Custom Message (Optional)</Label>
              <Textarea
                id="custom-message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Or write a custom message..."
                rows={3}
              />
            </div>

            <Button type="submit" disabled={createBroadcastMutation.isPending}>
              {createBroadcastMutation.isPending ? 'Creating...' : 'Create Broadcast'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Broadcast History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Broadcast History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading broadcasts...</p>
          ) : broadcasts && broadcasts.length > 0 ? (
            <div className="space-y-3">
              {broadcasts.map((broadcast) => (
                <div key={broadcast.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{broadcast.name}</h4>
                    {getStatusBadge(broadcast.status)}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {broadcast.total_recipients || 0} recipients
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {broadcast.sent_count || 0} sent
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                      {broadcast.delivered_count || 0} delivered
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1 text-blue-500" />
                      {broadcast.read_count || 0} read
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Created: {new Date(broadcast.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No broadcasts yet. Create your first broadcast above.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
