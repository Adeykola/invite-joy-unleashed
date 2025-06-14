
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Global map to store active WhatsApp connections
const activeConnections = new Map();

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

      if (existingSession && activeConnections.has(user_id)) {
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

      // Initialize WhatsApp Web client
      const sessionId = crypto.randomUUID();
      
      // Create session in database
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
            qr_generated: false
          },
          encrypted_session_key: sessionId,
          capabilities: ['text', 'image', 'video', 'audio', 'document'],
          connection_attempts: 1,
          last_connected_at: new Date().toISOString()
        });

      if (sessionError) throw sessionError;

      // Start WhatsApp Web client initialization
      const qrCodeData = await initializeWhatsAppWebClient(user_id, sessionId, supabase);

      return new Response(
        JSON.stringify({
          status: 'connecting',
          session_id: sessionId,
          connection_type: 'web',
          qrCode: qrCodeData,
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

async function initializeWhatsAppWebClient(userId: string, sessionId: string, supabase: any) {
  try {
    console.log('Starting WhatsApp Web client for user:', userId);
    
    // Generate a demo QR code for now - in production, this would use real WhatsApp Web protocol
    const qrPayload = {
      ref: `${sessionId}.${crypto.randomUUID()}`,
      publicKey: btoa(crypto.randomUUID()),
      clientToken: crypto.randomUUID(),
      serverToken: sessionId,
      timestamp: Date.now(),
      webVersion: '2.2.24',
      browserName: 'Chrome',
      browserVersion: '91.0.4472.124'
    };
    
    const qrString = JSON.stringify(qrPayload);
    
    // Update session with QR code
    await supabase
      .from('whatsapp_sessions')
      .update({
        session_data: { 
          session_id: sessionId,
          qr_code: qrString,
          qr_generated: true,
          last_qr_at: new Date().toISOString()
        }
      })
      .eq('id', sessionId);

    // Generate QR code URL
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrString)}`;
    
    // Simulate connection after 10 seconds for demo purposes
    setTimeout(async () => {
      try {
        await supabase
          .from('whatsapp_sessions')
          .update({
            status: 'connected',
            phone_number: '+1234567890',
            display_name: 'Demo WhatsApp User',
            session_data: {
              session_id: sessionId,
              connected_at: new Date().toISOString(),
              user_info: {
                name: 'Demo WhatsApp User',
                id: '1234567890@c.us'
              }
            }
          })
          .eq('id', sessionId);
          
        console.log('Demo connection established for user:', userId);
      } catch (error) {
        console.error('Error simulating connection:', error);
      }
    }, 10000);
    
    return qrCodeUrl;
    
  } catch (error) {
    console.error('Error initializing WhatsApp Web client:', error);
    
    // Fallback to demo QR code
    const fallbackQR = JSON.stringify({
      ref: `${sessionId}.${crypto.randomUUID()}`,
      publicKey: btoa(crypto.randomUUID()),
      clientToken: crypto.randomUUID(),
      serverToken: sessionId,
      timestamp: Date.now()
    });
    
    return `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(fallbackQR)}`;
  }
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

  if (session.status === 'connecting') {
    // Generate new QR code if needed
    const qrCode = session.session_data?.qr_code 
      ? `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(session.session_data.qr_code)}`
      : await generateFallbackQR(session.id, user_id);
    
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

async function generateFallbackQR(sessionId: string, userId: string) {
  const qrPayload = {
    ref: `${sessionId}.${crypto.randomUUID()}`,
    publicKey: btoa(crypto.randomUUID()),
    clientToken: crypto.randomUUID(),
    serverToken: sessionId,
    browserToken: btoa(`${userId}-${Date.now()}`),
    secret: btoa(crypto.randomUUID()),
    timestamp: Date.now()
  };
  
  const qrString = JSON.stringify(qrPayload);
  return `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrString)}`;
}

async function handleDisconnect(supabase: any, params: any) {
  const { user_id } = params;
  
  console.log('Disconnecting WhatsApp for user:', user_id);

  // Close active connection if exists
  activeConnections.delete(user_id);

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

  try {
    // For demo purposes, we'll simulate message sending
    console.log(`Simulating message send to ${to}: ${message}`);
    
    // In a real implementation, this would use the WhatsApp Web client to send the message
    const messageId = crypto.randomUUID();
    
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
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error(`Failed to send message: ${error.message}`);
  }
}
