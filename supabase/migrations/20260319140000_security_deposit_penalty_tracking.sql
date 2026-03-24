-- Group loans: late penalties can be absorbed by security deposit (tracked per repayment).

ALTER TABLE public.loan_applications
  ADD COLUMN IF NOT EXISTS security_deposit_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS security_deposit_balance NUMERIC;

COMMENT ON COLUMN public.loan_applications.security_deposit_amount IS 'Initial security deposit (UGX), usually principal × security_deposit_rate %; optional override';
COMMENT ON COLUMN public.loan_applications.security_deposit_balance IS 'Remaining deposit after penalties; NULL = derive from amount minus sum of covered penalties on repayments';

ALTER TABLE public.repayments
  ADD COLUMN IF NOT EXISTS penalty_covered_by_security_deposit NUMERIC DEFAULT 0;

COMMENT ON COLUMN public.repayments.penalty_covered_by_security_deposit IS 'UGX of scheduled late penalty absorbed by security deposit (group loans)';
