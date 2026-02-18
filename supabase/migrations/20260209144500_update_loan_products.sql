
-- 1. Add Fee Columns to loan_products
-- We wrap in DO block to avoid errors if columns exist (safe for re-running)
DO $$
BEGIN
    -- Application Fee
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'loan_products' AND column_name = 'application_fee') THEN
        ALTER TABLE public.loan_products ADD COLUMN application_fee numeric DEFAULT 0;
    END IF;
    -- Admission Fee
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'loan_products' AND column_name = 'admission_fee') THEN
        ALTER TABLE public.loan_products ADD COLUMN admission_fee numeric DEFAULT 0;
    END IF;
    -- Processing Fee
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'loan_products' AND column_name = 'processing_fee') THEN
        ALTER TABLE public.loan_products ADD COLUMN processing_fee numeric DEFAULT 0;
    END IF;
    -- Passbook Fee
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'loan_products' AND column_name = 'passbook_fee') THEN
        ALTER TABLE public.loan_products ADD COLUMN passbook_fee numeric DEFAULT 0;
    END IF;
    -- Insurance Rate (Percentage)
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'loan_products' AND column_name = 'insurance_rate') THEN
        ALTER TABLE public.loan_products ADD COLUMN insurance_rate numeric DEFAULT 0; 
    END IF;
    -- Security Deposit Rate (Percentage)
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'loan_products' AND column_name = 'security_deposit_rate') THEN
        ALTER TABLE public.loan_products ADD COLUMN security_deposit_rate numeric DEFAULT 0; 
    END IF;
END $$;

-- 2. Update Constraint on loan_applications
-- Drop old constraint safely
ALTER TABLE public.loan_applications DROP CONSTRAINT IF EXISTS loan_applications_loan_product_check;

-- Add new constraint with expanded list
ALTER TABLE public.loan_applications ADD CONSTRAINT loan_applications_loan_product_check 
    CHECK (loan_product = ANY (ARRAY[
        'Personal Loans'::text, 
        'Civil Servant Loans'::text, 
        'Logbook Finance Loans'::text, 
        'SME Loans'::text,
        'Bodaboda Group Loan'::text, -- Legacy support for transition
        'Individual Loan'::text,
        'Group Loan'::text
    ]));

-- 3. Insert/Update Products
-- Upsert based on Code to avoid duplicates
INSERT INTO public.loan_products (
    name, 
    code, 
    min_amount, 
    max_amount, 
    min_duration_months, 
    max_duration_months, 
    application_fee, 
    admission_fee, 
    processing_fee, 
    passbook_fee, 
    insurance_rate, 
    security_deposit_rate, 
    base_interest_rate
)
VALUES 
    (
        'Individual Loan', 
        'IND_LOAN', 
        150000, 
        2000000, 
        4, 
        6, 
        5000, 
        5000, 
        5000, 
        5000, 
        1.0, 
        10.0, 
        0 -- Interest not specified, assuming handled elsewhere or 0 base
    ),
    (
        'Group Loan', 
        'GRP_LOAN', 
        150000, 
        2000000, 
        4, 
        6, 
        5000, 
        5000, 
        5000, 
        5000, 
        1.0, 
        10.0, 
        0
    )
ON CONFLICT (code) DO UPDATE SET 
    min_amount = EXCLUDED.min_amount,
    max_amount = EXCLUDED.max_amount,
    min_duration_months = EXCLUDED.min_duration_months,
    max_duration_months = EXCLUDED.max_duration_months,
    application_fee = EXCLUDED.application_fee,
    admission_fee = EXCLUDED.admission_fee,
    processing_fee = EXCLUDED.processing_fee,
    passbook_fee = EXCLUDED.passbook_fee,
    insurance_rate = EXCLUDED.insurance_rate,
    security_deposit_rate = EXCLUDED.security_deposit_rate;

