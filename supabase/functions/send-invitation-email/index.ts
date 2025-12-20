import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendInvitationEmailRequest {
  to: string;
  subject: string;
  html: string;
  from?: string;
  event_id?: string;
}

serve(async (req: Request): Promise<Response> => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Validate authentication header exists
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Create authenticated Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // 3. Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Invalid or expired token:", authError);
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Verify user has host or admin role
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['host', 'admin'].includes(profile.role)) {
      console.error("Insufficient permissions for user:", user.id);
      return new Response(
        JSON.stringify({ error: "Insufficient permissions. Host or admin role required." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Parse and validate request data
    const { to, subject, html, from, event_id }: SendInvitationEmailRequest = await req.json();

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, html" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. If event_id provided, verify user owns the event
    if (event_id) {
      const { data: event } = await supabaseClient
        .from('events')
        .select('host_id')
        .eq('id', event_id)
        .single();

      if (!event || (event.host_id !== user.id && profile.role !== 'admin')) {
        console.error("Unauthorized to send emails for event:", event_id);
        return new Response(
          JSON.stringify({ error: "Unauthorized to send emails for this event" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // 7. Send email via Resend
    const response = await resend.emails.send({
      from: from || "Your Event App <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });

    if (response.error) {
      console.error("Resend API error:", response.error);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 8. Log the action for audit trail
    await supabaseClient.from('communication_logs').insert({
      user_id: user.id,
      event_id: event_id || null,
      recipient_email: to,
      message_type: 'email',
      subject: subject,
      content: html,
      status: 'sent',
      sent_at: new Date().toISOString()
    });

    console.log("Email sent successfully to:", to);
    return new Response(JSON.stringify({ success: true, message: "Email sent successfully" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-invitation-email:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
