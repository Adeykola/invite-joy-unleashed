-- Add validation constraints to the rsvps table
-- These constraints provide server-side validation for user input

-- Guest name: must be between 1-100 characters
ALTER TABLE public.rsvps
ADD CONSTRAINT rsvp_guest_name_length 
CHECK (length(guest_name) > 0 AND length(guest_name) <= 100);

-- Guest email: must match email format and be <= 255 characters
ALTER TABLE public.rsvps
ADD CONSTRAINT rsvp_guest_email_format 
CHECK (guest_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND length(guest_email) <= 255);

-- Comments: optional, but if provided must be <= 1000 characters
ALTER TABLE public.rsvps
ADD CONSTRAINT rsvp_comments_length 
CHECK (comments IS NULL OR length(comments) <= 1000);

-- Dietary restrictions: optional, but if provided must be <= 500 characters
ALTER TABLE public.rsvps
ADD CONSTRAINT rsvp_dietary_restrictions_length 
CHECK (dietary_restrictions IS NULL OR length(dietary_restrictions) <= 500);

-- Meal choice: optional, but if provided must be <= 100 characters
ALTER TABLE public.rsvps
ADD CONSTRAINT rsvp_meal_choice_length 
CHECK (meal_choice IS NULL OR length(meal_choice) <= 100);

-- Create a trigger function to sanitize and validate RSVP input
CREATE OR REPLACE FUNCTION public.validate_rsvp_input()
RETURNS TRIGGER AS $$
BEGIN
  -- Trim whitespace from text fields
  NEW.guest_name := trim(NEW.guest_name);
  NEW.guest_email := lower(trim(NEW.guest_email));
  NEW.comments := CASE WHEN NEW.comments IS NOT NULL THEN trim(NEW.comments) ELSE NULL END;
  NEW.dietary_restrictions := CASE WHEN NEW.dietary_restrictions IS NOT NULL THEN trim(NEW.dietary_restrictions) ELSE NULL END;
  NEW.meal_choice := CASE WHEN NEW.meal_choice IS NOT NULL THEN trim(NEW.meal_choice) ELSE NULL END;
  
  -- Validate email format (additional check)
  IF NEW.guest_email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Validate name is not empty after trimming
  IF NEW.guest_name IS NULL OR length(NEW.guest_name) = 0 THEN
    RAISE EXCEPTION 'Guest name cannot be empty';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

-- Create triggers for insert and update
CREATE TRIGGER validate_rsvp_before_insert
  BEFORE INSERT ON public.rsvps
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_rsvp_input();

CREATE TRIGGER validate_rsvp_before_update
  BEFORE UPDATE ON public.rsvps
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_rsvp_input();