
-- Add status and payment_method to repayments
ALTER TABLE public.repayments ADD COLUMN IF NOT EXISTS status text DEFAULT 'paid';
ALTER TABLE public.repayments ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'cash';
