-- =============================================================================
-- M&T Growth Gateway - Manual Migrations for Supabase SQL Editor
-- =============================================================================
-- Run these in order. Skip any that fail (object may already exist).
-- Run each section separately, or all at once if your project is fresh.
--
-- PREREQUISITES: Your Supabase project should have:
--   - loan_applications, loan_products, profiles, user_roles, auth.users
--   - has_role(uuid, app_role) function, app_role enum
--
-- If borrowers/groups tables are missing, run the OPTIONAL section at the end.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. REPAYMENTS TABLE (20260209163000)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.repayments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    loan_application_id uuid NOT NULL REFERENCES public.loan_applications(id),
    amount numeric(15,2) NOT NULL,
    payment_date date NOT NULL,
    recorded_by uuid,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.repayments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view all repayments" ON public.repayments;
CREATE POLICY "Staff can view all repayments" ON public.repayments FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'loan_officer')
);

DROP POLICY IF EXISTS "Staff can insert repayments" ON public.repayments;
CREATE POLICY "Staff can insert repayments" ON public.repayments FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'loan_officer')
);

DROP POLICY IF EXISTS "Clients can view own repayments" ON public.repayments;
CREATE POLICY "Clients can view own repayments" ON public.repayments FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.loan_applications la
        WHERE la.id = repayments.loan_application_id
        AND la.user_id = auth.uid()
    )
);

-- -----------------------------------------------------------------------------
-- 2. REPAYMENTS COLUMNS (20260209163500)
-- -----------------------------------------------------------------------------
ALTER TABLE public.repayments ADD COLUMN IF NOT EXISTS status text DEFAULT 'paid';
ALTER TABLE public.repayments ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'cash';

-- -----------------------------------------------------------------------------
-- 3. MEMBER BREAKDOWN (20260209180000)
-- -----------------------------------------------------------------------------
ALTER TABLE public.repayments ADD COLUMN IF NOT EXISTS member_breakdown JSONB DEFAULT '[]';

-- -----------------------------------------------------------------------------
-- 4. GROUP MEMBERS COLUMN (20260209164500)
-- -----------------------------------------------------------------------------
ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS group_members JSONB DEFAULT '[]'::jsonb;

-- -----------------------------------------------------------------------------
-- 5. LOCATION FIELDS (20260210113000)
-- -----------------------------------------------------------------------------
ALTER TABLE public.loan_applications
ADD COLUMN IF NOT EXISTS latitude float8,
ADD COLUMN IF NOT EXISTS longitude float8;

-- -----------------------------------------------------------------------------
-- 6. PROFILES BACKFILL (20260210123000)
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS role text DEFAULT 'client';

ALTER TABLE public.profiles ALTER COLUMN full_name DROP NOT NULL;

-- -----------------------------------------------------------------------------
-- 7. GROUP NAME (20260210140000)
-- -----------------------------------------------------------------------------
ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS group_name TEXT;
CREATE INDEX IF NOT EXISTS idx_loan_applications_group_name ON public.loan_applications(group_name);

-- -----------------------------------------------------------------------------
-- 8. AMOUNT PAID (20260210163000)
-- -----------------------------------------------------------------------------
ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS amount_paid NUMERIC DEFAULT 0 NOT NULL;
ALTER TABLE public.loan_applications DROP CONSTRAINT IF EXISTS loan_applications_amount_paid_check;
ALTER TABLE public.loan_applications ADD CONSTRAINT loan_applications_amount_paid_check CHECK (amount_paid >= 0);

-- -----------------------------------------------------------------------------
-- 9. LOAN AGREEMENT FIELDS (20260211120000)
-- -----------------------------------------------------------------------------
ALTER TABLE public.loan_applications
ADD COLUMN IF NOT EXISTS loan_category text,
ADD COLUMN IF NOT EXISTS district text,
ADD COLUMN IF NOT EXISTS division text,
ADD COLUMN IF NOT EXISTS county text,
ADD COLUMN IF NOT EXISTS sub_county text,
ADD COLUMN IF NOT EXISTS parish text,
ADD COLUMN IF NOT EXISTS village text,
ADD COLUMN IF NOT EXISTS business_location text,
ADD COLUMN IF NOT EXISTS guarantors jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS witness_details jsonb DEFAULT '{}'::jsonb;

DO $$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'loan_products' AND column_name = 'monitoring_fee_rate') THEN
        ALTER TABLE public.loan_products ADD COLUMN monitoring_fee_rate numeric DEFAULT 3.0;
    END IF;
END $$;

ALTER TABLE public.loan_applications DROP CONSTRAINT IF EXISTS loan_applications_loan_category_check;
ALTER TABLE public.loan_applications ADD CONSTRAINT loan_applications_loan_category_check 
    CHECK (loan_category IS NULL OR loan_category = ANY (ARRAY['Business', 'Agricultural', 'School Fees', 'Emergency', 'Other']));

-- -----------------------------------------------------------------------------
-- 10. SECURITY & COLLATERAL (20260211140000)
-- -----------------------------------------------------------------------------
ALTER TABLE public.loan_applications
ADD COLUMN IF NOT EXISTS security_type TEXT,
ADD COLUMN IF NOT EXISTS security_value NUMERIC;

-- -----------------------------------------------------------------------------
-- 11. ATTACHMENT FIELDS (20260211142000)
-- -----------------------------------------------------------------------------
ALTER TABLE public.loan_applications
ADD COLUMN IF NOT EXISTS attachment_national_id TEXT,
ADD COLUMN IF NOT EXISTS attachment_lc1_letter TEXT,
ADD COLUMN IF NOT EXISTS attachment_recommendation_letter TEXT,
ADD COLUMN IF NOT EXISTS attachment_passport_photo TEXT,
ADD COLUMN IF NOT EXISTS attachment_income_statement TEXT,
ADD COLUMN IF NOT EXISTS attachment_uploaded_at TIMESTAMP WITH TIME ZONE;

-- -----------------------------------------------------------------------------
-- 12. LOAN PRODUCTS FEE COLUMNS (20260209144500)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'loan_products' AND column_name = 'application_fee') THEN
        ALTER TABLE public.loan_products ADD COLUMN application_fee numeric DEFAULT 0;
    END IF;
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'loan_products' AND column_name = 'admission_fee') THEN
        ALTER TABLE public.loan_products ADD COLUMN admission_fee numeric DEFAULT 0;
    END IF;
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'loan_products' AND column_name = 'processing_fee') THEN
        ALTER TABLE public.loan_products ADD COLUMN processing_fee numeric DEFAULT 0;
    END IF;
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'loan_products' AND column_name = 'passbook_fee') THEN
        ALTER TABLE public.loan_products ADD COLUMN passbook_fee numeric DEFAULT 0;
    END IF;
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'loan_products' AND column_name = 'insurance_rate') THEN
        ALTER TABLE public.loan_products ADD COLUMN insurance_rate numeric DEFAULT 0;
    END IF;
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'loan_products' AND column_name = 'security_deposit_rate') THEN
        ALTER TABLE public.loan_products ADD COLUMN security_deposit_rate numeric DEFAULT 0;
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 13. FEE STRUCTURE (20260211141000)
-- -----------------------------------------------------------------------------
ALTER TABLE public.loan_products
ADD COLUMN IF NOT EXISTS late_payment_penalty NUMERIC DEFAULT 10000,
ADD COLUMN IF NOT EXISTS restructuring_fee_low NUMERIC DEFAULT 30000,
ADD COLUMN IF NOT EXISTS restructuring_fee_high NUMERIC DEFAULT 60000,
ADD COLUMN IF NOT EXISTS restructuring_threshold NUMERIC DEFAULT 600000;

-- -----------------------------------------------------------------------------
-- 13b. LOAN PRODUCTS custom_fees JSON (20260319120000) — fixes PUT/POST when column missing
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 14. LOAN OFFICER POLICY (20260209151500)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Loan Officers can create applications" ON public.loan_applications;
CREATE POLICY "Loan Officers can create applications" ON public.loan_applications 
FOR INSERT TO authenticated 
WITH CHECK (
    public.has_role(auth.uid(), 'loan_officer'::public.app_role) OR 
    public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- -----------------------------------------------------------------------------
-- 15. NOTIFICATIONS TABLE (20260212100000)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- 16. GUARANTORS TABLE (20260310100000) - REQUIRED FOR GUARANTORS FEATURE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.guarantors (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name text NOT NULL,
    email text,
    phone_number text,
    id_number text,
    address text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_guarantors_full_name ON public.guarantors (full_name);
CREATE INDEX IF NOT EXISTS idx_guarantors_phone ON public.guarantors (phone_number);
CREATE INDEX IF NOT EXISTS idx_guarantors_id_number ON public.guarantors (id_number);

-- -----------------------------------------------------------------------------
-- 17. STORAGE BUCKET (20260211143000) - Optional, for file uploads
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'loan-documents',
    'loan-documents',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can upload loan documents" ON storage.objects;
CREATE POLICY "Authenticated users can upload loan documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'loan-documents');

DROP POLICY IF EXISTS "Authenticated users can view loan documents" ON storage.objects;
CREATE POLICY "Authenticated users can view loan documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'loan-documents');

DROP POLICY IF EXISTS "Users can update their own loan documents" ON storage.objects;
CREATE POLICY "Users can update their own loan documents"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'loan-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own loan documents" ON storage.objects;
CREATE POLICY "Users can delete their own loan documents"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'loan-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =============================================================================
-- OPTIONAL: BORROWERS & GROUPS (if your project doesn't have these)
-- =============================================================================
-- Uncomment and run if borrowers/groups tables are missing:

/*
CREATE TABLE IF NOT EXISTS public.borrowers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    first_name text,
    last_middle_name text,
    full_name text,
    email text,
    phone_number text,
    id_number text,
    date_of_birth date,
    address text,
    city text,
    province_state text,
    district text,
    village text,
    parish text,
    sub_county text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.groups (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    group_name text NOT NULL,
    group_leader_phone text,
    description text,
    status text DEFAULT 'active',
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS borrower_id uuid REFERENCES public.borrowers(id) ON DELETE SET NULL;
ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS group_id uuid REFERENCES public.groups(id) ON DELETE SET NULL;
*/

-- -----------------------------------------------------------------------------
-- COLLATERAL BORROWER_ID (owner) - run after borrowers table exists
-- -----------------------------------------------------------------------------
ALTER TABLE public.collateral ADD COLUMN IF NOT EXISTS borrower_id uuid REFERENCES public.borrowers(id) ON DELETE SET NULL;

-- -----------------------------------------------------------------------------
-- REPAYMENTS PENALTY (late payment)
-- -----------------------------------------------------------------------------
ALTER TABLE public.repayments ADD COLUMN IF NOT EXISTS penalty_amount NUMERIC DEFAULT 0;

-- -----------------------------------------------------------------------------
-- PAYROLL TABLES (staff_contracts, payroll_records) - for Accounting Payroll
-- Run setup_accounting.cjs first, or create tables manually. Then add unique:
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payroll_records_user_period_unique') THEN
        ALTER TABLE public.payroll_records ADD CONSTRAINT payroll_records_user_period_unique UNIQUE (user_id, period_month, period_year);
    END IF;
EXCEPTION WHEN undefined_table THEN NULL; -- table may not exist yet
END $$;

-- -----------------------------------------------------------------------------
-- LOAN METRICS (repayment frequency, interest method, rate/fee)
-- -----------------------------------------------------------------------------
ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS repayment_frequency text DEFAULT 'monthly';
ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS interest_method text DEFAULT 'flat_rate';
ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS interest_rate numeric;
ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS interest_fixed_amount numeric;
ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS duration_unit text DEFAULT 'months';

-- =============================================================================
-- DONE. If you get errors about missing tables (e.g. loan_applications, profiles),
-- your base schema may not be set up. The Supabase project template usually
-- creates these. Check that you have: loan_applications, loan_products, profiles,
-- user_roles, auth.users, and the has_role() function.
-- =============================================================================
