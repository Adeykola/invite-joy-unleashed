
-- Phase 2: Enhanced Guest Management with Real Data Integration

-- Add VIP and category tracking to event_guests table
ALTER TABLE public.event_guests 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS plus_one_allowed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS plus_one_name TEXT,
ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add trigger for updated_at timestamp
CREATE OR REPLACE TRIGGER update_event_guests_updated_at
  BEFORE UPDATE ON public.event_guests
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- Create function to get detailed guest information with RSVP status
CREATE OR REPLACE FUNCTION public.get_event_guests_detailed(p_event_id UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  email TEXT,
  phone_number TEXT,
  category TEXT,
  is_vip BOOLEAN,
  plus_one_allowed BOOLEAN,
  plus_one_name TEXT,
  dietary_restrictions TEXT,
  notes TEXT,
  invite_sent BOOLEAN,
  invited_at TIMESTAMP WITH TIME ZONE,
  rsvp_status TEXT,
  rsvp_date TIMESTAMP WITH TIME ZONE,
  ticket_code TEXT,
  checked_in BOOLEAN,
  payment_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    eg.id,
    eg.name,
    eg.email,
    eg.phone_number,
    eg.category,
    eg.is_vip,
    eg.plus_one_allowed,
    eg.plus_one_name,
    eg.dietary_restrictions,
    eg.notes,
    eg.invite_sent,
    eg.invited_at,
    r.response_status as rsvp_status,
    r.created_at as rsvp_date,
    r.ticket_code,
    COALESCE(r.checked_in, false) as checked_in,
    COALESCE(r.payment_status, 'pending') as payment_status
  FROM public.event_guests eg
  LEFT JOIN public.rsvps r ON eg.email = r.guest_email AND eg.event_id = r.event_id
  WHERE eg.event_id = p_event_id
  ORDER BY eg.name ASC;
END;
$$;

-- Create function to bulk invite guests
CREATE OR REPLACE FUNCTION public.bulk_invite_guests(p_event_id UUID, p_guest_emails TEXT[])
RETURNS TABLE(
  email TEXT,
  status TEXT,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  guest_email TEXT;
  guest_record RECORD;
BEGIN
  FOREACH guest_email IN ARRAY p_guest_emails
  LOOP
    -- Check if guest already exists for this event
    SELECT * INTO guest_record 
    FROM public.event_guests 
    WHERE event_id = p_event_id AND email = guest_email;
    
    IF FOUND THEN
      -- Update invite status
      UPDATE public.event_guests 
      SET invite_sent = true, invited_at = NOW()
      WHERE id = guest_record.id;
      
      RETURN QUERY SELECT guest_email, 'updated'::TEXT, 'Invite status updated'::TEXT;
    ELSE
      RETURN QUERY SELECT guest_email, 'error'::TEXT, 'Guest not found in event'::TEXT;
    END IF;
  END LOOP;
END;
$$;

-- Create enhanced guest statistics function
CREATE OR REPLACE FUNCTION public.get_event_guest_stats(p_event_id UUID)
RETURNS TABLE(
  total_guests BIGINT,
  invited_guests BIGINT,
  rsvp_confirmed BIGINT,
  rsvp_declined BIGINT,
  rsvp_pending BIGINT,
  vip_guests BIGINT,
  checked_in_guests BIGINT,
  pending_invites BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(eg.id) as total_guests,
    COUNT(CASE WHEN eg.invite_sent = true THEN 1 END) as invited_guests,
    COUNT(CASE WHEN r.response_status = 'confirmed' THEN 1 END) as rsvp_confirmed,
    COUNT(CASE WHEN r.response_status = 'declined' THEN 1 END) as rsvp_declined,
    COUNT(CASE WHEN r.response_status = 'pending' THEN 1 END) as rsvp_pending,
    COUNT(CASE WHEN eg.is_vip = true THEN 1 END) as vip_guests,
    COUNT(CASE WHEN r.checked_in = true THEN 1 END) as checked_in_guests,
    COUNT(CASE WHEN eg.invite_sent = false OR eg.invite_sent IS NULL THEN 1 END) as pending_invites
  FROM public.event_guests eg
  LEFT JOIN public.rsvps r ON eg.email = r.guest_email AND eg.event_id = r.event_id
  WHERE eg.event_id = p_event_id;
END;
$$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_guests_event_category ON public.event_guests(event_id, category);
CREATE INDEX IF NOT EXISTS idx_event_guests_vip ON public.event_guests(event_id, is_vip);
CREATE INDEX IF NOT EXISTS idx_event_guests_invite_status ON public.event_guests(event_id, invite_sent);
