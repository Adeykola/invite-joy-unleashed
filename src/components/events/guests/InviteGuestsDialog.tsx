
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
