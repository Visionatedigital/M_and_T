
-- 1. Policies for Loan Officers
-- Allow Loan Officers to insert new applications
CREATE POLICY "Loan Officers can create applications" ON public.loan_applications 
FOR INSERT TO authenticated 
WITH CHECK (
    public.has_role(auth.uid(), 'loan_officer'::public.app_role) OR 
    public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Ensure Loan Officers can view all applications (already exists as "Staff can view all applications")
-- Ensure Loan Officers can update applications (already exists as "Staff can update applications")

-- 2. Verify Enum includes 'loan_officer' (It does based on schema dump)
-- TYPE public.app_role AS ENUM ('admin', 'loan_officer', 'client');
