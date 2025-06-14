
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

export const EnhancedMessageComposer = () => {
  const [messageType, setMessageType] = useState<'single' | 'bulk'>('single');
  const [message, setMessage] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<string>('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [personalizationEnabled, setPersonalizationEnabled] = useState(false);

  const { 
    contacts, 
    mediaUploads, 
    sendMessage, 
    isSendingMessage 
  } = useEnhancedWhatsApp();

  const handleSendMessage = () => {
    const recipients = messageType === 'single' 
      ? [recipientPhone] 
      : selectedContacts.map(contactId => {
          const contact = contacts.find(c => c.id === contactId);
          return contact?.phone_number || '';
        }).filter(Boolean);

    if (recipients.length === 0 || !message.trim()) return;

    const messageData = {
      to: recipients,
      message,
      media_id: selectedMedia || undefined,
      scheduled_for: isScheduled ? scheduledTime : undefined,
      personalization_data: personalizationEnabled ? {
        enable_personalization: true
      } : undefined
    };

    sendMessage(messageData);
    
    // Reset form
    setMessage('');
    setRecipientPhone('');
    setSelectedContacts([]);
    setSelectedMedia('');
    setScheduledTime('');
  };

  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const getSelectedMediaInfo = () => {
    if (!selectedMedia) return null;
    return mediaUploads.find(media => media.id === selectedMedia);
  };

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
        <Tabs value={messageType} onValueChange={(value) => setMessageType(value as 'single' | 'bulk')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single" className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              Single Message
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Bulk Message
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
              </div>
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
              <SelectItem value="">No media</SelectItem>
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
                onClick={() => setSelectedMedia('')}
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
          <div className="text-sm text-gray-500 mt-1">
            {message.length} characters
            {personalizationEnabled && (
              <span className="ml-2 text-blue-600">
                • Personalization enabled (use {{name}}, {{event}} variables)
              </span>
            )}
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

        {/* Send Button */}
        <Button 
          onClick={handleSendMessage}
          disabled={
            isSendingMessage || 
            !message.trim() || 
            (messageType === 'single' && !recipientPhone.trim()) ||
            (messageType === 'bulk' && selectedContacts.length === 0)
          }
          className="w-full"
        >
          {isSendingMessage ? (
            'Sending...'
          ) : isScheduled ? (
            <>
              <Clock className="w-4 h-4 mr-2" />
              Schedule Message
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send {messageType === 'bulk' ? `to ${selectedContacts.length} contacts` : 'Message'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
