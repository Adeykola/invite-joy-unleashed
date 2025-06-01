
import React, { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useWhatsAppConnection } from "@/hooks/useWhatsAppConnection";
import { whatsappWebAPI } from "@/lib/whatsapp-web-api";
import { Loader2, Send, Upload, Users, AlertCircle } from "lucide-react";

// Simple CSV parser
const parseCSV = (csvText: string) => {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  
  const results = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;
    
    const data = lines[i].split(',');
    const obj: any = {};
    
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[j]?.trim();
    }
    
    results.push(obj);
  }
  
  return results;
};

interface Recipient {
  name: string;
  phone: string;
  [key: string]: any;
}

interface Template {
  id: string;
  title: string;
  content: string;
}

export function BroadcastWizard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { session, isConnected } = useWhatsAppConnection();
  
  const [broadcastName, setBroadcastName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [previewRecipient, setPreviewRecipient] = useState<Recipient | null>(null);
  const [messagePreview, setMessagePreview] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  // Load templates on component mount
  useEffect(() => {
    loadTemplates();
  }, [user]);

  // Update preview when template or recipient changes
  useEffect(() => {
    updatePreview();
  }, [selectedTemplate, previewRecipient]);

  const loadTemplates = async () => {
    if (!user) return;

    try {
      setIsLoadingTemplates(true);
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTemplates(data || []);
      if (data && data.length > 0) {
        setSelectedTemplate(data[0]);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error",
        description: "Failed to load message templates",
        variant: "destructive"
      });
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const updatePreview = () => {
    if (!selectedTemplate || !previewRecipient) {
      setMessagePreview('');
      return;
    }

    const preview = whatsappWebAPI.processTemplate(selectedTemplate.content, previewRecipient);
    setMessagePreview(preview);
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
      return;
    }

    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      const parsedData = parseCSV(csvText);

      if (parsedData && parsedData.length > 0) {
        const validData = parsedData.filter((row: any) => row.phone) as Recipient[];
        setRecipients(validData);

        if (validData.length > 0) {
          setPreviewRecipient(validData[0]);
        }

        toast({
          title: "CSV Uploaded",
          description: `Loaded ${validData.length} recipients from CSV`
        });
      }
    };

    reader.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to parse CSV file",
        variant: "destructive"
      });
    };

    reader.readAsText(file);
  };

  const sendBroadcast = async () => {
    if (!isConnected || !session || !selectedTemplate || recipients.length === 0) {
      toast({
        title: "Cannot Send Broadcast",
        description: "Please ensure WhatsApp is connected, a template is selected, and recipients are loaded",
        variant: "destructive"
      });
      return;
    }

    if (!broadcastName.trim()) {
      toast({
        title: "Missing Broadcast Name",
        description: "Please enter a name for this broadcast",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSending(true);

      // Create broadcast record
      const { data: broadcastData, error: broadcastError } = await supabase
        .from('whatsapp_broadcasts')
        .insert({
          user_id: user?.id,
          name: broadcastName,
          template_id: selectedTemplate.id,
          total_recipients: recipients.length,
          status: 'sending'
        })
        .select()
        .single();

      if (broadcastError) throw broadcastError;

      // Prepare message payloads
      const messagePayloads = recipients.map(recipient => ({
        to: recipient.phone,
        message: whatsappWebAPI.processTemplate(selectedTemplate.content, recipient),
        recipientData: recipient
      }));

      // Send broadcast via WhatsApp Web API
      const broadcastResult = await whatsappWebAPI.sendBroadcast({
        sessionId: session.id,
        recipients: messagePayloads,
        templateId: selectedTemplate.id
      });

      // Update broadcast status
      await supabase
        .from('whatsapp_broadcasts')
        .update({
          status: 'sent',
          sent_count: recipients.length
        })
        .eq('id', broadcastData.id);

      toast({
        title: "Broadcast Sent",
        description: `Successfully sent ${recipients.length} messages`
      });

      // Reset form
      setBroadcastName('');
      setRecipients([]);
      setCsvFile(null);
      setPreviewRecipient(null);

    } catch (error: any) {
      console.error('Error sending broadcast:', error);
      toast({
        title: "Broadcast Failed",
        description: error.message || "Failed to send broadcast",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!isConnected) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please connect your WhatsApp account first to create broadcasts.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Broadcast Details */}
      <Card>
        <CardHeader>
          <CardTitle>Broadcast Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="broadcast-name">Broadcast Name</Label>
            <Input
              id="broadcast-name"
              value={broadcastName}
              onChange={(e) => setBroadcastName(e.target.value)}
              placeholder="Enter broadcast name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-select">Message Template</Label>
            {isLoadingTemplates ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading templates...</span>
              </div>
            ) : (
              <select
                id="template-select"
                className="w-full p-2 border rounded-md"
                value={selectedTemplate?.id || ''}
                onChange={(e) => {
                  const template = templates.find(t => t.id === e.target.value);
                  setSelectedTemplate(template || null);
                }}
              >
                <option value="">Select a template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.title}
                  </option>
                ))}
              </select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recipients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recipients ({recipients.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-upload">Upload CSV File</Label>
            <div className="flex items-center gap-2">
              <Input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                className="flex-1"
              />
              <Upload className="h-4 w-4" />
            </div>
            <p className="text-xs text-muted-foreground">
              CSV should include columns: name, phone (required), and any other data for template placeholders
            </p>
          </div>

          {recipients.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{recipients.length} recipients loaded</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Preview recipient: {previewRecipient?.name} ({previewRecipient?.phone})
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Preview */}
      {selectedTemplate && previewRecipient && (
        <Card>
          <CardHeader>
            <CardTitle>Message Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{messagePreview}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Send Button */}
      <div className="flex justify-end">
        <Button
          onClick={sendBroadcast}
          disabled={!selectedTemplate || recipients.length === 0 || !broadcastName.trim() || isSending}
          size="lg"
        >
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send Broadcast ({recipients.length} recipients)
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
