
import React, { useState } from 'react';
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { WhatsAppConnect } from '@/components/whatsapp/WhatsAppConnect';
import { BroadcastWizard } from '@/components/whatsapp/BroadcastWizard';
import { BroadcastList } from '@/components/whatsapp/BroadcastList';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, MessageSquare, Settings } from "lucide-react";

const WhatsAppDashboard = () => {
  const [tab, setTab] = useState<string>("broadcasts");
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);

  const handleTabChange = (value: string) => {
    setTab(value);
    if (value !== "broadcasts") {
      setShowCreateForm(false);
    }
  };

  const handleNewBroadcast = () => {
    setShowCreateForm(true);
    setTab("broadcasts");
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
  };

  return (
    <DashboardLayout userType="host">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">WhatsApp Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your WhatsApp connections and send broadcast messages to your event guests.
            </p>
          </div>
          
          {!showCreateForm && (
            <Button onClick={handleNewBroadcast} size="lg">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Broadcast
            </Button>
          )}
        </div>

        {/* Main Content */}
        <ErrorBoundary>
          <Tabs value={tab} onValueChange={handleTabChange}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <TabsList className="grid w-full lg:w-auto grid-cols-2">
                <TabsTrigger value="broadcasts" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Broadcasts
                </TabsTrigger>
                <TabsTrigger value="account" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  WhatsApp Account
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Create Broadcast Form */}
            {showCreateForm && (
              <div className="mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Broadcast</CardTitle>
                    <CardDescription>
                      Set up a new WhatsApp broadcast to send messages to your event guests.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ErrorBoundary>
                      <BroadcastWizard />
                    </ErrorBoundary>
                    <div className="flex justify-end mt-6 pt-6 border-t">
                      <Button variant="outline" onClick={handleCancelCreate}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <TabsContent value="broadcasts" className="space-y-6">
              {!showCreateForm && (
                <ErrorBoundary>
                  <BroadcastList />
                </ErrorBoundary>
              )}
            </TabsContent>
            
            <TabsContent value="account" className="space-y-6">
              <ErrorBoundary>
                <WhatsAppConnect />
              </ErrorBoundary>
            </TabsContent>
          </Tabs>
        </ErrorBoundary>
      </div>
    </DashboardLayout>
  );
};

export default WhatsAppDashboard;
