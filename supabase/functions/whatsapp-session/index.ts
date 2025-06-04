
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { action, user_id, phone_number, message, event_id } = await req.json()

    switch (action) {
      case 'start':
        return await startWhatsAppSession(supabaseClient, user_id)
      case 'status':
        return await getConnectionStatus(supabaseClient, user_id)
      case 'disconnect':
        return await disconnectWhatsApp(supabaseClient, user_id)
      case 'send_message':
        return await sendMessage(supabaseClient, user_id, phone_number, message, event_id)
      case 'broadcast_to_event':
        return await broadcastToEvent(supabaseClient, user_id, message, event_id)
      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    console.error('WhatsApp session error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

async function startWhatsAppSession(supabaseClient: any, userId: string) {
  // Check if already connected
  const { data: existingSession } = await supabaseClient
    .from('whatsapp_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'connected')
    .maybeSingle()

  if (existingSession) {
    return new Response(
      JSON.stringify({ status: 'connected', message: 'Already connected' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // For demo purposes, generate a mock QR code
  // In a real implementation, you would integrate with WhatsApp Web API
  const mockQRCode = generateMockQRCode()

  // Create or update session
  const { error } = await supabaseClient
    .from('whatsapp_sessions')
    .upsert({
      user_id: userId,
      status: 'connecting',
      session_data: { qr_generated_at: new Date().toISOString() },
      encrypted_session_key: 'mock_session_key_' + Date.now(),
      connection_attempts: 1
    })

  if (error) throw error

  return new Response(
    JSON.stringify({ qr: mockQRCode, status: 'connecting' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getConnectionStatus(supabaseClient: any, userId: string) {
  const { data: session } = await supabaseClient
    .from('whatsapp_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!session) {
    return new Response(
      JSON.stringify({ status: 'disconnected' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Simulate connection after 10 seconds for demo
  const sessionAge = Date.now() - new Date(session.created_at).getTime()
  if (session.status === 'connecting' && sessionAge > 10000) {
    // Update to connected
    await supabaseClient
      .from('whatsapp_sessions')
      .update({
        status: 'connected',
        last_connected_at: new Date().toISOString(),
        display_name: 'Demo WhatsApp',
        phone_number: '+1234567890'
      })
      .eq('id', session.id)

    return new Response(
      JSON.stringify({ status: 'connected' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ 
      status: session.status,
      qr: session.status === 'connecting' ? generateMockQRCode() : null
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function disconnectWhatsApp(supabaseClient: any, userId: string) {
  const { error } = await supabaseClient
    .from('whatsapp_sessions')
    .update({ status: 'disconnected' })
    .eq('user_id', userId)

  if (error) throw error

  return new Response(
    JSON.stringify({ status: 'disconnected' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function sendMessage(supabaseClient: any, userId: string, phoneNumber: string, message: string, eventId?: string) {
  // Check if user has an active WhatsApp session
  const { data: session } = await supabaseClient
    .from('whatsapp_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'connected')
    .maybeSingle()

  if (!session) {
    throw new Error('WhatsApp not connected. Please connect first.')
  }

  // In a real implementation, you would send the actual WhatsApp message here
  console.log(`Sending message to ${phoneNumber}: ${message}`)

  // Log the message for demo purposes
  const { error } = await supabaseClient
    .from('whatsapp_broadcasts')
    .insert({
      user_id: userId,
      name: `Message to ${phoneNumber}`,
      template_id: null, // For direct messages
      event_id: eventId,
      status: 'sent',
      total_recipients: 1,
      sent_count: 1,
      delivered_count: 1
    })

  if (error) throw error

  return new Response(
    JSON.stringify({ success: true, message: 'Message sent successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function broadcastToEvent(supabaseClient: any, userId: string, message: string, eventId: string) {
  // Check if user has an active WhatsApp session
  const { data: session } = await supabaseClient
    .from('whatsapp_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'connected')
    .maybeSingle()

  if (!session) {
    throw new Error('WhatsApp not connected. Please connect first.')
  }

  // Get event guests
  const { data: rsvps } = await supabaseClient
    .from('rsvps')
    .select('guest_name, guest_email, response_status')
    .eq('event_id', eventId)
    .eq('response_status', 'confirmed')

  if (!rsvps || rsvps.length === 0) {
    throw new Error('No confirmed guests found for this event.')
  }

  // Create broadcast record
  const { data: broadcast, error: broadcastError } = await supabaseClient
    .from('whatsapp_broadcasts')
    .insert({
      user_id: userId,
      name: `Event Broadcast - ${new Date().toLocaleDateString()}`,
      template_id: null,
      event_id: eventId,
      status: 'sent',
      total_recipients: rsvps.length,
      sent_count: rsvps.length,
      delivered_count: rsvps.length
    })
    .select()
    .single()

  if (broadcastError) throw broadcastError

  // Create recipient records
  const recipients = rsvps.map(rsvp => ({
    broadcast_id: broadcast.id,
    phone_number: '+1234567890', // Mock phone number
    recipient_data: { name: rsvp.guest_name, email: rsvp.guest_email },
    status: 'delivered',
    sent_at: new Date().toISOString(),
    delivered_at: new Date().toISOString()
  }))

  const { error: recipientsError } = await supabaseClient
    .from('broadcast_recipients')
    .insert(recipients)

  if (recipientsError) throw recipientsError

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: `Broadcast sent to ${rsvps.length} guests`,
      recipients_count: rsvps.length
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

function generateMockQRCode(): string {
  // Generate a simple base64 encoded QR code placeholder
  // In a real implementation, you would generate an actual QR code
  const canvas = new Array(200).fill(0).map(() => 
    new Array(200).fill(0).map(() => Math.random() > 0.5 ? 1 : 0)
  )
  
  // Convert to base64 (simplified mock)
  return btoa("mock_qr_code_data_" + Date.now())
}
