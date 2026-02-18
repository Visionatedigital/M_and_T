-- Add group_members field to loan_applications table
ALTER TABLE public.loan_applications
ADD COLUMN IF NOT EXISTS group_members JSONB DEFAULT '[]'::jsonb;

-- Add comment to describe the field
COMMENT ON COLUMN public.loan_applications.group_members IS 'List of group members for Group Loan applications, containing name, phone, and ID';
