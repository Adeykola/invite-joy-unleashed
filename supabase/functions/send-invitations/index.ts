
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// Initialize Resend with API key
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Guest {
  id: string;
  name: string;
  email: string;
}

interface InvitationRequest {
  invitationType: "email" | "sms" | "link" | "whatsapp";
  eventId: string;
  eventTitle: string;
  eventDate: string;
  guests: Guest[];
  template: string;
  subject: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      invitationType, 
      eventId, 
      eventTitle, 
      eventDate, 
      guests, 
      template, 
      subject
    }: InvitationRequest = await req.json();

    console.log("Invitation request received:", {
      invitationType,
      eventId,
      eventTitle,
      guestCount: guests.length
    });

    const results = [];

    // For email type, send emails to all guests
    if (invitationType === "email") {
      for (const guest of guests) {
        // Personalize the template
        const rsvpLink = `${req.headers.get("origin") || "https://yourdomain.com"}/event/${eventId}`;
        const personalizedMessage = template
          .replace(/{guest_name}/g, guest.name)
          .replace(/{event_title}/g, eventTitle)
          .replace(/{event_date}/g, eventDate)
          .replace(/{rsvp_link}/g, rsvpLink);
          
        try {
          const emailResult = await resend.emails.send({
            from: "Event Invitation <events@resend.com>",
            to: [guest.email],
            subject: subject,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                  <h1 style="color: #333; margin: 0;">${eventTitle}</h1>
                  <p style="color: #666; margin: 10px 0 0;">${eventDate}</p>
                </div>
                <div style="padding: 20px; border: 1px solid #eaeaea; border-top: none; border-radius: 0 0 8px 8px;">
                  ${personalizedMessage}
                  <div style="margin-top: 30px; text-align: center;">
                    <a href="${rsvpLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">RSVP Now</a>
                  </div>
                </div>
                <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                  <p>This invitation was sent to ${guest.email}</p>
                </div>
              </div>
            `,
          });
          
          console.log(`Email sent to ${guest.email}:`, emailResult);
          results.push({ 
            guest: guest.id, 
            status: "success", 
            message: `Email sent to ${guest.email}` 
          });
        } catch (emailError) {
          console.error(`Error sending email to ${guest.email}:`, emailError);
          results.push({ 
            guest: guest.id, 
            status: "error", 
            message: `Failed to send email to ${guest.email}: ${emailError.message}` 
          });
        }
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error in send-invitations function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
