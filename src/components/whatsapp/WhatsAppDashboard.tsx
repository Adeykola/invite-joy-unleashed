
import React from 'react';
import { WhatsAppConnection } from './WhatsAppConnection';
import { MessageTemplates } from './MessageTemplates';
import { BroadcastManager } from './BroadcastManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Smartphone, MessageSquare, Send } from 'lucide-react';

export const WhatsAppDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center">
          <Smartphone className="w-6 h-6 mr-2 text-green-600" />
          WhatsApp Messaging
        </h2>
        <p className="text-gray-600 mt-1">
          Connect your WhatsApp to send invitations and updates to your guests
        </p>
      </div>

      <Tabs defaultValue="connection" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="connection" className="flex items-center">
            <Smartphone className="w-4 h-4 mr-2" />
            Connection
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center">
            <MessageSquare className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="broadcasts" className="flex items-center">
            <Send className="w-4 h-4 mr-2" />
            Broadcasts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connection">
          <WhatsAppConnection />
        </TabsContent>

        <TabsContent value="templates">
          <MessageTemplates />
        </TabsContent>

        <TabsContent value="broadcasts">
          <BroadcastManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
