
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Send, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

export const WhatsAppMessageSender = () => {
  const [message, setMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user's events
  const { data: events } = useQuery({
    queryKey: ['user-events', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('host_id', user.id)
        .order('date', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch message templates
  const { data: templates } = useQuery({
    queryKey: ['message-templates', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const sendMessage = async () => {
    if (!message.trim() || !phoneNumber.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both a message and phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-session', {
        body: {
          action: 'send_message',
          user_id: user?.id,
          phone_number: phoneNumber,
          message: message,
          event_id: selectedEvent || null
        }
      });

      if (error) throw error;

      toast({
        title: "Message Sent",
        description: "Your WhatsApp message has been sent successfully!",
      });

      setMessage('');
      setPhoneNumber('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Send Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const sendToEventGuests = async () => {
    if (!message.trim() || !selectedEvent) {
      toast({
        title: "Missing Information",
        description: "Please select an event and enter a message.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-session', {
        body: {
          action: 'broadcast_to_event',
          user_id: user?.id,
          message: message,
          event_id: selectedEvent
        }
      });

      if (error) throw error;

      toast({
        title: "Broadcast Sent",
        description: `Message sent to all guests of the selected event!`,
      });

      setMessage('');
    } catch (error: any) {
      console.error('Error broadcasting message:', error);
      toast({
        title: "Broadcast Error",
        description: error.message || "Failed to send broadcast. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Single Message Sender */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Send className="w-5 h-5 mr-2" />
            Send Individual Message
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="template">Message Template (Optional)</Label>
            <Select onValueChange={(value) => {
              const template = templates?.find(t => t.id === value);
              if (template) setMessage(template.content);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template..." />
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
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>

          <Button onClick={sendMessage} disabled={isSending} className="w-full">
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Event Broadcast */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Broadcast to Event Guests
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="event">Select Event</Label>
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an event..." />
              </SelectTrigger>
              <SelectContent>
                {events?.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title} - {new Date(event.date).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="broadcast-message">Message</Label>
            <Textarea
              id="broadcast-message"
              placeholder="Type your broadcast message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>

          <Button onClick={sendToEventGuests} disabled={isSending} className="w-full">
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Broadcasting...
              </>
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" />
                Send to All Guests
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
