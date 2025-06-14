
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, ...params } = await req.json();
    console.log('WhatsApp Enhanced Action:', action, params);

    // Get user ID from authorization header
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    let userId = params.user_id;
    
    if (!userId && authHeader) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader);
      if (authError || !user) throw new Error('Invalid authentication');
      userId = user.id;
    }

    if (!userId) throw new Error('Authentication required');

    switch (action) {
      case 'initialize':
        return await handleInitialize(supabase, { ...params, user_id: userId });
      case 'status':
        return await handleStatus(supabase, { ...params, user_id: userId });
      case 'disconnect':
        return await handleDisconnect(supabase, { ...params, user_id: userId });
      case 'send_message':
        return await handleSendMessage(supabase, { ...params, user_id: userId });
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('WhatsApp Enhanced Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function handleInitialize(supabase: any, params: any) {
  const { connection_type = 'web', user_id } = params;
  
  console.log('Initializing WhatsApp connection:', connection_type, 'for user:', user_id);

  if (connection_type === 'web') {
    try {
      // Check if session already exists and is active
      const { data: existingSession } = await supabase
        .from('whatsapp_sessions')
        .select('*')
        .eq('user_id', user_id)
        .eq('status', 'connected')
        .maybeSingle();

      if (existingSession) {
        return new Response(
          JSON.stringify({
            status: 'connected',
            connection_type: 'web',
            session_id: existingSession.id,
            phone_number: existingSession.phone_number,
            display_name: existingSession.display_name
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create new session
      const sessionId = crypto.randomUUID();
      
      // Generate a more realistic QR code URL
      // In a real implementation, this would connect to WhatsApp's servers
      const qrData = await generateWhatsAppWebQR(sessionId, user_id);
      
      const { error: sessionError } = await supabase
        .from('whatsapp_sessions')
        .upsert({
          id: sessionId,
          user_id: user_id,
          connection_type: 'web',
          status: 'connecting',
          session_data: { 
            session_id: sessionId,
            initialized_at: new Date().toISOString(),
            qr_generated: true
          },
          encrypted_session_key: sessionId,
          capabilities: ['text', 'image', 'video', 'audio', 'document'],
          connection_attempts: 1,
          last_connected_at: new Date().toISOString()
        });

      if (sessionError) throw sessionError;

      return new Response(
        JSON.stringify({
          status: 'connecting',
          session_id: sessionId,
          connection_type: 'web',
          qrCode: qrData,
          message: 'Scan the QR code with your WhatsApp mobile app to connect'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('WhatsApp Web initialization error:', error);
      throw new Error(`Failed to initialize WhatsApp Web: ${error.message}`);
    }
    
  } else if (connection_type === 'business_api') {
    // Business API requires proper credentials
    const businessApiToken = Deno.env.get('WHATSAPP_BUSINESS_API_TOKEN');
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
    
    if (!businessApiToken || !phoneNumberId) {
      throw new Error('WhatsApp Business API credentials not configured. Please add WHATSAPP_BUSINESS_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID secrets.');
    }

    const { error: sessionError } = await supabase
      .from('whatsapp_sessions')
      .upsert({
        user_id: user_id,
        connection_type: 'business_api',
        status: 'connected',
        session_data: { 
          api_configured: true,
          phone_number_id: phoneNumberId
        },
        encrypted_session_key: 'business_api_active',
        capabilities: ['text', 'template', 'image', 'video', 'audio', 'document'],
        connection_attempts: 1,
        last_connected_at: new Date().toISOString()
      });

    if (sessionError) throw sessionError;

    return new Response(
      JSON.stringify({
        status: 'connected',
        connection_type: 'business_api',
        message: 'WhatsApp Business API configured successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  throw new Error('Invalid connection type');
}

async function generateWhatsAppWebQR(sessionId: string, userId: string) {
  // Generate a WhatsApp Web-style QR code
  // This simulates the real WhatsApp Web QR format for demo purposes
  const timestamp = Date.now();
  const clientToken = crypto.randomUUID();
  
  // WhatsApp Web QR format simulation
  const qrPayload = {
    ref: `${sessionId}.${clientToken}`,
    publicKey: btoa(crypto.randomUUID()),
    clientToken: clientToken,
    serverToken: sessionId,
    browserToken: btoa(`${userId}-${timestamp}`),
    secret: btoa(crypto.randomUUID()),
    timestamp: timestamp
  };
  
  // Create QR code URL using a QR code service
  const qrString = JSON.stringify(qrPayload);
  const encodedData = encodeURIComponent(qrString);
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodedData}`;
  
  return qrCodeUrl;
}

async function handleStatus(supabase: any, params: any) {
  const { user_id } = params;
  
  console.log('Checking WhatsApp status for user:', user_id);

  const { data: session, error } = await supabase
    .from('whatsapp_sessions')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  if (!session) {
    return new Response(
      JSON.stringify({
        status: 'disconnected',
        connection_type: null,
        message: 'No WhatsApp session found'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Auto-connect simulation for demo purposes
  // In a real implementation, this would check actual WhatsApp connection status
  if (session.status === 'connecting') {
    const sessionAge = Date.now() - new Date(session.created_at).getTime();
    
    // Simulate connection after 10 seconds for demo
    if (sessionAge > 10000) {
      await supabase
        .from('whatsapp_sessions')
        .update({
          status: 'connected',
          phone_number: '+1234567890',
          display_name: 'Demo WhatsApp Account',
          session_data: {
            ...session.session_data,
            connected_at: new Date().toISOString()
          }
        })
        .eq('id', session.id);

      return new Response(
        JSON.stringify({
          status: 'connected',
          connection_type: session.connection_type,
          phone_number: '+1234567890',
          display_name: 'Demo WhatsApp Account',
          message: 'WhatsApp Web connected successfully!'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Still connecting, return QR code if available
    const qrCode = await generateWhatsAppWebQR(session.id, user_id);
    
    return new Response(
      JSON.stringify({
        status: 'connecting',
        connection_type: session.connection_type,
        qrCode: qrCode,
        message: 'Waiting for QR code scan...'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({
      status: session.status,
      connection_type: session.connection_type,
      phone_number: session.phone_number,
      display_name: session.display_name,
      last_connected: session.last_connected_at,
      capabilities: session.capabilities || ['text']
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleDisconnect(supabase: any, params: any) {
  const { user_id } = params;
  
  console.log('Disconnecting WhatsApp for user:', user_id);

  const { error } = await supabase
    .from('whatsapp_sessions')
    .update({ 
      status: 'disconnected',
      session_data: null,
      encrypted_session_key: null
    })
    .eq('user_id', user_id);

  if (error) throw error;

  return new Response(
    JSON.stringify({ 
      status: 'disconnected',
      message: 'WhatsApp disconnected successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleSendMessage(supabase: any, params: any) {
  const { user_id, to, message } = params;
  
  console.log('Sending WhatsApp message for user:', user_id);

  // Check if user has an active WhatsApp session
  const { data: session } = await supabase
    .from('whatsapp_sessions')
    .select('*')
    .eq('user_id', user_id)
    .eq('status', 'connected')
    .maybeSingle();

  if (!session) {
    throw new Error('WhatsApp not connected. Please connect your WhatsApp first.');
  }

  // Simulate message sending for demo purposes
  // In a real implementation, this would use the actual WhatsApp API
  const messageId = crypto.randomUUID();
  
  console.log(`Demo: Sending message "${message}" to ${to}`);

  return new Response(
    JSON.stringify({
      success: true,
      message_id: messageId,
      status: 'sent',
      timestamp: new Date().toISOString(),
      message: 'Message sent successfully (demo mode)'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
