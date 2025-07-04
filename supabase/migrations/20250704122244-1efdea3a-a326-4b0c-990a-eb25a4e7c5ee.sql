
-- Add advanced event management columns
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS template_name TEXT,
ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS max_guests_per_rsvp INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS require_approval BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add advanced RSVP columns
ALTER TABLE public.rsvps 
ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT,
ADD COLUMN IF NOT EXISTS meal_choice TEXT,
ADD COLUMN IF NOT EXISTS needs_accommodation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS custom_responses JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS plus_one_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ticket_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS qr_code_data TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2) DEFAULT 0.00;

-- Create event templates table
CREATE TABLE IF NOT EXISTS public.event_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  event_data JSONB NOT NULL,
  category TEXT DEFAULT 'general',
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create email templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  template_type TEXT DEFAULT 'invitation',
  variables JSONB DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  event_id UUID REFERENCES public.events,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for event templates
ALTER TABLE public.event_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own event templates" ON public.event_templates
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public event templates" ON public.event_templates
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

-- Add RLS policies for email templates
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own email templates" ON public.email_templates
  FOR ALL USING (auth.uid() = user_id);

-- Add RLS policies for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

-- Create function to generate ticket codes
CREATE OR REPLACE FUNCTION generate_ticket_code() RETURNS TEXT AS $$
BEGIN
  RETURN 'TKT-' || UPPER(substring(gen_random_uuid()::text from 1 for 8));
END;
$$ LANGUAGE plpgsql;

-- Create trigger to generate ticket codes for RSVPs
CREATE OR REPLACE FUNCTION set_rsvp_ticket_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_code IS NULL THEN
    NEW.ticket_code := generate_ticket_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_rsvp_ticket_code_trigger ON public.rsvps;
CREATE TRIGGER set_rsvp_ticket_code_trigger
  BEFORE INSERT ON public.rsvps
  FOR EACH ROW
  EXECUTE FUNCTION set_rsvp_ticket_code();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_event_type ON public.events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_is_template ON public.events(is_template);
CREATE INDEX IF NOT EXISTS idx_events_tags ON public.events USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_rsvps_ticket_code ON public.rsvps(ticket_code);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_unread ON public.notifications(user_id, is_read);
