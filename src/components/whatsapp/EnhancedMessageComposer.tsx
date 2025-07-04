
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Users, 
  Calendar,
  Paperclip,
  X,
  User,
  Clock
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useEnhancedWhatsApp } from '@/hooks/useEnhancedWhatsApp';
import { useRealCommunication } from '@/hooks/useRealCommunication';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const EnhancedMessageComposer = () => {
  const [messageType, setMessageType] = useState<'single' | 'bulk' | 'event'>('single');
  const [message, setMessage] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [selectedMedia, setSelectedMedia] = useState<string>('none');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [personalizationEnabled, setPersonalizationEnabled] = useState(false);

  const { user } = useAuth();
  const { 
    contacts, 
    mediaUploads, 
    sendMessage, 
    isConnected,
    isSendingMessage 
  } = useEnhancedWhatsApp();
  
  const { sendWhatsApp, isSendingWhatsApp } = useRealCommunication();

  // Fetch user's events for event-based messaging
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

  // Fetch event guests when an event is selected
  const { data: eventGuests } = useQuery({
    queryKey: ['event-guests', selectedEvent],
    queryFn: async () => {
      if (!selectedEvent) return [];
      
      const { data, error } = await supabase
        .from('event_guests')
        .select('*')
        .eq('event_id', selectedEvent)
        .is('phone_number', null);

      if (error) throw error;
      return data.filter(guest => guest.phone_number);
    },
    enabled: !!selectedEvent,
  });

  const handleSendMessage = async () => {
    if (!isConnected) {
      console.error('WhatsApp not connected');
      return;
    }

    if (!message.trim()) return;

    try {
      if (messageType === 'single' && recipientPhone) {
        await sendWhatsApp({
          recipients: [{ phone: recipientPhone, name: 'Guest' }],
          content: message,
          mediaId: selectedMedia !== 'none' ? selectedMedia : undefined
        });
      } else if (messageType === 'bulk' && selectedContacts.length > 0) {
        const recipients = selectedContacts.map(contactId => {
          const contact = contacts.find(c => c.id === contactId);
          return {
            phone: contact?.phone_number || '',
            name: contact?.name || 'Guest'
          };
        }).filter(r => r.phone);

        await sendWhatsApp({
          recipients,
          content: message,
          mediaId: selectedMedia !== 'none' ? selectedMedia : undefined
        });
      } else if (messageType === 'event' && selectedEvent && eventGuests?.length) {
        const recipients = eventGuests.map(guest => ({
          phone: guest.phone_number!,
          name: guest.name
        }));

        await sendWhatsApp({
          eventId: selectedEvent,
          recipients,
          content: message,
          mediaId: selectedMedia !== 'none' ? selectedMedia : undefined
        });
      }
      
      // Reset form
      setMessage('');
      setRecipientPhone('');
      setSelectedContacts([]);
      setSelectedEvent('');
      setSelectedMedia('none');
      setScheduledTime('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const getSelectedMediaInfo = () => {
    if (selectedMedia === 'none') return null;
    return mediaUploads.find(media => media.id === selectedMedia);
  };

  const getRecipientCount = () => {
    switch (messageType) {
      case 'single':
        return recipientPhone ? 1 : 0;
      case 'bulk':
        return selectedContacts.length;
      case 'event':
        return eventGuests?.length || 0;
      default:
        return 0;
    }
  };

  const canSend = message.trim() && getRecipientCount() > 0 && isConnected;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Send className="w-5 h-5 mr-2" />
          Message Composer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Message Type Selection */}
        <Tabs value={messageType} onValueChange={(value) => setMessageType(value as 'single' | 'bulk' | 'event')}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="single" className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              Single
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Bulk
            </TabsTrigger>
            <TabsTrigger value="event" className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Event
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4">
            <div>
              <Label>Select Contacts ({selectedContacts.length} selected)</Label>
              <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-2">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={`flex items-center space-x-3 p-2 rounded cursor-pointer ${
                      selectedContacts.includes(contact.id) 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => toggleContactSelection(contact.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={() => toggleContactSelection(contact.id)}
                    />
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-gray-500">{contact.phone_number}</p>
                    </div>
                  </div>
                ))}
                {contacts.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No contacts available. Add contacts first.
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="event" className="space-y-4">
            <div>
              <Label>Select Event</Label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an event..." />
                </SelectTrigger>
                <SelectContent>
                  {events?.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{event.title}</span>
                        <span className="text-sm text-muted-foreground">
                          ({new Date(event.date).toLocaleDateString()})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedEvent && eventGuests && (
                <p className="text-sm text-muted-foreground mt-2">
                  {eventGuests.length} guests with phone numbers will receive the message
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Media Attachment */}
        <div>
          <Label>Media Attachment (Optional)</Label>
          <Select value={selectedMedia} onValueChange={setSelectedMedia}>
            <SelectTrigger>
              <SelectValue placeholder="Select media file..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No media</SelectItem>
              {mediaUploads.map((media) => (
                <SelectItem key={media.id} value={media.id}>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{media.media_type}</Badge>
                    <span>{media.file_name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {getSelectedMediaInfo() && (
            <div className="mt-2 p-2 bg-gray-50 rounded flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Paperclip className="h-4 w-4" />
                <span className="text-sm">{getSelectedMediaInfo()?.file_name}</span>
                <Badge variant="secondary">{getSelectedMediaInfo()?.media_type}</Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMedia('none')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Message Content */}
        <div>
          <Label htmlFor="message">Message Content</Label>
          <Textarea
            id="message"
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
          <div className="text-sm text-gray-500 mt-1 flex justify-between">
            <span>{message.length} characters</span>
            <span>{getRecipientCount()} recipient{getRecipientCount() !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Advanced Options */}
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="personalization">Enable Personalization</Label>
            <Switch
              id="personalization"
              checked={personalizationEnabled}
              onCheckedChange={setPersonalizationEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="schedule">Schedule Message</Label>
            <Switch
              id="schedule"
              checked={isScheduled}
              onCheckedChange={setIsScheduled}
            />
          </div>

          {isScheduled && (
            <div>
              <Label htmlFor="datetime">Schedule Date & Time</Label>
              <Input
                id="datetime"
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Connection Status Alert */}
        {!isConnected && (
          <div className="p-3 border rounded-lg bg-yellow-50 text-yellow-800">
            <p className="text-sm">WhatsApp is not connected. Please connect first to send messages.</p>
          </div>
        )}

        {/* Send Button */}
        <Button 
          onClick={handleSendMessage}
          disabled={!canSend || isSendingMessage || isSendingWhatsApp}
          className="w-full"
        >
          {(isSendingMessage || isSendingWhatsApp) ? (
            'Sending...'
          ) : isScheduled ? (
            <>
              <Clock className="w-4 h-4 mr-2" />
              Schedule Message
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send to {getRecipientCount()} recipient{getRecipientCount() !== 1 ? 's' : ''}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
