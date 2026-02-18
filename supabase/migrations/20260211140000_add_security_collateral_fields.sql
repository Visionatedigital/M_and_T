-- Add Security & Collateral fields to loan_applications table
ALTER TABLE public.loan_applications
ADD COLUMN IF NOT EXISTS security_type TEXT,
ADD COLUMN IF NOT EXISTS security_value NUMERIC;

-- Add comment to describe the new fields
COMMENT ON COLUMN public.loan_applications.security_type IS 'Type of security/collateral pledged for secured loans';
COMMENT ON COLUMN public.loan_applications.security_value IS 'Estimated value of the security/collateral in UGX';
