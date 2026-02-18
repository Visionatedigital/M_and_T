
-- Add missing columns to profiles table if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS role text DEFAULT 'client';

-- Make full_name nullable if it's not (since we prefer first/last)
ALTER TABLE public.profiles ALTER COLUMN full_name DROP NOT NULL;

-- Backfill profiles from auth.users
INSERT INTO public.profiles (id, first_name, last_name, full_name, email, phone_number, role, created_at)
SELECT 
    au.id,
    COALESCE(split_part(au.raw_user_meta_data->>'full_name', ' ', 1), 'User'),
    COALESCE(split_part(au.raw_user_meta_data->>'full_name', ' ', 2), ''),
    COALESCE(au.raw_user_meta_data->>'full_name', 'User'), -- Populate full_name too
    au.email,
    au.raw_user_meta_data->>'phone_number',
    COALESCE(au.raw_user_meta_data->>'role', 'client'),
    au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;

-- Update profiles with data from loan applications
UPDATE public.profiles p
SET 
    first_name = COALESCE(split_part(la.full_name, ' ', 1), p.first_name),
    last_name = COALESCE(split_part(la.full_name, ' ', 2), p.last_name),
    full_name = COALESCE(la.full_name, p.full_name),
    phone_number = COALESCE(la.phone_number, p.phone_number)
FROM loan_applications la
WHERE p.id = la.user_id;
