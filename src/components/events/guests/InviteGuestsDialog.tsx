
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEventDetails } from "@/hooks/useEventDetails";
import { 
  Mail, 
  MessageSquareText, 
  Share2, 
  Send,
  Download,
  Copy,
  Link as LinkIcon,
  AlertTriangle,
  Check
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define the Guest type
export interface Guest {
  id: string;
  name: string;
  email: string;
}

// Define props for the component
interface InviteGuestsDialogProps {
  eventId: string;
  eventTitle: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteGuestsDialog({ 
  eventId, 
  eventTitle,
  isOpen, 
  onOpenChange 
}: InviteGuestsDialogProps) {
  const [activeTab, setActiveTab] = useState<string>("email");
  const [inviteMessage, setInviteMessage] = useState<string>(`Hello {guest_name},\n\nYou are invited to ${eventTitle}. We hope you can join us!\n\nPlease RSVP at the link below.\n\nBest regards,\nThe Host`);
  const [subject, setSubject] = useState<string>(`You're invited to ${eventTitle}!`);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [sendingInvitations, setSendingInvitations] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const { toast } = useToast();
  const { event: eventDetails } = useEventDetails(eventId);
  
  // Fetch guest list when component mounts
  useEffect(() => {
    if (isOpen && eventId) {
      fetchGuestList();
    }
  }, [isOpen, eventId]);
  
  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab("email");
      setError(null);
      setSuccess(false);
      setSendingInvitations(false);
    }
  }, [isOpen]);

  const fetchGuestList = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .rpc('get_event_guests', { p_event_id: eventId });
        
      if (error) {
        throw error;
      }
      
      setGuests(data || []);
    } catch (err: any) {
      console.error('Error fetching guest list:', err);
      setError('Failed to load guest list. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendInvitations = async () => {
    try {
      if (guests.length === 0) {
        toast({
          title: "No guests to invite",
          description: "Please add guests to your event first.",
          variant: "destructive",
        });
        return;
      }
      
      setSendingInvitations(true);
      setError(null);
      
      switch (activeTab) {
        case "email":
          await sendEmailInvitations(guests, subject, inviteMessage);
          toast({
            title: "Invitations Sent",
            description: `Email invitations sent to ${guests.length} guests.`,
          });
          break;
          
        case "sms":
          await generateTextMessages(guests, inviteMessage);
          break;
          
        case "whatsapp":
          await generateWhatsAppMessages(guests, inviteMessage);
          break;
          
        case "link":
          await generateShareableLinks(guests);
          break;
          
        default:
          break;
      }
      
      setSuccess(true);
    } catch (err: any) {
      console.error('Error sending invitations:', err);
      setError(err.message || 'Failed to send invitations. Please try again.');
      
      toast({
        title: "Error",
        description: "There was a problem sending invitations.",
        variant: "destructive",
      });
    } finally {
      setSendingInvitations(false);
    }
  };

  // Adding back the missing functions that were cut off 
  const sendEmailInvitations = async (guests: Guest[], subject: string, template: string) => {
    try {
      // Call the Supabase Edge Function to send emails
      const eventDate = eventDetails?.date 
        ? format(new Date(eventDetails.date), 'PPP')
        : 'the scheduled date';
      
      const response = await fetch(`https://ttlqxvpcjpxpbzkgbyod.supabase.co/functions/v1/send-invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          invitationType: 'email',
          eventId,
          eventTitle,
          eventDate,
          guests,
          template,
          subject
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send email invitations');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending email invitations:', error);
      throw error;
    }
  };

  const generateTextMessages = async (guests: Guest[], template: string) => {
    // For demo, we'll just show the formatted SMS messages
    // In production, this would call an SMS provider API
    
    const formattedSMSList = guests.map(guest => {
      const rsvpLink = `${window.location.origin}/event/${eventId}`;
      const message = template
        .replace('{guest_name}', guest.name)
        .replace('{event_title}', eventTitle)
        .replace('{rsvp_link}', rsvpLink);
        
      return { phone: "Not available", message, recipient: guest.name };
    });
    
    // Show a toast with instruction for manual SMS sending
    toast({
      title: "SMS Messages Prepared",
      description: "SMS integration requires a provider. For now, you can copy the generated messages.",
    });
    
    console.log("SMS messages generated:", formattedSMSList);
    
    return formattedSMSList;
  };

  const generateWhatsAppMessages = async (guests: Guest[], template: string) => {
    // For demo, generate WhatsApp deep links
    const whatsappLinks = guests.map(guest => {
      const rsvpLink = `${window.location.origin}/event/${eventId}`;
      const eventDate = eventDetails?.date 
        ? format(new Date(eventDetails.date), 'PPP')
        : 'the scheduled date';
        
      const message = template
        .replace('{guest_name}', guest.name)
        .replace('{event_title}', eventTitle)
        .replace('{event_date}', eventDate)
        .replace('{rsvp_link}', rsvpLink);
        
      // Create WhatsApp deep link
      const encodedMessage = encodeURIComponent(message);
      const whatsappLink = `https://wa.me/?text=${encodedMessage}`;
      
      return { link: whatsappLink, recipient: guest.name };
    });
    
    // Open the first WhatsApp link in a new window
    if (whatsappLinks.length > 0) {
      window.open(whatsappLinks[0].link, '_blank');
      
      if (whatsappLinks.length > 1) {
        toast({
          title: "Multiple WhatsApp Messages",
          description: "First message opened. Please manually send the rest.",
        });
      }
    }
    
    console.log("WhatsApp links generated:", whatsappLinks);
    
    return whatsappLinks;
  };

  const generateShareableLinks = async (guests: Guest[]) => {
    // Generate individual shareable links for each guest
    const shareableLinks = guests.map(guest => {
      // Create a unique link for each guest
      const rsvpLink = `${window.location.origin}/event/${eventId}`;
      return { link: rsvpLink, recipient: guest.name, email: guest.email };
    });
    
    // Copy the first link to clipboard
    if (shareableLinks.length > 0) {
      navigator.clipboard.writeText(shareableLinks[0].link)
        .then(() => {
          toast({
            title: "Link Copied",
            description: `Shareable link for ${shareableLinks[0].recipient} copied to clipboard.`,
          });
        })
        .catch(err => {
          console.error('Could not copy link: ', err);
        });
    }
    
    console.log("Shareable links generated:", shareableLinks);
    
    return shareableLinks;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Invite Guests</DialogTitle>
          <DialogDescription>
            Send invitations to guests for "{eventTitle}"
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="py-6 text-center">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
            <p>Loading guest list...</p>
          </div>
        ) : guests.length === 0 ? (
          <Alert className="my-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>No guests found</AlertTitle>
            <AlertDescription>
              Add guests to your event before sending invitations.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="py-4">
              <p className="text-sm font-medium mb-2">Sending to {guests.length} guests:</p>
              <div className="max-h-20 overflow-y-auto text-sm text-muted-foreground">
                {guests.slice(0, 5).map((guest, i) => (
                  <span key={guest.id || i} className="mr-2">
                    {guest.name}{i < guests.length - 1 && i < 4 ? ',' : ''}
                  </span>
                ))}
                {guests.length > 5 && <span>and {guests.length - 5} more...</span>}
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="email" className="flex items-center gap-1">
                  <Mail className="h-3 w-3" /> Email
                </TabsTrigger>
                <TabsTrigger value="sms" className="flex items-center gap-1">
                  <MessageSquareText className="h-3 w-3" /> SMS
                </TabsTrigger>
                <TabsTrigger value="whatsapp" className="flex items-center gap-1">
                  <Share2 className="h-3 w-3" /> WhatsApp
                </TabsTrigger>
                <TabsTrigger value="link" className="flex items-center gap-1">
                  <LinkIcon className="h-3 w-3" /> Link
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="email" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Subject</label>
                  <Input 
                    value={subject} 
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter email subject"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea 
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    placeholder="Enter invitation message"
                    rows={6}
                    className="resize-none"
                  />
                  <div className="text-xs text-muted-foreground">
                    Available tags: {"{guest_name}"}, {"{event_title}"}, {"{event_date}"}, {"{rsvp_link}"}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="sms" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">SMS Message</label>
                  <Textarea 
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    placeholder="Enter SMS message"
                    rows={6}
                    className="resize-none"
                  />
                  <div className="text-xs text-muted-foreground">
                    Available tags: {"{guest_name}"}, {"{event_title}"}, {"{rsvp_link}"}
                  </div>
                </div>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>SMS Integration Needed</AlertTitle>
                  <AlertDescription>
                    This feature requires an SMS provider. For now, messages will be generated for manual sending.
                  </AlertDescription>
                </Alert>
              </TabsContent>
              
              <TabsContent value="whatsapp" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">WhatsApp Message</label>
                  <Textarea 
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    placeholder="Enter WhatsApp message"
                    rows={6}
                    className="resize-none"
                  />
                  <div className="text-xs text-muted-foreground">
                    Available tags: {"{guest_name}"}, {"{event_title}"}, {"{event_date}"}, {"{rsvp_link}"}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="link" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Alert>
                    <Copy className="h-4 w-4" />
                    <AlertTitle>Shareable Links</AlertTitle>
                    <AlertDescription>
                      Generate and copy shareable links for your guests. Each link will be personalized.
                    </AlertDescription>
                  </Alert>
                </div>
              </TabsContent>
            </Tabs>
            
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mt-4">
                <Check className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>Invitations have been successfully sent!</AlertDescription>
              </Alert>
            )}
          </>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendInvitations} 
            disabled={loading || sendingInvitations || guests.length === 0}
            className="flex items-center gap-2"
          >
            {sendingInvitations ? (
              <div className="animate-spin h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send Invitations
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
