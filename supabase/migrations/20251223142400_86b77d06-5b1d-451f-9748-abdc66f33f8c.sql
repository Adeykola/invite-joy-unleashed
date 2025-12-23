-- Fix the search path for the function I just created
CREATE OR REPLACE FUNCTION public.update_event_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;