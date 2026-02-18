-- Add group_name field to loan_applications table
ALTER TABLE public.loan_applications
ADD COLUMN IF NOT EXISTS group_name TEXT;

-- Add comment to describe the field
COMMENT ON COLUMN public.loan_applications.group_name IS 'Name of the group for Group Loan applications';
