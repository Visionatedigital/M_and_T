-- Raise loan amount ceiling to UGX 50,000,000 for all products
UPDATE public.loan_products
SET max_amount = 50000000,
    updated_at = NOW()
WHERE max_amount < 50000000;
