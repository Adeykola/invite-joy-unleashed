
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Baileys, makeWASocket } from "https://esm.sh/@whiskeysockets/baileys@6";
import { decodeBase64 } from "https://deno.land/std@0.178.0/encoding/base64.ts";
import { crypto } from "https://deno.land/std@0.178.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function decryptSessionData(encryptedData: string, encryptionKey: string): Promise<any> {
  try {
    // Decode the base64 encrypted data
    const encryptedBuffer = decodeBase64(encryptedData);
    
    // Extract the IV (first 12 bytes) and the encrypted data
    const iv = encryptedBuffer.slice(0, 12);
    const data = encryptedBuffer.slice(12);
    
    // Import the encryption key
    const keyData = decodeBase64(encryptionKey);
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );
    
    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );
    
    // Convert to string and parse as JSON
    const decryptedText = new TextDecoder().decode(decryptedBuffer);
    return JSON.parse(decryptedText);
  } catch (error) {
    console.error("Error decrypting session data:", error);
    throw new Error("Failed to decrypt session data");
  }
}

async function sendWhatsAppMessage(req: Request): Promise<Response> {
  try {
    // Parse request body
    const { sessionId, recipientPhone, message, senderName } = await req.json();
    
    if (!sessionId || !recipientPhone || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get session data
    const { data: sessionData, error: sessionError } = await supabase
      .from("whatsapp_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();
    
    if (sessionError || !sessionData) {
      return new Response(JSON.stringify({ error: 'Session not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Decrypt session auth data
    const authState = await decryptSessionData(
      sessionData.session_data,
      sessionData.encrypted_session_key
    );
    
    // Initialize WhatsApp socket with auth data
    const socket = makeWASocket({
      auth: authState,
      browser: ['Lovable Events', 'Chrome', '100.0.0']
    });
    
    // Format phone number (ensure it has country code)
    let formattedPhone = recipientPhone.replace(/\D/g, '');
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }
    
    // Send message
    await socket.sendMessage(formattedPhone + '@s.whatsapp.net', {
      text: message
    });
    
    // Close the connection
    socket.end();
    
    return new Response(JSON.stringify({ success: true, status: 'message_sent' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Get authorization header
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Not authorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  // Create Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Check if the token is valid
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Not authorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  // Process the request based on the HTTP method
  if (req.method === 'POST') {
    return sendWhatsAppMessage(req);
  }
  
  // Handle unsupported methods
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});
