-- Add document attachment fields to loan_applications table
-- Based on: M&T Microfinance Loan Agreement 2026 - Required Attachments

ALTER TABLE public.loan_applications
ADD COLUMN IF NOT EXISTS attachment_national_id TEXT,
ADD COLUMN IF NOT EXISTS attachment_lc1_letter TEXT,
ADD COLUMN IF NOT EXISTS attachment_recommendation_letter TEXT,
ADD COLUMN IF NOT EXISTS attachment_passport_photo TEXT,
ADD COLUMN IF NOT EXISTS attachment_income_statement TEXT,
ADD COLUMN IF NOT EXISTS attachment_uploaded_at TIMESTAMP WITH TIME ZONE;

-- Add comments to describe the attachment fields
COMMENT ON COLUMN public.loan_applications.attachment_national_id IS 'URL/path to National ID card photocopy';
COMMENT ON COLUMN public.loan_applications.attachment_lc1_letter IS 'URL/path to LC1 Recommendation Letter';
COMMENT ON COLUMN public.loan_applications.attachment_recommendation_letter IS 'URL/path to other recommendation letter (Market Chairperson, Boda stage Chairman, etc.)';
COMMENT ON COLUMN public.loan_applications.attachment_passport_photo IS 'URL/path to passport size photo';
COMMENT ON COLUMN public.loan_applications.attachment_income_statement IS 'URL/path to detailed monthly income and expenditure statement';
COMMENT ON COLUMN public.loan_applications.attachment_uploaded_at IS 'Timestamp when attachments were last uploaded';
