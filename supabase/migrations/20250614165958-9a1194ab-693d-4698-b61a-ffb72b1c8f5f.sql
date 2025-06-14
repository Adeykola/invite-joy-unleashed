
-- Add phone numbers to guest management
ALTER TABLE public.event_guests 
ADD COLUMN IF NOT EXISTS phone_number text;

-- Add phone numbers to RSVP responses  
ALTER TABLE public.rsvps 
ADD COLUMN IF NOT EXISTS phone_number text;

-- Create audit logs table for security tracking
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create system health metrics table
CREATE TABLE IF NOT EXISTS public.system_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  metric_unit text,
  recorded_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create communication campaigns table
CREATE TABLE IF NOT EXISTS public.communication_campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  name text NOT NULL,
  type text NOT NULL, -- 'email', 'whatsapp', 'sms'
  subject text,
  content text NOT NULL,
  target_audience jsonb, -- criteria for targeting
  status text NOT NULL DEFAULT 'draft', -- 'draft', 'scheduled', 'sent', 'failed'
  scheduled_for timestamp with time zone,
  sent_at timestamp with time zone,
  total_recipients integer DEFAULT 0,
  successful_sends integer DEFAULT 0,
  failed_sends integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Update whatsapp_broadcasts table to be nullable template_id since we can send without templates
ALTER TABLE public.whatsapp_broadcasts 
ALTER COLUMN template_id DROP NOT NULL;

-- Enable RLS on new tables
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_campaigns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin access
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view system metrics" ON public.system_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert metrics" ON public.system_metrics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can manage their campaigns" ON public.communication_campaigns
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view all campaigns" ON public.communication_campaigns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action text,
  p_resource_type text,
  p_resource_id text DEFAULT NULL,
  p_details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
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

-- Create function to record system metrics
CREATE OR REPLACE FUNCTION public.record_system_metric(
  p_metric_name text,
  p_metric_value numeric,
  p_metric_unit text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
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

-- Add some sample system metrics for demonstration
INSERT INTO public.system_metrics (metric_name, metric_value, metric_unit) VALUES
  ('active_users', 150, 'count'),
  ('total_events', 45, 'count'),
  ('database_connections', 12, 'count'),
  ('response_time_avg', 250, 'ms'),
  ('memory_usage', 65, 'percent'),
  ('cpu_usage', 32, 'percent'),
  ('storage_used', 2.5, 'GB');
