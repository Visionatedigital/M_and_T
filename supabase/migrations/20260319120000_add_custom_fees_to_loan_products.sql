-- Additional product fees: user-defined labels + UGX amounts (JSON array)
-- Example: [{"id":"...","label":"Vehicle inspection","amount":25000}]

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'loan_products' AND column_name = 'custom_fees'
    ) THEN
        ALTER TABLE public.loan_products
            ADD COLUMN custom_fees jsonb NOT NULL DEFAULT '[]'::jsonb;
        COMMENT ON COLUMN public.loan_products.custom_fees IS 'Extra fixed fees (UGX): [{id, label, amount}, ...]';
    END IF;
END $$;
