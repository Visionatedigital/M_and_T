-- Add amount_paid column to loan_applications
ALTER TABLE public.loan_applications 
ADD COLUMN IF NOT EXISTS amount_paid NUMERIC DEFAULT 0 NOT NULL;

-- Add a check constraint to ensure amount_paid is non-negative
ALTER TABLE public.loan_applications 
ADD CONSTRAINT loan_applications_amount_paid_check 
CHECK (amount_paid >= 0);

COMMENT ON COLUMN public.loan_applications.amount_paid IS 'Total amount paid towards this loan';
