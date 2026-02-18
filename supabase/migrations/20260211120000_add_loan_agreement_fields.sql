-- Add new columns to loan_applications table for Loan Agreement 2026 compliance
ALTER TABLE public.loan_applications
ADD COLUMN IF NOT EXISTS loan_category text, -- Business, Agricultural, School Fees, Emergency
ADD COLUMN IF NOT EXISTS district text,
ADD COLUMN IF NOT EXISTS division text,
ADD COLUMN IF NOT EXISTS county text,
ADD COLUMN IF NOT EXISTS sub_county text,
ADD COLUMN IF NOT EXISTS parish text,
ADD COLUMN IF NOT EXISTS village text,
ADD COLUMN IF NOT EXISTS business_location text,
ADD COLUMN IF NOT EXISTS guarantors jsonb DEFAULT '[]'::jsonb, -- Array of {name, phone, id_number, address}
ADD COLUMN IF NOT EXISTS witness_details jsonb DEFAULT '{}'::jsonb; -- {name, phone, id_number, address, role}

-- Add monitoring_fee_rate to loan_products
-- Default is 3% as per agreement
DO $$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'loan_products' AND column_name = 'monitoring_fee_rate') THEN
        ALTER TABLE public.loan_products ADD COLUMN monitoring_fee_rate numeric DEFAULT 3.0;
    END IF;
END $$;

-- Update fees for existing products to match the 2026 Agreement
-- Individual Loan and Group Loan
UPDATE public.loan_products
SET 
    application_fee = 0, -- Application form is usually free or part of processing? Agreement says "Loan Processing Fee: UGX 15,000". Let's assume Application Fee is 0 and Processing covers it, or maybe Application Stage fee. 
    -- Agreement: "Application Stage ... Loan Processing Fee: UGX 15,000". 
    -- "Payable Only Upon Loan Approval ... Admission & Passbook Fee: UGX 10,000"
    processing_fee = 15000,
    admission_fee = 10000,
    passbook_fee = 0, -- Included in Admission? Agreement says "Admission & Passbook Fee: UGX 10,000". We can split or just put it in admission. Let's put 10000 in admission and 0 in passbook to avoid double charging if logic sums them.
    monitoring_fee_rate = 3.0,
    security_deposit_rate = 10.0,
    insurance_rate = 1.0 -- Keeping existing 1% or setting to what? Agreement doesn't explicitly mention "Insurance" but mentions "Security & Collateral". Let's leave insurance as is if not mentioned, or set to 0? The agreement has "Monitoring Fee: 3%". Let's stick to that.
WHERE name IN ('Individual Loan', 'Group Loan');

-- Ensure validation check for loan_category
ALTER TABLE public.loan_applications DROP CONSTRAINT IF EXISTS loan_applications_loan_category_check;
ALTER TABLE public.loan_applications ADD CONSTRAINT loan_applications_loan_category_check 
    CHECK (loan_category IS NULL OR loan_category = ANY (ARRAY['Business', 'Agricultural', 'School Fees', 'Emergency', 'Other']));
