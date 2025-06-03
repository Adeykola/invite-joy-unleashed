
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, sessionData, userId } = await req.json();

    switch (action) {
      case 'create_session':
        const { data: session, error: sessionError } = await supabase
          .from('whatsapp_sessions')
          .insert({
            user_id: userId,
            session_data: sessionData,
            status: 'connecting',
            encrypted_session_key: crypto.randomUUID()
          })
          .select()
          .single();

        if (sessionError) throw sessionError;

        return new Response(JSON.stringify({ session }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'update_status':
        const { sessionId, status, connectionData } = sessionData;
        
        const updateData: any = { status, updated_at: new Date().toISOString() };
        if (status === 'connected') {
          updateData.last_connected_at = new Date().toISOString();
          updateData.display_name = connectionData?.displayName;
          updateData.phone_number = connectionData?.phoneNumber;
        }

        const { data: updatedSession, error: updateError } = await supabase
          .from('whatsapp_sessions')
          .update(updateData)
          .eq('id', sessionId)
          .select()
          .single();

        if (updateError) throw updateError;

        return new Response(JSON.stringify({ session: updatedSession }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        throw new Error('Invalid action');
    }
  } catch (error: any) {
    console.error('WhatsApp session error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
