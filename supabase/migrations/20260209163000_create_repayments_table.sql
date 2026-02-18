
-- Create repayments table
CREATE TABLE public.repayments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    loan_application_id uuid NOT NULL REFERENCES public.loan_applications(id),
    amount numeric(15,2) NOT NULL,
    payment_date date NOT NULL,
    recorded_by uuid,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- RLS Policies
ALTER TABLE public.repayments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view all repayments" ON public.repayments FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'loan_officer')
);

CREATE POLICY "Staff can insert repayments" ON public.repayments FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'loan_officer')
);

-- Clients can view their own repayments (via loan_application relation)
CREATE POLICY "Clients can view own repayments" ON public.repayments FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.loan_applications la
        WHERE la.id = repayments.loan_application_id
        AND la.user_id = auth.uid()
    )
);
