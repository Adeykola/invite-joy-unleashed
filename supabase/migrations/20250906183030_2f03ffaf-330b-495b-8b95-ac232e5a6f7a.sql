-- Add status and completion tracking to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
ADD COLUMN IF NOT EXISTS completion_checklist jsonb DEFAULT '{
  "basic_info": true,
  "guest_settings": false,
  "guest_list": false,
  "communication": false,
  "design": false
}'::jsonb;

-- Set existing events to published status
UPDATE public.events 
SET status = 'published', 
    completion_checklist = '{
      "basic_info": true,
      "guest_settings": true,
      "guest_list": true,
      "communication": true,
      "design": true
    }'::jsonb
WHERE status IS NULL;