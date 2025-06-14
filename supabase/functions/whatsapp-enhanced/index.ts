
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
      case 'process_queue':
        return await handleProcessQueue(supabase, { ...params, user_id: userId });
      case 'send_message':
        return await handleSendMessage(supabase, { ...params, user_id: userId });
      case 'status':
        return await handleStatus(supabase, { ...params, user_id: userId });
      case 'disconnect':
        return await handleDisconnect(supabase, { ...params, user_id: userId });
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
      // For real WhatsApp Web integration, we would use whatsapp-web.js here
      // This is a placeholder for the actual implementation
      
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
            session_id: existingSession.id
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create new session
      const sessionId = crypto.randomUUID();
      
      // In a real implementation, we would:
      // 1. Initialize WhatsApp Web client
      // 2. Generate real QR code from WhatsApp
      // 3. Wait for QR scan and authentication
      // 4. Store session data securely
      
      const { error: sessionError } = await supabase
        .from('whatsapp_sessions')
        .upsert({
          id: sessionId,
          user_id: user_id,
          connection_type: 'web',
          status: 'connecting',
          session_data: { 
            session_id: sessionId,
            initialized_at: new Date().toISOString()
          },
          encrypted_session_key: sessionId,
          capabilities: ['text', 'image', 'video', 'audio', 'document'],
          connection_attempts: 1,
          last_connected_at: new Date().toISOString()
        });

      if (sessionError) throw sessionError;

      // For now, return a connecting status
      // In real implementation, this would return the actual QR code from WhatsApp
      return new Response(
        JSON.stringify({
          status: 'connecting',
          session_id: sessionId,
          connection_type: 'web',
          message: 'WhatsApp Web connection initialized. Please scan QR code when available.'
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

async function handleProcessQueue(supabase: any, params: any) {
  const { queue_ids, user_id } = params;
  
  console.log('Processing message queue:', queue_ids, 'for user:', user_id);

  if (!queue_ids || !Array.isArray(queue_ids)) {
    throw new Error('Invalid queue_ids parameter');
  }

  // Fetch messages from queue
  const { data: messages, error: fetchError } = await supabase
    .from('whatsapp_message_queue')
    .select(`
      *,
      media:whatsapp_media_uploads(*)
    `)
    .in('id', queue_ids)
    .eq('user_id', user_id)
    .eq('status', 'pending');

  if (fetchError) throw fetchError;

  // Get user's WhatsApp session
  const { data: session } = await supabase
    .from('whatsapp_sessions')
    .select('*')
    .eq('user_id', user_id)
    .eq('status', 'connected')
    .maybeSingle();

  if (!session) {
    throw new Error('No active WhatsApp session found. Please connect your WhatsApp first.');
  }

  const results = [];

  for (const message of messages) {
    try {
      console.log('Processing message:', message.id);

      // Update status to processing
      await supabase
        .from('whatsapp_message_queue')
        .update({ status: 'processing', attempts: message.attempts + 1 })
        .eq('id', message.id);

      // Here we would implement actual message sending based on connection type
      let deliveryResult;
      
      if (session.connection_type === 'business_api') {
        deliveryResult = await sendViaBusinessAPI(message, session);
      } else {
        deliveryResult = await sendViaWhatsAppWeb(message, session);
      }

      // Update message status to sent
      await supabase
        .from('whatsapp_message_queue')
        .update({ 
          status: 'sent', 
          sent_at: new Date().toISOString() 
        })
        .eq('id', message.id);

      // Record delivery status
      await supabase
        .from('whatsapp_delivery_status')
        .insert({
          message_queue_id: message.id,
          phone_number: message.recipient_phone,
          status: 'sent',
          webhook_data: deliveryResult
        });

      results.push({
        message_id: message.id,
        status: 'sent',
        delivery_id: deliveryResult.delivery_id
      });

    } catch (error) {
      console.error('Error processing message:', message.id, error);
      
      // Update message status to failed
      await supabase
        .from('whatsapp_message_queue')
        .update({ 
          status: 'failed',
          error_message: error.message,
          attempts: message.attempts + 1
        })
        .eq('id', message.id);

      results.push({
        message_id: message.id,
        status: 'failed',
        error: error.message
      });
    }
  }

  return new Response(
    JSON.stringify({ results }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function sendViaBusinessAPI(message: any, session: any) {
  const businessApiToken = Deno.env.get('WHATSAPP_BUSINESS_API_TOKEN');
  const phoneNumberId = session.session_data.phone_number_id;
  
  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
  
  const payload = {
    messaging_product: "whatsapp",
    to: message.recipient_phone,
    type: "text",
    text: {
      body: message.message_content
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${businessApiToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Business API error: ${error}`);
  }

  const result = await response.json();
  
  return {
    delivery_id: result.messages[0].id,
    platform: 'business_api',
    timestamp: new Date().toISOString()
  };
}

async function sendViaWhatsAppWeb(message: any, session: any) {
  // This would integrate with the actual WhatsApp Web client
  // For now, we'll simulate the process
  throw new Error('WhatsApp Web message sending requires whatsapp-web.js integration. Please use Business API or implement WhatsApp Web client.');
}

async function handleSendMessage(supabase: any, params: any) {
  const { user_id, phone_number, message, media_id, event_id } = params;
  
  console.log('Sending individual WhatsApp message for user:', user_id);

  // Add message to queue
  const { data: queueData, error: queueError } = await supabase
    .from('whatsapp_message_queue')
    .insert({
      user_id,
      recipient_phone: phone_number,
      message_content: message,
      media_id: media_id || null
    })
    .select()
    .single();

  if (queueError) throw queueError;

  // Process immediately
  return await handleProcessQueue(supabase, { queue_ids: [queueData.id], user_id });
}

async function handleStatus(supabase: any, params: any) {
  const { user_id } = params;
  
  console.log('Checking WhatsApp status for user:', user_id);

  const { data: session, error } = await supabase
    .from('whatsapp_sessions')
    .select('*')
    .eq('user_id', user_id)
    .maybeSingle();

  if (error) throw error;

  return new Response(
    JSON.stringify({
      status: session?.status || 'disconnected',
      connection_type: session?.connection_type || 'web',
      last_connected: session?.last_connected_at,
      capabilities: session?.capabilities || ['text']
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
    JSON.stringify({ status: 'disconnected' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
