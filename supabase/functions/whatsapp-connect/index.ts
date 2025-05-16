
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Baileys, makeWASocket } from "https://esm.sh/@whiskeysockets/baileys@6";
import { encodeBase64, decodeBase64 } from "https://deno.land/std@0.178.0/encoding/base64.ts";
import { crypto } from "https://deno.land/std@0.178.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple encryption using AES-GCM and a secure key
async function encryptSessionData(data: string, userId: string): Promise<{ encryptedData: string, encryptionKey: string }> {
  // Generate a random key for each session
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  // Export the key for storage
  const exportedKey = await crypto.subtle.exportKey("raw", key);
  const encryptionKey = encodeBase64(new Uint8Array(exportedKey));
  
  // Create an initialization vector
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Encrypt the data
  const dataBuffer = new TextEncoder().encode(data);
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    dataBuffer
  );
  
  // Combine IV and encrypted data for storage
  const encryptedArray = new Uint8Array(iv.length + encryptedBuffer.byteLength);
  encryptedArray.set(iv, 0);
  encryptedArray.set(new Uint8Array(encryptedBuffer), iv.length);
  
  return {
    encryptedData: encodeBase64(encryptedArray),
    encryptionKey
  };
}

async function initWhatsAppSession(userId: string): Promise<{ qrCode: string; sessionId: string }> {
  try {
    console.log("Starting WhatsApp session initialization for user:", userId);
    
    // Initialize Baileys socket
    const socket = makeWASocket({
      printQRInTerminal: false,
      browser: ['Lovable Events', 'Chrome', '100.0.0'],
      auth: {
        creds: {} as any,
        keys: {}
      }
    });
    
    // Wait for QR code
    return new Promise((resolve, reject) => {
      // Set a timeout
      const timeout = setTimeout(() => {
        socket.end();
        reject(new Error("QR code generation timed out"));
      }, 30000); // 30 seconds timeout
      
      // Listen for QR code
      socket.ev.on('connection.update', async (update) => {
        const { qr, connection } = update;
        
        if (qr) {
          clearTimeout(timeout);
          
          // Create a session ID
          const sessionId = crypto.randomUUID();
          
          // Encrypt and store the initial session data
          const initialSessionData = JSON.stringify({
            qrCode: qr,
            status: 'pending',
            createdAt: new Date().toISOString()
          });
          
          try {
            const { encryptedData, encryptionKey } = await encryptSessionData(initialSessionData, userId);
            
            // Create Supabase client
            const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
            const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
            const supabase = createClient(supabaseUrl, supabaseKey);
            
            // Store initial session data
            await supabase.from("whatsapp_sessions").insert({
              id: sessionId,
              user_id: userId,
              session_data: { status: 'pending', qrGenerated: true },
              encrypted_session_key: encryptionKey,
              status: 'initializing'
            });
            
            // Return QR code and session ID to client
            resolve({
              qrCode: qr,
              sessionId
            });
            
            // Continue monitoring for connection
            socket.ev.on('connection.update', async (nextUpdate) => {
              const { connection: nextConnection } = nextUpdate;
              
              if (nextConnection === 'open') {
                console.log("WhatsApp connection successful for session:", sessionId);
                
                // Get auth credentials
                const authData = JSON.stringify(socket.authState);
                const { encryptedData: encryptedAuthData } = await encryptSessionData(authData, userId);
                
                // Update session status
                await supabase.from("whatsapp_sessions").update({
                  session_data: { status: 'connected', lastConnection: new Date().toISOString() },
                  status: 'connected',
                  last_connected_at: new Date().toISOString()
                }).eq("id", sessionId);
                
                // Clean up
                socket.end();
              }
              
              if (nextConnection === 'close') {
                console.log("WhatsApp connection closed for session:", sessionId);
                
                // Update session status
                await supabase.from("whatsapp_sessions").update({
                  session_data: { status: 'disconnected', lastDisconnect: new Date().toISOString() },
                  status: 'disconnected'
                }).eq("id", sessionId);
              }
            });
          } catch (error) {
            console.error("Error storing session:", error);
            reject(error);
          }
        }
        
        if (connection === 'close') {
          clearTimeout(timeout);
          reject(new Error("Connection closed before QR code was scanned"));
        }
      });
    });
  } catch (error) {
    console.error("Error initializing WhatsApp session:", error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Not authorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Check if the token is valid
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Not authorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Initialize WhatsApp session
    const { qrCode, sessionId } = await initWhatsAppSession(user.id);
    
    return new Response(JSON.stringify({ qrCode, sessionId }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
