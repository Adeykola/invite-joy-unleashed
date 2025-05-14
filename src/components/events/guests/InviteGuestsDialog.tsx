
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Check, X, MessageSquare, Link, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface InviteGuestsDialogProps {
  eventId: string;
  eventTitle: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type Guest = {
  id: string;
  name: string;
  email: string;
  invited_at: string | null;
  invite_sent: boolean;
};

type InviteMethod = "email" | "sms" | "link" | "whatsapp";

export function InviteGuestsDialog({ 
  eventId, 
  eventTitle, 
  isOpen: externalIsOpen, 
  onOpenChange: externalOnOpenChange 
}: InviteGuestsDialogProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentMethod, setCurrentMethod] = useState<InviteMethod>("email");
  const { toast } = useToast();

  // Use controlled or uncontrolled open state based on props
  const isControlled = externalIsOpen !== undefined && externalOnOpenChange !== undefined;
  const isOpen = isControlled ? externalIsOpen : internalIsOpen;
  const setIsOpen = (open: boolean) => {
    if (isControlled) {
      externalOnOpenChange!(open);
    } else {
      setInternalIsOpen(open);
    }
  };

  // Fetch guests for this event
  const { data: guests, isLoading, refetch } = useQuery({
    queryKey: ["event-guests", eventId],
    enabled: isOpen,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_event_guests', {
        p_event_id: eventId
      });
      
      if (error) throw error;
      return data as Guest[];
    },
  });

  // Fetch event details to get invitation templates
  const { data: eventDetails } = useQuery({
    queryKey: ["event-invite-details", eventId],
    enabled: isOpen,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();
        
      if (error) throw error;
      return data;
    },
  });

  const toggleSelectAll = () => {
    if (guests && guests.length > 0) {
      if (selectedGuests.length === guests.length) {
        setSelectedGuests([]);
      } else {
        setSelectedGuests(guests.map(guest => guest.id));
      }
    }
  };

  const toggleSelect = (guestId: string) => {
    if (selectedGuests.includes(guestId)) {
      setSelectedGuests(selectedGuests.filter(id => id !== guestId));
    } else {
      setSelectedGuests([...selectedGuests, guestId]);
    }
  };

  const handleSendInvites = async () => {
    if (!selectedGuests.length) {
      toast({
        title: "No guests selected",
        description: "Please select at least one guest to invite.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Get the selected guests' information
      const selectedGuestData = guests?.filter(guest => 
        selectedGuests.includes(guest.id)
      ) || [];

      // Get event meta data
      const meta = eventDetails?.meta || {};
      const templates = {
        email: meta.emailTemplate || "You're invited to {event_title} on {event_date}. RSVP at: {rsvp_link}",
        emailSubject: meta.emailSubject || `Invitation to ${eventTitle}`,
        sms: meta.smsTemplate || "You're invited to {event_title}. RSVP: {rsvp_link}",
        whatsapp: meta.whatsappTemplate || "Hello {guest_name}, you're invited to {event_title} on {event_date}. RSVP: {rsvp_link}"
      };
      
      // Send invitations based on the selected method
      if (currentMethod === "email") {
        await sendEmailInvitations(selectedGuestData, templates.emailSubject, templates.email);
      } else if (currentMethod === "sms") {
        await generateTextMessages(selectedGuestData, templates.sms);
      } else if (currentMethod === "whatsapp") {
        await generateWhatsAppMessages(selectedGuestData, templates.whatsapp);
      } else if (currentMethod === "link") {
        await generateShareableLinks(selectedGuestData);
      }
      
      // Update the selected guests to mark them as invited
      const { error } = await supabase
        .from("event_guests")
        .update({
          invite_sent: true,
          invited_at: new Date().toISOString()
        })
        .in("id", selectedGuests);

      if (error) throw error;

      toast({
        title: "Invitations Sent",
        description: `Successfully sent ${currentMethod} invitations to ${selectedGuests.length} guests.`,
      });

      // Refresh the guest list
      refetch();
      
      // Clear selection
      setSelectedGuests([]);
    } catch (error) {
      console.error("Error sending invites:", error);
      toast({
        title: "Failed to Send Invites",
        description: "There was an error sending the invitations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

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
          'Authorization': `Bearer ${supabase.auth.getSession().then(res => res.data.session?.access_token)}`
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="default" size="sm">
            <Mail className="mr-2 h-4 w-4" />
            Manage Invites
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Manage Guest Invitations</DialogTitle>
          <DialogDescription>
            Send invitations to guests for {eventTitle}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="email" onValueChange={(value) => setCurrentMethod(value as InviteMethod)}>
          <TabsList className="mb-4">
            <TabsTrigger value="email" className="flex items-center">
              <Mail className="mr-2 h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex items-center">
              <MessageSquare className="mr-2 h-4 w-4" />
              SMS
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center">
              <MessageSquare className="mr-2 h-4 w-4" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center">
              <Link className="mr-2 h-4 w-4" />
              Link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="mt-0">
            <p className="text-sm text-muted-foreground mb-4">
              Send email invitations to your guests.
            </p>
          </TabsContent>
          
          <TabsContent value="sms" className="mt-0">
            <p className="text-sm text-muted-foreground mb-4">
              Send SMS invitations (requires phone numbers).
            </p>
          </TabsContent>
          
          <TabsContent value="whatsapp" className="mt-0">
            <p className="text-sm text-muted-foreground mb-4">
              Send WhatsApp invitations using preformatted messages.
            </p>
          </TabsContent>
          
          <TabsContent value="link" className="mt-0">
            <p className="text-sm text-muted-foreground mb-4">
              Generate shareable links for your guests.
            </p>
          </TabsContent>
        </Tabs>

        <div className="mt-0 space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading guests...</div>
          ) : guests && guests.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="selectAll"
                    checked={selectedGuests.length === guests.length}
                    onCheckedChange={toggleSelectAll}
                  />
                  <label 
                    htmlFor="selectAll"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Select All
                  </label>
                </div>
                <Button
                  onClick={handleSendInvites}
                  disabled={isProcessing || selectedGuests.length === 0}
                >
                  {isProcessing ? "Sending..." : `Send ${currentMethod === "link" ? "Links" : currentMethod === "email" ? "Emails" : currentMethod === "sms" ? "SMS" : "WhatsApp"}`}
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Invited At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guests.map((guest) => (
                    <TableRow key={guest.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedGuests.includes(guest.id)}
                          onCheckedChange={() => toggleSelect(guest.id)}
                        />
                      </TableCell>
                      <TableCell>{guest.name}</TableCell>
                      <TableCell>{guest.email}</TableCell>
                      <TableCell>
                        {guest.invite_sent ? (
                          <span className="inline-flex items-center text-green-600">
                            <Check className="mr-1 h-4 w-4" /> Invited
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-amber-600">
                            <X className="mr-1 h-4 w-4" /> Not Invited
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {guest.invited_at 
                          ? new Date(guest.invited_at).toLocaleDateString() 
                          : "Not sent"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No guests added to this event yet.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
