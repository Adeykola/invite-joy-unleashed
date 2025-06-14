
-- First, ensure the profiles table has the correct structure and trigger
-- Create or replace the function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::text, 'user')
  );
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add essential RLS policies for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Add RLS policies for events table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view events" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Hosts can manage their events" ON public.events
  FOR ALL USING (auth.uid() = host_id);

-- Add RLS policies for rsvps table
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view rsvps" ON public.rsvps
  FOR SELECT USING (true);

CREATE POLICY "Everyone can create rsvps" ON public.rsvps
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Event hosts can manage rsvps" ON public.rsvps
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = rsvps.event_id 
      AND events.host_id = auth.uid()
    )
  );

-- Add RLS for event_guests table
ALTER TABLE public.event_guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Event hosts can manage guests" ON public.event_guests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = event_guests.event_id 
      AND events.host_id = auth.uid()
    )
  );

-- Add RLS for WhatsApp related tables
ALTER TABLE public.whatsapp_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own WhatsApp sessions" ON public.whatsapp_sessions
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own message templates" ON public.message_templates
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.whatsapp_broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own broadcasts" ON public.whatsapp_broadcasts
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.broadcast_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view broadcast recipients" ON public.broadcast_recipients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.whatsapp_broadcasts 
      WHERE whatsapp_broadcasts.id = broadcast_recipients.broadcast_id 
      AND whatsapp_broadcasts.user_id = auth.uid()
    )
  );
