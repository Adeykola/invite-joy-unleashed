
-- Create table for WhatsApp media uploads
CREATE TABLE public.whatsapp_media_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'audio', 'document')),
  upload_status TEXT NOT NULL DEFAULT 'pending' CHECK (upload_status IN ('pending', 'uploaded', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for message queue management
CREATE TABLE public.whatsapp_message_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recipient_phone TEXT NOT NULL,
  message_content TEXT NOT NULL,
  media_id UUID REFERENCES public.whatsapp_media_uploads(id),
  personalization_data JSONB,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for delivery status tracking
CREATE TABLE public.whatsapp_delivery_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_queue_id UUID NOT NULL REFERENCES public.whatsapp_message_queue(id),
  phone_number TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  webhook_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for contact management
CREATE TABLE public.whatsapp_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT,
  tags TEXT[],
  custom_fields JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, phone_number)
);

-- Add new columns to existing whatsapp_sessions table
ALTER TABLE public.whatsapp_sessions 
ADD COLUMN IF NOT EXISTS connection_type TEXT DEFAULT 'web' CHECK (connection_type IN ('web', 'business_api')),
ADD COLUMN IF NOT EXISTS capabilities TEXT[] DEFAULT '{"text"}';

-- Add media support to whatsapp_broadcasts table
ALTER TABLE public.whatsapp_broadcasts 
ADD COLUMN IF NOT EXISTS media_id UUID REFERENCES public.whatsapp_media_uploads(id),
ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'audio', 'document'));

-- Add media support to message_templates table
ALTER TABLE public.message_templates 
ADD COLUMN IF NOT EXISTS media_id UUID REFERENCES public.whatsapp_media_uploads(id),
ADD COLUMN IF NOT EXISTS template_type TEXT DEFAULT 'text' CHECK (template_type IN ('text', 'image', 'video', 'audio', 'document'));

-- Enable RLS on new tables
ALTER TABLE public.whatsapp_media_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_message_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_delivery_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_contacts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for whatsapp_media_uploads
CREATE POLICY "Users can manage their own media uploads" 
  ON public.whatsapp_media_uploads 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create RLS policies for whatsapp_message_queue
CREATE POLICY "Users can manage their own message queue" 
  ON public.whatsapp_message_queue 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create RLS policies for whatsapp_delivery_status
CREATE POLICY "Users can view delivery status for their messages" 
  ON public.whatsapp_delivery_status 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.whatsapp_message_queue 
      WHERE id = message_queue_id AND user_id = auth.uid()
    )
  );

-- Create RLS policies for whatsapp_contacts
CREATE POLICY "Users can manage their own contacts" 
  ON public.whatsapp_contacts 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create storage bucket for WhatsApp media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('whatsapp-media', 'whatsapp-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for WhatsApp media
CREATE POLICY "Users can upload their own WhatsApp media" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'whatsapp-media' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own WhatsApp media" 
  ON storage.objects 
  FOR SELECT 
  USING (
    bucket_id = 'whatsapp-media' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own WhatsApp media" 
  ON storage.objects 
  FOR UPDATE 
  USING (
    bucket_id = 'whatsapp-media' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own WhatsApp media" 
  ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'whatsapp-media' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create indexes for better performance
CREATE INDEX idx_whatsapp_message_queue_user_status ON public.whatsapp_message_queue(user_id, status);
CREATE INDEX idx_whatsapp_message_queue_scheduled ON public.whatsapp_message_queue(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX idx_whatsapp_delivery_status_message ON public.whatsapp_delivery_status(message_queue_id);
CREATE INDEX idx_whatsapp_contacts_user_phone ON public.whatsapp_contacts(user_id, phone_number);
CREATE INDEX idx_whatsapp_media_user ON public.whatsapp_media_uploads(user_id, created_at);

-- Add trigger for updated_at timestamps
CREATE OR REPLACE TRIGGER update_whatsapp_media_uploads_updated_at
  BEFORE UPDATE ON public.whatsapp_media_uploads
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE OR REPLACE TRIGGER update_whatsapp_message_queue_updated_at
  BEFORE UPDATE ON public.whatsapp_message_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE OR REPLACE TRIGGER update_whatsapp_contacts_updated_at
  BEFORE UPDATE ON public.whatsapp_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
