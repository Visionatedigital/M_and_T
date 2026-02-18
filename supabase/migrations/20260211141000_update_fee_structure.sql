-- Update loan product fees to match M&T Microfinance Fee Schedule
-- Based on: M&T Microfinance Loan Agreement 2026

-- Update fee structure for Individual Loan and Group Loan products
UPDATE public.loan_products
SET
    processing_fee = 15000,  -- UGX 15,000 (Non-refundable, Application Stage)
    admission_fee = 10000,   -- UGX 10,000 (Admission & Passbook Fee)
    monitoring_fee_rate = 3, -- 3% of Loan Amount
    security_deposit_rate = 10, -- 10% (Refundable)
    updated_at = NOW()
WHERE name IN ('Individual Loan', 'Group Loan');

-- Add conditional fee columns to loan_products table if they don't exist
ALTER TABLE public.loan_products
ADD COLUMN IF NOT EXISTS late_payment_penalty NUMERIC DEFAULT 10000,
ADD COLUMN IF NOT EXISTS restructuring_fee_low NUMERIC DEFAULT 30000,
ADD COLUMN IF NOT EXISTS restructuring_fee_high NUMERIC DEFAULT 60000,
ADD COLUMN IF NOT EXISTS restructuring_threshold NUMERIC DEFAULT 600000;

-- Set conditional fees for all products
UPDATE public.loan_products
SET
    late_payment_penalty = 10000,      -- UGX 10,000 per missed installment
    restructuring_fee_low = 30000,     -- UGX 30,000 for loans ≤ UGX 600,000
    restructuring_fee_high = 60000,    -- UGX 60,000 for loans > UGX 600,000
    restructuring_threshold = 600000,  -- Threshold amount
    updated_at = NOW()
WHERE status = 'active';

-- Add comments to describe the new fields
COMMENT ON COLUMN public.loan_products.late_payment_penalty IS 'Late payment penalty per missed installment (UGX)';
COMMENT ON COLUMN public.loan_products.restructuring_fee_low IS 'Loan restructuring fee for amounts ≤ threshold (UGX)';
COMMENT ON COLUMN public.loan_products.restructuring_fee_high IS 'Loan restructuring fee for amounts > threshold (UGX)';
COMMENT ON COLUMN public.loan_products.restructuring_threshold IS 'Threshold amount for restructuring fee calculation (UGX)';
