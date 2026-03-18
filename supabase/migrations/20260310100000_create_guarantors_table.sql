-- Guarantors directory table for search-and-select in loan applications
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
