-- Mobile money automation: loan reference + Airtel payment message log
-- Used by n8n / Shortcuts ingestion and staff dashboard

-- Human-readable payment reference (e.g. MNT000001)
ALTER TABLE public.loan_applications
ADD COLUMN IF NOT EXISTS loan_reference text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_loan_applications_loan_reference
ON public.loan_applications (loan_reference)
WHERE loan_reference IS NOT NULL;

ALTER TABLE public.loan_applications
ADD COLUMN IF NOT EXISTS outstanding_balance numeric(15,2);

-- Link automated repayments to provider transaction IDs
ALTER TABLE public.repayments
ADD COLUMN IF NOT EXISTS external_transaction_id text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_repayments_external_transaction_id
ON public.repayments (external_transaction_id)
WHERE external_transaction_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.airtel_payment_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id text NOT NULL,
    raw_message text,
    sender_phone text,
    amount numeric(15,2) NOT NULL,
    loan_reference text,
    matched_loan_application_id uuid REFERENCES public.loan_applications(id) ON DELETE SET NULL,
    processing_status text NOT NULL DEFAULT 'pending',
    match_confidence numeric(5,2),
    parsing_status text,
    matching_notes text,
    payment_method text DEFAULT 'mobile_money',
    previous_balance numeric(15,2),
    outstanding_balance numeric(15,2),
    repayment_id uuid REFERENCES public.repayments(id) ON DELETE SET NULL,
    accounting_entry_id uuid,
    received_at timestamptz NOT NULL DEFAULT now(),
    processed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_airtel_payment_messages_received_at
ON public.airtel_payment_messages (received_at DESC);

CREATE INDEX IF NOT EXISTS idx_airtel_payment_messages_processing_status
ON public.airtel_payment_messages (processing_status);

CREATE INDEX IF NOT EXISTS idx_airtel_payment_messages_transaction_id
ON public.airtel_payment_messages (transaction_id);

CREATE INDEX IF NOT EXISTS idx_airtel_payment_messages_matched_loan
ON public.airtel_payment_messages (matched_loan_application_id);

ALTER TABLE public.airtel_payment_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view airtel payment messages" ON public.airtel_payment_messages;
CREATE POLICY "Staff can view airtel payment messages"
ON public.airtel_payment_messages FOR SELECT TO authenticated
USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'loan_officer')
);

DROP POLICY IF EXISTS "Service can insert airtel payment messages" ON public.airtel_payment_messages;
CREATE POLICY "Service can insert airtel payment messages"
ON public.airtel_payment_messages FOR INSERT TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Service can update airtel payment messages" ON public.airtel_payment_messages;
CREATE POLICY "Service can update airtel payment messages"
ON public.airtel_payment_messages FOR UPDATE TO authenticated
USING (true);

-- Realtime for dashboard refresh (optional; staff portal also polls via API)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'airtel_payment_messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.airtel_payment_messages;
    END IF;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;
