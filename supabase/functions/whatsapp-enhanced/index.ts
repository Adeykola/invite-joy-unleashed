
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

    switch (action) {
      case 'initialize':
        return await handleInitialize(supabase, params);
      case 'process_queue':
        return await handleProcessQueue(supabase, params);
      case 'send_message':
        return await handleSendMessage(supabase, params);
      case 'status':
        return await handleStatus(supabase, params);
      case 'disconnect':
        return await handleDisconnect(supabase, params);
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
  
  console.log('Initializing WhatsApp connection:', connection_type);

  // Get current user from JWT if user_id not provided
  const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!user_id && !authHeader) {
    throw new Error('Authentication required');
  }

  let userId = user_id;
  if (!userId) {
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader);
    if (authError || !user) throw new Error('Invalid authentication');
    userId = user.id;
  }

  // For demo purposes, we'll simulate the initialization process
  if (connection_type === 'web') {
    // Simulate WhatsApp Web QR generation
    const sessionId = Math.random().toString(36).substring(7);
    const qrData = {
      action: 'whatsapp_web_connect',
      timestamp: Date.now(),
      session_id: sessionId,
      user_id: userId
    };

    // Create or update session record
    const { error: sessionError } = await supabase
      .from('whatsapp_sessions')
      .upsert({
        user_id: userId,
        connection_type: 'web',
        status: 'connecting',
        session_data: { session_id: sessionId },
        encrypted_session_key: sessionId,
        capabilities: ['text', 'image', 'video', 'audio', 'document'],
        connection_attempts: 1,
        last_connected_at: new Date().toISOString()
      });

    if (sessionError) throw sessionError;

    // Generate QR code URL (in production, this would be actual WhatsApp Web QR)
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(JSON.stringify(qrData))}`;

    return new Response(
      JSON.stringify({
        status: 'connecting',
        qrCode,
        session_id: sessionId,
        connection_type: 'web'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } else {
    // Business API initialization
    const { error: sessionError } = await supabase
      .from('whatsapp_sessions')
      .upsert({
        user_id: userId,
        connection_type: 'business_api',
        status: 'connected', // Business API is typically pre-configured
        session_data: { api_configured: true },
        encrypted_session_key: 'business_api_key',
        capabilities: ['text', 'template', 'image', 'video', 'audio', 'document'],
        connection_attempts: 1,
        last_connected_at: new Date().toISOString()
      });

    if (sessionError) throw sessionError;

    return new Response(
      JSON.stringify({
        status: 'connected',
        connection_type: 'business_api',
        message: 'Business API configured successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleProcessQueue(supabase: any, params: any) {
  const { queue_ids } = params;
  
  console.log('Processing message queue:', queue_ids);

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
    .eq('status', 'pending');

  if (fetchError) throw fetchError;

  const results = [];

  for (const message of messages) {
    try {
      console.log('Processing message:', message.id);

      // Update status to processing
      await supabase
        .from('whatsapp_message_queue')
        .update({ status: 'processing', attempts: message.attempts + 1 })
        .eq('id', message.id);

      // Simulate message sending (in production, this would use actual WhatsApp API)
      const deliveryId = Math.random().toString(36).substring(7);
      
      // Log the demo message send
      console.log('Demo: Sending WhatsApp message', {
        to: message.recipient_phone,
        content: message.message_content,
        media: message.media ? message.media.file_name : null,
        delivery_id: deliveryId
      });

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
          webhook_data: { demo_mode: true, delivery_id: deliveryId }
        });

      results.push({
        message_id: message.id,
        status: 'sent',
        delivery_id: deliveryId
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

async function handleSendMessage(supabase: any, params: any) {
  const { user_id, phone_number, message, media_id, event_id } = params;
  
  console.log('Sending individual WhatsApp message');

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
  const processResult = await handleProcessQueue(supabase, { queue_ids: [queueData.id] });
  
  return processResult;
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
