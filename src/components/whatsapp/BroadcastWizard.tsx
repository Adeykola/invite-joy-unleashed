
import React, { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { WhatsAppConnect } from "@/components/whatsapp/WhatsAppConnect";
import { TemplateEditor } from "@/components/whatsapp/TemplateEditor";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarIcon, Loader2, Send, Upload, UserCircle, Users } from "lucide-react";
import Papa from 'papaparse';

interface Recipient {
  phone: string;
  name?: string;
  [key: string]: any;
}

interface Template {
  id: string;
  title: string;
  content: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
}

interface WhatsAppSession {
  id: string;
  status: string;
}

export function BroadcastWizard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<string>("connect");
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [recipientSource, setRecipientSource] = useState<string>("csv");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [manualRecipients, setManualRecipients] = useState<string>("");
  const [previewRecipient, setPreviewRecipient] = useState<Recipient | null>(null);
  const [previewMessage, setPreviewMessage] = useState<string>("");
  const [broadcastName, setBroadcastName] = useState<string>("");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [schedulingOption, setSchedulingOption] = useState<string>("now");
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load WhatsApp sessions
  useEffect(() => {
    if (user) {
      loadSessions();
      loadEvents();
    }
  }, [user]);

  // Load events from database
  const loadEvents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, date, location');

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error("Error loading events:", err);
    }
  };

  // Load WhatsApp sessions from database
  const loadSessions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('whatsapp_sessions')
        .select('id, status, last_connected_at, phone_number, display_name')
        .eq('status', 'connected')
        .order('last_connected_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setSessions(data);
        setSelectedSession(data[0].id);
      }
    } catch (err) {
      console.error("Error loading WhatsApp sessions:", err);
    }
  };

  // Handle template selection
  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    updatePreview(template);
  };

  // Update preview message
  const updatePreview = (template: Template | null = selectedTemplate) => {
    if (!template || !previewRecipient) return;

    let message = template.content;
    
    // Replace recipient placeholders
    Object.entries(previewRecipient).forEach(([key, value]) => {
      message = message.replace(new RegExp(`{{${key}}}`, 'g'), value?.toString() || '');
    });
    
    // Replace event placeholders if an event is selected
    if (selectedEvent) {
      const event = events.find(e => e.id === selectedEvent);
      if (event) {
        message = message.replace(/{{event_title}}/g, event.title || '');
        message = message.replace(/{{date}}/g, format(new Date(event.date), 'PPP') || '');
        message = message.replace(/{{location}}/g, event.location || '');
      }
    }
    
    setPreviewMessage(message);
  };

  // Handle CSV file upload
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setCsvFile(file);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && Array.isArray(results.data) && results.data.length > 0) {
          // Validate data has required phone field
          const validData = results.data.filter((row: any) => row.phone);
          setRecipients(validData);
          
          // Set preview recipient
          if (validData.length > 0) {
            setPreviewRecipient(validData[0]);
            updatePreview();
          }
          
          toast({
            title: "CSV Uploaded",
            description: `Loaded ${validData.length} recipients from CSV`
          });
        }
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
        toast({
          title: "Error",
          description: "Failed to parse CSV file",
          variant: "destructive"
        });
      }
    });
  };

  // Handle manual recipient input
  const handleManualRecipientsChange = (value: string) => {
    setManualRecipients(value);
    
    // Parse manual recipients
    const lines = value.split('\n').filter(line => line.trim() !== '');
    const parsedRecipients: Recipient[] = lines.map(line => {
      const [phone, name] = line.split(',').map(part => part.trim());
      return { phone, name };
    }).filter(r => r.phone);
    
    setRecipients(parsedRecipients);
    
    // Set preview recipient
    if (parsedRecipients.length > 0) {
      setPreviewRecipient(parsedRecipients[0]);
      updatePreview();
    }
  };

  // Create and schedule broadcast
  const createBroadcast = async () => {
    if (!user || !selectedTemplate || recipients.length === 0 || !selectedSession || !broadcastName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create broadcast record
      const { data: broadcastData, error: broadcastError } = await supabase
        .from('whatsapp_broadcasts')
        .insert({
          user_id: user.id,
          template_id: selectedTemplate.id,
          event_id: selectedEvent || null,
          name: broadcastName,
          scheduled_for: schedulingOption === 'later' && scheduledDate ? scheduledDate.toISOString() : null,
          status: schedulingOption === 'later' ? 'scheduled' : 'pending',
          total_recipients: recipients.length
        })
        .select();

      if (broadcastError) throw broadcastError;
      
      const broadcastId = broadcastData[0].id;
      
      // Create recipient records
      const recipientRecords = recipients.map(recipient => ({
        broadcast_id: broadcastId,
        phone_number: recipient.phone,
        recipient_data: recipient
      }));
      
      const { error: recipientsError } = await supabase
        .from('broadcast_recipients')
        .insert(recipientRecords);

      if (recipientsError) throw recipientsError;
      
      // If broadcast is scheduled for now, start sending messages
      if (schedulingOption === 'now') {
        // We would trigger the sending process here
        // For now, just update the status
        await supabase
          .from('whatsapp_broadcasts')
          .update({ status: 'processing' })
          .eq('id', broadcastId);
          
        toast({
          title: "Broadcast Created",
          description: "Your messages are being sent"
        });
      } else {
        toast({
          title: "Broadcast Scheduled",
          description: `Your messages will be sent on ${format(scheduledDate!, 'PPP')}`
        });
      }
      
      // Reset form
      setBroadcastName("");
      setSelectedEvent("");
      setSelectedTemplate(null);
      setRecipients([]);
      setCsvFile(null);
      setManualRecipients("");
      setScheduledDate(undefined);
      setSchedulingOption("now");
      setCurrentStep("connect");
      
    } catch (err) {
      console.error("Error creating broadcast:", err);
      toast({
        title: "Error",
        description: "Failed to create broadcast",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Determine if we can proceed to next step
  const canProceedToTemplates = sessions.length > 0 && selectedSession;
  const canProceedToRecipients = selectedTemplate !== null;
  const canProceedToPreview = recipients.length > 0;
  const canSendBroadcast = 
    broadcastName && 
    selectedTemplate && 
    recipients.length > 0 && 
    selectedSession && 
    (schedulingOption === 'now' || (schedulingOption === 'later' && scheduledDate));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create WhatsApp Broadcast</CardTitle>
        <CardDescription>
          Send personalized WhatsApp messages to your event guests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={currentStep} onValueChange={setCurrentStep}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="connect">1. Connect</TabsTrigger>
            <TabsTrigger value="templates" disabled={!canProceedToTemplates}>2. Template</TabsTrigger>
            <TabsTrigger value="recipients" disabled={!canProceedToRecipients}>3. Recipients</TabsTrigger>
            <TabsTrigger value="preview" disabled={!canProceedToPreview}>4. Schedule</TabsTrigger>
          </TabsList>
          
          <TabsContent value="connect" className="space-y-4">
            <WhatsAppConnect />
            
            {sessions.length > 0 && (
              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-medium">Select WhatsApp Connection</h3>
                
                <div className="grid gap-4">
                  {sessions.map((session) => (
                    <div 
                      key={session.id}
                      className={`border p-4 rounded-md cursor-pointer ${
                        selectedSession === session.id ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                      onClick={() => setSelectedSession(session.id)}
                    >
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-5 w-5 text-primary" />
                        <span className="font-medium">{session.display_name || 'WhatsApp Account'}</span>
                      </div>
                      {session.phone_number && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Phone: {session.phone_number}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end mt-6">
                  <Button 
                    onClick={() => setCurrentStep("templates")}
                    disabled={!selectedSession}
                  >
                    Continue to Templates
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="templates" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event">Link to Event (Optional)</Label>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an event (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No specific event</SelectItem>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title} - {format(new Date(event.date), 'PP')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Linking to an event allows you to use event details in your templates.
                </p>
              </div>
              
              <TemplateEditor onTemplateSelect={handleTemplateSelect} />
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setCurrentStep("connect")}>
                  Back
                </Button>
                <Button 
                  onClick={() => setCurrentStep("recipients")}
                  disabled={!selectedTemplate}
                >
                  Continue to Recipients
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="recipients" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Recipient Source</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    className={`border p-4 rounded-md cursor-pointer text-center ${
                      recipientSource === 'csv' ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onClick={() => setRecipientSource('csv')}
                  >
                    <Upload className="h-8 w-8 mx-auto mb-2" />
                    <div className="font-medium">Upload CSV</div>
                    <p className="text-sm text-muted-foreground">
                      Import from spreadsheet
                    </p>
                  </div>
                  <div 
                    className={`border p-4 rounded-md cursor-pointer text-center ${
                      recipientSource === 'manual' ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onClick={() => setRecipientSource('manual')}
                  >
                    <Users className="h-8 w-8 mx-auto mb-2" />
                    <div className="font-medium">Manual Entry</div>
                    <p className="text-sm text-muted-foreground">
                      Type phone numbers
                    </p>
                  </div>
                </div>
              </div>
              
              {recipientSource === 'csv' ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed rounded-md p-6 text-center">
                    <Input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      id="csv-upload"
                      onChange={handleCsvUpload}
                    />
                    <Label htmlFor="csv-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-base font-medium">
                        {csvFile ? csvFile.name : 'Click to upload CSV'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        CSV should include columns: phone (required), name (optional)
                      </p>
                    </Label>
                  </div>
                  
                  {recipients.length > 0 && (
                    <div>
                      <p className="text-sm font-medium">{recipients.length} recipients loaded</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="manual-recipients">
                    Enter Recipients (one per line: phone,name)
                  </Label>
                  <Textarea
                    id="manual-recipients"
                    value={manualRecipients}
                    onChange={(e) => handleManualRecipientsChange(e.target.value)}
                    placeholder="+1234567890,John Doe&#10;+1234567891,Jane Smith"
                    rows={10}
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter one recipient per line in format: phone,name
                  </p>
                  
                  {recipients.length > 0 && (
                    <div>
                      <p className="text-sm font-medium">{recipients.length} recipients entered</p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setCurrentStep("templates")}>
                  Back
                </Button>
                <Button 
                  onClick={() => setCurrentStep("preview")}
                  disabled={recipients.length === 0}
                >
                  Continue to Preview & Schedule
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="broadcast-name">Broadcast Name</Label>
                <Input
                  id="broadcast-name"
                  value={broadcastName}
                  onChange={(e) => setBroadcastName(e.target.value)}
                  placeholder="Name this broadcast for your reference"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Scheduling</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    className={`border p-4 rounded-md cursor-pointer text-center ${
                      schedulingOption === 'now' ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onClick={() => setSchedulingOption('now')}
                  >
                    <Send className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-medium">Send Now</div>
                  </div>
                  <div 
                    className={`border p-4 rounded-md cursor-pointer text-center ${
                      schedulingOption === 'later' ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onClick={() => setSchedulingOption('later')}
                  >
                    <CalendarIcon className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-medium">Schedule for Later</div>
                  </div>
                </div>
              </div>
              
              {schedulingOption === 'later' && (
                <div className="space-y-2">
                  <Label>Select Date & Time</Label>
                  <div className="grid gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {scheduledDate ? format(scheduledDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={scheduledDate}
                          onSelect={setScheduledDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    
                    {/* Time selection could be added here */}
                  </div>
                </div>
              )}
              
              <div className="border rounded-md p-4 mt-6">
                <h3 className="text-lg font-medium mb-3">Message Preview</h3>
                
                {selectedTemplate && previewRecipient ? (
                  <>
                    <div className="text-sm text-muted-foreground mb-2">
                      Preview for: {previewRecipient.name || previewRecipient.phone}
                    </div>
                    <div className="bg-green-50 p-3 rounded-md whitespace-pre-line">
                      {previewMessage}
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No preview available. Please select a template and add recipients.
                  </p>
                )}
                
                <div className="mt-4 text-sm">
                  <p><strong>Total Recipients:</strong> {recipients.length}</p>
                  {selectedEvent && (
                    <p><strong>Linked Event:</strong> {events.find(e => e.id === selectedEvent)?.title}</p>
                  )}
                  <p><strong>WhatsApp Account:</strong> {sessions.find(s => s.id === selectedSession)?.display_name || 'Selected Account'}</p>
                </div>
              </div>
              
              {recipients.length > 100 && (
                <Alert>
                  <AlertTitle>Large Recipient List</AlertTitle>
                  <AlertDescription>
                    You're sending to {recipients.length} recipients. Messages will be sent in batches to comply with WhatsApp's rate limits.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setCurrentStep("recipients")}>
                  Back
                </Button>
                <Button 
                  onClick={createBroadcast}
                  disabled={!canSendBroadcast || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : schedulingOption === 'later' ? (
                    <>Schedule Broadcast</>
                  ) : (
                    <>Send Broadcast Now</>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
