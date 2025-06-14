
-- First, let's check if we have the trigger set up correctly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::text, 'user')
  );
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a default admin user profile (this will be for the admin login)
-- First, we need to insert a user in auth.users, but since we can't do that directly,
-- we'll create a profile that can be linked when the admin signs up
-- Instead, let's create a function to create admin user
CREATE OR REPLACE FUNCTION create_admin_user(admin_email text, admin_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- This function should be called after manually creating the admin user through Supabase auth
  -- For now, we'll just ensure the profiles table is ready
  -- The admin will need to be created through the signup process first, then we'll update their role
END;
$$;

-- Let's also create any missing profiles for existing users
INSERT INTO public.profiles (id, full_name, email, role)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', ''),
  u.email,
  'user'
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;
