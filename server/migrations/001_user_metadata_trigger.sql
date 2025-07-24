-- Create a function to handle new user creation
-- This function ensures all users have the required metadata fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user metadata is missing or incomplete
  IF NEW.raw_user_meta_data IS NULL OR 
     NEW.raw_user_meta_data->>'tier' IS NULL OR 
     NEW.raw_user_meta_data->>'name' IS NULL THEN
    
    -- Extract name from email or use existing name
    DECLARE
      user_name TEXT;
    BEGIN
      -- Try to get name from existing metadata, fall back to email username
      user_name := COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        SPLIT_PART(NEW.email, '@', 1)
      );
      
      -- Update user metadata with required fields
      NEW.raw_user_meta_data := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object(
          'tier', COALESCE(NEW.raw_user_meta_data->>'tier', 'free'),
          'name', user_name
        );
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to fire before insert on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Also create a function to fix existing users with missing metadata
CREATE OR REPLACE FUNCTION public.fix_existing_user_metadata()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER := 0;
  user_record RECORD;
BEGIN
  -- Loop through all users with missing metadata
  FOR user_record IN 
    SELECT id, email, raw_user_meta_data
    FROM auth.users
    WHERE raw_user_meta_data IS NULL 
       OR raw_user_meta_data->>'tier' IS NULL 
       OR raw_user_meta_data->>'name' IS NULL
  LOOP
    -- Update user metadata
    UPDATE auth.users
    SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
      jsonb_build_object(
        'tier', COALESCE(raw_user_meta_data->>'tier', 'free'),
        'name', COALESCE(
          raw_user_meta_data->>'name',
          raw_user_meta_data->>'full_name',
          SPLIT_PART(email, '@', 1)
        )
      )
    WHERE id = user_record.id;
    
    updated_count := updated_count + 1;
  END LOOP;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the fix for existing users
SELECT public.fix_existing_user_metadata();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.fix_existing_user_metadata() TO service_role;