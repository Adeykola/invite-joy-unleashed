
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Global map to store active WhatsApp clients
const activeClients = new Map();

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

      if (existingSession && activeClients.has(user_id)) {
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

      // Start real WhatsApp Web client initialization
      const qrCodeData = await initializeRealWhatsAppClient(user_id, sessionId, supabase);

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

async function initializeRealWhatsAppClient(userId: string, sessionId: string, supabase: any) {
  try {
    console.log('Starting real WhatsApp Web client for user:', userId);
    
    // Import WhatsApp Web.js dynamically
    const { Client, LocalAuth, MessageMedia } = await import('https://esm.sh/whatsapp-web.js@1.23.0');
    
    // Create WhatsApp client with local authentication
    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: sessionId,
        dataPath: `/tmp/whatsapp-sessions/${userId}`
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      }
    });

    // Store client reference
    activeClients.set(userId, client);

    let qrCodeData = null;

    // QR code event
    client.on('qr', async (qr) => {
      console.log('QR code received for user:', userId);
      qrCodeData = qr;
      
      // Update session with QR code
      await supabase
        .from('whatsapp_sessions')
        .update({
          session_data: { 
            session_id: sessionId,
            qr_code: qr,
            qr_generated: true,
            last_qr_at: new Date().toISOString()
          }
        })
        .eq('id', sessionId);
    });

    // Ready event - WhatsApp is connected
    client.on('ready', async () => {
      console.log('WhatsApp client ready for user:', userId);
      
      const clientInfo = client.info;
      
      await supabase
        .from('whatsapp_sessions')
        .update({
          status: 'connected',
          phone_number: clientInfo.wid.user,
          display_name: clientInfo.pushname || 'WhatsApp User',
          session_data: {
            session_id: sessionId,
            connected_at: new Date().toISOString(),
            user_info: {
              name: clientInfo.pushname,
              id: clientInfo.wid._serialized,
              phone: clientInfo.wid.user
            }
          }
        })
        .eq('id', sessionId);
    });

    // Authentication failure event
    client.on('auth_failure', async (msg) => {
      console.error('Authentication failed for user:', userId, msg);
      
      await supabase
        .from('whatsapp_sessions')
        .update({
          status: 'error',
          session_data: {
            session_id: sessionId,
            error: 'Authentication failed',
            error_message: msg,
            error_at: new Date().toISOString()
          }
        })
        .eq('id', sessionId);
        
      activeClients.delete(userId);
    });

    // Disconnected event
    client.on('disconnected', async (reason) => {
      console.log('WhatsApp client disconnected for user:', userId, reason);
      
      await supabase
        .from('whatsapp_sessions')
        .update({
          status: 'disconnected',
          session_data: {
            session_id: sessionId,
            disconnected_at: new Date().toISOString(),
            disconnect_reason: reason
          }
        })
        .eq('id', sessionId);
        
      activeClients.delete(userId);
    });

    // Initialize the client
    await client.initialize();
    
    // Wait for QR code to be generated (timeout after 30 seconds)
    let attempts = 0;
    while (!qrCodeData && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }
    
    if (qrCodeData) {
      // Generate QR code image URL
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrCodeData)}`;
      return qrCodeUrl;
    } else {
      throw new Error('Failed to generate QR code within timeout period');
    }
    
  } catch (error) {
    console.error('Error initializing real WhatsApp Web client:', error);
    
    // Update session with error
    await supabase
      .from('whatsapp_sessions')
      .update({
        status: 'error',
        session_data: {
          session_id: sessionId,
          error: 'Initialization failed',
          error_message: error.message,
          error_at: new Date().toISOString()
        }
      })
      .eq('id', sessionId);
    
    throw error;
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

  if (session.status === 'connecting' && session.session_data?.qr_code) {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(session.session_data.qr_code)}`;
    
    return new Response(
      JSON.stringify({
        status: 'connecting',
        connection_type: session.connection_type,
        qrCode: qrCodeUrl,
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

  // Close active client if exists
  if (activeClients.has(user_id)) {
    const client = activeClients.get(user_id);
    try {
      await client.destroy();
    } catch (error) {
      console.error('Error destroying client:', error);
    }
    activeClients.delete(user_id);
  }

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
    // Get the active client
    const client = activeClients.get(user_id);
    
    if (!client) {
      throw new Error('WhatsApp client not found. Please reconnect.');
    }

    // Format phone number for WhatsApp
    const chatId = to.includes('@c.us') ? to : `${to.replace(/[^\d]/g, '')}@c.us`;
    
    // Send the message using the real WhatsApp client
    const sentMessage = await client.sendMessage(chatId, message);
    
    console.log('Message sent successfully:', sentMessage.id._serialized);
    
    return new Response(
      JSON.stringify({
        success: true,
        message_id: sentMessage.id._serialized,
        status: 'sent',
        timestamp: new Date().toISOString(),
        message: 'Message sent successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error(`Failed to send message: ${error.message}`);
  }
}
