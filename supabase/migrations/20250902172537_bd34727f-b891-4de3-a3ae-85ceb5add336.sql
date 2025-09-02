-- Create seating charts table
CREATE TABLE public.seating_charts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Main Seating Chart',
  layout_data JSONB NOT NULL DEFAULT '{}',
  venue_width INTEGER DEFAULT 800,
  venue_height INTEGER DEFAULT 600,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create seats table
CREATE TABLE public.seats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seating_chart_id UUID NOT NULL REFERENCES public.seating_charts(id) ON DELETE CASCADE,
  seat_number TEXT NOT NULL,
  position_x FLOAT NOT NULL,
  position_y FLOAT NOT NULL,
  seat_type TEXT NOT NULL DEFAULT 'regular', -- regular, vip, accessible, blocked
  table_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(seating_chart_id, seat_number)
);

-- Create seat assignments table
CREATE TABLE public.seat_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seat_id UUID NOT NULL REFERENCES public.seats(id) ON DELETE CASCADE,
  rsvp_id UUID NOT NULL REFERENCES public.rsvps(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(seat_id), -- Each seat can only be assigned to one RSVP
  UNIQUE(rsvp_id) -- Each RSVP can only have one seat assignment
);

-- Enable RLS
ALTER TABLE public.seating_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seat_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for seating_charts
CREATE POLICY "Event hosts can manage seating charts" 
ON public.seating_charts 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.events 
  WHERE events.id = seating_charts.event_id 
  AND events.host_id = auth.uid()
));

CREATE POLICY "Admins can manage all seating charts" 
ON public.seating_charts 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'::user_role
));

CREATE POLICY "Guests can view seating charts for their events" 
ON public.seating_charts 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.rsvps 
  WHERE rsvps.event_id = seating_charts.event_id 
  AND rsvps.guest_email = auth.jwt() ->> 'email'
));

-- RLS Policies for seats
CREATE POLICY "Event hosts can manage seats" 
ON public.seats 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.seating_charts sc
  JOIN public.events e ON e.id = sc.event_id
  WHERE sc.id = seats.seating_chart_id 
  AND e.host_id = auth.uid()
));

CREATE POLICY "Admins can manage all seats" 
ON public.seats 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'::user_role
));

CREATE POLICY "Guests can view seats for their events" 
ON public.seats 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.seating_charts sc
  JOIN public.rsvps r ON r.event_id = sc.event_id
  WHERE sc.id = seats.seating_chart_id 
  AND r.guest_email = auth.jwt() ->> 'email'
));

-- RLS Policies for seat_assignments
CREATE POLICY "Event hosts can manage seat assignments" 
ON public.seat_assignments 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.seats s
  JOIN public.seating_charts sc ON sc.id = s.seating_chart_id
  JOIN public.events e ON e.id = sc.event_id
  WHERE s.id = seat_assignments.seat_id 
  AND e.host_id = auth.uid()
));

CREATE POLICY "Admins can manage all seat assignments" 
ON public.seat_assignments 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'::user_role
));

CREATE POLICY "Guests can view their seat assignments" 
ON public.seat_assignments 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.rsvps r
  WHERE r.id = seat_assignments.rsvp_id 
  AND r.guest_email = auth.jwt() ->> 'email'
));

-- Create indexes for performance
CREATE INDEX idx_seating_charts_event_id ON public.seating_charts(event_id);
CREATE INDEX idx_seats_seating_chart_id ON public.seats(seating_chart_id);
CREATE INDEX idx_seat_assignments_seat_id ON public.seat_assignments(seat_id);
CREATE INDEX idx_seat_assignments_rsvp_id ON public.seat_assignments(rsvp_id);

-- Create function to get seating chart with seats and assignments
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
  FROM public.seating_charts sc
  LEFT JOIN public.seats s ON s.seating_chart_id = sc.id
  LEFT JOIN public.seat_assignments sa ON sa.seat_id = s.id
  LEFT JOIN public.rsvps r ON r.id = sa.rsvp_id
  WHERE sc.event_id = p_event_id
  ORDER BY s.seat_number;
END;
$function$;

-- Add triggers for updated_at
CREATE TRIGGER update_seating_charts_updated_at
  BEFORE UPDATE ON public.seating_charts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

-- Add seat availability function
CREATE OR REPLACE FUNCTION public.get_available_seats(p_event_id UUID)
RETURNS TABLE(
  seat_id UUID,
  seat_number TEXT,
  seat_type TEXT,
  table_number TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as seat_id,
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
$function$;