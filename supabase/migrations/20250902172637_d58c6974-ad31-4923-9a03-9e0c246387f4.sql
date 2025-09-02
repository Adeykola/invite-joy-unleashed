-- Fix search path for new functions
DROP FUNCTION IF EXISTS public.get_seating_chart_details(UUID);
DROP FUNCTION IF EXISTS public.get_available_seats(UUID);

-- Recreate functions with proper search path
CREATE OR REPLACE FUNCTION public.get_seating_chart_details(p_event_id UUID)
RETURNS TABLE(
  chart_id UUID,
  chart_name TEXT,
  layout_data JSONB,
  venue_width INTEGER,
  venue_height INTEGER,
  seat_id UUID,
  seat_number TEXT,
  position_x FLOAT,
  position_y FLOAT,
  seat_type TEXT,
  table_number TEXT,
  seat_notes TEXT,
  assigned_rsvp_id UUID,
  guest_name TEXT,
  guest_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    sc.id as chart_id,
    sc.name as chart_name,
    sc.layout_data,
    sc.venue_width,
    sc.venue_height,
    s.id as seat_id,
    s.seat_number,
    s.position_x,
    s.position_y,
    s.seat_type,
    s.table_number,
    s.notes as seat_notes,
    sa.rsvp_id as assigned_rsvp_id,
    r.guest_name,
    r.guest_email
  FROM seating_charts sc
  LEFT JOIN seats s ON s.seating_chart_id = sc.id
  LEFT JOIN seat_assignments sa ON sa.seat_id = s.id
  LEFT JOIN rsvps r ON r.id = sa.rsvp_id
  WHERE sc.event_id = p_event_id
  ORDER BY s.seat_number;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_available_seats(p_event_id UUID)
RETURNS TABLE(
  seat_id UUID,
  seat_number TEXT,
  seat_type TEXT,
  table_number TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as seat_id,
    s.seat_number,
    s.seat_type,
    s.table_number
  FROM seats s
  JOIN seating_charts sc ON sc.id = s.seating_chart_id
  LEFT JOIN seat_assignments sa ON sa.seat_id = s.id
  WHERE sc.event_id = p_event_id
    AND sa.id IS NULL
    AND s.seat_type != 'blocked'
  ORDER BY s.seat_number;
END;
$function$;