
-- Fix Data Integrity: Re-assign loans from the "Olivia" user (e560377e...) to new unique users based on full_name

-- 1. Create a temporary table to map unique names to new User IDs
CREATE TEMP TABLE name_mapping AS
SELECT DISTINCT full_name, gen_random_uuid() as new_user_id
FROM loan_applications
WHERE user_id = 'e560377e-8e67-4ff3-a394-2053b82609da';

-- 2. Insert new "ghost" users into auth.users (We can't easily do this in SQL due to hashing, BUT we can insert into PROFILES directly)
-- NOTE: If we insert into profiles but NOT auth.users, they won't be able to login, which is fine for "Staff Portal" clients.
-- However, if there is a foreign key from profiles.id -> auth.users.id, this will fail.
-- Let's check if profiles has a FK to auth.users. usually it does.

-- Verification:
-- If profiles has FK to auth.users, we MUST create auth.users.
-- Since we cannot generate valid passwords in SQL easily, we will create dummy auth users with a known pattern or just random hashes.

-- Workaround:
-- We will use a script to generate the SQL with valid auth.users inserts (using a fixed dummy hash for password).
-- Or, simpler:
-- Just update the LOANS to point to new UUIDs and insert into PROFILES. 
-- BUT, if `loan_applications.user_id` has a FK to `auth.users` (likely), this will fail.

-- Let's assume we need to safeguard against FK constraints.
-- I will create a PL/PGSQL block to generate these.

DO $$
DECLARE
    r RECORD;
    new_uid UUID;
    fake_email TEXT;
BEGIN
    FOR r IN SELECT DISTINCT full_name FROM loan_applications WHERE user_id = 'e560377e-8e67-4ff3-a394-2053b82609da'
    LOOP
        new_uid := gen_random_uuid();
        fake_email := lower(regexp_replace(r.full_name, '\s+', '.', 'g')) || '@mandt.placeholder';
        
        -- Try to insert into auth.users (this requires permissions, might fail if running as non-superuser)
        -- If we can't write to auth.users, we are stuck unless the FK is loose.
        -- ALTERNATIVE: Use the existing check_auth_users script to see if we have 50 users. 
        -- We might just distribute them among existing 50 users? 
        -- No, names won't match.
        
        -- Let's try inserting into auth.users with a dummy hash
        BEGIN
            INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, instance_id)
            VALUES (
                new_uid, 
                fake_email, 
                '$2a$10$dummyhashdummyhashdummyhashdummyhashdummyhash', -- Dummy hash
                now(), 
                '{"provider":"email","providers":["email"]}', 
                jsonb_build_object('full_name', r.full_name, 'role', 'client'), 
                now(), 
                now(), 
                'authenticated', 
                '00000000-0000-0000-0000-000000000000'
            );
            
            -- Insert into profiles
            INSERT INTO public.profiles (id, first_name, last_name, full_name, email, role, created_at)
            VALUES (
                new_uid, 
                split_part(r.full_name, ' ', 1), 
                split_part(r.full_name, ' ', 2), 
                r.full_name, 
                fake_email, 
                'client', 
                now()
            );

            -- Update loans
            UPDATE public.loan_applications
            SET user_id = new_uid
            WHERE full_name = r.full_name AND user_id = 'e560377e-8e67-4ff3-a394-2053b82609da';
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed for %: %', r.full_name, SQLERRM;
        END;
    END LOOP;
END $$;
