
import React, { useState } from 'react';
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { WhatsAppConnect } from '@/components/whatsapp/WhatsAppConnect';
import { BroadcastWizard } from '@/components/whatsapp/BroadcastWizard';
import { BroadcastList } from '@/components/whatsapp/BroadcastList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const WhatsAppDashboard = () => {
  const [tab, setTab] = useState<string>("broadcasts");
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);

  return (
    <DashboardLayout userType="host">
      <h1 className="text-3xl font-bold mb-6">WhatsApp Dashboard</h1>
      
      <Tabs value={tab} onValueChange={(value) => {
        setTab(value);
        if (value !== "new") {
          setShowCreateForm(false);
        }
      }}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="broadcasts">Broadcasts</TabsTrigger>
            <TabsTrigger value="account">WhatsApp Account</TabsTrigger>
          </TabsList>
          
          {!showCreateForm && (
            <Button onClick={() => setShowCreateForm(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              New Broadcast
            </Button>
          )}
        </div>
        
        {showCreateForm && (
          <div className="mb-6">
            <BroadcastWizard />
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        <TabsContent value="broadcasts" className="space-y-6">
          {!showCreateForm && <BroadcastList />}
        </TabsContent>
        
        <TabsContent value="account" className="space-y-6">
          <WhatsAppConnect />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default WhatsAppDashboard;
