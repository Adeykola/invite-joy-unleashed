
-- Phase 1: Database Enhancements for Complete Real-Data Integration

-- Add missing columns to RSVPs table for check-in functionality
ALTER TABLE public.rsvps 
ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS check_in_time TIMESTAMP WITH TIME ZONE;

-- Create analytics views for real-time metrics
CREATE OR REPLACE VIEW public.platform_analytics AS
SELECT 
  (SELECT COUNT(*) FROM public.events) as total_events,
  (SELECT COUNT(*) FROM public.rsvps WHERE response_status = 'confirmed') as total_confirmed_rsvps,
  (SELECT COUNT(*) FROM public.rsvps WHERE checked_in = true) as total_checked_in,
  (SELECT COUNT(DISTINCT host_id) FROM public.events WHERE host_id IS NOT NULL) as active_hosts,
  (SELECT COUNT(*) FROM public.profiles) as total_users,
  (SELECT COUNT(*) FROM public.events WHERE date >= NOW()) as upcoming_events,
  (SELECT COUNT(*) FROM public.events WHERE date < NOW()) as past_events;

-- Create event performance analytics view
CREATE OR REPLACE VIEW public.event_performance AS
SELECT 
  e.id,
  e.title,
  e.date,
  e.capacity,
  COUNT(r.id) as total_rsvps,
  COUNT(CASE WHEN r.response_status = 'confirmed' THEN 1 END) as confirmed_rsvps,
  COUNT(CASE WHEN r.response_status = 'declined' THEN 1 END) as declined_rsvps,
  COUNT(CASE WHEN r.response_status = 'pending' THEN 1 END) as pending_rsvps,
  COUNT(CASE WHEN r.checked_in = true THEN 1 END) as checked_in_count,
  CASE 
    WHEN e.capacity > 0 THEN 
      ROUND((COUNT(CASE WHEN r.response_status = 'confirmed' THEN 1 END)::DECIMAL / e.capacity) * 100, 2)
    ELSE 0 
  END as fill_rate,
  CASE 
    WHEN COUNT(r.id) > 0 THEN 
      ROUND((COUNT(CASE WHEN r.response_status IN ('confirmed', 'declined') THEN 1 END)::DECIMAL / COUNT(r.id)) * 100, 2)
    ELSE 0 
  END as response_rate
FROM public.events e
LEFT JOIN public.rsvps r ON e.id = r.event_id
GROUP BY e.id, e.title, e.date, e.capacity
ORDER BY e.date DESC;

-- Create communication tracking table
CREATE TABLE IF NOT EXISTS public.communication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  event_id UUID REFERENCES public.events,
  recipient_email TEXT,
  recipient_phone TEXT,
  message_type TEXT NOT NULL, -- 'email', 'whatsapp', 'sms'
  template_id UUID,
  subject TEXT,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed'
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for communication logs
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their communication logs" ON public.communication_logs
  FOR ALL USING (auth.uid() = user_id);

-- Create payment tracking table for future Stripe integration
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  event_id UUID REFERENCES public.events NOT NULL,
  rsvp_id UUID REFERENCES public.rsvps,
  stripe_payment_id TEXT UNIQUE,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'succeeded', 'failed', 'refunded'
  payment_method TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Event hosts can view event payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE id = payments.event_id AND host_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rsvps_checked_in ON public.rsvps(checked_in, check_in_time);
CREATE INDEX IF NOT EXISTS idx_communication_logs_user_event ON public.communication_logs(user_id, event_id);
CREATE INDEX IF NOT EXISTS idx_payments_event_status ON public.payments(event_id, status);

-- Update existing functions to handle new check-in functionality
CREATE OR REPLACE FUNCTION public.get_event_check_in_stats(p_event_id UUID)
RETURNS TABLE(
  total_rsvps BIGINT,
  confirmed_rsvps BIGINT,
  checked_in_count BIGINT,
  check_in_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_rsvps,
    COUNT(CASE WHEN response_status = 'confirmed' THEN 1 END) as confirmed_rsvps,
    COUNT(CASE WHEN checked_in = true THEN 1 END) as checked_in_count,
    CASE 
      WHEN COUNT(CASE WHEN response_status = 'confirmed' THEN 1 END) > 0 THEN
        ROUND((COUNT(CASE WHEN checked_in = true THEN 1 END)::DECIMAL / 
               COUNT(CASE WHEN response_status = 'confirmed' THEN 1 END)) * 100, 2)
      ELSE 0
    END as check_in_rate
  FROM public.rsvps 
  WHERE event_id = p_event_id;
END;
$$;

-- Function to process bulk check-ins
CREATE OR REPLACE FUNCTION public.bulk_check_in(p_ticket_codes TEXT[], p_event_id UUID)
RETURNS TABLE(
  ticket_code TEXT,
  guest_name TEXT,
  status TEXT,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  code TEXT;
  rsvp_record RECORD;
BEGIN
  FOREACH code IN ARRAY p_ticket_codes
  LOOP
    -- Find the RSVP
    SELECT * INTO rsvp_record 
    FROM public.rsvps 
    WHERE ticket_code = code AND event_id = p_event_id;
    
    IF NOT FOUND THEN
      RETURN QUERY SELECT code, ''::TEXT, 'error'::TEXT, 'Ticket not found'::TEXT;
      CONTINUE;
    END IF;
    
    IF rsvp_record.response_status != 'confirmed' THEN
      RETURN QUERY SELECT code, rsvp_record.guest_name, 'error'::TEXT, 'Ticket not confirmed'::TEXT;
      CONTINUE;
    END IF;
    
    IF rsvp_record.checked_in THEN
      RETURN QUERY SELECT code, rsvp_record.guest_name, 'warning'::TEXT, 'Already checked in'::TEXT;
      CONTINUE;
    END IF;
    
    -- Perform check-in
    UPDATE public.rsvps 
    SET checked_in = true, check_in_time = NOW()
    WHERE id = rsvp_record.id;
    
    RETURN QUERY SELECT code, rsvp_record.guest_name, 'success'::TEXT, 'Checked in successfully'::TEXT;
  END LOOP;
END;
$$;

-- Create updated trigger for updated_at timestamps on new tables
CREATE OR REPLACE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
