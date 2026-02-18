
-- Add group_members JSONB column to loan_applications
ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS group_members JSONB DEFAULT '[]'::jsonb;
