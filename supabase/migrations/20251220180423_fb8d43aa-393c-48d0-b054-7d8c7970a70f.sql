-- =====================================================
-- SECURITY FIX: Comprehensive Security Hardening
-- Addresses 5 error-level security issues
-- =====================================================

-- =====================================================
-- 1. CREATE USER ROLES TABLE (Separate from profiles)
-- =====================================================

-- Create user_roles table (only for users that exist in auth.users)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Migrate existing roles from profiles to user_roles (only for valid users)
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, COALESCE(p.role, 'user'::user_role)
FROM public.profiles p
WHERE p.id IS NOT NULL
  AND EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id)
ON CONFLICT (user_id, role) DO NOTHING;

-- =====================================================
-- 2. CREATE SECURITY DEFINER FUNCTION FOR ROLE CHECKS
-- =====================================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's role (falls back to profiles if not in user_roles)
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1),
    (SELECT role FROM public.profiles WHERE id = _user_id),
    'user'::public.user_role
  )
$$;

-- =====================================================
-- 3. RLS POLICIES FOR USER_ROLES TABLE
-- =====================================================

-- Users can view their own roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only admins can modify roles (using profiles table for bootstrap)
CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
    OR public.has_role(auth.uid(), 'admin')
  );

-- =====================================================
-- 4. ADMIN-ONLY RPC FUNCTION FOR ROLE UPDATES
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_user_role(
  p_user_id UUID,
  p_new_role TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count INT;
  current_role public.user_role;
  is_admin BOOLEAN;
BEGIN
  -- Check if caller is admin (check both tables for compatibility)
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ) OR public.has_role(auth.uid(), 'admin') INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only administrators can change user roles';
  END IF;

  -- Validate new role
  IF p_new_role NOT IN ('user', 'host', 'admin') THEN
    RAISE EXCEPTION 'Invalid role: %', p_new_role;
  END IF;

  -- Prevent removing last admin
  IF auth.uid() = p_user_id THEN
    SELECT role INTO current_role FROM public.user_roles WHERE user_id = p_user_id;
    IF current_role IS NULL THEN
      SELECT role INTO current_role FROM public.profiles WHERE id = p_user_id;
    END IF;
    SELECT COUNT(*) INTO admin_count FROM public.profiles WHERE role = 'admin';
    
    IF current_role = 'admin' AND p_new_role != 'admin' AND admin_count <= 1 THEN
      RAISE EXCEPTION 'Cannot remove last admin';
    END IF;
  END IF;

  -- Upsert the role in user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, p_new_role::public.user_role)
  ON CONFLICT (user_id, role) 
  DO UPDATE SET role = p_new_role::public.user_role, updated_at = now();

  -- Also update profiles table for backward compatibility
  UPDATE public.profiles 
  SET role = p_new_role::public.user_role
  WHERE id = p_user_id;

  -- Log the action
  INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, details)
  VALUES (
    auth.uid(),
    'role_changed',
    'user',
    p_user_id::TEXT,
    jsonb_build_object('new_role', p_new_role)
  );
END;
$$;

-- =====================================================
-- 5. FIX PROFILES UPDATE POLICY (Prevent role escalation)
-- =====================================================

-- Drop the permissive update policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create restricted update policy (excludes role column from user updates)
CREATE POLICY "Users can update own profile info" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    -- Ensure role hasn't changed (prevent privilege escalation)
    role IS NOT DISTINCT FROM (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- Admins can update any profile including roles
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- 6. FIX RSVPS PUBLIC SELECT POLICY
-- =====================================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Everyone can view rsvps" ON public.rsvps;

-- Guests can view their own RSVPs (by email match)
CREATE POLICY "Guests can view own rsvps" ON public.rsvps
  FOR SELECT
  USING (
    guest_email = (auth.jwt() ->> 'email')
  );

-- Admins can view all RSVPs
CREATE POLICY "Admins can view all rsvps" ON public.rsvps
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- 7. DROP SECURITY DEFINER VIEWS (Replace with Functions)
-- =====================================================

DROP VIEW IF EXISTS public.platform_analytics;
DROP VIEW IF EXISTS public.event_performance;

-- =====================================================
-- 8. CREATE SECURE RPC FUNCTIONS FOR ANALYTICS
-- =====================================================

-- Platform analytics - Admin only
CREATE OR REPLACE FUNCTION public.get_platform_analytics()
RETURNS TABLE(
  total_events BIGINT,
  total_confirmed_rsvps BIGINT,
  total_checked_in BIGINT,
  active_hosts BIGINT,
  total_users BIGINT,
  upcoming_events BIGINT,
  past_events BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Admin-only access
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.events)::BIGINT,
    (SELECT COUNT(*) FROM public.rsvps WHERE response_status = 'confirmed')::BIGINT,
    (SELECT COUNT(*) FROM public.rsvps WHERE checked_in = true)::BIGINT,
    (SELECT COUNT(DISTINCT host_id) FROM public.events WHERE host_id IS NOT NULL)::BIGINT,
    (SELECT COUNT(*) FROM public.profiles)::BIGINT,
    (SELECT COUNT(*) FROM public.events WHERE date >= NOW())::BIGINT,
    (SELECT COUNT(*) FROM public.events WHERE date < NOW())::BIGINT;
END;
$$;

-- Event performance - Hosts see their events, Admins see all
CREATE OR REPLACE FUNCTION public.get_host_event_performance(p_event_id UUID DEFAULT NULL)
RETURNS TABLE(
  id UUID,
  title TEXT,
  event_date TIMESTAMPTZ,
  capacity INT,
  total_rsvps BIGINT,
  confirmed_rsvps BIGINT,
  declined_rsvps BIGINT,
  pending_rsvps BIGINT,
  checked_in_count BIGINT,
  fill_rate NUMERIC,
  response_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND role = 'admin'
  ) INTO is_admin;

  -- If specific event requested, verify access
  IF p_event_id IS NOT NULL THEN
    IF NOT is_admin AND NOT EXISTS (
      SELECT 1 FROM public.events WHERE events.id = p_event_id AND host_id = auth.uid()
    ) THEN
      RAISE EXCEPTION 'Unauthorized: You must be the event host or an admin';
    END IF;
  END IF;

  RETURN QUERY
  SELECT 
    e.id,
    e.title,
    e.date AS event_date,
    e.capacity,
    COUNT(r.id) AS total_rsvps,
    COUNT(CASE WHEN r.response_status = 'confirmed' THEN 1 END) AS confirmed_rsvps,
    COUNT(CASE WHEN r.response_status = 'declined' THEN 1 END) AS declined_rsvps,
    COUNT(CASE WHEN r.response_status = 'pending' THEN 1 END) AS pending_rsvps,
    COUNT(CASE WHEN r.checked_in = true THEN 1 END) AS checked_in_count,
    CASE WHEN e.capacity > 0 THEN 
      ROUND((COUNT(CASE WHEN r.response_status = 'confirmed' THEN 1 END)::DECIMAL / e.capacity) * 100, 2)
    ELSE 0 END AS fill_rate,
    CASE WHEN COUNT(r.id) > 0 THEN
      ROUND((COUNT(CASE WHEN r.response_status IN ('confirmed', 'declined') THEN 1 END)::DECIMAL / COUNT(r.id)) * 100, 2)
    ELSE 0 END AS response_rate
  FROM public.events e
  LEFT JOIN public.rsvps r ON r.event_id = e.id
  WHERE 
    (p_event_id IS NOT NULL AND e.id = p_event_id)
    OR (p_event_id IS NULL AND (is_admin OR e.host_id = auth.uid()))
  GROUP BY e.id, e.title, e.date, e.capacity
  ORDER BY e.date DESC;
END;
$$;

-- =====================================================
-- 9. ADD AUTHORIZATION TO SECURITY DEFINER FUNCTIONS
-- =====================================================

-- Fix get_event_guests_detailed
CREATE OR REPLACE FUNCTION public.get_event_guests_detailed(p_event_id UUID)
RETURNS TABLE(
  id UUID, name TEXT, email TEXT, phone_number TEXT, category TEXT,
  is_vip BOOLEAN, plus_one_allowed BOOLEAN, plus_one_name TEXT,
  dietary_restrictions TEXT, notes TEXT, invite_sent BOOLEAN,
  invited_at TIMESTAMPTZ, rsvp_status TEXT, rsvp_date TIMESTAMPTZ,
  ticket_code TEXT, checked_in BOOLEAN, payment_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Authorization: must be event host or admin
  IF NOT EXISTS (
    SELECT 1 FROM public.events WHERE events.id = p_event_id AND host_id = auth.uid()
  ) AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: You must be the event host or an admin';
  END IF;

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
    r.response_status AS rsvp_status,
    r.created_at AS rsvp_date,
    r.ticket_code,
    COALESCE(r.checked_in, false) AS checked_in,
    COALESCE(r.payment_status, 'pending') AS payment_status
  FROM public.event_guests eg
  LEFT JOIN public.rsvps r ON eg.email = r.guest_email AND eg.event_id = r.event_id
  WHERE eg.event_id = p_event_id
  ORDER BY eg.name ASC;
END;
$$;

-- Fix bulk_invite_guests
CREATE OR REPLACE FUNCTION public.bulk_invite_guests(p_event_id UUID, p_guest_emails TEXT[])
RETURNS TABLE(email TEXT, status TEXT, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  guest_email TEXT;
  guest_record RECORD;
BEGIN
  -- Authorization: must be event host or admin
  IF NOT EXISTS (
    SELECT 1 FROM public.events WHERE events.id = p_event_id AND host_id = auth.uid()
  ) AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: You must be the event host or an admin';
  END IF;

  FOREACH guest_email IN ARRAY p_guest_emails
  LOOP
    SELECT * INTO guest_record 
    FROM public.event_guests 
    WHERE event_guests.event_id = p_event_id AND event_guests.email = guest_email;
    
    IF FOUND THEN
      UPDATE public.event_guests 
      SET invite_sent = true, invited_at = NOW()
      WHERE event_guests.id = guest_record.id;
      
      RETURN QUERY SELECT guest_email, 'updated'::TEXT, 'Invite status updated'::TEXT;
    ELSE
      RETURN QUERY SELECT guest_email, 'error'::TEXT, 'Guest not found in event'::TEXT;
    END IF;
  END LOOP;
END;
$$;

-- Fix bulk_check_in
CREATE OR REPLACE FUNCTION public.bulk_check_in(p_ticket_codes TEXT[], p_event_id UUID)
RETURNS TABLE(ticket_code TEXT, guest_name TEXT, status TEXT, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code TEXT;
  rsvp_record RECORD;
BEGIN
  -- Authorization: must be event host or admin
  IF NOT EXISTS (
    SELECT 1 FROM public.events WHERE events.id = p_event_id AND host_id = auth.uid()
  ) AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: You must be the event host or an admin';
  END IF;

  FOREACH code IN ARRAY p_ticket_codes
  LOOP
    SELECT * INTO rsvp_record 
    FROM public.rsvps 
    WHERE rsvps.ticket_code = code AND rsvps.event_id = p_event_id;
    
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
    
    UPDATE public.rsvps 
    SET checked_in = true, check_in_time = NOW()
    WHERE rsvps.id = rsvp_record.id;
    
    RETURN QUERY SELECT code, rsvp_record.guest_name, 'success'::TEXT, 'Checked in successfully'::TEXT;
  END LOOP;
END;
$$;

-- Fix get_event_check_in_stats
CREATE OR REPLACE FUNCTION public.get_event_check_in_stats(p_event_id UUID)
RETURNS TABLE(total_rsvps BIGINT, confirmed_rsvps BIGINT, checked_in_count BIGINT, check_in_rate NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Authorization: must be event host, guest with RSVP, or admin
  IF NOT EXISTS (
    SELECT 1 FROM public.events WHERE events.id = p_event_id AND host_id = auth.uid()
  ) AND NOT EXISTS (
    SELECT 1 FROM public.rsvps WHERE rsvps.event_id = p_event_id AND guest_email = (auth.jwt() ->> 'email')
  ) AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT 
    COUNT(*) AS total_rsvps,
    COUNT(CASE WHEN response_status = 'confirmed' THEN 1 END) AS confirmed_rsvps,
    COUNT(CASE WHEN checked_in = true THEN 1 END) AS checked_in_count,
    CASE 
      WHEN COUNT(CASE WHEN response_status = 'confirmed' THEN 1 END) > 0 THEN
        ROUND((COUNT(CASE WHEN checked_in = true THEN 1 END)::DECIMAL / 
               COUNT(CASE WHEN response_status = 'confirmed' THEN 1 END)) * 100, 2)
      ELSE 0
    END AS check_in_rate
  FROM public.rsvps 
  WHERE rsvps.event_id = p_event_id;
END;
$$;

-- Fix get_event_guest_stats
CREATE OR REPLACE FUNCTION public.get_event_guest_stats(p_event_id UUID)
RETURNS TABLE(
  total_guests BIGINT, invited_guests BIGINT, rsvp_confirmed BIGINT,
  rsvp_declined BIGINT, rsvp_pending BIGINT, vip_guests BIGINT,
  checked_in_guests BIGINT, pending_invites BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Authorization: must be event host or admin
  IF NOT EXISTS (
    SELECT 1 FROM public.events WHERE events.id = p_event_id AND host_id = auth.uid()
  ) AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: You must be the event host or an admin';
  END IF;

  RETURN QUERY
  SELECT 
    COUNT(eg.id) AS total_guests,
    COUNT(CASE WHEN eg.invite_sent = true THEN 1 END) AS invited_guests,
    COUNT(CASE WHEN r.response_status = 'confirmed' THEN 1 END) AS rsvp_confirmed,
    COUNT(CASE WHEN r.response_status = 'declined' THEN 1 END) AS rsvp_declined,
    COUNT(CASE WHEN r.response_status = 'pending' THEN 1 END) AS rsvp_pending,
    COUNT(CASE WHEN eg.is_vip = true THEN 1 END) AS vip_guests,
    COUNT(CASE WHEN r.checked_in = true THEN 1 END) AS checked_in_guests,
    COUNT(CASE WHEN eg.invite_sent = false OR eg.invite_sent IS NULL THEN 1 END) AS pending_invites
  FROM public.event_guests eg
  LEFT JOIN public.rsvps r ON eg.email = r.guest_email AND eg.event_id = r.event_id
  WHERE eg.event_id = p_event_id;
END;
$$;

-- Fix get_seating_chart_details
CREATE OR REPLACE FUNCTION public.get_seating_chart_details(p_event_id UUID)
RETURNS TABLE(
  chart_id UUID, chart_name TEXT, layout_data JSONB, venue_width INT, venue_height INT,
  seat_id UUID, seat_number TEXT, position_x DOUBLE PRECISION, position_y DOUBLE PRECISION,
  seat_type TEXT, table_number TEXT, seat_notes TEXT, assigned_rsvp_id UUID,
  guest_name TEXT, guest_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Authorization: event host, guest with RSVP, or admin
  IF NOT EXISTS (
    SELECT 1 FROM public.events WHERE events.id = p_event_id AND host_id = auth.uid()
  ) AND NOT EXISTS (
    SELECT 1 FROM public.rsvps WHERE rsvps.event_id = p_event_id AND guest_email = (auth.jwt() ->> 'email')
  ) AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT 
    sc.id AS chart_id,
    sc.name AS chart_name,
    sc.layout_data,
    sc.venue_width,
    sc.venue_height,
    s.id AS seat_id,
    s.seat_number,
    s.position_x,
    s.position_y,
    s.seat_type,
    s.table_number,
    s.notes AS seat_notes,
    sa.rsvp_id AS assigned_rsvp_id,
    r.guest_name,
    r.guest_email
  FROM public.seating_charts sc
  LEFT JOIN public.seats s ON s.seating_chart_id = sc.id
  LEFT JOIN public.seat_assignments sa ON sa.seat_id = s.id
  LEFT JOIN public.rsvps r ON r.id = sa.rsvp_id
  WHERE sc.event_id = p_event_id
  ORDER BY s.seat_number;
END;
$$;

-- Fix get_available_seats
CREATE OR REPLACE FUNCTION public.get_available_seats(p_event_id UUID)
RETURNS TABLE(seat_id UUID, seat_number TEXT, seat_type TEXT, table_number TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Authorization: event host or admin only
  IF NOT EXISTS (
    SELECT 1 FROM public.events WHERE events.id = p_event_id AND host_id = auth.uid()
  ) AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: You must be the event host or an admin';
  END IF;

  RETURN QUERY
  SELECT 
    s.id AS seat_id,
    s.seat_number,
    s.seat_type,
    s.table_number
  FROM public.seats s
  JOIN public.seating_charts sc ON sc.id = s.seating_chart_id
  LEFT JOIN public.seat_assignments sa ON sa.seat_id = s.id
  WHERE sc.event_id = p_event_id
    AND sa.id IS NULL
    AND s.seat_type != 'blocked'
  ORDER BY s.seat_number;
END;
$$;

-- Fix log_admin_action (Admin only)
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can create audit logs
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_details
  );
END;
$$;

-- Fix record_system_metric (Admin only)
CREATE OR REPLACE FUNCTION public.record_system_metric(
  p_metric_name TEXT,
  p_metric_value NUMERIC,
  p_metric_unit TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can record system metrics
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  INSERT INTO public.system_metrics (
    metric_name,
    metric_value,
    metric_unit
  ) VALUES (
    p_metric_name,
    p_metric_value,
    p_metric_unit
  );
END;
$$;

-- =====================================================
-- 10. FIX handle_new_user TO CREATE USER ROLE
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'user'::public.user_role)
  );
  
  -- Insert user_role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'user'::public.user_role)
  );
  
  RETURN NEW;
END;
$$;