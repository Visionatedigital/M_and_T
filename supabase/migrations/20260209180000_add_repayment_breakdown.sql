
-- Add member_breakdown to repayments to track individual contributions in group loans
ALTER TABLE public.repayments ADD COLUMN IF NOT EXISTS member_breakdown JSONB DEFAULT '[]';

-- Add comment to explain usage
COMMENT ON COLUMN public.repayments.member_breakdown IS 'Stores individual member payment amounts for group loans. Format: [{"name": String, "nin": String, "amount": Number}]';
