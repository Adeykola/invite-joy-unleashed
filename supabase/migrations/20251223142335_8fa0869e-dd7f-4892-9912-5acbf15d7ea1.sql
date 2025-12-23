-- Create user_favorites table
CREATE TABLE public.user_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Enable RLS
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Users can manage their own favorites
CREATE POLICY "Users can manage their own favorites"
  ON public.user_favorites FOR ALL
  USING (auth.uid() = user_id);

-- Create event_reviews table
CREATE TABLE public.event_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Enable RLS
ALTER TABLE public.event_reviews ENABLE ROW LEVEL SECURITY;

-- Users can manage their own reviews
CREATE POLICY "Users can manage their own reviews"
  ON public.event_reviews FOR ALL
  USING (auth.uid() = user_id);

-- Anyone can view reviews (for event pages)
CREATE POLICY "Anyone can view reviews"
  ON public.event_reviews FOR SELECT
  USING (true);

-- Add bio and preferences columns to profiles if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- Create trigger for updating updated_at on event_reviews
CREATE OR REPLACE FUNCTION public.update_event_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_event_reviews_updated_at
  BEFORE UPDATE ON public.event_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_event_reviews_updated_at();