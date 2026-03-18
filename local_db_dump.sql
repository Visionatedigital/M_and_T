--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view messages from own conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can delete own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create messages in own conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Staff can view valuations" ON public.asset_valuations;
DROP POLICY IF EXISTS "Staff can view territories" ON public.territories;
DROP POLICY IF EXISTS "Staff can view rate settings" ON public.interest_rate_settings;
DROP POLICY IF EXISTS "Staff can view product performance" ON public.product_performance;
DROP POLICY IF EXISTS "Staff can view insurance" ON public.collateral_insurance;
DROP POLICY IF EXISTS "Staff can view branches" ON public.branches;
DROP POLICY IF EXISTS "Staff can view branch performance" ON public.branch_performance;
DROP POLICY IF EXISTS "Staff can view all repayments" ON public.repayments;
DROP POLICY IF EXISTS "Staff can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Staff can view all collateral" ON public.collateral;
DROP POLICY IF EXISTS "Staff can view all applications" ON public.loan_applications;
DROP POLICY IF EXISTS "Staff can update applications" ON public.loan_applications;
DROP POLICY IF EXISTS "Staff can manage valuations" ON public.asset_valuations;
DROP POLICY IF EXISTS "Staff can manage insurance" ON public.collateral_insurance;
DROP POLICY IF EXISTS "Staff can manage collateral" ON public.collateral;
DROP POLICY IF EXISTS "Staff can insert repayments" ON public.repayments;
DROP POLICY IF EXISTS "Loan Officers can create applications" ON public.loan_applications;
DROP POLICY IF EXISTS "Everyone can view active products" ON public.loan_products;
DROP POLICY IF EXISTS "Clients can view own repayments" ON public.repayments;
DROP POLICY IF EXISTS "Clients can view own applications" ON public.loan_applications;
DROP POLICY IF EXISTS "Clients can create applications" ON public.loan_applications;
DROP POLICY IF EXISTS "Admins can manage territories" ON public.territories;
DROP POLICY IF EXISTS "Admins can manage rate settings" ON public.interest_rate_settings;
DROP POLICY IF EXISTS "Admins can manage products" ON public.loan_products;
DROP POLICY IF EXISTS "Admins can manage product performance" ON public.product_performance;
DROP POLICY IF EXISTS "Admins can manage branches" ON public.branches;
DROP POLICY IF EXISTS "Admins can manage branch performance" ON public.branch_performance;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
ALTER TABLE IF EXISTS ONLY public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.repayments DROP CONSTRAINT IF EXISTS repayments_loan_application_id_fkey;
ALTER TABLE IF EXISTS ONLY public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE IF EXISTS ONLY public.product_performance DROP CONSTRAINT IF EXISTS product_performance_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.loan_applications DROP CONSTRAINT IF EXISTS loan_applications_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.loan_applications DROP CONSTRAINT IF EXISTS loan_applications_assigned_officer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.interest_rate_settings DROP CONSTRAINT IF EXISTS interest_rate_settings_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.conversations DROP CONSTRAINT IF EXISTS conversations_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.collateral DROP CONSTRAINT IF EXISTS collateral_loan_application_id_fkey;
ALTER TABLE IF EXISTS ONLY public.collateral_insurance DROP CONSTRAINT IF EXISTS collateral_insurance_collateral_id_fkey;
ALTER TABLE IF EXISTS ONLY public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_conversation_id_fkey;
ALTER TABLE IF EXISTS ONLY public.branches DROP CONSTRAINT IF EXISTS branches_territory_id_fkey;
ALTER TABLE IF EXISTS ONLY public.branch_performance DROP CONSTRAINT IF EXISTS branch_performance_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.asset_valuations DROP CONSTRAINT IF EXISTS asset_valuations_collateral_id_fkey;
DROP TRIGGER IF EXISTS update_territories_updated_at ON public.territories;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_loan_products_updated_at ON public.loan_products;
DROP TRIGGER IF EXISTS update_loan_applications_updated_at ON public.loan_applications;
DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
DROP TRIGGER IF EXISTS update_collateral_updated_at ON public.collateral;
DROP TRIGGER IF EXISTS update_collateral_insurance_updated_at ON public.collateral_insurance;
DROP TRIGGER IF EXISTS update_branches_updated_at ON public.branches;
DROP INDEX IF EXISTS public.idx_product_performance_product;
DROP INDEX IF EXISTS public.idx_interest_rate_settings_product;
DROP INDEX IF EXISTS public.idx_conversations_user_id;
DROP INDEX IF EXISTS public.idx_collateral_loan_application;
DROP INDEX IF EXISTS public.idx_collateral_insurance_collateral;
DROP INDEX IF EXISTS public.idx_chat_messages_conversation_id;
DROP INDEX IF EXISTS public.idx_branches_territory;
DROP INDEX IF EXISTS public.idx_branch_performance_branch;
DROP INDEX IF EXISTS public.idx_asset_valuations_collateral;
ALTER TABLE IF EXISTS ONLY storage.buckets DROP CONSTRAINT IF EXISTS buckets_pkey;
ALTER TABLE IF EXISTS ONLY public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;
ALTER TABLE IF EXISTS ONLY public.user_roles DROP CONSTRAINT IF EXISTS user_roles_pkey;
ALTER TABLE IF EXISTS ONLY public.territories DROP CONSTRAINT IF EXISTS territories_pkey;
ALTER TABLE IF EXISTS ONLY public.territories DROP CONSTRAINT IF EXISTS territories_name_key;
ALTER TABLE IF EXISTS ONLY public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.product_performance DROP CONSTRAINT IF EXISTS product_performance_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.loan_products DROP CONSTRAINT IF EXISTS loan_products_pkey;
ALTER TABLE IF EXISTS ONLY public.loan_products DROP CONSTRAINT IF EXISTS loan_products_code_key;
ALTER TABLE IF EXISTS ONLY public.loan_applications DROP CONSTRAINT IF EXISTS loan_applications_pkey;
ALTER TABLE IF EXISTS ONLY public.interest_rate_settings DROP CONSTRAINT IF EXISTS interest_rate_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.groups DROP CONSTRAINT IF EXISTS groups_pkey;
ALTER TABLE IF EXISTS ONLY public.conversations DROP CONSTRAINT IF EXISTS conversations_pkey;
ALTER TABLE IF EXISTS ONLY public.collateral DROP CONSTRAINT IF EXISTS collateral_pkey;
ALTER TABLE IF EXISTS ONLY public.collateral_insurance DROP CONSTRAINT IF EXISTS collateral_insurance_pkey;
ALTER TABLE IF EXISTS ONLY public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_pkey;
ALTER TABLE IF EXISTS ONLY public.branches DROP CONSTRAINT IF EXISTS branches_pkey;
ALTER TABLE IF EXISTS ONLY public.branches DROP CONSTRAINT IF EXISTS branches_code_key;
ALTER TABLE IF EXISTS ONLY public.branch_performance DROP CONSTRAINT IF EXISTS branch_performance_pkey;
ALTER TABLE IF EXISTS ONLY public.asset_valuations DROP CONSTRAINT IF EXISTS asset_valuations_pkey;
ALTER TABLE IF EXISTS ONLY auth.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY auth.users DROP CONSTRAINT IF EXISTS auth_users_email_key;
DROP TABLE IF EXISTS storage.buckets;
DROP TABLE IF EXISTS public.user_roles;
DROP TABLE IF EXISTS public.territories;
DROP TABLE IF EXISTS public.repayments;
DROP TABLE IF EXISTS public.profiles;
DROP TABLE IF EXISTS public.product_performance;
DROP TABLE IF EXISTS public.notifications;
DROP TABLE IF EXISTS public.loan_products;
DROP TABLE IF EXISTS public.loan_applications;
DROP TABLE IF EXISTS public.interest_rate_settings;
DROP TABLE IF EXISTS public.groups;
DROP TABLE IF EXISTS public.conversations;
DROP TABLE IF EXISTS public.collateral_insurance;
DROP TABLE IF EXISTS public.collateral;
DROP TABLE IF EXISTS public.chat_messages;
DROP TABLE IF EXISTS public.branches;
DROP TABLE IF EXISTS public.branch_performance;
DROP TABLE IF EXISTS public.asset_valuations;
DROP TABLE IF EXISTS auth.users;
DROP FUNCTION IF EXISTS public.has_role(_user_id uuid, _role public.app_role);
DROP FUNCTION IF EXISTS public.handle_updated_at();
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS auth.uid();
DROP FUNCTION IF EXISTS auth.role();
DROP TYPE IF EXISTS public.app_role;
DROP EXTENSION IF EXISTS "uuid-ossp";
DROP EXTENSION IF EXISTS pgcrypto;
DROP EXTENSION IF EXISTS pg_stat_statements;
DROP SCHEMA IF EXISTS storage;
DROP SCHEMA IF EXISTS auth;
--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA public;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'loan_officer',
    'client'
);


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$ SELECT 'authenticated'::text $$;


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$ SELECT null::uuid $$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone_number, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  
  -- Assign default 'client' role to new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');
  
  RETURN NEW;
END;
$$;


--
-- Name: handle_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    id uuid NOT NULL,
    email text,
    raw_user_meta_data jsonb,
    created_at timestamp with time zone DEFAULT now(),
    password_hash text
);


--
-- Name: asset_valuations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.asset_valuations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    collateral_id uuid NOT NULL,
    valuation_date date NOT NULL,
    valued_by text NOT NULL,
    valuation_amount numeric NOT NULL,
    valuation_method text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: branch_performance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.branch_performance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    branch_id uuid NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    total_loans integer DEFAULT 0 NOT NULL,
    total_disbursed numeric DEFAULT 0 NOT NULL,
    total_repayments numeric DEFAULT 0 NOT NULL,
    active_clients integer DEFAULT 0 NOT NULL,
    new_clients integer DEFAULT 0 NOT NULL,
    default_rate numeric,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: branches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.branches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    address text NOT NULL,
    phone text,
    email text,
    manager_id uuid,
    territory_id uuid,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chat_messages_role_check CHECK ((role = ANY (ARRAY['user'::text, 'assistant'::text])))
);


--
-- Name: collateral; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.collateral (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    loan_application_id uuid,
    type text NOT NULL,
    description text NOT NULL,
    estimated_value numeric NOT NULL,
    current_value numeric,
    status text DEFAULT 'active'::text NOT NULL,
    location text,
    registration_number text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: collateral_insurance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.collateral_insurance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    collateral_id uuid NOT NULL,
    insurance_company text NOT NULL,
    policy_number text NOT NULL,
    coverage_amount numeric NOT NULL,
    premium_amount numeric NOT NULL,
    start_date date NOT NULL,
    expiry_date date NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.groups (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    group_name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    status text DEFAULT 'active'::text
);


--
-- Name: interest_rate_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.interest_rate_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    rate_type text NOT NULL,
    base_rate numeric NOT NULL,
    margin numeric DEFAULT 0,
    effective_from date NOT NULL,
    effective_to date,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: loan_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loan_applications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    full_name text NOT NULL,
    email text NOT NULL,
    phone_number text NOT NULL,
    id_number text NOT NULL,
    date_of_birth date NOT NULL,
    address text NOT NULL,
    loan_product text NOT NULL,
    loan_amount numeric(15,2) NOT NULL,
    loan_duration_months integer NOT NULL,
    loan_purpose text NOT NULL,
    employment_status text NOT NULL,
    employer_name text,
    monthly_income numeric(15,2),
    status text DEFAULT 'pending'::text NOT NULL,
    assigned_officer_id uuid,
    rejection_reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    reviewed_at timestamp with time zone,
    approved_at timestamp with time zone,
    group_members jsonb DEFAULT '[]'::jsonb,
    amount_paid numeric DEFAULT 0 NOT NULL,
    loan_category text,
    district text,
    division text,
    county text,
    sub_county text,
    parish text,
    village text,
    business_location text,
    guarantors jsonb DEFAULT '[]'::jsonb,
    witness_details jsonb DEFAULT '{}'::jsonb,
    security_type text,
    security_value numeric,
    attachment_national_id text,
    attachment_lc1_letter text,
    attachment_recommendation_letter text,
    attachment_passport_photo text,
    attachment_income_statement text,
    attachment_uploaded_at timestamp with time zone,
    group_name text,
    group_id uuid,
    insurance_status text DEFAULT 'Not Insured'::text,
    CONSTRAINT loan_applications_amount_paid_check CHECK ((amount_paid >= (0)::numeric)),
    CONSTRAINT loan_applications_loan_category_check CHECK (((loan_category IS NULL) OR (loan_category = ANY (ARRAY['Business'::text, 'Agricultural'::text, 'School Fees'::text, 'Emergency'::text, 'Other'::text])))),
    CONSTRAINT loan_applications_loan_product_check CHECK ((loan_product = ANY (ARRAY['Personal Loans'::text, 'Civil Servant Loans'::text, 'Logbook Finance Loans'::text, 'SME Loans'::text, 'Bodaboda Group Loan'::text, 'Individual Loan'::text, 'Group Loan'::text]))),
    CONSTRAINT loan_applications_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'under_review'::text, 'approved'::text, 'rejected'::text, 'disbursed'::text])))
);


--
-- Name: COLUMN loan_applications.group_members; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.loan_applications.group_members IS 'List of group members for Group Loan applications, containing name, phone, and ID';


--
-- Name: COLUMN loan_applications.amount_paid; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.loan_applications.amount_paid IS 'Total amount paid towards this loan';


--
-- Name: COLUMN loan_applications.security_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.loan_applications.security_type IS 'Type of security/collateral pledged for secured loans';


--
-- Name: COLUMN loan_applications.security_value; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.loan_applications.security_value IS 'Estimated value of the security/collateral in UGX';


--
-- Name: COLUMN loan_applications.attachment_national_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.loan_applications.attachment_national_id IS 'URL/path to National ID card photocopy';


--
-- Name: COLUMN loan_applications.attachment_lc1_letter; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.loan_applications.attachment_lc1_letter IS 'URL/path to LC1 Recommendation Letter';


--
-- Name: COLUMN loan_applications.attachment_recommendation_letter; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.loan_applications.attachment_recommendation_letter IS 'URL/path to other recommendation letter (Market Chairperson, Boda stage Chairman, etc.)';


--
-- Name: COLUMN loan_applications.attachment_passport_photo; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.loan_applications.attachment_passport_photo IS 'URL/path to passport size photo';


--
-- Name: COLUMN loan_applications.attachment_income_statement; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.loan_applications.attachment_income_statement IS 'URL/path to detailed monthly income and expenditure statement';


--
-- Name: COLUMN loan_applications.attachment_uploaded_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.loan_applications.attachment_uploaded_at IS 'Timestamp when attachments were last uploaded';


--
-- Name: COLUMN loan_applications.group_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.loan_applications.group_name IS 'Name of the group for Group Loan applications';


--
-- Name: loan_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loan_products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    min_amount numeric NOT NULL,
    max_amount numeric NOT NULL,
    min_duration_months integer NOT NULL,
    max_duration_months integer NOT NULL,
    base_interest_rate numeric NOT NULL,
    processing_fee_percentage numeric DEFAULT 0 NOT NULL,
    late_payment_penalty_rate numeric DEFAULT 0,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    application_fee numeric DEFAULT 0,
    admission_fee numeric DEFAULT 0,
    processing_fee numeric DEFAULT 0,
    passbook_fee numeric DEFAULT 0,
    insurance_rate numeric DEFAULT 0,
    security_deposit_rate numeric DEFAULT 0,
    monitoring_fee_rate numeric DEFAULT 3.0,
    late_payment_penalty numeric DEFAULT 10000,
    restructuring_fee_low numeric DEFAULT 30000,
    restructuring_fee_high numeric DEFAULT 60000,
    restructuring_threshold numeric DEFAULT 600000
);


--
-- Name: COLUMN loan_products.late_payment_penalty; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.loan_products.late_payment_penalty IS 'Late payment penalty per missed installment (UGX)';


--
-- Name: COLUMN loan_products.restructuring_fee_low; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.loan_products.restructuring_fee_low IS 'Loan restructuring fee for amounts ≤ threshold (UGX)';


--
-- Name: COLUMN loan_products.restructuring_fee_high; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.loan_products.restructuring_fee_high IS 'Loan restructuring fee for amounts > threshold (UGX)';


--
-- Name: COLUMN loan_products.restructuring_threshold; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.loan_products.restructuring_threshold IS 'Threshold amount for restructuring fee calculation (UGX)';


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL,
    read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT notifications_type_check CHECK ((type = ANY (ARRAY['info'::text, 'success'::text, 'warning'::text, 'error'::text])))
);


--
-- Name: product_performance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_performance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    total_applications integer DEFAULT 0 NOT NULL,
    approved_applications integer DEFAULT 0 NOT NULL,
    rejected_applications integer DEFAULT 0 NOT NULL,
    total_disbursed numeric DEFAULT 0 NOT NULL,
    average_loan_amount numeric,
    default_rate numeric,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name text,
    phone_number text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    first_name text,
    last_name text,
    email text,
    role text DEFAULT 'client'::text
);


--
-- Name: repayments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.repayments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    loan_application_id uuid NOT NULL,
    amount numeric(15,2) NOT NULL,
    payment_date date NOT NULL,
    recorded_by uuid,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    status text DEFAULT 'paid'::text,
    payment_method text DEFAULT 'cash'::text,
    member_breakdown jsonb DEFAULT '[]'::jsonb
);


--
-- Name: COLUMN repayments.member_breakdown; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.repayments.member_breakdown IS 'Stores individual member payment amounts for group loans. Format: [{"name": String, "nin": String, "amount": Number}]';


--
-- Name: territories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.territories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[]
);


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.users (id, email, raw_user_meta_data, created_at, password_hash) FROM stdin;
a9c3e1ee-7c5c-4289-b123-575d8bec610f	loanofficer@mandt.placeholder	{"full_name": "Loan Officer", "last_name": "Officer", "first_name": "Loan"}	2026-02-11 15:49:41.235692+03	$2b$10$LuBpDIGsZtm6imB7nveA1eDlrmS51Wr.S/hiYH2fDnxsrvvY08sU.
70e0ab1e-d1e9-40a0-bdf6-373ffcced22e	admin@mandt.placeholder	{"full_name": "Admin User", "last_name": "User", "first_name": "Admin"}	2026-02-11 15:49:41.390122+03	$2b$10$uuO/6XXfkmGbIKNl1AMOzugXn0D7zo.QzwiWAVhct18y4KunLU78e
5a218cd8-8534-4318-9dec-f25dff525f79	5a218cd8-8534-4318-9dec-f25dff525f79@mandt.placeholder	{"full_name": "Kapere Sam"}	2026-02-10 16:36:25.053599+03	$2a$10$dummyhash
87194ae2-4558-439a-8588-d7a2ee112cd6	87194ae2-4558-439a-8588-d7a2ee112cd6@mandt.placeholder	{"full_name": "Munyangwa Ibrahim"}	2026-02-10 16:36:26.428767+03	$2a$10$dummyhash
c237da3b-6ee7-4212-9ff8-762a1a6a4b93	c237da3b-6ee7-4212-9ff8-762a1a6a4b93@mandt.placeholder	{"full_name": "Guma Ali"}	2026-02-10 16:36:27.834986+03	$2a$10$dummyhash
46c558d4-8b57-43a2-a50e-31f03904eb26	46c558d4-8b57-43a2-a50e-31f03904eb26@mandt.placeholder	{"full_name": "Ssebakwa Fredrick"}	2026-02-10 16:36:29.129955+03	$2a$10$dummyhash
0f7be754-2359-44de-b1f7-66ef723b60dc	0f7be754-2359-44de-b1f7-66ef723b60dc@mandt.placeholder	{"full_name": "Ndimu Peter"}	2026-02-10 16:36:30.531256+03	$2a$10$dummyhash
08c99fd2-53e2-4b4a-b7f5-8aaf2b20f907	08c99fd2-53e2-4b4a-b7f5-8aaf2b20f907@mandt.placeholder	{"full_name": "Mrs.  Namirembe Immaculate"}	2026-02-10 16:36:36.979991+03	$2a$10$dummyhash
0d3a6b23-e637-4c45-bc7d-b0bcef2741d6	0d3a6b23-e637-4c45-bc7d-b0bcef2741d6@mandt.placeholder	{"full_name": "Mr.  LUKWAGO HENRY MUKASA"}	2026-02-10 16:36:44.778949+03	$2a$10$dummyhash
ca8b90a7-03e4-450c-9b1c-e6fa619d2413	ca8b90a7-03e4-450c-9b1c-e6fa619d2413@mandt.placeholder	{"full_name": "MUYIMA MOSES"}	2026-02-10 16:36:46.0632+03	$2a$10$dummyhash
76147086-d57b-41da-83d4-575e93f7e275	76147086-d57b-41da-83d4-575e93f7e275@mandt.placeholder	{"full_name": "SSERUNJOGI STEVEN"}	2026-02-10 16:36:41.530334+03	$2a$10$dummyhash
64ed8cf0-3cea-4187-bad6-7780cb5b83b9	64ed8cf0-3cea-4187-bad6-7780cb5b83b9@mandt.placeholder	{"full_name": "KARUNDA DAVID"}	2026-02-10 16:36:49.113648+03	$2a$10$dummyhash
8894dc84-80bb-40d2-925c-476c8609f515	8894dc84-80bb-40d2-925c-476c8609f515@mandt.placeholder	{"full_name": "Mr.  BIHANGANA VICENT"}	2026-02-10 16:36:43.47542+03	$2a$10$dummyhash
d798d12d-4909-4ef9-8835-82f076893498	d798d12d-4909-4ef9-8835-82f076893498@mandt.placeholder	{"full_name": "Mrs.  Nasanga Joan"}	2026-02-10 16:37:11.527272+03	$2a$10$dummyhash
398d9545-0878-427b-8c1f-3c1ee8da2289	398d9545-0878-427b-8c1f-3c1ee8da2289@mandt.placeholder	{"full_name": "Mr.  KAYONDO JOSEPH"}	2026-02-10 16:37:14.912537+03	$2a$10$dummyhash
ca678f80-cca3-4630-afc8-1a53a3d8624d	ca678f80-cca3-4630-afc8-1a53a3d8624d@mandt.placeholder	{"full_name": "Mr.  NDAWULA ALI"}	2026-02-10 16:36:50.382567+03	$2a$10$dummyhash
1147d73b-a3a5-4b38-be6a-ccf70b5da29d	1147d73b-a3a5-4b38-be6a-ccf70b5da29d@mandt.placeholder	{"full_name": "Mrs.  NAYIGA JUSTINE"}	2026-02-10 16:37:21.790773+03	$2a$10$dummyhash
56a7e770-65b6-45a2-adb9-9a4baf10f39e	56a7e770-65b6-45a2-adb9-9a4baf10f39e@mandt.placeholder	{"full_name": "Mrs.  NAWAGI JOYCE"}	2026-02-10 16:36:38.750709+03	$2a$10$dummyhash
a0ed9630-5c89-4325-8741-daed1f6f16b9	a0ed9630-5c89-4325-8741-daed1f6f16b9@mandt.placeholder	{"full_name": "Mr.  LUTALO BEN HAZARD"}	2026-02-10 16:36:58.714104+03	$2a$10$dummyhash
4778602d-e5f5-48d3-a87f-6f65c318613d	4778602d-e5f5-48d3-a87f-6f65c318613d@mandt.placeholder	{"full_name": "Mr.  KIDEDE PAUL"}	2026-02-10 16:37:26.562728+03	$2a$10$dummyhash
ff5dc921-d909-4c4d-a770-4d3e2872c9e7	ff5dc921-d909-4c4d-a770-4d3e2872c9e7@mandt.placeholder	{"full_name": "Mr.  MUGULA ISMA"}	2026-02-10 16:36:53.026391+03	$2a$10$dummyhash
85fb9db8-ec17-4b2b-8a68-46c80b20dd4d	85fb9db8-ec17-4b2b-8a68-46c80b20dd4d@mandt.placeholder	{"full_name": "GUMISIRIZA GODFREY"}	2026-02-10 16:36:40.023015+03	$2a$10$dummyhash
cf4d9289-0a0e-4d1f-b041-a1c2b935bb4b	cf4d9289-0a0e-4d1f-b041-a1c2b935bb4b@mandt.placeholder	{"full_name": "Mrs.  NANDUTU OLIVIER"}	2026-02-10 16:37:30.603161+03	$2a$10$dummyhash
b6fe01e8-d76e-4768-aee3-a579608e9704	b6fe01e8-d76e-4768-aee3-a579608e9704@mandt.placeholder	{"full_name": "Mr.  NDYANABO EMMA"}	2026-02-10 16:37:31.910004+03	$2a$10$dummyhash
20522b0d-0de3-4869-aa3f-5cfee56a032e	20522b0d-0de3-4869-aa3f-5cfee56a032e@mandt.placeholder	{"full_name": "Mrs.  NAMUSISI BEATRICE"}	2026-02-10 16:37:37.045251+03	$2a$10$dummyhash
87ad863b-9d24-4e06-94e8-6ad589708b8b	87ad863b-9d24-4e06-94e8-6ad589708b8b@mandt.placeholder	{"full_name": "Mr.  SSEKIDE HASSAN"}	2026-02-10 16:37:47.381556+03	$2a$10$dummyhash
fff172ab-ba0e-4c81-b24c-b95745eae361	fff172ab-ba0e-4c81-b24c-b95745eae361@mandt.placeholder	{"full_name": "Mr.  SSENTONGO GODFREY"}	2026-02-10 16:37:42.213235+03	$2a$10$dummyhash
45c6041d-2a04-44cc-8bbc-0b5deeb718fa	45c6041d-2a04-44cc-8bbc-0b5deeb718fa@mandt.placeholder	{"full_name": "Mr.  SSENDUSU JOHN"}	2026-02-10 16:37:18.743086+03	$2a$10$dummyhash
906dc5cd-8041-4e1a-9a63-7fd07dd14241	906dc5cd-8041-4e1a-9a63-7fd07dd14241@mandt.placeholder	{"full_name": "Mr.  Lumu Steven"}	2026-02-10 16:37:14.08314+03	$2a$10$dummyhash
461d76e8-03a5-4ddc-8021-b89f84d1fcb1	461d76e8-03a5-4ddc-8021-b89f84d1fcb1@mandt.placeholder	{"full_name": "Mrs.  KARUNGI JULIET"}	2026-02-10 16:37:53.531313+03	$2a$10$dummyhash
3af8c53e-0147-4274-9e44-8cd8ae16a030	3af8c53e-0147-4274-9e44-8cd8ae16a030@mandt.placeholder	{"full_name": "Mrs.  Nakabuye Hajarah"}	2026-02-10 16:37:50.402153+03	$2a$10$dummyhash
244a8883-eef2-4d96-a8b1-bee4d15a1bf9	244a8883-eef2-4d96-a8b1-bee4d15a1bf9@mandt.placeholder	{"full_name": "Mrs.  Tibesigwa Ritah"}	2026-02-10 16:37:54.829523+03	$2a$10$dummyhash
36ea564e-08dc-4b79-a51e-9672b2d0f5e7	36ea564e-08dc-4b79-a51e-9672b2d0f5e7@mandt.placeholder	{"full_name": "Mrs.  Twashemererwa Jacent"}	2026-02-10 16:37:57.895164+03	$2a$10$dummyhash
1a7aecf1-f950-46b8-a064-562c7afdebe3	1a7aecf1-f950-46b8-a064-562c7afdebe3@mandt.placeholder	{"full_name": "Mr.  muwonge fredrick"}	2026-02-10 16:38:01.879068+03	$2a$10$dummyhash
45d167ad-cbc8-4604-801f-80a1a78dcd0c	45d167ad-cbc8-4604-801f-80a1a78dcd0c@mandt.placeholder	{"full_name": "Mrs.  Nantale Joyce"}	2026-02-10 16:38:03.764885+03	$2a$10$dummyhash
ea118873-acc5-4939-a12e-1f9602822a57	ea118873-acc5-4939-a12e-1f9602822a57@mandt.placeholder	{"full_name": "Mrs.  Ncungwire Justine"}	2026-02-10 16:38:05.060263+03	$2a$10$dummyhash
51fba39e-a0f8-4d52-ad30-709cea8a5697	51fba39e-a0f8-4d52-ad30-709cea8a5697@mandt.placeholder	{"full_name": "Mrs.  NANONO PERAGIA"}	2026-02-10 16:37:56.136337+03	$2a$10$dummyhash
a5ff6a6b-e7ee-44d4-9231-3c073ebee14a	a5ff6a6b-e7ee-44d4-9231-3c073ebee14a@mandt.placeholder	{"full_name": "Mr.  BOGERE JULIUS"}	2026-02-10 16:38:00.966602+03	$2a$10$dummyhash
8f859eb2-d773-46b3-a5f9-1e294086690e	8f859eb2-d773-46b3-a5f9-1e294086690e@mandt.placeholder	{"full_name": "Mr.  Muhwezi Benson"}	2026-02-10 16:37:23.532845+03	$2a$10$dummyhash
da82fe19-5117-4a8e-b0f3-98bad412da08	da82fe19-5117-4a8e-b0f3-98bad412da08@mandt.placeholder	{"full_name": "Mr.  Sebunya Brayn Kirumira"}	2026-02-10 16:36:35.242575+03	$2a$10$dummyhash
648b5fc5-50ba-42b7-a97a-aaf5413407f7	648b5fc5-50ba-42b7-a97a-aaf5413407f7@mandt.placeholder	{"full_name": "Mr.  Nabagala Hope"}	2026-02-10 16:36:32.371851+03	$2a$10$dummyhash
8958a566-c8b3-4930-8577-109bf449e076	8958a566-c8b3-4930-8577-109bf449e076@mandt.placeholder	{"full_name": "Mr.  Nyesiga Ronald"}	2026-02-10 16:36:33.974876+03	$2a$10$dummyhash
e710d279-5467-4f11-be51-a94abca5b710	e710d279-5467-4f11-be51-a94abca5b710@mandt.placeholder	{"full_name": "Mr.  MULEMBE STUART"}	2026-02-10 16:36:54.36815+03	$2a$10$dummyhash
ffaf7306-9024-402a-812f-e8cfbf452b15	ffaf7306-9024-402a-812f-e8cfbf452b15@mandt.placeholder	{"full_name": "Mr.  SSEWAGUDDE MATIA"}	2026-02-10 16:37:38.370911+03	$2a$10$dummyhash
a8d7e41b-dd4a-4879-8968-180f86d1f43e	a8d7e41b-dd4a-4879-8968-180f86d1f43e@mandt.placeholder	{"full_name": "Mr.  KALIRO ABBEY"}	2026-02-10 16:37:39.629471+03	$2a$10$dummyhash
9cc5c271-1552-4c24-978d-5897036932de	9cc5c271-1552-4c24-978d-5897036932de@mandt.placeholder	{"full_name": "Mr.  LUWAGA MUSA"}	2026-02-10 16:37:43.495063+03	$2a$10$dummyhash
73c067a6-6c1a-4d9a-8d95-76ac6053b8d3	73c067a6-6c1a-4d9a-8d95-76ac6053b8d3@mandt.placeholder	{"full_name": "Mr.  KYAKABALE BENON"}	2026-02-10 16:37:59.27932+03	$2a$10$dummyhash
cf288872-d7a0-4a36-8b86-509eab5f1146	cf288872-d7a0-4a36-8b86-509eab5f1146@mandt.placeholder	{"full_name": "Mrs.  NALUKENGE SHAKIRAH"}	2026-02-10 16:37:52.245202+03	$2a$10$dummyhash
07b840ac-8504-4d08-b1ca-778bf8271702	07b840ac-8504-4d08-b1ca-778bf8271702@mandt.placeholder	{"full_name": "Nakasi Teopista"}	2026-02-10 16:37:04.323538+03	$2a$10$dummyhash
43145b30-d275-44b4-bb15-024687674189	43145b30-d275-44b4-bb15-024687674189@mandt.placeholder	{"full_name": "Mr.  ABAASA BERNARD"}	2026-02-10 16:36:23.277968+03	$2a$10$dummyhash
2a68ef83-3cae-4aa3-91eb-9148763a0bff	2a68ef83-3cae-4aa3-91eb-9148763a0bff@mandt.placeholder	{"full_name": "Mr.  LUKWAGO ALEX"}	2026-02-10 16:37:33.351988+03	$2a$10$dummyhash
2fe761b1-4c9a-41bd-bcd5-5c1465a34f17	2fe761b1-4c9a-41bd-bcd5-5c1465a34f17@mandt.placeholder	{"full_name": "Mrs.  LWANGA AGNES"}	2026-02-10 16:37:01.285611+03	$2a$10$dummyhash
30a61edc-4fd5-4fb0-9dc6-e42e9f9ec279	30a61edc-4fd5-4fb0-9dc6-e42e9f9ec279@mandt.placeholder	{"full_name": "Mr.  TENYWE HARUNAH"}	2026-02-10 16:36:59.984731+03	$2a$10$dummyhash
5a6d4663-e879-4447-bc23-2aa0f66bfd3a	5a6d4663-e879-4447-bc23-2aa0f66bfd3a@mandt.placeholder	{"full_name": "Mr.  BYARUGABA DENNIS"}	2026-02-10 16:37:02.601512+03	$2a$10$dummyhash
16fbb71e-32dc-4d1b-8610-07ab5997e3fd	16fbb71e-32dc-4d1b-8610-07ab5997e3fd@mandt.placeholder	{"full_name": "Mrs.  NAISANGA JOAN"}	2026-02-10 16:37:08.9904+03	$2a$10$dummyhash
7361aa03-3224-4942-a9f7-b80133bd0fdb	7361aa03-3224-4942-a9f7-b80133bd0fdb@mandt.placeholder	{"full_name": "Mrs.  NALWANGA MAGRET"}	2026-02-10 16:37:07.694509+03	$2a$10$dummyhash
2d2a749a-ffc2-4c3c-94ef-24984a93501b	2d2a749a-ffc2-4c3c-94ef-24984a93501b@mandt.placeholder	{"full_name": "Mrs.  NAKABIRI FLORENCE"}	2026-02-10 16:36:57.364032+03	$2a$10$dummyhash
c123af7d-86e9-4bd0-a968-273b4291dc40	c123af7d-86e9-4bd0-a968-273b4291dc40@mandt.placeholder	{"full_name": "Mrs.  NIGHT HANIFAH"}	2026-02-10 16:36:51.670214+03	$2a$10$dummyhash
12f6afda-3c17-4dad-8ce7-9c9123c141b4	12f6afda-3c17-4dad-8ce7-9c9123c141b4@mandt.placeholder	{"full_name": "Mr.  WAVAMUNO LIVINGSTONE"}	2026-02-10 16:37:35.213704+03	$2a$10$dummyhash
53101c52-9e48-49bc-a11b-01f487676219	53101c52-9e48-49bc-a11b-01f487676219@mandt.placeholder	{"full_name": "Mr.  MUKISA ROBERT"}	2026-02-10 16:37:06.028248+03	$2a$10$dummyhash
f7c12317-0c1c-4190-9b9a-5caad1764429	f7c12317-0c1c-4190-9b9a-5caad1764429@mandt.placeholder	{"full_name": "Mr.  Kayemba Paul"}	2026-02-10 16:38:06.402392+03	$2a$10$dummyhash
e4dd6ff0-ad6d-4a45-9b99-b0200a83fb18	e4dd6ff0-ad6d-4a45-9b99-b0200a83fb18@mandt.placeholder	{"full_name": "Mrs.  Twinomugisha Joan"}	2026-02-10 16:38:07.736026+03	$2a$10$dummyhash
e57c350a-f75f-4e71-b4da-f47b4d44d262	e57c350a-f75f-4e71-b4da-f47b4d44d262@mandt.placeholder	{"full_name": "Mr.  Ssemakula Latib Jr"}	2026-02-10 16:38:10.08817+03	$2a$10$dummyhash
87b26a5d-79c2-4cd6-b339-00c7a341408c	87b26a5d-79c2-4cd6-b339-00c7a341408c@mandt.placeholder	{"full_name": "Mr.  Kyalwazi Marvin"}	2026-02-10 16:38:14.767825+03	$2a$10$dummyhash
04c0f3b9-27a6-4e51-8307-2d8bcd023e9f	04c0f3b9-27a6-4e51-8307-2d8bcd023e9f@mandt.placeholder	{"full_name": "Mr.  Kakuru Peter"}	2026-02-10 16:38:16.507504+03	$2a$10$dummyhash
274fc050-6669-4c2f-8b75-25b5c600a9a3	274fc050-6669-4c2f-8b75-25b5c600a9a3@mandt.placeholder	{"full_name": "Mrs.  Nankanjja Teddy"}	2026-02-10 16:38:18.192964+03	$2a$10$dummyhash
9633201d-8330-40a9-af73-ea68366ee806	9633201d-8330-40a9-af73-ea68366ee806@mandt.placeholder	{"full_name": "Mrs.  Nampijja Saudah"}	2026-02-10 16:38:19.629239+03	$2a$10$dummyhash
caa1e465-033e-44b9-beed-69f6f0a7eefe	caa1e465-033e-44b9-beed-69f6f0a7eefe@mandt.placeholder	{"full_name": "Mr.  Mwanje Richard"}	2026-02-10 16:38:21.185776+03	$2a$10$dummyhash
efad4b39-5441-43e6-982b-ea57e3ebb3a7	efad4b39-5441-43e6-982b-ea57e3ebb3a7@mandt.placeholder	{"full_name": "Mrs.  Kyolaba Mary"}	2026-02-10 16:38:22.610332+03	$2a$10$dummyhash
55d03c23-0f31-42d5-89dd-d304c473fed6	55d03c23-0f31-42d5-89dd-d304c473fed6@mandt.placeholder	{"full_name": "Mr.  OGWANG JASPHER"}	2026-02-10 16:38:13.399222+03	$2a$10$dummyhash
a3681da4-6464-43bb-b82d-5553442f8844	a3681da4-6464-43bb-b82d-5553442f8844@mandt.placeholder	{"full_name": "Mr.  Nviiri Herman"}	2026-02-10 16:38:27.310968+03	$2a$10$dummyhash
5562b768-7aa7-467e-94e4-164019727ad9	5562b768-7aa7-467e-94e4-164019727ad9@mandt.placeholder	{"full_name": "Mr.  Mupuya Godfrey"}	2026-02-10 16:38:28.684501+03	$2a$10$dummyhash
25ffad69-f7f7-4de4-8efc-7db0b2b5137e	25ffad69-f7f7-4de4-8efc-7db0b2b5137e@mandt.placeholder	{"full_name": "Mr.  Busulwa Andrew Robert"}	2026-02-10 16:38:30.03576+03	$2a$10$dummyhash
1c3e2202-beab-405e-9834-312469eb151a	1c3e2202-beab-405e-9834-312469eb151a@mandt.placeholder	{"full_name": "Mr.  Nahabwe Anxious"}	2026-02-10 16:38:31.400606+03	$2a$10$dummyhash
c7d1ca17-6571-4a26-a6c2-b4af2373a9a8	c7d1ca17-6571-4a26-a6c2-b4af2373a9a8@mandt.placeholder	{"full_name": "Mr.  Ssentuyo Yusuf"}	2026-02-10 16:38:33.242276+03	$2a$10$dummyhash
5c8ea7dd-10d5-408a-84b1-77f61b2bc0a5	5c8ea7dd-10d5-408a-84b1-77f61b2bc0a5@mandt.placeholder	{"full_name": "Mr.  Seguya Julius"}	2026-02-10 16:38:35.931938+03	$2a$10$dummyhash
6c76aad7-e97a-40fe-b36e-88fa6dd4d357	6c76aad7-e97a-40fe-b36e-88fa6dd4d357@mandt.placeholder	{"full_name": "Mr.  Mulinde Alex"}	2026-02-10 16:38:34.588242+03	$2a$10$dummyhash
a0624077-ac54-45e4-a178-ec2a612938d9	a0624077-ac54-45e4-a178-ec2a612938d9@mandt.placeholder	{"full_name": "Mr.  Ssekanjako Ronnie"}	2026-02-10 16:38:41.683173+03	$2a$10$dummyhash
f5bdb75d-a315-4711-9617-9dd39bbc8bc1	f5bdb75d-a315-4711-9617-9dd39bbc8bc1@mandt.placeholder	{"full_name": "Mr.  Besigye Muzayima"}	2026-02-10 16:38:43.12236+03	$2a$10$dummyhash
e713184d-6e52-46bb-be36-af8ae8c0144d	e713184d-6e52-46bb-be36-af8ae8c0144d@mandt.placeholder	{"full_name": "Mr.  Tusingirwe Obed"}	2026-02-10 16:38:44.422717+03	$2a$10$dummyhash
157c3aee-47ce-4962-a89f-104c66fdfdd1	157c3aee-47ce-4962-a89f-104c66fdfdd1@mandt.placeholder	{"full_name": "Mr.  Lubulwa Geofrey"}	2026-02-10 16:38:45.745204+03	$2a$10$dummyhash
4996d1e4-331a-45fb-85f1-e4378a6d6b19	4996d1e4-331a-45fb-85f1-e4378a6d6b19@mandt.placeholder	{"full_name": "Mr.  Sekyanzi Sharif"}	2026-02-10 16:38:47.532492+03	$2a$10$dummyhash
38ca11c1-d90e-4fba-afb4-fc4d24295f5f	38ca11c1-d90e-4fba-afb4-fc4d24295f5f@mandt.placeholder	{"full_name": "Mr.  Wasswa Geofrey"}	2026-02-10 16:38:48.833601+03	$2a$10$dummyhash
28cf13b2-38e8-431c-9118-2887697651c1	28cf13b2-38e8-431c-9118-2887697651c1@mandt.placeholder	{"full_name": "Mrs.  Nabukenya Christine"}	2026-02-10 16:38:50.827185+03	$2a$10$dummyhash
44f6cde4-ff3b-49c8-9ed6-7c7c7c10be99	44f6cde4-ff3b-49c8-9ed6-7c7c7c10be99@mandt.placeholder	{"full_name": "Mr.  Kakande Badru"}	2026-02-10 16:38:52.237252+03	$2a$10$dummyhash
d966dec5-fda7-452a-89f6-9cec44c6e858	d966dec5-fda7-452a-89f6-9cec44c6e858@mandt.placeholder	{"full_name": "Mrs.  Namanda Jackline"}	2026-02-10 16:38:53.592957+03	$2a$10$dummyhash
57c82246-b8ae-45fd-8b78-6d2c2620e6b5	57c82246-b8ae-45fd-8b78-6d2c2620e6b5@mandt.placeholder	{"full_name": "Mrs.  Mpindi Zainab"}	2026-02-10 16:38:54.882088+03	$2a$10$dummyhash
5a2b1e5f-2124-4b46-abd4-cb5524cec191	5a2b1e5f-2124-4b46-abd4-cb5524cec191@mandt.placeholder	{"full_name": "Mr.  Kamale Isaac"}	2026-02-10 16:38:57.831455+03	$2a$10$dummyhash
b2b9db31-b79e-42b9-9584-2d52a8844e75	b2b9db31-b79e-42b9-9584-2d52a8844e75@mandt.placeholder	{"full_name": "Mr.  Kimbugwe Sudais"}	2026-02-10 16:39:00.378599+03	$2a$10$dummyhash
54413b6d-5727-4e9c-b4d1-d313c2014e3e	54413b6d-5727-4e9c-b4d1-d313c2014e3e@mandt.placeholder	{"full_name": "Mrs.  Nalumu Milly"}	2026-02-10 16:39:01.650778+03	$2a$10$dummyhash
341e6653-f8ee-4249-9028-0d616659d087	341e6653-f8ee-4249-9028-0d616659d087@mandt.placeholder	{"full_name": "Mrs.  Nanyonjo Rose"}	2026-02-10 16:39:03.386616+03	$2a$10$dummyhash
543e5fdf-203d-4826-9d8f-605cbb43221f	543e5fdf-203d-4826-9d8f-605cbb43221f@mandt.placeholder	{"full_name": "Mr.  Kisakye Fred"}	2026-02-10 16:39:04.715239+03	$2a$10$dummyhash
94f9b62c-bb7c-41a8-9cda-9d079491020b	94f9b62c-bb7c-41a8-9cda-9d079491020b@mandt.placeholder	{"full_name": "Mr.  Mayanja Ashiraf"}	2026-02-10 16:39:06.004851+03	$2a$10$dummyhash
f40579ba-ada4-4bd2-8d06-7d1aa4420062	f40579ba-ada4-4bd2-8d06-7d1aa4420062@mandt.placeholder	{"full_name": "Mrs.  Ndagire Aminah"}	2026-02-10 16:39:07.335875+03	$2a$10$dummyhash
7f7f60b4-da99-47e5-97c6-9559238d5226	7f7f60b4-da99-47e5-97c6-9559238d5226@mandt.placeholder	{"full_name": "Mr.  Kyagera Bumbakali"}	2026-02-10 16:39:08.630726+03	$2a$10$dummyhash
01a4e0c1-4c38-4fe0-81d4-549e86e1e4f1	01a4e0c1-4c38-4fe0-81d4-549e86e1e4f1@mandt.placeholder	{"full_name": "Mr.  Kaweesi Ibra 2 (ibrah)"}	2026-02-10 16:39:10.355653+03	$2a$10$dummyhash
0b937a46-ee75-4f04-ab7d-7fd4673119f9	0b937a46-ee75-4f04-ab7d-7fd4673119f9@mandt.placeholder	{"full_name": "Mr.  Mutsinze Omar"}	2026-02-10 16:39:12.873397+03	$2a$10$dummyhash
75c7f816-d217-4a0d-859e-a2db6046fa15	75c7f816-d217-4a0d-859e-a2db6046fa15@mandt.placeholder	{"full_name": "Mr.  Masaaba Frank"}	2026-02-10 16:39:14.174129+03	$2a$10$dummyhash
11c18bdb-fb07-4aab-b1d8-80021fc101a7	11c18bdb-fb07-4aab-b1d8-80021fc101a7@mandt.placeholder	{"full_name": "Mr.  Matovu Mathias"}	2026-02-10 16:39:16.737187+03	$2a$10$dummyhash
06b3c564-cea5-4dd6-81a7-d2448573a017	06b3c564-cea5-4dd6-81a7-d2448573a017@mandt.placeholder	{"full_name": "Mr.  Ndayisaba Adrian"}	2026-02-10 16:39:21.13286+03	$2a$10$dummyhash
6caae18f-c81f-4167-a65a-9edd7df7ac73	6caae18f-c81f-4167-a65a-9edd7df7ac73@mandt.placeholder	{"full_name": "Mrs.  Babirye Jane"}	2026-02-10 16:39:22.471495+03	$2a$10$dummyhash
334fa943-ebe3-4c12-9ee1-67b97df22c1b	334fa943-ebe3-4c12-9ee1-67b97df22c1b@mandt.placeholder	{"full_name": "Mrs.  Namagala Reticia"}	2026-02-10 16:39:25.092639+03	$2a$10$dummyhash
e5e74a76-4e6e-4617-94bc-2ccd67bb8aa0	e5e74a76-4e6e-4617-94bc-2ccd67bb8aa0@mandt.placeholder	{"full_name": "Mr.  Matovu Henry"}	2026-02-10 16:39:26.818967+03	$2a$10$dummyhash
5389c56b-2775-4300-a774-ea3041d1f6bb	5389c56b-2775-4300-a774-ea3041d1f6bb@mandt.placeholder	{"full_name": "Mr.  Talemwa Emmanuel"}	2026-02-10 16:39:29.458311+03	$2a$10$dummyhash
8a55b7e3-8214-4edd-a5cf-06841cdd254f	8a55b7e3-8214-4edd-a5cf-06841cdd254f@mandt.placeholder	{"full_name": "Mr.  Talemwa Godwin"}	2026-02-10 16:39:30.730158+03	$2a$10$dummyhash
19b22681-d065-415b-8db1-4edaab4a0087	19b22681-d065-415b-8db1-4edaab4a0087@mandt.placeholder	{"full_name": "Mr.  Bugembe Hadson"}	2026-02-10 16:39:32.04008+03	$2a$10$dummyhash
4a2b4ccc-374d-4460-bfa6-b205816b7c40	4a2b4ccc-374d-4460-bfa6-b205816b7c40@mandt.placeholder	{"full_name": "Mr.  Ziwa Ibrah"}	2026-02-10 16:39:33.492173+03	$2a$10$dummyhash
fb346bc2-d7f4-4cf5-99cf-24ffc193024a	fb346bc2-d7f4-4cf5-99cf-24ffc193024a@mandt.placeholder	{"full_name": "Mr.  kiwanuka Francis"}	2026-02-10 16:39:36.685043+03	$2a$10$dummyhash
79114ca0-8521-4dda-8f80-bb3b7c404d1a	79114ca0-8521-4dda-8f80-bb3b7c404d1a@mandt.placeholder	{"full_name": "Mr.  Sentongo Ashiraf"}	2026-02-10 16:39:40.112304+03	$2a$10$dummyhash
c4205826-9772-4206-b5c6-9fa1c1815a35	c4205826-9772-4206-b5c6-9fa1c1815a35@mandt.placeholder	{"full_name": "Mr.  Kapompo Juma"}	2026-02-10 16:39:41.538301+03	$2a$10$dummyhash
d43d3515-0d1e-4d9a-aa28-abbae69dfbd6	d43d3515-0d1e-4d9a-aa28-abbae69dfbd6@mandt.placeholder	{"full_name": "Mr.  Kintu Steven"}	2026-02-10 16:39:43.326894+03	$2a$10$dummyhash
ec8692cc-1b8f-4e26-a046-e526ec5b8f0d	ec8692cc-1b8f-4e26-a046-e526ec5b8f0d@mandt.placeholder	{"full_name": "Mr.  Byakatonda Kennedy"}	2026-02-10 16:39:45.886569+03	$2a$10$dummyhash
2c33efe2-1783-4f34-ab5a-044bc9fec593	2c33efe2-1783-4f34-ab5a-044bc9fec593@mandt.placeholder	{"full_name": "Mr.  Batte Isa"}	2026-02-10 16:39:47.417081+03	$2a$10$dummyhash
9cfcd41a-8ff0-462f-9de1-5f090c008263	9cfcd41a-8ff0-462f-9de1-5f090c008263@mandt.placeholder	{"full_name": "Mr.  Tumukunde Bruce"}	2026-02-10 16:39:54.481252+03	$2a$10$dummyhash
069ab712-294c-4c1d-9f54-9070535c99fa	069ab712-294c-4c1d-9f54-9070535c99fa@mandt.placeholder	{"full_name": "Mr.  Mawenenge William"}	2026-02-10 16:39:55.821413+03	$2a$10$dummyhash
33a9831a-7ead-4e0a-a2a7-85db0cdea3e9	33a9831a-7ead-4e0a-a2a7-85db0cdea3e9@mandt.placeholder	{"full_name": "Mr.  Ngiraebisa Joshua"}	2026-02-10 16:39:57.315422+03	$2a$10$dummyhash
26080064-ed68-46ae-a41b-18f3100c3812	26080064-ed68-46ae-a41b-18f3100c3812@mandt.placeholder	{"full_name": "Mr.  Nabuse Siraji"}	2026-02-10 16:39:58.714526+03	$2a$10$dummyhash
0aecdb89-2e59-4105-8861-a57f18b33398	0aecdb89-2e59-4105-8861-a57f18b33398@mandt.placeholder	{"full_name": "Kiyaga Rashid"}	2026-02-10 16:38:25.443338+03	$2a$10$dummyhash
4448f396-f9b2-4ce7-831d-25832cfb2913	4448f396-f9b2-4ce7-831d-25832cfb2913@mandt.placeholder	{"full_name": "NSUBUGA MUZAFARU"}	2026-02-10 16:38:24.107957+03	$2a$10$dummyhash
295d39df-dd53-4544-b0e6-55104719bae4	295d39df-dd53-4544-b0e6-55104719bae4@mandt.placeholder	{"full_name": "Mr.  KAMYA VICENT"}	2026-02-10 16:39:15.471151+03	$2a$10$dummyhash
62d99bb5-329f-4bfc-b0eb-45371fef45d1	62d99bb5-329f-4bfc-b0eb-45371fef45d1@mandt.placeholder	{"full_name": "Mr.  KIWADUKA MOSES"}	2026-02-10 16:39:49.310294+03	$2a$10$dummyhash
41ebce67-b19b-4f6a-be39-05f21f5ab67f	41ebce67-b19b-4f6a-be39-05f21f5ab67f@mandt.placeholder	{"full_name": "Mr.  BRIGHT WILSON"}	2026-02-10 16:39:28.122926+03	$2a$10$dummyhash
8d6d3cf9-279d-437e-9bec-5522dc57ecd8	8d6d3cf9-279d-437e-9bec-5522dc57ecd8@mandt.placeholder	{"full_name": "MUGISHA JUMAH"}	2026-02-10 16:39:38.343276+03	$2a$10$dummyhash
c8a8f446-97ed-44d9-9282-eaedc0f90cc0	c8a8f446-97ed-44d9-9282-eaedc0f90cc0@mandt.placeholder	{"full_name": "Mr.  NASASIRA ALEX"}	2026-02-10 16:39:11.610031+03	$2a$10$dummyhash
ffce31d1-e0aa-40d8-a12b-8297986997c3	ffce31d1-e0aa-40d8-a12b-8297986997c3@mandt.placeholder	{"full_name": "Mr.  KABUGO YUSUFU"}	2026-02-10 16:40:13.149946+03	$2a$10$dummyhash
3d332321-6c14-4695-bf74-25c95a397e7e	3d332321-6c14-4695-bf74-25c95a397e7e@mandt.placeholder	{"full_name": "Mr.  KASIBANTE YUDA"}	2026-02-10 16:39:18.1071+03	$2a$10$dummyhash
a47b657c-9c3d-438e-9f7e-d0f1a3b64fa9	a47b657c-9c3d-438e-9f7e-d0f1a3b64fa9@mandt.placeholder	{"full_name": "Mr.  OJUKA TONNY"}	2026-02-10 16:39:52.446027+03	$2a$10$dummyhash
7af94da8-f9c7-4c68-ae1a-07d63cfef22b	7af94da8-f9c7-4c68-ae1a-07d63cfef22b@mandt.placeholder	{"full_name": "Mrs.  NAKABUGO ANNET"}	2026-02-10 16:40:11.02908+03	$2a$10$dummyhash
3858302f-b9e8-420f-b12f-5934f3123b8c	3858302f-b9e8-420f-b12f-5934f3123b8c@mandt.placeholder	{"full_name": "Mr.  TUSABE HAMZA"}	2026-02-10 16:38:59.107945+03	$2a$10$dummyhash
0ce0f4e3-3a92-4791-af27-b0bc893b940b	0ce0f4e3-3a92-4791-af27-b0bc893b940b@mandt.placeholder	{"full_name": "Mrs.  NAMATA CHRISTINE"}	2026-02-10 16:40:07.324889+03	$2a$10$dummyhash
ab46d637-496a-40e3-9d53-d038fb82599b	ab46d637-496a-40e3-9d53-d038fb82599b@mandt.placeholder	{"full_name": "Mrs.  NANFUMA JAMILA"}	2026-02-10 16:40:09.234628+03	$2a$10$dummyhash
40881955-f425-40e8-b47e-eec4d7c14dcc	40881955-f425-40e8-b47e-eec4d7c14dcc@mandt.placeholder	{"full_name": "Mr.  SEMPIJJA CHARLES"}	2026-02-10 16:40:19.178615+03	$2a$10$dummyhash
43f4c8e7-4da4-4bcd-ab52-5f1fc195394d	43f4c8e7-4da4-4bcd-ab52-5f1fc195394d@mandt.placeholder	{"full_name": "Mr.  NYOMBI MORGAN"}	2026-02-10 16:40:22.294797+03	$2a$10$dummyhash
c22fbeea-8bf7-4d49-ad23-8666903792f0	c22fbeea-8bf7-4d49-ad23-8666903792f0@mandt.placeholder	{"full_name": "Mr.  BUKUSOBA SAMUEL"}	2026-02-10 16:40:02.623224+03	$2a$10$dummyhash
cca07c5e-d413-41a1-a33d-2f138ada2414	cca07c5e-d413-41a1-a33d-2f138ada2414@mandt.placeholder	{"full_name": "Mr.  TWINOMUGYISHA BENSON"}	2026-02-10 16:40:05.962271+03	$2a$10$dummyhash
9f8c5a28-5467-4754-8b07-68f758dc3f03	9f8c5a28-5467-4754-8b07-68f758dc3f03@mandt.placeholder	{"full_name": "Mr.  TUMURAMYE BENSON"}	2026-02-10 16:40:04.69034+03	$2a$10$dummyhash
d71e36ca-74b6-4429-ae0d-a20300fe4d3a	d71e36ca-74b6-4429-ae0d-a20300fe4d3a@mandt.placeholder	{"full_name": "Mr.  ARINAITWE YORAM"}	2026-02-10 16:39:19.823579+03	$2a$10$dummyhash
f4593884-24a9-4722-8ea8-da1ba1003964	f4593884-24a9-4722-8ea8-da1ba1003964@mandt.placeholder	{"full_name": "Mr.  Were Simon Peter"}	2026-02-10 16:40:25.84656+03	$2a$10$dummyhash
5e3390f7-5d91-47f8-b658-489e1bf7e4c5	5e3390f7-5d91-47f8-b658-489e1bf7e4c5@mandt.placeholder	{"full_name": "Mr.  Ssentega Disan"}	2026-02-10 16:40:28.020557+03	$2a$10$dummyhash
3c73c383-8ec0-4c00-899f-ad62420c3652	3c73c383-8ec0-4c00-899f-ad62420c3652@mandt.placeholder	{"full_name": "Mrs.  Nalubega Resty"}	2026-02-10 16:40:29.324237+03	$2a$10$dummyhash
64c8a075-1c89-4ad8-8b55-4aab2ed94b6e	64c8a075-1c89-4ad8-8b55-4aab2ed94b6e@mandt.placeholder	{"full_name": "Mr.  Bwire Dennis"}	2026-02-10 16:40:30.643311+03	$2a$10$dummyhash
c3276837-c252-4477-9cf1-f8542184445b	c3276837-c252-4477-9cf1-f8542184445b@mandt.placeholder	{"full_name": "Mrs.  Namale Patricia"}	2026-02-10 16:40:32.433403+03	$2a$10$dummyhash
0bba5d6f-ed71-4231-bf9a-3c39fc5891e9	0bba5d6f-ed71-4231-bf9a-3c39fc5891e9@mandt.placeholder	{"full_name": "Mrs.  Lumumba Naume"}	2026-02-10 16:40:33.889399+03	$2a$10$dummyhash
5e644294-bbc4-4a20-9bbf-c4942fb30855	5e644294-bbc4-4a20-9bbf-c4942fb30855@mandt.placeholder	{"full_name": "Mrs.  Namuganyi Hanifah"}	2026-02-10 16:40:35.434651+03	$2a$10$dummyhash
67c7f30a-edd9-4e78-8a0e-a291100d130c	67c7f30a-edd9-4e78-8a0e-a291100d130c@mandt.placeholder	{"full_name": "Mrs.  Mukamwezi Specioza"}	2026-02-10 16:40:37.024359+03	$2a$10$dummyhash
1f41e482-6eea-47ee-bfba-64f0081a27f7	1f41e482-6eea-47ee-bfba-64f0081a27f7@mandt.placeholder	{"full_name": "Mrs.  Nakiwala Shamim"}	2026-02-10 16:40:38.319003+03	$2a$10$dummyhash
51324718-d8fe-421b-9639-3c3e8e361a08	51324718-d8fe-421b-9639-3c3e8e361a08@mandt.placeholder	{"full_name": "Mr.  Magero Steven"}	2026-02-10 16:40:43.122047+03	$2a$10$dummyhash
647a29ae-984b-4c00-a7fc-b3b26ad11516	647a29ae-984b-4c00-a7fc-b3b26ad11516@mandt.placeholder	{"full_name": "Mr.  Owori Simon"}	2026-02-10 16:40:44.594133+03	$2a$10$dummyhash
ddf3ca1c-43a0-4636-bb34-5e75b50f6ec7	ddf3ca1c-43a0-4636-bb34-5e75b50f6ec7@mandt.placeholder	{"full_name": "Mr.  Musoke Ronald"}	2026-02-10 16:40:46.061456+03	$2a$10$dummyhash
b711c25d-dbf7-40af-a408-2b6d40d0d11b	b711c25d-dbf7-40af-a408-2b6d40d0d11b@mandt.placeholder	{"full_name": "Mr.  Mukiibi Livingstone"}	2026-02-10 16:40:47.731154+03	$2a$10$dummyhash
e94f7f5d-0e9e-4d19-9654-0a930719aa96	e94f7f5d-0e9e-4d19-9654-0a930719aa96@mandt.placeholder	{"full_name": "Mrs.  Tumwesigye Betty"}	2026-02-10 16:41:00.546218+03	$2a$10$dummyhash
4785a421-9361-49a2-a4e8-0b8cb1a9358c	4785a421-9361-49a2-a4e8-0b8cb1a9358c@mandt.placeholder	{"full_name": "Mr.  Matovu Abasi"}	2026-02-10 16:41:04.429645+03	$2a$10$dummyhash
70901baf-adb9-4583-ad46-7ac5263a958f	70901baf-adb9-4583-ad46-7ac5263a958f@mandt.placeholder	{"full_name": "Mr.  Musasizi Faizal"}	2026-02-10 16:41:05.858977+03	$2a$10$dummyhash
ca3089b8-d97e-49f3-80fb-f1d82583be2f	ca3089b8-d97e-49f3-80fb-f1d82583be2f@mandt.placeholder	{"full_name": "Mr.  Kibirige Kagenya Livingstone"}	2026-02-10 16:41:07.249101+03	$2a$10$dummyhash
ae789540-2b99-4ff0-87cb-6214b7269657	ae789540-2b99-4ff0-87cb-6214b7269657@mandt.placeholder	{"full_name": "Mr.  Kibirige Tonny"}	2026-02-10 16:41:09.343975+03	$2a$10$dummyhash
95e737c7-6ff2-412b-8235-7b95b5b1dc46	95e737c7-6ff2-412b-8235-7b95b5b1dc46@mandt.placeholder	{"full_name": "Miss  Kibirige Harriet"}	2026-02-10 16:41:10.836993+03	$2a$10$dummyhash
b7bcec83-dfc6-4c1c-a610-71e9fd1fbcae	b7bcec83-dfc6-4c1c-a610-71e9fd1fbcae@mandt.placeholder	{"full_name": "Mrs.  Lunyoro Sarah"}	2026-02-10 16:41:12.196072+03	$2a$10$dummyhash
3a9ef6a3-cc78-4843-ab3c-bf6c385f475a	3a9ef6a3-cc78-4843-ab3c-bf6c385f475a@mandt.placeholder	{"full_name": "Mr.  AHEEBWA ANDREW"}	2026-02-10 16:41:15.7872+03	$2a$10$dummyhash
bed75958-afc3-4416-ba42-1f45c33e9cbb	bed75958-afc3-4416-ba42-1f45c33e9cbb@mandt.placeholder	{"full_name": "Mr.  Kasule Eddy Ssebunya"}	2026-02-10 16:41:22.529824+03	$2a$10$dummyhash
78b24b3d-1fdd-4933-abaa-54e1b36a80d6	78b24b3d-1fdd-4933-abaa-54e1b36a80d6@mandt.placeholder	{"full_name": "Mr.  Lyazi Robert"}	2026-02-10 16:41:25.339788+03	$2a$10$dummyhash
ca2c1342-3c5e-4b57-9ff0-770e8ce7f2cc	ca2c1342-3c5e-4b57-9ff0-770e8ce7f2cc@mandt.placeholder	{"full_name": "Mr.  Kiyimba Charles"}	2026-02-10 16:41:30.518276+03	$2a$10$dummyhash
7d773bac-a546-4182-bca3-de42b340a8e5	7d773bac-a546-4182-bca3-de42b340a8e5@mandt.placeholder	{"full_name": "Mrs.  Nalunkuuma Justine Grace"}	2026-02-10 16:41:31.770141+03	$2a$10$dummyhash
81352995-d9ed-4777-8b5a-01abb7f1745a	81352995-d9ed-4777-8b5a-01abb7f1745a@mandt.placeholder	{"full_name": "Mr.  Lutaaya Sulait Eric"}	2026-02-10 16:41:33.037027+03	$2a$10$dummyhash
263fbec1-f903-4096-a5d6-5622ba317321	263fbec1-f903-4096-a5d6-5622ba317321@mandt.placeholder	{"full_name": "Mr.  NDOBYA FAIZO"}	2026-02-10 16:41:39.814334+03	$2a$10$dummyhash
32806bc1-5451-4f82-8e3d-0fb11b5d04c0	32806bc1-5451-4f82-8e3d-0fb11b5d04c0@mandt.placeholder	{"full_name": "Mr.  KIKKO EMMANUEL"}	2026-02-10 16:41:41.42122+03	$2a$10$dummyhash
307e0092-cbe4-4e79-8723-160066325c5f	307e0092-cbe4-4e79-8723-160066325c5f@mandt.placeholder	{"full_name": "Mr.  ANATOLI BUKENYA"}	2026-02-10 16:41:42.71646+03	$2a$10$dummyhash
ba212db4-58f8-416b-bd56-27ec6ab47c90	ba212db4-58f8-416b-bd56-27ec6ab47c90@mandt.placeholder	{"full_name": "Mr.  BOGERE RODGERS"}	2026-02-10 16:41:43.987543+03	$2a$10$dummyhash
c1a74313-2697-4c07-ab2e-08a13597b989	c1a74313-2697-4c07-ab2e-08a13597b989@mandt.placeholder	{"full_name": "Mr.  MAGAMBA RODGERS"}	2026-02-10 16:41:45.302432+03	$2a$10$dummyhash
a4806da8-f4b3-4107-84d3-0f77ee9cbbcf	a4806da8-f4b3-4107-84d3-0f77ee9cbbcf@mandt.placeholder	{"full_name": "Mr.  MULINDWA WILSON"}	2026-02-10 16:41:50.507987+03	$2a$10$dummyhash
03c5847f-9e49-46ff-89b9-572b3e48bfee	03c5847f-9e49-46ff-89b9-572b3e48bfee@mandt.placeholder	{"full_name": "KAFEERO ALLAN"}	2026-02-10 16:41:51.764094+03	$2a$10$dummyhash
adb48db7-be4e-417c-aebc-f4608deaae33	adb48db7-be4e-417c-aebc-f4608deaae33@mandt.placeholder	{"full_name": "Mrs.  nalubega prossy"}	2026-02-10 16:42:00.226317+03	$2a$10$dummyhash
e4fb1c94-f4dd-4d86-a7be-69536d578546	e4fb1c94-f4dd-4d86-a7be-69536d578546@mandt.placeholder	{"full_name": "Mr.  SSEKIYUVI WILBERFORCE"}	2026-02-10 16:41:57.29912+03	$2a$10$dummyhash
b5f06348-0e06-4d36-95b5-c6fa406073ec	b5f06348-0e06-4d36-95b5-c6fa406073ec@mandt.placeholder	{"full_name": "Mr.  BUSUKWA MARK"}	2026-02-10 16:40:55.356829+03	$2a$10$dummyhash
4a53c947-ce66-4a96-ab80-3a63060cdd51	4a53c947-ce66-4a96-ab80-3a63060cdd51@mandt.placeholder	{"full_name": "Mrs.  MUGERWA TEOPISTA"}	2026-02-10 16:41:26.627877+03	$2a$10$dummyhash
579005b5-ffd5-45fc-a4ce-beda75c6d307	579005b5-ffd5-45fc-a4ce-beda75c6d307@mandt.placeholder	{"full_name": "Mrs.  NABANJALA AISHA"}	2026-02-10 16:41:18.921243+03	$2a$10$dummyhash
c6fda488-f990-4169-a897-02e397ba568e	c6fda488-f990-4169-a897-02e397ba568e@mandt.placeholder	{"full_name": "Mr.  KYAMBADDE THOMAS"}	2026-02-10 16:42:18.631255+03	$2a$10$dummyhash
a0c42ffd-5318-4561-a35b-ba93c6f47e1e	a0c42ffd-5318-4561-a35b-ba93c6f47e1e@mandt.placeholder	{"full_name": "Mrs.  BABIRYE JUSTINE"}	2026-02-10 16:41:02.921635+03	$2a$10$dummyhash
264e0eac-0e4b-42da-b03d-4f23c7f272f7	264e0eac-0e4b-42da-b03d-4f23c7f272f7@mandt.placeholder	{"full_name": "Mr.  SEMPEBWA CAPRIAM"}	2026-02-10 16:42:08.035003+03	$2a$10$dummyhash
4e1468c6-5480-49c2-946e-f0a87ec91b72	4e1468c6-5480-49c2-946e-f0a87ec91b72@mandt.placeholder	{"full_name": "Mrs.  NASAKA HARRIET"}	2026-02-10 16:41:14.533902+03	$2a$10$dummyhash
625ef4ae-3509-4568-b295-9c0550a49342	625ef4ae-3509-4568-b295-9c0550a49342@mandt.placeholder	{"full_name": "Mr.  MUGANGA LAWRENCE"}	2026-02-10 16:41:29.642659+03	$2a$10$dummyhash
94012aca-ff17-43d8-b19f-e63584518fef	94012aca-ff17-43d8-b19f-e63584518fef@mandt.placeholder	{"full_name": "Mr.  BAGAMBANE ERIA"}	2026-02-10 16:42:19.485202+03	$2a$10$dummyhash
ed955ea7-33a7-4c52-8b8b-e23a9be479dd	ed955ea7-33a7-4c52-8b8b-e23a9be479dd@mandt.placeholder	{"full_name": "Mr.  LUGOLOBI GEORGE"}	2026-02-10 16:42:20.329511+03	$2a$10$dummyhash
39eff60e-8121-4cfd-a5d0-5fbf2be66251	39eff60e-8121-4cfd-a5d0-5fbf2be66251@mandt.placeholder	{"full_name": "SSEBAGUDE ROBERT"}	2026-02-10 16:42:16.912109+03	$2a$10$dummyhash
31a4c41c-290f-4f21-b04d-ebb5a2c470ae	31a4c41c-290f-4f21-b04d-ebb5a2c470ae@mandt.placeholder	{"full_name": "Mrs.  NANKUMBA SARAH"}	2026-02-10 16:42:21.596809+03	$2a$10$dummyhash
f274088a-733f-4d0d-aff9-7c259af09afb	f274088a-733f-4d0d-aff9-7c259af09afb@mandt.placeholder	{"full_name": "Mr.  KASUJJA MICHAEL"}	2026-02-10 16:42:22.868461+03	$2a$10$dummyhash
6899dfe9-e78c-4b95-8f49-fa748a6d4eaf	6899dfe9-e78c-4b95-8f49-fa748a6d4eaf@mandt.placeholder	{"full_name": "Mr.  OKIRU PAUL"}	2026-02-10 16:40:51.043164+03	$2a$10$dummyhash
25466ed3-563b-4fd4-9a1f-72d492c853fb	25466ed3-563b-4fd4-9a1f-72d492c853fb@mandt.placeholder	{"full_name": "Mr.  BUGEMBE RICHARD"}	2026-02-10 16:40:52.390128+03	$2a$10$dummyhash
8a825829-e643-47c7-984c-9fd0684edbec	8a825829-e643-47c7-984c-9fd0684edbec@mandt.placeholder	{"full_name": "Mr.  KUBUNGA JOHNSON"}	2026-02-10 16:40:49.694994+03	$2a$10$dummyhash
5782cf3c-ffdd-4256-9cc8-8b829852f255	5782cf3c-ffdd-4256-9cc8-8b829852f255@mandt.placeholder	{"full_name": "Mr.  WASSWA FRANK"}	2026-02-10 16:41:01.937185+03	$2a$10$dummyhash
1c1b740f-9127-4ac8-967d-4e7657f758d5	1c1b740f-9127-4ac8-967d-4e7657f758d5@mandt.placeholder	{"full_name": "Mrs.  LUSIBA SARAH"}	2026-02-10 16:42:07.18608+03	$2a$10$dummyhash
42418a7f-acc4-46d9-95eb-fdd82fba1b63	42418a7f-acc4-46d9-95eb-fdd82fba1b63@mandt.placeholder	{"full_name": "Mr.  TEBAJUKILA ABDALAH"}	2026-02-10 16:40:58.967031+03	$2a$10$dummyhash
ee3b5a29-a557-430e-b76c-fe37f35bba33	ee3b5a29-a557-430e-b76c-fe37f35bba33@mandt.placeholder	{"full_name": "Mr.  BUTANAKYA GEORGE"}	2026-02-10 16:40:56.708141+03	$2a$10$dummyhash
40544e40-e93c-4187-82b6-001579b8c5d0	40544e40-e93c-4187-82b6-001579b8c5d0@mandt.placeholder	{"full_name": "Mr.  MUBIRU KENNETH"}	2026-02-10 16:40:53.958493+03	$2a$10$dummyhash
08b452b9-eca3-4c85-a79d-a16d6740e53e	08b452b9-eca3-4c85-a79d-a16d6740e53e@mandt.placeholder	{"full_name": "Mr.  OWEMBABAZI RODGERS"}	2026-02-10 16:41:53.486388+03	$2a$10$dummyhash
06cba71b-fcf7-40fb-9144-cb23ea80f9ca	06cba71b-fcf7-40fb-9144-cb23ea80f9ca@mandt.placeholder	{"full_name": "Mr.  LUWAGA CHARLES"}	2026-02-10 16:41:54.762948+03	$2a$10$dummyhash
30861a5d-8175-4f1b-a8a1-cbe75ac512cd	30861a5d-8175-4f1b-a8a1-cbe75ac512cd@mandt.placeholder	{"full_name": "Mr.  LUGWANA ANTHONY"}	2026-02-10 16:41:56.022884+03	$2a$10$dummyhash
affcd6c5-46ef-4296-a420-e5ceb413d547	affcd6c5-46ef-4296-a420-e5ceb413d547@mandt.placeholder	{"full_name": "Mr.  KALUNGI SHAFIK"}	2026-02-10 16:41:58.540595+03	$2a$10$dummyhash
bed2d06e-02dc-4528-ab7b-4e105586555d	bed2d06e-02dc-4528-ab7b-4e105586555d@mandt.placeholder	{"full_name": "Mr.  AMUDA FRED"}	2026-02-10 16:40:39.737545+03	$2a$10$dummyhash
2f702b6c-88fe-4fc8-81cd-7d572f7204ea	2f702b6c-88fe-4fc8-81cd-7d572f7204ea@mandt.placeholder	{"full_name": "Mr.  KOMODO MUTWAIFU"}	2026-02-10 16:40:41.113123+03	$2a$10$dummyhash
73fe437a-82dc-4bfa-b675-e9038b66b945	73fe437a-82dc-4bfa-b675-e9038b66b945@mandt.placeholder	{"full_name": "Mr.  ABU SENDI"}	2026-02-10 16:42:05.90813+03	$2a$10$dummyhash
c273e6c8-d88a-494e-974c-9bb6073b6823	c273e6c8-d88a-494e-974c-9bb6073b6823@mandt.placeholder	{"full_name": "Mr.  BAMUGYE SIPERITO"}	2026-02-10 16:42:01.552152+03	$2a$10$dummyhash
48f55493-1190-4e86-b4e4-d3fa3f26b8a0	48f55493-1190-4e86-b4e4-d3fa3f26b8a0@mandt.placeholder	{"full_name": "Mrs.  NAKAYIZA LILLIAN"}	2026-02-10 16:42:02.848036+03	$2a$10$dummyhash
c64cbbc8-d7d2-4be4-bebf-ea02a215b3bd	c64cbbc8-d7d2-4be4-bebf-ea02a215b3bd@mandt.placeholder	{"full_name": "MUSISI GODREY"}	2026-02-10 16:42:28.826779+03	$2a$10$dummyhash
a6e68834-a3d4-4bc0-b6b2-4331c29bf58c	a6e68834-a3d4-4bc0-b6b2-4331c29bf58c@mandt.placeholder	{"full_name": "KABOMBO MOSES"}	2026-02-10 16:42:29.709297+03	$2a$10$dummyhash
31bf468f-08a1-4fbb-94e4-f6d1576d770a	31bf468f-08a1-4fbb-94e4-f6d1576d770a@mandt.placeholder	{"full_name": "KASUMBA FRANK"}	2026-02-10 16:42:30.540425+03	$2a$10$dummyhash
0d5df0a6-dbb4-4293-a78b-0d530d70be23	0d5df0a6-dbb4-4293-a78b-0d530d70be23@mandt.placeholder	{"full_name": "MUTAHUNGWA JULIUS"}	2026-02-10 16:42:31.39198+03	$2a$10$dummyhash
741863cf-8fdd-4fb6-8a41-3853729e6abb	741863cf-8fdd-4fb6-8a41-3853729e6abb@mandt.placeholder	{"full_name": "MBEINE FRED"}	2026-02-10 16:42:32.221647+03	$2a$10$dummyhash
4f089b15-9797-4f80-abd0-b1cf462164b7	4f089b15-9797-4f80-abd0-b1cf462164b7@mandt.placeholder	{"full_name": "Mrs.  NAKASI MAYI"}	2026-02-10 16:42:33.07028+03	$2a$10$dummyhash
910517eb-7bf3-478e-8bf4-d9efac6d156a	910517eb-7bf3-478e-8bf4-d9efac6d156a@mandt.placeholder	{"full_name": "NANSEREKO JANE"}	2026-02-10 16:42:36.876549+03	$2a$10$dummyhash
5d803fc7-5834-4415-8fad-70897a17ca5c	5d803fc7-5834-4415-8fad-70897a17ca5c@mandt.placeholder	{"full_name": "Mr.  Ssekajja Jamil"}	2026-02-10 16:42:38.569447+03	$2a$10$dummyhash
e3a6570f-432d-4d37-b86e-1a680249b2e7	e3a6570f-432d-4d37-b86e-1a680249b2e7@mandt.placeholder	{"full_name": "Mr.  Kavuma Osman"}	2026-02-10 16:42:39.403956+03	$2a$10$dummyhash
62e1415b-42c9-41d1-9290-ce27dbf14c9d	62e1415b-42c9-41d1-9290-ce27dbf14c9d@mandt.placeholder	{"full_name": "Mrs.  Nakacwa Phionah"}	2026-02-10 16:42:40.285943+03	$2a$10$dummyhash
727b9f6d-0474-47d8-83ec-219e19bfbe49	727b9f6d-0474-47d8-83ec-219e19bfbe49@mandt.placeholder	{"full_name": "Mr.  Njakasi Charles"}	2026-02-10 16:42:41.149335+03	$2a$10$dummyhash
6bb3a043-1925-41fa-a6f6-1866471520b5	6bb3a043-1925-41fa-a6f6-1866471520b5@mandt.placeholder	{"full_name": "Mr.  Lubalema Umar"}	2026-02-10 16:42:42.00354+03	$2a$10$dummyhash
bff1c1fd-b256-4995-933c-e327f91bc6de	bff1c1fd-b256-4995-933c-e327f91bc6de@mandt.placeholder	{"full_name": "Mr.  Lubwama Ivan"}	2026-02-10 16:42:42.887854+03	$2a$10$dummyhash
ebd18199-5bd9-4a24-a004-67478fcca4ad	ebd18199-5bd9-4a24-a004-67478fcca4ad@mandt.placeholder	{"full_name": "Iga Solomon"}	2026-02-10 16:42:43.740467+03	$2a$10$dummyhash
34a8d472-c408-42af-910e-87fac92ae39d	34a8d472-c408-42af-910e-87fac92ae39d@mandt.placeholder	{"full_name": "Katende Stanley"}	2026-02-10 16:42:44.612205+03	$2a$10$dummyhash
0d2be050-554d-4c8c-87c4-2bdfc12f1d25	0d2be050-554d-4c8c-87c4-2bdfc12f1d25@mandt.placeholder	{"full_name": "Mr.  Tuhirwe Roland"}	2026-02-10 16:42:45.969706+03	$2a$10$dummyhash
e2596d67-6092-49ed-b5dc-865a52834e61	e2596d67-6092-49ed-b5dc-865a52834e61@mandt.placeholder	{"full_name": "Mr.  TINKA ROBERT KARUHANGA"}	2026-02-10 16:42:52.087157+03	$2a$10$dummyhash
2ba10315-d0bf-48f4-ad76-0cf9600a2872	2ba10315-d0bf-48f4-ad76-0cf9600a2872@mandt.placeholder	{"full_name": "Mr.  SSEBUNZA LAWRENCE"}	2026-02-10 16:42:53.429434+03	$2a$10$dummyhash
1fbcf621-f968-47a8-a149-f43dbaa58017	1fbcf621-f968-47a8-a149-f43dbaa58017@mandt.placeholder	{"full_name": "Mr.  BOSIKO FERESI"}	2026-02-10 16:42:55.012627+03	$2a$10$dummyhash
ddf4f0d8-be59-4455-81dc-f017e34d22b1	ddf4f0d8-be59-4455-81dc-f017e34d22b1@mandt.placeholder	{"full_name": "Mr.  KIBUKA RASHID"}	2026-02-10 16:42:59.292751+03	$2a$10$dummyhash
c492f8a1-aa7b-44a9-9aca-4fe746f65a03	c492f8a1-aa7b-44a9-9aca-4fe746f65a03@mandt.placeholder	{"full_name": "Mr.  WADADA YISUFU"}	2026-02-10 16:43:02.930838+03	$2a$10$dummyhash
a7837d7a-64f8-42aa-9cfa-2aab4dcc4ec8	a7837d7a-64f8-42aa-9cfa-2aab4dcc4ec8@mandt.placeholder	{"full_name": "Mr.  AWUMA MUGWERI"}	2026-02-10 16:43:04.616242+03	$2a$10$dummyhash
e32aceb9-4076-4237-900f-cf4d9da6d6e2	e32aceb9-4076-4237-900f-cf4d9da6d6e2@mandt.placeholder	{"full_name": "Mr.  MUGONYA ZAAKE"}	2026-02-10 16:43:06.496458+03	$2a$10$dummyhash
e7296c86-b5b9-430a-95b6-198d3db640a1	e7296c86-b5b9-430a-95b6-198d3db640a1@mandt.placeholder	{"full_name": "Mr.  BUTUTU PETER"}	2026-02-10 16:43:07.801217+03	$2a$10$dummyhash
55169c02-5e08-455d-becb-59f54537a2ec	55169c02-5e08-455d-becb-59f54537a2ec@mandt.placeholder	{"full_name": "Mr.  ASIIMWE RODGERS"}	2026-02-10 16:43:11.767205+03	$2a$10$dummyhash
00907018-52fd-4e4c-b407-3b3197259e18	00907018-52fd-4e4c-b407-3b3197259e18@mandt.placeholder	{"full_name": "Mr.  AMANYA GODON"}	2026-02-10 16:43:13.105289+03	$2a$10$dummyhash
649a6d37-6adf-42cc-ba85-05b54a1a49af	649a6d37-6adf-42cc-ba85-05b54a1a49af@mandt.placeholder	{"full_name": "Mrs.  KAYESU ANNET"}	2026-02-10 16:43:14.838814+03	$2a$10$dummyhash
6308d515-11b8-4795-adf0-1b76fd753da4	6308d515-11b8-4795-adf0-1b76fd753da4@mandt.placeholder	{"full_name": "Mrs.  NALUBEGA SARAH"}	2026-02-10 16:43:16.186976+03	$2a$10$dummyhash
b65df48a-8d01-4a56-abe1-cbad8c41a2c2	b65df48a-8d01-4a56-abe1-cbad8c41a2c2@mandt.placeholder	{"full_name": "Mrs.  NAKALEMA SANDRA"}	2026-02-10 16:43:20.049639+03	$2a$10$dummyhash
eca234e2-2369-4603-8266-ec56bb922d68	eca234e2-2369-4603-8266-ec56bb922d68@mandt.placeholder	{"full_name": "Mr.  LUWANGA EMMANUEL"}	2026-02-10 16:43:21.289374+03	$2a$10$dummyhash
83d2b098-0241-4cfe-9268-1d8d985487f1	83d2b098-0241-4cfe-9268-1d8d985487f1@mandt.placeholder	{"full_name": "Mr.  KIZZA RICHARD"}	2026-02-10 16:43:23.018129+03	$2a$10$dummyhash
f9b054d9-ffdd-4cda-983e-5d1d72af5748	f9b054d9-ffdd-4cda-983e-5d1d72af5748@mandt.placeholder	{"full_name": "Mr.  SENDIJJA OWEN"}	2026-02-10 16:43:24.381435+03	$2a$10$dummyhash
138711bc-7e20-4baf-84fa-477ec8d60d85	138711bc-7e20-4baf-84fa-477ec8d60d85@mandt.placeholder	{"full_name": "Mr.  SELWANGA JAMES"}	2026-02-10 16:43:25.716029+03	$2a$10$dummyhash
6cdf61ef-3704-480a-bddf-e43ee1632d60	6cdf61ef-3704-480a-bddf-e43ee1632d60@mandt.placeholder	{"full_name": "Mr.  MBALAGA ERIC"}	2026-02-10 16:43:26.971707+03	$2a$10$dummyhash
6586ade0-754f-4ac5-8e64-f3160c8007e3	6586ade0-754f-4ac5-8e64-f3160c8007e3@mandt.placeholder	{"full_name": "Mr.  KIGOZI FRED"}	2026-02-10 16:43:38.281766+03	$2a$10$dummyhash
109670e4-bef6-4d76-966c-c23afdc5dd9d	109670e4-bef6-4d76-966c-c23afdc5dd9d@mandt.placeholder	{"full_name": "Mrs.  AZZIZAH SARAH RAMADHAN"}	2026-02-10 16:43:39.604427+03	$2a$10$dummyhash
d4e939f3-e7d4-4f56-a34c-d4a7a03e8ddc	d4e939f3-e7d4-4f56-a34c-d4a7a03e8ddc@mandt.placeholder	{"full_name": "Mr.  KATONGOLE ROBERT"}	2026-02-10 16:43:40.927601+03	$2a$10$dummyhash
74906efd-6b7e-42d5-899b-3efc69351f30	74906efd-6b7e-42d5-899b-3efc69351f30@mandt.placeholder	{"full_name": "Mr.  NYANZI BASHIR SENTAMU"}	2026-02-10 16:43:42.193577+03	$2a$10$dummyhash
bf484958-aee1-4898-ad55-f2c3e09a3dbb	bf484958-aee1-4898-ad55-f2c3e09a3dbb@mandt.placeholder	{"full_name": "Mr.  SSEKABIRA FRANCIS"}	2026-02-10 16:43:47.286401+03	$2a$10$dummyhash
340731f3-7f00-4321-aba6-f71749990f88	340731f3-7f00-4321-aba6-f71749990f88@mandt.placeholder	{"full_name": "Mr.  KAMERI VENANSIO"}	2026-02-10 16:43:57.654456+03	$2a$10$dummyhash
3b445c66-3cb4-4005-bad1-7f1dd38f8469	3b445c66-3cb4-4005-bad1-7f1dd38f8469@mandt.placeholder	{"full_name": "Mr.  NTUME CHRISTOPHER"}	2026-02-10 16:44:04.056178+03	$2a$10$dummyhash
8767d46a-e55b-43d5-8733-70fe75d39bc8	8767d46a-e55b-43d5-8733-70fe75d39bc8@mandt.placeholder	{"full_name": "Mr.  KAHINGA ALEX"}	2026-02-10 16:44:01.790803+03	$2a$10$dummyhash
a08a66cb-762e-4949-b8a7-ed1ce6e49329	a08a66cb-762e-4949-b8a7-ed1ce6e49329@mandt.placeholder	{"full_name": "Mrs.  NAKKAZI JUSTINE"}	2026-02-10 16:44:13.754735+03	$2a$10$dummyhash
70f9bd68-d0f5-4459-96eb-e158b87224ea	70f9bd68-d0f5-4459-96eb-e158b87224ea@mandt.placeholder	{"full_name": "Mrs.  NANYONGA DOROTHY"}	2026-02-10 16:44:15.341099+03	$2a$10$dummyhash
547bb2d1-1fe2-481a-9d54-7707a1549637	547bb2d1-1fe2-481a-9d54-7707a1549637@mandt.placeholder	{"full_name": "Mrs.  NANJEGO SHAMIM"}	2026-02-10 16:44:16.617229+03	$2a$10$dummyhash
6bbb447b-bae9-4561-881a-7bbe3e421eae	6bbb447b-bae9-4561-881a-7bbe3e421eae@mandt.placeholder	{"full_name": "Mrs.  NAKKAZI AISHA"}	2026-02-10 16:44:17.949349+03	$2a$10$dummyhash
eb785a79-408e-47a9-83f3-24d30f9ff734	eb785a79-408e-47a9-83f3-24d30f9ff734@mandt.placeholder	{"full_name": "Mrs.  NALUTAAYA MADINAH"}	2026-02-10 16:44:19.708476+03	$2a$10$dummyhash
50757186-4423-491a-9398-dfb0c703eb72	50757186-4423-491a-9398-dfb0c703eb72@mandt.placeholder	{"full_name": "SEBAGALA NASIF"}	2026-02-10 16:44:20.952866+03	$2a$10$dummyhash
02b0f6e5-3f63-491a-b954-daace6346205	02b0f6e5-3f63-491a-b954-daace6346205@mandt.placeholder	{"full_name": "Mr.  Ssenkungu Ronald"}	2026-02-10 16:42:48.126376+03	$2a$10$dummyhash
82ee432e-e4ce-4bf9-9337-979589163295	82ee432e-e4ce-4bf9-9337-979589163295@mandt.placeholder	{"full_name": "Mr.  KAYUZA ALI"}	2026-02-10 16:43:00.86114+03	$2a$10$dummyhash
93b006f4-5bc5-4128-b809-c3ef3d1fcff0	93b006f4-5bc5-4128-b809-c3ef3d1fcff0@mandt.placeholder	{"full_name": "Mr.  KAYINGI ALEX"}	2026-02-10 16:44:06.7848+03	$2a$10$dummyhash
0c8d7586-4a65-435c-9941-7399e08929bc	0c8d7586-4a65-435c-9941-7399e08929bc@mandt.placeholder	{"full_name": "Mr.  KALO ROBERT"}	2026-02-10 16:44:09.551749+03	$2a$10$dummyhash
20f9fd31-d371-4a1e-b565-aefb4717fee8	20f9fd31-d371-4a1e-b565-aefb4717fee8@mandt.placeholder	{"full_name": "Mrs.  NAGAYI SHAMIM"}	2026-02-10 16:42:50.272558+03	$2a$10$dummyhash
71a9a58d-ad1c-46d1-b9ed-2e8a4b2dedc2	71a9a58d-ad1c-46d1-b9ed-2e8a4b2dedc2@mandt.placeholder	{"full_name": "Mrs.  AWORI VIVIAN"}	2026-02-10 16:42:24.147996+03	$2a$10$dummyhash
f973fba1-f08e-475c-8c93-f563c490a8b2	f973fba1-f08e-475c-8c93-f563c490a8b2@mandt.placeholder	{"full_name": "Mrs.  NAKYANZI TEOPISTA"}	2026-02-10 16:42:27.587303+03	$2a$10$dummyhash
11239e65-53f4-458d-ac9b-7714ea883a88	11239e65-53f4-458d-ac9b-7714ea883a88@mandt.placeholder	{"full_name": "MUSISI PHILLIP"}	2026-02-10 16:42:26.281724+03	$2a$10$dummyhash
fb3a1d2d-9b7d-4810-81c2-821a163861fc	fb3a1d2d-9b7d-4810-81c2-821a163861fc@mandt.placeholder	{"full_name": "Mrs.  NAJJINDA JAMILAH"}	2026-02-10 16:42:25.41354+03	$2a$10$dummyhash
9694dc5a-5796-40c3-9968-ae576b8fa9be	9694dc5a-5796-40c3-9968-ae576b8fa9be@mandt.placeholder	{"full_name": "Mrs.  KOBUSINGYE SHEEBAH"}	2026-02-10 16:44:02.767145+03	$2a$10$dummyhash
20346c20-1871-4580-a472-b5204303da15	20346c20-1871-4580-a472-b5204303da15@mandt.placeholder	{"full_name": "Mr.  SENYONDWA JULIUS"}	2026-02-10 16:42:48.971865+03	$2a$10$dummyhash
aed117fe-2ffa-46da-99a0-144dcb8463ba	aed117fe-2ffa-46da-99a0-144dcb8463ba@mandt.placeholder	{"full_name": "Mrs.  NAMUBIRU FATUMA"}	2026-02-10 16:44:05.511599+03	$2a$10$dummyhash
2be1a302-1789-46a6-8178-efe933c5ab4a	2be1a302-1789-46a6-8178-efe933c5ab4a@mandt.placeholder	{"full_name": "Mr.  KAMOGA HUSSEIN"}	2026-02-10 16:43:31.782164+03	$2a$10$dummyhash
e5a6f7b3-ff2e-4af1-afb3-2139a575f3de	e5a6f7b3-ff2e-4af1-afb3-2139a575f3de@mandt.placeholder	{"full_name": "Mr.  MWEBE JOHN"}	2026-02-10 16:43:33.110804+03	$2a$10$dummyhash
c5af0695-b0cf-4173-b366-67a0fd11b88e	c5af0695-b0cf-4173-b366-67a0fd11b88e@mandt.placeholder	{"full_name": "Mrs.  NAMULI HAJALA"}	2026-02-10 16:43:36.594442+03	$2a$10$dummyhash
86f9f8d8-2a98-4a27-b349-c24ac684e5eb	86f9f8d8-2a98-4a27-b349-c24ac684e5eb@mandt.placeholder	{"full_name": "Mrs.  NAKIWALA OLIVIA"}	2026-02-10 16:43:34.571209+03	$2a$10$dummyhash
01e22d26-83e2-4c82-9fbc-14be066b9357	01e22d26-83e2-4c82-9fbc-14be066b9357@mandt.placeholder	{"full_name": "Mr.  SENYONDO DEO"}	2026-02-10 16:43:43.467025+03	$2a$10$dummyhash
56feab29-5095-4735-99ac-186fc216123f	56feab29-5095-4735-99ac-186fc216123f@mandt.placeholder	{"full_name": "Mr.  ISOOBA EMMANUEL"}	2026-02-10 16:43:44.711047+03	$2a$10$dummyhash
2a59fe45-d8cc-4e13-9585-4d74196d0a17	2a59fe45-d8cc-4e13-9585-4d74196d0a17@mandt.placeholder	{"full_name": "Mr.  KIMBUGWE ROBERT"}	2026-02-10 16:43:30.468294+03	$2a$10$dummyhash
e4d722e7-934f-47cd-b9ba-b8c1f8cfcc08	e4d722e7-934f-47cd-b9ba-b8c1f8cfcc08@mandt.placeholder	{"full_name": "Mr.  MWESIGWA INNOCENT"}	2026-02-10 16:44:23.520671+03	$2a$10$dummyhash
30559a2e-3a3e-4fa1-916f-13844785a13a	30559a2e-3a3e-4fa1-916f-13844785a13a@mandt.placeholder	{"full_name": "Mr.  MAYANJA DERRICK"}	2026-02-10 16:44:24.460981+03	$2a$10$dummyhash
058382f1-7377-445e-a5d9-025dc8817d55	058382f1-7377-445e-a5d9-025dc8817d55@mandt.placeholder	{"full_name": "Mr.  NGOBI FALUKU"}	2026-02-10 16:44:25.334875+03	$2a$10$dummyhash
fe11a0df-308f-43b9-908e-17b84eff55b8	fe11a0df-308f-43b9-908e-17b84eff55b8@mandt.placeholder	{"full_name": "NANKYA AMINAH"}	2026-02-10 16:44:27.948654+03	$2a$10$dummyhash
a84b8e25-b11a-49f3-b8fc-43110b003ae2	a84b8e25-b11a-49f3-b8fc-43110b003ae2@mandt.placeholder	{"full_name": "Mrs.  NANSAMBA RITAH"}	2026-02-10 16:44:28.850468+03	$2a$10$dummyhash
4aae52fd-276c-4764-9e01-e01a6ff197b0	4aae52fd-276c-4764-9e01-e01a6ff197b0@mandt.placeholder	{"full_name": "Mrs.  NABUNJE RUTH"}	2026-02-10 16:44:30.123655+03	$2a$10$dummyhash
0165b499-c223-40a2-8906-bfc9e90bd1f9	0165b499-c223-40a2-8906-bfc9e90bd1f9@mandt.placeholder	{"full_name": "Mrs.  NDAGIRA MAYIMUNA"}	2026-02-10 16:44:31.458857+03	$2a$10$dummyhash
5144948a-9f9e-4085-bc13-ba202f45ef93	5144948a-9f9e-4085-bc13-ba202f45ef93@mandt.placeholder	{"full_name": "Mr.  KASOLO DANIEL"}	2026-02-10 16:44:39.399853+03	$2a$10$dummyhash
e5da2496-0793-44ba-9178-79c27c5bcf69	e5da2496-0793-44ba-9178-79c27c5bcf69@mandt.placeholder	{"full_name": "Mrs.  MIREMBE JOAN"}	2026-02-10 16:44:40.269126+03	$2a$10$dummyhash
011c5550-c6d5-4470-96eb-f18682382295	011c5550-c6d5-4470-96eb-f18682382295@mandt.placeholder	{"full_name": "Mr.  NYANZI DAVID"}	2026-02-10 16:44:41.674515+03	$2a$10$dummyhash
f418cad4-e07c-4a28-aa93-b5c0441db7cb	f418cad4-e07c-4a28-aa93-b5c0441db7cb@mandt.placeholder	{"full_name": "Mr.  NTALE SULAIT"}	2026-02-10 16:44:38.31796+03	$2a$10$dummyhash
2cbc3f0b-d1cd-4b72-b43d-b4142b004395	2cbc3f0b-d1cd-4b72-b43d-b4142b004395@mandt.placeholder	{"full_name": "Mrs.  NAKIBUUKA RITAH"}	2026-02-10 16:44:47.767947+03	$2a$10$dummyhash
f05dadc0-897c-478f-83f0-f4e29bca7e43	f05dadc0-897c-478f-83f0-f4e29bca7e43@mandt.placeholder	{"full_name": "Mrs.  KATATUMBA SUSAN"}	2026-02-10 16:44:50.580724+03	$2a$10$dummyhash
2fe55582-cbe5-4d22-9cef-e108c2486d0f	2fe55582-cbe5-4d22-9cef-e108c2486d0f@mandt.placeholder	{"full_name": "Mrs.  KANSIME ODETH"}	2026-02-10 16:44:51.883719+03	$2a$10$dummyhash
a30514cc-6539-4942-a10b-1b294af66c37	a30514cc-6539-4942-a10b-1b294af66c37@mandt.placeholder	{"full_name": "Mr.  TURINAWE RICHARD"}	2026-02-10 16:45:02.290638+03	$2a$10$dummyhash
5150e093-dd70-4b8d-bf98-c6f0f110a361	5150e093-dd70-4b8d-bf98-c6f0f110a361@mandt.placeholder	{"full_name": "Mrs.  NAMUJUZI JUSTINE"}	2026-02-10 16:45:05.001774+03	$2a$10$dummyhash
cefb49b4-276b-4a58-9417-bbc2b325cbf8	cefb49b4-276b-4a58-9417-bbc2b325cbf8@mandt.placeholder	{"full_name": "Mrs.  KENEHERA HARRIET"}	2026-02-10 16:45:13.319831+03	$2a$10$dummyhash
9aba298e-7052-4829-abd2-6e4e4bcbfdcb	9aba298e-7052-4829-abd2-6e4e4bcbfdcb@mandt.placeholder	{"full_name": "Mrs.  NAKIMERA JUSTINE"}	2026-02-10 16:45:14.332091+03	$2a$10$dummyhash
2d24444a-7549-46fc-9f34-ef7539ff7d34	2d24444a-7549-46fc-9f34-ef7539ff7d34@mandt.placeholder	{"full_name": "Mrs.  NAKATO FLORENCE"}	2026-02-10 16:45:15.198254+03	$2a$10$dummyhash
6818310f-fbd9-49f6-bd5c-1e9040efa485	6818310f-fbd9-49f6-bd5c-1e9040efa485@mandt.placeholder	{"full_name": "Mrs.  NAKAMYA FIINA"}	2026-02-10 16:45:16.042537+03	$2a$10$dummyhash
59b8403c-e62a-4c52-b8e1-5990f90caae6	59b8403c-e62a-4c52-b8e1-5990f90caae6@mandt.placeholder	{"full_name": "Mrs.  MUTESI MAURINE"}	2026-02-10 16:45:17.279405+03	$2a$10$dummyhash
3e259e0b-71f9-4b38-a318-31475b572e83	3e259e0b-71f9-4b38-a318-31475b572e83@mandt.placeholder	{"full_name": "Mrs.  SEMAKULA HADIJAH"}	2026-02-10 16:44:57.077758+03	$2a$10$dummyhash
39c98a36-7e08-4a59-98a4-31fecde57f65	39c98a36-7e08-4a59-98a4-31fecde57f65@mandt.placeholder	{"full_name": "Mrs.  NAJUKO JULIET"}	2026-02-10 16:44:58.378724+03	$2a$10$dummyhash
f3ea030a-f08b-422a-971e-e9096db37e2a	f3ea030a-f08b-422a-971e-e9096db37e2a@mandt.placeholder	{"full_name": "Mr.  KAWOOYA NASHIL"}	2026-02-10 16:45:27.203797+03	$2a$10$dummyhash
2e8ff03f-83de-4c6b-ac2e-e6e78d875384	2e8ff03f-83de-4c6b-ac2e-e6e78d875384@mandt.placeholder	{"full_name": "Mr.  SENFUKA NICHOLAS"}	2026-02-10 16:44:59.642057+03	$2a$10$dummyhash
78647bc5-2391-41df-b2ab-4e0dcf417e94	78647bc5-2391-41df-b2ab-4e0dcf417e94@mandt.placeholder	{"full_name": "Mrs.  NAMAGEMBE JOSEPHINE"}	2026-02-10 16:45:30.219044+03	$2a$10$dummyhash
862d9fda-c97b-49a7-8a08-ef41ef41dba5	862d9fda-c97b-49a7-8a08-ef41ef41dba5@mandt.placeholder	{"full_name": "Mrs.  NAKAYONDO NIGHT"}	2026-02-10 16:45:31.222696+03	$2a$10$dummyhash
1d560cc3-4e58-43e3-b8fc-7d8ec4097ad9	1d560cc3-4e58-43e3-b8fc-7d8ec4097ad9@mandt.placeholder	{"full_name": "Mrs.  NAJJOBYO JANAT"}	2026-02-10 16:45:32.054578+03	$2a$10$dummyhash
eb560f55-b2cf-4816-b7d4-581f1ced7018	eb560f55-b2cf-4816-b7d4-581f1ced7018@mandt.placeholder	{"full_name": "Mrs.  NAKALULE CARLO"}	2026-02-10 16:45:32.981894+03	$2a$10$dummyhash
2ad746b0-4758-45b5-9f7f-961a13ecc999	2ad746b0-4758-45b5-9f7f-961a13ecc999@mandt.placeholder	{"full_name": "Mrs.  NALUBOWA HADIJAH"}	2026-02-10 16:45:33.967073+03	$2a$10$dummyhash
06429f14-33f9-4109-a7e9-04b0cb4e6bf8	06429f14-33f9-4109-a7e9-04b0cb4e6bf8@mandt.placeholder	{"full_name": "Mrs.  MUHAME AZIDAH"}	2026-02-10 16:45:35.326428+03	$2a$10$dummyhash
38305602-9166-470a-b31a-7684390165a8	38305602-9166-470a-b31a-7684390165a8@mandt.placeholder	{"full_name": "Mrs.  KABYESIZA AGNES"}	2026-02-10 16:45:36.596026+03	$2a$10$dummyhash
5f764476-2d30-45b5-b5a0-873db80f6159	5f764476-2d30-45b5-b5a0-873db80f6159@mandt.placeholder	{"full_name": "Mrs.  AJOLORWOTH FAITH"}	2026-02-10 16:45:37.524567+03	$2a$10$dummyhash
889ce556-5d0b-410f-b377-e951a83693cb	889ce556-5d0b-410f-b377-e951a83693cb@mandt.placeholder	{"full_name": "Mrs.  NAKAYIZA AGNES"}	2026-02-10 16:45:38.829864+03	$2a$10$dummyhash
6e1454cd-b2a8-46c0-b585-97a4e7069a5e	6e1454cd-b2a8-46c0-b585-97a4e7069a5e@mandt.placeholder	{"full_name": "Mrs.  ATIM TECKLER ELIZABETH"}	2026-02-10 16:45:39.726522+03	$2a$10$dummyhash
059e3a3a-4882-478e-91a0-e0351f674fda	059e3a3a-4882-478e-91a0-e0351f674fda@mandt.placeholder	{"full_name": "Mrs.  HADIJAH OKIRYA"}	2026-02-10 16:45:40.582575+03	$2a$10$dummyhash
7b5ba9f7-6759-45a7-9736-93dfc16962ff	7b5ba9f7-6759-45a7-9736-93dfc16962ff@mandt.placeholder	{"full_name": "Mrs.  NAMUBIRU ROBINAH"}	2026-02-10 16:45:41.487041+03	$2a$10$dummyhash
5fabe3f8-0c46-4fa3-9124-99e7995da45f	5fabe3f8-0c46-4fa3-9124-99e7995da45f@mandt.placeholder	{"full_name": "Mrs.  NAKAWESI AMINAH"}	2026-02-10 16:45:42.816375+03	$2a$10$dummyhash
bd9003ff-97f8-497a-b0ba-07f2f735627e	bd9003ff-97f8-497a-b0ba-07f2f735627e@mandt.placeholder	{"full_name": "Mrs.  NANKYA REHEMA"}	2026-02-10 16:45:43.744483+03	$2a$10$dummyhash
23881893-2b4a-4c91-acdf-2040dab32de2	23881893-2b4a-4c91-acdf-2040dab32de2@mandt.placeholder	{"full_name": "KYALO SHARIFAH"}	2026-02-10 16:45:44.638322+03	$2a$10$dummyhash
7c98dd28-ceac-43d7-b7ca-5e79a0fb9423	7c98dd28-ceac-43d7-b7ca-5e79a0fb9423@mandt.placeholder	{"full_name": "Mrs.  NALULE IMMACULATE"}	2026-02-10 16:45:45.460629+03	$2a$10$dummyhash
52b239b8-26f9-432e-919e-60b77283914b	52b239b8-26f9-432e-919e-60b77283914b@mandt.placeholder	{"full_name": "Mrs.  NAKULIMA EDITH"}	2026-02-10 16:45:57.393274+03	$2a$10$dummyhash
bf727a21-c74a-4cc5-ad62-9243ad0098b2	bf727a21-c74a-4cc5-ad62-9243ad0098b2@mandt.placeholder	{"full_name": "Mrs.  NANKYA ROSE"}	2026-02-10 16:45:58.279116+03	$2a$10$dummyhash
9033a25b-d580-453d-a954-f5a489167e93	9033a25b-d580-453d-a954-f5a489167e93@mandt.placeholder	{"full_name": "Mrs.  KYAZIKE MAGRET"}	2026-02-10 16:45:59.64719+03	$2a$10$dummyhash
3eaaac65-3b4a-43b8-8713-6167e463ec00	3eaaac65-3b4a-43b8-8713-6167e463ec00@mandt.placeholder	{"full_name": "Mr.  KATIMBO JOHN BOSCO"}	2026-02-10 16:46:00.930619+03	$2a$10$dummyhash
70863a8b-bb70-4fee-aa55-eb4b42353a26	70863a8b-bb70-4fee-aa55-eb4b42353a26@mandt.placeholder	{"full_name": "Mrs.  BRENDAH NINSIIMA"}	2026-02-10 16:46:04.873124+03	$2a$10$dummyhash
1d2eba9c-e1d3-4b09-aa8c-5aa56d76dfee	1d2eba9c-e1d3-4b09-aa8c-5aa56d76dfee@mandt.placeholder	{"full_name": "Mrs.  TUSIIME JOANITA"}	2026-02-10 16:46:06.564728+03	$2a$10$dummyhash
b2f9fc1c-a7a2-433c-b95a-a46fdc55f1f9	b2f9fc1c-a7a2-433c-b95a-a46fdc55f1f9@mandt.placeholder	{"full_name": "Mrs.  NAMUKWAYA OLIVIA"}	2026-02-10 16:46:07.420269+03	$2a$10$dummyhash
4bae7252-d05c-4562-8944-0898ca5b9817	4bae7252-d05c-4562-8944-0898ca5b9817@mandt.placeholder	{"full_name": "Mrs.  NANKYA JALIA"}	2026-02-10 16:46:09.143151+03	$2a$10$dummyhash
3ace33c7-e0d0-4fa3-ae26-e3bf55c4a544	3ace33c7-e0d0-4fa3-ae26-e3bf55c4a544@mandt.placeholder	{"full_name": "Mrs.  ZALWANGO RESTY"}	2026-02-10 16:46:10.581073+03	$2a$10$dummyhash
825a411b-c89a-4b59-9c20-a7c33eefa39a	825a411b-c89a-4b59-9c20-a7c33eefa39a@mandt.placeholder	{"full_name": "Mr.  NTAATE HENRY"}	2026-02-10 16:46:11.454318+03	$2a$10$dummyhash
7db5c923-cbce-4fe2-9c0c-5c0fd79e4322	7db5c923-cbce-4fe2-9c0c-5c0fd79e4322@mandt.placeholder	{"full_name": "Mrs.  NAGAWA OLIVIA"}	2026-02-10 16:46:12.304718+03	$2a$10$dummyhash
8d21cb2a-9bea-4b88-8d86-bb6ace6668bb	8d21cb2a-9bea-4b88-8d86-bb6ace6668bb@mandt.placeholder	{"full_name": "Mrs.  NAKYANZI SHAMIM"}	2026-02-10 16:46:13.144726+03	$2a$10$dummyhash
8e54490f-e956-47a9-95ac-75c1bee50ccf	8e54490f-e956-47a9-95ac-75c1bee50ccf@mandt.placeholder	{"full_name": "Mrs.  MBASINGA HARRIET"}	2026-02-10 16:46:13.988271+03	$2a$10$dummyhash
1e74885d-6b85-4a0c-89bf-465beb71ddda	1e74885d-6b85-4a0c-89bf-465beb71ddda@mandt.placeholder	{"full_name": "Mr.  SEMAKULA CHARLES"}	2026-02-10 16:46:15.263521+03	$2a$10$dummyhash
bee09d47-3ccf-40f7-a58b-65ea385c52c7	bee09d47-3ccf-40f7-a58b-65ea385c52c7@mandt.placeholder	{"full_name": "Mr.  SEKIZIYIVU IBRAHIM"}	2026-02-10 16:45:54.347138+03	$2a$10$dummyhash
05487af2-9e16-4a7f-b1cc-ed36c0a7f8e5	05487af2-9e16-4a7f-b1cc-ed36c0a7f8e5@mandt.placeholder	{"full_name": "Lubega Josam"}	2026-02-10 16:45:07.544653+03	$2a$10$dummyhash
be1f9842-cda7-4c77-b755-1bd2da1bf6d6	be1f9842-cda7-4c77-b755-1bd2da1bf6d6@mandt.placeholder	{"full_name": "Namuli Betty"}	2026-02-10 16:45:06.263562+03	$2a$10$dummyhash
843fd8ad-8f5e-403b-95ad-eb115e8bc944	843fd8ad-8f5e-403b-95ad-eb115e8bc944@mandt.placeholder	{"full_name": "Mrs.  NALWADDA PHIONAH"}	2026-02-10 16:46:08.282475+03	$2a$10$dummyhash
8ed1ce66-1da6-4dea-b98b-0efbd8566a8d	8ed1ce66-1da6-4dea-b98b-0efbd8566a8d@mandt.placeholder	{"full_name": "Mr.  SENDEGEYA SAKA"}	2026-02-10 16:45:00.957407+03	$2a$10$dummyhash
03e90c4f-3ce4-4379-9610-4bd7e50c7493	03e90c4f-3ce4-4379-9610-4bd7e50c7493@mandt.placeholder	{"full_name": "Mrs.  ZALWANGO JESCA BABIRYE"}	2026-02-10 16:45:03.576127+03	$2a$10$dummyhash
1e944c16-4cd3-4745-bc61-46ccac667064	1e944c16-4cd3-4745-bc61-46ccac667064@mandt.placeholder	{"full_name": "Mrs.  NAMBOOZE FAUZIA"}	2026-02-10 16:44:56.208414+03	$2a$10$dummyhash
a381ab48-64f5-42a1-8055-3947de1de7cc	a381ab48-64f5-42a1-8055-3947de1de7cc@mandt.placeholder	{"full_name": "Mrs.  NAMULONDO HADIJAH"}	2026-02-10 16:44:54.506727+03	$2a$10$dummyhash
00412331-e81b-42e6-8cd1-6eda658a259f	00412331-e81b-42e6-8cd1-6eda658a259f@mandt.placeholder	{"full_name": "KARUHANGA CHRISTOPHER"}	2026-02-10 16:46:03.577257+03	$2a$10$dummyhash
2440bea4-eed8-4be6-9416-8936269b315e	2440bea4-eed8-4be6-9416-8936269b315e@mandt.placeholder	{"full_name": "DDUMBA PETER"}	2026-02-10 16:46:02.24443+03	$2a$10$dummyhash
83dc39d8-adf0-4fb9-a877-94e47c784f86	83dc39d8-adf0-4fb9-a877-94e47c784f86@mandt.placeholder	{"full_name": "Mr.  KIJALI JOVAN"}	2026-02-10 16:45:56.078025+03	$2a$10$dummyhash
eff1ac0d-68ae-4320-ba77-598232062b39	eff1ac0d-68ae-4320-ba77-598232062b39@mandt.placeholder	{"full_name": "Mr.  KIBIRANGO MEDI"}	2026-02-10 16:45:55.181556+03	$2a$10$dummyhash
89114712-ed3d-471c-9055-9c1d46ffb3e8	89114712-ed3d-471c-9055-9c1d46ffb3e8@mandt.placeholder	{"full_name": "Mrs.  NAKAYIZA CATHERINE"}	2026-02-10 16:46:16.695458+03	$2a$10$dummyhash
c6212859-a4c3-43ec-8294-ec70e64a8081	c6212859-a4c3-43ec-8294-ec70e64a8081@mandt.placeholder	{"full_name": "NAMATOVU AGNES"}	2026-02-10 16:46:17.962704+03	$2a$10$dummyhash
c94a5039-8249-4130-9fb5-c7ed1949294a	c94a5039-8249-4130-9fb5-c7ed1949294a@mandt.placeholder	{"full_name": "NALUMULI ROBINAH"}	2026-02-10 16:46:19.216099+03	$2a$10$dummyhash
8b5da675-0aad-4af3-ad32-4cb50572622d	8b5da675-0aad-4af3-ad32-4cb50572622d@mandt.placeholder	{"full_name": "Mrs.  NANYONGA ZAINA"}	2026-02-10 16:46:21.848872+03	$2a$10$dummyhash
8ae68040-c08f-47a7-9418-df5a62997c81	8ae68040-c08f-47a7-9418-df5a62997c81@mandt.placeholder	{"full_name": "Mrs.  NALULE AMINA"}	2026-02-10 16:46:23.52663+03	$2a$10$dummyhash
0d7a345c-f063-446b-bc86-6c0c74dba4c5	0d7a345c-f063-446b-bc86-6c0c74dba4c5@mandt.placeholder	{"full_name": "Mrs.  NAMPIJJA LINDA"}	2026-02-10 16:46:24.359946+03	$2a$10$dummyhash
68d5c85d-6714-4f08-bf5f-163d94dc487a	68d5c85d-6714-4f08-bf5f-163d94dc487a@mandt.placeholder	{"full_name": "Mrs.  NANSAMBA MARGRET"}	2026-02-10 16:46:25.229299+03	$2a$10$dummyhash
9280697f-f63c-41f4-89df-baf1d8477e89	9280697f-f63c-41f4-89df-baf1d8477e89@mandt.placeholder	{"full_name": "Mr.  MAWANDA SHAFIK"}	2026-02-10 16:46:26.071699+03	$2a$10$dummyhash
23deccb8-1524-49b3-9c77-962da14bca5d	23deccb8-1524-49b3-9c77-962da14bca5d@mandt.placeholder	{"full_name": "Mrs.  NAKIMBUGWE JULIET"}	2026-02-10 16:46:26.921502+03	$2a$10$dummyhash
04283371-d6cf-4f0e-a6c1-9c0a14ef0105	04283371-d6cf-4f0e-a6c1-9c0a14ef0105@mandt.placeholder	{"full_name": "Mrs.  NATUKUNDA JUSTINE"}	2026-02-10 16:46:28.186067+03	$2a$10$dummyhash
cbf2944c-cf41-4891-b1db-eb59ac135da6	cbf2944c-cf41-4891-b1db-eb59ac135da6@mandt.placeholder	{"full_name": "Mrs.  ATUHIRE PHIONAH"}	2026-02-10 16:46:29.182723+03	$2a$10$dummyhash
d9f6c382-0f89-4305-a511-ee2462725ba4	d9f6c382-0f89-4305-a511-ee2462725ba4@mandt.placeholder	{"full_name": "Mrs.  ATUHIRE EVELYNE"}	2026-02-10 16:46:30.009997+03	$2a$10$dummyhash
e0bb2a3d-eb4b-4a11-a771-92f96bd4a087	e0bb2a3d-eb4b-4a11-a771-92f96bd4a087@mandt.placeholder	{"full_name": "Mrs.  KYOSIMIRE PAMELA"}	2026-02-10 16:46:34.744192+03	$2a$10$dummyhash
47cb8b23-3f16-4994-b8e6-18862a6ed990	47cb8b23-3f16-4994-b8e6-18862a6ed990@mandt.placeholder	{"full_name": "Mrs.  NALUKWAGO FRIDA"}	2026-02-10 16:46:35.568542+03	$2a$10$dummyhash
17ea56e2-d880-4e21-a39d-236426996eb9	17ea56e2-d880-4e21-a39d-236426996eb9@mandt.placeholder	{"full_name": "Miss  KAMYA TEDDY"}	2026-02-10 16:46:36.416931+03	$2a$10$dummyhash
d53752cf-89c5-4644-81d5-9715cbc17a32	d53752cf-89c5-4644-81d5-9715cbc17a32@mandt.placeholder	{"full_name": "Mrs.  KAHWA LACKEL"}	2026-02-10 16:46:38.112222+03	$2a$10$dummyhash
3f5248b6-0c60-42ab-8af0-9b77a5d979e9	3f5248b6-0c60-42ab-8af0-9b77a5d979e9@mandt.placeholder	{"full_name": "Mrs.  NAKIRANDA BABRA"}	2026-02-10 16:46:40.287111+03	$2a$10$dummyhash
679efbaa-b87d-4078-8999-fe63b8e5637c	679efbaa-b87d-4078-8999-fe63b8e5637c@mandt.placeholder	{"full_name": "Mrs.  KYATEREKERA CHRISTINE"}	2026-02-10 16:46:41.118106+03	$2a$10$dummyhash
52858932-34e1-4de4-be2f-4c30874934df	52858932-34e1-4de4-be2f-4c30874934df@mandt.placeholder	{"full_name": "Mr.  Lusiba Fred"}	2026-02-10 16:46:42.36443+03	$2a$10$dummyhash
84dd812b-0002-43d6-aa98-91a21570f1ef	84dd812b-0002-43d6-aa98-91a21570f1ef@mandt.placeholder	{"full_name": "Ms.  Lukwago Eva"}	2026-02-10 16:46:43.647559+03	$2a$10$dummyhash
5fa08807-417e-441a-8947-b1b18b1f4a24	5fa08807-417e-441a-8947-b1b18b1f4a24@mandt.placeholder	{"full_name": "Nakiseka Jowelia"}	2026-02-10 16:46:45.007448+03	$2a$10$dummyhash
250bc13c-d312-4415-aa76-dc2d55113737	250bc13c-d312-4415-aa76-dc2d55113737@mandt.placeholder	{"full_name": "Mrs.  Nambazira Rose"}	2026-02-10 16:46:46.308087+03	$2a$10$dummyhash
a63f462c-5bf3-4530-8f72-49e73d626741	a63f462c-5bf3-4530-8f72-49e73d626741@mandt.placeholder	{"full_name": "Mrs.  NAMUWULYA WINNIE BIRUNGI"}	2026-02-10 16:46:48.034942+03	$2a$10$dummyhash
602ea67a-340f-4dd3-9503-66a80b3026e2	602ea67a-340f-4dd3-9503-66a80b3026e2@mandt.placeholder	{"full_name": "Mrs.  NAKASIRYE SYLIVIA"}	2026-02-10 16:46:48.905876+03	$2a$10$dummyhash
fdbead1c-edcf-49eb-9201-fa387db679c7	fdbead1c-edcf-49eb-9201-fa387db679c7@mandt.placeholder	{"full_name": "Mrs.  NAGAWA REHEMA NAKATO"}	2026-02-10 16:46:49.773145+03	$2a$10$dummyhash
7b177c95-c74c-4512-8210-7de8614f1b3e	7b177c95-c74c-4512-8210-7de8614f1b3e@mandt.placeholder	{"full_name": "Mrs.  LUNKUSE FLORENCE"}	2026-02-10 16:46:50.594777+03	$2a$10$dummyhash
d89dee60-1781-44ff-ad5f-993a2b4318aa	d89dee60-1781-44ff-ad5f-993a2b4318aa@mandt.placeholder	{"full_name": "Namuyobo Monica"}	2026-02-10 16:46:51.847069+03	$2a$10$dummyhash
b222fe5c-9dd6-4815-be42-e738ed986da3	b222fe5c-9dd6-4815-be42-e738ed986da3@mandt.placeholder	{"full_name": "Mrs.  Nakonde Hasifah"}	2026-02-10 16:46:54.398049+03	$2a$10$dummyhash
f439d4d2-592b-4ee5-97a5-b2fb05b06bf7	f439d4d2-592b-4ee5-97a5-b2fb05b06bf7@mandt.placeholder	{"full_name": "Mr.  WASSWA CHRISTOPHER"}	2026-02-10 16:46:55.2437+03	$2a$10$dummyhash
e4a6fbc6-4f82-4bd9-8cde-8f1be35584ae	e4a6fbc6-4f82-4bd9-8cde-8f1be35584ae@mandt.placeholder	{"full_name": "Mr.  MUSISI TADEO"}	2026-02-10 16:46:56.5058+03	$2a$10$dummyhash
58211898-6c37-44ad-bef1-04da125547ce	58211898-6c37-44ad-bef1-04da125547ce@mandt.placeholder	{"full_name": "Mr.  ZIWA JOSEPHINE"}	2026-02-10 16:46:58.935784+03	$2a$10$dummyhash
8c26a54a-ba90-41eb-80ac-dfa81a737a11	8c26a54a-ba90-41eb-80ac-dfa81a737a11@mandt.placeholder	{"full_name": "Mrs.  DOREEN NAMAKULA"}	2026-02-10 16:46:59.839937+03	$2a$10$dummyhash
02fb0f11-cc31-4aa8-a850-0e6ab9506b0e	02fb0f11-cc31-4aa8-a850-0e6ab9506b0e@mandt.placeholder	{"full_name": "Mr.  Lubwama Robert"}	2026-02-10 16:47:01.063024+03	$2a$10$dummyhash
21a1ba1f-5cf1-419b-858f-46f01a312df3	21a1ba1f-5cf1-419b-858f-46f01a312df3@mandt.placeholder	{"full_name": "Mugema Jackson"}	2026-02-10 16:47:01.928359+03	$2a$10$dummyhash
76e70d00-3cd1-4d72-9cca-27c091aed4fa	76e70d00-3cd1-4d72-9cca-27c091aed4fa@mandt.placeholder	{"full_name": "Mr.  Mukoli Tom"}	2026-02-10 16:47:02.790444+03	$2a$10$dummyhash
497f9f16-5de5-44f4-939a-32d1457fccd0	497f9f16-5de5-44f4-939a-32d1457fccd0@mandt.placeholder	{"full_name": "Mr.  Mwesigwa Halid"}	2026-02-10 16:47:03.612351+03	$2a$10$dummyhash
bf3e4eae-0cf7-4477-ab0e-38f539fad6e5	bf3e4eae-0cf7-4477-ab0e-38f539fad6e5@mandt.placeholder	{"full_name": "Mrs.  Kaitesi Jolly"}	2026-02-10 16:47:04.878651+03	$2a$10$dummyhash
bfef2e51-3fb5-48b6-907f-35e4c93145dd	bfef2e51-3fb5-48b6-907f-35e4c93145dd@mandt.placeholder	{"full_name": "Mrs.  Akoth Allen"}	2026-02-10 16:47:05.735462+03	$2a$10$dummyhash
770cd95d-4fed-4c4f-bad3-c5ae55e48072	770cd95d-4fed-4c4f-bad3-c5ae55e48072@mandt.placeholder	{"full_name": "Mrs.  Nakacwa Annet"}	2026-02-10 16:47:06.608087+03	$2a$10$dummyhash
38f1990a-6042-4115-93c5-92c66bdf6f16	38f1990a-6042-4115-93c5-92c66bdf6f16@mandt.placeholder	{"full_name": "Mr.  Kisozi David"}	2026-02-10 16:47:07.440302+03	$2a$10$dummyhash
0e85cd6e-126b-4425-b34e-aaf43971cc56	0e85cd6e-126b-4425-b34e-aaf43971cc56@mandt.placeholder	{"full_name": "Mrs.  ASONYA RASHIDAH"}	2026-02-10 16:47:11.548035+03	$2a$10$dummyhash
a691e269-0a53-4065-b073-c7e53791c8e9	a691e269-0a53-4065-b073-c7e53791c8e9@mandt.placeholder	{"full_name": "Mrs.  AHWEZA NEUST"}	2026-02-10 16:47:12.87162+03	$2a$10$dummyhash
4e7ddc85-81c4-4b25-93d6-82699a422cf6	4e7ddc85-81c4-4b25-93d6-82699a422cf6@mandt.placeholder	{"full_name": "Mrs.  NELIMA FATUMA"}	2026-02-10 16:47:13.793172+03	$2a$10$dummyhash
a9d3665a-5072-49ad-bf5c-cf919abf5390	a9d3665a-5072-49ad-bf5c-cf919abf5390@mandt.placeholder	{"full_name": "Mrs.  NAKIBUUKA PAULINE"}	2026-02-10 16:47:14.660518+03	$2a$10$dummyhash
e144d13d-6b52-4477-a560-649bae54777d	e144d13d-6b52-4477-a560-649bae54777d@mandt.placeholder	{"full_name": "Mrs.  NAKADDU LILLIAN"}	2026-02-10 16:47:15.510661+03	$2a$10$dummyhash
2c27ec28-509f-4bef-9631-9c457be0599a	2c27ec28-509f-4bef-9631-9c457be0599a@mandt.placeholder	{"full_name": "Mr.  JJUUKO JOSEPH"}	2026-02-10 16:47:18.716045+03	$2a$10$dummyhash
be6c061d-3c8a-4f36-9406-ba6720a11eb4	be6c061d-3c8a-4f36-9406-ba6720a11eb4@mandt.placeholder	{"full_name": "Mr.  LUTAYA ABBEY"}	2026-02-10 16:47:19.611732+03	$2a$10$dummyhash
2e5762b6-30fa-4924-9011-22ddb7fadfd4	2e5762b6-30fa-4924-9011-22ddb7fadfd4@mandt.placeholder	{"full_name": "Mr.  NAKIBINGE RONNY"}	2026-02-10 16:47:20.516031+03	$2a$10$dummyhash
1b707875-94f0-434c-a774-eba3820a6dfc	1b707875-94f0-434c-a774-eba3820a6dfc@mandt.placeholder	{"full_name": "Mrs.  KITOOKE BRIAN"}	2026-02-10 16:47:21.36165+03	$2a$10$dummyhash
049d7941-6823-4b21-82b4-5bc4835646a2	049d7941-6823-4b21-82b4-5bc4835646a2@mandt.placeholder	{"full_name": "Mr.  KAKULE JONATHAN"}	2026-02-10 16:47:22.692978+03	$2a$10$dummyhash
90ec65bf-2af6-41fe-b342-e0b1942ecab3	90ec65bf-2af6-41fe-b342-e0b1942ecab3@mandt.placeholder	{"full_name": "NAMULI DIANAH"}	2026-02-10 16:47:23.5517+03	$2a$10$dummyhash
0d61f03d-50de-44ce-b5cb-034edd799022	0d61f03d-50de-44ce-b5cb-034edd799022@mandt.placeholder	{"full_name": "Mrs.  NYOMEWA SCOVIA"}	2026-02-10 16:47:25.823319+03	$2a$10$dummyhash
9d1fa1b5-d105-4036-af69-bf0ed65dc85e	9d1fa1b5-d105-4036-af69-bf0ed65dc85e@mandt.placeholder	{"full_name": "Mrs.  KYOSIMIRE PROSSY"}	2026-02-10 16:47:26.667266+03	$2a$10$dummyhash
db6dc8ee-a1a6-4967-a055-1113449edf7e	db6dc8ee-a1a6-4967-a055-1113449edf7e@mandt.placeholder	{"full_name": "Mrs.  NAKAMYA MWAJUMA"}	2026-02-10 16:47:27.533246+03	$2a$10$dummyhash
67b924b7-aa0b-41db-9f22-be7a14bbcbe2	67b924b7-aa0b-41db-9f22-be7a14bbcbe2@mandt.placeholder	{"full_name": "Mrs.  NABIRYE SYLVIA"}	2026-02-10 16:47:24.916983+03	$2a$10$dummyhash
e31ac65f-270b-41e6-b56a-3b4bcc40760c	e31ac65f-270b-41e6-b56a-3b4bcc40760c@mandt.placeholder	{"full_name": "Mrs.  NANYONGA RUTH"}	2026-02-10 16:47:29.701414+03	$2a$10$dummyhash
f7732074-6034-46b6-b12b-74937c2054a2	f7732074-6034-46b6-b12b-74937c2054a2@mandt.placeholder	{"full_name": "Mrs.  NAKITANDA SARAH"}	2026-02-10 16:47:30.612936+03	$2a$10$dummyhash
c8115791-4eb3-4354-91fe-c7e75ca428b4	c8115791-4eb3-4354-91fe-c7e75ca428b4@mandt.placeholder	{"full_name": "NAKANWAGI ANNET"}	2026-02-10 16:47:31.488631+03	$2a$10$dummyhash
2bedfdbb-dc3d-4090-8f43-7786c4ceeae6	2bedfdbb-dc3d-4090-8f43-7786c4ceeae6@mandt.placeholder	{"full_name": "Mrs.  AUMA FANISE TRACY"}	2026-02-10 16:47:32.317984+03	$2a$10$dummyhash
f015c08d-8754-459d-b7a9-4c204a40cc0c	f015c08d-8754-459d-b7a9-4c204a40cc0c@mandt.placeholder	{"full_name": "Mrs.  NAMUBIRU FARIDAH"}	2026-02-10 16:47:33.161717+03	$2a$10$dummyhash
f85517c5-778b-4e1d-bb83-cac8941217cb	f85517c5-778b-4e1d-bb83-cac8941217cb@mandt.placeholder	{"full_name": "Mrs.  KWAGALA SARAH"}	2026-02-10 16:47:34.009463+03	$2a$10$dummyhash
fce7fef4-8c3e-4a19-9430-34b75228f8e1	fce7fef4-8c3e-4a19-9430-34b75228f8e1@mandt.placeholder	{"full_name": "Mrs.  NANYONJO EMILLY"}	2026-02-10 16:47:34.877552+03	$2a$10$dummyhash
baf75191-95c6-494c-a58f-899de4007d9c	baf75191-95c6-494c-a58f-899de4007d9c@mandt.placeholder	{"full_name": "Mrs.  MBABALI HANIFAH"}	2026-02-10 16:47:36.111301+03	$2a$10$dummyhash
a416e84d-7890-4d98-93bb-a7e4cd912423	a416e84d-7890-4d98-93bb-a7e4cd912423@mandt.placeholder	{"full_name": "Mrs.  NANTALE FAITH"}	2026-02-10 16:47:36.976375+03	$2a$10$dummyhash
40e7940e-5d87-4606-bd23-a516f636503e	40e7940e-5d87-4606-bd23-a516f636503e@mandt.placeholder	{"full_name": "Mrs.  NAMUYOMBA JOSEPHINE"}	2026-02-10 16:47:37.837072+03	$2a$10$dummyhash
352dd7a5-fee2-4f80-855a-b558a3ff6837	352dd7a5-fee2-4f80-855a-b558a3ff6837@mandt.placeholder	{"full_name": "Mrs.  BULYABA RUTH KABUYE"}	2026-02-10 16:47:38.705576+03	$2a$10$dummyhash
cd77105b-ad29-4a6a-857a-2e970bfdffaf	cd77105b-ad29-4a6a-857a-2e970bfdffaf@mandt.placeholder	{"full_name": "Mrs.  NALWADDA FALIDAH"}	2026-02-10 16:47:40.828223+03	$2a$10$dummyhash
84c0dc10-03d9-4f98-ab1e-183d3d7f47b4	84c0dc10-03d9-4f98-ab1e-183d3d7f47b4@mandt.placeholder	{"full_name": "Mrs.  NABAGGALA SOLOME"}	2026-02-10 16:47:41.691125+03	$2a$10$dummyhash
fe98fe91-d2b4-4dcb-8861-d4ce8afa46c1	fe98fe91-d2b4-4dcb-8861-d4ce8afa46c1@mandt.placeholder	{"full_name": "Mrs.  NANYONJO HANIFAH"}	2026-02-10 16:47:42.555725+03	$2a$10$dummyhash
c84958cf-6d5e-4a35-be2d-58e052148331	c84958cf-6d5e-4a35-be2d-58e052148331@mandt.placeholder	{"full_name": "Mrs.  NALUWOOZA JULIET BUKENYA"}	2026-02-10 16:47:16.761125+03	$2a$10$dummyhash
22475371-f76b-4883-bebb-04f76bccea35	22475371-f76b-4883-bebb-04f76bccea35@mandt.placeholder	{"full_name": "Mrs.  Ssekitoleko Prossy"}	2026-02-10 16:46:52.682282+03	$2a$10$dummyhash
2859db94-1137-420c-98bb-7920c974ff2d	2859db94-1137-420c-98bb-7920c974ff2d@mandt.placeholder	{"full_name": "Mr.  Kasozi Robert"}	2026-02-10 16:46:32.119124+03	$2a$10$dummyhash
807e08cf-7f39-4911-bf52-34d1a7e3c504	807e08cf-7f39-4911-bf52-34d1a7e3c504@mandt.placeholder	{"full_name": "Mrs.  Namala Justine Tina"}	2026-02-10 16:46:37.256229+03	$2a$10$dummyhash
dcc9a568-ca90-4086-8acb-a890de378ec6	dcc9a568-ca90-4086-8acb-a890de378ec6@mandt.placeholder	{"full_name": "Ms.  Namakula Teddy"}	2026-02-10 16:46:32.949559+03	$2a$10$dummyhash
1e83cee1-e5ff-49b5-a234-902c80d48418	1e83cee1-e5ff-49b5-a234-902c80d48418@mandt.placeholder	{"full_name": "Nakyeyune Harriet"}	2026-02-10 16:46:30.850178+03	$2a$10$dummyhash
9d31382d-4706-461c-9216-ceec0f8b8e6c	9d31382d-4706-461c-9216-ceec0f8b8e6c@mandt.placeholder	{"full_name": "Mrs.  NALUBEGA FLORENCE"}	2026-02-10 16:47:45.110433+03	$2a$10$dummyhash
b5f04cc8-833c-42a7-9672-882d9c4e72bb	b5f04cc8-833c-42a7-9672-882d9c4e72bb@mandt.placeholder	{"full_name": "Mrs.  NAMWANJE JANE"}	2026-02-10 16:47:45.924405+03	$2a$10$dummyhash
be0e64d6-febb-4f68-ba5a-e17abbd2991f	be0e64d6-febb-4f68-ba5a-e17abbd2991f@mandt.placeholder	{"full_name": "Mrs.  NASSALI MARIAM"}	2026-02-10 16:47:46.778037+03	$2a$10$dummyhash
049dc689-88dd-477c-8797-006d09ea7b3c	049dc689-88dd-477c-8797-006d09ea7b3c@mandt.placeholder	{"full_name": "Mrs.  NANTEZA BEATRICE"}	2026-02-10 16:47:48.066719+03	$2a$10$dummyhash
c8ed617e-761f-4529-a299-c5929b29f595	c8ed617e-761f-4529-a299-c5929b29f595@mandt.placeholder	{"full_name": "OWINY GLADIES"}	2026-02-10 16:47:48.902243+03	$2a$10$dummyhash
13a5af1f-ff6f-422e-b220-f09c82ec42d8	13a5af1f-ff6f-422e-b220-f09c82ec42d8@mandt.placeholder	{"full_name": "Mrs.  NASOZI JOYCE"}	2026-02-10 16:47:50.710833+03	$2a$10$dummyhash
685174a7-f301-4f56-98bd-d9ab0d21c04d	685174a7-f301-4f56-98bd-d9ab0d21c04d@mandt.placeholder	{"full_name": "Mrs.  NAKAGGWA MILLY"}	2026-02-10 16:47:51.971618+03	$2a$10$dummyhash
a638170e-2831-4803-a289-6bc2365619c9	a638170e-2831-4803-a289-6bc2365619c9@mandt.placeholder	{"full_name": "Mrs.  TWIKIRIZE ALLEN"}	2026-02-10 16:47:52.867033+03	$2a$10$dummyhash
20040977-0530-4cb9-b17f-bbd10d368fde	20040977-0530-4cb9-b17f-bbd10d368fde@mandt.placeholder	{"full_name": "Mr.  AMPUMUZA AMON"}	2026-02-10 16:47:55.033576+03	$2a$10$dummyhash
b61d7141-6861-4ccf-9274-9dbf383b92bd	b61d7141-6861-4ccf-9274-9dbf383b92bd@mandt.placeholder	{"full_name": "Mrs.  NAMUDDU KEMIREMBE HARRIET"}	2026-02-10 16:47:55.884046+03	$2a$10$dummyhash
97aec1a9-c06d-41c2-a9ad-be5bc9dea8e1	97aec1a9-c06d-41c2-a9ad-be5bc9dea8e1@mandt.placeholder	{"full_name": "NALWADDA BABRA"}	2026-02-10 16:47:56.742641+03	$2a$10$dummyhash
ddcd3099-25e2-4b22-b1ca-76560948b379	ddcd3099-25e2-4b22-b1ca-76560948b379@mandt.placeholder	{"full_name": "Mrs.  AYENYA CHRISTINE NIGHT"}	2026-02-10 16:47:57.973627+03	$2a$10$dummyhash
ec55ad21-2845-4bde-a32e-e9bec58cf96b	ec55ad21-2845-4bde-a32e-e9bec58cf96b@mandt.placeholder	{"full_name": "Mrs.  ACHIRO SANDRA"}	2026-02-10 16:47:58.859949+03	$2a$10$dummyhash
655c2557-3d0c-4000-b25f-a9ec505a79b7	655c2557-3d0c-4000-b25f-a9ec505a79b7@mandt.placeholder	{"full_name": "Mrs.  MIREMBE GIRADES"}	2026-02-10 16:47:59.70063+03	$2a$10$dummyhash
b74b0220-e32f-4180-94af-3a5d0c7e78f2	b74b0220-e32f-4180-94af-3a5d0c7e78f2@mandt.placeholder	{"full_name": "Mrs.  NAKIBUULE ALLEN"}	2026-02-10 16:48:01.112098+03	$2a$10$dummyhash
43e20055-1131-480b-8c3f-55c2e1b29d29	43e20055-1131-480b-8c3f-55c2e1b29d29@mandt.placeholder	{"full_name": "Mrs.  NAKIRIJA JALIA"}	2026-02-10 16:48:06.615734+03	$2a$10$dummyhash
6b87bf17-9704-413f-bb47-dc9d34c534d7	6b87bf17-9704-413f-bb47-dc9d34c534d7@mandt.placeholder	{"full_name": "Mrs.  BUSINGYE ERINA H KIWEESI"}	2026-02-10 16:48:07.510633+03	$2a$10$dummyhash
1b5558e6-51cd-4394-aabe-a13d7353b130	1b5558e6-51cd-4394-aabe-a13d7353b130@mandt.placeholder	{"full_name": "Mrs.  NAKATE ANNET MAYANJA"}	2026-02-10 16:48:08.385412+03	$2a$10$dummyhash
a4b56ca6-a4b8-40bb-9556-c6d21b1e461c	a4b56ca6-a4b8-40bb-9556-c6d21b1e461c@mandt.placeholder	{"full_name": "Mr.  KITAKA FAZIRI SSEBUSUNJE"}	2026-02-10 16:48:13.318501+03	$2a$10$dummyhash
59b47db3-ea3b-43d3-a4b4-066ec97197b3	59b47db3-ea3b-43d3-a4b4-066ec97197b3@mandt.placeholder	{"full_name": "Mrs.  NABAKKA SAUDAH"}	2026-02-10 16:48:14.252792+03	$2a$10$dummyhash
8763caf5-ecee-4ab3-8e96-0f5795adee75	8763caf5-ecee-4ab3-8e96-0f5795adee75@mandt.placeholder	{"full_name": "Mrs.  NASILA SALUMU"}	2026-02-10 16:48:15.122791+03	$2a$10$dummyhash
a918b342-a96b-4e5e-968c-265edcca0844	a918b342-a96b-4e5e-968c-265edcca0844@mandt.placeholder	{"full_name": "Mrs.  TUMWINE SANDRAH"}	2026-02-10 16:48:17.235556+03	$2a$10$dummyhash
a1f9c4b6-1bc2-48c9-af4b-2349c9a9a146	a1f9c4b6-1bc2-48c9-af4b-2349c9a9a146@mandt.placeholder	{"full_name": "NALWOGA HALIMA"}	2026-02-10 16:48:18.939147+03	$2a$10$dummyhash
de951e6e-a97a-4d6b-a18e-91af72d22a51	de951e6e-a97a-4d6b-a18e-91af72d22a51@mandt.placeholder	{"full_name": "Mrs.  NANYANZI RITAH"}	2026-02-10 16:48:22.967621+03	$2a$10$dummyhash
cfe94e4a-1db7-4e9b-829b-92144418b7ae	cfe94e4a-1db7-4e9b-829b-92144418b7ae@mandt.placeholder	{"full_name": "KEBIRUNGI ASYNANSI"}	2026-02-10 16:47:54.197728+03	$2a$10$dummyhash
f0469b29-f9b1-487e-8bae-71ab2c752f96	f0469b29-f9b1-487e-8bae-71ab2c752f96@mandt.placeholder	{"full_name": "Mrs.  NABAGESERA ROBINAH"}	2026-02-10 16:48:12.459872+03	$2a$10$dummyhash
2e35e7ef-d91e-465c-8646-164db82e9503	2e35e7ef-d91e-465c-8646-164db82e9503@mandt.placeholder	{"full_name": "Mrs.  Nanyon jo Hasifah"}	2026-02-10 16:48:04.277913+03	$2a$10$dummyhash
0e909348-0d0f-40bb-a690-73d05672b399	0e909348-0d0f-40bb-a690-73d05672b399@mandt.placeholder	{"full_name": "Miss  Nalwada Phionah"}	2026-02-10 16:48:02.881864+03	$2a$10$dummyhash
73906246-c2cf-4de6-bbc2-f4ce77ea7e1f	73906246-c2cf-4de6-bbc2-f4ce77ea7e1f@mandt.placeholder	{"full_name": "Mr.  BUULE SWALIKI"}	2026-02-10 16:48:25.067536+03	$2a$10$dummyhash
ff4e0d95-46e5-4d3d-8d36-08c2e6adebf9	ff4e0d95-46e5-4d3d-8d36-08c2e6adebf9@mandt.placeholder	{"full_name": "Mrs.  TWESIGYE EMMACULATE"}	2026-02-10 16:48:25.923918+03	$2a$10$dummyhash
5c811279-65df-42e4-9726-f9a3917a5150	5c811279-65df-42e4-9726-f9a3917a5150@mandt.placeholder	{"full_name": "Mrs.  NAKYEJWE AMINA"}	2026-02-10 16:48:28.073999+03	$2a$10$dummyhash
482585ba-0a4b-4936-9b36-a120b90da10d	482585ba-0a4b-4936-9b36-a120b90da10d@mandt.placeholder	{"full_name": "Mrs.  NAMUBIRU ASHA"}	2026-02-10 16:48:30.178846+03	$2a$10$dummyhash
00810ca3-4b47-46eb-be1d-507c26a19c38	00810ca3-4b47-46eb-be1d-507c26a19c38@mandt.placeholder	{"full_name": "Mrs.  NANYANGE AMINAH"}	2026-02-10 16:48:31.163151+03	$2a$10$dummyhash
ff30f926-2e6b-4a5b-89d5-29beeee48358	ff30f926-2e6b-4a5b-89d5-29beeee48358@mandt.placeholder	{"full_name": "Mrs.  NAKIBOWA VICTORIA"}	2026-02-10 16:48:32.085223+03	$2a$10$dummyhash
d22d3eb7-0f94-4368-b127-b709d2c5b380	d22d3eb7-0f94-4368-b127-b709d2c5b380@mandt.placeholder	{"full_name": "Miss  KAAHWA SPECIOZA"}	2026-02-10 16:48:32.938082+03	$2a$10$dummyhash
bb8c3d64-b955-4b0f-b9b9-6b6258fa8e9c	bb8c3d64-b955-4b0f-b9b9-6b6258fa8e9c@mandt.placeholder	{"full_name": "Mrs.  MWAJUMA BAHATI"}	2026-02-10 16:48:33.827561+03	$2a$10$dummyhash
5f379480-93c4-417c-934d-d1ab52445110	5f379480-93c4-417c-934d-d1ab52445110@mandt.placeholder	{"full_name": "Mrs.  KAYAGA AMINAH"}	2026-02-10 16:48:35.084959+03	$2a$10$dummyhash
ee846bcc-1cef-4526-9f9e-e03ffe1f0f12	ee846bcc-1cef-4526-9f9e-e03ffe1f0f12@mandt.placeholder	{"full_name": "Mrs.  NAKYEYUNE FLORENCE"}	2026-02-10 16:48:35.940717+03	$2a$10$dummyhash
b36fc70a-d8bf-4702-bb83-aea110ffbc55	b36fc70a-d8bf-4702-bb83-aea110ffbc55@mandt.placeholder	{"full_name": "Mrs.  NDAGIRE UDAYA"}	2026-02-10 16:48:36.803463+03	$2a$10$dummyhash
01ced916-8a12-4dce-8fd6-4303872578f3	01ced916-8a12-4dce-8fd6-4303872578f3@mandt.placeholder	{"full_name": "Mrs.  NAKATANZA JANET"}	2026-02-10 16:48:37.689035+03	$2a$10$dummyhash
8c05f954-fca9-4cda-8b70-c4616644b9de	8c05f954-fca9-4cda-8b70-c4616644b9de@mandt.placeholder	{"full_name": "Mr.  SSEKABENDE DAVID"}	2026-02-10 16:48:38.61603+03	$2a$10$dummyhash
e952954c-d1a6-4a27-8544-74ab9382d413	e952954c-d1a6-4a27-8544-74ab9382d413@mandt.placeholder	{"full_name": "Mrs.  NALUBEGA JOWERIA"}	2026-02-10 16:48:39.625567+03	$2a$10$dummyhash
516b63dc-f0e8-4086-b7ed-742550a6e724	516b63dc-f0e8-4086-b7ed-742550a6e724@mandt.placeholder	{"full_name": "Mrs.  MBABAZI SYLIVIA"}	2026-02-10 16:48:40.902661+03	$2a$10$dummyhash
7d1cd2ef-87d7-42ab-8cc2-8b9e300695aa	7d1cd2ef-87d7-42ab-8cc2-8b9e300695aa@mandt.placeholder	{"full_name": "KOBUSINGYE SARAH"}	2026-02-10 16:48:41.919423+03	$2a$10$dummyhash
d58b90ae-87db-434f-bc8f-7bdc2fbff9c5	d58b90ae-87db-434f-bc8f-7bdc2fbff9c5@mandt.placeholder	{"full_name": "Mrs.  NABUKALU LAILA"}	2026-02-10 16:48:42.855258+03	$2a$10$dummyhash
1e525de3-36c7-4ab2-b9e6-57945bc44dfe	1e525de3-36c7-4ab2-b9e6-57945bc44dfe@mandt.placeholder	{"full_name": "Mr.  KIWANUKA FRED"}	2026-02-10 16:48:43.774944+03	$2a$10$dummyhash
812380aa-0496-438a-a468-937227941b7d	812380aa-0496-438a-a468-937227941b7d@mandt.placeholder	{"full_name": "Mrs.  NAMPALA FLORENCE"}	2026-02-10 16:48:44.61099+03	$2a$10$dummyhash
0e5e79bd-b62b-497d-8617-63042da74bc1	0e5e79bd-b62b-497d-8617-63042da74bc1@mandt.placeholder	{"full_name": "Mrs.  AMUTUHAIRWE DOROTHY"}	2026-02-10 16:48:45.439018+03	$2a$10$dummyhash
1b0aeb33-b6e3-4dd7-a7f7-df022cd76163	1b0aeb33-b6e3-4dd7-a7f7-df022cd76163@mandt.placeholder	{"full_name": "Mrs.  NAKANWAGI HASIFAH"}	2026-02-10 16:48:46.262238+03	$2a$10$dummyhash
806fc588-7930-42f2-b37d-43b864d04cd9	806fc588-7930-42f2-b37d-43b864d04cd9@mandt.placeholder	{"full_name": "Mrs.  NAKAZIBWE DAMALI"}	2026-02-10 16:48:47.992378+03	$2a$10$dummyhash
d784e00b-e785-4b04-bc82-a34785d0c908	d784e00b-e785-4b04-bc82-a34785d0c908@mandt.placeholder	{"full_name": "NAMAGEMBE RITAH"}	2026-02-10 16:48:48.906051+03	$2a$10$dummyhash
8fbef6ce-3250-492d-bdd1-f72e061182fa	8fbef6ce-3250-492d-bdd1-f72e061182fa@mandt.placeholder	{"full_name": "Mrs.  BIRABWA BETTY"}	2026-02-10 16:48:49.758195+03	$2a$10$dummyhash
5e3404a4-b756-4d44-b56f-753468047cc0	5e3404a4-b756-4d44-b56f-753468047cc0@mandt.placeholder	{"full_name": "Mrs.  WATERA JOAN"}	2026-02-10 16:48:50.63909+03	$2a$10$dummyhash
67a687ea-fbae-4e24-88d8-8a24ae43d1bb	67a687ea-fbae-4e24-88d8-8a24ae43d1bb@mandt.placeholder	{"full_name": "Mr.  NSUBUGA YAHAYA"}	2026-02-10 16:48:51.499597+03	$2a$10$dummyhash
24c1a2a5-6a2f-4cc3-a236-6f74c1e062d6	24c1a2a5-6a2f-4cc3-a236-6f74c1e062d6@mandt.placeholder	{"full_name": "NABUKALU FARIDAH"}	2026-02-10 16:48:52.801455+03	$2a$10$dummyhash
1029a4ef-1606-43f5-9f96-6cc3b376df83	1029a4ef-1606-43f5-9f96-6cc3b376df83@mandt.placeholder	{"full_name": "Mrs.  NAMATOVU PROSSY"}	2026-02-10 16:48:53.661842+03	$2a$10$dummyhash
38a402ee-bf41-4712-9e29-fad0c93a564e	38a402ee-bf41-4712-9e29-fad0c93a564e@mandt.placeholder	{"full_name": "Mrs.  NAMUGERWA SULAINAH"}	2026-02-10 16:48:54.514644+03	$2a$10$dummyhash
a00de490-37a3-4c94-b0b7-c4aaa0f8d6f4	a00de490-37a3-4c94-b0b7-c4aaa0f8d6f4@mandt.placeholder	{"full_name": "Miss  MAKOHA ELIZABETH"}	2026-02-10 16:48:55.441803+03	$2a$10$dummyhash
e1095323-d66f-4912-b3b1-275a89095747	e1095323-d66f-4912-b3b1-275a89095747@mandt.placeholder	{"full_name": "Miss  TUMUSHABE EVA"}	2026-02-10 16:48:56.298284+03	$2a$10$dummyhash
5622c419-73a7-422f-8035-0c9fc604958e	5622c419-73a7-422f-8035-0c9fc604958e@mandt.placeholder	{"full_name": "Mrs.  NAMBOWA ROSE"}	2026-02-10 16:48:58.46098+03	$2a$10$dummyhash
dc69bdc3-f49d-4959-abdc-b41ab2a40fc8	dc69bdc3-f49d-4959-abdc-b41ab2a40fc8@mandt.placeholder	{"full_name": "Mr.  KIBUUKA RAJAB"}	2026-02-10 16:48:59.784664+03	$2a$10$dummyhash
aae74515-1a09-4874-a4d1-b0d5fbf99680	aae74515-1a09-4874-a4d1-b0d5fbf99680@mandt.placeholder	{"full_name": "Mrs.  NAKAFU DOCUS"}	2026-02-10 16:49:00.677327+03	$2a$10$dummyhash
9f51a27a-da0a-432f-8688-555e169d1164	9f51a27a-da0a-432f-8688-555e169d1164@mandt.placeholder	{"full_name": "Mr.  KAZIBWE ALLAN"}	2026-02-10 16:49:20.72481+03	$2a$10$dummyhash
27f9b303-2121-442f-a819-ea603a0a7af9	27f9b303-2121-442f-a819-ea603a0a7af9@mandt.placeholder	{"full_name": "Mr.  KASAANA JORAN"}	2026-02-10 16:49:22.025073+03	$2a$10$dummyhash
aae1f352-fb5f-4324-9b80-ac959ae65ab0	aae1f352-fb5f-4324-9b80-ac959ae65ab0@mandt.placeholder	{"full_name": "Mr.  MWETISE GODFREY"}	2026-02-10 16:49:23.744309+03	$2a$10$dummyhash
527b9b72-1c0e-430b-8851-f86880d16f0d	527b9b72-1c0e-430b-8851-f86880d16f0d@mandt.placeholder	{"full_name": "Mr.  BYAKATONDA WILLIAM"}	2026-02-10 16:49:26.394896+03	$2a$10$dummyhash
05081c52-bc29-474b-a472-54b87f315df5	05081c52-bc29-474b-a472-54b87f315df5@mandt.placeholder	{"full_name": "Mr.  MUGUME KATUNGI HAKIM"}	2026-02-10 16:49:27.78435+03	$2a$10$dummyhash
b89ae05f-3330-45e8-95c2-e297a600e86a	b89ae05f-3330-45e8-95c2-e297a600e86a@mandt.placeholder	{"full_name": "Mr.  MUKWAAYA DENNIS"}	2026-02-10 16:49:29.245438+03	$2a$10$dummyhash
d081a228-9b53-4678-8649-6d4343dfcb4d	d081a228-9b53-4678-8649-6d4343dfcb4d@mandt.placeholder	{"full_name": "Mrs.  NATUKUNDA FORTUNATE"}	2026-02-10 16:49:33.519416+03	$2a$10$dummyhash
dc3bf79c-9256-47b9-b1c2-ae0cc73d1b01	dc3bf79c-9256-47b9-b1c2-ae0cc73d1b01@mandt.placeholder	{"full_name": "Mr.  NDIDDE KHALID"}	2026-02-10 16:49:36.292898+03	$2a$10$dummyhash
0dd9b35b-c1c1-4bcb-95c4-beef479dcdfe	0dd9b35b-c1c1-4bcb-95c4-beef479dcdfe@mandt.placeholder	{"full_name": "Mr.  TAYEBWA FRANCIS"}	2026-02-10 16:49:41.132508+03	$2a$10$dummyhash
0a67145e-b52c-4876-828d-41b6bea77285	0a67145e-b52c-4876-828d-41b6bea77285@mandt.placeholder	{"full_name": "Mr.  DOOMA IVAN MUKISA"}	2026-02-10 16:49:45.086215+03	$2a$10$dummyhash
97f1821f-e715-493f-80fd-518476e706ad	97f1821f-e715-493f-80fd-518476e706ad@mandt.placeholder	{"full_name": "Mr.  KABEGA DEO"}	2026-02-10 16:49:46.409131+03	$2a$10$dummyhash
ad985c89-3b57-4414-bb67-c429ba6d0a14	ad985c89-3b57-4414-bb67-c429ba6d0a14@mandt.placeholder	{"full_name": "Mr.  KASAGA MOSES"}	2026-02-10 16:49:49.06934+03	$2a$10$dummyhash
6b72a43c-7f84-4ce5-9e79-2cce4be67e8f	6b72a43c-7f84-4ce5-9e79-2cce4be67e8f@mandt.placeholder	{"full_name": "Mr.  SONKO SULAIMAN"}	2026-02-10 16:49:51.673327+03	$2a$10$dummyhash
e499b5b7-c4ad-4e35-9a60-92ebfa3cf33f	e499b5b7-c4ad-4e35-9a60-92ebfa3cf33f@mandt.placeholder	{"full_name": "Mr.  WASSWA DERRICK"}	2026-02-10 16:50:05.728226+03	$2a$10$dummyhash
4835ca46-2cef-4d34-a686-160af1ba3c8e	4835ca46-2cef-4d34-a686-160af1ba3c8e@mandt.placeholder	{"full_name": "Mrs.  NTONGO JOYCE"}	2026-02-10 16:50:15.222561+03	$2a$10$dummyhash
192f54cf-2a8b-4ae2-bbca-aa662285445b	192f54cf-2a8b-4ae2-bbca-aa662285445b@mandt.placeholder	{"full_name": "Mr.  Happy James"}	2026-02-10 16:50:37.435978+03	$2a$10$dummyhash
5f149cac-16b0-47f0-8a7e-e777c3d48d4b	5f149cac-16b0-47f0-8a7e-e777c3d48d4b@mandt.placeholder	{"full_name": "Twikirizze Allen"}	2026-02-10 16:50:38.753695+03	$2a$10$dummyhash
3e2549bb-bb3a-4877-ad65-51322aa44640	3e2549bb-bb3a-4877-ad65-51322aa44640@mandt.placeholder	{"full_name": "Mrs.  NAKABUGO PROSSY"}	2026-02-10 16:50:46.394848+03	$2a$10$dummyhash
def039f2-8c59-419a-bd56-d304bfb7f9cc	def039f2-8c59-419a-bd56-d304bfb7f9cc@mandt.placeholder	{"full_name": "Mrs.  NABABI MARGRET"}	2026-02-10 16:50:47.728297+03	$2a$10$dummyhash
fc513d83-9750-4fca-82c2-d74800b2a8fc	fc513d83-9750-4fca-82c2-d74800b2a8fc@mandt.placeholder	{"full_name": "Mrs.  KINAWA ZAITUNI"}	2026-02-10 16:50:49.040176+03	$2a$10$dummyhash
b0f0f535-abbf-44ed-af6d-a6ec16adc39f	b0f0f535-abbf-44ed-af6d-a6ec16adc39f@mandt.placeholder	{"full_name": "Mr.  NYAKANA HAMISI"}	2026-02-10 16:50:56.034425+03	$2a$10$dummyhash
27798bc7-cb83-4bba-a8ca-0f2f28d71893	27798bc7-cb83-4bba-a8ca-0f2f28d71893@mandt.placeholder	{"full_name": "Mr.  BIRE SHARIF"}	2026-02-10 16:50:57.340567+03	$2a$10$dummyhash
16120aaf-5f26-4f85-a14e-c8d8433120a0	16120aaf-5f26-4f85-a14e-c8d8433120a0@mandt.placeholder	{"full_name": "Miss  Nalugo Christine"}	2026-02-10 16:51:00.139175+03	$2a$10$dummyhash
2b3697d3-23ce-4d33-bff1-b1af226bba5e	2b3697d3-23ce-4d33-bff1-b1af226bba5e@mandt.placeholder	{"full_name": "Mrs.  Lusiba Sarah"}	2026-02-10 16:51:02.398982+03	$2a$10$dummyhash
4a5d4fad-1cb9-4122-97eb-f7e19410f79e	4a5d4fad-1cb9-4122-97eb-f7e19410f79e@mandt.placeholder	{"full_name": "Kyohairwe Joyce"}	2026-02-10 16:51:03.913646+03	$2a$10$dummyhash
e2ef61b6-316f-4f34-87cc-0fb63095d635	e2ef61b6-316f-4f34-87cc-0fb63095d635@mandt.placeholder	{"full_name": "Mrs.  Nakibinge Justine"}	2026-02-10 16:51:07.267971+03	$2a$10$dummyhash
ccfac2d3-c9a4-4159-84aa-13ffc2494f52	ccfac2d3-c9a4-4159-84aa-13ffc2494f52@mandt.placeholder	{"full_name": "Ms.  Nkalubo Aisha"}	2026-02-10 16:46:38.967816+03	$2a$10$dummyhash
9213a73a-2c6f-444b-920d-aec163ad7523	9213a73a-2c6f-444b-920d-aec163ad7523@mandt.placeholder	{"full_name": "Mrs.  Kagaba Brenda Mbabazi"}	2026-02-10 16:51:12.722189+03	$2a$10$dummyhash
29c2f6cf-c309-4f58-809d-64ed0fa64498	29c2f6cf-c309-4f58-809d-64ed0fa64498@mandt.placeholder	{"full_name": "Mrs.  Nakirijja Jalia"}	2026-02-10 16:51:14.028059+03	$2a$10$dummyhash
0cf5d7e4-9475-4d21-8e0d-e57ce71c7982	0cf5d7e4-9475-4d21-8e0d-e57ce71c7982@mandt.placeholder	{"full_name": "Miss  Nabwato Hadijah"}	2026-02-10 16:51:15.752114+03	$2a$10$dummyhash
1ee0c2b8-b641-4aa6-ac2f-1ee634e863f3	1ee0c2b8-b641-4aa6-ac2f-1ee634e863f3@mandt.placeholder	{"full_name": "Ntamu Sharif"}	2026-02-10 16:51:17.126747+03	$2a$10$dummyhash
4437c898-9b7e-49c8-8b34-4c862bc68a3b	4437c898-9b7e-49c8-8b34-4c862bc68a3b@mandt.placeholder	{"full_name": "Namale Noeline"}	2026-02-10 16:51:18.430529+03	$2a$10$dummyhash
3a7fdba4-7ee7-4587-9e1b-604b2fe563b8	3a7fdba4-7ee7-4587-9e1b-604b2fe563b8@mandt.placeholder	{"full_name": "Nambasi Kenneth"}	2026-02-10 16:51:19.763724+03	$2a$10$dummyhash
a14561ef-479d-4998-96a0-8dfb85bda786	a14561ef-479d-4998-96a0-8dfb85bda786@mandt.placeholder	{"full_name": "Ms.  Namayanja Phionah"}	2026-02-10 16:51:21.533706+03	$2a$10$dummyhash
b2d870b6-1e1b-43d6-a71c-61664bea1094	b2d870b6-1e1b-43d6-a71c-61664bea1094@mandt.placeholder	{"full_name": "Miss  Nasolo Harriet"}	2026-02-10 16:51:22.894726+03	$2a$10$dummyhash
87681d90-5e70-415d-b242-a5efc8000cb2	87681d90-5e70-415d-b242-a5efc8000cb2@mandt.placeholder	{"full_name": "Miss  Nantume Ritah"}	2026-02-10 16:51:24.214194+03	$2a$10$dummyhash
5521a9a0-3fd5-4d41-b299-16db5c4ec1cc	5521a9a0-3fd5-4d41-b299-16db5c4ec1cc@mandt.placeholder	{"full_name": "Mirembe Pamela"}	2026-02-10 16:51:25.712198+03	$2a$10$dummyhash
a2146ef5-2cae-4c93-9117-f31abc6b6fd3	a2146ef5-2cae-4c93-9117-f31abc6b6fd3@mandt.placeholder	{"full_name": "Miss  Lukyamuzi Benard"}	2026-02-10 16:51:28.694335+03	$2a$10$dummyhash
5dcb8cc6-092b-411e-9c7a-33fc3430da19	5dcb8cc6-092b-411e-9c7a-33fc3430da19@mandt.placeholder	{"full_name": "Mukasa Sarah"}	2026-02-10 16:36:21.486549+03	$2a$10$dummyhash
\.


--
-- Data for Name: asset_valuations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.asset_valuations (id, collateral_id, valuation_date, valued_by, valuation_amount, valuation_method, notes, created_at) FROM stdin;
\.


--
-- Data for Name: branch_performance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.branch_performance (id, branch_id, period_start, period_end, total_loans, total_disbursed, total_repayments, active_clients, new_clients, default_rate, created_at) FROM stdin;
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.branches (id, name, code, address, phone, email, manager_id, territory_id, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_messages (id, conversation_id, role, content, created_at) FROM stdin;
\.


--
-- Data for Name: collateral; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.collateral (id, loan_application_id, type, description, estimated_value, current_value, status, location, registration_number, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: collateral_insurance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.collateral_insurance (id, collateral_id, insurance_company, policy_number, coverage_amount, premium_amount, start_date, expiry_date, status, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.conversations (id, user_id, title, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.groups (id, group_name, description, created_at, status) FROM stdin;
bf94289c-b286-4f94-967d-c549f2af2fae	MUKASA	\N	2026-02-09 15:28:19.177+03	active
cb0420d4-9543-4e7b-9b43-7f664f88b632	BERNARD	\N	2026-02-09 15:28:20.626+03	active
7a77aa13-5676-4a96-831f-fd4679598333	KAPERE	\N	2026-02-09 15:28:22.036+03	active
648a03b9-9a35-4988-a6b3-0d697b8de65a	BRAINGROUP	\N	2026-02-09 15:28:29.182+03	active
34e9c736-1164-4c92-8c6e-0201dd12d1ea	IMMACULATE	\N	2026-02-09 15:28:31.906+03	active
ef6a5d39-1f61-40ea-9959-48c7fe289c5b	SSENTONGO	\N	2026-02-09 15:28:33.118+03	active
3fc6ce3f-6543-4540-ab4c-b85cd959e0ff	SEWA	\N	2026-02-09 15:28:35.537+03	active
44b99547-1017-41cb-b574-854c2a3404c0	STUART	\N	2026-02-09 15:28:38.565+03	active
7a5366a4-d167-40f2-9d1d-af7a716ceb8c	DENIS	\N	2026-02-09 15:28:42.71+03	active
8aa2723e-3eea-4d05-9d8e-a9d7336a46d1	JACENT	\N	2026-02-09 15:28:46.948+03	active
bf7147f5-a11f-49a2-8577-3d1b572d10e5	DEO	\N	2026-02-09 15:28:48.151+03	active
6f710c7a-ec68-4ead-aef1-0048e57b7ad8	RONALD	\N	2026-02-09 15:28:52.269+03	active
c51d4850-a604-47f2-85a4-621db6f6aa76	MATIA	\N	2026-02-09 15:28:54.018+03	active
b287907f-c7b5-45ff-8b52-a4586877fa86	KAZINGA	\N	2026-02-09 15:28:56.361+03	active
50581d34-f62c-480d-b864-bacf5820b771	NDYANABO	\N	2026-02-09 15:28:58.168+03	active
d736eba4-ded0-47d6-b2a3-b138422f1c17	MUBIRU	\N	2026-02-09 15:29:02.356+03	active
e7627f71-0935-4bba-b173-c04c108775a5	ADRIAN	\N	2026-02-09 15:29:03.563+03	active
a8d609dc-d32c-4d75-844b-be1bb6990a9e	NALUKENGE	\N	2026-02-09 15:29:10.263+03	active
a3c98617-1f5f-46e7-babb-9b007b1eb35d	BENON	\N	2026-02-09 15:29:14.442+03	active
b113a21b-3ccd-47ef-ad69-3d84361d44bf	BOGERE	\N	2026-02-09 15:29:16.275+03	active
f7355d86-f42d-4d7e-8ec0-a4425c8870e4	JOAN GROUP	\N	2026-02-09 15:29:18.086+03	active
405af9d4-2949-4229-9069-6ae04aff939a	NSUBUGA	\N	2026-02-09 15:29:24.095+03	active
438f2e9a-798d-4d28-85f3-9c79916911f5	TEDDY	\N	2026-02-09 15:29:25.788+03	active
64fcca38-4e88-4832-abb9-1e37f2447a95	ANXIOUS	\N	2026-02-09 15:29:30.368+03	active
5bdc86a2-9fad-48c9-a95e-7733d966b250	SHAMIM	\N	2026-02-09 15:29:33.911+03	active
52fbb4b1-3929-43e5-a0cd-c3f40e8df483	OBED	\N	2026-02-09 15:29:38.685+03	active
78045ea9-08c4-40cb-b489-5e5e5b1e0d88	WASSWA	\N	2026-02-09 15:29:42.254+03	active
58862b88-a0d1-4326-b1d0-82058db0b10f	ZAINAB	\N	2026-02-09 15:29:44.427+03	active
5479431c-3d1c-49c1-a118-f46567117e1b	HAMZA	\N	2026-02-09 15:29:48.526+03	active
18836fc6-98b2-44b4-908b-227ff7dfbd37	IBRAH GROUP	\N	2026-02-09 15:29:56.719+03	active
b48f3ac7-e107-4718-82c7-0d599fb08c44	SENDI	\N	2026-02-09 15:30:01.648+03	active
2531cd6a-e4fc-4be7-ada9-09b8397226a7	BRIGHT GROUP	\N	2026-02-09 15:30:05.298+03	active
bf9c113b-c0b1-4f36-ab33-64d862714bd9	KIWANUKA	\N	2026-02-09 15:30:09.572+03	active
154bb5f5-b4b8-495c-a674-5309403c9f99	KAPOMPO GROUP	\N	2026-02-09 15:30:11.406+03	active
14b9f030-7e64-4c4e-bbe5-e62afc5fb75d	ROBERT	\N	2026-02-09 15:30:15.714+03	active
ee1c0de6-b94a-4194-b10e-276f5aba3cfb	BRUCE GROUP	\N	2026-02-09 15:30:16.936+03	active
1e50fded-9e59-4b2b-81b8-c1c5dcb5218b	KWAGALA	\N	2026-02-09 15:30:20.02+03	active
7713df8d-0dd0-4287-ae93-ce44c370ed48	BENSON	\N	2026-02-09 15:30:21.227+03	active
cd9ec41e-e172-4c25-a610-0e4f24dae739	HAJALA	\N	2026-02-09 15:30:24.27+03	active
b2d0d1a2-0cf5-4560-a712-efb30cc5f5e0	MORGAN	\N	2026-02-09 15:30:26.104+03	active
8e1e3988-cc33-489f-9281-619768da5c9f	SIMON	\N	2026-02-09 15:30:28.594+03	active
4e992323-c883-4096-81d6-14d44b847dd0	NAKIWALA GROUP	\N	2026-02-09 15:30:31.73+03	active
24dee5de-8b9a-4adc-8d62-164637640ade	MUKIIBI GROUP	\N	2026-02-09 15:30:36.607+03	active
9e9209b1-3ccf-40d6-882a-57dbff88623d	KAMOGA	\N	2026-02-09 15:30:39.66+03	active
117b3b12-f668-4025-8b46-c35f82f016ff	HARRIET GROUP	\N	2026-02-09 15:30:46.449+03	active
1218fac8-9ee7-4526-8d7e-e9938eb8c64d	BOBIWINE	\N	2026-02-09 15:30:50.703+03	active
614c86c9-588f-46e8-9e16-85d10eb41f14	ALLAN	\N	2026-02-09 15:30:51.904+03	active
04dd5726-ad7c-439b-a3da-7ce549727c4c	AISHA	\N	2026-02-09 15:30:53.782+03	active
4259a83d-7260-4a55-b3de-d05cd914db40	EMMA	\N	2026-02-09 15:31:06.205+03	active
471782b5-3337-45f2-812e-bb1fa1e589ea	WILBER	\N	2026-02-09 15:31:13.529+03	active
4ccdf462-a8c2-4c25-a178-d433511bd936	EDEN	\N	2026-02-09 15:31:17.552+03	active
5e954c5c-71fb-4881-be3f-7db2f118d6b5	GEORGE	\N	2026-02-09 15:31:26.112+03	active
ceacef27-27e8-499d-acb2-3f2da47b7c07	MUSISI	\N	2026-02-09 15:31:29.887+03	active
1ed9273d-a38c-4024-9e95-302a618127d0	UNITY	\N	2026-02-09 15:31:33.667+03	active
03e891d5-a7aa-4cdb-b8b7-924977d827cd	GODFREY	\N	2026-02-09 15:31:34.899+03	active
993fd964-ec77-422d-af5b-fc28b21a7080	UMAR	\N	2026-02-09 15:31:41.148+03	active
d143326b-76e6-42ab-a8fa-9e4c471949d0	ADAM	\N	2026-02-09 15:31:49.591+03	active
a6cdb14e-5e38-4ee6-afa8-b1575154c136	ZAAKE	\N	2026-02-09 15:31:52.744+03	active
1b2c3c7a-b249-49cd-a364-a02e83e15a55	NANTEZA	\N	2026-02-09 15:32:00.044+03	active
e8758606-77ae-4657-a77f-a0442f0f2bf4	ERICK	\N	2026-02-09 15:32:04.796+03	active
d7a05a70-b69d-4295-bfdb-94234c6bee25	HAM	\N	2026-02-09 15:32:08.406+03	active
8c06799b-85ee-4dd2-abee-005db62f8fa0	NYANZI	\N	2026-02-09 15:32:12.045+03	active
6349d69f-f2c3-46eb-9b43-c38417e7d037	HANIFA	\N	2026-02-09 15:32:25.697+03	active
96266550-e755-4ded-be8f-9492f8682ca1	NAKKAZI	\N	2026-02-09 15:32:29.55+03	active
54e0cb59-5146-41ba-a3fd-cdd0fe08f728	MADINAH	\N	2026-02-09 15:32:32.711+03	active
dc38e270-793e-4df8-a329-693df312f86c	MIIRO	\N	2026-02-09 15:32:33.97+03	active
54d83bfa-8ff0-4619-9b06-1f097bcf5052	MAYANJA	\N	2026-02-09 15:32:35.222+03	active
f6691e1d-412a-4af5-8236-1d34b8cfe3ac	SULAIT	\N	2026-02-09 15:32:44.278+03	active
aaa8897d-23c1-445f-8b15-3a2219b4659a	MOSES	\N	2026-02-09 15:32:54.227+03	active
89d76d9c-f08d-4ff5-873a-c0643e55899b	TWESIGYE	\N	2026-02-09 15:32:55.449+03	active
d0175b77-b2e0-489e-b802-e86b3ebb375e	HONEST	\N	2026-02-09 15:33:00.116+03	active
460b662b-78c8-42d2-ab74-d27236d4fda0	SEETA	\N	2026-02-09 15:33:05.68+03	active
d6bea06b-2b57-44fe-b4ab-5f6030f35d66	MUTESI	\N	2026-02-09 15:33:09.288+03	active
fb0d7217-759c-4335-8802-5dd3d5885aa7	NAMAGEMBE	\N	2026-02-09 15:33:51.175+03	active
7f760486-b3bc-4544-b2c0-946d68053f2b	HAPPY	\N	2026-02-09 15:33:54.873+03	active
93886694-9dcc-4bc9-b428-377c1ef8208c	YESU AMALA	\N	2026-02-09 15:33:56.112+03	active
70ac37d6-5a19-4913-bb91-2ed3dbaa3059	GIFT	\N	2026-02-09 15:33:57.976+03	active
3c7d6a8c-8c79-41f6-b3dd-c6698e4977f9	AMINAH	\N	2026-02-09 15:34:01.07+03	active
8d9406d8-7ab3-4814-8010-b093ff095667	MEDI	\N	2026-02-09 15:34:07.844+03	active
c7cc325e-f267-4407-9678-d474ef57e33e	SKY LIGHT	\N	2026-02-09 15:34:11.013+03	active
583e4b91-3578-471f-b42a-f4257ef83c12	KYAZIKE	\N	2026-02-09 15:34:13.059+03	active
f814de04-057d-4e2c-a82f-3acd755585f2	PETER	\N	2026-02-09 15:34:14.53+03	active
150dc1e4-16f6-4023-8004-2b6371d7c7a8	OLIVIA	\N	2026-02-09 15:34:21.097+03	active
7883fe1f-d490-4089-97ab-69e93c766123	ATUHIRE	\N	2026-02-09 15:34:32.033+03	active
9b4ed501-4b0b-4d8d-88bd-008b2ac021d3	NAMARA	\N	2026-02-09 15:34:36.441+03	active
fcc049b7-0fb9-41fd-afc4-0384a965e8a1	BABRA	\N	2026-02-09 15:34:41.784+03	active
ec1c1149-0157-45fb-98c0-a70bcd77b299	ROSE	\N	2026-02-09 15:34:43.645+03	active
786e1880-1cec-40a0-b169-7cb809b3da30	KIJABIJO	\N	2026-02-09 15:34:48.024+03	active
7c278ac5-160e-4d7c-90be-219f58e7fd3c	FRANCIS	\N	2026-02-09 15:34:51.548+03	active
7ecd933b-8847-44d5-a100-6a3c4c5d66d6	TADEO	\N	2026-02-09 15:34:54.774+03	active
962113b8-5235-48bf-ad60-ac55eaa9247b	SEKA	\N	2026-02-09 15:34:56.682+03	active
9b9ce642-a628-43f1-952d-d1fb5a66f49c	LUBWAMA	\N	2026-02-09 15:34:59.188+03	active
b22cd19d-05b1-4c2e-9008-11b1079b7792	ANNET	\N	2026-02-09 15:35:02.332+03	active
8d2dcc96-7a27-46ab-be56-7e80e17291d4	RUTH	\N	2026-02-09 15:35:07.3+03	active
8d2800a9-7660-444a-b873-a63b574b1f3f	NELIMA	\N	2026-02-09 15:35:08.555+03	active
a43b54fd-74c0-44af-a25e-6f92ed751379	LUTAAYA	\N	2026-02-09 15:35:13.004+03	active
6684615c-0622-4959-996c-c25abbbcb433	DIANAH	\N	2026-02-09 15:35:16.093+03	active
b67834e6-01af-4e73-8c18-c31038861fa3	SARAH	\N	2026-02-09 15:35:18.434+03	active
78f8afb3-a791-4996-8849-98b95d1c2b52	JANE	\N	2026-02-09 15:35:22.644+03	active
c3c99ba2-dd9f-4af6-a9a6-9fcd8b41e417	DIVINE	\N	2026-02-09 15:35:27.99+03	active
bfcb69cc-175c-4c04-b5ad-8597a848f072	MERCY	\N	2026-02-09 15:35:32.471+03	active
226ee447-910e-4171-ab0a-8d0f4c9bfc85	GOLDEN	\N	2026-02-09 15:35:39.991+03	active
a6d5a9b8-67d0-44a7-afd0-a6d43539c9e4	KIBALAMA 2	\N	2026-02-09 15:35:43.657+03	active
79400096-0357-42b9-8a89-5f9e89e0c07b	KIBALAMA	\N	2026-02-09 15:35:45.571+03	active
1774280d-a837-48dc-9e77-1be3859fe05f	KAYEBE	\N	2026-02-09 15:35:48.67+03	active
df43f95b-3b92-4119-a442-df8f1dfaf29a	NAKA	\N	2026-02-09 15:35:52.452+03	active
962e8fcf-7d9b-4a8c-8edd-20925a3ef920	SAUDAH	\N	2026-02-09 15:35:56.72+03	active
dbc13a30-eac7-4136-8cda-9d0cfea2f7d9	SHAKIRAH	\N	2026-02-09 15:36:01.227+03	active
ea3301bb-295f-406b-b7c6-558c952fb556	Micheal Group	\N	2025-12-11 12:53:36.41654+03	active
9bb837d2-d5ed-441b-b2fe-3a2eb8376dd1	NAKIWALA	\N	2026-02-10 14:07:48.649944+03	active
fdd1844c-d3cd-48df-9df9-1927ad316493	Shammah Group	\N	2025-12-09 17:26:32.433152+03	active
5b16a75f-7136-43e4-8368-19c4ffc3b753	CHRISTINE	\N	2026-02-09 15:28:49.366+03	active
d7f1c447-96f0-4e31-a03b-d6a5eb1a367f	FRED GROUP	\N	2026-02-09 15:29:52.419+03	active
c492f6a1-91f5-4b02-862a-f06e177afdd0	MADINAH 2	\N	2026-02-09 15:30:59.889+03	active
c00cf54c-75c1-495a-9b4f-d6b83ed4f22a	NDAGIRE	\N	2026-02-09 15:32:38.072+03	active
94f186b1-e78f-4a0c-8b17-342e5a2218cf	GOOD LIFE	\N	2026-02-09 15:34:17.684+03	active
3807d346-05fa-41cd-a8cc-33e059c096e2	JOLLY	\N	2026-02-09 15:35:37.352+03	active
6c0032ce-bd58-4d76-a26f-af7325a2c946	SUCCESS	\N	2026-02-09 15:36:07.518+03	active
cdeef46f-8f14-4263-a2df-7ca100aa2434	MAGEZI	\N	2026-02-09 15:36:12.567+03	active
c07dbc23-224f-4cd5-9a45-cfe5b84f018c	KISAKYE	\N	2026-02-09 15:36:21.807+03	active
6aafb38d-3639-4df4-b1b1-6ee086bba70e	PEACE	\N	2026-02-09 15:36:26.054+03	active
c7453e20-6e49-4e9b-8447-91116b3c5b1d	MUGUME	\N	2026-02-09 15:36:46.109+03	active
a263fb3e-db28-4e0c-8c33-cb365495b423	CLAINE	\N	2026-02-09 15:37:26.147+03	active
14f96b5f-f9f9-4aa5-866b-0a1cc6936d41	MARGRET	\N	2026-02-09 15:37:31.336+03	active
d515d3e7-827e-49d3-b97b-39b08ab2d1a8	HOPE	\N	2026-02-09 15:37:42.299+03	active
cf7ec8b0-176a-4fcc-af08-ec25e85404e7	MUKAMA AFAAYO	\N	2026-02-09 15:37:47.014+03	active
fa97c25b-20f1-4bc1-b4ac-a7a7473963b5	RISING STARS	\N	2026-02-09 15:37:50.39+03	active
84615f18-ba5e-4bc3-b5ee-544e9a03a676	Immaculate	\N	2026-02-09 16:53:11.850033+03	active
d8bbb301-171f-4d64-a635-1563827af1e9	Kazinga	\N	2026-02-09 16:53:18.715164+03	active
9e6c9c40-ed6f-49cd-885f-fb153f2bcb69	Adrian	\N	2026-02-09 16:53:20.972527+03	active
e321c9a3-5dd9-4f99-a09d-f1c355522fa3	joan GROUP	\N	2026-02-09 16:53:23.84247+03	active
02818b91-6d3e-4fc4-b3c9-e17f09a12824	Wasswa	\N	2026-02-09 16:53:27.962291+03	active
526b03d1-22e7-4de2-aea6-87516eecf7ea	FRED group	\N	2026-02-09 16:53:30.160433+03	active
ed60dc3b-9f30-4e83-a5ae-e7e086aa080e	Ibrah group	\N	2026-02-09 16:53:31.709958+03	active
eb43c1fd-60a6-4166-bb87-aa6673ee7e1d	Bright group	\N	2026-02-09 16:53:35.334572+03	active
f916ff71-651e-41e2-bce5-9c0112b1829e	Kapompo group	\N	2026-02-09 16:53:37.048065+03	active
384c65fc-2bf4-4d7f-a7b9-68d7f3868c83	Bruce group	\N	2026-02-09 16:53:38.636069+03	active
6a1cbfd1-6ab4-4a93-b25f-fb1c3c7679fc	kwagala	\N	2026-02-09 16:53:39.566494+03	active
9931d751-67e1-457a-a8a5-0f27cf94c726	Nakiwala group	\N	2026-02-09 16:53:43.045564+03	active
5a3a1fc8-b182-4710-a9d8-d0da1f54de4f	Mukiibi group	\N	2026-02-09 16:53:43.99907+03	active
44ad7d7f-5349-46c5-b293-7ea2d4062695	Harriet Group	\N	2026-02-09 16:53:45.598442+03	active
2d276777-4295-41dd-afad-fa767276164f	Honest	\N	2026-02-09 16:54:04.212244+03	active
9f6e1f55-1124-437b-8a37-cfcf565db15e	Hope	\N	2026-02-09 16:54:34.797595+03	active
8c0a3391-db2a-47b2-a8b7-f33c216aeb44	Mukama Afaayo	\N	2026-02-09 16:54:35.741876+03	active
24f6b72e-e0a2-494c-a158-a764d1e258a3	Rising stars	\N	2026-02-09 16:54:36.751455+03	active
f15a837e-c7b8-446e-bd16-7225b62b8659	SHAMMAH 	\N	2026-02-10 14:01:48.215351+03	active
2fe31b3a-23be-4051-9a5f-82567e6fbfc3	HARRIET	\N	2026-02-10 14:02:02.410145+03	active
5c23480b-9eff-4108-ac73-e1e196f0b84d	JOAN	\N	2026-02-10 14:02:23.147076+03	active
f3985309-fe8f-4674-926b-335b08a54c44	IBRAH	\N	2026-02-10 14:02:36.121672+03	active
3923b931-840e-465e-bd90-3778a36834c7	FRED	\N	2026-02-10 14:03:40.208231+03	active
ea35fe5d-3bb7-43bc-8842-430bb025b3a2	FRED	\N	2026-02-10 14:03:41.79778+03	active
34920e53-bf88-48ee-bd4e-5a8ea6b0cc71	BRIGHT	\N	2026-02-10 14:03:43.396388+03	active
b5101c7b-01b3-4649-a4e2-c35b7c7b6d4b	BRIGHT	\N	2026-02-10 14:03:44.316969+03	active
ac20b8ec-ab08-4418-b7ca-0e5b3c5e2822	MUKIIBI	\N	2026-02-10 14:03:50.336624+03	active
21a924a8-e981-418b-9233-39daacec768d	MUKIIBI	\N	2026-02-10 14:03:50.876949+03	active
1cf599f5-8a05-4d63-b381-73fc83225367	BRUCE	\N	2026-02-10 14:04:48.625924+03	active
94a61e74-2804-4bee-9e9f-bb2dc657a4fd	BRUCE	\N	2026-02-10 14:05:05.528287+03	active
bb4642a0-dcd2-4600-8c3a-0007196a0d27	KAPOMPO	\N	2026-02-10 14:05:35.505933+03	active
8c33ce08-64f7-4a30-a9f0-47c9e1e7a799	NAKIWALA	\N	2026-02-10 14:05:51.493437+03	active
3d6f771b-351a-4069-94ba-bfa898610c02	KAPOMPO	\N	2026-02-10 14:05:57.237053+03	active
210c9d64-4cf2-49af-9f04-ae26e54001e7	NAKIWALA	\N	2026-02-10 14:06:18.590193+03	active
6485d2bf-c56d-4f86-b82f-a00b7a62233f	KAPOMPO	\N	2026-02-10 14:07:11.1687+03	active
\.


--
-- Data for Name: interest_rate_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.interest_rate_settings (id, product_id, rate_type, base_rate, margin, effective_from, effective_to, notes, created_at) FROM stdin;
\.


--
-- Data for Name: loan_applications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.loan_applications (id, user_id, full_name, email, phone_number, id_number, date_of_birth, address, loan_product, loan_amount, loan_duration_months, loan_purpose, employment_status, employer_name, monthly_income, status, assigned_officer_id, rejection_reason, created_at, updated_at, reviewed_at, approved_at, group_members, amount_paid, loan_category, district, division, county, sub_county, parish, village, business_location, guarantors, witness_details, security_type, security_value, attachment_national_id, attachment_lc1_letter, attachment_recommendation_letter, attachment_passport_photo, attachment_income_statement, attachment_uploaded_at, group_name, group_id, insurance_status) FROM stdin;
e4360789-ef95-4672-9a78-e1590d3ab7eb	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mrs.  NAMUGERWA GLORIA	mrsnamugerwagloria_1771147615156@mt.com	0754121619	CF0601210GH26H	2006-07-07	Nangabo	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:26:55.156+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:26:55.156+03	[]	82000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
30cc452f-d403-42f5-8b9a-b7515b73dc26	5a218cd8-8534-4318-9dec-f25dff525f79	Kapere Sam	cm83963105jfld@client.mtmicrofinance.ug	0000000000	CM83963105JFLD	2002-12-18	No Address	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-27 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-09-27 12:00:00+03	[]	287000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	7a77aa13-5676-4a96-831f-fd4679598333	Not Insured
68b77fa0-7667-42c2-af21-58572f0a67fb	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  KIJALI JOVAN	mrkijalijovan_1771147660289@mt.com	0759627909	CM97017102FUJE	1990-01-01	GAYAZA B, KYADONDO WAKISO DISTRICT	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.289+03	2026-02-15 12:43:49.33742+03	\N	2026-02-15 12:27:40.289+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
4706811d-6fe8-4343-913b-98b5378b5536	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  Muhereza Francis	mrmuherezafrancis_1771147660291@mt.com	0708663852	CM940321072MCK	1990-01-01	Gayaza	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.291+03	2026-02-15 12:43:49.33742+03	\N	2026-02-15 12:27:40.291+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
71d71c23-ac33-4880-8f68-9b64e421de20	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mrs.  NAKYANZI ANNET	mrsnakyanziannet_1771147660291@mt.com	0700683877	CF9002310998UP	1990-01-06	NANGABO	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.291+03	2026-02-15 12:43:49.33742+03	\N	2026-02-15 12:27:40.291+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
4ad1f72c-c5a6-4f5d-beb9-ad0277fc04f2	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mrs.  NANSAZI NAOME	mrsnansazinaome_1771147660292@mt.com	0759431663	CF88023104PKCH	1990-01-01	BULAMU, KASANGATI	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.292+03	2026-02-15 12:43:49.33742+03	\N	2026-02-15 12:27:40.292+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
63fdf744-b03b-4397-9f23-019c51128b0e	a9c3e1ee-7c5c-4289-b123-575d8bec610f	NALWOGA HALIMA	nalwogahalima_1771147660294@mt.com	0740173928	CF0005210T90JF	2000-01-01	KASANGATI, NANGABO WAKISO DISTRICT	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.294+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:27:40.294+03	[]	10000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
32d78998-3be7-483a-a811-65f717462932	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  TUMWESIGYE GASHOM	mrtumwesigyegashom_1771147660296@mt.com	0754039331	CM800371014X8C	1980-08-12	NAKWERO	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.296+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:27:40.296+03	[]	506000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
81173d66-0596-4228-9963-df61d14d096a	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mrs.  NIGHT HANIFAH	mrsnighthanifah_1771147660297@mt.com	0702488433	CF75047106UAAL	1990-01-01	MANYANGWA	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.297+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:27:40.297+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
a452472c-d392-4480-a7e4-b71747fd1ac2	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  TUSABE HAMZA	mrtusabehamza_1771147660297@mt.com	0708841468	CM000251087HQH	2000-12-06	NAKWERO	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.297+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:27:40.297+03	[]	615000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
e4108d76-c15f-45e6-8ff3-a8cb61014f66	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  BUGEMBE RICHARD	mrbugemberichard_1771147660298@mt.com	0704243406	CM89052106RJID	1990-01-01	KASANGATI	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.298+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:27:40.298+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
45767641-983b-480a-8a1d-0cb6d2615175	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  KIWADUKA MOSES	mrkiwadukamoses_1771147660299@mt.com	0708387597	CM93032108EC7L	1993-02-06	GAYAZA, KASANGATI WAKISO DISTRICT	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.299+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:27:40.299+03	[]	691000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
51ca084c-b984-488d-af70-6b08b835bcfc	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mrs.  NABAGESERA ROBINAH	mrsnabageserarobinah_1771147660301@mt.com	0706760050	CF9301210342KD	1993-05-07	MANYANGULA,GAYAZA WAKISO DISTRICT	Individual Loan	400000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.301+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:27:40.301+03	[]	543000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
4456a8ae-cf1b-4938-a86d-5407c3980e37	a8d7e41b-dd4a-4879-8968-180f86d1f43e	Mr.  KALIRO ABBEY	cm80494104tehf@client.mtmicrofinance.ug	+256756426170	CM80494104TEHF	1900-01-01	Nangabo	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:37:41.3673+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:37:41.3673+03	[]	910000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c51d4850-a604-47f2-85a4-621db6f6aa76	Not Insured
e27b785e-e9ff-427e-b11b-16be1645e1f5	9cc5c271-1552-4c24-978d-5897036932de	Mr.  LUWAGA MUSA	cm74032104tp3h@client.mtmicrofinance.ug	+256703433281	CM74032104TP3H	1900-01-01	Nangabo	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:37:45.217126+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:37:45.217126+03	[]	910000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c51d4850-a604-47f2-85a4-621db6f6aa76	Not Insured
867a3f41-b92c-4138-896d-d6cee2d9553e	a9c3e1ee-7c5c-4289-b123-575d8bec610f	NAKAZI MALIAM	nakazimaliam_1771147660293@mt.com	0740173928	CF9205210J0WUL	1992-07-07	KASANGATI, NANGABO WAKISO DISTRICT	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.293+03	2026-02-15 12:43:49.33742+03	\N	2026-02-15 12:27:40.293+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
767410dd-e4f0-4911-b271-43df0f8e91c5	a9c3e1ee-7c5c-4289-b123-575d8bec610f	NAMUTEBI SHAKIRAH	namutebishakirah_1771147660294@mt.com	0740173928	CF91105101095L	1990-01-01	KASANGATI, NANGABO WAKISO DISTRICT	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.294+03	2026-02-15 12:43:49.33742+03	\N	2026-02-15 12:27:40.294+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
dd8b6219-044d-4733-a239-556051f805fe	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mrs.  NAKAFEERO VIOLA	mrsnakafeeroviola_1771147660295@mt.com	0700723308	CF9301210342KD	1996-01-01	KAZINGA, WAKISO	Individual Loan	400000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.295+03	2026-02-15 12:43:49.33742+03	\N	2026-02-15 12:27:40.295+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
2a3646c6-ca9d-47c8-812a-b18de85ad02b	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  Ssentuyo Yusuf	ssentuyoyusuf_1771147945193@mt.com	0748137237	CM940231090R2J	1994-06-09	Wampewo	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.193+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.193+03	[]	569000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
8a8771cf-5778-439b-81fc-3eac062c00d7	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  BOGERE JULIUS	bogerejulius_1771147945273@mt.com	0709614766	CM92032107XR6A	1990-01-01	KASANGATI, NANGABO WAKISO DISTRICT	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.273+03	2026-02-15 12:43:49.33742+03	\N	2026-02-15 12:32:25.273+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
8c50308d-899a-4cff-846d-6d17c221c7af	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  MUGANGA LAWRENCE	mugangalawrence_1771147945278@mt.com	0754689223	CM96023105093D	1996-02-08	GAYAZA, NANGABO WAKISO DISTRICT	Individual Loan	1000000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.278+03	2026-02-15 12:43:49.33742+03	\N	2026-02-15 12:32:25.278+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
9e4ac53c-b417-4ced-9420-76fe7aac14e5	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mrs.  NABIRYE SYLVIA	nabiryesylvia_1771147945304@mt.com	0000000000	CF88007103P4FA	1988-04-05	KAZINGA	Individual Loan	200000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.304+03	2026-02-15 12:43:49.33742+03	\N	2026-02-15 12:32:25.304+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
b06be0f3-8758-4cfc-8b9f-25d18d15ee90	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  SSENDUSU JOHN	ssendusujohn_1771147945307@mt.com	07056595695	CM940321072MCK	1994-09-09	Nangabo	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.307+03	2026-02-15 12:43:49.33742+03	\N	2026-02-15 12:32:25.307+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
ca99ce5c-1cb6-41ec-84ed-c4c89b95e086	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  KYAMBADDE THOMAS	kyambaddethomas_1771147945308@mt.com	0759555953	CM86030011046ZCK	1986-10-07	Nangabo	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.308+03	2026-02-15 12:43:49.33742+03	\N	2026-02-15 12:32:25.308+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
4ac9ecad-79f6-402b-a5a7-9f4f8856773d	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  BAGAMBANE ERIA	bagambaneeria_1771147945310@mt.com	0750046881	CM9605210J1VNC	1990-01-01	Nangabo	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.31+03	2026-02-15 12:43:49.33742+03	\N	2026-02-15 12:32:25.31+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
d8bc763a-69a6-4b8b-8432-c760db1996be	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  LUGOLOBI GEORGE	lugolobigeorge_1771147945311@mt.com	0707727666	CM9905210T2VXG	1990-01-01	Nangabo	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.311+03	2026-02-15 12:43:49.33742+03	\N	2026-02-15 12:32:25.311+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
4d6153c5-3149-4529-85b0-1d9d2f804a82	a9c3e1ee-7c5c-4289-b123-575d8bec610f	SSEBAGUDE ROBERT	ssebaguderobert_1771147945313@mt.com	0709883751	CM0005210T35ZF	1990-01-01	Nangabo	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.313+03	2026-02-15 12:43:49.33742+03	\N	2026-02-15 12:32:25.313+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
745cc3ec-2be6-4189-88cf-2a89a78fe497	a9c3e1ee-7c5c-4289-b123-575d8bec610f	MUSISI PHILLIP	musisiphillip_1771147945316@mt.com	0707213827	CM91052105JPQJ	1991-11-10	Nangabo	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.316+03	2026-02-15 12:43:49.33742+03	\N	2026-02-15 12:32:25.316+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
e624a266-a5d9-4502-b14e-af210e96e459	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  WASSWA FRANK	wasswafrank_1771147945320@mt.com	0702905586	CM91052107YPNG	1981-12-12	KIJABIJO C	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.32+03	2026-02-15 12:43:49.33742+03	\N	2026-02-15 12:32:25.32+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
9650f48b-73b4-4330-a0f5-1f09b5fd22fc	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  TUMURAMYE BENSON	tumuramyebenson_1771147945324@mt.com	0755720401	CM91046101QEMK	1991-03-03	KAZINGA	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.324+03	2026-02-15 12:43:49.33742+03	\N	2026-02-15 12:32:25.324+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
78805f56-87e0-4773-9c44-ba358d995da3	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  SENYONDO DEO	senyondodeo_1771147945335@mt.com	0757947598	CM86023109KQ0G	1986-01-06	GAYAZA, NANGABO WAKISO DISTRICT	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.335+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.335+03	[]	665000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
8953333a-26b1-41b9-bc56-d60444ff97a0	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  ISOOBA EMMANUEL	isoobaemmanuel_1771147945336@mt.com	0752634444	CM98008105L3NH	1990-01-01	GAYAZA, KASANGATI WAKISO DISTRICT	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.336+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.336+03	[]	665000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
75dafe12-d24c-4347-b244-5112e6b9baba	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Nakyeyune Harriet	nakyeyuneharriet_1771147945339@mt.com	0704877756	CF90036101LMHJ	1990-01-01	N/A	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.339+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.339+03	[]	1082000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
d9cc4a16-f66a-44d6-8fb1-30e4e696fdab	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  SEKIZIYIVU IBRAHIM	sekiziyivuibrahim_1771147945337@mt.com	0751500820	CM79023104JCEC	1990-01-01	GAYAZA B, KYADONDO WAKISO DISTRICT	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.337+03	2026-02-15 12:43:49.33742+03	\N	2026-02-15 12:32:25.337+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
da2ccc8a-0a99-4e22-9fcb-590395be6fc4	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  MAWEJJE MICHAEL	mrmawejjemichael_1771147660258@mt.com	0753378593	CM0403210Q6NLK	1990-01-01	Nangabo	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.258+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:27:40.258+03	[]	82000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
c112650f-6697-4563-9279-ac544e63cdfa	a9c3e1ee-7c5c-4289-b123-575d8bec610f	SSERUNJOGI STEVEN	sserunjogisteven_1771147660264@mt.com	0743835240	CM7105210964RA	1971-05-08	Nangabo	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.264+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:27:40.264+03	[]	82000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
36b17319-079b-4b89-a61c-eb938120f803	a9c3e1ee-7c5c-4289-b123-575d8bec610f	MUGAYA ISMA	mugayaisma_1771147660266@mt.com	0752122248	CM83923104JFLD	1983-09-09	GAYAZA	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.266+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:27:40.266+03	[]	222000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
20b00229-b755-4c89-a4db-c32850b60945	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mrs.  LUBEGA GRACE	mrslubegagrace_1771147660267@mt.com	0700683877	CF73035102A25L	1973-07-01	GAYAZA, KASANGATI WAKISO DISTRICT	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.267+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:27:40.267+03	[]	432000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
9fbf01ab-4047-4932-acf4-ea3a6fa27818	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  MBONYE VIAN	mrmbonyevian_1771147660269@mt.com	0753378593	CF740181051442	1990-01-01	Nangabo	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.269+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:27:40.269+03	[]	554000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
f4ac623a-a95f-44aa-aa55-44b1b60d8076	a9c3e1ee-7c5c-4289-b123-575d8bec610f	NSUBUGA MUZAFARU	nsubugamuzafaru_1771147660271@mt.com	0706991881	CM850521O9VPGK	1990-01-01	Gayaza, Kasangati	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.271+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:27:40.271+03	[]	200000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
2dc0cdc3-1a9a-4731-9fe6-e9dc781a0db2	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  Nasasira Alex 2(Ibrah)	mrnasasiraalex2ibrah_1771147660272@mt.com	0709549257	CM9005210DLV4F	1990-01-01	Kabanyoro	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.272+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:27:40.272+03	[]	290000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
37589655-5550-41e9-a719-b6a268487748	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mrs.  Babirye Jane	mrsbabiryejane_1771147660273@mt.com	0743835776	CF89007102J35C	1990-01-01	Magigye	Individual Loan	400000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.273+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:27:40.273+03	[]	360000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
b44c984f-69c5-4f60-9666-1bfa270a3345	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mrs.  Nantongo irene	mrsnantongoirene_1771147660274@mt.com	0740768757	CF870231018CCL	1990-01-01	Kyetume B	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.274+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:27:40.274+03	[]	410000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
6f633387-4549-44b9-a46a-661620a010c8	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  BALIKUDDEMBE JOSEPH	mrbalikuddembejoseph_1771147660275@mt.com	0754039331	CM95002104ANIL	1990-01-01	KASANGATI	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.275+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:27:40.275+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
222ebbf8-ac9d-48ba-8603-81f44301fc6c	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr. BUGEMBE RICHARD	mrbugemberichard_1771147660278@mt.com	0704243406	CM89052106RJID	1990-01-01	KASANGATI	Individual Loan	700000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.278+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:27:40.278+03	[]	228000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
a57b8a13-8a5a-4b02-91a6-5efdae86d510	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  NDAWULA ALI	mrndawulaali_1771147660279@mt.com	0752122248	CM83023104JFLD	1983-09-09	GAYAZA	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.279+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:27:40.279+03	[]	510000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
51f89eb8-3760-4d40-afda-26fe3d81ab06	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  KALUNGI SHAFIK	mrkalungishafik_1771147660280@mt.com	0703764870	CM9018210APOLE	1991-02-02	KASANGATI	Individual Loan	700000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.28+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:27:40.28+03	[]	748000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
633d829f-0338-4e9a-9716-270d6c45f843	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  KIRUMIRA ADAM	mrkirumiraadam_1771147660280@mt.com	0705106435	CM9905210RQE9K	1990-01-01	KASANGATI, NANGABO WAKISO DISTRICT	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.28+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:27:40.28+03	[]	480000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
7bed9a6c-48ae-4728-850e-81bdff9dbca5	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  TENDO INNOCENT	mrtendoinnocent_1771147660281@mt.com	0757880909	CM0303610FK4VG	1990-01-01	KASANGATI, NANGABO WAKISO DISTRICT	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.281+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:27:40.281+03	[]	123000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
0309e9d8-61f8-41ed-9ca2-97dd15530e88	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mrs.  NANTEZA PROSSY	mrsnantezaprossy_1771147660282@mt.com	0755011051	CM900121040Q0D	1990-01-01	KASANGATI, NANGABO WAKISO DISTRICT	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.282+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:27:40.282+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
724eee73-a2a4-4fce-a8f5-3413e1cd038a	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  SEBINA PAUL	mrsebinapaul_1771147660283@mt.com	0772753695	CM91023107C9UH	1990-01-01	KASANGATI, NANGABO WAKISO DISTRICT	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.283+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:27:40.283+03	[]	680000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
e6f92999-a13e-4dd6-b307-46b89ba00540	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  SEGANE DENIS	mrseganedenis_1771147660283@mt.com	0772753695	CM93032104TACL	1990-01-01	KASANGATI, NANGABO WAKISO DISTRICT	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.283+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:27:40.283+03	[]	630000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
a8b35042-b494-43e7-8c41-9f0d54a861df	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  WASSAKA WILSON	mrwassakawilson_1771147660284@mt.com	0772753695	CM75052107777A	1990-01-01	KASANGATI, NANGABO WAKISO DISTRICT	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.284+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:27:40.284+03	[]	647000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
d20d58c5-b369-4afe-b378-2a5f17f6d04d	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  WAMALA GODFREY	mrwamalagodfrey_1771147660285@mt.com	0772753695	CM70032104UF5G	1970-03-04	KASANGATI, NANGABO WAKISO DISTRICT	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.285+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:27:40.285+03	[]	665000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
6b4da2e3-e3cc-40fb-bea7-b1b2b41b2c16	a9c3e1ee-7c5c-4289-b123-575d8bec610f	NAKALANZI OLIVIA	nakalanziolivia_1771147660286@mt.com	0000000000	CM9605210GL93K	1990-01-01	KASANGATI	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.286+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:27:40.286+03	[]	681000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
fedf5a45-e5e0-4842-8a5a-26d0f4493d87	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  NTALE SULAIT	mrntalesulait_1771147660288@mt.com	0707683511	CM9608210JNXTF	1996-04-04	KASANGATI	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.288+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:27:40.288+03	[]	165000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
b7be506a-d022-4153-a037-71d82b10435d	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  OJUKA TONNY	mrojukatonny_1771147660288@mt.com	0743508639	CM89022101UPMH	1989-12-12	KASANGATI	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.288+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:27:40.288+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
0b379f4b-b2bc-4f84-8a8a-df8f82240742	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mrs.  MADINAH NAKALEMA	mrsmadinahnakalema_1771147660290@mt.com	0741354448	CF9100104PQVF	1990-01-01	KASANGATI	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:27:40.29+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:27:40.29+03	[]	633000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
353c5094-73d1-4a37-8942-6a960de01227	16fbb71e-32dc-4d1b-8610-07ab5997e3fd	Mrs.  NAISANGA JOAN	cf96013100tmof@client.mtmicrofinance.ug	+256756064927	CF96013100TMOF	1900-01-01	KASANGATI	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:37:10.672881+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:37:10.672881+03	[]	910000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	5b16a75f-7136-43e4-8368-19c4ffc3b753	Not Insured
6da83992-dde1-42f0-8166-5fca5311f3ab	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  Seguya Julius	seguyajulius_1771147945245@mt.com	0748627577	CM85032101VUDF	1985-11-09	Wampewo	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.245+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.245+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
7cb809e1-8963-40c1-bab4-edc6628b3972	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  Mulinde Alex	mulindealex_1771147945249@mt.com	0700329478	CM950451042ZWL	1995-01-01	Wampewo	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.249+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.249+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
df120a4c-dabe-4d9f-bb45-55c7098657e2	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  Sebunya Brayn Kirumira	sebunyabraynkirumira_1771147945251@mt.com	0752050005	CM840521089CUE	1984-02-02	Bulamu	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.251+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.251+03	[]	82000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
66d421f4-014a-4397-a548-293d90a3a5eb	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  Nabagala Hope	nabagalahope_1771147945252@mt.com	0707291103	CF96052100YR4L	1990-01-01	Busonko	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.252+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.252+03	[]	82000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
d5be59cd-3439-4db5-a858-0b34dc4df71c	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  Nyesiga Ronald	nyesigaronald_1771147945253@mt.com	0757656369	CM95009109ALTJ	1995-05-01	Bulamu	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.253+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.253+03	[]	82000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
d6b9ce47-a0a7-4dac-a685-0e31e955ed27	a9c3e1ee-7c5c-4289-b123-575d8bec610f	NSUBUGA MUZAFARU	nsubugamuzafaru_1771147945255@mt.com	0706991881	CM850521O9VPGK	1990-01-01	Gayaza, Kasangati	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.255+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.255+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
f71b0d76-ea71-45c4-a6e7-8f59d58be7c6	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Kiyaga Rashid	kiyagarashid_1771147945256@mt.com	0706991869	CM96052108HZ8C	1990-01-01	Gayaza, Kasangati	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.256+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.256+03	[]	145000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
469dab49-b143-43a6-850f-90bc367ae68f	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  MASEREKA SWALIM	maserekaswalim_1771147945258@mt.com	0702488433	CM97015100TF8G	1997-06-07	Nangabo	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.258+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.258+03	[]	235000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
dadad6f5-08c1-4273-9658-08e869d10c1a	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  MUGULA ISMA	mugulaisma_1771147945259@mt.com	0701628176	CM88047104P2MH	1988-09-09	Namayina	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.259+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.259+03	[]	317000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
4ae9bfa4-89fd-4b0b-8d08-e5ea3b363c07	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  MULEMBE STUART	mulembestuart_1771147945262@mt.com	0745363481	CM970491064QHG	1990-01-01	Kasangati	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.262+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.262+03	[]	139500.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
bcda767f-a255-4b63-8427-307f11650f3d	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  ARINAITWE YORAM	arinaitweyoram_1771147945263@mt.com	0700368667	CM83027106MLJG	1983-10-04	KASANGATI, NANGABO WAKISO DISTRICT	Individual Loan	700000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.263+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.263+03	[]	250000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
37f8497c-5532-4856-983f-76d417d339c6	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  BIHANGANA VICENT	bihanganavicent_1771147945266@mt.com	0701130058	CM721011029MOJ	1972-05-04	Nangabo	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.266+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.266+03	[]	40000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
21827caa-2fbd-493c-b119-e295777c2cc8	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  Lumu Steven	lumusteven_1771147945268@mt.com	0705584223	CM85032104R7NA	1985-01-01	Nangabo	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.268+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.268+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
62332b8f-aa8f-4f92-9890-40b2bbd6b065	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  OGWANG JASPHER	ogwangjaspher_1771147945270@mt.com	0743472327	CM93001102FNTG	1993-02-05	GAYAZA, KASANGATI WAKISO DISTRICT	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.27+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.27+03	[]	139000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
cabc44e0-e1d3-4243-81ed-826119fa474f	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  KYAKABALE BENON	kyakabalebenon_1771147945271@mt.com	0701877594	CM7900910KARZK	1979-10-07	NAMAYINA, KABUBBU WAKISO	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.271+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.271+03	[]	105000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
67a28b5b-9590-41fc-ba26-af73d30994ce	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  MUKISA ROBERT	mukisarobert_1771147945273@mt.com	0744068200	CM860821062C9K	1986-01-06	GAYAZA, NANGABO WAKISO DISTRICT	Individual Loan	700000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.273+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.273+03	[]	114000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
da55881d-f791-4cb4-afff-7d1632607f61	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  KAMYA VICENT	kamyavicent_1771147945274@mt.com	0751774680	CM82017102NLME	1982-01-01	KASANGATI, NANGABO WAKISO DISTRICT	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.274+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.274+03	[]	320000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
1b6a91b1-8c5a-4973-8d28-ccf7a9612218	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  ABAASA BERNARD	abaasabernard_1771147945275@mt.com	0772753695	CM9802710J4CLE	1998-08-03	KASANGATI, NANGABO WAKISO DISTRICT	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.275+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.275+03	[]	320000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
abf63758-1b2f-45d7-b7ce-d85e65a61404	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  KASIBANTE YUDA	kasibanteyuda_1771147945276@mt.com	0740406706	CM8606910D7RXD	1986-02-01	KASANGATI, NANGABO WAKISO DISTRICT	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.276+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.276+03	[]	320000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
69c77a83-3c4f-4f0a-908d-5c3fc0b8e5d5	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Nakasi Teopista	nakasiteopista_1771147945279@mt.com	0707849420	CF54052101J3HA	1990-01-01	Nangabo	Individual Loan	600000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.279+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.279+03	[]	780000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
da55a0ad-2aec-4bb5-ad56-f0aa9fe73c06	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  KAYINGI ALEX	kayingialex_1771147945280@mt.com	0701820570	CM8903610CCLRL	1974-11-11	KASANGATI	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.28+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.28+03	[]	740000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
c158ae2c-dabc-428e-bf9c-1972fb6b6920	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  TAMALE RONALD	tamaleronald_1771147945281@mt.com	0743508639	CM9309810109VC	1990-01-01	KASANGATI	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.281+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.281+03	[]	30000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
c95fa482-71a3-48ed-8c2a-1c22a3edf063	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mrs.  SEMAKULA HADIJAH	semakulahadijah_1771147945282@mt.com	0701143206	CF890931009XPK	1989-05-01	KASANGATI	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.282+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.282+03	[]	405000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
0791685c-5824-4e82-a276-dd620c3babd3	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mrs.  NAJUKO JULIET	najukojuliet_1771147945283@mt.com	0758854127	CF8205210894JE	1990-01-01	KASANGATI	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.283+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.283+03	[]	226000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
327ae9f2-d622-4f88-8b48-4cc40914bb6b	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  SEMPEBWA CAPRIAM	sempebwacapriam_1771147945284@mt.com	0706159030	CM87052105L5TC	1987-12-11	GAYAZA	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.284+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.284+03	[]	296000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
cd888548-43f5-4d05-af86-6f74a94c5bd6	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mrs.  LWANGA AGNES	lwangaagnes_1771147945285@mt.com	0741781775	CF78032100XH6A	1990-01-01	GAYAZA	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.285+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.285+03	[]	459000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
853da5b1-460d-4196-8288-904d52ad1cf6	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  LUTALO BEN HAZARD	lutalobenhazard_1771147945300@mt.com	0759242419	CM9205210GK57C	1990-01-01	KASANGATI	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.3+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.3+03	[]	682000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
fd59e604-df8f-4796-825b-3cd75521b841	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  BYARUGABA DENNIS	byarugabadennis_1771147945301@mt.com	0754163519	CM82023107JKBD	1982-05-08	GAYAZA	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.301+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.301+03	[]	433000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
7f4493b4-682c-462f-bdc7-0365835dea40	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Lubega Josam	lubegajosam_1771147945302@mt.com	0752099263	CM01052102JPCD	1990-01-01	Nangabo	Individual Loan	400000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.302+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.302+03	[]	520000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
f91677e8-a0a9-4d42-9e27-990b4ec339b2	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mrs.  LUBEGA GRACE	lubegagrace_1771147945305@mt.com	0700683877	CF73035102A25L	1973-07-01	GAYAZA, KASANGATI WAKISO DISTRICT	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.305+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.305+03	[]	670000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
8a582970-e620-4904-ac94-a175fb03f2ae	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  KASUJJA MICHAEL	kasujjamichael_1771147945314@mt.com	0742245035	CM9405210C7GQD	1994-10-01	Nangabo	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.314+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.314+03	[]	35000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
0988224a-9964-4cb1-962a-a25118ed29a9	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  SEMPIJJA CHARLES	sempijjacharles_1771147945317@mt.com	0751209912	CM98036100TM9G	1990-01-01	KASANGATI	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.317+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.317+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
113abcda-b469-4234-980d-d071c0b2127b	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  NYOMBI MORGAN	nyombimorgan_1771147945318@mt.com	0750907789	CM9210510738QD	1990-01-01	KASANGATI	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.318+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.318+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
ccc45747-bbec-40ca-a0bb-01f7517e6cf2	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  BALIKUDDEMBE JOSEPH	balikuddembejoseph_1771147945319@mt.com	0754039331	CM95002104ANIL	1990-01-01	KASANGATI	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.319+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.319+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
ed162294-3ace-4458-991d-ccc6d6125877	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Miss  Nalwada Phionah	nalwadaphionah_1771147945321@mt.com	0758967479	CF91017100NLCD	1991-09-11	N/A	Individual Loan	800000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.321+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.321+03	[]	999000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
3486377c-bd91-4f56-8171-1ce11cd0e336	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  BUKUSOBA SAMUEL	bukusobasamuel_1771147945322@mt.com	0703670249	CM9000710243QD	1990-12-10	KSANGATI	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.322+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.322+03	[]	280000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
ba729193-1583-4850-82c1-ef1284dd6ec6	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  TEBAJUKILA ABDALAH	tebajukilaabdalah_1771147945325@mt.com	0703720143	CM9605210GL93K	1996-01-01	KASANGATI, NANGABO WAKISO DISTRICT	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.325+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.325+03	[]	480000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
56915a3d-5271-48b7-9003-959befc539d1	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  WAVAMUNO LIVINGSTONE	wavamunolivingstone_1771147945326@mt.com	0753415090	CM8500703TRNC	1985-01-07	KASANGATI, NANGABO WAKISO DISTRICT	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.326+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.326+03	[]	480000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
d249b824-590b-48f7-82e3-94139f75aa75	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  BUSUKWA MARK	busukwamark_1771147945328@mt.com	0705864413	CF00052104QE5K	1990-01-01	KASANGATI	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.328+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.328+03	[]	480000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
af883d2e-33e1-4ebf-90e5-1820a53881c2	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  BUTANAKYA GEORGE	butanakyageorge_1771147945330@mt.com	0754564152	CM820941014CCJ	1990-01-01	KASANGATI	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.33+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.33+03	[]	450000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
b5780c48-3063-42b2-8620-2ee6dee5000e	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  MUBIRU KENNETH	mubirukenneth_1771147945331@mt.com	0755790570	CM0105210ZDZXL	1990-01-01	KASANGATI	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.331+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.331+03	[]	450000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
2414aa66-0c81-40af-b29d-8176c0a22a3c	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  OWEMBABAZI RODGERS	owembabazirodgers_1771147945332@mt.com	0709465941	CM97009102MGHL	1997-07-07	KASANGATI	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.332+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.332+03	[]	480000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
8a219eb3-cb77-4e38-832b-debb6bbbd5e1	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  LUGWANA ANTHONY	lugwanaanthony_1771147945333@mt.com	0740718690	CMOOO8210E9A4X	2000-12-01	Kasangati	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.333+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.333+03	[]	625000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
d80c5b13-f528-4538-9555-91de2f9a9080	a9c3e1ee-7c5c-4289-b123-575d8bec610f	Mr.  AMUDA FRED	amudafred_1771147945334@mt.com	0700682118	CM82032104QY5J	1988-05-08	MAGIGYE, BUSUKUMA DIVISION WAKISO DISTRICT	Individual Loan	500000.00	0	N/A	N/A	\N	\N	disbursed	\N	\N	2026-02-15 12:32:25.334+03	2026-02-15 12:43:48.676328+03	\N	2026-02-15 12:32:25.334+03	[]	330000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
5c3be9e7-23ee-47d1-90b5-fea0ca493d8a	19b22681-d065-415b-8db1-4edaab4a0087	Mr.  Bugembe Hadson	cm9605210u35gl@client.mtmicrofinance.ug	+256757276154	CM9605210U35GL	1900-01-01	Namayina	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-13 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-09-13 12:00:00+03	[]	70000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	78045ea9-08c4-40cb-b489-5e5e5b1e0d88	Not Insured
10254d98-1893-42f4-8ac0-9bf3094d70b9	42418a7f-acc4-46d9-95eb-fdd82fba1b63	Mr.  TEBAJUKILA ABDALAH	cm9605210gl93k@client.mtmicrofinance.ug	+256703720143	CM9605210GL93K	1900-01-01	KASANGATI, NANGABO WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:40:59.530254+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:40:59.530254+03	[]	678000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d736eba4-ded0-47d6-b2a3-b138422f1c17	Not Insured
00ced3f8-2b84-4f39-840b-047f3985f949	3a9ef6a3-cc78-4843-ab3c-bf6c385f475a	Mr.  AHEEBWA ANDREW	cm98010103qdjf@client.mtmicrofinance.ug	+256758504583	CM98010103QDJF	1900-01-01	KASANGATI	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:41:17.488976+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:41:17.488976+03	[]	120000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	614c86c9-588f-46e8-9e16-85d10eb41f14	Not Insured
df94cdcc-2462-477a-aaa6-11e9bd446dc1	c123af7d-86e9-4bd0-a968-273b4291dc40	Mr.  MASEREKA SWALIM	cm97015100tf8g@client.mtmicrofinance.ug	+256702488433	CM97015100TF8G	1997-07-06	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-03-01 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-03-01 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	44b99547-1017-41cb-b574-854c2a3404c0	Not Insured
caf0abca-f7fc-4bae-a3a0-406c68a73487	ff5dc921-d909-4c4d-a770-4d3e2872c9e7	Mr.  MUGULA ISMA	cm88047104p2mh@client.mtmicrofinance.ug	+256701628176	CM88047104P2MH	1988-09-09	Namayina	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-03-01 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-03-01 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	44b99547-1017-41cb-b574-854c2a3404c0	Not Insured
006dc261-ffd9-4b27-acc5-05bb0000fc64	e710d279-5467-4f11-be51-a94abca5b710	Mr.  MULEMBE STUART	cm970491064qhg@client.mtmicrofinance.ug	+256745363481	CM970491064QHG	1997-10-29	Kasangati	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-03-01 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-03-01 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	44b99547-1017-41cb-b574-854c2a3404c0	Not Insured
4e9a32e7-c9c3-4633-b5c3-828bf4193f59	ca678f80-cca3-4630-afc8-1a53a3d8624d	Miss  Nambusi Getrude	cf83023104jfld@client.mtmicrofinance.ug	+256752122248	CF83023104JFLD	1983-09-09	GAYAZA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-02-21 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-02-21 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	7a5366a4-d167-40f2-9d1d-af7a716ceb8c	Not Insured
fd56e7b5-5b04-4003-89b2-a7cae5cf65ba	a0ed9630-5c89-4325-8741-daed1f6f16b9	Mr.  LUTALO BEN HAZARD	cm9205210gk57c@client.mtmicrofinance.ug	+256759242419	CM9205210GK57C	1992-03-28	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-02-22 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-02-22 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	7a5366a4-d167-40f2-9d1d-af7a716ceb8c	Not Insured
a802f932-e48d-437a-a692-b0c8df5a0f18	30a61edc-4fd5-4fb0-9dc6-e42e9f9ec279	Mr.  TENYWE HARUNAH	cm80023106x9ng@client.mtmicrofinance.ug	+2567560518662	CM80023106X9NG	1980-09-07	GAYAZA	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-08-14 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-08-14 12:00:00+03	[]	560000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	7a5366a4-d167-40f2-9d1d-af7a716ceb8c	Not Insured
d7e9d206-a378-4fa0-9e62-0aafba0588df	2fe761b1-4c9a-41bd-bcd5-5c1465a34f17	Mrs.  LWANGA AGNES	cf78032100xh6a@client.mtmicrofinance.ug	+256741781775	CF78032100XH6A	1978-11-24	GAYAZA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-02-22 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-02-22 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	7a5366a4-d167-40f2-9d1d-af7a716ceb8c	Not Insured
1d3bc0a4-583a-4e4d-9ba6-df07625ec7da	d798d12d-4909-4ef9-8835-82f076893498	Mrs.  Nasanga Joan	cf96013100tm0f@client.mtmicrofinance.ug	+256709955079	CF96013100TM0F	1900-01-01	Nangabo	Individual Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:37:12.78752+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:37:12.78752+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
6ce92ace-d1dc-45cc-aa53-dfc1f1cb5233	398d9545-0878-427b-8c1f-3c1ee8da2289	Mr.  KAYONDO JOSEPH	cm76027108k0yj@client.mtmicrofinance.ug	+256701099693	CM76027108K0YJ	1900-01-01	RUTI	Individual Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:37:16.635903+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:37:16.635903+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
babd9af7-d9e2-404b-8a97-d43807910844	45c6041d-2a04-44cc-8bbc-0b5deeb718fa	Mr.  BIHANGANA VICENT	cm940321072mck@client.mtmicrofinance.ug	+256753378595	CM940321072MCK	1900-01-01	Nangabo	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:37:19.161202+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:37:19.161202+03	[]	90000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c51d4850-a604-47f2-85a4-621db6f6aa76	Not Insured
5d4ab168-ca0e-4cc8-af42-acdc55b822fe	8f859eb2-d773-46b3-a5f9-1e294086690e	Mr.  Kyasimire Bennet	cm82039101fy2c@client.mtmicrofinance.ug	+256754942224	CM82039101FY2C	1900-01-01	Nakasero	Individual Loan	1000000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:37:25.274441+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:37:25.274441+03	[]	1300000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
8d95e725-0f10-4f85-89f1-9fc5f31ddd30	8f859eb2-d773-46b3-a5f9-1e294086690e	Mr.  Kyasimire Bennet	cm82039101fy2c@client.mtmicrofinance.ug	+256754942224	CM82039101FY2C	1900-01-01	Nakasero	Individual Loan	2000000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-01-17 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-01-17 12:00:00+03	[]	2141000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
bdca3836-1953-49e3-8583-8f03c98f67b9	07b840ac-8504-4d08-b1ca-778bf8271702	Nakasi Teopista	cf54052101j3ha@client.mtmicrofinance.ug	+256707849420	CF54052101J3HA	1996-07-18	Nangabo	Group Loan	600000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-11-05 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-11-05 12:00:00+03	[]	746000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	8aa2723e-3eea-4d05-9d8e-a9d7336a46d1	Not Insured
2d66159b-ff3a-493b-a2f3-c774f990d603	53101c52-9e48-49bc-a11b-01f487676219	Mr.  MUKISA ROBERT	cm860821062c9k@client.mtmicrofinance.ug	+256744068200	CM860821062C9K	1986-06-01	GAYAZA, NANGABO WAKISO DISTRICT	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-16 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-16 12:00:00+03	[]	925000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	bf7147f5-a11f-49a2-8577-3d1b572d10e5	Not Insured
c51b098b-1398-497d-b2eb-d7ad8a56fc8a	7361aa03-3224-4942-a9f7-b80133bd0fdb	Mrs.  NALWANGA MAGRET	cf89082103ttvl@client.mtmicrofinance.ug	+256756004443	CF89082103TTVL	1989-02-02	NAKWERO	Group Loan	900000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-26 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-09-26 12:00:00+03	[]	226000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	5b16a75f-7136-43e4-8368-19c4ffc3b753	Not Insured
9c7aae23-d057-4cf7-a07c-97c62f564f74	16fbb71e-32dc-4d1b-8610-07ab5997e3fd	Mrs.  NAISANGA JOAN	cf96013100tmof@client.mtmicrofinance.ug	+256756064927	CF96013100TMOF	1996-02-14	KASANGATI	Group Loan	900000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-08-02 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-08-02 12:00:00+03	[]	1131000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	5b16a75f-7136-43e4-8368-19c4ffc3b753	Not Insured
c0844a54-8b9e-4428-b96b-cb95b2d526cb	4778602d-e5f5-48d3-a87f-6f65c318613d	Mr.  KIDEDE PAUL	cm920691024t2f@client.mtmicrofinance.ug	+256705844698	CM920691024T2F	1900-01-01	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-08-20 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-08-20 12:00:00+03	[]	532000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	50581d34-f62c-480d-b864-bacf5820b771	Not Insured
f756252d-af07-4155-a2fb-35e17f249a30	85fb9db8-ec17-4b2b-8a68-46c80b20dd4d	GUMISIRIZA GODFREY	cm37061104vz6c@client.mtmicrofinance.ug	+256753378593	CM37061104VZ6C	1900-01-01	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-08-20 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-08-20 12:00:00+03	[]	477000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	50581d34-f62c-480d-b864-bacf5820b771	Not Insured
5915241b-8012-462c-9b43-c8779bac92d3	cf4d9289-0a0e-4d1f-b041-a1c2b935bb4b	Mrs.  NANDUTU OLIVIER	cf0206710alb97@client.mtmicrofinance.ug	+256705707903	CF0206710ALB97	1900-01-01	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-08-20 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-08-20 12:00:00+03	[]	447000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	50581d34-f62c-480d-b864-bacf5820b771	Not Insured
9a1de240-520c-41d4-b549-09e195b26e4d	b6fe01e8-d76e-4768-aee3-a579608e9704	Mr.  NDYANABO EMMA	cm910091093zhj@client.mtmicrofinance.ug	+256746380789	CM910091093ZHJ	1900-01-01	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-08-20 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-08-20 12:00:00+03	[]	374000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	50581d34-f62c-480d-b864-bacf5820b771	Not Insured
df2075fe-2470-447e-9242-8d911add150b	12f6afda-3c17-4dad-8ce7-9c9123c141b4	Mr.  WAVAMUNO LIVINGSTONE	cm8500703trnc@client.mtmicrofinance.ug	+256753415090	CM8500703TRNC	1985-07-01	KASANGATI, NANGABO WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-01-31 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-01-31 12:00:00+03	[]	675000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d736eba4-ded0-47d6-b2a3-b138422f1c17	Not Insured
ff025125-f1b8-4f70-94f3-c55a2e3c9afb	20522b0d-0de3-4869-aa3f-5cfee56a032e	Mrs.  NAMUSISI BEATRICE	cf87875102vmf@client.mtmicrofinance.ug	+256754599451	CF87875102VMF	1985-07-17	Nangabo	Group Loan	300000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-10 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-09-10 12:00:00+03	[]	299000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	e7627f71-0935-4bba-b173-c04c108775a5	Not Insured
c105bb38-adef-4cfc-b373-c32b3cb92238	ffaf7306-9024-402a-812f-e8cfbf452b15	Mr.  SSEWAGUDDE MATIA	cm93032104jqxd@client.mtmicrofinance.ug	+256700431060	CM93032104JQXD	1974-04-10	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-03-31 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-03-31 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c51d4850-a604-47f2-85a4-621db6f6aa76	Not Insured
65271358-22b4-44d1-9b07-7a87a82bfc83	a8d7e41b-dd4a-4879-8968-180f86d1f43e	Mr.  KALIRO ABBEY	cm80494104tehf@client.mtmicrofinance.ug	+256756426170	CM80494104TEHF	1993-04-08	Nangabo	Group Loan	900000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-11-15 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-11-15 12:00:00+03	[]	100000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c51d4850-a604-47f2-85a4-621db6f6aa76	Not Insured
58478ed5-6873-4eef-99fc-314bf961797c	ffaf7306-9024-402a-812f-e8cfbf452b15	Mr.  SSEWAGUDDE MATIA	cm93032104jqxd@client.mtmicrofinance.ug	+256700431060	CM93032104JQXD	1900-01-01	Nangabo	Group Loan	900000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:37:46.501196+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:37:46.501196+03	[]	100000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c51d4850-a604-47f2-85a4-621db6f6aa76	Not Insured
a7ca61c3-6b8b-4717-bfa2-73ad20d46bd0	87ad863b-9d24-4e06-94e8-6ad589708b8b	Mr.  SSEKIDE HASSAN	cm97047103vzmj@client.mtmicrofinance.ug	+256741002924	CM97047103VZMJ	1900-01-01	Nanagabo	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:37:49.08135+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:37:49.08135+03	[]	910000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c51d4850-a604-47f2-85a4-621db6f6aa76	Not Insured
b31943e5-0caf-4ad8-9c84-4c057499b16b	cf288872-d7a0-4a36-8b86-509eab5f1146	Mrs.  NALUKENGE SHAKIRAH	cm8500703trnc@client.mtmicrofinance.ug	+256704631464	CM8500703TRNC	1900-01-01	NAKWERO	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:37:52.661172+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:37:52.661172+03	[]	160000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	a8d609dc-d32c-4d75-844b-be1bb6990a9e	Not Insured
2f8dcc32-d20c-49b8-995f-065c468d0d2e	461d76e8-03a5-4ddc-8021-b89f84d1fcb1	Mrs.  KARUNGI JULIET	cm9605210gl93k@client.mtmicrofinance.ug	+256743885283	CM9605210GL93K	1900-01-01	KASANGATI	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-11-11 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-11-11 12:00:00+03	[]	160000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	a8d609dc-d32c-4d75-844b-be1bb6990a9e	Not Insured
93f6f513-8aa7-4300-a234-b3236dd633c1	9cc5c271-1552-4c24-978d-5897036932de	Mr.  LUWAGA MUSA	cm74032104tp3h@client.mtmicrofinance.ug	+256703433281	CM74032104TP3H	2005-04-04	Nangabo	Group Loan	900000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-11-15 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-11-15 12:00:00+03	[]	100000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c51d4850-a604-47f2-85a4-621db6f6aa76	Not Insured
e81e104d-2574-48af-b561-b03c1d0d45c5	87ad863b-9d24-4e06-94e8-6ad589708b8b	Mr.  SSEKIDE HASSAN	cm97047103vzmj@client.mtmicrofinance.ug	+256741002924	CM97047103VZMJ	1997-07-06	Nanagabo	Group Loan	900000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-11-15 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-11-15 12:00:00+03	[]	100000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c51d4850-a604-47f2-85a4-621db6f6aa76	Not Insured
2cb3297a-df9c-4c30-94de-60d860133d41	3af8c53e-0147-4274-9e44-8cd8ae16a030	Mrs.  Nakabuye Hajarah	cf92023109kcqg@client.mtmicrofinance.ug	+256752586048	CF92023109KCQG	1992-09-11	nakwero	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-11-11 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-11-11 12:00:00+03	[]	160000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	a8d609dc-d32c-4d75-844b-be1bb6990a9e	Not Insured
cbab3056-2855-4234-80f8-9a207df65d1f	87b26a5d-79c2-4cd6-b339-00c7a341408c	Mr.  Kyalwazi Marvin	cf781001nked@client.mtmicrofinance.ug	+256749843455	CF781001NKED	1900-01-01	Namayina	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-25 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-25 12:00:00+03	[]	175000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	a3c98617-1f5f-46e7-babb-9b007b1eb35d	Not Insured
3d7e9b5e-572c-40b2-9081-11e0dd60b92b	244a8883-eef2-4d96-a8b1-bee4d15a1bf9	Mrs.  Tibesigwa Ritah	cf97007103vhlj@client.mtmicrofinance.ug	+256705107643	CF97007103VHLJ	1997-07-17	kazinga	Group Loan	300000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-11-11 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-11-11 12:00:00+03	[]	100000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	a8d609dc-d32c-4d75-844b-be1bb6990a9e	Not Insured
d737ee95-3025-44e1-b59c-fbfbee334725	36ea564e-08dc-4b79-a51e-9672b2d0f5e7	Mrs.  Twashemererwa Jacent	cf820181070wrc@client.mtmicrofinance.ug	0000000000	CF820181070WRC	1982-01-20	NAMAYINA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-11-11 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-11-11 12:00:00+03	[]	105000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	a3c98617-1f5f-46e7-babb-9b007b1eb35d	Not Insured
1a1802b6-6eb1-454b-9e61-fcc5a4f4a418	73c067a6-6c1a-4d9a-8d95-76ac6053b8d3	Mr.  KYAKABALE BENON	cm7900910karzk@client.mtmicrofinance.ug	+256701877594	CM7900910KARZK	1979-07-10	NAMAYINA, KABUBBU WAKISO	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-03 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-03 12:00:00+03	[]	665000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	a3c98617-1f5f-46e7-babb-9b007b1eb35d	Not Insured
04085df2-8751-4945-b7ad-09fe0c988ada	a5ff6a6b-e7ee-44d4-9231-3c073ebee14a	Mr.  BOGERE JULIUS	cm92032107xr6a@client.mtmicrofinance.ug	+256709614766	CM92032107XR6A	1992-10-13	KASANGATI, NANGABO WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-18 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-18 12:00:00+03	[]	667000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	b113a21b-3ccd-47ef-ad69-3d84361d44bf	Not Insured
e51ac0be-fc71-4611-a1d3-549a36a3c9a3	f7c12317-0c1c-4190-9b9a-5caad1764429	Mr.  Kayemba Paul	cm99052114383c@client.mtmicrofinance.ug	+256742805088	CM99052114383C	1999-12-06	Namayina	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-11-11 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-11-11 12:00:00+03	[]	164000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	f7355d86-f42d-4d7e-8ec0-a4425c8870e4	Not Insured
28f4f710-e0cc-4c69-a572-21dd7f90b3a8	e4dd6ff0-ad6d-4a45-9b99-b0200a83fb18	Mrs.  Twinomugisha Joan	cf94027106n33g@client.mtmicrofinance.ug	+256757572549	CF94027106N33G	1994-12-08	Namayina	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-11-11 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-11-11 12:00:00+03	[]	132000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	f7355d86-f42d-4d7e-8ec0-a4425c8870e4	Not Insured
f78f8ad5-f02d-4d28-b004-6dd6c8e1ce08	e57c350a-f75f-4e71-b4da-f47b4d44d262	Mr.  Ssemakula Latib Jr	cm96099101cfmk@client.mtmicrofinance.ug	+256706125186	CM96099101CFMK	1996-04-17	kyankima	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-11-11 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-11-11 12:00:00+03	[]	132000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	f7355d86-f42d-4d7e-8ec0-a4425c8870e4	Not Insured
7adfe546-5476-453b-b351-0426a2566ffa	43145b30-d275-44b4-bb15-024687674189	Mr.  SEBINA PAUL	cm91023107c9uh@client.mtmicrofinance.ug	+256772753695	CM91023107C9UH	1991-09-30	KASANGATI, NANGABO WAKISO DISTRICT	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-21 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-21 12:00:00+03	[]	100000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	b113a21b-3ccd-47ef-ad69-3d84361d44bf	Not Insured
10e5e824-a057-4eba-89d6-91bc67f0a7da	04c0f3b9-27a6-4e51-8307-2d8bcd023e9f	Mr.  Kakuru Peter	cm86004101t8zj@client.mtmicrofinance.ug	+256706398276	CM86004101T8ZJ	1980-02-02	Gayaza	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-25 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-25 12:00:00+03	[]	245000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	405af9d4-2949-4229-9069-6ae04aff939a	Not Insured
7cff1b3f-8022-4de9-88e0-ad080f76cd53	274fc050-6669-4c2f-8b75-25b5c600a9a3	Mrs.  Nankanjja Teddy	cf790321062j6k@client.mtmicrofinance.ug	+256750864285	CF790321062J6K	1985-07-31	Manyangwa	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-25 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-25 12:00:00+03	[]	198000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	438f2e9a-798d-4d28-85f3-9c79916911f5	Not Insured
e7ae43b5-d880-42c7-9130-2379db9f641e	9633201d-8330-40a9-af73-ea68366ee806	Mrs.  Nampijja Saudah	cf850311010j0c@client.mtmicrofinance.ug	+256741025929	CF850311010J0C	1985-07-31	Manyangwa	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-25 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-25 12:00:00+03	[]	198000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	438f2e9a-798d-4d28-85f3-9c79916911f5	Not Insured
abfc4a2f-96cc-4eaa-8bd0-a54c1c9f1318	e713184d-6e52-46bb-be36-af8ae8c0144d	Mr.  Tusingirwe Obed	cm0210610841dd@client.mtmicrofinance.ug	+256755262620	CM0210610841DD	1900-01-01	Namayina	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-21 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-21 12:00:00+03	[]	205000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	52fbb4b1-3929-43e5-a0cd-c3f40e8df483	Not Insured
ca303d05-fde6-4dc9-91d1-d3199c845d8a	efad4b39-5441-43e6-982b-ea57e3ebb3a7	Mrs.  Kyolaba Mary	cf94052106vwpa@client.mtmicrofinance.ug	+256786724077	CF94052106VWPA	1994-04-02	Manyangwa	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-25 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-25 12:00:00+03	[]	198000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	438f2e9a-798d-4d28-85f3-9c79916911f5	Not Insured
8644e06a-b15d-433a-94f0-93b2c64bed92	0aecdb89-2e59-4105-8861-a57f18b33398	Kiyaga Rashid	cm96052108hz8c@client.mtmicrofinance.ug	+256706991869	CM96052108HZ8C	2005-06-18	Gayaza, Kasangati	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-26 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-26 12:00:00+03	[]	625000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	405af9d4-2949-4229-9069-6ae04aff939a	Not Insured
e3f8fb3a-dd42-4e2c-8299-f4c7fe7838a9	a3681da4-6464-43bb-b82d-5553442f8844	Mr.  Nviiri Herman	cm9810001580nd@client.mtmicrofinance.ug	+256750673619	CM9810001580ND	1988-02-02	Manyangwa	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-25 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-25 12:00:00+03	[]	205000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	64fcca38-4e88-4832-abb9-1e37f2447a95	Not Insured
694bf796-18e7-40cb-bc70-1e618028caca	5562b768-7aa7-467e-94e4-164019727ad9	Mr.  Mupuya Godfrey	cm910671040fgl@client.mtmicrofinance.ug	+256704305358	CM910671040FGL	1991-07-02	Manyangwa A	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-25 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-25 12:00:00+03	[]	246000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	64fcca38-4e88-4832-abb9-1e37f2447a95	Not Insured
69f822e0-66b3-416b-b3f0-f3a2847ae671	1c3e2202-beab-405e-9834-312469eb151a	Mr.  Nahabwe Anxious	cm9703710hnqpd@client.mtmicrofinance.ug	+256753899162	CM9703710HNQPD	1997-11-01	Kyetume	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-25 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-25 12:00:00+03	[]	246000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	64fcca38-4e88-4832-abb9-1e37f2447a95	Not Insured
f7c5e47b-258f-4217-add9-057b703c1561	c7d1ca17-6571-4a26-a6c2-b4af2373a9a8	Mr.  Ssentuyo Yusuf	cm940231090r2j@client.mtmicrofinance.ug	+256748137237	CM940231090R2J	1994-09-06	Wampewo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-28 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-28 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	5bdc86a2-9fad-48c9-a95e-7733d966b250	Not Insured
81acc4a4-e7de-4ae5-89a3-0604e5d70ba8	6c76aad7-e97a-40fe-b36e-88fa6dd4d357	Mr.  Mulinde Alex	cm950451042zwl@client.mtmicrofinance.ug	+256700329478	CM950451042ZWL	1995-01-01	Wampewo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-07 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-07 12:00:00+03	[]	569000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	5bdc86a2-9fad-48c9-a95e-7733d966b250	Not Insured
f4fe3ad0-1e8c-47c2-975a-a525196d865c	5c8ea7dd-10d5-408a-84b1-77f61b2bc0a5	Mr.  Seguya Julius	cm85032101vudf@client.mtmicrofinance.ug	+256748627577	CM85032101VUDF	1985-09-11	Wampewo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-07 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-07 12:00:00+03	[]	26000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	5bdc86a2-9fad-48c9-a95e-7733d966b250	Not Insured
ae799545-024a-4f6f-8e69-b72927a3538c	a0624077-ac54-45e4-a178-ec2a612938d9	Mr.  Ssekanjako Ronnie	cm01045105aytc@client.mtmicrofinance.ug	+256751643709	CM01045105AYTC	2001-07-07	Namayina	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-21 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-21 12:00:00+03	[]	123000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	52fbb4b1-3929-43e5-a0cd-c3f40e8df483	Not Insured
eae7b535-86e0-4e81-8d47-140bfffd7f23	f5bdb75d-a315-4711-9617-9dd39bbc8bc1	Mr.  Besigye Muzayima	cm0203410mzp5j@client.mtmicrofinance.ug	+256746665492	CM0203410MZP5J	2002-10-19	Namayina	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-21 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-21 12:00:00+03	[]	205000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	52fbb4b1-3929-43e5-a0cd-c3f40e8df483	Not Insured
209ce367-c754-472c-8c2a-ab66c3805f6b	4996d1e4-331a-45fb-85f1-e4378a6d6b19	Mr.  Sekyanzi Sharif	cf82068106yrmc@client.mtmicrofinance.ug	+256708397747	CF82068106YRMC	1900-01-01	Namayina	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-14 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-14 12:00:00+03	[]	350000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	78045ea9-08c4-40cb-b489-5e5e5b1e0d88	Not Insured
4e54cf2e-8213-4a6f-81b3-1fb3cc0ead62	38ca11c1-d90e-4fba-afb4-fc4d24295f5f	Mr.  Wasswa Geofrey	cf920201004xdf@client.mtmicrofinance.ug	+256751766685	CF920201004XDF	1900-01-01	Namayina	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-14 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-14 12:00:00+03	[]	350000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	78045ea9-08c4-40cb-b489-5e5e5b1e0d88	Not Insured
f1fd9a46-bde2-4189-9ea6-7c2f58ed89c0	43145b30-d275-44b4-bb15-024687674189	Mr.  WASSAKA WILSON	cm75052107777a@client.mtmicrofinance.ug	+256772753695	CM75052107777A	1900-01-01	KASANGATI, NANGABO WAKISO DISTRICT	Group Loan	800000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-21 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-21 12:00:00+03	[]	35000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	b113a21b-3ccd-47ef-ad69-3d84361d44bf	Not Insured
f67f8ac4-99ea-4a45-a6fd-0616328eb5f8	7361aa03-3224-4942-a9f7-b80133bd0fdb	Mrs.  NALWANGA MAGRET	cf89082103ttvl@client.mtmicrofinance.ug	+256756004443	CF89082103TTVL	1900-01-01	NAKWERO	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:43:28.680756+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:43:28.680756+03	[]	910000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	5b16a75f-7136-43e4-8368-19c4ffc3b753	Not Insured
b485baae-0b29-4257-ae8b-19dc08943a56	28cf13b2-38e8-431c-9118-2887697651c1	Mrs.  Nabukenya Christine	cf96052113yz9f@client.mtmicrofinance.ug	+256702005991	CF96052113YZ9F	1996-12-22	Ndazabazadde	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-21 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-21 12:00:00+03	[]	192000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	58862b88-a0d1-4326-b1d0-82058db0b10f	Not Insured
92f4f17a-6fea-41cc-8486-55035a8fabcc	44f6cde4-ff3b-49c8-9ed6-7c7c7c10be99	Mr.  Kakande Badru	cm80047100dpmd@client.mtmicrofinance.ug	+256706363044	CM80047100DPMD	1980-01-01	Ngalamye	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-21 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-21 12:00:00+03	[]	246000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	58862b88-a0d1-4326-b1d0-82058db0b10f	Not Insured
886a4a29-cf9f-4585-8c6a-296557540c48	d966dec5-fda7-452a-89f6-9cec44c6e858	Mrs.  Namanda Jackline	cf0605210larfd@client.mtmicrofinance.ug	0000000000	CF0605210LARFD	2006-06-15	Mundazabazadde	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-21 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-21 12:00:00+03	[]	192000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	58862b88-a0d1-4326-b1d0-82058db0b10f	Not Insured
07a46109-f2a4-466a-8b23-b5c3d2ff245d	57c82246-b8ae-45fd-8b78-6d2c2620e6b5	Mrs.  Mpindi Zainab	cf86047100r55h@client.mtmicrofinance.ug	+256759237777	CF86047100R55H	1986-01-02	Mundazabazadde	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-21 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-21 12:00:00+03	[]	246000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	58862b88-a0d1-4326-b1d0-82058db0b10f	Not Insured
e93c8c5f-fb65-4901-9260-73219404e512	5a2b1e5f-2124-4b46-abd4-cb5524cec191	Mr.  Kamale Isaac	cm89045103lv9a@client.mtmicrofinance.ug	+256749105690	CM89045103LV9A	1989-12-12	Gayaza	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-21 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-21 12:00:00+03	[]	246000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	5479431c-3d1c-49c1-a118-f46567117e1b	Not Insured
74c02173-7fa9-4367-be0e-f255076e040c	87681d90-5e70-415d-b242-a5efc8000cb2	Miss  Nantume Ritah	cf90032102wyxe@client.mtmicrofinance.ug	+256786674851	CF90032102WYXE	1990-10-10	No Address	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-04-20 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-04-20 12:00:00+03	[]	333000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	fa97c25b-20f1-4bc1-b4ac-a7a7473963b5	Not Insured
7f80cd0b-cac9-40fb-81c8-5178fed1346c	b2b9db31-b79e-42b9-9584-2d52a8844e75	Mr.  Kimbugwe Sudais	cm02047109uake@client.mtmicrofinance.ug	+256748270758	CM02047109UAKE	2002-07-04	Manyangwa	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-21 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-21 12:00:00+03	[]	246000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	5479431c-3d1c-49c1-a118-f46567117e1b	Not Insured
f3eed394-eeb1-4ae3-9b1c-499454a5c5fc	54413b6d-5727-4e9c-b4d1-d313c2014e3e	Mrs.  Nalumu Milly	cf890231068jnd@client.mtmicrofinance.ug	+256704234403	CF890231068JND	1989-07-26	Kabubbu	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-21 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-21 12:00:00+03	[]	246000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	5479431c-3d1c-49c1-a118-f46567117e1b	Not Insured
d1e9cc32-ed9d-4ccb-ad5c-995a13a7bc46	341e6653-f8ee-4249-9028-0d616659d087	Mrs.  Nanyonjo Rose	cf850991075vjc@client.mtmicrofinance.ug	+256742551564	CF850991075VJC	1985-02-05	Wampewo	Group Loan	300000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-11 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-11 12:00:00+03	[]	250000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d7f1c447-96f0-4e31-a03b-d6a5eb1a367f	Not Insured
5747b366-adbf-4594-a615-e6f97401f63c	543e5fdf-203d-4826-9d8f-605cbb43221f	Mr.  Kisakye Fred	cm9400710acvjl@client.mtmicrofinance.ug	+256701494167	CM9400710ACVJL	1994-10-09	Wampewo	Group Loan	300000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-11 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-11 12:00:00+03	[]	250000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d7f1c447-96f0-4e31-a03b-d6a5eb1a367f	Not Insured
0fed7e29-00a3-4dbd-9f08-336068204af5	94f9b62c-bb7c-41a8-9cda-9d079491020b	Mr.  Mayanja Ashiraf	cm980601040wvc@client.mtmicrofinance.ug	+256709199848	CM980601040WVC	1998-01-01	Wampewo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-11 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-11 12:00:00+03	[]	410000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d7f1c447-96f0-4e31-a03b-d6a5eb1a367f	Not Insured
c1b57564-6109-45f6-933c-27f749a81e34	f40579ba-ada4-4bd2-8d06-7d1aa4420062	Mrs.  Ndagire Aminah	cf94047104mvkj@client.mtmicrofinance.ug	+256748142571	CF94047104MVKJ	1994-04-09	Wampewo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-11 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-11 12:00:00+03	[]	410000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d7f1c447-96f0-4e31-a03b-d6a5eb1a367f	Not Insured
c1c65fec-e3e8-44c3-8655-efd7abf97f59	7f7f60b4-da99-47e5-97c6-9559238d5226	Mr.  Kyagera Bumbakali	cm890068107j6ga@client.mtmicrofinance.ug	+256746652828	CM890068107J6GA	1989-12-09	Wampewo	Group Loan	300000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-11 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-11 12:00:00+03	[]	250000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d7f1c447-96f0-4e31-a03b-d6a5eb1a367f	Not Insured
aa0afe26-6a67-4cdb-b60b-fb78d7a6642c	0b937a46-ee75-4f04-ab7d-7fd4673119f9	Mr.  Mutsinze Omar	cm97032108r3qa@client.mtmicrofinance.ug	+256750208886	CM97032108R3QA	1997-04-07	Gayaza	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-11 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-11 12:00:00+03	[]	320000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	18836fc6-98b2-44b4-908b-227ff7dfbd37	Not Insured
2abc148c-bd04-4302-a41f-ac19745a5a4d	75c7f816-d217-4a0d-859e-a2db6046fa15	Mr.  Masaaba Frank	cm93032103cmwe@client.mtmicrofinance.ug	+256709920893	CM93032103CMWE	1993-05-17	Gayaza B	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-11 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-11 12:00:00+03	[]	320000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	18836fc6-98b2-44b4-908b-227ff7dfbd37	Not Insured
21dadaa5-ed07-40e1-a341-d63ca8cca0ed	295d39df-dd53-4544-b0e6-55104719bae4	Mr.  KAMYA VICENT	cm82017102nlme@client.mtmicrofinance.ug	+256751774680	CM82017102NLME	1982-01-01	KASANGATI, NANGABO WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-04 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-04 12:00:00+03	[]	680000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	cb0420d4-9543-4e7b-9b43-7f664f88b632	Not Insured
5d2751a1-51a7-4f48-ad52-a71b0f9383da	11c18bdb-fb07-4aab-b1d8-80021fc101a7	Mr.  Matovu Mathias	cm9603610686wg@client.mtmicrofinance.ug	+256742724285	CM9603610686WG	1996-10-24	Kasangati	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-06 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-06 12:00:00+03	[]	320000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	cb0420d4-9543-4e7b-9b43-7f664f88b632	Not Insured
53f3c7ed-b3ee-4748-8515-8f4539f9dd3b	3d332321-6c14-4695-bf74-25c95a397e7e	Mr.  KASIBANTE YUDA	cm8606910d7rxd@client.mtmicrofinance.ug	+256740406706	CM8606910D7RXD	1986-01-02	KASANGATI, NANGABO WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-04 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-04 12:00:00+03	[]	680000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	cb0420d4-9543-4e7b-9b43-7f664f88b632	Not Insured
58127581-005f-4e0c-85f7-c0674e80de48	d71e36ca-74b6-4429-ae0d-a20300fe4d3a	Mr.  ARINAITWE YORAM	cm83027106mljg@client.mtmicrofinance.ug	+256700368667	CM83027106MLJG	1983-04-10	KASANGATI, NANGABO WAKISO DISTRICT	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-25 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-25 12:00:00+03	[]	850000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	b48f3ac7-e107-4718-82c7-0d599fb08c44	Not Insured
bda6f81c-d0ca-4cba-b092-97288afebe73	06b3c564-cea5-4dd6-81a7-d2448573a017	Mr.  Ndayisaba Adrian	cm89018101yygh@client.mtmicrofinance.ug	+256704439660	CM89018101YYGH	1989-02-12	Magigye	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-10 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-09-10 12:00:00+03	[]	485000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	e7627f71-0935-4bba-b173-c04c108775a5	Not Insured
a37a9b61-5e09-422a-9f73-9e37a56d0ad9	6caae18f-c81f-4167-a65a-9edd7df7ac73	Mrs.  Namukasa Florence	cf840301017roh@client.mtmicrofinance.ug	+256743835776	CF840301017ROH	1984-03-07	Kisasi	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-10 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-09-10 12:00:00+03	[]	360000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	e7627f71-0935-4bba-b173-c04c108775a5	Not Insured
66981da0-4651-46fb-9676-2f5e3a4ca387	e5e74a76-4e6e-4617-94bc-2ccd67bb8aa0	Mr.  Matovu Henry	cm83036103x5fj@client.mtmicrofinance.ug	+256704528313	CM83036103X5FJ	1983-06-09	Kasangati	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-14 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-09-14 12:00:00+03	[]	480000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	2531cd6a-e4fc-4be7-ada9-09b8397226a7	Not Insured
a3211db0-5bdb-4b57-94f1-dce0735833ad	41ebce67-b19b-4f6a-be39-05f21f5ab67f	Mr.  Bright Wilson	cm74048107ceql@client.mtmicrofinance.ug	+256704400930	CM74048107CEQL	1974-11-11	Kyetume	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-11 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-09-11 12:00:00+03	[]	550000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	2531cd6a-e4fc-4be7-ada9-09b8397226a7	Not Insured
3d02c53e-33ac-45aa-829a-9def21db43a5	5389c56b-2775-4300-a774-ea3041d1f6bb	Mr.  Talemwa Emmanuel	cm97006100j5wl@client.mtmicrofinance.ug	+256741561690	CM97006100J5WL	1997-05-03	Kyetume	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-14 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-09-14 12:00:00+03	[]	480000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	2531cd6a-e4fc-4be7-ada9-09b8397226a7	Not Insured
ae8751a1-211e-4a7f-ac0d-567a42ff2b1a	8a55b7e3-8214-4edd-a5cf-06841cdd254f	Mr.  Talemwa Godwin	cm92006101z2tg@client.mtmicrofinance.ug	+256704751466	CM92006101Z2TG	1992-11-12	Kyetume	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-14 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-09-14 12:00:00+03	[]	480000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	2531cd6a-e4fc-4be7-ada9-09b8397226a7	Not Insured
9f3c764f-5b9d-45f2-93c1-8e4017d14f83	4a2b4ccc-374d-4460-bfa6-b205816b7c40	Mr.  Ziwa Ibrah	cm92105103lrtk@client.mtmicrofinance.ug	+256746739331	CM92105103LRTK	1992-12-22	Namayina	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-13 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-09-13 12:00:00+03	[]	245000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	78045ea9-08c4-40cb-b489-5e5e5b1e0d88	Not Insured
227af27d-e0d2-46de-ab57-df3a22316493	79114ca0-8521-4dda-8f80-bb3b7c404d1a	Mr.  Sentongo Ashiraf	cm96069107ugkc@client.mtmicrofinance.ug	+256705395570	CM96069107UGKC	1996-10-07	Kasangati	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-27 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-09-27 12:00:00+03	[]	121000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	154bb5f5-b4b8-495c-a674-5309403c9f99	Not Insured
ece3a581-b31b-4a00-b135-5ade02ac3a21	c4205826-9772-4206-b5c6-9fa1c1815a35	Mr.  Kapompo Juma	cm9105210wgld2@client.mtmicrofinance.ug	+256707222249	CM9105210WGLD2	1988-08-02	Wampewo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-27 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-09-27 12:00:00+03	[]	80000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	154bb5f5-b4b8-495c-a674-5309403c9f99	Not Insured
ed44d26d-4bc7-4fc8-b361-069f8c6f807a	ec8692cc-1b8f-4e26-a046-e526ec5b8f0d	Mr.  Byakatonda Kennedy	cm97082103c97k@client.mtmicrofinance.ug	+256742779569	CM97082103C97K	1997-11-01	Wampewo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-27 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-09-27 12:00:00+03	[]	41000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	154bb5f5-b4b8-495c-a674-5309403c9f99	Not Insured
b8c4872d-e6b0-4277-a0a1-068091cafd9f	2c33efe2-1783-4f34-ab5a-044bc9fec593	Mr.  Batte Isa	cm97047102eqwa@client.mtmicrofinance.ug	+256749597929	CM97047102EQWA	1997-08-17	Wampewo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-27 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-09-27 12:00:00+03	[]	121000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	154bb5f5-b4b8-495c-a674-5309403c9f99	Not Insured
835850b6-ddb5-40de-8c07-166b53adb0e1	62d99bb5-329f-4bfc-b0eb-45371fef45d1	Mr.  MILIMU JULIUS	cm94052105g27e@client.mtmicrofinance.ug	+256708387597	CM94052105G27E	1994-01-01	GAYAZA, KASANGATI WAKISO DISTRICT	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-27 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-09-27 12:00:00+03	[]	410000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	405af9d4-2949-4229-9069-6ae04aff939a	Not Insured
f374b008-3e16-447c-89ff-4cc84b573bfd	a47b657c-9c3d-438e-9f7e-d0f1a3b64fa9	Mr.  TAMALE RONALD	cm9309810109vc@client.mtmicrofinance.ug	+256743508639	CM9309810109VC	1993-04-14	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-11-05 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-11-05 12:00:00+03	[]	660000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	14b9f030-7e64-4c4e-bbe5-e62afc5fb75d	Not Insured
b2fa118c-434d-48d6-8063-4fc533a68467	9cfcd41a-8ff0-462f-9de1-5f090c008263	Mr.  Tumukunde Bruce	cm96112100wkga@client.mtmicrofinance.ug	+256744341521	CM96112100WKGA	1996-11-05	Kasangati, Wakiso	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-07-07 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-07-07 12:00:00+03	[]	600500.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	ee1c0de6-b94a-4194-b10e-276f5aba3cfb	Not Insured
b66d9cfb-321d-49b5-a3eb-2f859fa89968	069ab712-294c-4c1d-9f54-9070535c99fa	Mr.  Mawenenge William	cm930751004mff@client.mtmicrofinance.ug	+256754696847	CM930751004MFF	1993-12-24	Kasangati, Wakiso	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-07-07 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-07-07 12:00:00+03	[]	410000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	ee1c0de6-b94a-4194-b10e-276f5aba3cfb	Not Insured
d65c8d93-fe2d-4fed-ab7b-42551b99f835	33a9831a-7ead-4e0a-a2a7-85db0cdea3e9	Mr.  Ngiraebisa Joshua	cm98008105p86f@client.mtmicrofinance.ug	+256753951211	CM98008105P86F	1998-06-16	Kasangati, Wakiso	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-07-07 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-07-07 12:00:00+03	[]	559500.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	ee1c0de6-b94a-4194-b10e-276f5aba3cfb	Not Insured
3969a451-516e-43e8-a274-0287d65678de	26080064-ed68-46ae-a41b-18f3100c3812	Mr.  Nabuse Siraji	cm87035102k2xg@client.mtmicrofinance.ug	+256741739562	CM87035102K2XG	1987-06-20	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-07-07 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-07-07 12:00:00+03	[]	491000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	ee1c0de6-b94a-4194-b10e-276f5aba3cfb	Not Insured
a626ff02-0bc3-4b9b-9e9f-41b6d122f51d	c22fbeea-8bf7-4d49-ad23-8666903792f0	Mr.  BUKUSOBA SAMUEL	cm9000710243qd@client.mtmicrofinance.ug	+256703670249	CM9000710243QD	1990-10-12	KSANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-01-31 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-01-31 12:00:00+03	[]	672000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	7713df8d-0dd0-4287-ae93-ce44c370ed48	Not Insured
36ba7810-0ae5-4217-b0a0-8f1cf6f2ad8d	9f8c5a28-5467-4754-8b07-68f758dc3f03	Mr.  TUMURAMYE BENSON	cm91046101qemk@client.mtmicrofinance.ug	+256755720401	CM91046101QEMK	1991-03-03	KAZINGA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-01-31 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-01-31 12:00:00+03	[]	690000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	7713df8d-0dd0-4287-ae93-ce44c370ed48	Not Insured
4f5340d7-a99e-407e-ba09-7bb662ede683	cca07c5e-d413-41a1-a33d-2f138ada2414	Mr.  TWINOMUGYISHA BENSON	cm91046101q4tj@client.mtmicrofinance.ug	+256700921376	CM91046101Q4TJ	1991-11-11	KSANGATI	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-30 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-30 12:00:00+03	[]	310000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	7713df8d-0dd0-4287-ae93-ce44c370ed48	Not Insured
e7919669-a753-4470-81c9-41c2c594ed0f	0ce0f4e3-3a92-4791-af27-b0bc893b940b	Mrs.  NAMATA CHRISTINE	cf0002310lhqih@client.mtmicrofinance.ug	+256741017506	CF0002310LHQIH	2000-03-15	KASANGATI	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-07-09 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-07-09 12:00:00+03	[]	749000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	5b16a75f-7136-43e4-8368-19c4ffc3b753	Not Insured
851974d5-8433-4832-ab00-661b2ee8dffa	ab46d637-496a-40e3-9d53-d038fb82599b	Mrs.  NANFUMA JAMILA	cf8902310323hg@client.mtmicrofinance.ug	+256746716961	CF8902310323HG	1989-03-02	KIJABIJO C	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-29 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-29 12:00:00+03	[]	47000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	cd9ec41e-e172-4c25-a610-0e4f24dae739	Not Insured
8c726e74-d763-4a68-91b5-c4f826cef6a4	5521a9a0-3fd5-4d41-b299-16db5c4ec1cc	Mirembe Pamela	cf87052108fgpa@client.mtmicrofinance.ug	+256754981341	CF87052108FGPA	1987-10-17	No Address	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-04-20 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-04-20 12:00:00+03	[]	333000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	fa97c25b-20f1-4bc1-b4ac-a7a7473963b5	Not Insured
41c96aff-9619-4529-952a-285a5a474415	a2146ef5-2cae-4c93-9117-f31abc6b6fd3	Miss  Lukyamuzi Benard	cm82024105zzfg@client.mtmicrofinance.ug	+256777177166	CM82024105ZZFG	1984-09-12	No Address	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-04-20 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-04-20 12:00:00+03	[]	528000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d0175b77-b2e0-489e-b802-e86b3ebb375e	Not Insured
f7949717-1d4d-4375-99e0-f34e2fe02191	dcc9a568-ca90-4086-8acb-a890de378ec6	Ms.  Namakula Teddy	cf6705210apnng@client.mtmicrofinance.ug	+256759247777	CF6705210APNNG	1967-07-27	No Address	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-04-20 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-04-20 12:00:00+03	[]	550000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d0175b77-b2e0-489e-b802-e86b3ebb375e	Not Insured
ea2f999f-554d-43ba-8e75-4a797de43600	3c73c383-8ec0-4c00-899f-ad62420c3652	Mrs.  Nalubega Resty	cf920911047jhk@client.mtmicrofinance.ug	+256744815991	CF920911047JHK	1992-07-09	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-07-12 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-07-12 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	8e1e3988-cc33-489f-9281-619768da5c9f	Not Insured
8457d4ce-e4ed-4c04-a4a3-3b5952f257bb	64c8a075-1c89-4ad8-8b55-4aab2ed94b6e	Mr.  Bwire Dennis	cm920421060p9f@client.mtmicrofinance.ug	+256707509765	CM920421060P9F	1992-01-01	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-07-12 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-07-12 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	8e1e3988-cc33-489f-9281-619768da5c9f	Not Insured
04df9914-3924-49e9-af67-76b04a7cb61b	c3276837-c252-4477-9cf1-f8542184445b	Mrs.  Namale Patricia	cf9205210e55ya@client.mtmicrofinance.ug	+256749081506	CF9205210E55YA	1992-05-30	Kasangati, Wakiso	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-07-03 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-07-03 12:00:00+03	[]	444000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	4e992323-c883-4096-81d6-14d44b847dd0	Not Insured
6a1aa40f-6113-41e4-b8e8-7133fd4159c4	cf288872-d7a0-4a36-8b86-509eab5f1146	Mrs.  NALUKENGE SHAKIRAH	cm8500703trnc@client.mtmicrofinance.ug	+256704631464	CM8500703TRNC	1900-01-01	NAKWERO	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:44:37.007847+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:44:37.007847+03	[]	681000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	a8d609dc-d32c-4d75-844b-be1bb6990a9e	Not Insured
874ac69f-41fa-40eb-a684-e649ae3201f3	0bba5d6f-ed71-4231-bf9a-3c39fc5891e9	Mrs.  Lumumba Naume	cf79065102dwak@client.mtmicrofinance.ug	+256745050039	CF79065102DWAK	1979-11-29	Manyangwa	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-07-03 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-07-03 12:00:00+03	[]	501000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	4e992323-c883-4096-81d6-14d44b847dd0	Not Insured
997aa150-7fd6-4d22-9d43-60928fafe558	5e644294-bbc4-4a20-9bbf-c4942fb30855	Mrs.  Namuganyi Hanifah	cf82012106t6vc@client.mtmicrofinance.ug	+256700985507	CF82012106T6VC	1982-08-23	Manyangwa	Group Loan	300000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-07-03 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-07-03 12:00:00+03	[]	320000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	4e992323-c883-4096-81d6-14d44b847dd0	Not Insured
4acfa01e-82b6-4b7d-b09b-0ed0fb47c4d2	67c7f30a-edd9-4e78-8a0e-a291100d130c	Mrs.  Mukamwezi Specioza	cf640451053k1h@client.mtmicrofinance.ug	+256708923270	CF640451053K1H	1964-06-02	Kyetume	Group Loan	300000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-07-03 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-07-03 12:00:00+03	[]	390000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	4e992323-c883-4096-81d6-14d44b847dd0	Not Insured
e9aaabf8-2fa3-4bf2-b8b4-de73f2ad1e66	1f41e482-6eea-47ee-bfba-64f0081a27f7	Mrs.  Nakiwala Shamim	cf86052101clhf@client.mtmicrofinance.ug	+256708586620	CF86052101CLHF	1986-04-09	Manyangwa	Group Loan	300000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-07-03 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-07-03 12:00:00+03	[]	351000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	4e992323-c883-4096-81d6-14d44b847dd0	Not Insured
918d64f7-bc19-4635-84f3-aa5edd881dd8	bed2d06e-02dc-4528-ab7b-4e105586555d	Mr.  AMUDA FRED	cm82032104qy5j@client.mtmicrofinance.ug	+256700682118	CM82032104QY5J	1982-12-28	MAGIGYE, BUSUKUMA DIVISION WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-02-01 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-02-01 12:00:00+03	[]	681000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	b48f3ac7-e107-4718-82c7-0d599fb08c44	Not Insured
cd421a86-24a5-4f2a-b324-b922ed28d7ed	2f702b6c-88fe-4fc8-81cd-7d572f7204ea	Mr.  KOMODO MUTWAIFU	cm91035106z80k@client.mtmicrofinance.ug	+256751724397	CM91035106Z80K	1991-10-10	KASANGATI, NANGABO WAKISO DISTRICT	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-07-09 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-07-09 12:00:00+03	[]	400000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	b48f3ac7-e107-4718-82c7-0d599fb08c44	Not Insured
fbc570f2-0d87-45e5-a691-913e107f339b	51324718-d8fe-421b-9639-3c3e8e361a08	Mr.  Magero Steven	cm0004910hj68k@client.mtmicrofinance.ug	+256743718765	CM0004910HJ68K	2000-01-02	Kasangati, Wakiso	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-07-04 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-07-04 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	24dee5de-8b9a-4adc-8d62-164637640ade	Not Insured
58eebfbf-8669-4ac7-b397-4c6b92e3461a	647a29ae-984b-4c00-a7fc-b3b26ad11516	Mr.  Owori Simon	cm82039101zy2c@client.mtmicrofinance.ug	0000000000	CM82039101ZY2C	1982-10-19	Kasangati, Wakiso	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-07-04 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-07-04 12:00:00+03	[]	328000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	24dee5de-8b9a-4adc-8d62-164637640ade	Not Insured
89beb8c6-d1fc-4857-9514-30d2a28bb8d4	ddf3ca1c-43a0-4636-bb34-5e75b50f6ec7	Mr.  Musoke Ronald	cm9205210dj0th@client.mtmicrofinance.ug	+256757126377	CM9205210DJ0TH	1992-06-15	Kasangati, Wakiso	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-07-04 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-07-04 12:00:00+03	[]	615000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	24dee5de-8b9a-4adc-8d62-164637640ade	Not Insured
cb202328-d8de-484f-aee9-70345e437d9f	b711c25d-dbf7-40af-a408-2b6d40d0d11b	Mr.  Mukiibi Livingstone	cm8502310qk5tl@client.mtmicrofinance.ug	+256700656667	CM8502310QK5TL	1985-05-05	Kasangati, Wakiso	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-07-04 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-07-04 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	24dee5de-8b9a-4adc-8d62-164637640ade	Not Insured
712514ed-b2c0-4a62-91e0-623767ba0002	8a825829-e643-47c7-984c-9fd0684edbec	Mr.  KUBUNGA JOHNSON	cm9605210ezwga@client.mtmicrofinance.ug	+256741425274	CM9605210EZWGA	1996-12-14	KASANGATI	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-08-14 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-08-14 12:00:00+03	[]	225000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	9e9209b1-3ccf-40d6-882a-57dbff88623d	Not Insured
5cf4e163-795c-48d2-b7df-dc063ee13f21	6899dfe9-e78c-4b95-8f49-fa748a6d4eaf	Mr.  OKIRU PAUL	cm96032103mt2c@client.mtmicrofinance.ug	+256757260816	CM96032103MT2C	1996-04-30	KASANGATI	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-08-14 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-08-14 12:00:00+03	[]	198000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	9e9209b1-3ccf-40d6-882a-57dbff88623d	Not Insured
12d1dbe4-b26d-4c60-a8f2-e172a8df6a26	40544e40-e93c-4187-82b6-001579b8c5d0	Mr.  MUBIRU KENNETH	cm0105210zdzxl@client.mtmicrofinance.ug	+256755790570	CM0105210ZDZXL	2001-03-18	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-01-31 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-01-31 12:00:00+03	[]	675000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d736eba4-ded0-47d6-b2a3-b138422f1c17	Not Insured
99833a2b-ae3c-4754-a4f6-45d3ee5d62b3	b5f06348-0e06-4d36-95b5-c6fa406073ec	Mr.  BUSUKWA MARK	cf00052104qe5k@client.mtmicrofinance.ug	+256705864413	CF00052104QE5K	1982-04-13	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-01-31 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-01-31 12:00:00+03	[]	675000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d736eba4-ded0-47d6-b2a3-b138422f1c17	Not Insured
9be26caa-25e2-42bf-9666-d9882fccfc6b	e94f7f5d-0e9e-4d19-9654-0a930719aa96	Mrs.  Tumwesigye Betty	cf74036104c43c@client.mtmicrofinance.ug	+256701399320	CF74036104C43C	1974-08-15	Kireka D	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-07-21 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-07-21 12:00:00+03	[]	32000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	cd9ec41e-e172-4c25-a610-0e4f24dae739	Not Insured
5626f0b6-8fac-4830-8c54-ca3384068b18	b7bcec83-dfc6-4c1c-a610-71e9fd1fbcae	Mrs.  Lunyoro Sarah	cf6603210583na@client.mtmicrofinance.ug	+256757081381	CF6603210583NA	1966-01-01	Kiwalimu	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-07-17 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-07-17 12:00:00+03	[]	349000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	5b16a75f-7136-43e4-8368-19c4ffc3b753	Not Insured
3693dc9e-3a43-4567-933a-8f0e1ecc2e22	3a9ef6a3-cc78-4843-ab3c-bf6c385f475a	Mr.  AHEEBWA ANDREW	cm98010103qdjf@client.mtmicrofinance.ug	+256758504583	CM98010103QDJF	1998-02-14	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-05 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-09-05 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	614c86c9-588f-46e8-9e16-85d10eb41f14	Not Insured
eaab080a-a032-421a-b2b4-60abfc053ba0	bed75958-afc3-4416-ba42-1f45c33e9cbb	Mr.  Kasule Eddy Ssebunya	cm7905210f83ng@client.mtmicrofinance.ug	+256706925093	CM7905210F83NG	1979-01-13	Kasangati	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-07-27 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-07-27 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	648a03b9-9a35-4988-a6b3-0d697b8de65a	Not Insured
3c2ea4e0-3158-44b3-84a4-9cb2d7420515	78b24b3d-1fdd-4933-abaa-54e1b36a80d6	Mr.  Lyazi Robert	cm72052109j82g@client.mtmicrofinance.ug	+256756712553	CM72052109J82G	1972-03-16	Bulamu	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-07-27 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-07-27 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	648a03b9-9a35-4988-a6b3-0d697b8de65a	Not Insured
d1e8ad86-1ac8-4308-939a-500d813f98a0	ca2c1342-3c5e-4b57-9ff0-770e8ce7f2cc	Mr.  Kiyimba Charles	cm75036108qx6l@client.mtmicrofinance.ug	+256701179703	CM75036108QX6L	1975-09-09	Namayina	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-05 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-09-05 12:00:00+03	[]	520000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	34e9c736-1164-4c92-8c6e-0201dd12d1ea	Not Insured
2ce5b33a-6578-4216-9b64-cffe1b893e21	7d773bac-a546-4182-bca3-de42b340a8e5	Mrs.  Nalunkuuma Justine Grace	cf060521144zej@client.mtmicrofinance.ug	+256705322913	CF060521144ZEJ	2006-11-27	Namayina	Group Loan	300000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-05 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-09-05 12:00:00+03	[]	390000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	34e9c736-1164-4c92-8c6e-0201dd12d1ea	Not Insured
9c61c5fe-d77f-4832-b3c7-024955542f06	81352995-d9ed-4777-8b5a-01abb7f1745a	Mr.  Lutaaya Sulait Eric	cm04052113dyqj@client.mtmicrofinance.ug	+256746685591	CM04052113DYQJ	2004-12-18	Namayima	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-05 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-09-05 12:00:00+03	[]	520000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	34e9c736-1164-4c92-8c6e-0201dd12d1ea	Not Insured
43f8592e-a80b-4b07-8f91-393d6467f537	4448f396-f9b2-4ce7-831d-25832cfb2913	Mr.  BYARUHANGA ALEX	cm960102e6cc@client.mtmicrofinance.ug	+256706991881	CM960102E6CC	2025-06-18	Gayaza, Kasangati	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-26 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-26 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	405af9d4-2949-4229-9069-6ae04aff939a	Not Insured
9b9d1627-edb1-4213-92dd-495c288fc7c4	7af94da8-f9c7-4c68-ae1a-07d63cfef22b	Mrs.  NAKABUGO ANNET	cf65023103yxjg@client.mtmicrofinance.ug	+256750778022	CF65023103YXJG	1900-01-01	KIJABIJO B, KIRA TOWN COUNCIL WAKISO DISTRICT	Group Loan	300000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:45:12.014926+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:45:12.014926+03	[]	390000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	cd9ec41e-e172-4c25-a610-0e4f24dae739	Not Insured
3099ae66-bf2c-47d9-acf4-4cef281bac72	a8d7e41b-dd4a-4879-8968-180f86d1f43e	Mr.  KALIRO ABBEY	cm80494104tehf@client.mtmicrofinance.ug	+256756426170	CM80494104TEHF	1900-01-01	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:42:11.812515+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:42:11.812515+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c51d4850-a604-47f2-85a4-621db6f6aa76	Not Insured
e3271c4e-580e-4f56-af30-520f2df7e6ea	9cc5c271-1552-4c24-978d-5897036932de	Mr.  LUWAGA MUSA	cm74032104tp3h@client.mtmicrofinance.ug	+256703433281	CM74032104TP3H	1900-01-01	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:42:13.133969+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:42:13.133969+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c51d4850-a604-47f2-85a4-621db6f6aa76	Not Insured
ad39b47c-cce9-49cf-8ce8-72a25ee055a5	87ad863b-9d24-4e06-94e8-6ad589708b8b	Mr.  SSEKIDE HASSAN	cm97047103vzmj@client.mtmicrofinance.ug	+256741002924	CM97047103VZMJ	1900-01-01	Nanagabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:42:15.644628+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:42:15.644628+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c51d4850-a604-47f2-85a4-621db6f6aa76	Not Insured
c183c1a3-ccba-4c91-9697-68f53bee490a	c1a74313-2697-4c07-ab2e-08a13597b989	Mr.  MAGAMBA RODGERS	cm98083101l33c@client.mtmicrofinance.ug	+256751853347	CM98083101L33C	1995-03-08	GAYAZA,KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-20 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-20 12:00:00+03	[]	163000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	4259a83d-7260-4a55-b3de-d05cd914db40	Not Insured
f3086b1b-f49a-45e3-81b4-ee5b994c3afb	a4806da8-f4b3-4107-84d3-0f77ee9cbbcf	Mr.  MULINDWA WILSON	cm9903210moufc@client.mtmicrofinance.ug	+256755526440	CM9903210MOUFC	1999-01-23	No Address	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-03-01 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-03-01 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	44b99547-1017-41cb-b574-854c2a3404c0	Not Insured
404da766-0f11-46f3-a109-71c03810dd2c	03c5847f-9e49-46ff-89b9-572b3e48bfee	KAFEERO ALLAN	cm920521096e6d@client.mtmicrofinance.ug	+256705728546	CM920521096E6D	1992-07-01	Kasangati	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-03-01 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-03-01 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	44b99547-1017-41cb-b574-854c2a3404c0	Not Insured
e3ec23f0-3d90-44cd-8183-4d0b956dcf75	08b452b9-eca3-4c85-a79d-a16d6740e53e	Mr.  OWEMBABAZI RODGERS	cm97009102mghl@client.mtmicrofinance.ug	+256709465941	CM97009102MGHL	1997-07-07	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-03-10 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-03-10 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	471782b5-3337-45f2-812e-bb1fa1e589ea	Not Insured
1d09ba40-19cb-4662-9db8-0ae94b12147c	30861a5d-8175-4f1b-a8a1-cbe75ac512cd	Mr.  LUGWANA ANTHONY	cmooo8210e9a4x@client.mtmicrofinance.ug	+256740718690	CMOOO8210E9A4X	2000-01-12	Kasangati	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-03-10 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-03-10 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	471782b5-3337-45f2-812e-bb1fa1e589ea	Not Insured
0700698d-b21a-4054-ae22-e0595d6b1578	e4fb1c94-f4dd-4d86-a7be-69536d578546	Mr.  SSEKIYUVI WILBERFORCE	cm76023100lvpf@client.mtmicrofinance.ug	+256704534271	CM76023100LVPF	1976-01-12	KASANGATI	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-09 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-07-09 12:00:00+03	[]	920000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	471782b5-3337-45f2-812e-bb1fa1e589ea	Not Insured
28027c27-6a9c-4df2-ba94-8b09562ace64	adb48db7-be4e-417c-aebc-f4608deaae33	Mrs.  nalubega prossy	cm682012610hut@client.mtmicrofinance.ug	+256785638918	CM682012610HUT	1992-08-06	Kasangati, Wakiso	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-08-06 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-08-06 12:00:00+03	[]	616000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	4ccdf462-a8c2-4c25-a178-d433511bd936	Not Insured
3c5f250f-6f2e-4373-96ab-7b181deeeff7	c273e6c8-d88a-494e-974c-9bb6073b6823	Mr.  BAMUGYE SIPERITO	cm85032104lphk@client.mtmicrofinance.ug	+256702033965	CM85032104LPHK	1985-01-01	KASANGATI, NANGABO WAKISO DISTRICT	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-25 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-25 12:00:00+03	[]	889000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	b48f3ac7-e107-4718-82c7-0d599fb08c44	Not Insured
1db57fbe-659c-4966-8d5e-b27059ed2cbe	48f55493-1190-4e86-b4e4-d3fa3f26b8a0	Mrs.  NAKAYIZA LILLIAN	cf95068105w3hc@client.mtmicrofinance.ug	+256708073912	CF95068105W3HC	1995-07-14	NAKASAJJA, KYAMPISI NUKONO DISTRICT	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-25 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-25 12:00:00+03	[]	777000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	b48f3ac7-e107-4718-82c7-0d599fb08c44	Not Insured
08c93ffe-27f0-47ac-9815-7432cf9eb434	264e0eac-0e4b-42da-b03d-4f23c7f272f7	Mr.  SEMPEBWA CAPRIAM	cm87052105l5tc@client.mtmicrofinance.ug	+256706159030	CM87052105L5TC	1987-11-12	GAYAZA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-03-22 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-03-22 12:00:00+03	[]	677000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	7a5366a4-d167-40f2-9d1d-af7a716ceb8c	Not Insured
6129f091-75d9-4fe6-92ac-65cdc49da302	31a4c41c-290f-4f21-b04d-ebb5a2c470ae	Mrs.  NANKUMBA SARAH	cf92047105y81a@client.mtmicrofinance.ug	0000000000	CF92047105Y81A	1992-10-02	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-01 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-05-01 12:00:00+03	[]	105000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	ceacef27-27e8-499d-acb2-3f2da47b7c07	Not Insured
2be3cec2-d3af-4f50-8297-1bad3e9d4919	f274088a-733f-4d0d-aff9-7c259af09afb	Mr.  KASUJJA MICHAEL	cm9405210c7gqd@client.mtmicrofinance.ug	+256742245035	CM9405210C7GQD	1994-01-10	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-02-01 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-02-01 12:00:00+03	[]	70000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	ceacef27-27e8-499d-acb2-3f2da47b7c07	Not Insured
eb6e66b7-a28f-4d11-8b6b-e11ea828f475	71a9a58d-ad1c-46d1-b9ed-2e8a4b2dedc2	Mrs.  AWORI VIVIAN	cf0303910lyrxh@client.mtmicrofinance.ug	+256709523727	CF0303910LYRXH	2005-05-16	Bulamu	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-04-29 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-04-29 12:00:00+03	[]	35000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	ceacef27-27e8-499d-acb2-3f2da47b7c07	Not Insured
41f3d8ef-aa0b-40a6-8a03-fb2117ad6245	11239e65-53f4-458d-ac9b-7714ea883a88	MUSISI PHILLIP	cm91052105jpqj@client.mtmicrofinance.ug	+256707213827	CM91052105JPQJ	1991-10-11	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-02 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-05-02 12:00:00+03	[]	105000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	ceacef27-27e8-499d-acb2-3f2da47b7c07	Not Insured
b5900987-5234-42b3-be6a-d0c863eadd80	4f089b15-9797-4f80-abd0-b1cf462164b7	Mrs.  NAKASI MAYI	cm85047103nafe@client.mtmicrofinance.ug	+256740688264	CM85047103NAFE	1985-06-18	GAYAZA B, NANGABO	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-02 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-05-02 12:00:00+03	[]	672000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	bf94289c-b286-4f94-967d-c549f2af2fae	Not Insured
72dc7d44-245d-48b2-9496-1318567e69b4	8d6d3cf9-279d-437e-9bec-5522dc57ecd8	MUGISHA JUMAH	cm82112101f01d@client.mtmicrofinance.ug	+256740768757	CM82112101F01D	1982-07-07	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-02 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-05-02 12:00:00+03	[]	665000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	bf94289c-b286-4f94-967d-c549f2af2fae	Not Insured
4b0aafb9-4335-4be9-84b2-f07cfa221527	5dcb8cc6-092b-411e-9c7a-33fc3430da19	Mukasa Sarah	cf83032100dmda@client.mtmicrofinance.ug	+256755376120	CF83032100DMDA	1983-11-27	Gayaza	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-02 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-05-02 12:00:00+03	[]	520000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	bf94289c-b286-4f94-967d-c549f2af2fae	Not Insured
8626ac84-3635-4cb7-860b-58a2158457b5	910517eb-7bf3-478e-8bf4-d9efac6d156a	NANSEREKO JANE	cf710231046p7l@client.mtmicrofinance.ug	+256757896262	CF710231046P7L	1971-01-29	No Address	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-02 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-05-02 12:00:00+03	[]	665000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	bf94289c-b286-4f94-967d-c549f2af2fae	Not Insured
618b9895-f247-411c-8553-bab117a64e72	34a8d472-c408-42af-910e-87fac92ae39d	Katende Stanley	cm860241012wme@client.mtmicrofinance.ug	+256747741502	CM860241012WME	1986-07-27	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-07 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-05-07 12:00:00+03	[]	100000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	6f710c7a-ec68-4ead-aef1-0048e57b7ad8	Not Insured
ab61de1b-e467-4d74-b9de-0a7a37cef69c	0d2be050-554d-4c8c-87c4-2bdfc12f1d25	Mr.  Tuhirwe Roland	cm93034105qykc@client.mtmicrofinance.ug	+256741417096	CM93034105QYKC	1993-03-01	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-07 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-05-07 12:00:00+03	[]	50000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	6f710c7a-ec68-4ead-aef1-0048e57b7ad8	Not Insured
122ad36b-2cd3-41fa-8783-9e05fce0dced	c492f8a1-aa7b-44a9-9aca-4fe746f65a03	Mr.  WADADA YISUFU	cm9505110cpf4c@client.mtmicrofinance.ug	+256755018652	CM9505110CPF4C	1995-09-18	KASANGATI, NANGABO WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-03 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-03 12:00:00+03	[]	164000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	a6cdb14e-5e38-4ee6-afa8-b1575154c136	Not Insured
81b23010-d32b-4435-b216-710507193d30	a7837d7a-64f8-42aa-9cfa-2aab4dcc4ec8	Mr.  AWUMA MUGWERI	cm94008101rmqk@client.mtmicrofinance.ug	+256741830588	CM94008101RMQK	1994-04-17	NALYAMAGONYA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-03 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-03 12:00:00+03	[]	164000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	a6cdb14e-5e38-4ee6-afa8-b1575154c136	Not Insured
d63c6468-1788-4409-a0ae-c0fbd3d289cc	e32aceb9-4076-4237-900f-cf4d9da6d6e2	Mr.  MUGONYA ZAAKE	cm95013104gd8f@client.mtmicrofinance.ug	+256700570328	CM95013104GD8F	1995-06-12	GAYAZA, KASANGATI WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-03 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-03 12:00:00+03	[]	200000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	a6cdb14e-5e38-4ee6-afa8-b1575154c136	Not Insured
cbce8279-55c7-45e6-be17-f0294b9e9b13	e7296c86-b5b9-430a-95b6-198d3db640a1	Mr.  BUTUTU PETER	cm97075108rhwc@client.mtmicrofinance.ug	+256752085271	CM97075108RHWC	1997-10-23	NALYAMAGONYA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-03 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-03 12:00:00+03	[]	123000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	a6cdb14e-5e38-4ee6-afa8-b1575154c136	Not Insured
e21c5051-51cc-478b-938e-108a84ab6a4a	55169c02-5e08-455d-becb-59f54537a2ec	Mr.  ASIIMWE RODGERS	cm0301810awmmlh@client.mtmicrofinance.ug	+256706510144	CM0301810AWMMLH	2003-06-30	NAMAYINA, KABUBBU WAKISO	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-03 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-03 12:00:00+03	[]	620000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	a3c98617-1f5f-46e7-babb-9b007b1eb35d	Not Insured
9efb6cf8-0108-4457-a4d6-97e24693bc2d	00907018-52fd-4e4c-b407-3b3197259e18	Mr.  AMANYA GODON	cm9500916ccexg@client.mtmicrofinance.ug	+256758902127	CM9500916CCEXG	1995-09-21	NAMAYINA, KABUBBU WAKISO	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-03 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-03 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	a3c98617-1f5f-46e7-babb-9b007b1eb35d	Not Insured
0fc0ba94-5940-427c-b19c-0ffaa7c84972	649a6d37-6adf-42cc-ba85-05b54a1a49af	Mrs.  KAYESU ANNET	cm88061100116g@client.mtmicrofinance.ug	+256703485542	CM88061100116G	1988-09-10	KASANGATI, NANGABO WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-19 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-05-19 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	1b2c3c7a-b249-49cd-a364-a02e83e15a55	Not Insured
93f59f1a-5fe5-41e9-a41e-a62388bdd1db	6308d515-11b8-4795-adf0-1b76fd753da4	Mrs.  NALUBEGA SARAH	cm860231081m7g@client.mtmicrofinance.ug	+256755011051	CM860231081M7G	1986-06-12	KASANGATI, NANGABO WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-19 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-05-19 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	1b2c3c7a-b249-49cd-a364-a02e83e15a55	Not Insured
cc673ad8-4abb-4ebc-9a9c-ce76095572d0	c8a8f446-97ed-44d9-9282-eaedc0f90cc0	Mr.  NASASIRA ALEX	cm900521dlv4f@client.mtmicrofinance.ug	+256709549257	CM900521DLV4F	1990-07-25	KASANGATI, NANGABO WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-18 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-05-18 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	1b2c3c7a-b249-49cd-a364-a02e83e15a55	Not Insured
f6cc2088-71d1-4ade-976c-0e164a910372	b65df48a-8d01-4a56-abe1-cbad8c41a2c2	Mrs.  NAKALEMA SANDRA	cm9608210978pd@client.mtmicrofinance.ug	+256742782235	CM9608210978PD	1996-06-07	GAYAZA, NANGABO WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-19 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-05-19 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	1b2c3c7a-b249-49cd-a364-a02e83e15a55	Not Insured
b1b0dff6-bbd7-4b05-ba76-938da7a51a10	eca234e2-2369-4603-8266-ec56bb922d68	Mr.  LUWANGA EMMANUEL	cm84052104x4yj@client.mtmicrofinance.ug	+256755122254	CM84052104X4YJ	1984-12-24	KASANGATI, NANGABO WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-19 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-05-19 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	1b2c3c7a-b249-49cd-a364-a02e83e15a55	Not Insured
eae30a4e-1fc0-46b0-ac0f-36cc55555e24	f9b054d9-ffdd-4cda-983e-5d1d72af5748	Mr.  SENDIJJA OWEN	cm0105210xgg7e@client.mtmicrofinance.ug	+256709804550	CM0105210XGG7E	2001-06-11	NAMAYINA JOLWE, KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-21 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-21 12:00:00+03	[]	405000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	e8758606-77ae-4657-a77f-a0442f0f2bf4	Not Insured
cf44e2a2-fa25-4263-9a61-4ae824cef62a	c5af0695-b0cf-4173-b366-67a0fd11b88e	Mrs.  NAMULI HAJALA	cm91052107ypng@client.mtmicrofinance.ug	+256740686007	CM91052107YPNG	1900-01-01	KIJABIJO C	Group Loan	600000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:43:37.009716+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:43:37.009716+03	[]	198000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	cd9ec41e-e172-4c25-a610-0e4f24dae739	Not Insured
09ed8a35-28ed-47e2-ace6-d7ce3fdcbe2c	d4e939f3-e7d4-4f56-a34c-d4a7a03e8ddc	Mr.  KATONGOLE ROBERT	cm86047105y83d@client.mtmicrofinance.ug	+25675700426369	CM86047105Y83D	1986-10-08	BUYINGA, NANGABO WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-03 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-03 12:00:00+03	[]	481000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	8c06799b-85ee-4dd2-abee-005db62f8fa0	Not Insured
8e3b7966-6311-45ae-af5d-fb657c16c5f4	74906efd-6b7e-42d5-899b-3efc69351f30	Mr.  NYANZI BASHIR SENTAMU	cm96099102tkfd@client.mtmicrofinance.ug	+256701685384	CM96099102TKFD	1996-04-22	GAYAZA, KASANGATI WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-03 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-03 12:00:00+03	[]	465000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	8c06799b-85ee-4dd2-abee-005db62f8fa0	Not Insured
f93583c9-cd68-4a04-9653-7ae7ce265d5d	01e22d26-83e2-4c82-9fbc-14be066b9357	Mr.  SENYONDO DEO	cm86023109kq0g@client.mtmicrofinance.ug	+256757947598	CM86023109KQ0G	1986-06-01	GAYAZA, NANGABO WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-02-18 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-02-18 12:00:00+03	[]	690000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	bf7147f5-a11f-49a2-8577-3d1b572d10e5	Not Insured
3fb8c986-9d88-40a5-8101-e2e9cfaab7dc	56feab29-5095-4735-99ac-186fc216123f	Mr.  ISOOBA EMMANUEL	cm98008105l3nh@client.mtmicrofinance.ug	+256752634444	CM98008105L3NH	1986-05-25	GAYAZA, KASANGATI WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-02-18 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-02-18 12:00:00+03	[]	691000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	bf7147f5-a11f-49a2-8577-3d1b572d10e5	Not Insured
a6ec3322-2442-4549-b186-6783cf28d149	bf484958-aee1-4898-ad55-f2c3e09a3dbb	Mr.  SSEKABIRA FRANCIS	cm9902410cjjjk@client.mtmicrofinance.ug	+256756477601	CM9902410CJJJK	1999-06-03	BULAMU	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-16 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-16 12:00:00+03	[]	573000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	bf7147f5-a11f-49a2-8577-3d1b572d10e5	Not Insured
9cbb21a4-ecb4-4484-bb8d-2b60ffcfdabe	62d99bb5-329f-4bfc-b0eb-45371fef45d1	Mr.  KIWADUKA MOSES	cm93032108ec7l@client.mtmicrofinance.ug	+256708387597	CM93032108EC7L	1993-06-02	GAYAZA, KASANGATI WAKISO DISTRICT	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-16 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-16 12:00:00+03	[]	434000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	bf7147f5-a11f-49a2-8577-3d1b572d10e5	Not Insured
e24ca864-474b-44f1-bfda-7b90c6cb6cb5	340731f3-7f00-4321-aba6-f71749990f88	Mr.  KAMERI VENANSIO	cm7001710a4uad@client.mtmicrofinance.ug	+256748561101	CM7001710A4UAD	1970-02-01	KASANGATI, NANGABO WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-04 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-04 12:00:00+03	[]	680000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	cb0420d4-9543-4e7b-9b43-7f664f88b632	Not Insured
ef84be8a-27ac-479c-911f-6c9b2532e0ef	93b006f4-5bc5-4128-b809-c3ef3d1fcff0	Mr.  KAYINGI ALEX	cm8903610cclrl@client.mtmicrofinance.ug	+256701820570	CM8903610CCLRL	1900-01-01	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:44:07.236541+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:44:07.236541+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	14b9f030-7e64-4c4e-bbe5-e62afc5fb75d	Not Insured
656e5908-6d09-4f45-849d-a496ba5702bb	a47b657c-9c3d-438e-9f7e-d0f1a3b64fa9	Mr.  OJUKA TONNY	cm89022101upmh@client.mtmicrofinance.ug	+256743508639	CM89022101UPMH	1900-01-01	KASANGATI	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:44:08.633022+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:44:08.633022+03	[]	560000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	14b9f030-7e64-4c4e-bbe5-e62afc5fb75d	Not Insured
365b2044-73ba-4e9c-b9e4-bacc7648708e	02b0f6e5-3f63-491a-b954-daace6346205	Mr.  Ssenkungu Ronald	cm790304ly3d@client.mtmicrofinance.ug	+256753117971	CM790304LY3D	1900-01-01	Nangabo	Individual Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:44:26.620794+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:44:26.620794+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
1c13fb6d-190a-4d69-9a18-6f7617b41086	461d76e8-03a5-4ddc-8021-b89f84d1fcb1	Mrs.  KARUNGI JULIET	cm9605210gl93k@client.mtmicrofinance.ug	+256743885283	CM9605210GL93K	1900-01-01	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:44:33.185612+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:44:33.185612+03	[]	681000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	a8d609dc-d32c-4d75-844b-be1bb6990a9e	Not Insured
836c70ff-02bc-4f6c-8abe-2bff8ec43288	51fba39e-a0f8-4d52-ad30-709cea8a5697	Mrs.  NANONO PERAGIA	cf9301210342kd@client.mtmicrofinance.ug	+2567512457171	CF9301210342KD	1900-01-01	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:44:34.453236+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:44:34.453236+03	[]	680000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	a8d609dc-d32c-4d75-844b-be1bb6990a9e	Not Insured
06c020cc-97e7-4140-a728-17ec663c785e	9694dc5a-5796-40c3-9968-ae576b8fa9be	Mrs.  KOBUSINGYE SHEEBAH	cf9804810da81e@client.mtmicrofinance.ug	+256708337483	CF9804810DA81E	1998-11-11	NAKWERO	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-28 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-05-28 12:00:00+03	[]	695000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	5b16a75f-7136-43e4-8368-19c4ffc3b753	Not Insured
8bcc19aa-88e9-49cf-ac77-3fd20ec1732f	aed117fe-2ffa-46da-99a0-144dcb8463ba	Mrs.  NAMUBIRU FATUMA	cf9302310m6n2f@client.mtmicrofinance.ug	0000000000	CF9302310M6N2F	1993-02-03	KASANGATI	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-18 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-18 12:00:00+03	[]	81000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	6349d69f-f2c3-46eb-9b43-c38417e7d037	Not Insured
cbd20c45-9ff8-4189-99cb-5683e916313d	0c8d7586-4a65-435c-9941-7399e08929bc	Mr.  KALO ROBERT	cm9207510325qe@client.mtmicrofinance.ug	+256700712733	CM9207510325QE	1992-09-05	KASANGATI	Group Loan	800000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-02-18 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-02-18 12:00:00+03	[]	693000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	14b9f030-7e64-4c4e-bbe5-e62afc5fb75d	Not Insured
afb016b5-8d4a-44fd-a47e-cd5a3d19a62b	a08a66cb-762e-4949-b8a7-ed1ce6e49329	Mrs.  NAKKAZI JUSTINE	cf6904134m2612273uga1@client.mtmicrofinance.ug	+256757124727	CF6904134M2612273UGA1	1969-04-13	MANYANGWA	Group Loan	300000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-04-19 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-04-19 12:00:00+03	[]	125000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	96266550-e755-4ded-be8f-9492f8682ca1	Not Insured
8fa5661a-b70c-4e17-b666-c6a3e9b65280	70f9bd68-d0f5-4459-96eb-e158b87224ea	Mrs.  NANYONGA DOROTHY	cf73012103r3vj@client.mtmicrofinance.ug	+2567081770339	CF73012103R3VJ	1973-04-03	MANYANGWA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-04-19 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-04-19 12:00:00+03	[]	205000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	96266550-e755-4ded-be8f-9492f8682ca1	Not Insured
bd383048-e0f2-4761-84b9-33b174cee1ed	547bb2d1-1fe2-481a-9d54-7707a1549637	Mrs.  NANJEGO SHAMIM	cf8905210djptk@client.mtmicrofinance.ug	+256752181084	CF8905210DJPTK	1989-12-06	MANYANGWA	Group Loan	300000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-04-19 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-04-19 12:00:00+03	[]	125000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	96266550-e755-4ded-be8f-9492f8682ca1	Not Insured
50632819-0ff1-4c03-a1d3-64083d5f7a2a	6bbb447b-bae9-4561-881a-7bbe3e421eae	Mrs.  NAKKAZI AISHA	cf840521031d4l@client.mtmicrofinance.ug	+256703589587	CF840521031D4L	1984-05-10	MANYANGWA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-04-19 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-04-19 12:00:00+03	[]	235000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	96266550-e755-4ded-be8f-9492f8682ca1	Not Insured
ac46a162-8451-45da-91ce-9bb17dc9090b	a84b8e25-b11a-49f3-b8fc-43110b003ae2	Mrs.  NANSAMBA RITAH	cf8403610465qh@client.mtmicrofinance.ug	+256752090158	CF8403610465QH	1984-07-12	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-11-26 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-11-26 12:00:00+03	[]	27000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c00cf54c-75c1-495a-9b4f-d6b83ed4f22a	Not Insured
70b77b0e-5394-42b2-967b-ec53986de817	4aae52fd-276c-4764-9e01-e01a6ff197b0	Mrs.  NABUNJE RUTH	cf93031102k97c@client.mtmicrofinance.ug	+256701359484	CF93031102K97C	1993-02-20	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-11-26 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-11-26 12:00:00+03	[]	27000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c00cf54c-75c1-495a-9b4f-d6b83ed4f22a	Not Insured
a0960c94-885f-4ea4-904b-ff5d6c587cd9	0165b499-c223-40a2-8906-bfc9e90bd1f9	Mrs.  NDAGIRA MAYIMUNA	cf930521087kze@client.mtmicrofinance.ug	+256750933803	CF930521087KZE	1993-05-11	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-11-26 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-11-26 12:00:00+03	[]	97000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c00cf54c-75c1-495a-9b4f-d6b83ed4f22a	Not Insured
8413391f-961c-4a32-8751-65bafb5ec91f	4a53c947-ce66-4a96-ab80-3a63060cdd51	Mrs.  MUGERWA TEOPISTA	cf770321013amg@client.mtmicrofinance.ug	+256706800080	CF770321013AMG	1900-01-01	KASANGATI	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:44:44.731436+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:44:44.731436+03	[]	928000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	bf9c113b-c0b1-4f36-ab33-64d862714bd9	Not Insured
9c3be5fa-a5fd-43e3-81d2-a8cbf4dd4228	579005b5-ffd5-45fc-a4ce-beda75c6d307	Mrs.  NABANJALA AISHA	cf92012100yc9j@client.mtmicrofinance.ug	+256706664571	CF92012100YC9J	1900-01-01	NALYAMAGONJA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:44:49.703364+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:44:49.703364+03	[]	455000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	04dd5726-ad7c-439b-a3da-7ce549727c4c	Not Insured
1263b764-ea02-4d57-89d0-24fc3bf467ed	f05dadc0-897c-478f-83f0-f4e29bca7e43	Mrs.  KATATUMBA SUSAN	cf7305210996ee@client.mtmicrofinance.ug	+256744771244	CF7305210996EE	1973-11-10	NALYAMAGONJA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-04-03 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-04-03 12:00:00+03	[]	420000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	04dd5726-ad7c-439b-a3da-7ce549727c4c	Not Insured
09cb46c7-7330-4380-ad51-fcf8ab54397b	2fe55582-cbe5-4d22-9cef-e108c2486d0f	Mrs.  KANSIME ODETH	cf90093103afnk@client.mtmicrofinance.ug	+256755990403	CF90093103AFNK	1990-11-17	NALYAMAGONJA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-04-03 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-04-03 12:00:00+03	[]	455000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	04dd5726-ad7c-439b-a3da-7ce549727c4c	Not Insured
e1dba8c3-e64b-4808-b8ab-101a548bf1db	a381ab48-64f5-42a1-8055-3947de1de7cc	Mrs.  NAMULONDO HADIJAH	cf84047104dmfg@client.mtmicrofinance.ug	+256744041445	CF84047104DMFG	1984-04-03	KASANGATI	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-04-09 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-04-09 12:00:00+03	[]	910000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	aaa8897d-23c1-445f-8b15-3a2219b4659a	Not Insured
584e247f-f0ac-4f92-bd5a-2d3ada7cfe1d	3e259e0b-71f9-4b38-a318-31475b572e83	Mrs.  SEMAKULA HADIJAH	cf890931009xpk@client.mtmicrofinance.ug	+256701143206	CF890931009XPK	1989-01-05	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-11-05 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-11-05 12:00:00+03	[]	683000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	5bdc86a2-9fad-48c9-a95e-7733d966b250	Not Insured
870faf74-2aaa-42b3-b1bf-672c07c2e2f7	39c98a36-7e08-4a59-98a4-31fecde57f65	Mrs.  NAJUKO JULIET	cf8205210894je@client.mtmicrofinance.ug	+256758854127	CF8205210894JE	1985-11-14	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-11-05 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-11-05 12:00:00+03	[]	694000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	5bdc86a2-9fad-48c9-a95e-7733d966b250	Not Insured
1eecd6af-8428-4cd5-8c6f-3aa81a7fdeff	2e8ff03f-83de-4c6b-ac2e-e6e78d875384	Mr.  SENFUKA NICHOLAS	cm9705210j2kff@client.mtmicrofinance.ug	+256709742351	CM9705210J2KFF	1997-12-26	KASANGATI	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-04-03 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-04-03 12:00:00+03	[]	335000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	5bdc86a2-9fad-48c9-a95e-7733d966b250	Not Insured
284929ee-4af2-40dc-878e-8e95524b7819	a30514cc-6539-4942-a10b-1b294af66c37	Mr.  TURINAWE RICHARD	cm95009104d0pd@client.mtmicrofinance.ug	+256759235535	CM95009104D0PD	1995-06-16	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-12 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-10-12 12:00:00+03	[]	164000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d0175b77-b2e0-489e-b802-e86b3ebb375e	Not Insured
a9766734-422e-46aa-be4c-ca68fbf95556	03e90c4f-3ce4-4379-9610-4bd7e50c7493	Mrs.  ZALWANGO JESCA BABIRYE	cf800121033hne@client.mtmicrofinance.ug	+256755296356	CF800121033HNE	1980-08-01	KASANGATI, NANGABO WAKISO DISTRICT	Group Loan	600000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-12 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-10-12 12:00:00+03	[]	805000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d0175b77-b2e0-489e-b802-e86b3ebb375e	Not Insured
c404ae0e-495a-4774-b361-ddd354b168e4	5150e093-dd70-4b8d-bf98-c6f0f110a361	Mrs.  NAMUJUZI JUSTINE	cf8705210fdmgh@client.mtmicrofinance.ug	+256750241148	CF8705210FDMGH	1992-05-06	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-04-12 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-04-12 12:00:00+03	[]	670000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	8aa2723e-3eea-4d05-9d8e-a9d7336a46d1	Not Insured
1abf69cb-8de7-49db-bf25-b40df13202c0	be1f9842-cda7-4c77-b755-1bd2da1bf6d6	Namuli Betty	cf8805210den2g@client.mtmicrofinance.ug	+256706197648	CF8805210DEN2G	1988-02-11	Nangabo	Group Loan	600000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-04-12 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-04-12 12:00:00+03	[]	780000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	8aa2723e-3eea-4d05-9d8e-a9d7336a46d1	Not Insured
cd163dae-8f4a-49ce-97b9-57628f3bf46e	05487af2-9e16-4a7f-b1cc-ed36c0a7f8e5	Lubega Josam	cm01052102jpcd@client.mtmicrofinance.ug	+256752099263	CM01052102JPCD	2001-08-15	Nangabo	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-24 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-10-24 12:00:00+03	[]	530000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	8aa2723e-3eea-4d05-9d8e-a9d7336a46d1	Not Insured
fde8928f-21a7-4e72-b02d-c60047abc598	0c8d7586-4a65-435c-9941-7399e08929bc	Mr.  KALO ROBERT	cm9207510325qe@client.mtmicrofinance.ug	+256700712733	CM9207510325QE	1900-01-01	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:45:19.835225+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:45:19.835225+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	14b9f030-7e64-4c4e-bbe5-e62afc5fb75d	Not Insured
211b2218-9cc9-491b-92a0-fbc5b8446c70	20f9fd31-d371-4a1e-b565-aefb4717fee8	Mrs.  NAGAYI SHAMIM	cf89000101vahg@client.mtmicrofinance.ug	+256741963106	CF89000101VAHG	1900-01-01	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:45:23.765483+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:45:23.765483+03	[]	542000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	5bdc86a2-9fad-48c9-a95e-7733d966b250	Not Insured
d2bba826-3eed-4af3-ac6d-d7ad0339d66d	70863a8b-bb70-4fee-aa55-eb4b42353a26	Mrs.  BRENDAH NINSIIMA	cf9900910lxj6f@client.mtmicrofinance.ug	+256751838232	CF9900910LXJ6F	1999-09-01	GAYAZA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-12 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-10-12 12:00:00+03	[]	1444000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	f814de04-057d-4e2c-a82f-3acd755585f2	Not Insured
b389d195-9cdc-48fd-93f5-12a0eca461e4	dcc9a568-ca90-4086-8acb-a890de378ec6	Ms.  Namakula Teddy	cf6705210apnng@client.mtmicrofinance.ug	+256759247777	CF6705210APNNG	1900-01-01	No Address	Group Loan	600000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:46:33.40399+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:46:33.40399+03	[]	964000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d0175b77-b2e0-489e-b802-e86b3ebb375e	Not Insured
5c24f323-a6f8-41ac-b7c2-2c196f8375f6	8e54490f-e956-47a9-95ac-75c1bee50ccf	Mrs.  MBASINGA HARRIET	cf830521086gij@client.mtmicrofinance.ug	+256740538107	CF830521086GIJ	1983-10-28	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-12 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-10-12 12:00:00+03	[]	567000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	4ccdf462-a8c2-4c25-a178-d433511bd936	Not Insured
03b7ff49-1998-49c6-b105-adff249285df	1e74885d-6b85-4a0c-89bf-465beb71ddda	Mr.  SEMAKULA CHARLES	cm7505210ft2cd@client.mtmicrofinance.ug	+256751935512	CM7505210FT2CD	1975-06-22	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-12 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-10-12 12:00:00+03	[]	569000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	4ccdf462-a8c2-4c25-a178-d433511bd936	Not Insured
b595c00b-ea8f-4da4-8a4b-516d5e9354a6	89114712-ed3d-471c-9055-9c1d46ffb3e8	Mrs.  NAKAYIZA CATHERINE	cf83032102ejla@client.mtmicrofinance.ug	+256759305134	CF83032102EJLA	1983-01-03	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-12 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-10-12 12:00:00+03	[]	570000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	4ccdf462-a8c2-4c25-a178-d433511bd936	Not Insured
13bd4907-4a1e-43a5-80d2-ae43e5ac1e5b	c6212859-a4c3-43ec-8294-ec70e64a8081	NAMATOVU AGNES	cf86023108xvqe@client.mtmicrofinance.ug	+256754667955	CF86023108XVQE	1986-01-01	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-12 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-10-12 12:00:00+03	[]	600000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	4ccdf462-a8c2-4c25-a178-d433511bd936	Not Insured
7f2e4270-8d07-4eb8-823f-d1b4cc1d5b89	52858932-34e1-4de4-be2f-4c30874934df	Mr.  Lusiba Fred	cm830361037jeh@client.mtmicrofinance.ug	+256700527371	CM830361037JEH	1983-08-24	Nangabo	Group Loan	200000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-12 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-10-12 12:00:00+03	[]	181000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	ec1c1149-0157-45fb-98c0-a70bcd77b299	Not Insured
d051b80c-74c2-4c58-9bae-5882fa6035cd	84dd812b-0002-43d6-aa98-91a21570f1ef	Ms.  Lukwago Eva	cf91052100yvek@client.mtmicrofinance.ug	+256703446562	CF91052100YVEK	1989-05-17	Kasangati	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-12 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-10-12 12:00:00+03	[]	218000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	ec1c1149-0157-45fb-98c0-a70bcd77b299	Not Insured
f1bc5552-df0b-4a59-b38e-e5b55cf8b24d	5fa08807-417e-441a-8947-b1b18b1f4a24	Nakiseka Jowelia	cf650991035amj@client.mtmicrofinance.ug	+256750047034	CF650991035AMJ	1985-07-18	Nangabo	Group Loan	300000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-12 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-10-12 12:00:00+03	[]	128000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	ec1c1149-0157-45fb-98c0-a70bcd77b299	Not Insured
277e85c1-880a-4e65-9bc1-5ed0cdbc7525	250bc13c-d312-4415-aa76-dc2d55113737	Mrs.  Nambazira Rose	cf93052110pyge@client.mtmicrofinance.ug	+256701928429	CF93052110PYGE	1993-09-30	Nangabo	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-12 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-10-12 12:00:00+03	[]	181000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	ec1c1149-0157-45fb-98c0-a70bcd77b299	Not Insured
cc68f34f-756f-4371-ae43-a99ffc5c8d52	e144d13d-6b52-4477-a560-649bae54777d	Mrs.  NAKADDU LILLIAN	cf8905210evnzc@client.mtmicrofinance.ug	+256709463912	C F8905210EVNZC	1989-01-24	KAZINGA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-27 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-09-27 12:00:00+03	[]	677000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d0175b77-b2e0-489e-b802-e86b3ebb375e	Not Insured
30af0130-edc8-4e48-a280-2106fc5d00dd	c84958cf-6d5e-4a35-be2d-58e052148331	Mrs.  NALUWOZA JULIET	cf780241034gch@client.mtmicrofinance.ug	+256702868907	CF780241034GCH	1978-06-08	KAZINGA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-27 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-09-27 12:00:00+03	[]	677000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d0175b77-b2e0-489e-b802-e86b3ebb375e	Not Insured
b1167341-3fcb-4d21-80f8-9e024b364d2d	03e90c4f-3ce4-4379-9610-4bd7e50c7493	Mrs.  ZALWANGO JESCA BABIRYE	cf800121033hne@client.mtmicrofinance.ug	+256755296356	CF800121033HNE	1900-01-01	KASANGATI, NANGABO WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:48:16.36223+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:48:16.36223+03	[]	695000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d0175b77-b2e0-489e-b802-e86b3ebb375e	Not Insured
37795e47-7c11-4687-9505-9d53ba2e569c	1e944c16-4cd3-4745-bc61-46ccac667064	Mrs.  NAMBOOZE FAUZIA	cf740521087gpa@client.mtmicrofinance.ug	+256758366002	CF740521087GPA	1900-01-01	KAZINGA, WAKISO	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:48:24.21298+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:48:24.21298+03	[]	50000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	89d76d9c-f08d-4ff5-873a-c0643e55899b	Not Insured
5cd35e13-482c-4217-83d0-bb73891a842b	a918b342-a96b-4e5e-968c-265edcca0844	Mrs.  TUMWINE SANDRAH	cf99101109qdyh@client.mtmicrofinance.ug	+256740753002	CF99101109QDYH	1996-12-16	KASANGATI, NANGABO WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-30 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-07-30 12:00:00+03	[]	627000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d0175b77-b2e0-489e-b802-e86b3ebb375e	Not Insured
56293d39-592e-47f7-b60e-d166d67e350b	20346c20-1871-4580-a472-b5204303da15	Mr.  SENYONDWA JULIUS	cm910521067wva@client.mtmicrofinance.ug	+256759065112	CM910521067WVA	1900-01-01	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:49:19.835362+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:49:19.835362+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	614c86c9-588f-46e8-9e16-85d10eb41f14	Not Insured
4fada97f-a714-400b-abd0-c6f540de158d	9f51a27a-da0a-432f-8688-555e169d1164	Mr.  KAZIBWE ALLAN	cm9805210j228f@client.mtmicrofinance.ug	+256755407233	CM9805210J228F	1998-01-01	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-01-24 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-01-24 12:00:00+03	[]	700500.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	614c86c9-588f-46e8-9e16-85d10eb41f14	Not Insured
1d6e33a9-e62b-42b4-83a4-7c190da68c12	2be1a302-1789-46a6-8178-efe933c5ab4a	Mr.  KAMOGA HUSSEIN	cm8605210xmk9d@client.mtmicrofinance.ug	+256754787039	CM8605210XMK9D	1900-01-01	GAYAZA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:49:38.919845+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:49:38.919845+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	9e9209b1-3ccf-40d6-882a-57dbff88623d	Not Insured
e2883d2d-0c99-4c0f-9bc4-1efd5a9b4478	e5a6f7b3-ff2e-4af1-afb3-2139a575f3de	Mr.  MWEBE JOHN	cm04052110h6ze@client.mtmicrofinance.ug	+256753856515	CM04052110H6ZE	1900-01-01	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:49:42.849128+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:49:42.849128+03	[]	592000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	9e9209b1-3ccf-40d6-882a-57dbff88623d	Not Insured
0a43905d-4829-427e-95d2-06da5f58a2e1	8a825829-e643-47c7-984c-9fd0684edbec	Mr.  KUBUNGA JOHNSON	cm9605210ezwga@client.mtmicrofinance.ug	+256741425274	CM9605210EZWGA	1900-01-01	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:49:44.196795+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:49:44.196795+03	[]	623000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	9e9209b1-3ccf-40d6-882a-57dbff88623d	Not Insured
7f7d255e-9647-4b5a-a06f-c8f1d4f15609	a381ab48-64f5-42a1-8055-3947de1de7cc	Mrs.  NAMULONDO HADIJAH	cf84047104dmfg@client.mtmicrofinance.ug	+256744041445	CF84047104DMFG	1900-01-01	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:49:48.17181+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:49:48.17181+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	aaa8897d-23c1-445f-8b15-3a2219b4659a	Not Insured
e8d032dc-8641-4d0e-8e38-884c474bc69d	be1f9842-cda7-4c77-b755-1bd2da1bf6d6	Namuli Betty	cf8805210den2g@client.mtmicrofinance.ug	+256706197648	CF8805210DEN2G	1900-01-01	Nangabo	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:47:10.138735+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:47:10.138735+03	[]	536000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	8aa2723e-3eea-4d05-9d8e-a9d7336a46d1	Not Insured
4ba14516-0c10-4ddf-9964-c529eb520ae5	ab46d637-496a-40e3-9d53-d038fb82599b	Mrs.  NANFUMA JAMILA	cf8902310323hg@client.mtmicrofinance.ug	+256746716961	CF8902310323HG	1900-01-01	KIJABIJO C	Group Loan	300000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:49:57.20646+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:49:57.20646+03	[]	439000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	cd9ec41e-e172-4c25-a610-0e4f24dae739	Not Insured
7a1c5e10-c399-439c-aaaf-b2a2a0f692eb	c5af0695-b0cf-4173-b366-67a0fd11b88e	Mrs.  NAMULI HAJALA	cm91052107ypng@client.mtmicrofinance.ug	+256740686007	CM91052107YPNG	1900-01-01	KIJABIJO C	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:49:58.620315+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:49:58.620315+03	[]	520000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	cd9ec41e-e172-4c25-a610-0e4f24dae739	Not Insured
ca9f7816-54bc-4343-8bf8-9af5dd7b6376	86f9f8d8-2a98-4a27-b349-c24ac684e5eb	Mrs.  NAKIWALA OLIVIA	cf60068103e05k@client.mtmicrofinance.ug	+256741884026	CF60068103E05K	1900-01-01	KIJABIJO C	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:50:00.030698+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:50:00.030698+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	cd9ec41e-e172-4c25-a610-0e4f24dae739	Not Insured
226875cc-9601-48a3-bcff-87cd04fee301	1c1b740f-9127-4ac8-967d-4e7657f758d5	Mrs.  LUSIBA SARAH	cf650321030n4d@client.mtmicrofinance.ug	+2567045588973	CF650321030N4D	1900-01-01	KASANGATI	Individual Loan	1000000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:50:04.810464+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:50:04.810464+03	[]	54000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
f086a38a-9228-4fc0-9945-d4ea05a8e2d4	2f702b6c-88fe-4fc8-81cd-7d572f7204ea	Mr.  KOMODO MUTWAIFU	cm91035106z80k@client.mtmicrofinance.ug	+256751724397	CM91035106Z80K	1900-01-01	KASANGATI, NANGABO WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:50:27.865552+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:50:27.865552+03	[]	696000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	b48f3ac7-e107-4718-82c7-0d599fb08c44	Not Insured
b44657a8-cecc-4c41-9bcb-41bf064573aa	73fe437a-82dc-4bfa-b675-e9038b66b945	Mr.  ABU SENDI	cm82032104qy5j@client.mtmicrofinance.ug	+256759748041	CM82032104QY5J	1900-01-01	BUYINGA, NANGABO WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:50:29.210786+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:50:29.210786+03	[]	675000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	b48f3ac7-e107-4718-82c7-0d599fb08c44	Not Insured
44f86df9-688b-48fc-85b4-2471321ac3d0	c273e6c8-d88a-494e-974c-9bb6073b6823	Mr.  BAMUGYE SIPERITO	cm85032104lphk@client.mtmicrofinance.ug	+256702033965	CM85032104LPHK	1900-01-01	KASANGATI, NANGABO WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:50:30.541301+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:50:30.541301+03	[]	681000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	b48f3ac7-e107-4718-82c7-0d599fb08c44	Not Insured
0ff41d52-6125-4a94-b0eb-89e525279424	d71e36ca-74b6-4429-ae0d-a20300fe4d3a	Mr.  ARINAITWE YORAM	cm83027106mljg@client.mtmicrofinance.ug	+256700368667	CM83027106MLJG	1900-01-01	KASANGATI, NANGABO WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:50:31.828969+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:50:31.828969+03	[]	672000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	b48f3ac7-e107-4718-82c7-0d599fb08c44	Not Insured
68025eb0-85aa-449e-a393-276d8d60b513	00412331-e81b-42e6-8cd1-6eda658a259f	KARUHANGA CHRISTOPHER	cm931011068fqh@client.mtmicrofinance.ug	+256752213079	CM931011068FQH	1900-01-01	Gayaza	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:50:33.133393+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:50:33.133393+03	[]	1312000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	f814de04-057d-4e2c-a82f-3acd755585f2	Not Insured
faf7972a-f706-469e-bc8c-8e544f464cf1	2a59fe45-d8cc-4e13-9585-4d74196d0a17	Mr.  KIMBUGWE ROBERT	cm91098105wdqa@client.mtmicrofinance.ug	+256742646117	CM91098105WDQA	1900-01-01	MANYANGULA,GAYAZA WAKISO DISTRICT	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:50:59.202562+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:50:59.202562+03	[]	552500.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d7a05a70-b69d-4295-bfdb-94234c6bee25	Not Insured
b7d2bc57-8285-44e1-9e40-1f6ef42ea2ec	2b3697d3-23ce-4d33-bff1-b1af226bba5e	Mrs.  Lusiba Sarah	cf650321030n4d@client.mtmicrofinance.ug	+2567044558973	CF650321030N4D	1900-01-01	kazinga	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:51:02.932633+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:51:02.932633+03	[]	360000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	b287907f-c7b5-45ff-8b52-a4586877fa86	Not Insured
fa7ad5c5-ea93-45a1-bdc8-a611c287b290	2859db94-1137-420c-98bb-7920c974ff2d	Mr.  Kasozi Robert	cm60032100vjmd@client.mtmicrofinance.ug	+256754018864	CM60032100VJMD	1900-01-01	kazinga	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:51:05.823885+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:51:05.823885+03	[]	216000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	b287907f-c7b5-45ff-8b52-a4586877fa86	Not Insured
8b8f6600-d9d5-49e2-ba3a-f0a15eb5b473	807e08cf-7f39-4911-bf52-34d1a7e3c504	Mrs.  Namala Justine Tina	cf8400910hjkkj@client.mtmicrofinance.ug	+256705958444	CF8400910HJKKJ	1900-01-01	wampeewo	Group Loan	300000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:51:09.095493+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:51:09.095493+03	[]	135000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d515d3e7-827e-49d3-b97b-39b08ab2d1a8	Not Insured
0cdf17f2-3806-4455-9ab1-dbb4add3b844	ccfac2d3-c9a4-4159-84aa-13ffc2494f52	Ms.  Nkalubo Aisha	cf909910497ca@client.mtmicrofinance.ug	+256753778149	CF909910497CA	1900-01-01	wampeewo	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:51:11.798438+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:51:11.798438+03	[]	180000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d515d3e7-827e-49d3-b97b-39b08ab2d1a8	Not Insured
1bcd240b-c023-4e7b-a9ba-e535c64152bf	29c2f6cf-c309-4f58-809d-64ed0fa64498	Mrs.  Nakirijja Jalia	cf7205210eunae@client.mtmicrofinance.ug	+256788259592	CF7205210EUNAE	1900-01-01	wampeewo	Group Loan	300000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:51:14.460137+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:51:14.460137+03	[]	135000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d515d3e7-827e-49d3-b97b-39b08ab2d1a8	Not Insured
87f49195-a984-4590-b384-06e49f1abc9c	def039f2-8c59-419a-bd56-d304bfb7f9cc	Mrs.  NABABI MARGRET	cf80032109a75d@client.mtmicrofinance.ug	+256754839041	CF80032109A75D	1980-11-07	BULAMU DEPUTY, NANGABO WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-02-18 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-02-18 12:00:00+03	[]	621000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	14f96b5f-f9f9-4aa5-866b-0a1cc6936d41	Not Insured
864c6d4e-8f79-40ec-9996-3680114c3378	fc513d83-9750-4fca-82c2-d74800b2a8fc	Mrs.  KINAWA ZAITUNI	cf80064104hmwl@client.mtmicrofinance.ug	+256756846444	CF80064104HMWL	1980-07-12	GAYAZA A, NANGABO WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-02-18 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-02-18 12:00:00+03	[]	621000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	14f96b5f-f9f9-4aa5-866b-0a1cc6936d41	Not Insured
93576b7c-40cc-4a5e-b7f3-426c62e3b620	b0f0f535-abbf-44ed-af6d-a6ec16adc39f	Mr.  NYAKANA HAMISI	cm87010100xzfa@client.mtmicrofinance.ug	+256701131435	CM87010100XZFA	1987-07-27	MANYANGULA,GAYAZA WAKISO DISTRICT	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-03-01 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-03-01 12:00:00+03	[]	551750.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d7a05a70-b69d-4295-bfdb-94234c6bee25	Not Insured
14611dfa-9bb6-4c9e-b9af-6a9f2af1ce65	16120aaf-5f26-4f85-a14e-c8d8433120a0	Miss  Nalugo Christine	cf82032100v9la@client.mtmicrofinance.ug	+256757884615	CF82032100V9LA	1981-01-01	kazinga	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-05-08 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-05-08 12:00:00+03	[]	369500.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	b287907f-c7b5-45ff-8b52-a4586877fa86	Not Insured
6fc8933e-a623-47a2-bfae-5c6594834722	e2ef61b6-316f-4f34-87cc-0fb63095d635	Mrs.  Nakibinge Justine	cf9100106045h@client.mtmicrofinance.ug	+256771980135	CF9100106045H	1979-11-23	wampeewo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-05-08 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-05-08 12:00:00+03	[]	225000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d515d3e7-827e-49d3-b97b-39b08ab2d1a8	Not Insured
576e31d2-5bfc-4b1e-9068-82b87aa84123	2e35e7ef-d91e-465c-8646-164db82e9503	Mrs.  Nanyon jo Hasifah	cf79024103e8wj@client.mtmicrofinance.ug	+256773267484	CF79024103E8WJ	1979-05-19	wampeewo	Group Loan	300000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-05-08 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-05-08 12:00:00+03	[]	135000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d515d3e7-827e-49d3-b97b-39b08ab2d1a8	Not Insured
61538803-83cc-49ec-ba87-5f1e0a5e9602	9213a73a-2c6f-444b-920d-aec163ad7523	Mrs.  Kagaba Brenda Mbabazi	cf89003104rwgj@client.mtmicrofinance.ug	+256772907395	CF89003104RWGJ	1989-11-13	wampeewo	Group Loan	300000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-05-08 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-05-08 12:00:00+03	[]	135000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d515d3e7-827e-49d3-b97b-39b08ab2d1a8	Not Insured
e4ce1912-6569-48f0-a659-699249edb1f9	fff172ab-ba0e-4c81-b24c-b95745eae361	Mr.  SSENTONGO GODFREY	cm82047107l6yf@client.mtmicrofinance.ug	+256703522841	CM82047107L6YF	1982-06-12	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-11-15 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-11-15 12:00:00+03	[]	123000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	ef6a5d39-1f61-40ea-9959-48c7fe289c5b	Not Insured
1a79cbc1-4d8d-4d17-8d43-5f45a8ceca1a	51fba39e-a0f8-4d52-ad30-709cea8a5697	Mrs.  NANONO PERAGIA	cf9301210342kd@client.mtmicrofinance.ug	+2567512457171	CF9301210342KD	1900-01-01	KASANGATI	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-11-11 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-11-11 12:00:00+03	[]	160000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	a8d609dc-d32c-4d75-844b-be1bb6990a9e	Not Insured
fa7c296b-7162-4d9d-b670-761c4f68d6f3	43145b30-d275-44b4-bb15-024687674189	Mr.  ABAASA BERNARD	cm9802710j4cle@client.mtmicrofinance.ug	+256772753695	CM9802710J4CLE	1998-03-08	KASANGATI, NANGABO WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-04 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-04 12:00:00+03	[]	680000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	cb0420d4-9543-4e7b-9b43-7f664f88b632	Not Insured
e8cad5dc-8421-48e7-80b7-3d0fa3f7708c	0d3a6b23-e637-4c45-bc7d-b0bcef2741d6	Mr.  LUKWAGO HENRY MUKASA	cm840521076akg@client.mtmicrofinance.ug	+256749760027	CM840521076AKG	1984-01-01	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-11-22 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-11-22 12:00:00+03	[]	82000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	3fc6ce3f-6543-4540-ab4c-b85cd959e0ff	Not Insured
b471324d-31c8-4d5d-a02c-a43d995480e9	5a6d4663-e879-4447-bc23-2aa0f66bfd3a	Mr.  BYARUGABA DENNIS	cm82023107jkbd@client.mtmicrofinance.ug	+256754163519	CM82023107JKBD	1982-08-05	GAYAZA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-02-22 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-02-22 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	7a5366a4-d167-40f2-9d1d-af7a716ceb8c	Not Insured
092e24f1-a860-4132-9e15-ad736cb2ab7a	2a68ef83-3cae-4aa3-91eb-9148763a0bff	Mr.  LUKWAGO ALEX	cm87100100ykye@client.mtmicrofinance.ug	0000000000	CM87100100YKYE	1987-03-26	KASANGATI	Individual Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-08-14 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-08-14 12:00:00+03	[]	495000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
69f02e96-94d2-4bf3-8883-8070f556e8e7	caa1e465-033e-44b9-beed-69f6f0a7eefe	Mr.  Mwanje Richard	cm78068105vf4l@client.mtmicrofinance.ug	+256701074902	CM78068105VF4L	1978-08-28	Manyangwa	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-25 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-25 12:00:00+03	[]	198000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	438f2e9a-798d-4d28-85f3-9c79916911f5	Not Insured
21e07338-dd43-47a9-b3c0-110c74f29ec5	25ffad69-f7f7-4de4-8efc-7db0b2b5137e	Mr.  Busulwa Andrew Robert	cm98068109m41a@client.mtmicrofinance.ug	+256702160626	CM98068109M41A	1998-07-05	Gayaza	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-25 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-25 12:00:00+03	[]	246000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	64fcca38-4e88-4832-abb9-1e37f2447a95	Not Insured
79022963-bfef-4694-bdca-2a8d3a379ec5	3858302f-b9e8-420f-b12f-5934f3123b8c	Mr.  Tusabe Hamza 2(hamza)	cm000251087hqh@client.mtmicrofinance.ug	+256708841468	CM000251087HQH	2000-06-12	Kabubbu	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-01-24 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-01-24 12:00:00+03	[]	246000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	5479431c-3d1c-49c1-a118-f46567117e1b	Not Insured
9d80e6a0-e437-4921-b921-c4ef00ba18e2	01a4e0c1-4c38-4fe0-81d4-549e86e1e4f1	Mr.  Kaweesi Ibra 2 (ibrah)	cm940301068tze@client.mtmicrofinance.ug	+256750028092	CM940301068TZE	1994-01-01	Gayaza A	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-11 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-11 12:00:00+03	[]	280000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	18836fc6-98b2-44b4-908b-227ff7dfbd37	Not Insured
30a7ac70-02b4-4611-b96f-53445db8348d	fb346bc2-d7f4-4cf5-99cf-24ffc193024a	Mr.  kiwanuka Francis	cm5605210cu18a@client.mtmicrofinance.ug	+256701638523	CM5605210CU18A	1956-10-02	Nangabo	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-26 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-26 12:00:00+03	[]	160000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	bf9c113b-c0b1-4f36-ab33-64d862714bd9	Not Insured
0330c929-4a5e-43af-97e3-46c0e5c99201	d43d3515-0d1e-4d9a-aa28-abbae69dfbd6	Mr.  Kintu Steven	cm9209510kyld3@client.mtmicrofinance.ug	+256754362679	CM9209510KYLD3	1992-06-13	Wampewo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-27 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-09-27 12:00:00+03	[]	108000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	154bb5f5-b4b8-495c-a674-5309403c9f99	Not Insured
88d4e800-e705-4678-8039-5502117dddc3	f4593884-24a9-4722-8ea8-da1ba1003964	Mr.  Were Simon Peter	cm900421060u6f@client.mtmicrofinance.ug	+256704248443	CM900421060U6F	1990-09-09	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-07-12 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-07-12 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	8e1e3988-cc33-489f-9281-619768da5c9f	Not Insured
57b3bd77-4640-43e9-9dbe-4571e5b977ba	5e3390f7-5d91-47f8-b658-489e1bf7e4c5	Mr.  Ssentega Disan	cm92093100hpjg@client.mtmicrofinance.ug	+256751137321	CM92093100HPJG	1992-11-30	No Address	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-07-12 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-07-12 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	8e1e3988-cc33-489f-9281-619768da5c9f	Not Insured
3669e297-e88e-4808-aa5e-78da11487aae	ee3b5a29-a557-430e-b76c-fe37f35bba33	Mr.  BUTANAKYA GEORGE	cm820941014ccj@client.mtmicrofinance.ug	+256754564152	CM820941014CCJ	1982-10-21	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-01-31 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-01-31 12:00:00+03	[]	675000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d736eba4-ded0-47d6-b2a3-b138422f1c17	Not Insured
df28af91-16a8-442f-ab58-e01c1be91757	0cf5d7e4-9475-4d21-8e0d-e57ce71c7982	Miss  Nabwato Hadijah	cf8503210c10xa@client.mtmicrofinance.ug	+256759031603	CF8503210C10XA	1985-12-01	No Address	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-04-20 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-04-20 12:00:00+03	[]	198000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	cf7ec8b0-176a-4fcc-af08-ec25e85404e7	Not Insured
934540bb-97c0-4922-b60c-de7240152f59	1ee0c2b8-b641-4aa6-ac2f-1ee634e863f3	Ntamu Sharif	cm94032102d989@client.mtmicrofinance.ug	+256758313768	CM94032102D989	1994-11-11	No Address	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-04-20 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-04-20 12:00:00+03	[]	243000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	cf7ec8b0-176a-4fcc-af08-ec25e85404e7	Not Insured
536a1c52-a899-47df-8cf7-e74f3016df7a	4437c898-9b7e-49c8-8b34-4c862bc68a3b	Namale Noeline	cf0106810e79ul@client.mtmicrofinance.ug	+256740076491	CF0106810E79UL	2001-07-10	No Address	Group Loan	300000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-04-20 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-04-20 12:00:00+03	[]	148500.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	cf7ec8b0-176a-4fcc-af08-ec25e85404e7	Not Insured
cd8c966b-2191-4640-a93b-5307df34ea05	a14561ef-479d-4998-96a0-8dfb85bda786	Ms.  Namayanja Phionah	cf94023104c2vg@client.mtmicrofinance.ug	+256702221595	CF94023104C2VG	1994-09-15	No Address	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-04-20 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-04-20 12:00:00+03	[]	333000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	fa97c25b-20f1-4bc1-b4ac-a7a7473963b5	Not Insured
7517392f-5d39-442a-997a-a833b0e07326	b2d870b6-1e1b-43d6-a71c-61664bea1094	Miss  Nasolo Harriet	cf78024104hcah@client.mtmicrofinance.ug	+256709796376	CF78024104HCAH	1978-04-05	No Address	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-04-20 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-04-20 12:00:00+03	[]	333000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	fa97c25b-20f1-4bc1-b4ac-a7a7473963b5	Not Insured
e9357f7a-171b-4f0e-9fe5-3577dcc871e6	95e737c7-6ff2-412b-8235-7b95b5b1dc46	Miss  Kibirige Harriet	cf73023101qtzd@client.mtmicrofinance.ug	+256706474503	CF73023101QTZD	1973-01-20	Wampewo	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-05 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-09-05 12:00:00+03	[]	509000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	117b3b12-f668-4025-8b46-c35f82f016ff	Not Insured
8efab7af-cd67-4825-95f5-3c43c32d8095	ba212db4-58f8-416b-bd56-27ec6ab47c90	Mr.  BOGERE RODGERS	cm950911088jad@client.mtmicrofinance.ug	+25674919199075	CM950911088JAD	1995-03-08	GAYAZA,KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-20 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-20 12:00:00+03	[]	123000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	4259a83d-7260-4a55-b3de-d05cd914db40	Not Insured
7fe64c45-dec9-4bbc-82f0-94b01ffda9dd	06cba71b-fcf7-40fb-9144-cb23ea80f9ca	Mr.  LUWAGA CHARLES	cm9103210apole@client.mtmicrofinance.ug	+256701676785	CM9103210APOLE	1991-02-02	Kasangati	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-09 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-07-09 12:00:00+03	[]	930000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	471782b5-3337-45f2-812e-bb1fa1e589ea	Not Insured
db1ce1e7-68e3-407b-a48c-eadf70fccee3	20346c20-1871-4580-a472-b5204303da15	Mr.  SENYONDWA JULIUS	cm910521067wva@client.mtmicrofinance.ug	+256759065112	CM910521067WVA	1991-04-27	KASANGATI	Group Loan	600000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-12 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-05-12 12:00:00+03	[]	816000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	614c86c9-588f-46e8-9e16-85d10eb41f14	Not Insured
4d839de4-c1b5-480d-bf45-2f0daad04925	55d03c23-0f31-42d5-89dd-d304c473fed6	Mr.  OGWANG JASPHER	cm93001102fntg@client.mtmicrofinance.ug	+256743472327	CM93001102FNTG	1993-05-02	GAYAZA, KASANGATI WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-03 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-03 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	a3c98617-1f5f-46e7-babb-9b007b1eb35d	Not Insured
cc1c1b91-054d-43bf-a5d4-b2d0785523b1	83d2b098-0241-4cfe-9268-1d8d985487f1	Mr.  KIZZA RICHARD	cm99052113lmqe@client.mtmicrofinance.ug	+256743494614	CM99052113LMQE	1999-04-25	NAMAYINA JOLWE, KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-21 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-21 12:00:00+03	[]	445000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	e8758606-77ae-4657-a77f-a0442f0f2bf4	Not Insured
48eff088-0c79-4546-924c-9e8b6743fc1c	138711bc-7e20-4baf-84fa-477ec8d60d85	Mr.  SELWANGA JAMES	cm0305210wgwzd@client.mtmicrofinance.ug	+256753694387	CM0305210WGWZD	2003-08-11	NAMAYINA JOLWE, KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-21 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-05-21 12:00:00+03	[]	425000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	e8758606-77ae-4657-a77f-a0442f0f2bf4	Not Insured
4ed36114-55a0-42af-9790-cb366bb30956	e5da2496-0793-44ba-9178-79c27c5bcf69	Mrs.  MIREMBE JOAN	cf99099410d025j@client.mtmicrofinance.ug	+256742895299	CF99099410D025J	1999-03-22	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-04-28 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-04-28 12:00:00+03	[]	210000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	f6691e1d-412a-4af5-8236-1d34b8cfe3ac	Not Insured
177c3af0-66fe-419a-a18d-707fc555ad9a	3eaaac65-3b4a-43b8-8713-6167e463ec00	Mr.  KATIMBO JOHN BOSCO	cm9903010cwqre@client.mtmicrofinance.ug	+2567048414872	CM9903010CWQRE	1999-06-13	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-12 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-10-12 12:00:00+03	[]	1146000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	f814de04-057d-4e2c-a82f-3acd755585f2	Not Insured
48891c85-ec58-4f45-a580-156fdd8478f6	4e1468c6-5480-49c2-946e-f0a87ec91b72	Mrs.  NASAKA HARRIET	cf1069720001ty4@client.mtmicrofinance.ug	0000000000	CF1069720001TY4	1900-01-01	SEETA	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:46:23.103174+03	2026-02-15 12:43:49.33742+03	\N	2026-02-10 16:46:23.103174+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	1218fac8-9ee7-4526-8d7e-e9938eb8c64d	Not Insured
e4a4b886-a18f-4b64-af27-6bb6377892c1	625ef4ae-3509-4568-b295-9c0550a49342	Mr.  MUGANGA LAWRENCE	cm96023105093d@client.mtmicrofinance.ug	+256754689223	CM96023105093D	1900-01-01	GAYAZA, NANGABO WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:48:09.667978+03	2026-02-15 12:43:49.33742+03	\N	2026-02-10 16:48:09.667978+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c492f6a1-91f5-4b02-862a-f06e177afdd0	Not Insured
2a8af903-be71-4d2c-b8b0-461c29e354c7	5d803fc7-5834-4415-8fad-70897a17ca5c	Mr.  Ssekajja Jamil	cm0205210zncch@client.mtmicrofinance.ug	+256703350322	CM0205210ZNCCH	2002-04-27	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-05 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-05-05 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	993fd964-ec77-422d-af5b-fc28b21a7080	Not Insured
5ef059a2-84d1-43fc-ad7f-9d4db76a1bc6	e3a6570f-432d-4d37-b86e-1a680249b2e7	Mr.  Kavuma Osman	cm0005210tu8th@client.mtmicrofinance.ug	+256708792743	CM0005210TU8TH	2000-09-28	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-05 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-05-05 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	993fd964-ec77-422d-af5b-fc28b21a7080	Not Insured
d818e95f-3501-46be-9daf-8a584d6af0fa	62e1415b-42c9-41d1-9290-ce27dbf14c9d	Mrs.  Nakacwa Phionah	cf960321071urc@client.mtmicrofinance.ug	+256703407361	CF960321071URC	1996-02-11	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-07 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-05-07 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	993fd964-ec77-422d-af5b-fc28b21a7080	Not Insured
c58a6219-3ccc-40bb-81db-f6ba8dff1ee6	727b9f6d-0474-47d8-83ec-219e19bfbe49	Mr.  Njakasi Charles	cm90052113dx5a@client.mtmicrofinance.ug	+256701892709	CM90052113DX5A	1990-08-05	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-05 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-05-05 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	993fd964-ec77-422d-af5b-fc28b21a7080	Not Insured
458ebd65-47af-4c8b-bb98-943306a5f270	6bb3a043-1925-41fa-a6f6-1866471520b5	Mr.  Lubalema Umar	cm96052102w4zl@client.mtmicrofinance.ug	+256748546849	CM96052102W4ZL	1996-07-16	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-05 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-05-05 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	993fd964-ec77-422d-af5b-fc28b21a7080	Not Insured
d08a9b47-c4d1-4610-8a7c-432523e3cacf	ebd18199-5bd9-4a24-a004-67478fcca4ad	Iga Solomon	cm8005210fpeqh@client.mtmicrofinance.ug	+256752162036	CM8005210FPEQH	1980-01-01	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-07 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-05-07 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	6f710c7a-ec68-4ead-aef1-0048e57b7ad8	Not Insured
fef2210b-0b97-41a0-959e-f8e7c73fd9b2	862d9fda-c97b-49a7-8a08-ef41ef41dba5	Mrs.  NAKAYONDO NIGHT	cf82068107jxid@client.mtmicrofinance.ug	0000000000	CF82068107JXID	1982-08-29	NAKWERO	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-11-05 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-11-05 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	fb0d7217-759c-4335-8802-5dd3d5885aa7	Not Insured
53d4cb08-a4b7-4c4e-86b8-9477ef9cf94f	1d560cc3-4e58-43e3-b8fc-7d8ec4097ad9	Mrs.  NAJJOBYO JANAT	cf970521068fte@client.mtmicrofinance.ug	0000000000	CF970521068FTE	1997-04-16	NAKWERO	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-11-05 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-11-05 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	fb0d7217-759c-4335-8802-5dd3d5885aa7	Not Insured
5c78e4b3-85a9-4a1a-9c1e-ab7b860d40dd	eb560f55-b2cf-4816-b7d4-581f1ced7018	Mrs.  NAKALULE CARLO	cf89030106n7ck@client.mtmicrofinance.ug	+256708822253	CF89030106N7CK	1989-03-01	NAKWERO	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-11-05 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-11-05 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	fb0d7217-759c-4335-8802-5dd3d5885aa7	Not Insured
0b6cef26-c0e8-4bba-8c19-713e6865094f	2ad746b0-4758-45b5-9f7f-961a13ecc999	Mrs.  NALUBOWA HADIJAH	cf81023106wtnk@client.mtmicrofinance.ug	+256750174563	CF81023106WTNK	1981-08-08	GAYAZA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-08-23 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-08-23 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	1ed9273d-a38c-4024-9e95-302a618127d0	Not Insured
3ac29c0d-044f-4623-a975-a71bcb4a9446	06429f14-33f9-4109-a7e9-04b0cb4e6bf8	Mrs.  MUHAME AZIDAH	cf83078104ee5e@client.mtmicrofinance.ug	+256782894315	CF83078104EE5E	1983-11-23	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-08-23 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-08-23 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	7f760486-b3bc-4544-b2c0-946d68053f2b	Not Insured
74b6bb7b-d183-4f11-b725-7cff9930ed97	38305602-9166-470a-b31a-7684390165a8	Mrs.  KABYESIZA AGNES	cf90010105jx6l@client.mtmicrofinance.ug	+256702787612	CF90010105JX6L	1990-11-26	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-08-23 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-08-23 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	93886694-9dcc-4bc9-b428-377c1ef8208c	Not Insured
9e7a2210-1644-40de-b167-238ff9c7939c	889ce556-5d0b-410f-b377-e951a83693cb	Mrs.  NAKAYIZA AGNES	cf78023106v3hg@client.mtmicrofinance.ug	+256709320340	CF78023106V3HG	1978-01-08	GAYAZA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-08-23 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-08-23 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	70ac37d6-5a19-4913-bb91-2ed3dbaa3059	Not Insured
5773a5ad-eb06-4853-b937-f036b547862c	6e1454cd-b2a8-46c0-b585-97a4e7069a5e	Mrs.  ATIM TECKLER ELIZABETH	cf84022101e1ck@client.mtmicrofinance.ug	+256703077844	CF84022101E1CK	1984-06-13	GAYAZA	Group Loan	300000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-08-23 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-08-23 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	70ac37d6-5a19-4913-bb91-2ed3dbaa3059	Not Insured
32cb972b-4902-455d-9e5b-ebdba9f625ec	059e3a3a-4882-478e-91a0-e0351f674fda	Mrs.  HADIJAH OKIRYA	cf88uac000hd@client.mtmicrofinance.ug	+256742937322	CF88UAC000HD	1967-09-14	BULAMU	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-08-23 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-08-23 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	70ac37d6-5a19-4913-bb91-2ed3dbaa3059	Not Insured
656fe56c-54ee-494a-ace2-e41339ad773b	7b5ba9f7-6759-45a7-9736-93dfc16962ff	Mrs.  NAMUBIRU ROBINAH	cf6705210904nf@client.mtmicrofinance.ug	+256704772494	CF6705210904NF	1967-09-14	BULAMU	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-08-23 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-08-23 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	70ac37d6-5a19-4913-bb91-2ed3dbaa3059	Not Insured
85a39932-ea2d-4912-9dce-c7bc2952fbf2	843fd8ad-8f5e-403b-95ad-eb115e8bc944	Mrs.  NALWADDA PHIONAH	cf90036101lmhj@client.mtmicrofinance.ug	+256758967474	CF90036101LMHJ	1900-01-01	KASANGATI	Individual Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:46:08.712213+03	2026-02-15 12:43:49.33742+03	\N	2026-02-10 16:46:08.712213+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
6ddaa26f-8793-4a69-a085-6b5a67df25d8	1b0aeb33-b6e3-4dd7-a7f7-df022cd76163	Mrs.  NAKANWAGI HASIFAH	cf85052101gehd@client.mtmicrofinance.ug	+256756815839	CF85052101GEHD	1900-01-01	Kasangati	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:48:46.689331+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:48:46.689331+03	[]	810000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d0175b77-b2e0-489e-b802-e86b3ebb375e	Not Insured
d3429cd1-7ea2-4855-b9c4-a8b8d9ca7fb4	bd9003ff-97f8-497a-b0ba-07f2f735627e	Mrs.  NANKYA REHEMA	cf98105105v87a@client.mtmicrofinance.ug	+256705312121	CF98105105V87A	1998-05-12	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-08-23 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-08-23 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	3c7d6a8c-8c79-41f6-b3dd-c6698e4977f9	Not Insured
6aa73dc7-8046-451c-8759-215814889ced	23881893-2b4a-4c91-acdf-2040dab32de2	KYALO SHARIFAH	cf83007103q4va@client.mtmicrofinance.ug	+256755783020	CF83007103Q4VA	1983-06-03	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-08-23 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-08-23 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	3c7d6a8c-8c79-41f6-b3dd-c6698e4977f9	Not Insured
f23bb36c-b8cc-4c79-84f6-7924019203e9	3ace33c7-e0d0-4fa3-ae26-e3bf55c4a544	Mrs.  ZALWANGO RESTY	cf90030104vc5d@client.mtmicrofinance.ug	+256751243696	CF90030104VC5D	1990-09-20	GAYAZA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-14 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-10-14 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	150dc1e4-16f6-4023-8004-2b6371d7c7a8	Not Insured
d8edf763-26fd-48c5-a787-93d63b8cdf10	825a411b-c89a-4b59-9c20-a7c33eefa39a	Mr.  NTAATE HENRY	cm8602310a59aa@client.mtmicrofinance.ug	+256702720908	CM8602310A59AA	1986-05-15	GAYAZA A	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-14 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-10-14 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	150dc1e4-16f6-4023-8004-2b6371d7c7a8	Not Insured
82977ab7-7447-460a-b9ef-7f75582ca9f6	7db5c923-cbce-4fe2-9c0c-5c0fd79e4322	Mrs.  NAGAWA OLIVIA	cf9204710cx1hc@client.mtmicrofinance.ug	+256751350949	CF9204710CX1HC	1992-06-26	GAYAZA A	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-14 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-10-14 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	150dc1e4-16f6-4023-8004-2b6371d7c7a8	Not Insured
d0b58752-7642-4ba3-aeee-96671ad34475	2859db94-1137-420c-98bb-7920c974ff2d	Mr.  Kasozi Robert	cm60032100vjmd@client.mtmicrofinance.ug	+256754018864	CM60032100VJMD	1900-01-01	kazinga	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-20 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-20 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	b287907f-c7b5-45ff-8b52-a4586877fa86	Not Insured
e2479ac5-75ab-4bdd-aa10-51a49e669ec6	23deccb8-1524-49b3-9c77-962da14bca5d	Mrs.  NAKIMBUGWE JULIET	cf84098105201c@client.mtmicrofinance.ug	0000000000	CF84098105201C	1984-04-09	SEETA	Individual Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-10 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-10 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
aae3dbe5-1d61-457e-9255-ffefc992f5a7	04283371-d6cf-4f0e-a6c1-9c0a14ef0105	Mrs.  NATUKUNDA JUSTINE	cf85046101a68a@client.mtmicrofinance.ug	+256740973908	CF85046101A68A	1985-06-16	KAZINGA, WAKISO	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-10 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-09-10 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	7883fe1f-d490-4089-97ab-69e93c766123	Not Insured
bcab5e58-5ba7-4bcf-97d7-f969e7236a38	cbf2944c-cf41-4891-b1db-eb59ac135da6	Mrs.  ATUHIRE PHIONAH	cf88046100vm4g@client.mtmicrofinance.ug	+256753241545	CF88046100VM4G	1988-04-06	KAZINGA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-10 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-10 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	7883fe1f-d490-4089-97ab-69e93c766123	Not Insured
37e2072c-00ce-4207-81e2-0857074e2a1f	d9f6c382-0f89-4305-a511-ee2462725ba4	Mrs.  ATUHIRE EVELYNE	cf94046101y5ce@client.mtmicrofinance.ug	+256705510815	CF94046101Y5CE	1994-09-14	KAZINGA, WAKISO	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-10 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-10 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	7883fe1f-d490-4089-97ab-69e93c766123	Not Insured
0fd95912-cc2b-4cef-a83c-81d8ac616e55	e0bb2a3d-eb4b-4a11-a771-92f96bd4a087	Mrs.  KYOSIMIRE PAMELA	cf8410110225pk@client.mtmicrofinance.ug	+256779008446	CF8410110225PK	1984-04-02	SEETA.	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-10 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-10 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	9b4ed501-4b0b-4d8d-88bd-008b2ac021d3	Not Insured
55d1d849-d96c-4eaf-9f99-171d45bcc47a	17ea56e2-d880-4e21-a39d-236426996eb9	Miss  KAMYA TEDDY	cf750101040zig@client.mtmicrofinance.ug	0000000000	CF750101040ZIG	1975-12-24	WAMPEEOO	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-10 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-10 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	9b4ed501-4b0b-4d8d-88bd-008b2ac021d3	Not Insured
faf4f95b-c4a4-48bf-9f08-383b8fcb11bd	807e08cf-7f39-4911-bf52-34d1a7e3c504	Mrs.  NAMARA JUSTINE	cf8400910hjkkj@client.mtmicrofinance.ug	0000000000	CF8400910HJKKJ	1984-05-05	BULAMU	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-10 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-10 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	9b4ed501-4b0b-4d8d-88bd-008b2ac021d3	Not Insured
7a843f49-cdd4-48b3-9594-b3067c57ca2a	d53752cf-89c5-4644-81d5-9715cbc17a32	Mrs.  KAHWA LACKEL	cf82061105fon@client.mtmicrofinance.ug	0000000000	CF82061105FON	1982-12-28	SEETA.	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-10 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-10 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	9b4ed501-4b0b-4d8d-88bd-008b2ac021d3	Not Insured
9a5936ed-ecf8-404c-af2c-313d766af39a	ccfac2d3-c9a4-4159-84aa-13ffc2494f52	Mrs.  NKALUBO AISHA	cf909910497ca@client.mtmicrofinance.ug	+256753778149	CF909910497CA	1978-10-20	WAMPEEOO	Individual Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-10 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-09-10 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
6bd6b155-f8b5-4640-8dd8-94ba53aaa741	3f5248b6-0c60-42ab-8af0-9b77a5d979e9	Mrs.  NAKIRANDA BABRA	cf870471022ndh@client.mtmicrofinance.ug	0000000000	CF870471022NDH	1987-08-20	KITEGOMBA	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-20 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-20 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	fcc049b7-0fb9-41fd-afc4-0384a965e8a1	Not Insured
630734de-4494-49bd-9619-ad1ce39361e9	21a1ba1f-5cf1-419b-858f-46f01a312df3	Mugema Jackson	cm90045104rtcc@client.mtmicrofinance.ug	0000000000	CM90045104RTCC	1900-01-01	Gayaza	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-24 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-10-24 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	9b9ce642-a628-43f1-952d-d1fb5a66f49c	Not Insured
d940a6b0-4a1b-4edc-bab1-09db380697d1	a63f462c-5bf3-4530-8f72-49e73d626741	Mrs.  NAMUWULYA WINNIE BIRUNGI	cf9705210j4akf@client.mtmicrofinance.ug	+256753136375	CF9705210J4AKF	1997-10-08	KIJAHIJU	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-20 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-20 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	786e1880-1cec-40a0-b169-7cb809b3da30	Not Insured
ead38c48-26f4-496a-9d13-f8ee6878bf06	602ea67a-340f-4dd3-9503-66a80b3026e2	Mrs.  NAKASIRYE SYLIVIA	cf96091107vfzc@client.mtmicrofinance.ug	+25674408582	CF96091107VFZC	1996-12-12	KIJAHIJU	Group Loan	300000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-20 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-20 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	786e1880-1cec-40a0-b169-7cb809b3da30	Not Insured
ac72b165-2aed-4ed5-ab38-df8210186c13	fdbead1c-edcf-49eb-9201-fa387db679c7	Mrs.  NAGAWA REHEMA NAKATO	cf9503210c30kd@client.mtmicrofinance.ug	+256708792304	CF9503210C30KD	1995-02-05	KIJAHIJU	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-20 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-20 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	786e1880-1cec-40a0-b169-7cb809b3da30	Not Insured
8cd35fa9-24f1-438a-80b3-525fd4711872	7b177c95-c74c-4512-8210-7de8614f1b3e	Mrs.  LUNKUSE FLORENCE	cf74052104lggg@client.mtmicrofinance.ug	0000000000	CF74052104LGGG	1974-09-03	KIJAHIJU	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-20 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-20 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	786e1880-1cec-40a0-b169-7cb809b3da30	Not Insured
c3d28f22-d41b-49cf-abb4-495df38fba92	b222fe5c-9dd6-4815-be42-e738ed986da3	Mrs.  Nakonde Hasifah	cf58023108e02k@client.mtmicrofinance.ug	+256706982931	CF58023108E02K	1958-01-01	Gayaza	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-24 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-10-24 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	7c278ac5-160e-4d7c-90be-219f58e7fd3c	Not Insured
e9fb6d0c-258c-40b4-b237-2aac7eb349cd	f439d4d2-592b-4ee5-97a5-b2fb05b06bf7	Mr.  WASSWA CHRISTOPHER	cm8605210gg44f@client.mtmicrofinance.ug	+256759890840	CM8605210GG44F	1986-04-10	Kasangati	Individual Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-20 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-20 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
988c26a7-0405-4bc6-ae51-06036b9dc21a	e4a6fbc6-4f82-4bd9-8cde-8f1be35584ae	Mr.  MUSISI TADEO	cm7405210gldjk@client.mtmicrofinance.ug	+256708439908	CM7405210GLDJK	1974-05-25	GAYAZA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-20 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-20 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	7ecd933b-8847-44d5-a100-6a3c4c5d66d6	Not Insured
8d2ba65e-05f2-4346-84f4-4f515f35f750	aae74515-1a09-4874-a4d1-b0d5fbf99680	Mrs.  NAKAFU DOCUS	cf77052108jwll@client.mtmicrofinance.ug	0000000000	CF77052108JWLL	1900-01-01	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:49:02.01634+03	2026-02-15 12:43:49.33742+03	\N	2026-02-10 16:49:02.01634+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	1ed9273d-a38c-4024-9e95-302a618127d0	Not Insured
f534575f-551a-46d4-be4a-33388edb92ca	83dc39d8-adf0-4fb9-a877-94e47c784f86	Miss  BILUNGI RECHEAL	cf92017103px4d@client.mtmicrofinance.ug	+256759627909	CF92017103PX4D	1992-04-06	GAYAZA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-20 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-20 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	7ecd933b-8847-44d5-a100-6a3c4c5d66d6	Not Insured
441655b8-8790-4bf9-97c1-172d2625fb07	58211898-6c37-44ad-bef1-04da125547ce	Mr.  ZIWA JOSEPHINE	cm84032102wmlg@client.mtmicrofinance.ug	+256705414598	CM84032102WMLG	1984-06-27	NAKWERU	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-27 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-27 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	962113b8-5235-48bf-ad60-ac55eaa9247b	Not Insured
e49b20cd-bc10-44a6-b72a-0c24b70a568b	8c26a54a-ba90-41eb-80ac-dfa81a737a11	Mrs.  DOREEN NAMAKULA	cf8603210n1df@client.mtmicrofinance.ug	0000000000	CF8603210N1DF	1986-01-01	NAKWERO	Group Loan	300000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-27 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-27 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	962113b8-5235-48bf-ad60-ac55eaa9247b	Not Insured
0b3876da-c4da-4f96-a9ec-66d70bc1b689	02fb0f11-cc31-4aa8-a850-0e6ab9506b0e	Mr.  Lubwama Robert	cm95023104annd@client.mtmicrofinance.ug	+256701268606	CM95023104ANND	1995-04-04	Gayaza	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-24 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-10-24 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	9b9ce642-a628-43f1-952d-d1fb5a66f49c	Not Insured
70c103ed-fb50-4896-a8b8-0829e95573e1	770cd95d-4fed-4c4f-bad3-c5ae55e48072	Mrs.  Nakacwa Annet	cf905210712ee@client.mtmicrofinance.ug	+256751560266	CF905210712EE	1900-01-01	Nakweero	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-24 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-10-24 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	b22cd19d-05b1-4c2e-9008-11b1079b7792	Not Insured
a1e2074d-b9b8-4e76-8201-1f86563fa33a	497f9f16-5de5-44f4-939a-32d1457fccd0	Mr.  Mwesigwa Halid	cm950621076wgk@client.mtmicrofinance.ug	+256752006066	CM950621076WGK	1995-09-12	Gayaza	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-24 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-10-24 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	9b9ce642-a628-43f1-952d-d1fb5a66f49c	Not Insured
33825d5f-c04d-4667-a587-d1c2af031f15	bf3e4eae-0cf7-4477-ab0e-38f539fad6e5	Mrs.  Kaitesi Jolly	cf62039105p9xj@client.mtmicrofinance.ug	+256706705925	CF62039105P9XJ	2005-05-24	Nakwero	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-24 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-10-24 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	b22cd19d-05b1-4c2e-9008-11b1079b7792	Not Insured
adac803a-d485-4701-9ff2-c83faa342e38	bfef2e51-3fb5-48b6-907f-35e4c93145dd	Mrs.  Akoth Allen	cf62039105p8xj@client.mtmicrofinance.ug	+256756049413	CF62039105P8XJ	1962-04-04	Nakwero	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-24 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-10-24 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	b22cd19d-05b1-4c2e-9008-11b1079b7792	Not Insured
70bc10e3-cd19-46f9-929e-5e1bd271d99d	38f1990a-6042-4115-93c5-92c66bdf6f16	Mr.  Kisozi David	cm89052107u5wc@client.mtmicrofinance.ug	+256751500308	CM89052107U5WC	1989-07-06	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-24 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-10-24 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	b22cd19d-05b1-4c2e-9008-11b1079b7792	Not Insured
8068ce40-f8bb-483d-9454-00b069b4c20d	fce7fef4-8c3e-4a19-9430-34b75228f8e1	Mrs.  NANYONJO EMILLY	cf9605210ajclk@client.mtmicrofinance.ug	+256751482221	CF9605210AJCLK	1900-01-01	KYANKIMA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:47:35.282163+03	2026-02-15 12:43:49.33742+03	\N	2026-02-10 16:47:35.282163+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	78f8afb3-a791-4996-8849-98b95d1c2b52	Not Insured
95ee1301-2028-40cf-9862-da658ec48718	a691e269-0a53-4065-b073-c7e53791c8e9	Mrs.  AHWEZA NEUST	cf89009109ax14h@client.mtmicrofinance.ug	+256745656417	CF89009109AX14H	1989-07-02	MANYANGWA	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-12 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-10-12 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	8d2800a9-7660-444a-b873-a63b574b1f3f	Not Insured
162f0a6f-dd60-4c7f-a8b4-d2f1b2f31632	4e7ddc85-81c4-4b25-93d6-82699a422cf6	Mrs.  NELIMA FATUMA	cf93067102mw3a@client.mtmicrofinance.ug	+256745656917	CF93067102MW3A	1993-10-13	MANYANGWA	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-12 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-10-12 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	8d2800a9-7660-444a-b873-a63b574b1f3f	Not Insured
081fefe0-c709-4a4d-93b1-81290e99e9ec	2c27ec28-509f-4bef-9631-9c457be0599a	Mr.  JJUUKO JOSEPH	cm9105210ede9d@client.mtmicrofinance.ug	+256784745545	CM9105210EDE9D	1991-10-15	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-29 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-29 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	a43b54fd-74c0-44af-a25e-6f92ed751379	Not Insured
0b0956b3-24f4-4062-95b5-4c0cf916c4ef	be6c061d-3c8a-4f36-9406-ba6720a11eb4	Mr.  LUTAYA ABBEY	cm9305210ede7d@client.mtmicrofinance.ug	+256743235924	CM9305210EDE7D	1993-12-23	GAYAZA, KASANGATI WAKISO DISTRICT	Group Loan	300000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-29 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-29 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	a43b54fd-74c0-44af-a25e-6f92ed751379	Not Insured
727b69fc-61e2-49cf-82ee-50b8574e48c3	2e5762b6-30fa-4924-9011-22ddb7fadfd4	Mr.  NAKIBINGE RONNY	cm93052107layd@client.mtmicrofinance.ug	+256701169823	CM93052107LAYD	1993-01-01	GAYAZA, KASANGATI WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-29 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-29 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	a43b54fd-74c0-44af-a25e-6f92ed751379	Not Insured
05dd21f5-00a6-4754-be75-a56c86724a8e	1b707875-94f0-434c-a774-eba3820a6dfc	Mrs.  KITOOKE BRIAN	cm0005210rpgch@client.mtmicrofinance.ug	+256700112401	CM0005210RPGCH	2000-01-01	GAYAZA, KASANGATI WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-29 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-29 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	a43b54fd-74c0-44af-a25e-6f92ed751379	Not Insured
054ee647-907b-49bd-ba09-62f20bc81ae9	049d7941-6823-4b21-82b4-5bc4835646a2	Mr.  KAKULE JONATHAN	cm9005210cwmke@client.mtmicrofinance.ug	+256758198968	CM9005210CWMKE	2025-02-20	GAYAZA, KASANGATI WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-29 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-29 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	6684615c-0622-4959-996c-c25abbbcb433	Not Insured
5e847b90-990e-415c-9d01-cb9dc4ac5063	0d61f03d-50de-44ce-b5cb-034edd799022	Mrs.  NYOMEWA SCOVIA	cf89027101neaf@client.mtmicrofinance.ug	+256755931062	CF89027101NEAF	1993-11-23	KAZINGA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-30 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-30 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	b67834e6-01af-4e73-8c18-c31038861fa3	Not Insured
26efb909-8ad8-4f46-81df-7fdda3bfdfdb	9d1fa1b5-d105-4036-af69-bf0ed65dc85e	Mrs.  KYOSIMIRE PROSSY	cf930041072arf@client.mtmicrofinance.ug	+256755525284	CF930041072ARF	1993-11-23	KAZINGA	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-30 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-30 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	b67834e6-01af-4e73-8c18-c31038861fa3	Not Insured
9e496abc-fdff-4b10-a2d3-6a34a265802b	db6dc8ee-a1a6-4967-a055-1113449edf7e	Mrs.  NAKAMYA MWAJUMA	cf910681017enj@client.mtmicrofinance.ug	+256741857343	CF910681017ENJ	1991-01-01	KAZINGA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-30 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-30 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	b67834e6-01af-4e73-8c18-c31038861fa3	Not Insured
a587795f-dad9-41ff-8a07-fa9b475cdd02	e31ac65f-270b-41e6-b56a-3b4bcc40760c	Mrs.  NANYONGA RUTH	cf78023108v5pj@client.mtmicrofinance.ug	+256705964681	CF78023108V5PJ	1979-01-01	KYANKIMA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-19 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-19 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	78f8afb3-a791-4996-8849-98b95d1c2b52	Not Insured
84903454-aa9f-4ee4-b1a1-5633457adada	f7732074-6034-46b6-b12b-74937c2054a2	Mrs.  NAKITANDA SARAH	cf75052108elge@client.mtmicrofinance.ug	+256750454757	CF75052108ELGE	1973-06-25	BUYINJA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-19 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-19 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	78f8afb3-a791-4996-8849-98b95d1c2b52	Not Insured
9af70e97-95c9-42bf-9f4a-735b2fa2b6c1	2bedfdbb-dc3d-4090-8f43-7786c4ceeae6	Mrs.  AUMA FANISE TRACY	cf9605210ajclk@client.mtmicrofinance.ug	+256752998193	CF9605210AJCLK	1996-09-05	KYANKIMA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-19 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-19 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	78f8afb3-a791-4996-8849-98b95d1c2b52	Not Insured
9aaded09-7ef8-41b1-9a1d-436bd08e1e77	f015c08d-8754-459d-b7a9-4c204a40cc0c	Mrs.  NAMUBIRU FARIDAH	cf8803210vgkaf@client.mtmicrofinance.ug	+256701460164	CF8803210VGKAF	1978-01-01	KYETUME	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-19 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-19 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	78f8afb3-a791-4996-8849-98b95d1c2b52	Not Insured
3184a60a-3ad7-484d-9144-65099eca064a	f85517c5-778b-4e1d-bb83-cac8941217cb	Mrs.  KWAGALA SARAH	cf8505210r7h8j@client.mtmicrofinance.ug	0000000000	CF8505210R7H8J	1985-07-22	BUYINJA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-19 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-19 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	78f8afb3-a791-4996-8849-98b95d1c2b52	Not Insured
c730b2ed-f883-41b4-ab16-be8e4ce4d804	baf75191-95c6-494c-a58f-899de4007d9c	Mrs.  MBABALI HANIFAH	cf820241070x0g@client.mtmicrofinance.ug	+256782437403	CF820241070X0G	1982-12-02	KASANGATI, KASANGATI WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-30 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-30 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c3c99ba2-dd9f-4af6-a9a6-9fcd8b41e417	Not Insured
d00633a6-d4e6-4d76-b3eb-e020470d96a1	a416e84d-7890-4d98-93bb-a7e4cd912423	Mrs.  NANTALE FAITH	cf84082103ae8c@client.mtmicrofinance.ug	+256702927490	CF84082103AE8C	1984-08-10	KASANGATI, KASANGATI WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-08-30 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-08-30 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c3c99ba2-dd9f-4af6-a9a6-9fcd8b41e417	Not Insured
509b165b-7529-45aa-af62-00d8f9bef6a4	843fd8ad-8f5e-403b-95ad-eb115e8bc944	Mrs.  NALWADDA PHIONAH	cf91017100nlcd@client.mtmicrofinance.ug	+256758967474	CF91017100NLCD	1900-01-01	KASANGATI, NANGABO WAKISO DISTRICT	Individual Loan	800000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:48:02.426931+03	2026-02-15 12:43:49.33742+03	\N	2026-02-10 16:48:02.426931+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
6c7cfb74-0eec-4725-84bd-36b58c951dcf	352dd7a5-fee2-4f80-855a-b558a3ff6837	Mrs.  BULYABA RUTH KABUYE	cf76082103qaea@client.mtmicrofinance.ug	+256705957581	CF76082103QAEA	1979-04-19	KAZINGA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-30 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-30 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c3c99ba2-dd9f-4af6-a9a6-9fcd8b41e417	Not Insured
07ebc006-33fd-4570-af96-2e6357f62d22	cd77105b-ad29-4a6a-857a-2e970bfdffaf	Mrs.  NALWADDA FALIDAH	cf82024101y6kl@client.mtmicrofinance.ug	+256705220010	CF82024101Y6KL	1982-07-30	NANGABO	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-19 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-19 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	bfcb69cc-175c-4c04-b5ad-8597a848f072	Not Insured
e02953fd-4961-45d0-9b25-2ca265b71b09	84c0dc10-03d9-4f98-ab1e-183d3d7f47b4	Mrs.  NABAGGALA SOLOME	cf63052107uauj@client.mtmicrofinance.ug	0000000000	CF63052107UAUJ	1963-04-14	NANGABO	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-19 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-19 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	bfcb69cc-175c-4c04-b5ad-8597a848f072	Not Insured
72af81a0-d702-415d-95a3-55ea6899973c	fe98fe91-d2b4-4dcb-8861-d4ce8afa46c1	Mrs.  NANYONJO HANIFAH	cf790911000g8a@client.mtmicrofinance.ug	0000000000	CF790911000G8A	1979-06-24	NANGABO	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-19 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-19 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	bfcb69cc-175c-4c04-b5ad-8597a848f072	Not Insured
b70226cd-c33c-4552-a31a-e070675f079f	9d31382d-4706-461c-9216-ceec0f8b8e6c	Mrs.  NALUBEGA FLORENCE	cf8905210j0a9k@client.mtmicrofinance.ug	+256742226140	CF8905210J0A9K	1989-05-09	GAYAZA, KASANGATI WAKISO DISTRICT	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-19 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-19 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	3807d346-05fa-41cd-a8cc-33e059c096e2	Not Insured
31eda45e-5883-49eb-984a-4162dc9a2f6b	b5f04cc8-833c-42a7-9672-882d9c4e72bb	Mrs.  NAMWANJE JANE	bi49313j@client.mtmicrofinance.ug	+256754363241	BI49313J	1989-05-21	GAYAZA, KASANGATI WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-19 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-19 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	3807d346-05fa-41cd-a8cc-33e059c096e2	Not Insured
7473c4f8-d950-4527-9086-5a73235aae71	be0e64d6-febb-4f68-ba5a-e17abbd2991f	Mrs.  NASSALI MARIAM	cf75068103qw@client.mtmicrofinance.ug	+256756419415	CF75068103QW	1975-12-01	GAYAZA, KASANGATI WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-19 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-19 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	3807d346-05fa-41cd-a8cc-33e059c096e2	Not Insured
53e0cae5-7b96-4b8a-b10d-558622b2bc7e	049dc689-88dd-477c-8797-006d09ea7b3c	Mrs.  NANTEZA BEATRICE	cf86082110749ea@client.mtmicrofinance.ug	+256701578999	CF86082110749EA	1986-01-01	BULAMU, KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-08-09 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-08-09 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	226ee447-910e-4171-ab0a-8d0f4c9bfc85	Not Insured
f362ce7b-1612-4174-8605-bb27f66cd975	c8ed617e-761f-4529-a299-c5929b29f595	OWINY GLADIES	cf890331013hgd@client.mtmicrofinance.ug	+256759431663	CF890331013HGD	1989-06-26	BULAMU, KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-08-09 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-08-09 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	226ee447-910e-4171-ab0a-8d0f4c9bfc85	Not Insured
c401b766-c792-4e02-863a-0d977fdf2849	20040977-0530-4cb9-b17f-bbd10d368fde	Mr.  AMPUMUZA AMON	cm92055106verf@client.mtmicrofinance.ug	+256752472565	CM92055106VERF	1992-02-14	KITEGOMBWA, KASANGATI	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-08-09 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-08-09 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	a6d5a9b8-67d0-44a7-afd0-a6d43539c9e4	Not Insured
6b4e7b77-1571-44bc-9ce6-7cb28ed3315f	b61d7141-6861-4ccf-9274-9dbf383b92bd	Mrs.  NAMUDDU KEMIREMBE HARRIET	cf770231047cpe@client.mtmicrofinance.ug	+256742245108	CF770231047CPE	1992-02-14	KITEGOMBWA, KASANGATI	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-08-09 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-08-09 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	a6d5a9b8-67d0-44a7-afd0-a6d43539c9e4	Not Insured
f8dd29f2-51f7-4a69-b7c0-bc7745395506	97aec1a9-c06d-41c2-a9ad-be5bc9dea8e1	NALWADDA BABRA	cf7605210ctwjh@client.mtmicrofinance.ug	+256701594523	CF7605210CTWJH	1976-10-23	KITEGOMBWA, KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-08-09 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-08-09 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	a6d5a9b8-67d0-44a7-afd0-a6d43539c9e4	Not Insured
ebe86908-e655-40a1-be81-52786e742e97	ddcd3099-25e2-4b22-b1ca-76560948b379	Mrs.  AYENYA CHRISTINE NIGHT	cf790691037efk@client.mtmicrofinance.ug	+256782194764	CF790691037EFK	1979-01-01	KAYEBE, GAYAZA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-08-09 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-08-09 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	1774280d-a837-48dc-9e77-1be3859fe05f	Not Insured
cf0f6fa6-1a24-4fa9-acf5-dc0bc18de969	ec55ad21-2845-4bde-a32e-e9bec58cf96b	Mrs.  ACHIRO SANDRA	cf94087103mc1d@client.mtmicrofinance.ug	+256701273212	CF94087103MC1D	1994-01-01	KAYEBE, GAYAZA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-08-09 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-08-09 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	1774280d-a837-48dc-9e77-1be3859fe05f	Not Insured
07551265-cc6e-4052-93e8-b614ae959621	655c2557-3d0c-4000-b25f-a9ec505a79b7	Mrs.  MIREMBE GIRADES	cf7903210cw57e@client.mtmicrofinance.ug	+256708645888	CF7903210CW57E	1978-12-23	KAYEBE, GAYAZA	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-08-09 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-08-09 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	1774280d-a837-48dc-9e77-1be3859fe05f	Not Insured
3d02a8d3-e95f-482e-b2ab-6e167e69f078	f0469b29-f9b1-487e-8bae-71ab2c752f96	Mrs.  AISHA NAMUYINGA	cf9301210342kd@client.mtmicrofinance.ug	+256752977806	CF9301210342KD	1900-01-01	KASANGATI, NANGABO WAKISO DISTRICT	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:48:12.862664+03	2026-02-15 12:43:49.33742+03	\N	2026-02-10 16:48:12.862664+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	962e8fcf-7d9b-4a8c-8edd-20925a3ef920	Not Insured
7a777149-e698-48c5-ac82-ca9dda3cf018	5c811279-65df-42e4-9726-f9a3917a5150	Mrs.  NAKYEJWE AMINA	cf8705210fdmgh@client.mtmicrofinance.ug	+256743482849	CF8705210FDMGH	1900-01-01	WAMPEEOO, WAKISO	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:48:28.593859+03	2026-02-15 12:43:49.33742+03	\N	2026-02-10 16:48:28.593859+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	6c0032ce-bd58-4d76-a26f-af7325a2c946	Not Insured
43baf178-b372-43e9-ad1d-95cce8ab5493	f0469b29-f9b1-487e-8bae-71ab2c752f96	Mrs.  NYANGOMA TEDDY	cf9301210342kd@client.mtmicrofinance.ug	+256752293570	CF9301210342KD	1900-01-01	WAMPEEOO, WAKISO	Group Loan	300000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:48:29.735658+03	2026-02-15 12:43:49.33742+03	\N	2026-02-10 16:48:29.735658+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	6c0032ce-bd58-4d76-a26f-af7325a2c946	Not Insured
44effa57-fd4b-48c4-8e78-7b4bce096b1e	de951e6e-a97a-4d6b-a18e-91af72d22a51	Mrs.  NANYANZI RITAH	cf9605210rpc9c@client.mtmicrofinance.ug	+256755739093	CF9605210RPC9C	1900-01-01	KAZINGA, WAKISO	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-01 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-01 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	89d76d9c-f08d-4ff5-873a-c0643e55899b	Not Insured
dfec0cb6-ac8f-41fc-82d9-629403d29d24	2d2a749a-ffc2-4c3c-94ef-24984a93501b	Mrs.  NAKABIRI FLORENCE	cf79052104rnva@client.mtmicrofinance.ug	+256700683877	CF79052104RNVA	1979-05-25	SEETA.WAMPEEOO	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-04-08 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-04-08 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	df43f95b-3b92-4119-a442-df8f1dfaf29a	Not Insured
cdde7cc0-284a-4503-a704-06dedea8ebbf	43e20055-1131-480b-8c3f-55c2e1b29d29	Mrs.  NAKIRIJA JALIA	cf7205210eunae@client.mtmicrofinance.ug	+256788259692	CF7205210EUNAE	1972-01-01	SEETA.WAMPEEOO	Individual Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-04-08 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-04-08 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
b6f098a2-8135-4b6a-8e5f-ef8a13a02b67	6b87bf17-9704-413f-bb47-dc9d34c534d7	Mrs.  BUSINGYE ERINA H KIWEESI	cf780911048rhl@client.mtmicrofinance.ug	+256704300246	CF780911048RHL	1978-08-09	SEETA.WAMPEEOO	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-04-08 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-04-08 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	df43f95b-3b92-4119-a442-df8f1dfaf29a	Not Insured
343a2764-4113-4f67-bf4f-577234e18277	1b5558e6-51cd-4394-aabe-a13d7353b130	Mrs.  NAKATE ANNET MAYANJA	cf81012101u8ck@client.mtmicrofinance.ug	+256758927292	CF81012101U8CK	1981-10-21	LUTEETE, WAKISO	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-04-08 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-04-08 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	df43f95b-3b92-4119-a442-df8f1dfaf29a	Not Insured
99823aae-f080-4ee1-84d0-3261dd7f2700	a4b56ca6-a4b8-40bb-9556-c6d21b1e461c	Mr.  KITAKA FAZIRI SSEBUSUNJE	cm94082107ujua@client.mtmicrofinance.ug	+256743688378	CM94082107UJUA	1994-01-14	BULAMU, WAKISO	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-01 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-01 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	962e8fcf-7d9b-4a8c-8edd-20925a3ef920	Not Insured
dd6c6812-3e5a-406c-ad31-7f618a1a0971	8763caf5-ecee-4ab3-8e96-0f5795adee75	Mrs.  NASILA SALUMU	cf940821074jua@client.mtmicrofinance.ug	+256705594949	CF940821074JUA	1992-10-20	KASANGATI, NANGABO WAKISO DISTRICT	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-01 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-01 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	962e8fcf-7d9b-4a8c-8edd-20925a3ef920	Not Insured
8dbfc1a8-7561-4735-83a5-07f3dd843302	482585ba-0a4b-4936-9b36-a120b90da10d	Mrs.  NAMUBIRU ASHA	cf58052106y7jh@client.mtmicrofinance.ug	+256758829382	CF58052106Y7JH	1958-05-03	WAMPEEOO, WAKISO	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-01-31 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-01-31 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	6c0032ce-bd58-4d76-a26f-af7325a2c946	Not Insured
832a1975-4f78-40b5-b8e9-a3dbd4c92a7b	00810ca3-4b47-46eb-be1d-507c26a19c38	Mrs.  NANYANGE AMINAH	cf83032102hjgf@client.mtmicrofinance.ug	+256703041763	CF83032102HJGF	1983-04-08	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-12 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-12 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	93886694-9dcc-4bc9-b428-377c1ef8208c	Not Insured
3f42854a-38e9-4e6d-827b-d6221f97e75f	e1095323-d66f-4912-b3b1-275a89095747	Miss  TUMUSHABE EVA	cf75009105fv1g@client.mtmicrofinance.ug	+256707485757	CF75009105FV1G	1900-01-01	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:48:56.706917+03	2026-02-15 12:43:49.33742+03	\N	2026-02-10 16:48:56.706917+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	6aafb38d-3639-4df4-b1b1-6ee086bba70e	Not Insured
a02b5c4b-5ff7-4009-ae0d-662d2716d305	d22d3eb7-0f94-4368-b127-b709d2c5b380	Miss  KAAHWA SPECIOZA	cf78006102nrzj@client.mtmicrofinance.ug	+256758172968	CF78006102NRZJ	1973-06-13	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-12 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-12 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	93886694-9dcc-4bc9-b428-377c1ef8208c	Not Insured
ee07287d-eca2-4009-9bab-fde1ae1421fd	bb8c3d64-b955-4b0f-b9b9-6b6258fa8e9c	Mrs.  MWAJUMA BAHATI	cf790471083v5h@client.mtmicrofinance.ug	+256703265238	CF790471083V5H	1979-05-16	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-12 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-12 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	93886694-9dcc-4bc9-b428-377c1ef8208c	Not Insured
bd6e8ce1-975d-47cd-9ade-999e7bbcd569	5f379480-93c4-417c-934d-d1ab52445110	Mrs.  KAYAGA AMINAH	cf80008107alah@client.mtmicrofinance.ug	+256753306067	CF80008107ALAH	1980-07-17	No Address	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-19 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-19 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	cdeef46f-8f14-4263-a2df-7ca100aa2434	Not Insured
1450fed5-280b-43ed-bba4-8304c41a73ff	ee846bcc-1cef-4526-9f9e-e03ffe1f0f12	Mrs.  NAKYEYUNE FLORENCE	cf570231081h42f@client.mtmicrofinance.ug	+256759405535	CF570231081H42F	1957-03-20	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-19 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-19 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	cdeef46f-8f14-4263-a2df-7ca100aa2434	Not Insured
1c017a90-874e-451e-bdba-88efbb0d40c6	b36fc70a-d8bf-4702-bb83-aea110ffbc55	Mrs.  NDAGIRE UDAYA	cf90017103qcde@client.mtmicrofinance.ug	+256703618761	CF90017103QCDE	1990-12-12	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-19 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-19 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	cdeef46f-8f14-4263-a2df-7ca100aa2434	Not Insured
ad46b64e-fd5f-4993-b33d-e8a9bf4bfffd	01ced916-8a12-4dce-8fd6-4303872578f3	Mrs.  NAKATANZA JANET	cf024101ex59@client.mtmicrofinance.ug	+256751395539	CF024101EX59	1977-02-02	Nangabo	Group Loan	300000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-19 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-19 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	cdeef46f-8f14-4263-a2df-7ca100aa2434	Not Insured
6dd0c36d-d1d3-4b08-a725-c80b9238c4aa	8c05f954-fca9-4cda-8b70-c4616644b9de	Mr.  SSEKABENDE DAVID	cm80023104nq8e@client.mtmicrofinance.ug	+256706548649	CM80023104NQ8E	1980-01-09	Nangabo	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-30 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-30 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	962113b8-5235-48bf-ad60-ac55eaa9247b	Not Insured
3ad6e05d-b05d-4a87-8eae-20b6cdfeda4b	516b63dc-f0e8-4086-b7ed-742550a6e724	Mrs.  MBABAZI SYLIVIA	cf92052106t7rl@client.mtmicrofinance.ug	+256743882950	CF92052106T7RL	1992-02-08	Nangabo	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-30 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-30 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	962113b8-5235-48bf-ad60-ac55eaa9247b	Not Insured
2d921c56-bfa0-4998-a087-3c3bdcd1b99f	7d1cd2ef-87d7-42ab-8cc2-8b9e300695aa	KOBUSINGYE SARAH	cf750691045atl@client.mtmicrofinance.ug	+256703117302	CF750691045ATL	1975-08-13	Nangabo	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-30 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-30 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	962113b8-5235-48bf-ad60-ac55eaa9247b	Not Insured
8860aff5-0dc5-4c93-9499-1d74752e3769	d58b90ae-87db-434f-bc8f-7bdc2fbff9c5	Mrs.  NABUKALU LAILA	cf89023106u48k@client.mtmicrofinance.ug	+256754508619	CF89023106U48K	1989-07-05	Nangabo	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-30 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-30 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	7f760486-b3bc-4544-b2c0-946d68053f2b	Not Insured
7100995a-3c3c-4231-8132-6fc3171af6ae	1e525de3-36c7-4ab2-b9e6-57945bc44dfe	Mr.  KIWANUKA FRED	cm90082102p8nd@client.mtmicrofinance.ug	+256700859072	CM90082102P8ND	1990-11-12	Nangabo	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-30 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-30 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	7f760486-b3bc-4544-b2c0-946d68053f2b	Not Insured
ee479972-096e-4398-b90a-e7d85d4e1668	812380aa-0496-438a-a468-937227941b7d	Mrs.  NAMPALA FLORENCE	cf8905210khrrl@client.mtmicrofinance.ug	+256755794162	CF8905210KHRRL	1989-04-30	Nangabo	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-30 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-30 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	7f760486-b3bc-4544-b2c0-946d68053f2b	Not Insured
6276b14e-5378-4b6c-9a9f-122369b30da2	0e5e79bd-b62b-497d-8617-63042da74bc1	Mrs.  AMUTUHAIRWE DOROTHY	cf970621045njl@client.mtmicrofinance.ug	+256750875855	CF970621045NJL	1997-07-02	Kasangati	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-30 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-30 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	7f760486-b3bc-4544-b2c0-946d68053f2b	Not Insured
d8e76327-e950-4725-b506-93ddcd249399	806fc588-7930-42f2-b37d-43b864d04cd9	Mrs.  NAKAZIBWE DAMALI	cf88052108tndd@client.mtmicrofinance.ug	+256704884476	CF88052108TNDD	1988-04-14	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-19 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-19 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c07dbc23-224f-4cd5-9a45-cfe5b84f018c	Not Insured
9d3630c9-5c23-40e2-b423-a930b6c460dd	aae74515-1a09-4874-a4d1-b0d5fbf99680	Mrs.  NAKAFU DOCUS	cf77052108jwll@client.mtmicrofinance.ug	0000000000	CF77052108JWLL	1977-08-28	KASANGATI	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-12-06 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-12-06 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	1ed9273d-a38c-4024-9e95-302a618127d0	Not Insured
221c7115-e375-4bc3-ad03-34b5f90947cb	47cb8b23-3f16-4994-b8e6-18862a6ed990	Mrs.  NALUKWAGO FRIDA	cf87052108ue6a@client.mtmicrofinance.ug	0000000000	CF87052108UE6A	1987-01-27	SEETA.	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-10 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-10 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	9b4ed501-4b0b-4d8d-88bd-008b2ac021d3	Not Insured
efdfa42c-c3c0-440d-bd82-6d711d240af6	cfe94e4a-1db7-4e9b-829b-92144418b7ae	KEBIRUNGI ASYNANSI	cf6202710263fe@client.mtmicrofinance.ug	+256743890919	CF6202710263FE	1900-01-01	Kitengobwa	Group Loan	300000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:50:40.014302+03	2026-02-15 12:43:49.33742+03	\N	2026-02-10 16:50:40.014302+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	79400096-0357-42b9-8a89-5f9e89e0c07b	Not Insured
c257bbba-5828-42a5-95d8-4a16069034b1	679efbaa-b87d-4078-8999-fe63b8e5637c	Mrs.  KYATEREKERA CHRISTINE	cf8409410egij@client.mtmicrofinance.ug	0000000000	CF8409410EGIJ	1984-09-02	KITEGOMBA	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-20 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-20 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	fcc049b7-0fb9-41fd-afc4-0384a965e8a1	Not Insured
fe753962-363a-4ce0-a581-ae6f1b12cd0a	76e70d00-3cd1-4d72-9cca-27c091aed4fa	Mr.  Mukoli Tom	cm84030101d37a@client.mtmicrofinance.ug	+256701080011	CM84030101D37A	1984-02-20	Gayaza	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-24 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-10-24 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	9b9ce642-a628-43f1-952d-d1fb5a66f49c	Not Insured
e8abbada-5dc2-4788-82b9-d0eb744cf923	0e85cd6e-126b-4425-b34e-aaf43971cc56	Mrs.  ASONYA RASHIDAH	cf99079108znpe@client.mtmicrofinance.ug	+256705794287	CF99079108ZNPE	1999-12-18	KASANGATI, KASANGATI WAKISO DISTRICT	Group Loan	300000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-01 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-01 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	8d2dcc96-7a27-46ab-be56-7e80e17291d4	Not Insured
362a652b-ae13-414a-9bb5-a8ed883014de	ed955ea7-33a7-4c52-8b8b-e23a9be479dd	Mr.  LUGOLOBI GEORGE	cm9905210t2vxg@client.mtmicrofinance.ug	+256707727666	CM9905210T2VXG	1999-05-19	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-02 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-05-02 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	5e954c5c-71fb-4881-be3f-7db2f118d6b5	Not Insured
654c02de-853a-4d29-a5ca-3c9e2d38888f	b74b0220-e32f-4180-94af-3a5d0c7e78f2	Mrs.  NAKIBUULE ALLEN	cf9202310265kg@client.mtmicrofinance.ug	+256704340320	CF9202310265KG	1992-05-05	KAYEBE, GAYAZA	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-08-09 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-08-09 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	1774280d-a837-48dc-9e77-1be3859fe05f	Not Insured
1e442b7e-021e-4194-84f2-84679963daf8	5dcb8cc6-092b-411e-9c7a-33fc3430da19	Mukasa Sarah	cf83032100dmda@client.mtmicrofinance.ug	+256755376120	CF83032100DMDA	1900-01-01	Gayaza	Group Loan	600000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:36:21.9546+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:36:21.9546+03	[]	490000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	bf94289c-b286-4f94-967d-c549f2af2fae	Not Insured
40aa2cc0-3fe0-4029-b015-4e4aae881775	70901baf-adb9-4583-ad46-7ac5263a958f	Mr.  Musasizi Faizal	cm970081054tec@client.mtmicrofinance.ug	+256749195345	CM970081054TEC	1997-10-24	Bukemba	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-05 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-09-05 12:00:00+03	[]	351000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	117b3b12-f668-4025-8b46-c35f82f016ff	Not Insured
a16a2dab-23f0-421d-97ac-f92530324660	87194ae2-4558-439a-8588-d7a2ee112cd6	Munyangwa Ibrahim	cm83963109jfld@client.mtmicrofinance.ug	0000000000	CM83963109JFLD	1998-12-09	No Address	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-27 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-09-27 12:00:00+03	[]	287000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	7a77aa13-5676-4a96-831f-fd4679598333	Not Insured
127c783e-22a2-4213-ad46-0422cae0f12d	c237da3b-6ee7-4212-9ff8-762a1a6a4b93	Guma Ali	cm83923185jfld@client.mtmicrofinance.ug	0000000000	CM83923185JFLD	1996-12-17	No Address	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-27 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-09-27 12:00:00+03	[]	287000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	7a77aa13-5676-4a96-831f-fd4679598333	Not Insured
a093d13e-94b6-4a85-be28-1a8cff2af3fb	46c558d4-8b57-43a2-a50e-31f03904eb26	Ssebakwa Fredrick	cm93923185jfld@client.mtmicrofinance.ug	0000000000	CM93923185JFLD	1999-12-17	No Address	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-27 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-09-27 12:00:00+03	[]	287000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	7a77aa13-5676-4a96-831f-fd4679598333	Not Insured
883bec25-e38b-4e51-9101-266078dc8edf	0f7be754-2359-44de-b1f7-66ef723b60dc	Ndimu Peter	cm13923185jfld@client.mtmicrofinance.ug	0000000000	CM13923185JFLD	1999-12-22	No Address	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-27 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-09-27 12:00:00+03	[]	287000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	7a77aa13-5676-4a96-831f-fd4679598333	Not Insured
32899c96-a839-4013-842e-c92cddfc6d9b	648b5fc5-50ba-42b7-a97a-aaf5413407f7	Mr.  Nabagala Hope	cf96052100yr4l@client.mtmicrofinance.ug	+256707291103	CF96052100YR4L	1996-11-26	Busonko	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-07-27 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-07-27 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	648a03b9-9a35-4988-a6b3-0d697b8de65a	Not Insured
270d1a00-b312-4057-804e-4a6b4e2f7d45	8958a566-c8b3-4930-8577-109bf449e076	Mr.  Nyesiga Ronald	cm95009109altj@client.mtmicrofinance.ug	+256757656369	CM95009109ALTJ	1995-01-05	Bulamu	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-07-27 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-07-27 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	648a03b9-9a35-4988-a6b3-0d697b8de65a	Not Insured
c263b602-f83b-482b-af16-7c6adcf1f4e7	da82fe19-5117-4a8e-b0f3-98bad412da08	Mr.  Sebunya Brayn Kirumira	cm840521089cue@client.mtmicrofinance.ug	+256752050005	CM840521089CUE	1984-02-02	Bulamu	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-07-27 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-07-27 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	648a03b9-9a35-4988-a6b3-0d697b8de65a	Not Insured
5a445baf-f4c2-48ec-b6b0-e707da525ab1	08c99fd2-53e2-4b4a-b7f5-8aaf2b20f907	Mrs.  Namirembe Immaculate	cf83047104nyjk@client.mtmicrofinance.ug	+256740258642	CF83047104NYJK	1983-02-19	Namayina	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-06 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-09-06 12:00:00+03	[]	520000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	34e9c736-1164-4c92-8c6e-0201dd12d1ea	Not Insured
7f0f357e-3829-4b35-8018-e3434d4baef6	a9d3665a-5072-49ad-bf5c-cf919abf5390	Mrs.  NAKIBUUKA PAULINE	cf00100109pmal@client.mtmicrofinance.ug	+256753173079	CF00100109PMAL	2000-06-29	MANYANGWA	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-12 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-10-12 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	8d2800a9-7660-444a-b873-a63b574b1f3f	Not Insured
d62d2c48-c0b6-4268-b7e3-289ff8cbd2fd	40e7940e-5d87-4606-bd23-a516f636503e	Mrs.  NAMUYOMBA JOSEPHINE	cf89023109eadd@client.mtmicrofinance.ug	+256703362630	CF89023109EADD	1989-11-26	KASANGATI, KASANGATI WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-30 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-30 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c3c99ba2-dd9f-4af6-a9a6-9fcd8b41e417	Not Insured
1185be98-385f-439e-b9b6-45769ea10da4	76147086-d57b-41da-83d4-575e93f7e275	Mr.  KIGULI ABUDALLAH	cm93052108mdnk@client.mtmicrofinance.ug	+256743835240	CM93052108MDNK	1993-01-17	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-11-22 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-11-22 12:00:00+03	[]	82000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	ef6a5d39-1f61-40ea-9959-48c7fe289c5b	Not Insured
7e6be631-564e-436d-9db3-8006e69e8bed	8894dc84-80bb-40d2-925c-476c8609f515	Mr.  BIHANGANA VICENT	cm721011029moj@client.mtmicrofinance.ug	+256701130058	CM721011029MOJ	1972-04-05	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-03-31 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-03-31 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	3fc6ce3f-6543-4540-ab4c-b85cd959e0ff	Not Insured
7353dd0f-b376-4a65-ab53-a4e7465927a6	ca8b90a7-03e4-450c-9b1c-e6fa619d2413	MUYIMA MOSES	cm8203210rmj1e@client.mtmicrofinance.ug	+256749669746	CM8203210RMJ1E	1982-11-10	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-11-22 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-11-22 12:00:00+03	[]	82000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	3fc6ce3f-6543-4540-ab4c-b85cd959e0ff	Not Insured
e349ea5b-3b42-40fb-b5f3-add7ac7e43ea	64ed8cf0-3cea-4187-bad6-7780cb5b83b9	KARUNDA DAVID	cm83925105jfld@client.mtmicrofinance.ug	0000000000	CM83925105JFLD	2005-12-08	No Address	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-07-26 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-07-26 12:00:00+03	[]	355800.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	44b99547-1017-41cb-b574-854c2a3404c0	Not Insured
8007b466-852c-41bc-8eef-1d75ab05d091	906dc5cd-8041-4e1a-9a63-7fd07dd14241	Mr.  LUMU STEVEN	cm940321072mck@client.mtmicrofinance.ug	+256705584223	CM940321072MCK	1900-01-01	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:37:20.431453+03	2026-02-15 12:43:49.33742+03	\N	2026-02-10 16:37:20.431453+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	6f710c7a-ec68-4ead-aef1-0048e57b7ad8	Not Insured
277f21e9-10f7-46f6-a96f-ea12806094c3	d798d12d-4909-4ef9-8835-82f076893498	Mrs.  Nasanga Joan	cf96013100tm0f@client.mtmicrofinance.ug	+256709955079	CF96013100TM0F	1989-02-02	Nangabo	Individual Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-04-11 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-04-11 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
96f44eda-7c3b-4404-bb62-15b7d4c499c0	398d9545-0878-427b-8c1f-3c1ee8da2289	Mr.  KAYONDO JOSEPH	cm76027108k0yj@client.mtmicrofinance.ug	+256701099693	CM76027108K0YJ	1976-08-18	RUTI	Individual Loan	1000000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-08-20 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-08-20 12:00:00+03	[]	174000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
3eac460a-b3cd-42a4-8aef-de850db8a7d3	906dc5cd-8041-4e1a-9a63-7fd07dd14241	Mr.  LUMU STEVEN	cm940321072mck@client.mtmicrofinance.ug	+256705584223	CM940321072MCK	1994-06-15	Nangabo	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-07-19 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-07-19 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	6f710c7a-ec68-4ead-aef1-0048e57b7ad8	Not Insured
9184f094-fe4b-4db7-8a90-4408190db302	1147d73b-a3a5-4b38-be6a-ccf70b5da29d	Mrs.  NAYIGA JUSTINE	cf8203210029qk@client.mtmicrofinance.ug	+256745667089	CF8203210029QK	1985-07-10	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-30 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-30 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	b287907f-c7b5-45ff-8b52-a4586877fa86	Not Insured
5fe663b6-51d7-4b8a-83b5-ede7f849b8f7	56a7e770-65b6-45a2-adb9-9a4baf10f39e	Mrs.  NAWAGI JOYCE	cf85052101gehd@client.mtmicrofinance.ug	+256754121619	CF85052101GEHD	1985-07-18	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-30 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-30 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	b287907f-c7b5-45ff-8b52-a4586877fa86	Not Insured
2cc1b952-fc6f-4054-9d8a-c253dddc1dfe	1a7aecf1-f950-46b8-a064-562c7afdebe3	Mr.  muwonge fredrick	cm980321053u4j@client.mtmicrofinance.ug	+256758434882	CM980321053U4J	1998-01-16	namavumbi	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-11-11 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-11-11 12:00:00+03	[]	71000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	b113a21b-3ccd-47ef-ad69-3d84361d44bf	Not Insured
cc9746ad-c473-4f98-898c-97a751f0ee24	45d167ad-cbc8-4604-801f-80a1a78dcd0c	Mrs.  Nantale Joyce	cf8605210djnil@client.mtmicrofinance.ug	+256750647458	CF8605210DJNIL	1986-09-21	Namayina Jolwe	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-11-11 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-11-11 12:00:00+03	[]	132000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	f7355d86-f42d-4d7e-8ec0-a4425c8870e4	Not Insured
ef7c9085-2555-4b5e-af68-e897735735b0	ea118873-acc5-4939-a12e-1f9602822a57	Mrs.  Ncungwire Justine	cf83004105w9xa@client.mtmicrofinance.ug	+256740446057	CF83004105W9XA	1983-11-23	Namayina Jolwe	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-11-11 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-11-11 12:00:00+03	[]	132000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	f7355d86-f42d-4d7e-8ec0-a4425c8870e4	Not Insured
3ff8e732-8680-4586-bc3f-0964ec8475f3	157c3aee-47ce-4962-a89f-104c66fdfdd1	Mr.  Lubulwa Geofrey	cm8605210dw4df@client.mtmicrofinance.ug	+256753324861	CM8605210DW4DF	1986-04-23	Manyangwa	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-10-21 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-10-21 12:00:00+03	[]	205000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	52fbb4b1-3929-43e5-a0cd-c3f40e8df483	Not Insured
050f77fc-d8be-48a8-9cdf-eee37d129e43	334fa943-ebe3-4c12-9ee1-67b97df22c1b	Mrs.  Namagala Reticia	cf95023108azdc@client.mtmicrofinance.ug	+256746877203	CF95023108AZDC	1995-07-02	Manyangwa	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-10 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-09-10 12:00:00+03	[]	328000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	e7627f71-0935-4bba-b173-c04c108775a5	Not Insured
b1a8bc4c-a1bf-4425-b2df-b172ff4010ca	906dc5cd-8041-4e1a-9a63-7fd07dd14241	Mr.  Lumu Steven	cm85032104r7na@client.mtmicrofinance.ug	+256705584223	CM85032104R7NA	1985-01-01	Nangabo	Individual Loan	800000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-12 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-09-12 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
90b2d7cd-19b3-4ecd-8c91-437757ec21e9	8f859eb2-d773-46b3-a5f9-1e294086690e	Mr.  Muhwezi Benson	cm86009100167f@client.mtmicrofinance.ug	+256754942224	CM86009100167F	1987-08-03	Makindye	Group Loan	3000000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-01-13 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-01-13 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	1e50fded-9e59-4b2b-81b8-c1c5dcb5218b	Not Insured
5c7272b2-7b3f-4c0b-94b8-00c81b96506c	7af94da8-f9c7-4c68-ae1a-07d63cfef22b	Mrs.  NAKABUGO ANNET	cf65023103yxjg@client.mtmicrofinance.ug	+256750778022	CF65023103YXJG	1965-06-20	KIJABIJO B, KIRA TOWN COUNCIL WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-01 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-06-01 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	cd9ec41e-e172-4c25-a610-0e4f24dae739	Not Insured
f023148b-8922-47a1-b674-dd456570d587	40881955-f425-40e8-b47e-eec4d7c14dcc	Mr.  SEMPIJJA CHARLES	cm98036100tm9g@client.mtmicrofinance.ug	+256751209912	CM98036100TM9G	1998-02-26	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-01-24 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-01-24 12:00:00+03	[]	620000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	b2d0d1a2-0cf5-4560-a712-efb30cc5f5e0	Not Insured
76d60734-bfce-4247-b5c5-2d51d7b08052	43f4c8e7-4da4-4bcd-ab52-5f1fc195394d	Mr.  NYOMBI MORGAN	cm9210510738qd@client.mtmicrofinance.ug	+256750907789	CM9210510738QD	1992-03-15	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-01-24 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-01-24 12:00:00+03	[]	621000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	b2d0d1a2-0cf5-4560-a712-efb30cc5f5e0	Not Insured
fbaac12b-9ef4-4fb8-a43c-1d6eb88a8dff	5782cf3c-ffdd-4256-9cc8-8b829852f255	Mr.  WASSWA FRANK	cm91052107ypng@client.mtmicrofinance.ug	+256702905586	CM91052107YPNG	1981-12-12	KIJABIJO C	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-01-24 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-01-24 12:00:00+03	[]	661000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	cd9ec41e-e172-4c25-a610-0e4f24dae739	Not Insured
6913d478-15dd-49da-abae-be61ab1ed4dd	4785a421-9361-49a2-a4e8-0b8cb1a9358c	Mr.  Matovu Abasi	cm7202310a628d@client.mtmicrofinance.ug	+256758525104	CM7202310A628D	1972-04-19	Wampewo	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-05 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-09-05 12:00:00+03	[]	293000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	117b3b12-f668-4025-8b46-c35f82f016ff	Not Insured
fabd989a-9d72-4588-8f2f-f1940710e292	1e83cee1-e5ff-49b5-a234-902c80d48418	Nakyeyune Harriet	cf90036101lmhj@client.mtmicrofinance.ug	+256704877756	CF90036101LMHJ	1990-06-24	No Address	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-04-20 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-04-20 12:00:00+03	[]	675000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d0175b77-b2e0-489e-b802-e86b3ebb375e	Not Insured
2d6abee5-49eb-428a-885a-6cff212a62bd	62d99bb5-329f-4bfc-b0eb-45371fef45d1	Mr.  MILIMU JULIUS	cm94052105g27e@client.mtmicrofinance.ug	+256708387597	CM94052105G27E	1900-01-01	GAYAZA, KASANGATI WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:41:38.502178+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:41:38.502178+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	405af9d4-2949-4229-9069-6ae04aff939a	Not Insured
ed71e5da-ce82-4f28-8f65-8808c933446b	ca3089b8-d97e-49f3-80fb-f1d82583be2f	Mr.  Kibirige Kagenya Livingstone	cm92023104pegk@client.mtmicrofinance.ug	+256704645172	CM92023104PEGK	1992-06-02	Wampewo	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-05 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-09-05 12:00:00+03	[]	297000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	117b3b12-f668-4025-8b46-c35f82f016ff	Not Insured
09fbeb3e-d2ce-415f-818d-ab62582e4f56	ae789540-2b99-4ff0-87cb-6214b7269657	Mr.  Kibirige Tonny	cm88023101qwmc@client.mtmicrofinance.ug	+256703447068	CM88023101QWMC	1988-08-15	Bukemba	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-05 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-09-05 12:00:00+03	[]	509000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	117b3b12-f668-4025-8b46-c35f82f016ff	Not Insured
bb389172-36a9-4837-b183-38713bfeb381	a0c42ffd-5318-4561-a35b-ba93c6f47e1e	Mrs.  BABIRYE JUSTINE	cf86032106yyaj@client.mtmicrofinance.ug	+256701724009	CF86032106YYAJ	1986-04-12	KIJABIJO B, KIRA TOWN COUNCIL WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-07-21 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-07-21 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	cd9ec41e-e172-4c25-a610-0e4f24dae739	Not Insured
7fa1aae4-1308-4186-ba02-e7f9f8aa904e	4e1468c6-5480-49c2-946e-f0a87ec91b72	Mrs.  NASAKA HARRIET	cf1069720001ty4@client.mtmicrofinance.ug	0000000000	CF1069720001TY4	1971-01-26	SEETA	Group Loan	900000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-09-05 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-09-05 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	1218fac8-9ee7-4526-8d7e-e9938eb8c64d	Not Insured
51d83310-979e-4fde-bc17-1062b44421cc	579005b5-ffd5-45fc-a4ce-beda75c6d307	Mrs.  NABANJALA AISHA	cf92012100yc9j@client.mtmicrofinance.ug	+256706664571	CF92012100YC9J	1992-12-01	NALYAMAGONJA	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-08-12 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-08-12 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	04dd5726-ad7c-439b-a3da-7ce549727c4c	Not Insured
f907645e-cec1-4d6c-b1ee-d618f85a618f	4a53c947-ce66-4a96-ab80-3a63060cdd51	Mrs.  MUGERWA TEOPISTA	cf770321013amg@client.mtmicrofinance.ug	+256706800080	CF770321013AMG	1977-12-15	KASANGATI	Group Loan	900000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-08-11 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-08-11 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	bf9c113b-c0b1-4f36-ab33-64d862714bd9	Not Insured
62f7e588-0c3b-411e-9a52-4eba76232a3e	625ef4ae-3509-4568-b295-9c0550a49342	Mr.  MUGANGA LAWRENCE	cm96023105093d@client.mtmicrofinance.ug	+256754689223	CM96023105093D	1996-08-02	GAYAZA, NANGABO WAKISO DISTRICT	Group Loan	1000000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-04-22 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-04-22 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c492f6a1-91f5-4b02-862a-f06e177afdd0	Not Insured
444e3d57-79e2-41fe-af96-97fa47c6dc44	263fbec1-f903-4096-a5d6-5622ba317321	Mr.  NDOBYA FAIZO	cm70007105h6ra@client.mtmicrofinance.ug	+256704870246	CM70007105H6RA	1970-01-05	GAYAZA,KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-20 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-20 12:00:00+03	[]	82000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	4259a83d-7260-4a55-b3de-d05cd914db40	Not Insured
37833043-b4f9-4116-bf7e-5adb40a52d7a	32806bc1-5451-4f82-8e3d-0fb11b5d04c0	Mr.  KIKKO EMMANUEL	cm820821054xvd@client.mtmicrofinance.ug	+256744772049	CM820821054XVD	1982-08-17	GAYAZA,KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-20 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-20 12:00:00+03	[]	123000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	4259a83d-7260-4a55-b3de-d05cd914db40	Not Insured
73609408-283b-463f-9504-dff59d6dea83	307e0092-cbe4-4e79-8723-160066325c5f	Mr.  ANATOLI BUKENYA	cm96024103m6if@client.mtmicrofinance.ug	+256707624190	CM96024103M6IF	1996-06-04	GAYAZA,KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-20 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-20 12:00:00+03	[]	123000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	4259a83d-7260-4a55-b3de-d05cd914db40	Not Insured
7131934a-1b47-4a16-b289-ed0be139ced8	73fe437a-82dc-4bfa-b675-e9038b66b945	Mr.  ABU SENDI	cm82032104qy5j@client.mtmicrofinance.ug	+256759748041	CM82032104QY5J	1900-01-01	BUYINGA, NANGABO WAKISO DISTRICT	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:42:06.335977+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:42:06.335977+03	[]	782000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	b48f3ac7-e107-4718-82c7-0d599fb08c44	Not Insured
37d19cba-1213-46a8-8e2a-76adc755023d	ffaf7306-9024-402a-812f-e8cfbf452b15	Mr.  SSEWAGUDDE MATIA	cm93032104jqxd@client.mtmicrofinance.ug	+256700431060	CM93032104JQXD	1900-01-01	Nangabo	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:42:10.528437+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:42:10.528437+03	[]	910000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c51d4850-a604-47f2-85a4-621db6f6aa76	Not Insured
5aed1f9c-6117-4567-8a32-55e8e6d4a783	45c6041d-2a04-44cc-8bbc-0b5deeb718fa	Mr.  SSENDUSU JOHN	cm940321072mck@client.mtmicrofinance.ug	+2567056595695	CM940321072MCK	1900-01-01	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:42:18.202793+03	2026-02-15 12:43:49.33742+03	\N	2026-02-10 16:42:18.202793+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	5e954c5c-71fb-4881-be3f-7db2f118d6b5	Not Insured
af1547b9-8240-4da6-9557-c4db03acbbe0	1c1b740f-9127-4ac8-967d-4e7657f758d5	Mrs.  LUSIBA SARAH	cf650321030n4d@client.mtmicrofinance.ug	+2567045588973	CF650321030N4D	1965-10-19	KASANGATI	Individual Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-05-08 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-05-08 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
e0c8aec1-278a-4d52-aff8-bf30dd415171	a47b657c-9c3d-438e-9f7e-d0f1a3b64fa9	Mr.  OJUKA TONNY	cm89022101upmh@client.mtmicrofinance.ug	+256743508639	CM89022101UPMH	1989-12-12	KASANGATI	Group Loan	900000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-25 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-06-25 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	14b9f030-7e64-4c4e-bbe5-e62afc5fb75d	Not Insured
3e3aa39a-4932-4cfe-90cf-5d5bd973dff0	39eff60e-8121-4cfd-a5d0-5fbf2be66251	SSEBAGUDE ROBERT	cm0005210t35zf@client.mtmicrofinance.ug	+256709883751	CM0005210T35ZF	2000-03-30	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-02 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-05-02 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	5e954c5c-71fb-4881-be3f-7db2f118d6b5	Not Insured
e09c945c-cbc5-4435-b9af-ea20e5cc41bc	94012aca-ff17-43d8-b19f-e63584518fef	Mr.  BAGAMBANE ERIA	cm9605210j1vnc@client.mtmicrofinance.ug	+256750046881	CM9605210J1VNC	1996-05-17	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-02 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-05-02 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	5e954c5c-71fb-4881-be3f-7db2f118d6b5	Not Insured
bb5d29b1-d810-44de-be70-63ff355a9403	fb3a1d2d-9b7d-4810-81c2-821a163861fc	Mrs.  NAJJINDA JAMILAH	cf880991027qrk@client.mtmicrofinance.ug	+256707054848	CF880991027QRK	1996-09-09	Manyangwa	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-01 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-05-01 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	ceacef27-27e8-499d-acb2-3f2da47b7c07	Not Insured
cb9a768b-fe67-43fb-9d52-f1679994d625	f973fba1-f08e-475c-8c93-f563c490a8b2	Mrs.  NAKYANZI TEOPISTA	cf8003210nm3ql@client.mtmicrofinance.ug	+256751827755	CF8003210NM3QL	1980-05-05	Nangabo	Group Loan	900000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-01 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-05-01 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	1ed9273d-a38c-4024-9e95-302a618127d0	Not Insured
bbb59c75-a533-4353-be3a-2fee804c25cd	c64cbbc8-d7d2-4be4-bebf-ea02a215b3bd	MUSISI GODREY	cm96068107edxc@client.mtmicrofinance.ug	+256706014136	CM96068107EDXC	1996-07-06	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-08 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-05-08 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	03e891d5-a7aa-4cdb-b8b7-924977d827cd	Not Insured
3cbc847b-121a-45e0-ad60-8307281f38d4	a6e68834-a3d4-4bc0-b6b2-4331c29bf58c	KABOMBO MOSES	cm84106103zwud@client.mtmicrofinance.ug	+256753950117	CM84106103ZWUD	1994-02-02	No Address	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-08 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-05-08 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	03e891d5-a7aa-4cdb-b8b7-924977d827cd	Not Insured
a17f6f30-f463-4267-abf2-d507533884bc	31bf468f-08a1-4fbb-94e4-f6d1576d770a	KASUMBA FRANK	cm89069101q62k@client.mtmicrofinance.ug	+256750614106	CM89069101Q62K	1989-02-12	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-08 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-05-08 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	03e891d5-a7aa-4cdb-b8b7-924977d827cd	Not Insured
0250a90f-872e-4a6c-8431-9c13e436fc22	0d5df0a6-dbb4-4293-a78b-0d530d70be23	MUTAHUNGWA JULIUS	cm9005210c2m6c@client.mtmicrofinance.ug	+256756480351	CM9005210C2M6C	1990-08-18	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-08 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-05-08 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	03e891d5-a7aa-4cdb-b8b7-924977d827cd	Not Insured
41806d40-0712-47a1-8037-475b557ebe7c	741863cf-8fdd-4fb6-8a41-3853729e6abb	MBEINE FRED	cm9410115u4lh@client.mtmicrofinance.ug	+256700969403	CM9410115U4LH	1994-11-08	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-08 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-05-08 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	03e891d5-a7aa-4cdb-b8b7-924977d827cd	Not Insured
b71f12b6-7c4c-46b5-9283-76617a1a8e70	20f9fd31-d371-4a1e-b565-aefb4717fee8	Mrs.  NAGAYI SHAMIM	cf89000101vahg@client.mtmicrofinance.ug	+256741963106	CF89000101VAHG	1989-01-01	KASANGATI	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-26 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-05-26 12:00:00+03	[]	561000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	5bdc86a2-9fad-48c9-a95e-7733d966b250	Not Insured
1678826e-01d1-4cf1-9cfe-e3b19c57183f	e2596d67-6092-49ed-b5dc-865a52834e61	Mr.  TINKA ROBERT KARUHANGA	cm8606210738na@client.mtmicrofinance.ug	+256703626692	CM8606210738NA	1986-11-21	MANYANGWA, NANGABO	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-26 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-05-26 12:00:00+03	[]	440000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d143326b-76e6-42ab-a8fa-9e4c471949d0	Not Insured
e6c531e8-fdb1-4dc8-9698-21c4b2f360d9	2ba10315-d0bf-48f4-ad76-0cf9600a2872	Mr.  SSEBUNZA LAWRENCE	cm9905210rqe9k@client.mtmicrofinance.ug	+256704374163	CM9905210RQE9K	1999-06-21	KASANGATI, NANGABO WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-26 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-05-26 12:00:00+03	[]	480000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d143326b-76e6-42ab-a8fa-9e4c471949d0	Not Insured
d1c9536c-af9a-4f7c-9b0d-e0fa7074823d	1fbcf621-f968-47a8-a149-f43dbaa58017	Mr.  BOSIKO FERESI	cm75018109xr9f@client.mtmicrofinance.ug	+256705106435	CM75018109XR9F	1975-07-15	KASANGATI, NANGABO WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-28 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-05-28 12:00:00+03	[]	480000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d143326b-76e6-42ab-a8fa-9e4c471949d0	Not Insured
7b23c0eb-822d-4729-88d1-3ee9e9217c3e	ddf4f0d8-be59-4455-81dc-f017e34d22b1	Mr.  KIBUKA RASHID	cm0502710dmcpe@client.mtmicrofinance.ug	+256743751310	CM0502710DMCPE	2005-06-24	GAYAZA, KASANGATI WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-03 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-03 12:00:00+03	[]	164000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	a6cdb14e-5e38-4ee6-afa8-b1575154c136	Not Insured
3bfd62a4-580f-462e-947c-d16c09d6663b	affcd6c5-46ef-4296-a420-e5ceb413d547	Mr.  KARUNGI SHAFIK	cm93099102gf3e@client.mtmicrofinance.ug	+256703764870	CM93099102GF3E	1993-04-15	GAYAZA, NANGABO WAKISO DISTRICT	Individual Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-24 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-05-24 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
b3fb64ac-5c94-4b98-aca2-8c8aca91cbc6	6cdf61ef-3704-480a-bddf-e43ee1632d60	Mr.  MBALAGA ERIC	cm95052104mokh@client.mtmicrofinance.ug	+256748274317	CM95052104MOKH	1995-05-05	NAMAYINA JOLWE, KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-21 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-05-21 12:00:00+03	[]	525000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	e8758606-77ae-4657-a77f-a0442f0f2bf4	Not Insured
75fabbc8-9eaa-41f7-9013-766876d1cafe	2a59fe45-d8cc-4e13-9585-4d74196d0a17	Mr.  KIMBUGWE ROBERT	cm91098105wdqa@client.mtmicrofinance.ug	+256742646117	CM91098105WDQA	1991-07-08	MANYANGULA,GAYAZA WAKISO DISTRICT	Group Loan	600000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-27 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-05-27 12:00:00+03	[]	555500.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d7a05a70-b69d-4295-bfdb-94234c6bee25	Not Insured
7b67e47b-1cb5-4ddd-867e-3222defe9d31	2be1a302-1789-46a6-8178-efe933c5ab4a	Mr.  KAMOGA HUSSEIN	cm8605210xmk9d@client.mtmicrofinance.ug	+256754787039	CM8605210XMK9D	1986-08-26	GAYAZA	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-31 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-05-31 12:00:00+03	[]	199000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	9e9209b1-3ccf-40d6-882a-57dbff88623d	Not Insured
b80e40d9-358b-4872-a9fb-827e216f511c	e5a6f7b3-ff2e-4af1-afb3-2139a575f3de	Mr.  MWEBE JOHN	cm04052110h6ze@client.mtmicrofinance.ug	+256753856515	CM04052110H6ZE	2004-01-07	KASANGATI	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-31 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-05-31 12:00:00+03	[]	176000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	9e9209b1-3ccf-40d6-882a-57dbff88623d	Not Insured
647d4b18-87b2-40bd-9ff5-e4e9a3dcb2ef	86f9f8d8-2a98-4a27-b349-c24ac684e5eb	Mrs.  NAKIWALA OLIVIA	cf60068103e05k@client.mtmicrofinance.ug	+256741884026	CF60068103E05K	1960-04-04	KIJABIJO C	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-19 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-05-19 12:00:00+03	[]	182000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	cd9ec41e-e172-4c25-a610-0e4f24dae739	Not Insured
11d966fa-c15a-4d2c-ac48-2bedf541a2c1	6586ade0-754f-4ac5-8e64-f3160c8007e3	Mr.  KIGOZI FRED	cm740321074kwa@client.mtmicrofinance.ug	+256700861817	CM740321074KWA	1974-01-12	GAYAZA, KASANGATI WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-03 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-03 12:00:00+03	[]	451000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	8c06799b-85ee-4dd2-abee-005db62f8fa0	Not Insured
a0cbbebc-e133-487e-8b1c-91033c2934e0	109670e4-bef6-4d76-966c-c23afdc5dd9d	Mrs.  AZZIZAH SARAH RAMADHAN	cm94010104255f@client.mtmicrofinance.ug	+2567056670420	CM94010104255F	1994-03-14	GAYAZA, KASANGATI WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-03 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-06-03 12:00:00+03	[]	435000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	8c06799b-85ee-4dd2-abee-005db62f8fa0	Not Insured
f9e39086-e376-4616-8ecd-d69fe46dcf38	8767d46a-e55b-43d5-8733-70fe75d39bc8	Mr.  KAHINGA ALEX	cm8903610cclrl@client.mtmicrofinance.ug	+256701830570	CM8903610CCLRL	1900-01-01	Gayaza	Individual Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:44:11.30707+03	2026-02-15 12:43:49.33742+03	\N	2026-02-10 16:44:11.30707+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
349cb57f-fe6c-4611-8913-c5d7663b2337	41ebce67-b19b-4f6a-be39-05f21f5ab67f	Mr.  BRIGHT WILSON	cm74048107ceq@client.mtmicrofinance.ug	+256704400930	CM74048107CEQ	1900-01-01	Kasangati	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:44:12.158299+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:44:12.158299+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	14b9f030-7e64-4c4e-bbe5-e62afc5fb75d	Not Insured
4c6e743d-b9ca-4edc-856c-747dffb39d6a	2a68ef83-3cae-4aa3-91eb-9148763a0bff	Mr.  LUKWAGO ALEX	cm87100100ykye@client.mtmicrofinance.ug	0000000000	CM87100100YKYE	1900-01-01	KASANGATI	Individual Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:44:22.23323+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:44:22.23323+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
d6eacc5e-657b-4893-abe2-dd5e935a802e	058382f1-7377-445e-a5d9-025dc8817d55	Mr.  NGOBI FALUKU	cm99100109n2vl@client.mtmicrofinance.ug	+256703105879	CM99100109N2VL	1900-01-01	KASANGATI	Group Loan	300000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:44:25.762574+03	2026-02-15 12:43:49.33742+03	\N	2026-02-10 16:44:25.762574+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	54d83bfa-8ff0-4619-9b06-1f097bcf5052	Not Insured
01b8e328-55c4-4e4b-8af5-89db334983fa	3b445c66-3cb4-4005-bad1-7f1dd38f8469	Mr.  NTUME CHRISTOPHER	cm92032106zulj@client.mtmicrofinance.ug	+256787581727	CM92032106ZULJ	1992-12-02	GAYAZA A	Individual Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-04 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-06-04 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
5cee2e23-a6aa-4e98-86d1-c1035d64093a	eb785a79-408e-47a9-83f3-24d30f9ff734	Mrs.  NALUTAAYA MADINAH	cf8705210r3cqa@client.mtmicrofinance.ug	+256751445443	CF8705210R3CQA	1987-12-01	KASANGATI	Group Loan	900000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-04-16 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-04-16 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	54e0cb59-5146-41ba-a3fd-cdd0fe08f728	Not Insured
eade4de9-0e38-4f68-81d2-c16b4661117f	50757186-4423-491a-9398-dfb0c703eb72	SEBAGALA NASIF	cm00099107u8wh@client.mtmicrofinance.ug	+256757961403	CM00099107U8WH	2000-01-10	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-04-19 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-04-19 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	dc38e270-793e-4df8-a329-693df312f86c	Not Insured
527dfffd-94e8-4ef5-ba58-9167c49a6248	30559a2e-3a3e-4fa1-916f-13844785a13a	Mr.  MAYANJA DERRICK	cm99100109n2vl@client.mtmicrofinance.ug	+256745922959	CM99100109N2VL	1999-09-09	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-04-19 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-04-19 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	54d83bfa-8ff0-4619-9b06-1f097bcf5052	Not Insured
3808a34a-8976-4b9a-8578-529ce1e2d077	fe11a0df-308f-43b9-908e-17b84eff55b8	NANKYA AMINAH	cf8205210trejf@client.mtmicrofinance.ug	+256755841500	CF8205210TREJF	1982-01-20	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-11-26 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-11-26 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c00cf54c-75c1-495a-9b4f-d6b83ed4f22a	Not Insured
414986b2-b371-4f64-a1cc-4e47cd4f9327	a0c42ffd-5318-4561-a35b-ba93c6f47e1e	Mrs.  BABIRYE JUSTINE	cf86032106yyaj@client.mtmicrofinance.ug	+256701724009	CF86032106YYAJ	1900-01-01	KIJABIJO B, KIRA TOWN COUNCIL WAKISO DISTRICT	Group Loan	300000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:45:10.677939+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:45:10.677939+03	[]	275000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	cd9ec41e-e172-4c25-a610-0e4f24dae739	Not Insured
f1625e8e-3507-4c40-8e3e-bbd1516483c1	011c5550-c6d5-4470-96eb-f18682382295	Mr.  NYANZI DAVID	cm6905210rdnjg@client.mtmicrofinance.ug	+256751840100	CM6905210RDNJG	1969-03-18	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-04-28 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-04-28 12:00:00+03	[]	280000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	f6691e1d-412a-4af5-8236-1d34b8cfe3ac	Not Insured
bac5ea31-6b09-46e4-a437-1fc0b130a6ae	c123af7d-86e9-4bd0-a968-273b4291dc40	Mrs.  NIGHT HANIFAH	cf75047106uaal@client.mtmicrofinance.ug	+256702488433	CF75047106UAAL	1975-05-27	MANYANGWA	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-04-03 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-04-03 12:00:00+03	[]	439000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	6349d69f-f2c3-46eb-9b43-c38417e7d037	Not Insured
cffda4c3-243a-412c-b1a3-e1d4af852ea5	2cbc3f0b-d1cd-4b72-b43d-b4142b004395	Mrs.  NAKIBUUKA RITAH	cf9309110479a@client.mtmicrofinance.ug	+256702670438	CF9309110479A	1993-10-19	KIRINYABIGO	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-04-03 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-04-03 12:00:00+03	[]	455000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	04dd5726-ad7c-439b-a3da-7ce549727c4c	Not Insured
c5c6aff8-6461-4d86-9f88-e00222ff2ea8	8ed1ce66-1da6-4dea-b98b-0efbd8566a8d	Mr.  SENDEGEYA SAKA	cm83047108eqna@client.mtmicrofinance.ug	+256756124401	CM83047108EQNA	1900-01-01	GAYAZA, NANGABO WAKISO DISTRICT	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-12 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-10-12 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c492f6a1-91f5-4b02-862a-f06e177afdd0	Not Insured
fbc68ff8-3e20-42eb-a293-8e2f8a86d3db	5144948a-9f9e-4085-bc13-ba202f45ef93	Mr.  KASOLO DANIEL	cm92082105n20f@client.mtmicrofinance.ug	+256759845552	CM92082105N20F	1992-10-25	KSANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-04-28 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-04-28 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	f6691e1d-412a-4af5-8236-1d34b8cfe3ac	Not Insured
64e26f14-09a5-4957-95fc-fcd8fefa9e1c	82ee432e-e4ce-4bf9-9337-979589163295	Mr.  KAYUZA ALI	cm790941044q9k@client.mtmicrofinance.ug	+256757880909	CM790941044Q9K	1979-05-26	KASANGATI, NANGABO WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-04-03 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-04-03 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	dc38e270-793e-4df8-a329-693df312f86c	Not Insured
fb7525cd-b7dc-42bd-8b08-fe46826eeb05	1e944c16-4cd3-4745-bc61-46ccac667064	Mrs.  NAMBOOZE FAUZIA	cf740521087gpa@client.mtmicrofinance.ug	+256758366002	CF740521087GPA	1974-01-01	KAZINGA, WAKISO	Group Loan	600000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-04-09 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-04-09 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	89d76d9c-f08d-4ff5-873a-c0643e55899b	Not Insured
730342f6-3ae8-41e3-b63a-49c7005451f1	2e8ff03f-83de-4c6b-ac2e-e6e78d875384	Mr.  SENFUKA NICHOLAS	cm9705210j2kff@client.mtmicrofinance.ug	+256709742351	CM9705210J2KFF	1900-01-01	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:45:28.880442+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:45:28.880442+03	[]	679000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	5bdc86a2-9fad-48c9-a95e-7733d966b250	Not Insured
d13b321e-6f57-4d36-8519-4ad05dc860e9	f3ea030a-f08b-422a-971e-e9096db37e2a	Mr.  KAWOOYA NASHIL	cm8503010gphth@client.mtmicrofinance.ug	+256702939259	CM8503010GPHTH	1985-11-14	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-11-05 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-11-05 12:00:00+03	[]	519000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	5bdc86a2-9fad-48c9-a95e-7733d966b250	Not Insured
04117a48-8871-4397-b962-348645a96fc2	30a61edc-4fd5-4fb0-9dc6-e42e9f9ec279	Mr.  TENYWE HARUNAH	cm80023106x9ng@client.mtmicrofinance.ug	+2567560518662	CM80023106X9NG	1900-01-01	GAYAZA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:45:49.662087+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:45:49.662087+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	7a5366a4-d167-40f2-9d1d-af7a716ceb8c	Not Insured
575efa9f-77a3-4d83-8002-e52a015b505a	9aba298e-7052-4829-abd2-6e4e4bcbfdcb	Mrs.  NAKIMERA JUSTINE	cf69030105xexe@client.mtmicrofinance.ug	+256743837984	CF69030105XEXE	1969-10-10	SEETA.	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-11-05 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-11-05 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	460b662b-78c8-42d2-ab74-d27236d4fda0	Not Insured
973f6999-23d6-47e4-820f-36ebf5ece4b1	2d24444a-7549-46fc-9f34-ef7539ff7d34	Mrs.  NAKATO FLORENCE	cf78012104k64e@client.mtmicrofinance.ug	+256746410469	CF78012104K64E	1978-08-19	SEETA.	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-11-05 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-11-05 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	460b662b-78c8-42d2-ab74-d27236d4fda0	Not Insured
a5636414-7288-4805-b687-38ccfd8fb0e9	6818310f-fbd9-49f6-bd5c-1e9040efa485	Mrs.  NAKAMYA FIINA	cf920471021pxc@client.mtmicrofinance.ug	+256701179824	CF920471021PXC	1992-10-12	SEETA.	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-11-05 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-11-05 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	460b662b-78c8-42d2-ab74-d27236d4fda0	Not Insured
740bac3b-812b-4793-a2cf-9137b09c7959	59b8403c-e62a-4c52-b8e1-5990f90caae6	Mrs.  MUTESI MAURINE	cf73075100wnlk@client.mtmicrofinance.ug	+256759875394	CF73075100WNLK	1973-12-15	GAYAZA	Group Loan	2000000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-11-05 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-11-05 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d6bea06b-2b57-44fe-b4ab-5f6030f35d66	Not Insured
cccb500c-af29-4c08-91b7-61451c170092	78647bc5-2391-41df-b2ab-4e0dcf417e94	Mrs.  NAMAGEMBE JOSEPHINE	cf0405210qrfhh@client.mtmicrofinance.ug	0000000000	CF0405210QRFHH	2004-01-08	NAKWERU	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-11-05 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-11-05 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	fb0d7217-759c-4335-8802-5dd3d5885aa7	Not Insured
ee3754d5-643b-4b82-bb96-bb0caa15361e	bee09d47-3ccf-40f7-a58b-65ea385c52c7	Mr.  SEKIZIYIVU IBRAHIM	cm79023104jcec@client.mtmicrofinance.ug	+256751500820	CM79023104JCEC	1979-11-20	GAYAZA B, KYADONDO WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-03-01 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-03-01 12:00:00+03	[]	10000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	8d9406d8-7ab3-4814-8010-b093ff095667	Not Insured
05eca129-20c6-4e42-a40a-3b6c79154bc9	2440bea4-eed8-4be6-9416-8936269b315e	Mr.  DDUMBA PETER	cm98068108j81k@client.mtmicrofinance.ug	+256755532306	CM98068108J81K	1998-04-13	GAYAZA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-12 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-10-12 12:00:00+03	[]	1347000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	f814de04-057d-4e2c-a82f-3acd755585f2	Not Insured
f56bb33f-95f7-4759-b7c1-67a6e409e430	00412331-e81b-42e6-8cd1-6eda658a259f	KARUHANGA CHRISTOPHER	cm931011068fqh@client.mtmicrofinance.ug	+256752213079	CM931011068FQH	1993-03-18	Gayaza	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-12 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-10-12 12:00:00+03	[]	120000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	f814de04-057d-4e2c-a82f-3acd755585f2	Not Insured
8b4513cc-cf15-4ad3-becc-7a3f46e2034f	7c98dd28-ceac-43d7-b7ca-5e79a0fb9423	Mrs.  NALULE IMMACULATE	cf86100102gw5e@client.mtmicrofinance.ug	+256741023839	CF86100102GW5E	1986-11-15	BULAMU	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-08-23 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-08-23 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	3c7d6a8c-8c79-41f6-b3dd-c6698e4977f9	Not Insured
113cb43d-edba-473c-ac33-61727cd6d4d6	ffce31d1-e0aa-40d8-a12b-8297986997c3	Mr.  KABUGO YUSUFU	cm84017101n7mh@client.mtmicrofinance.ug	+256754039331	CM84017101N7MH	1984-01-28	GAYAZA B, KYADONDO WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-12 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-10-12 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	8d9406d8-7ab3-4814-8010-b093ff095667	Not Insured
2f0ce844-0ead-49f7-8ce6-bb6c0d13040b	eff1ac0d-68ae-4320-ba77-598232062b39	Mr.  KIBIRANGO MEDI	cm7505210duj3g@client.mtmicrofinance.ug	+256708225037	CM7505210DUJ3G	1975-06-11	GAYAZA B, KYADONDO WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-12 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-10-12 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	8d9406d8-7ab3-4814-8010-b093ff095667	Not Insured
041aef01-36c1-47fb-b110-f660fb912fce	52b239b8-26f9-432e-919e-60b77283914b	Mrs.  NAKULIMA EDITH	cf9005210c67pf@client.mtmicrofinance.ug	+256703374798	CF9005210C67PF	1990-11-23	GAYAZA	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-10 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-10 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c7cc325e-f267-4407-9678-d474ef57e33e	Not Insured
4e371985-8ade-4f63-be1a-cc30197a7677	bf727a21-c74a-4cc5-ad62-9243ad0098b2	Mrs.  NANKYA ROSE	cf810231080gpj@client.mtmicrofinance.ug	+256756239010	CF810231080GPJ	1991-10-07	GAYAZA	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-10 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-10 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c7cc325e-f267-4407-9678-d474ef57e33e	Not Insured
8703b017-210a-4620-a5a6-6506872f2a74	9033a25b-d580-453d-a954-f5a489167e93	Mrs.  KYAZIKE MAGRET	cf8605210r547f@client.mtmicrofinance.ug	+256705585501	CF8605210R547F	1991-11-09	GAYAZA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-01 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-01 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	583e4b91-3578-471f-b42a-f4257ef83c12	Not Insured
2946e793-b029-4312-a375-9aaa27182741	1d2eba9c-e1d3-4b09-aa8c-5aa56d76dfee	Mrs.  TUSIIME JOANITA	cf86006101wqec@client.mtmicrofinance.ug	0000000000	CF86006101WQEC	1986-05-15	GAYAZA A	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-12 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-10-12 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	94f186b1-e78f-4a0c-8b17-342e5a2218cf	Not Insured
74d4ef1c-de3f-441a-a62c-9f7ac85b858f	b2f9fc1c-a7a2-433c-b95a-a46fdc55f1f9	Mrs.  NAMUKWAYA OLIVIA	cf84052102lcqk@client.mtmicrofinance.ug	+256703240279	CF84052102LCQK	1984-06-20	GAYAZA A	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-12 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-10-12 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	94f186b1-e78f-4a0c-8b17-342e5a2218cf	Not Insured
6ef7c5b5-43ad-480c-b6c7-c7e34d34a868	4bae7252-d05c-4562-8944-0898ca5b9817	Mrs.  NANKYA JALIA	cf9202610224zk@client.mtmicrofinance.ug	+256752965745	CF9202610224ZK	1992-04-02	GAYAZA A	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-12 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-10-12 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	94f186b1-e78f-4a0c-8b17-342e5a2218cf	Not Insured
7a3d59f1-15c6-4615-a790-4ff716271c90	c94a5039-8249-4130-9fb5-c7ed1949294a	NALUMULI ROBINAH	cf77052106djmc@client.mtmicrofinance.ug	+256741354448	CF77052106DJMC	1977-05-05	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-12 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-10-12 12:00:00+03	[]	600000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	4ccdf462-a8c2-4c25-a178-d433511bd936	Not Insured
2e86811a-b2cb-4dd8-b90a-1994d33f6121	8b5da675-0aad-4af3-ad32-4cb50572622d	Mrs.  NANYONGA ZAINA	cf0305210npjyg@client.mtmicrofinance.ug	0000000000	CF0305210NPJYG	2003-12-05	SEETA	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-10 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-10 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	1218fac8-9ee7-4526-8d7e-e9938eb8c64d	Not Insured
de6acb94-488c-4716-a7dd-857c48d6a2fc	8ae68040-c08f-47a7-9418-df5a62997c81	Mrs.  NALULE AMINA	cf84093102mwaa@client.mtmicrofinance.ug	0000000000	CF84093102MWAA	1984-01-01	SEETA	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-10 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-10 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	1218fac8-9ee7-4526-8d7e-e9938eb8c64d	Not Insured
2751548c-fce7-4fac-a187-08d95f9ecad3	0d7a345c-f063-446b-bc86-6c0c74dba4c5	Mrs.  NAMPIJJA LINDA	cf95068101epad@client.mtmicrofinance.ug	0000000000	CF95068101EPAD	1995-05-05	SEETA	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-10 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-10 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	1218fac8-9ee7-4526-8d7e-e9938eb8c64d	Not Insured
d5926f05-a23c-4ca0-851c-7b0fa08f3087	68d5c85d-6714-4f08-bf5f-163d94dc487a	Mrs.  NANSAMBA MARGRET	cf820121040x7l@client.mtmicrofinance.ug	+256709290140	CF820121040X7L	1982-04-14	SEETA.	Group Loan	300000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-10 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-10 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	1218fac8-9ee7-4526-8d7e-e9938eb8c64d	Not Insured
8f609bf4-2833-40e7-b56b-4a71c92449e0	9280697f-f63c-41f4-89df-baf1d8477e89	Mr.  MAWANDA SHAFIK	cm0203210kgnxh@client.mtmicrofinance.ug	0000000000	CM0203210KGNXH	2002-12-28	WAMPEEOO	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-10 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-10 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	1218fac8-9ee7-4526-8d7e-e9938eb8c64d	Not Insured
ab6666ed-fe18-4b64-9095-d513ddb0cb86	d89dee60-1781-44ff-ad5f-993a2b4318aa	Namuyobo Monica	cf82094101yw6f@client.mtmicrofinance.ug	+256741804554	CF82094101YW6F	1982-07-15	No Address	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-24 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-10-24 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	7c278ac5-160e-4d7c-90be-219f58e7fd3c	Not Insured
c073a8a5-1bc4-483d-bd5b-6966ee7994ef	22475371-f76b-4883-bebb-04f76bccea35	Mrs.  Ssekitoleko Prossy	cf67047104xp5j@client.mtmicrofinance.ug	+256708663832	CF67047104XP5J	1967-09-01	Gayaza	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-24 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-10-24 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	7c278ac5-160e-4d7c-90be-219f58e7fd3c	Not Insured
bf8dd89a-02d2-46b9-a64b-6856b76127de	c8115791-4eb3-4354-91fe-c7e75ca428b4	NAKANWAGI ANNET	cm990521j44af@client.mtmicrofinance.ug	+256753286217	CM990521J44AF	1900-01-01	BUYINJA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-19 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-19 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	78f8afb3-a791-4996-8849-98b95d1c2b52	Not Insured
1c5563b5-eb81-4b2e-93e1-cf933021255c	0e909348-0d0f-40bb-a690-73d05672b399	Miss  Nalwada Phionah	cf91017100nlcd@client.mtmicrofinance.ug	+256758967479	CF91017100NLCD	1900-01-01	No Address	Group Loan	800000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:48:03.335021+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:48:03.335021+03	[]	1110500.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d0175b77-b2e0-489e-b802-e86b3ebb375e	Not Insured
fcedc59d-4c03-46b0-87b1-febca5213e98	90ec65bf-2af6-41fe-b342-e0b1942ecab3	NAMULI DIANAH	cf91069100ek8g@client.mtmicrofinance.ug	+256757396334	CF91069100EK8G	1991-09-05	GAYAZA, KASANGATI WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-29 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-29 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	6684615c-0622-4959-996c-c25abbbcb433	Not Insured
4526fcd4-78e4-43bc-9306-d4bf51eed61c	67b924b7-aa0b-41db-9f22-be7a14bbcbe2	Mrs.  NABIRYE SYLVIA	cf88007103p4fa@client.mtmicrofinance.ug	0000000000	CF88007103P4FA	1988-05-04	KAZINGA	Group Loan	200000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-30 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-30 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	b67834e6-01af-4e73-8c18-c31038861fa3	Not Insured
15176c2e-0eb8-4778-97a3-e12facf51b67	8ed1ce66-1da6-4dea-b98b-0efbd8566a8d	Mr.  SENDEGEYA SAKA	cm83047108eqna@client.mtmicrofinance.ug	+256756124401	CM83047108EQNA	1900-01-01	GAYAZA, NANGABO WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:48:10.545729+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:48:10.545729+03	[]	90000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c492f6a1-91f5-4b02-862a-f06e177afdd0	Not Insured
085c26e7-85b2-4ec4-ae82-5d18bd7a7cb0	13a5af1f-ff6f-422e-b220-f09c82ec42d8	Mrs.  NASOZI JOYCE	cf7605210augmh@client.mtmicrofinance.ug	+256760117577	CF7605210AUGMH	1976-02-14	BULAMU, KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-08-09 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-08-09 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	226ee447-910e-4171-ab0a-8d0f4c9bfc85	Not Insured
941b25db-3e64-4a17-90a7-d2003baa89c2	685174a7-f301-4f56-98bd-d9ab0d21c04d	Mrs.  NAKAGGWA MILLY	cf670231001adf@client.mtmicrofinance.ug	+256775534341	CF670231001ADF	1967-02-03	KITEGOMBWA, KASANGATI	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-08-09 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-08-09 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	a6d5a9b8-67d0-44a7-afd0-a6d43539c9e4	Not Insured
90957878-1f58-4d4e-bd5c-f4e8d8a79c86	a638170e-2831-4803-a289-6bc2365619c9	Mrs.  TWIKIRIZE ALLEN	cf94106102uahj@client.mtmicrofinance.ug	+256758107938	CF94106102UAHJ	1994-03-20	KITEGOMBWA, KASANGATI	Group Loan	200000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-03-15 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-03-15 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	a6d5a9b8-67d0-44a7-afd0-a6d43539c9e4	Not Insured
640f50f4-14df-42bf-b6bb-341b96b91382	cfe94e4a-1db7-4e9b-829b-92144418b7ae	KEBIRUNGI ASYNANSI	cf6202710263fe@client.mtmicrofinance.ug	+256743890919	CF6202710263FE	1962-08-18	Kitengobwa	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-08-09 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-08-09 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	79400096-0357-42b9-8a89-5f9e89e0c07b	Not Insured
6ec2e666-576f-41fd-b448-83af7edd0e34	f973fba1-f08e-475c-8c93-f563c490a8b2	Mrs.  NAKYANZI TEOPISTA	cf8003210nm3ql@client.mtmicrofinance.ug	+256751827755	CF8003210NM3QL	1900-01-01	Nangabo	Group Loan	800000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:48:57.577723+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:48:57.577723+03	[]	918000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	1ed9273d-a38c-4024-9e95-302a618127d0	Not Insured
9d6cd0f5-3042-4987-89ec-0c12960390e8	e952954c-d1a6-4a27-8544-74ab9382d413	Mrs.  NALUBEGA JOWERIA	cf8803610420qj@client.mtmicrofinance.ug	+256705894706	CF8803610420QJ	1988-11-16	No Address	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-30 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-07-30 12:00:00+03	[]	40000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	962113b8-5235-48bf-ad60-ac55eaa9247b	Not Insured
a21746a8-bc92-4c6d-8934-f6ed23380677	a1f9c4b6-1bc2-48c9-af4b-2349c9a9a146	Mrs.  NABAALE ROBINAH	cf830691022xyh@client.mtmicrofinance.ug	+256740173928	CF830691022XYH	1988-09-01	KASANGATI, NANGABO WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-01 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-01 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	dbc13a30-eac7-4136-8cda-9d0cfea2f7d9	Not Insured
672a2562-43dd-4778-b046-6862b67276da	73906246-c2cf-4de6-bbc2-f4ce77ea7e1f	Mr.  BUULE SWALIKI	cm96099103jokf@client.mtmicrofinance.ug	+256700984624	CM96099103JOKF	1996-03-14	KAZINGA, WAKISO	Group Loan	300000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-01 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-01 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	89d76d9c-f08d-4ff5-873a-c0643e55899b	Not Insured
b321d006-1f60-427c-a30e-0c13c86debdd	ff4e0d95-46e5-4d3d-8d36-08c2e6adebf9	Mrs.  TWESIGYE EMMACULATE	cf3025210ahae@client.mtmicrofinance.ug	+256701341438	CF3025210AHAE	1983-05-02	KAZINGA, WAKISO	Group Loan	300000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-01 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-01 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	89d76d9c-f08d-4ff5-873a-c0643e55899b	Not Insured
53ff958a-232c-4686-a03c-1fb5c7a697fe	f973fba1-f08e-475c-8c93-f563c490a8b2	Mrs.  NAKYANZI TEOPISTA	cf8003210nm3ql@client.mtmicrofinance.ug	+256751827755	CF8003210NM3QL	1900-01-01	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:49:02.859832+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:49:02.859832+03	[]	690000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	1ed9273d-a38c-4024-9e95-302a618127d0	Not Insured
e71dff5d-bef5-4736-a676-f134fed5a5d9	71a9a58d-ad1c-46d1-b9ed-2e8a4b2dedc2	Mrs.  AWORI VIVIAN	cf0303910lyrxh@client.mtmicrofinance.ug	+256709523727	CF0303910LYRXH	1900-01-01	Bulamu	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:49:10.721982+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:49:10.721982+03	[]	70000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	ceacef27-27e8-499d-acb2-3f2da47b7c07	Not Insured
57fcd618-ea95-468a-aaf3-e68a3494ab19	fb3a1d2d-9b7d-4810-81c2-821a163861fc	Mrs.  NAJJINDA JAMILAH	cf880991027qrk@client.mtmicrofinance.ug	+256707054848	CF880991027QRK	1900-01-01	Manyangwa	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:49:13.297309+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:49:13.297309+03	[]	105000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	ceacef27-27e8-499d-acb2-3f2da47b7c07	Not Insured
553e8e22-5b12-4a2e-8a97-317d2c0b6348	16fbb71e-32dc-4d1b-8610-07ab5997e3fd	Mrs.  NAISANGA JOAN	cf96013100tmof@client.mtmicrofinance.ug	+256756064927	CF96013100TMOF	1900-01-01	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:49:14.599544+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:49:14.599544+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	5b16a75f-7136-43e4-8368-19c4ffc3b753	Not Insured
890f925e-6480-4f57-9313-0b5c8f978503	7361aa03-3224-4942-a9f7-b80133bd0fdb	Mrs.  NALWANGA MAGRET	cf89082103ttvl@client.mtmicrofinance.ug	+256756004443	CF89082103TTVL	1900-01-01	NAKWERO	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:49:15.925546+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:49:15.925546+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	5b16a75f-7136-43e4-8368-19c4ffc3b753	Not Insured
53d78c3b-aa0b-40f6-b6cb-8e8e94b36a8b	0ce0f4e3-3a92-4791-af27-b0bc893b940b	Mrs.  NAMATA CHRISTINE	cf0002310lhqih@client.mtmicrofinance.ug	+256741017506	CF0002310LHQIH	1900-01-01	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:49:17.22962+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:49:17.22962+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	5b16a75f-7136-43e4-8368-19c4ffc3b753	Not Insured
c2215823-ef9a-49ad-a284-38d3ce1a6583	9694dc5a-5796-40c3-9968-ae576b8fa9be	Mrs.  KOBUSINGYE SHEEBAH	cf9804810da81e@client.mtmicrofinance.ug	+256708337483	CF9804810DA81E	1900-01-01	NAKWERO	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:49:18.519734+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:49:18.519734+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	5b16a75f-7136-43e4-8368-19c4ffc3b753	Not Insured
cbba7229-ff62-4624-a56a-5d58068f9a92	d784e00b-e785-4b04-bc82-a34785d0c908	NAMAGEMBE RITAH	cf92030104k18e@client.mtmicrofinance.ug	+256702146840	CF92030104K18E	1992-12-26	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-19 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-19 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c07dbc23-224f-4cd5-9a45-cfe5b84f018c	Not Insured
a019b917-03cb-474e-820e-5f0ee3186827	8fbef6ce-3250-492d-bdd1-f72e061182fa	Mrs.  BIRABWA BETTY	cf8304910gzyhk@client.mtmicrofinance.ug	+256700709469	CF8304910GZYHK	1983-05-11	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-19 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-19 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c07dbc23-224f-4cd5-9a45-cfe5b84f018c	Not Insured
6a5763fa-674f-4261-a0cc-bae482d7a205	5e3404a4-b756-4d44-b56f-753468047cc0	Mrs.  WATERA JOAN	cf870911049vac@client.mtmicrofinance.ug	+256706997408	CF870911049VAC	1987-05-06	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-19 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-19 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c07dbc23-224f-4cd5-9a45-cfe5b84f018c	Not Insured
044f83e2-43e8-40e1-9dcf-b6aea15b9e70	24c1a2a5-6a2f-4cc3-a236-6f74c1e062d6	NABUKALU FARIDAH	cf8203210029qg@client.mtmicrofinance.ug	+256758216051	CF8203210029QG	1995-05-10	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-19 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-19 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	6aafb38d-3639-4df4-b1b1-6ee086bba70e	Not Insured
48e164e3-c839-493b-97ab-284b90ee7eec	1029a4ef-1606-43f5-9f96-6cc3b376df83	Mrs.  NAMATOVU PROSSY	cf95105101q8nk@client.mtmicrofinance.ug	+256706294537	CF95105101Q8NK	1995-07-12	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-19 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-19 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	6aafb38d-3639-4df4-b1b1-6ee086bba70e	Not Insured
c35460bc-188b-4831-b0b0-24dca85cf080	38a402ee-bf41-4712-9e29-fad0c93a564e	Mrs.  NAMUGERWA SULAINAH	cf9600810d003c@client.mtmicrofinance.ug	+256753368991	CF9600810D003C	1996-07-11	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-19 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-19 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	6aafb38d-3639-4df4-b1b1-6ee086bba70e	Not Insured
6569edff-3192-43d8-b0b6-bb1ba9fa4818	a00de490-37a3-4c94-b0b7-c4aaa0f8d6f4	Miss  MAKOHA ELIZABETH	cf75009105fv1g@client.mtmicrofinance.ug	+256754204406	CF75009105FV1G	1975-03-15	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-19 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-19 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	6aafb38d-3639-4df4-b1b1-6ee086bba70e	Not Insured
d5e9b448-3cd4-4a00-b4e9-2c7c776ec8d6	31a4c41c-290f-4f21-b04d-ebb5a2c470ae	Mrs.  NANKUMBA SARAH	cf92047105y81a@client.mtmicrofinance.ug	0000000000	CF92047105Y81A	1900-01-01	Nangabo	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:49:08.575756+03	2026-02-15 12:43:49.33742+03	\N	2026-02-10 16:49:08.575756+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	ceacef27-27e8-499d-acb2-3f2da47b7c07	Not Insured
b9ea107d-14f7-4ab9-85e0-1b2568f6b314	dc69bdc3-f49d-4959-abdc-b41ab2a40fc8	Mr.  KIBUUKA RAJAB	cm90052104jf2g@client.mtmicrofinance.ug	+256700699864	CM90052104JF2G	1990-01-01	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-19 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-19 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	1ed9273d-a38c-4024-9e95-302a618127d0	Not Insured
b32ee15c-59de-45b5-82f9-13c2be12e01b	27f9b303-2121-442f-a819-ea603a0a7af9	Mr.  KASAANA JORAN	cm86017100e9af@client.mtmicrofinance.ug	+256752162492	CM86017100E9AF	1986-11-04	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-01-24 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-01-24 12:00:00+03	[]	621000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	614c86c9-588f-46e8-9e16-85d10eb41f14	Not Insured
2594f69e-916d-4c3e-9b8b-bf6107259798	aae1f352-fb5f-4324-9b80-ac959ae65ab0	Mr.  MWETISE GODFREY	cm00101109nzqd@client.mtmicrofinance.ug	+256742841972	CM00101109NZQD	2000-06-02	GAYAZA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-01-17 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-01-17 12:00:00+03	[]	498000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c7453e20-6e49-4e9b-8447-91116b3c5b1d	Not Insured
a88b4a49-49c2-48c8-a054-bc339aa1bf4d	527b9b72-1c0e-430b-8851-f86880d16f0d	Mr.  BYAKATONDA WILLIAM	cm860271017044@client.mtmicrofinance.ug	0000000000	CM860271017044	1996-02-10	NANGABO	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-01-17 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-01-17 12:00:00+03	[]	459000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c7453e20-6e49-4e9b-8447-91116b3c5b1d	Not Insured
a2171cf5-c35c-409b-b057-ac15829cc0bf	05081c52-bc29-474b-a472-54b87f315df5	Mr.  MUGUME KATUNGI HAKIM	cm9202410f52ze@client.mtmicrofinance.ug	+256705464490	CM9202410F52ZE	1992-12-25	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-01-17 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-01-17 12:00:00+03	[]	497000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c7453e20-6e49-4e9b-8447-91116b3c5b1d	Not Insured
a91d97b8-d6a5-4054-b834-b8e74a928a7d	b89ae05f-3330-45e8-95c2-e297a600e86a	Mr.  MUKWAAYA DENNIS	cm89105100phre@client.mtmicrofinance.ug	+256754254112	CM89105100PHRE	1989-11-21	GAYAZA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-01-17 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-01-17 12:00:00+03	[]	528000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c7453e20-6e49-4e9b-8447-91116b3c5b1d	Not Insured
a1e9341c-1c5b-480f-941d-9cc5fd938253	aed117fe-2ffa-46da-99a0-144dcb8463ba	Mrs.  NAMUBIRU FATUMA	cf9302310m6n2f@client.mtmicrofinance.ug	0000000000	CF9302310M6N2F	1900-01-01	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:49:32.523805+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:49:32.523805+03	[]	542000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	6349d69f-f2c3-46eb-9b43-c38417e7d037	Not Insured
dc511a65-f5bc-4759-a0b4-3dd947aa2e13	6899dfe9-e78c-4b95-8f49-fa748a6d4eaf	Mr.  OKIRU PAUL	cm96032103mt2c@client.mtmicrofinance.ug	+256757260816	CM96032103MT2C	1900-01-01	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:49:37.607218+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:49:37.607218+03	[]	621000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	9e9209b1-3ccf-40d6-882a-57dbff88623d	Not Insured
253f9de9-48e5-4110-8069-d3e7ffb5401a	c84958cf-6d5e-4a35-be2d-58e052148331	Mrs.  NALUWOOZA JULIET BUKENYA	cf780241034gch@client.mtmicrofinance.ug	+256702868907	CF780241034GCH	1900-01-01	KAZINGA	Individual Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:50:01.347983+03	2026-02-15 12:43:49.33742+03	\N	2026-02-10 16:50:01.347983+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
8de855bf-f46f-4a0c-8e36-2984a537b299	1e83cee1-e5ff-49b5-a234-902c80d48418	Mrs.  NAKYEYUNE HARRIET	cf90036101lmhj@client.mtmicrofinance.ug	+256704877756	CF90036101LMHJ	1900-01-01	KASANGATI	Individual Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:50:03.786845+03	2026-02-15 12:43:49.33742+03	\N	2026-02-10 16:50:03.786845+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
de9422ef-b147-4c5f-9440-3d17cf7255b1	0dd9b35b-c1c1-4bcb-95c4-beef479dcdfe	Mr.  TAYEBWA FRANCIS	cm93068102961l@client.mtmicrofinance.ug	+256701822472	CM93068102961L	1993-05-15	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-01-17 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-01-17 12:00:00+03	[]	660000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	9e9209b1-3ccf-40d6-882a-57dbff88623d	Not Insured
ead8827a-e441-464d-b43c-e17c7f5062f1	0a67145e-b52c-4876-828d-41b6bea77285	Mr.  DOOMA IVAN MUKISA	cm95008102jq9e@client.mtmicrofinance.ug	+256744848944	CM95008102JQ9E	1995-07-07	GAYAZA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-01-17 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-01-17 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	aaa8897d-23c1-445f-8b15-3a2219b4659a	Not Insured
9b443429-2098-4c95-aba7-a8b2ccb5026a	97f1821f-e715-493f-80fd-518476e706ad	Mr.  KABEGA DEO	cm950081048y5f@client.mtmicrofinance.ug	+256754486190	CM950081048Y5F	1990-07-17	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-01-17 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-01-17 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	aaa8897d-23c1-445f-8b15-3a2219b4659a	Not Insured
61c6e18f-33dc-4084-a87c-693788ed5df7	ad985c89-3b57-4414-bb67-c429ba6d0a14	Mr.  KASAGA MOSES	cm9709102efah@client.mtmicrofinance.ug	+256754315261	CM9709102EFAH	1997-08-12	GAYAZA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-01-17 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-01-17 12:00:00+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	aaa8897d-23c1-445f-8b15-3a2219b4659a	Not Insured
e4b39db8-35af-4f69-a265-67b8823a8590	6b72a43c-7f84-4ce5-9e79-2cce4be67e8f	Mr.  SONKO SULAIMAN	cm98052104vh6j@client.mtmicrofinance.ug	+256706531588	CM98052104VH6J	1998-02-05	GAYAZA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-01-24 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-01-24 12:00:00+03	[]	635000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	b2d0d1a2-0cf5-4560-a712-efb30cc5f5e0	Not Insured
3726f272-9dd2-4dd6-8e75-825bb08614e1	cca07c5e-d413-41a1-a33d-2f138ada2414	Mr.  TWINOMUGYISHA BENSON	cm91046101q4tj@client.mtmicrofinance.ug	+256700921376	CM91046101Q4TJ	1900-01-01	KSANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:50:09.093165+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:50:09.093165+03	[]	675000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	7713df8d-0dd0-4287-ae93-ce44c370ed48	Not Insured
68d579e1-bc82-4014-969e-c5187a68f889	06cba71b-fcf7-40fb-9144-cb23ea80f9ca	Mr.  LUWAGA CHARLES	cm9103210apole@client.mtmicrofinance.ug	+256701676785	CM9103210APOLE	1900-01-01	Kasangati	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:50:20.871884+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:50:20.871884+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	471782b5-3337-45f2-812e-bb1fa1e589ea	Not Insured
28fbd84c-a219-46d0-a994-09f020795bbb	affcd6c5-46ef-4296-a420-e5ceb413d547	Mr.  KALUNGI SHAFIK	cm9018210apole@client.mtmicrofinance.ug	+256703764870	CM9018210APOLE	1900-01-01	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:50:23.779203+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:50:23.779203+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	471782b5-3337-45f2-812e-bb1fa1e589ea	Not Insured
16933078-b5cc-46d4-9284-568c882a2c94	e4fb1c94-f4dd-4d86-a7be-69536d578546	Mr.  SSEKIYUVI WILBERFORCE	cm76023100lvpf@client.mtmicrofinance.ug	+256704534271	CM76023100LVPF	1900-01-01	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:50:25.227744+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:50:25.227744+03	[]	650000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	471782b5-3337-45f2-812e-bb1fa1e589ea	Not Insured
451bb9b4-f0b1-48c8-aa97-8d1d425e99c1	dc3bf79c-9256-47b9-b1c2-ae0cc73d1b01	Mr.  NDIDDE KHALID	cm9003210p0ajj@client.mtmicrofinance.ug	+256743856542	CM9003210P0AJJ	1990-09-12	KASANGATI	Group Loan	800000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-01-17 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-01-17 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	54e0cb59-5146-41ba-a3fd-cdd0fe08f728	Not Insured
bedac1fb-309f-4473-9aa4-034db89746d5	2440bea4-eed8-4be6-9416-8936269b315e	DDUMBA PETER	cm98068108j81k@client.mtmicrofinance.ug	+256755532306	CM98068108J81K	1900-01-01	Gayaza	Individual Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:50:34.407506+03	2026-02-15 12:43:49.33742+03	\N	2026-02-10 16:50:34.407506+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
0a981e56-601f-4b9a-9b44-2e73d28ed2a4	48f55493-1190-4e86-b4e4-d3fa3f26b8a0	Mrs.  NAKAYIZA LILLIAN	cf95068105w3hc@client.mtmicrofinance.ug	+256708073912	CF95068105W3HC	1900-01-01	NAKASAJJA, KYAMPISI NUKONO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:50:35.2649+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:50:35.2649+03	[]	693000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	b48f3ac7-e107-4718-82c7-0d599fb08c44	Not Insured
76d91c02-945a-4433-b71c-e1ff98f1f39f	4835ca46-2cef-4d34-a686-160af1ba3c8e	Mrs.  NTONGO JOYCE	cf0005210uqe5k@client.mtmicrofinance.ug	+256709908326	CF0005210UQE5K	2000-09-11	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-01-31 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-01-31 12:00:00+03	[]	675000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d736eba4-ded0-47d6-b2a3-b138422f1c17	Not Insured
d938eaa9-181a-4433-9fff-decf489b6de0	192f54cf-2a8b-4ae2-bbca-aa662285445b	Mr.  Happy James	cm910841026cxa@client.mtmicrofinance.ug	+256742996948	cm910841026CXA	1991-01-01	Gayaza B	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-03-15 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-03-15 12:00:00+03	[]	30000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	a263fb3e-db28-4e0c-8c33-cb365495b423	Not Insured
c526f89b-05e6-4271-a6d9-e1ed43b91e7c	53101c52-9e48-49bc-a11b-01f487676219	Mr.  MUKISA ROBERT	cm860821062c9k@client.mtmicrofinance.ug	+256744068200	CM860821062C9K	1900-01-01	GAYAZA, NANGABO WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:50:42.130841+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:50:42.130841+03	[]	691000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	bf7147f5-a11f-49a2-8577-3d1b572d10e5	Not Insured
48934361-b228-4a13-9e4d-ba72f782f260	eff1ac0d-68ae-4320-ba77-598232062b39	Mr.  KIBIRANGO MEDI	cm7505210duj3g@client.mtmicrofinance.ug	+256708225037	CM7505210DUJ3G	1900-01-01	GAYAZA B, KYADONDO WAKISO DISTRICT	Group Loan	800000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:50:53.841596+03	2026-02-15 12:43:48.676328+03	\N	2026-02-10 16:50:53.841596+03	[]	40000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	8d9406d8-7ab3-4814-8010-b093ff095667	Not Insured
c8339996-4641-4714-89f1-ae8ef42601f6	22475371-f76b-4883-bebb-04f76bccea35	Mrs.  Ssekitoleko Prossy	cf67047104xp5j@client.mtmicrofinance.ug	+256708663832	CF67047104XP5J	1900-01-01	Gayaza	Group Loan	600000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:50:36.608621+03	2026-02-15 12:43:49.33742+03	\N	2026-02-10 16:50:36.608621+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	7c278ac5-160e-4d7c-90be-219f58e7fd3c	Not Insured
06671dd1-4dbd-4b0e-a773-dad182d5014c	5f149cac-16b0-47f0-8a7e-e777c3d48d4b	Twikirizze Allen	cf94106102uahj@client.mtmicrofinance.ug	+256709752960	CF94106102UAHJ	1900-01-01	Kitegombwa	Group Loan	150000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:50:39.164259+03	2026-02-15 12:43:49.33742+03	\N	2026-02-10 16:50:39.164259+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	79400096-0357-42b9-8a89-5f9e89e0c07b	Not Insured
2fcfa113-60b8-40b0-9f76-d4e3841fc269	83dc39d8-adf0-4fb9-a877-94e47c784f86	Mr.  KIJALI JOVAN	cm97017102fuje@client.mtmicrofinance.ug	+256759627909	CM97017102FUJE	1900-01-01	GAYAZA B, KYADONDO WAKISO DISTRICT	Group Loan	800000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:50:50.765942+03	2026-02-15 12:43:49.33742+03	\N	2026-02-10 16:50:50.765942+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	8d9406d8-7ab3-4814-8010-b093ff095667	Not Insured
ccf8db83-54a0-4d63-addb-f830b96e2840	ffce31d1-e0aa-40d8-a12b-8297986997c3	Mr.  KABUGO YUSUFU	cm84017101n7mh@client.mtmicrofinance.ug	+256754039331	CM84017101N7MH	1900-01-01	GAYAZA B, KYADONDO WAKISO DISTRICT	Group Loan	800000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2026-02-10 16:50:52.963701+03	2026-02-15 12:43:49.33742+03	\N	2026-02-10 16:50:52.963701+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	8d9406d8-7ab3-4814-8010-b093ff095667	Not Insured
0956b03d-203d-46a8-9e89-9b2cc5f8733d	4a5d4fad-1cb9-4122-97eb-f7e19410f79e	Kyohairwe Joyce	cf86027100k92h@client.mtmicrofinance.ug	+256758508405	CF86027100K92H	1986-04-09	kazinga	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-05-08 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-05-08 12:00:00+03	[]	216000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	b287907f-c7b5-45ff-8b52-a4586877fa86	Not Insured
84a37533-78ca-4479-aefb-f6a71565e01a	c6fda488-f990-4169-a897-02e397ba568e	Mr.  KYAMBADDE THOMAS	cm86030011046zck@client.mtmicrofinance.ug	+256759555953	CM86030011046ZCK	1986-07-10	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-02 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-05-02 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	5e954c5c-71fb-4881-be3f-7db2f118d6b5	Not Insured
a71ea413-d800-4079-a7f8-5f5bf15ca804	bff1c1fd-b256-4995-933c-e327f91bc6de	Mr.  Lubwama Ivan	cm9803210mr5cl@client.mtmicrofinance.ug	+256750852283	CM9803210MR5CL	1998-10-07	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-07 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-05-07 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	6f710c7a-ec68-4ead-aef1-0048e57b7ad8	Not Insured
234dc189-87a4-4ee3-8296-8706f3468c43	02b0f6e5-3f63-491a-b954-daace6346205	Mr.  Ssenkungu Ronald	cm790304ly3d@client.mtmicrofinance.ug	+256753117971	CM790304LY3D	1979-05-16	Nangabo	Individual Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-05-05 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-05-05 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
e662c9d3-9327-410a-bc53-3febc94743ef	8767d46a-e55b-43d5-8733-70fe75d39bc8	Mr.  KAHINGA ALEX	cm8903610cclrl@client.mtmicrofinance.ug	+256701830570	CM8903610CCLRL	1989-05-10	Gayaza	Individual Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-06-04 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-06-04 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
4bb78fd5-8b22-40fa-9cc8-d71b373b79ab	e4d722e7-934f-47cd-b9ba-b8c1f8cfcc08	Mr.  MWESIGWA INNOCENT	cm93036105cp0f@client.mtmicrofinance.ug	+256705490711	CM93036105CP0F	1993-08-28	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-04-19 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-04-19 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	54d83bfa-8ff0-4619-9b06-1f097bcf5052	Not Insured
65086d2e-cf16-4f68-95a4-ee2156c9ee81	f418cad4-e07c-4a28-aa93-b5c0441db7cb	Mr.  KAWEESA IBRA	cm9403010c8tze@client.mtmicrofinance.ug	+256707683511	CM9403010C8TZE	1900-01-01	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-04-28 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2025-04-28 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	f6691e1d-412a-4af5-8236-1d34b8cfe3ac	Not Insured
1909fc14-25e8-49fd-bb83-8318f1244cfe	cefb49b4-276b-4a58-9417-bbc2b325cbf8	Mrs.  KENEHERA HARRIET	cf77010103vzze@client.mtmicrofinance.ug	+256779416177	CF77010103VZZE	1977-06-17	SEETA.	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-11-05 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-11-05 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	460b662b-78c8-42d2-ab74-d27236d4fda0	Not Insured
429f61bc-3ecb-4316-8274-6cbcbb7b32a9	5f764476-2d30-45b5-b5a0-873db80f6159	Mrs.  AJOLORWOTH FAITH	cf98033107q3cg@client.mtmicrofinance.ug	0000000000	CF98033107Q3CG	1998-12-13	KASANGATI	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-12 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-10-12 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	7f760486-b3bc-4544-b2c0-946d68053f2b	Not Insured
0c1929c2-5e52-4186-b4e5-86bd5eac72ab	5fabe3f8-0c46-4fa3-9124-99e7995da45f	Mrs.  NAKAWESI AMINAH	cf88026101m0hd@client.mtmicrofinance.ug	+256704888445	CF88026101M0HD	1998-05-12	KASANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-08-23 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-08-23 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	3c7d6a8c-8c79-41f6-b3dd-c6698e4977f9	Not Insured
b8d1dd27-e9b9-4edf-a7fa-ae7da9d7b81f	8d21cb2a-9bea-4b88-8d86-bb6ace6668bb	Mrs.  NAKYANZI SHAMIM	cf9703210k4vdc@client.mtmicrofinance.ug	+256701345025	CF9703210K4VDC	1997-05-25	GAYAZA	Individual Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-10-12 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-10-12 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
ea759525-fadc-495a-999a-ce58adfde415	5622c419-73a7-422f-8035-0c9fc604958e	Mrs.  NAMBOWA ROSE	cf86052113yhle@client.mtmicrofinance.ug	+256703913188	CF86052113YHLE	1986-11-11	Gayaza	Group Loan	700000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-12-06 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-12-06 12:00:00+03	[]	703000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	1ed9273d-a38c-4024-9e95-302a618127d0	Not Insured
c1945641-c587-461a-9d35-346f6124e69d	d081a228-9b53-4678-8649-6d4343dfcb4d	Mrs.  NATUKUNDA FORTUNATE	cf0003410mrqmk@client.mtmicrofinance.ug	+256753473060	CF0003410MRQMK	2000-11-13	MANYANGWA	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-01-24 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-01-24 12:00:00+03	[]	594000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	6349d69f-f2c3-46eb-9b43-c38417e7d037	Not Insured
174271e6-136e-45f5-9c14-993cd2e2c2ff	e499b5b7-c4ad-4e35-9a60-92ebfa3cf33f	Mr.  WASSWA DERRICK	cm9801010fyn8g@client.mtmicrofinance.ug	+256707580024	CM9801010FYN8G	1998-09-02	KSANGATI	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-01-31 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-01-31 12:00:00+03	[]	701000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	7713df8d-0dd0-4287-ae93-ce44c370ed48	Not Insured
84a6a025-039d-4db7-bf44-b5a770590e69	3e2549bb-bb3a-4877-ad65-51322aa44640	Mrs.  NAKABUGO PROSSY	cf89052105kz8k@client.mtmicrofinance.ug	+256743510730	CF89052105KZ8K	1989-09-17	KIJABIJO B, KIRA TOWN COUNCIL WAKISO DISTRICT	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-02-18 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-02-18 12:00:00+03	[]	594000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	14f96b5f-f9f9-4aa5-866b-0a1cc6936d41	Not Insured
ce41dbab-d5bb-4680-bb78-200ba7dad71f	27798bc7-cb83-4bba-a8ca-0f2f28d71893	Mr.  BIRE SHARIF	cm980601087c4c@client.mtmicrofinance.ug	+256742294734	CM980601087C4C	1998-02-05	MANYANGULA,GAYAZA WAKISO DISTRICT	Group Loan	300000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2025-03-01 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2025-03-01 12:00:00+03	[]	414875.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d7a05a70-b69d-4295-bfdb-94234c6bee25	Not Insured
21980a51-0d2d-47a8-8bfa-da46eebb9c77	3a7fdba4-7ee7-4587-9e1b-604b2fe563b8	Nambasi Kenneth	cm9405110mel8k@client.mtmicrofinance.ug	+256755944901	CM9405110MEL8K	1994-03-11	No Address	Group Loan	300000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-04-20 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-04-20 12:00:00+03	[]	148500.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	cf7ec8b0-176a-4fcc-af08-ec25e85404e7	Not Insured
0bb8ad00-7350-48a8-adf1-ebaacd659917	0e909348-0d0f-40bb-a690-73d05672b399	Miss  Nalwada Phionah	cf91017100nlcd@client.mtmicrofinance.ug	+256758967479	CF91017100NLCD	1991-11-09	No Address	Group Loan	300000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-04-20 12:00:00+03	2026-02-15 12:43:48.676328+03	\N	2024-04-20 12:00:00+03	[]	396000.00	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	d0175b77-b2e0-489e-b802-e86b3ebb375e	Not Insured
b85f2855-3e7b-4556-aff9-fda2a9483e98	2e35e7ef-d91e-465c-8646-164db82e9503	Mrs.  NANYONJO HASIFAH	cf79024103e8wu@client.mtmicrofinance.ug	+256773267484	CF79024103E8WU	1979-06-19	WAMPEEOO	Individual Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-04-08 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-04-08 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Not Insured
a0747ac6-5eb1-4c02-9ed6-99eef98c2052	59b47db3-ea3b-43d3-a4b4-066ec97197b3	Mrs.  NABAKKA SAUDAH	cf8001210a9djk@client.mtmicrofinance.ug	+256750868057	CF8001210A9DJK	1980-10-20	KASANGATI, NANGABO WAKISO DISTRICT	Group Loan	400000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-09-01 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-09-01 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	962e8fcf-7d9b-4a8c-8edd-20925a3ef920	Not Insured
6f7760cb-4736-4220-9359-15826d4cc9c2	ff30f926-2e6b-4a5b-89d5-29beeee48358	Mrs.  NAKIBOWA VICTORIA	cf86030101dtdc@client.mtmicrofinance.ug	0000000000	CF86030101DTDC	1986-04-05	Nangabo	Group Loan	500000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-12 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-12 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	93886694-9dcc-4bc9-b428-377c1ef8208c	Not Insured
0dbd0080-0c4a-466f-aee4-67868c959155	67a687ea-fbae-4e24-88d8-8a24ae43d1bb	Mr.  NSUBUGA YAHAYA	cm7505210ayxxa@client.mtmicrofinance.ug	+256755111221	CM7505210AYXXA	1975-08-26	Nangabo	Group Loan	150000.00	4	Agricultural Loan	Self-Employed	\N	\N	disbursed	\N	\N	2024-07-19 12:00:00+03	2026-02-15 12:43:49.33742+03	\N	2024-07-19 12:00:00+03	[]	0	\N	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	c07dbc23-224f-4cd5-9a45-cfe5b84f018c	Not Insured
\.


--
-- Data for Name: loan_products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.loan_products (id, name, code, description, min_amount, max_amount, min_duration_months, max_duration_months, base_interest_rate, processing_fee_percentage, late_payment_penalty_rate, status, created_at, updated_at, application_fee, admission_fee, processing_fee, passbook_fee, insurance_rate, security_deposit_rate, monitoring_fee_rate, late_payment_penalty, restructuring_fee_low, restructuring_fee_high, restructuring_threshold) FROM stdin;
51e3e2c8-9bca-4595-9fab-63fa633083b5	Individual Loan	IND_LOAN	\N	150000	2000000	4	6	0	0	0	active	2026-02-11 15:09:00.705139+03	2026-02-11 15:12:30.939938+03	0	10000	15000	0	1.0	10	3	10000	30000	60000	600000
6de4e2a3-88c5-4f13-b777-a26faf39fe2e	Group Loan	GRP_LOAN	\N	150000	2000000	4	6	0	0	0	active	2026-02-11 15:09:00.705139+03	2026-02-11 15:12:30.939938+03	0	10000	15000	0	1.0	10	3	10000	30000	60000	600000
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, title, message, type, read, created_at) FROM stdin;
\.


--
-- Data for Name: product_performance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_performance (id, product_id, period_start, period_end, total_applications, approved_applications, rejected_applications, total_disbursed, average_loan_amount, default_rate, created_at) FROM stdin;
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.profiles (id, full_name, phone_number, created_at, updated_at, first_name, last_name, email, role) FROM stdin;
a9c3e1ee-7c5c-4289-b123-575d8bec610f	Loan Officer	\N	2026-02-11 15:49:41.256759+03	2026-02-11 15:49:41.256759+03	Loan	Officer	\N	client
70e0ab1e-d1e9-40a0-bdf6-373ffcced22e	Admin User	\N	2026-02-11 15:49:41.39353+03	2026-02-11 15:49:41.39353+03	Admin	User	\N	client
5a218cd8-8534-4318-9dec-f25dff525f79	Kapere Sam	\N	2026-02-10 16:36:25.053599+03	2026-02-10 16:36:25.053599+03	\N	\N	\N	client
87194ae2-4558-439a-8588-d7a2ee112cd6	Munyangwa Ibrahim	\N	2026-02-10 16:36:26.428767+03	2026-02-10 16:36:26.428767+03	\N	\N	\N	client
c237da3b-6ee7-4212-9ff8-762a1a6a4b93	Guma Ali	\N	2026-02-10 16:36:27.834986+03	2026-02-10 16:36:27.834986+03	\N	\N	\N	client
46c558d4-8b57-43a2-a50e-31f03904eb26	Ssebakwa Fredrick	\N	2026-02-10 16:36:29.129955+03	2026-02-10 16:36:29.129955+03	\N	\N	\N	client
0f7be754-2359-44de-b1f7-66ef723b60dc	Ndimu Peter	\N	2026-02-10 16:36:30.531256+03	2026-02-10 16:36:30.531256+03	\N	\N	\N	client
08c99fd2-53e2-4b4a-b7f5-8aaf2b20f907	Mrs.  Namirembe Immaculate	+256740258642	2026-02-10 16:36:36.979991+03	2026-02-10 16:36:36.979991+03	\N	\N	\N	client
0d3a6b23-e637-4c45-bc7d-b0bcef2741d6	Mr.  LUKWAGO HENRY MUKASA	+256749760027	2026-02-10 16:36:44.778949+03	2026-02-10 16:36:44.778949+03	\N	\N	\N	client
ca8b90a7-03e4-450c-9b1c-e6fa619d2413	MUYIMA MOSES	+256749669746	2026-02-10 16:36:46.0632+03	2026-02-10 16:36:46.0632+03	\N	\N	\N	client
76147086-d57b-41da-83d4-575e93f7e275	SSERUNJOGI STEVEN	+256743835240	2026-02-10 16:36:41.530334+03	2026-02-10 16:36:47.381931+03	\N	\N	\N	client
64ed8cf0-3cea-4187-bad6-7780cb5b83b9	KARUNDA DAVID	\N	2026-02-10 16:36:49.113648+03	2026-02-10 16:36:49.113648+03	\N	\N	\N	client
8894dc84-80bb-40d2-925c-476c8609f515	Mr.  BIHANGANA VICENT	+256701130058	2026-02-10 16:36:43.47542+03	2026-02-10 16:42:13.974386+03	\N	\N	\N	client
d798d12d-4909-4ef9-8835-82f076893498	Mrs.  Nasanga Joan	+256709955079	2026-02-10 16:37:11.527272+03	2026-02-10 16:37:12.383419+03	\N	\N	\N	client
398d9545-0878-427b-8c1f-3c1ee8da2289	Mr.  KAYONDO JOSEPH	+256701099693	2026-02-10 16:37:14.912537+03	2026-02-10 16:37:16.201912+03	\N	\N	\N	client
ca678f80-cca3-4630-afc8-1a53a3d8624d	Mr.  NDAWULA ALI	+256752122248	2026-02-10 16:36:50.382567+03	2026-02-10 16:41:27.488918+03	\N	\N	\N	client
1147d73b-a3a5-4b38-be6a-ccf70b5da29d	Mrs.  NAYIGA JUSTINE	+256745667089	2026-02-10 16:37:21.790773+03	2026-02-10 16:37:21.790773+03	\N	\N	\N	client
56a7e770-65b6-45a2-adb9-9a4baf10f39e	Mrs.  NAWAGI JOYCE	+256754121619	2026-02-10 16:36:38.750709+03	2026-02-10 16:37:22.664275+03	\N	\N	\N	client
a0ed9630-5c89-4325-8741-daed1f6f16b9	Mr.  LUTALO BEN HAZARD	+256759242419	2026-02-10 16:36:58.714104+03	2026-02-10 16:45:50.509118+03	\N	\N	\N	client
4778602d-e5f5-48d3-a87f-6f65c318613d	Mr.  KIDEDE PAUL	+256705844698	2026-02-10 16:37:26.562728+03	2026-02-10 16:37:26.562728+03	\N	\N	\N	client
ff5dc921-d909-4c4d-a770-4d3e2872c9e7	Mr.  MUGULA ISMA	+256701628176	2026-02-10 16:36:53.026391+03	2026-02-10 16:41:47.895174+03	\N	\N	\N	client
85fb9db8-ec17-4b2b-8a68-46c80b20dd4d	GUMISIRIZA GODFREY	+256753378593	2026-02-10 16:36:40.023015+03	2026-02-10 16:37:29.239511+03	\N	\N	\N	client
cf4d9289-0a0e-4d1f-b041-a1c2b935bb4b	Mrs.  NANDUTU OLIVIER	+256705707903	2026-02-10 16:37:30.603161+03	2026-02-10 16:37:30.603161+03	\N	\N	\N	client
b6fe01e8-d76e-4768-aee3-a579608e9704	Mr.  NDYANABO EMMA	+256746380789	2026-02-10 16:37:31.910004+03	2026-02-10 16:37:31.910004+03	\N	\N	\N	client
20522b0d-0de3-4869-aa3f-5cfee56a032e	Mrs.  NAMUSISI BEATRICE	+256754599451	2026-02-10 16:37:37.045251+03	2026-02-10 16:37:37.045251+03	\N	\N	\N	client
87ad863b-9d24-4e06-94e8-6ad589708b8b	Mr.  SSEKIDE HASSAN	+256741002924	2026-02-10 16:37:47.381556+03	2026-02-10 16:42:15.246132+03	\N	\N	\N	client
fff172ab-ba0e-4c81-b24c-b95745eae361	Mr.  SSENTONGO GODFREY	+256703522841	2026-02-10 16:37:42.213235+03	2026-02-10 16:37:42.213235+03	\N	\N	\N	client
45c6041d-2a04-44cc-8bbc-0b5deeb718fa	Mr.  SSENDUSU JOHN	+2567056595695	2026-02-10 16:37:18.743086+03	2026-02-10 16:49:03.733428+03	\N	\N	\N	client
906dc5cd-8041-4e1a-9a63-7fd07dd14241	Mr.  Lumu Steven	+256705584223	2026-02-10 16:37:14.08314+03	2026-02-10 16:42:47.289011+03	\N	\N	\N	client
461d76e8-03a5-4ddc-8021-b89f84d1fcb1	Mrs.  KARUNGI JULIET	+256743885283	2026-02-10 16:37:53.531313+03	2026-02-10 16:44:32.756075+03	\N	\N	\N	client
3af8c53e-0147-4274-9e44-8cd8ae16a030	Mrs.  Nakabuye Hajarah	+256752586048	2026-02-10 16:37:50.402153+03	2026-02-10 16:37:50.402153+03	\N	\N	\N	client
244a8883-eef2-4d96-a8b1-bee4d15a1bf9	Mrs.  Tibesigwa Ritah	+256705107643	2026-02-10 16:37:54.829523+03	2026-02-10 16:37:54.829523+03	\N	\N	\N	client
36ea564e-08dc-4b79-a51e-9672b2d0f5e7	Mrs.  Twashemererwa Jacent	\N	2026-02-10 16:37:57.895164+03	2026-02-10 16:37:57.895164+03	\N	\N	\N	client
1a7aecf1-f950-46b8-a064-562c7afdebe3	Mr.  muwonge fredrick	+256758434882	2026-02-10 16:38:01.879068+03	2026-02-10 16:38:01.879068+03	\N	\N	\N	client
45d167ad-cbc8-4604-801f-80a1a78dcd0c	Mrs.  Nantale Joyce	+256750647458	2026-02-10 16:38:03.764885+03	2026-02-10 16:38:03.764885+03	\N	\N	\N	client
ea118873-acc5-4939-a12e-1f9602822a57	Mrs.  Ncungwire Justine	+256740446057	2026-02-10 16:38:05.060263+03	2026-02-10 16:38:05.060263+03	\N	\N	\N	client
51fba39e-a0f8-4d52-ad30-709cea8a5697	Mrs.  NANONO PERAGIA	+2567512457171	2026-02-10 16:37:56.136337+03	2026-02-10 16:44:34.036728+03	\N	\N	\N	client
a5ff6a6b-e7ee-44d4-9231-3c073ebee14a	Mr.  BOGERE JULIUS	+256709614766	2026-02-10 16:38:00.966602+03	2026-02-10 16:43:51.181054+03	\N	\N	\N	client
8f859eb2-d773-46b3-a5f9-1e294086690e	Mr.  Muhwezi Benson	+256754942224	2026-02-10 16:37:23.532845+03	2026-02-10 16:40:00.776473+03	\N	\N	\N	client
da82fe19-5117-4a8e-b0f3-98bad412da08	Mr.  Sebunya Brayn Kirumira	+256752050005	2026-02-10 16:36:35.242575+03	2026-02-10 16:41:19.790896+03	\N	\N	\N	client
648b5fc5-50ba-42b7-a97a-aaf5413407f7	Mr.  Nabagala Hope	+256707291103	2026-02-10 16:36:32.371851+03	2026-02-10 16:41:21.193188+03	\N	\N	\N	client
8958a566-c8b3-4930-8577-109bf449e076	Mr.  Nyesiga Ronald	+256757656369	2026-02-10 16:36:33.974876+03	2026-02-10 16:41:23.981487+03	\N	\N	\N	client
e710d279-5467-4f11-be51-a94abca5b710	Mr.  MULEMBE STUART	+256745363481	2026-02-10 16:36:54.36815+03	2026-02-10 16:41:49.191012+03	\N	\N	\N	client
ffaf7306-9024-402a-812f-e8cfbf452b15	Mr.  SSEWAGUDDE MATIA	+256700431060	2026-02-10 16:37:38.370911+03	2026-02-10 16:42:10.119389+03	\N	\N	\N	client
a8d7e41b-dd4a-4879-8968-180f86d1f43e	Mr.  KALIRO ABBEY	+256756426170	2026-02-10 16:37:39.629471+03	2026-02-10 16:42:11.409201+03	\N	\N	\N	client
9cc5c271-1552-4c24-978d-5897036932de	Mr.  LUWAGA MUSA	+256703433281	2026-02-10 16:37:43.495063+03	2026-02-10 16:42:12.732546+03	\N	\N	\N	client
73c067a6-6c1a-4d9a-8d95-76ac6053b8d3	Mr.  KYAKABALE BENON	+256701877594	2026-02-10 16:37:59.27932+03	2026-02-10 16:43:10.336355+03	\N	\N	\N	client
cf288872-d7a0-4a36-8b86-509eab5f1146	Mrs.  NALUKENGE SHAKIRAH	+256704631464	2026-02-10 16:37:52.245202+03	2026-02-10 16:44:36.579923+03	\N	\N	\N	client
07b840ac-8504-4d08-b1ca-778bf8271702	Nakasi Teopista	+256707849420	2026-02-10 16:37:04.323538+03	2026-02-10 16:45:08.825742+03	\N	\N	\N	client
43145b30-d275-44b4-bb15-024687674189	Mr.  ABAASA BERNARD	+256772753695	2026-02-10 16:36:23.277968+03	2026-02-10 16:43:59.061549+03	\N	\N	\N	client
2a68ef83-3cae-4aa3-91eb-9148763a0bff	Mr.  LUKWAGO ALEX	\N	2026-02-10 16:37:33.351988+03	2026-02-10 16:44:21.820373+03	\N	\N	\N	client
2fe761b1-4c9a-41bd-bcd5-5c1465a34f17	Mrs.  LWANGA AGNES	+256741781775	2026-02-10 16:37:01.285611+03	2026-02-10 16:45:47.80647+03	\N	\N	\N	client
30a61edc-4fd5-4fb0-9dc6-e42e9f9ec279	Mr.  TENYWE HARUNAH	+2567560518662	2026-02-10 16:36:59.984731+03	2026-02-10 16:45:49.210514+03	\N	\N	\N	client
5a6d4663-e879-4447-bc23-2aa0f66bfd3a	Mr.  BYARUGABA DENNIS	+256754163519	2026-02-10 16:37:02.601512+03	2026-02-10 16:45:51.787436+03	\N	\N	\N	client
16fbb71e-32dc-4d1b-8610-07ab5997e3fd	Mrs.  NAISANGA JOAN	+256756064927	2026-02-10 16:37:08.9904+03	2026-02-10 16:49:14.181097+03	\N	\N	\N	client
7361aa03-3224-4942-a9f7-b80133bd0fdb	Mrs.  NALWANGA MAGRET	+256756004443	2026-02-10 16:37:07.694509+03	2026-02-10 16:49:15.488015+03	\N	\N	\N	client
2d2a749a-ffc2-4c3c-94ef-24984a93501b	Mrs.  NAKABIRI FLORENCE	+256700683877	2026-02-10 16:36:57.364032+03	2026-02-10 16:48:05.72718+03	\N	\N	\N	client
c123af7d-86e9-4bd0-a968-273b4291dc40	Mrs.  NIGHT HANIFAH	+256702488433	2026-02-10 16:36:51.670214+03	2026-02-10 16:49:30.649797+03	\N	\N	\N	client
12f6afda-3c17-4dad-8ce7-9c9123c141b4	Mr.  WAVAMUNO LIVINGSTONE	+256753415090	2026-02-10 16:37:35.213704+03	2026-02-10 16:50:12.587783+03	\N	\N	\N	client
53101c52-9e48-49bc-a11b-01f487676219	Mr.  MUKISA ROBERT	+256744068200	2026-02-10 16:37:06.028248+03	2026-02-10 16:50:41.710045+03	\N	\N	\N	client
f7c12317-0c1c-4190-9b9a-5caad1764429	Mr.  Kayemba Paul	+256742805088	2026-02-10 16:38:06.402392+03	2026-02-10 16:38:06.402392+03	\N	\N	\N	client
e4dd6ff0-ad6d-4a45-9b99-b0200a83fb18	Mrs.  Twinomugisha Joan	+256757572549	2026-02-10 16:38:07.736026+03	2026-02-10 16:38:07.736026+03	\N	\N	\N	client
e57c350a-f75f-4e71-b4da-f47b4d44d262	Mr.  Ssemakula Latib Jr	+256706125186	2026-02-10 16:38:10.08817+03	2026-02-10 16:38:10.08817+03	\N	\N	\N	client
87b26a5d-79c2-4cd6-b339-00c7a341408c	Mr.  Kyalwazi Marvin	+256749843455	2026-02-10 16:38:14.767825+03	2026-02-10 16:38:14.767825+03	\N	\N	\N	client
04c0f3b9-27a6-4e51-8307-2d8bcd023e9f	Mr.  Kakuru Peter	+256706398276	2026-02-10 16:38:16.507504+03	2026-02-10 16:38:16.507504+03	\N	\N	\N	client
274fc050-6669-4c2f-8b75-25b5c600a9a3	Mrs.  Nankanjja Teddy	+256750864285	2026-02-10 16:38:18.192964+03	2026-02-10 16:38:18.192964+03	\N	\N	\N	client
9633201d-8330-40a9-af73-ea68366ee806	Mrs.  Nampijja Saudah	+256741025929	2026-02-10 16:38:19.629239+03	2026-02-10 16:38:19.629239+03	\N	\N	\N	client
caa1e465-033e-44b9-beed-69f6f0a7eefe	Mr.  Mwanje Richard	+256701074902	2026-02-10 16:38:21.185776+03	2026-02-10 16:38:21.185776+03	\N	\N	\N	client
efad4b39-5441-43e6-982b-ea57e3ebb3a7	Mrs.  Kyolaba Mary	+256786724077	2026-02-10 16:38:22.610332+03	2026-02-10 16:38:22.610332+03	\N	\N	\N	client
55d03c23-0f31-42d5-89dd-d304c473fed6	Mr.  OGWANG JASPHER	+256743472327	2026-02-10 16:38:13.399222+03	2026-02-10 16:43:09.079016+03	\N	\N	\N	client
a3681da4-6464-43bb-b82d-5553442f8844	Mr.  Nviiri Herman	+256750673619	2026-02-10 16:38:27.310968+03	2026-02-10 16:38:27.310968+03	\N	\N	\N	client
5562b768-7aa7-467e-94e4-164019727ad9	Mr.  Mupuya Godfrey	+256704305358	2026-02-10 16:38:28.684501+03	2026-02-10 16:38:28.684501+03	\N	\N	\N	client
25ffad69-f7f7-4de4-8efc-7db0b2b5137e	Mr.  Busulwa Andrew Robert	+256702160626	2026-02-10 16:38:30.03576+03	2026-02-10 16:38:30.03576+03	\N	\N	\N	client
1c3e2202-beab-405e-9834-312469eb151a	Mr.  Nahabwe Anxious	+256753899162	2026-02-10 16:38:31.400606+03	2026-02-10 16:38:31.400606+03	\N	\N	\N	client
c7d1ca17-6571-4a26-a6c2-b4af2373a9a8	Mr.  Ssentuyo Yusuf	+256748137237	2026-02-10 16:38:33.242276+03	2026-02-10 16:38:37.25126+03	\N	\N	\N	client
5c8ea7dd-10d5-408a-84b1-77f61b2bc0a5	Mr.  Seguya Julius	+256748627577	2026-02-10 16:38:35.931938+03	2026-02-10 16:38:38.508101+03	\N	\N	\N	client
6c76aad7-e97a-40fe-b36e-88fa6dd4d357	Mr.  Mulinde Alex	+256700329478	2026-02-10 16:38:34.588242+03	2026-02-10 16:38:39.978235+03	\N	\N	\N	client
a0624077-ac54-45e4-a178-ec2a612938d9	Mr.  Ssekanjako Ronnie	+256751643709	2026-02-10 16:38:41.683173+03	2026-02-10 16:38:41.683173+03	\N	\N	\N	client
f5bdb75d-a315-4711-9617-9dd39bbc8bc1	Mr.  Besigye Muzayima	+256746665492	2026-02-10 16:38:43.12236+03	2026-02-10 16:38:43.12236+03	\N	\N	\N	client
e713184d-6e52-46bb-be36-af8ae8c0144d	Mr.  Tusingirwe Obed	+256755262620	2026-02-10 16:38:44.422717+03	2026-02-10 16:38:44.422717+03	\N	\N	\N	client
157c3aee-47ce-4962-a89f-104c66fdfdd1	Mr.  Lubulwa Geofrey	+256753324861	2026-02-10 16:38:45.745204+03	2026-02-10 16:38:45.745204+03	\N	\N	\N	client
4996d1e4-331a-45fb-85f1-e4378a6d6b19	Mr.  Sekyanzi Sharif	+256708397747	2026-02-10 16:38:47.532492+03	2026-02-10 16:38:47.532492+03	\N	\N	\N	client
38ca11c1-d90e-4fba-afb4-fc4d24295f5f	Mr.  Wasswa Geofrey	+256751766685	2026-02-10 16:38:48.833601+03	2026-02-10 16:38:48.833601+03	\N	\N	\N	client
28cf13b2-38e8-431c-9118-2887697651c1	Mrs.  Nabukenya Christine	+256702005991	2026-02-10 16:38:50.827185+03	2026-02-10 16:38:50.827185+03	\N	\N	\N	client
44f6cde4-ff3b-49c8-9ed6-7c7c7c10be99	Mr.  Kakande Badru	+256706363044	2026-02-10 16:38:52.237252+03	2026-02-10 16:38:52.237252+03	\N	\N	\N	client
d966dec5-fda7-452a-89f6-9cec44c6e858	Mrs.  Namanda Jackline	\N	2026-02-10 16:38:53.592957+03	2026-02-10 16:38:53.592957+03	\N	\N	\N	client
57c82246-b8ae-45fd-8b78-6d2c2620e6b5	Mrs.  Mpindi Zainab	+256759237777	2026-02-10 16:38:54.882088+03	2026-02-10 16:38:54.882088+03	\N	\N	\N	client
5a2b1e5f-2124-4b46-abd4-cb5524cec191	Mr.  Kamale Isaac	+256749105690	2026-02-10 16:38:57.831455+03	2026-02-10 16:38:57.831455+03	\N	\N	\N	client
b2b9db31-b79e-42b9-9584-2d52a8844e75	Mr.  Kimbugwe Sudais	+256748270758	2026-02-10 16:39:00.378599+03	2026-02-10 16:39:00.378599+03	\N	\N	\N	client
54413b6d-5727-4e9c-b4d1-d313c2014e3e	Mrs.  Nalumu Milly	+256704234403	2026-02-10 16:39:01.650778+03	2026-02-10 16:39:01.650778+03	\N	\N	\N	client
341e6653-f8ee-4249-9028-0d616659d087	Mrs.  Nanyonjo Rose	+256742551564	2026-02-10 16:39:03.386616+03	2026-02-10 16:39:03.386616+03	\N	\N	\N	client
543e5fdf-203d-4826-9d8f-605cbb43221f	Mr.  Kisakye Fred	+256701494167	2026-02-10 16:39:04.715239+03	2026-02-10 16:39:04.715239+03	\N	\N	\N	client
94f9b62c-bb7c-41a8-9cda-9d079491020b	Mr.  Mayanja Ashiraf	+256709199848	2026-02-10 16:39:06.004851+03	2026-02-10 16:39:06.004851+03	\N	\N	\N	client
f40579ba-ada4-4bd2-8d06-7d1aa4420062	Mrs.  Ndagire Aminah	+256748142571	2026-02-10 16:39:07.335875+03	2026-02-10 16:39:07.335875+03	\N	\N	\N	client
7f7f60b4-da99-47e5-97c6-9559238d5226	Mr.  Kyagera Bumbakali	+256746652828	2026-02-10 16:39:08.630726+03	2026-02-10 16:39:08.630726+03	\N	\N	\N	client
01a4e0c1-4c38-4fe0-81d4-549e86e1e4f1	Mr.  Kaweesi Ibra 2 (ibrah)	+256750028092	2026-02-10 16:39:10.355653+03	2026-02-10 16:39:10.355653+03	\N	\N	\N	client
0b937a46-ee75-4f04-ab7d-7fd4673119f9	Mr.  Mutsinze Omar	+256750208886	2026-02-10 16:39:12.873397+03	2026-02-10 16:39:12.873397+03	\N	\N	\N	client
75c7f816-d217-4a0d-859e-a2db6046fa15	Mr.  Masaaba Frank	+256709920893	2026-02-10 16:39:14.174129+03	2026-02-10 16:39:14.174129+03	\N	\N	\N	client
11c18bdb-fb07-4aab-b1d8-80021fc101a7	Mr.  Matovu Mathias	+256742724285	2026-02-10 16:39:16.737187+03	2026-02-10 16:39:16.737187+03	\N	\N	\N	client
06b3c564-cea5-4dd6-81a7-d2448573a017	Mr.  Ndayisaba Adrian	+256704439660	2026-02-10 16:39:21.13286+03	2026-02-10 16:39:21.13286+03	\N	\N	\N	client
6caae18f-c81f-4167-a65a-9edd7df7ac73	Mrs.  Babirye Jane	+256743835776	2026-02-10 16:39:22.471495+03	2026-02-10 16:39:23.798908+03	\N	\N	\N	client
334fa943-ebe3-4c12-9ee1-67b97df22c1b	Mrs.  Namagala Reticia	+256746877203	2026-02-10 16:39:25.092639+03	2026-02-10 16:39:25.092639+03	\N	\N	\N	client
e5e74a76-4e6e-4617-94bc-2ccd67bb8aa0	Mr.  Matovu Henry	+256704528313	2026-02-10 16:39:26.818967+03	2026-02-10 16:39:26.818967+03	\N	\N	\N	client
5389c56b-2775-4300-a774-ea3041d1f6bb	Mr.  Talemwa Emmanuel	+256741561690	2026-02-10 16:39:29.458311+03	2026-02-10 16:39:29.458311+03	\N	\N	\N	client
8a55b7e3-8214-4edd-a5cf-06841cdd254f	Mr.  Talemwa Godwin	+256704751466	2026-02-10 16:39:30.730158+03	2026-02-10 16:39:30.730158+03	\N	\N	\N	client
19b22681-d065-415b-8db1-4edaab4a0087	Mr.  Bugembe Hadson	+256757276154	2026-02-10 16:39:32.04008+03	2026-02-10 16:39:32.04008+03	\N	\N	\N	client
4a2b4ccc-374d-4460-bfa6-b205816b7c40	Mr.  Ziwa Ibrah	+256746739331	2026-02-10 16:39:33.492173+03	2026-02-10 16:39:33.492173+03	\N	\N	\N	client
fb346bc2-d7f4-4cf5-99cf-24ffc193024a	Mr.  kiwanuka Francis	+256701638523	2026-02-10 16:39:36.685043+03	2026-02-10 16:39:36.685043+03	\N	\N	\N	client
79114ca0-8521-4dda-8f80-bb3b7c404d1a	Mr.  Sentongo Ashiraf	+256705395570	2026-02-10 16:39:40.112304+03	2026-02-10 16:39:40.112304+03	\N	\N	\N	client
c4205826-9772-4206-b5c6-9fa1c1815a35	Mr.  Kapompo Juma	+256707222249	2026-02-10 16:39:41.538301+03	2026-02-10 16:39:41.538301+03	\N	\N	\N	client
d43d3515-0d1e-4d9a-aa28-abbae69dfbd6	Mr.  Kintu Steven	+256754362679	2026-02-10 16:39:43.326894+03	2026-02-10 16:39:43.326894+03	\N	\N	\N	client
ec8692cc-1b8f-4e26-a046-e526ec5b8f0d	Mr.  Byakatonda Kennedy	+256742779569	2026-02-10 16:39:45.886569+03	2026-02-10 16:39:45.886569+03	\N	\N	\N	client
2c33efe2-1783-4f34-ab5a-044bc9fec593	Mr.  Batte Isa	+256749597929	2026-02-10 16:39:47.417081+03	2026-02-10 16:39:47.417081+03	\N	\N	\N	client
9cfcd41a-8ff0-462f-9de1-5f090c008263	Mr.  Tumukunde Bruce	+256744341521	2026-02-10 16:39:54.481252+03	2026-02-10 16:39:54.481252+03	\N	\N	\N	client
069ab712-294c-4c1d-9f54-9070535c99fa	Mr.  Mawenenge William	+256754696847	2026-02-10 16:39:55.821413+03	2026-02-10 16:39:55.821413+03	\N	\N	\N	client
33a9831a-7ead-4e0a-a2a7-85db0cdea3e9	Mr.  Ngiraebisa Joshua	+256753951211	2026-02-10 16:39:57.315422+03	2026-02-10 16:39:57.315422+03	\N	\N	\N	client
26080064-ed68-46ae-a41b-18f3100c3812	Mr.  Nabuse Siraji	+256741739562	2026-02-10 16:39:58.714526+03	2026-02-10 16:39:58.714526+03	\N	\N	\N	client
0aecdb89-2e59-4105-8861-a57f18b33398	Kiyaga Rashid	+256706991869	2026-02-10 16:38:25.443338+03	2026-02-10 16:41:36.847932+03	\N	\N	\N	client
4448f396-f9b2-4ce7-831d-25832cfb2913	NSUBUGA MUZAFARU	+256706991881	2026-02-10 16:38:24.107957+03	2026-02-10 16:41:35.589419+03	\N	\N	\N	client
295d39df-dd53-4544-b0e6-55104719bae4	Mr.  KAMYA VICENT	+256751774680	2026-02-10 16:39:15.471151+03	2026-02-10 16:43:56.333278+03	\N	\N	\N	client
62d99bb5-329f-4bfc-b0eb-45371fef45d1	Mr.  KIWADUKA MOSES	+256708387597	2026-02-10 16:39:49.310294+03	2026-02-10 16:50:43.041412+03	\N	\N	\N	client
41ebce67-b19b-4f6a-be39-05f21f5ab67f	Mr.  BRIGHT WILSON	+256704400930	2026-02-10 16:39:28.122926+03	2026-02-10 16:44:11.747289+03	\N	\N	\N	client
8d6d3cf9-279d-437e-9bec-5522dc57ecd8	MUGISHA JUMAH	+256740768757	2026-02-10 16:39:38.343276+03	2026-02-10 16:42:34.33925+03	\N	\N	\N	client
c8a8f446-97ed-44d9-9282-eaedc0f90cc0	Mr.  NASASIRA ALEX	+256709549257	2026-02-10 16:39:11.610031+03	2026-02-10 16:43:18.740183+03	\N	\N	\N	client
ffce31d1-e0aa-40d8-a12b-8297986997c3	Mr.  KABUGO YUSUFU	+256754039331	2026-02-10 16:40:13.149946+03	2026-02-10 16:50:52.542841+03	\N	\N	\N	client
3d332321-6c14-4695-bf74-25c95a397e7e	Mr.  KASIBANTE YUDA	+256740406706	2026-02-10 16:39:18.1071+03	2026-02-10 16:44:00.413947+03	\N	\N	\N	client
a47b657c-9c3d-438e-9f7e-d0f1a3b64fa9	Mr.  OJUKA TONNY	+256743508639	2026-02-10 16:39:52.446027+03	2026-02-10 16:45:22.061948+03	\N	\N	\N	client
7af94da8-f9c7-4c68-ae1a-07d63cfef22b	Mrs.  NAKABUGO ANNET	+256750778022	2026-02-10 16:40:11.02908+03	2026-02-10 16:45:11.558055+03	\N	\N	\N	client
3858302f-b9e8-420f-b12f-5934f3123b8c	Mr.  TUSABE HAMZA	+256708841468	2026-02-10 16:38:59.107945+03	2026-02-10 16:49:34.902565+03	\N	\N	\N	client
0ce0f4e3-3a92-4791-af27-b0bc893b940b	Mrs.  NAMATA CHRISTINE	+256741017506	2026-02-10 16:40:07.324889+03	2026-02-10 16:49:16.820824+03	\N	\N	\N	client
ab46d637-496a-40e3-9d53-d038fb82599b	Mrs.  NANFUMA JAMILA	+256746716961	2026-02-10 16:40:09.234628+03	2026-02-10 16:49:56.790264+03	\N	\N	\N	client
40881955-f425-40e8-b47e-eec4d7c14dcc	Mr.  SEMPIJJA CHARLES	+256751209912	2026-02-10 16:40:19.178615+03	2026-02-10 16:49:50.392848+03	\N	\N	\N	client
43f4c8e7-4da4-4bcd-ab52-5f1fc195394d	Mr.  NYOMBI MORGAN	+256750907789	2026-02-10 16:40:22.294797+03	2026-02-10 16:49:52.928138+03	\N	\N	\N	client
c22fbeea-8bf7-4d49-ad23-8666903792f0	Mr.  BUKUSOBA SAMUEL	+256703670249	2026-02-10 16:40:02.623224+03	2026-02-10 16:50:07.221313+03	\N	\N	\N	client
cca07c5e-d413-41a1-a33d-2f138ada2414	Mr.  TWINOMUGYISHA BENSON	+256700921376	2026-02-10 16:40:05.962271+03	2026-02-10 16:50:08.651458+03	\N	\N	\N	client
9f8c5a28-5467-4754-8b07-68f758dc3f03	Mr.  TUMURAMYE BENSON	+256755720401	2026-02-10 16:40:04.69034+03	2026-02-10 16:50:09.987601+03	\N	\N	\N	client
d71e36ca-74b6-4429-ae0d-a20300fe4d3a	Mr.  ARINAITWE YORAM	+256700368667	2026-02-10 16:39:19.823579+03	2026-02-10 16:50:31.409519+03	\N	\N	\N	client
f4593884-24a9-4722-8ea8-da1ba1003964	Mr.  Were Simon Peter	+256704248443	2026-02-10 16:40:25.84656+03	2026-02-10 16:40:25.84656+03	\N	\N	\N	client
5e3390f7-5d91-47f8-b658-489e1bf7e4c5	Mr.  Ssentega Disan	+256751137321	2026-02-10 16:40:28.020557+03	2026-02-10 16:40:28.020557+03	\N	\N	\N	client
3c73c383-8ec0-4c00-899f-ad62420c3652	Mrs.  Nalubega Resty	+256744815991	2026-02-10 16:40:29.324237+03	2026-02-10 16:40:29.324237+03	\N	\N	\N	client
64c8a075-1c89-4ad8-8b55-4aab2ed94b6e	Mr.  Bwire Dennis	+256707509765	2026-02-10 16:40:30.643311+03	2026-02-10 16:40:30.643311+03	\N	\N	\N	client
c3276837-c252-4477-9cf1-f8542184445b	Mrs.  Namale Patricia	+256749081506	2026-02-10 16:40:32.433403+03	2026-02-10 16:40:32.433403+03	\N	\N	\N	client
0bba5d6f-ed71-4231-bf9a-3c39fc5891e9	Mrs.  Lumumba Naume	+256745050039	2026-02-10 16:40:33.889399+03	2026-02-10 16:40:33.889399+03	\N	\N	\N	client
5e644294-bbc4-4a20-9bbf-c4942fb30855	Mrs.  Namuganyi Hanifah	+256700985507	2026-02-10 16:40:35.434651+03	2026-02-10 16:40:35.434651+03	\N	\N	\N	client
67c7f30a-edd9-4e78-8a0e-a291100d130c	Mrs.  Mukamwezi Specioza	+256708923270	2026-02-10 16:40:37.024359+03	2026-02-10 16:40:37.024359+03	\N	\N	\N	client
1f41e482-6eea-47ee-bfba-64f0081a27f7	Mrs.  Nakiwala Shamim	+256708586620	2026-02-10 16:40:38.319003+03	2026-02-10 16:40:38.319003+03	\N	\N	\N	client
51324718-d8fe-421b-9639-3c3e8e361a08	Mr.  Magero Steven	+256743718765	2026-02-10 16:40:43.122047+03	2026-02-10 16:40:43.122047+03	\N	\N	\N	client
647a29ae-984b-4c00-a7fc-b3b26ad11516	Mr.  Owori Simon	\N	2026-02-10 16:40:44.594133+03	2026-02-10 16:40:44.594133+03	\N	\N	\N	client
ddf3ca1c-43a0-4636-bb34-5e75b50f6ec7	Mr.  Musoke Ronald	+256757126377	2026-02-10 16:40:46.061456+03	2026-02-10 16:40:46.061456+03	\N	\N	\N	client
b711c25d-dbf7-40af-a408-2b6d40d0d11b	Mr.  Mukiibi Livingstone	+256700656667	2026-02-10 16:40:47.731154+03	2026-02-10 16:40:47.731154+03	\N	\N	\N	client
e94f7f5d-0e9e-4d19-9654-0a930719aa96	Mrs.  Tumwesigye Betty	+256701399320	2026-02-10 16:41:00.546218+03	2026-02-10 16:41:00.546218+03	\N	\N	\N	client
4785a421-9361-49a2-a4e8-0b8cb1a9358c	Mr.  Matovu Abasi	+256758525104	2026-02-10 16:41:04.429645+03	2026-02-10 16:41:04.429645+03	\N	\N	\N	client
70901baf-adb9-4583-ad46-7ac5263a958f	Mr.  Musasizi Faizal	+256749195345	2026-02-10 16:41:05.858977+03	2026-02-10 16:41:05.858977+03	\N	\N	\N	client
ca3089b8-d97e-49f3-80fb-f1d82583be2f	Mr.  Kibirige Kagenya Livingstone	+256704645172	2026-02-10 16:41:07.249101+03	2026-02-10 16:41:07.249101+03	\N	\N	\N	client
ae789540-2b99-4ff0-87cb-6214b7269657	Mr.  Kibirige Tonny	+256703447068	2026-02-10 16:41:09.343975+03	2026-02-10 16:41:09.343975+03	\N	\N	\N	client
95e737c7-6ff2-412b-8235-7b95b5b1dc46	Miss  Kibirige Harriet	+256706474503	2026-02-10 16:41:10.836993+03	2026-02-10 16:41:10.836993+03	\N	\N	\N	client
b7bcec83-dfc6-4c1c-a610-71e9fd1fbcae	Mrs.  Lunyoro Sarah	+256757081381	2026-02-10 16:41:12.196072+03	2026-02-10 16:41:12.196072+03	\N	\N	\N	client
3a9ef6a3-cc78-4843-ab3c-bf6c385f475a	Mr.  AHEEBWA ANDREW	+256758504583	2026-02-10 16:41:15.7872+03	2026-02-10 16:41:17.063614+03	\N	\N	\N	client
bed75958-afc3-4416-ba42-1f45c33e9cbb	Mr.  Kasule Eddy Ssebunya	+256706925093	2026-02-10 16:41:22.529824+03	2026-02-10 16:41:22.529824+03	\N	\N	\N	client
78b24b3d-1fdd-4933-abaa-54e1b36a80d6	Mr.  Lyazi Robert	+256756712553	2026-02-10 16:41:25.339788+03	2026-02-10 16:41:25.339788+03	\N	\N	\N	client
ca2c1342-3c5e-4b57-9ff0-770e8ce7f2cc	Mr.  Kiyimba Charles	+256701179703	2026-02-10 16:41:30.518276+03	2026-02-10 16:41:30.518276+03	\N	\N	\N	client
7d773bac-a546-4182-bca3-de42b340a8e5	Mrs.  Nalunkuuma Justine Grace	+256705322913	2026-02-10 16:41:31.770141+03	2026-02-10 16:41:31.770141+03	\N	\N	\N	client
81352995-d9ed-4777-8b5a-01abb7f1745a	Mr.  Lutaaya Sulait Eric	+256746685591	2026-02-10 16:41:33.037027+03	2026-02-10 16:41:33.037027+03	\N	\N	\N	client
263fbec1-f903-4096-a5d6-5622ba317321	Mr.  NDOBYA FAIZO	+256704870246	2026-02-10 16:41:39.814334+03	2026-02-10 16:41:39.814334+03	\N	\N	\N	client
32806bc1-5451-4f82-8e3d-0fb11b5d04c0	Mr.  KIKKO EMMANUEL	+256744772049	2026-02-10 16:41:41.42122+03	2026-02-10 16:41:41.42122+03	\N	\N	\N	client
307e0092-cbe4-4e79-8723-160066325c5f	Mr.  ANATOLI BUKENYA	+256707624190	2026-02-10 16:41:42.71646+03	2026-02-10 16:41:42.71646+03	\N	\N	\N	client
ba212db4-58f8-416b-bd56-27ec6ab47c90	Mr.  BOGERE RODGERS	+25674919199075	2026-02-10 16:41:43.987543+03	2026-02-10 16:41:43.987543+03	\N	\N	\N	client
c1a74313-2697-4c07-ab2e-08a13597b989	Mr.  MAGAMBA RODGERS	+256751853347	2026-02-10 16:41:45.302432+03	2026-02-10 16:41:45.302432+03	\N	\N	\N	client
a4806da8-f4b3-4107-84d3-0f77ee9cbbcf	Mr.  MULINDWA WILSON	+256755526440	2026-02-10 16:41:50.507987+03	2026-02-10 16:41:50.507987+03	\N	\N	\N	client
03c5847f-9e49-46ff-89b9-572b3e48bfee	KAFEERO ALLAN	+256705728546	2026-02-10 16:41:51.764094+03	2026-02-10 16:41:51.764094+03	\N	\N	\N	client
adb48db7-be4e-417c-aebc-f4608deaae33	Mrs.  nalubega prossy	+256785638918	2026-02-10 16:42:00.226317+03	2026-02-10 16:42:00.226317+03	\N	\N	\N	client
e4fb1c94-f4dd-4d86-a7be-69536d578546	Mr.  SSEKIYUVI WILBERFORCE	+256704534271	2026-02-10 16:41:57.29912+03	2026-02-10 16:50:24.796132+03	\N	\N	\N	client
b5f06348-0e06-4d36-95b5-c6fa406073ec	Mr.  BUSUKWA MARK	+256705864413	2026-02-10 16:40:55.356829+03	2026-02-10 16:50:13.921576+03	\N	\N	\N	client
4a53c947-ce66-4a96-ab80-3a63060cdd51	Mrs.  MUGERWA TEOPISTA	+256706800080	2026-02-10 16:41:26.627877+03	2026-02-10 16:44:44.308657+03	\N	\N	\N	client
579005b5-ffd5-45fc-a4ce-beda75c6d307	Mrs.  NABANJALA AISHA	+256706664571	2026-02-10 16:41:18.921243+03	2026-02-10 16:44:49.281339+03	\N	\N	\N	client
c6fda488-f990-4169-a897-02e397ba568e	Mr.  KYAMBADDE THOMAS	+256759555953	2026-02-10 16:42:18.631255+03	2026-02-10 16:49:04.61445+03	\N	\N	\N	client
a0c42ffd-5318-4561-a35b-ba93c6f47e1e	Mrs.  BABIRYE JUSTINE	+256701724009	2026-02-10 16:41:02.921635+03	2026-02-10 16:45:10.215345+03	\N	\N	\N	client
264e0eac-0e4b-42da-b03d-4f23c7f272f7	Mr.  SEMPEBWA CAPRIAM	+256706159030	2026-02-10 16:42:08.035003+03	2026-02-10 16:45:46.34833+03	\N	\N	\N	client
4e1468c6-5480-49c2-946e-f0a87ec91b72	Mrs.  NASAKA HARRIET	\N	2026-02-10 16:41:14.533902+03	2026-02-10 16:46:22.68654+03	\N	\N	\N	client
625ef4ae-3509-4568-b295-9c0550a49342	Mr.  MUGANGA LAWRENCE	+256754689223	2026-02-10 16:41:29.642659+03	2026-02-10 16:48:09.252952+03	\N	\N	\N	client
94012aca-ff17-43d8-b19f-e63584518fef	Mr.  BAGAMBANE ERIA	+256750046881	2026-02-10 16:42:19.485202+03	2026-02-10 16:49:05.545086+03	\N	\N	\N	client
ed955ea7-33a7-4c52-8b8b-e23a9be479dd	Mr.  LUGOLOBI GEORGE	+256707727666	2026-02-10 16:42:20.329511+03	2026-02-10 16:49:06.405783+03	\N	\N	\N	client
39eff60e-8121-4cfd-a5d0-5fbf2be66251	SSEBAGUDE ROBERT	+256709883751	2026-02-10 16:42:16.912109+03	2026-02-10 16:49:07.298366+03	\N	\N	\N	client
31a4c41c-290f-4f21-b04d-ebb5a2c470ae	Mrs.  NANKUMBA SARAH	\N	2026-02-10 16:42:21.596809+03	2026-02-10 16:49:08.153082+03	\N	\N	\N	client
f274088a-733f-4d0d-aff9-7c259af09afb	Mr.  KASUJJA MICHAEL	+256742245035	2026-02-10 16:42:22.868461+03	2026-02-10 16:49:09.016434+03	\N	\N	\N	client
6899dfe9-e78c-4b95-8f49-fa748a6d4eaf	Mr.  OKIRU PAUL	+256757260816	2026-02-10 16:40:51.043164+03	2026-02-10 16:49:37.190602+03	\N	\N	\N	client
25466ed3-563b-4fd4-9a1f-72d492c853fb	Mr.  BUGEMBE RICHARD	+256704243406	2026-02-10 16:40:52.390128+03	2026-02-10 16:49:39.833024+03	\N	\N	\N	client
8a825829-e643-47c7-984c-9fd0684edbec	Mr.  KUBUNGA JOHNSON	+256741425274	2026-02-10 16:40:49.694994+03	2026-02-10 16:49:43.71941+03	\N	\N	\N	client
5782cf3c-ffdd-4256-9cc8-8b829852f255	Mr.  WASSWA FRANK	+256702905586	2026-02-10 16:41:01.937185+03	2026-02-10 16:49:55.510502+03	\N	\N	\N	client
1c1b740f-9127-4ac8-967d-4e7657f758d5	Mrs.  LUSIBA SARAH	+2567045588973	2026-02-10 16:42:07.18608+03	2026-02-10 16:50:04.25295+03	\N	\N	\N	client
42418a7f-acc4-46d9-95eb-fdd82fba1b63	Mr.  TEBAJUKILA ABDALAH	+256703720143	2026-02-10 16:40:58.967031+03	2026-02-10 16:50:11.280995+03	\N	\N	\N	client
ee3b5a29-a557-430e-b76c-fe37f35bba33	Mr.  BUTANAKYA GEORGE	+256754564152	2026-02-10 16:40:56.708141+03	2026-02-10 16:50:16.501581+03	\N	\N	\N	client
40544e40-e93c-4187-82b6-001579b8c5d0	Mr.  MUBIRU KENNETH	+256755790570	2026-02-10 16:40:53.958493+03	2026-02-10 16:50:17.772099+03	\N	\N	\N	client
08b452b9-eca3-4c85-a79d-a16d6740e53e	Mr.  OWEMBABAZI RODGERS	+256709465941	2026-02-10 16:41:53.486388+03	2026-02-10 16:50:19.152779+03	\N	\N	\N	client
06cba71b-fcf7-40fb-9144-cb23ea80f9ca	Mr.  LUWAGA CHARLES	+256701676785	2026-02-10 16:41:54.762948+03	2026-02-10 16:50:20.444541+03	\N	\N	\N	client
30861a5d-8175-4f1b-a8a1-cbe75ac512cd	Mr.  LUGWANA ANTHONY	+256740718690	2026-02-10 16:41:56.022884+03	2026-02-10 16:50:21.773798+03	\N	\N	\N	client
affcd6c5-46ef-4296-a420-e5ceb413d547	Mr.  KALUNGI SHAFIK	+256703764870	2026-02-10 16:41:58.540595+03	2026-02-10 16:50:23.17686+03	\N	\N	\N	client
bed2d06e-02dc-4528-ab7b-4e105586555d	Mr.  AMUDA FRED	+256700682118	2026-02-10 16:40:39.737545+03	2026-02-10 16:50:26.085484+03	\N	\N	\N	client
2f702b6c-88fe-4fc8-81cd-7d572f7204ea	Mr.  KOMODO MUTWAIFU	+256751724397	2026-02-10 16:40:41.113123+03	2026-02-10 16:50:27.42431+03	\N	\N	\N	client
73fe437a-82dc-4bfa-b675-e9038b66b945	Mr.  ABU SENDI	+256759748041	2026-02-10 16:42:05.90813+03	2026-02-10 16:50:28.802568+03	\N	\N	\N	client
c273e6c8-d88a-494e-974c-9bb6073b6823	Mr.  BAMUGYE SIPERITO	+256702033965	2026-02-10 16:42:01.552152+03	2026-02-10 16:50:30.126352+03	\N	\N	\N	client
48f55493-1190-4e86-b4e4-d3fa3f26b8a0	Mrs.  NAKAYIZA LILLIAN	+256708073912	2026-02-10 16:42:02.848036+03	2026-02-10 16:50:34.851457+03	\N	\N	\N	client
c64cbbc8-d7d2-4be4-bebf-ea02a215b3bd	MUSISI GODREY	+256706014136	2026-02-10 16:42:28.826779+03	2026-02-10 16:42:28.826779+03	\N	\N	\N	client
a6e68834-a3d4-4bc0-b6b2-4331c29bf58c	KABOMBO MOSES	+256753950117	2026-02-10 16:42:29.709297+03	2026-02-10 16:42:29.709297+03	\N	\N	\N	client
31bf468f-08a1-4fbb-94e4-f6d1576d770a	KASUMBA FRANK	+256750614106	2026-02-10 16:42:30.540425+03	2026-02-10 16:42:30.540425+03	\N	\N	\N	client
0d5df0a6-dbb4-4293-a78b-0d530d70be23	MUTAHUNGWA JULIUS	+256756480351	2026-02-10 16:42:31.39198+03	2026-02-10 16:42:31.39198+03	\N	\N	\N	client
741863cf-8fdd-4fb6-8a41-3853729e6abb	MBEINE FRED	+256700969403	2026-02-10 16:42:32.221647+03	2026-02-10 16:42:32.221647+03	\N	\N	\N	client
4f089b15-9797-4f80-abd0-b1cf462164b7	Mrs.  NAKASI MAYI	+256740688264	2026-02-10 16:42:33.07028+03	2026-02-10 16:42:33.07028+03	\N	\N	\N	client
910517eb-7bf3-478e-8bf4-d9efac6d156a	NANSEREKO JANE	+256757896262	2026-02-10 16:42:36.876549+03	2026-02-10 16:42:36.876549+03	\N	\N	\N	client
5d803fc7-5834-4415-8fad-70897a17ca5c	Mr.  Ssekajja Jamil	+256703350322	2026-02-10 16:42:38.569447+03	2026-02-10 16:42:38.569447+03	\N	\N	\N	client
e3a6570f-432d-4d37-b86e-1a680249b2e7	Mr.  Kavuma Osman	+256708792743	2026-02-10 16:42:39.403956+03	2026-02-10 16:42:39.403956+03	\N	\N	\N	client
62e1415b-42c9-41d1-9290-ce27dbf14c9d	Mrs.  Nakacwa Phionah	+256703407361	2026-02-10 16:42:40.285943+03	2026-02-10 16:42:40.285943+03	\N	\N	\N	client
727b9f6d-0474-47d8-83ec-219e19bfbe49	Mr.  Njakasi Charles	+256701892709	2026-02-10 16:42:41.149335+03	2026-02-10 16:42:41.149335+03	\N	\N	\N	client
6bb3a043-1925-41fa-a6f6-1866471520b5	Mr.  Lubalema Umar	+256748546849	2026-02-10 16:42:42.00354+03	2026-02-10 16:42:42.00354+03	\N	\N	\N	client
bff1c1fd-b256-4995-933c-e327f91bc6de	Mr.  Lubwama Ivan	+256750852283	2026-02-10 16:42:42.887854+03	2026-02-10 16:42:42.887854+03	\N	\N	\N	client
ebd18199-5bd9-4a24-a004-67478fcca4ad	Iga Solomon	+256752162036	2026-02-10 16:42:43.740467+03	2026-02-10 16:42:43.740467+03	\N	\N	\N	client
34a8d472-c408-42af-910e-87fac92ae39d	Katende Stanley	+256747741502	2026-02-10 16:42:44.612205+03	2026-02-10 16:42:44.612205+03	\N	\N	\N	client
0d2be050-554d-4c8c-87c4-2bdfc12f1d25	Mr.  Tuhirwe Roland	+256741417096	2026-02-10 16:42:45.969706+03	2026-02-10 16:42:45.969706+03	\N	\N	\N	client
e2596d67-6092-49ed-b5dc-865a52834e61	Mr.  TINKA ROBERT KARUHANGA	+256703626692	2026-02-10 16:42:52.087157+03	2026-02-10 16:42:52.087157+03	\N	\N	\N	client
2ba10315-d0bf-48f4-ad76-0cf9600a2872	Mr.  SSEBUNZA LAWRENCE	+256704374163	2026-02-10 16:42:53.429434+03	2026-02-10 16:42:53.429434+03	\N	\N	\N	client
1fbcf621-f968-47a8-a149-f43dbaa58017	Mr.  BOSIKO FERESI	+256705106435	2026-02-10 16:42:55.012627+03	2026-02-10 16:42:56.38819+03	\N	\N	\N	client
ddf4f0d8-be59-4455-81dc-f017e34d22b1	Mr.  KIBUKA RASHID	+256743751310	2026-02-10 16:42:59.292751+03	2026-02-10 16:42:59.292751+03	\N	\N	\N	client
c492f8a1-aa7b-44a9-9aca-4fe746f65a03	Mr.  WADADA YISUFU	+256755018652	2026-02-10 16:43:02.930838+03	2026-02-10 16:43:02.930838+03	\N	\N	\N	client
a7837d7a-64f8-42aa-9cfa-2aab4dcc4ec8	Mr.  AWUMA MUGWERI	+256741830588	2026-02-10 16:43:04.616242+03	2026-02-10 16:43:04.616242+03	\N	\N	\N	client
e32aceb9-4076-4237-900f-cf4d9da6d6e2	Mr.  MUGONYA ZAAKE	+256700570328	2026-02-10 16:43:06.496458+03	2026-02-10 16:43:06.496458+03	\N	\N	\N	client
e7296c86-b5b9-430a-95b6-198d3db640a1	Mr.  BUTUTU PETER	+256752085271	2026-02-10 16:43:07.801217+03	2026-02-10 16:43:07.801217+03	\N	\N	\N	client
55169c02-5e08-455d-becb-59f54537a2ec	Mr.  ASIIMWE RODGERS	+256706510144	2026-02-10 16:43:11.767205+03	2026-02-10 16:43:11.767205+03	\N	\N	\N	client
00907018-52fd-4e4c-b407-3b3197259e18	Mr.  AMANYA GODON	+256758902127	2026-02-10 16:43:13.105289+03	2026-02-10 16:43:13.105289+03	\N	\N	\N	client
649a6d37-6adf-42cc-ba85-05b54a1a49af	Mrs.  KAYESU ANNET	+256703485542	2026-02-10 16:43:14.838814+03	2026-02-10 16:43:14.838814+03	\N	\N	\N	client
6308d515-11b8-4795-adf0-1b76fd753da4	Mrs.  NALUBEGA SARAH	+256755011051	2026-02-10 16:43:16.186976+03	2026-02-10 16:43:17.480652+03	\N	\N	\N	client
b65df48a-8d01-4a56-abe1-cbad8c41a2c2	Mrs.  NAKALEMA SANDRA	+256742782235	2026-02-10 16:43:20.049639+03	2026-02-10 16:43:20.049639+03	\N	\N	\N	client
eca234e2-2369-4603-8266-ec56bb922d68	Mr.  LUWANGA EMMANUEL	+256755122254	2026-02-10 16:43:21.289374+03	2026-02-10 16:43:21.289374+03	\N	\N	\N	client
83d2b098-0241-4cfe-9268-1d8d985487f1	Mr.  KIZZA RICHARD	+256743494614	2026-02-10 16:43:23.018129+03	2026-02-10 16:43:23.018129+03	\N	\N	\N	client
f9b054d9-ffdd-4cda-983e-5d1d72af5748	Mr.  SENDIJJA OWEN	+256709804550	2026-02-10 16:43:24.381435+03	2026-02-10 16:43:24.381435+03	\N	\N	\N	client
138711bc-7e20-4baf-84fa-477ec8d60d85	Mr.  SELWANGA JAMES	+256753694387	2026-02-10 16:43:25.716029+03	2026-02-10 16:43:25.716029+03	\N	\N	\N	client
6cdf61ef-3704-480a-bddf-e43ee1632d60	Mr.  MBALAGA ERIC	+256748274317	2026-02-10 16:43:26.971707+03	2026-02-10 16:43:26.971707+03	\N	\N	\N	client
6586ade0-754f-4ac5-8e64-f3160c8007e3	Mr.  KIGOZI FRED	+256700861817	2026-02-10 16:43:38.281766+03	2026-02-10 16:43:38.281766+03	\N	\N	\N	client
109670e4-bef6-4d76-966c-c23afdc5dd9d	Mrs.  AZZIZAH SARAH RAMADHAN	+2567056670420	2026-02-10 16:43:39.604427+03	2026-02-10 16:43:39.604427+03	\N	\N	\N	client
d4e939f3-e7d4-4f56-a34c-d4a7a03e8ddc	Mr.  KATONGOLE ROBERT	+25675700426369	2026-02-10 16:43:40.927601+03	2026-02-10 16:43:40.927601+03	\N	\N	\N	client
74906efd-6b7e-42d5-899b-3efc69351f30	Mr.  NYANZI BASHIR SENTAMU	+256701685384	2026-02-10 16:43:42.193577+03	2026-02-10 16:43:42.193577+03	\N	\N	\N	client
bf484958-aee1-4898-ad55-f2c3e09a3dbb	Mr.  SSEKABIRA FRANCIS	+256756477601	2026-02-10 16:43:47.286401+03	2026-02-10 16:43:47.286401+03	\N	\N	\N	client
340731f3-7f00-4321-aba6-f71749990f88	Mr.  KAMERI VENANSIO	+256748561101	2026-02-10 16:43:57.654456+03	2026-02-10 16:43:57.654456+03	\N	\N	\N	client
3b445c66-3cb4-4005-bad1-7f1dd38f8469	Mr.  NTUME CHRISTOPHER	+256787581727	2026-02-10 16:44:04.056178+03	2026-02-10 16:44:04.056178+03	\N	\N	\N	client
8767d46a-e55b-43d5-8733-70fe75d39bc8	Mr.  KAHINGA ALEX	+256701830570	2026-02-10 16:44:01.790803+03	2026-02-10 16:44:10.873279+03	\N	\N	\N	client
a08a66cb-762e-4949-b8a7-ed1ce6e49329	Mrs.  NAKKAZI JUSTINE	+256757124727	2026-02-10 16:44:13.754735+03	2026-02-10 16:44:13.754735+03	\N	\N	\N	client
70f9bd68-d0f5-4459-96eb-e158b87224ea	Mrs.  NANYONGA DOROTHY	+2567081770339	2026-02-10 16:44:15.341099+03	2026-02-10 16:44:15.341099+03	\N	\N	\N	client
547bb2d1-1fe2-481a-9d54-7707a1549637	Mrs.  NANJEGO SHAMIM	+256752181084	2026-02-10 16:44:16.617229+03	2026-02-10 16:44:16.617229+03	\N	\N	\N	client
6bbb447b-bae9-4561-881a-7bbe3e421eae	Mrs.  NAKKAZI AISHA	+256703589587	2026-02-10 16:44:17.949349+03	2026-02-10 16:44:17.949349+03	\N	\N	\N	client
eb785a79-408e-47a9-83f3-24d30f9ff734	Mrs.  NALUTAAYA MADINAH	+256751445443	2026-02-10 16:44:19.708476+03	2026-02-10 16:44:19.708476+03	\N	\N	\N	client
50757186-4423-491a-9398-dfb0c703eb72	SEBAGALA NASIF	+256757961403	2026-02-10 16:44:20.952866+03	2026-02-10 16:44:20.952866+03	\N	\N	\N	client
02b0f6e5-3f63-491a-b954-daace6346205	Mr.  Ssenkungu Ronald	+256753117971	2026-02-10 16:42:48.126376+03	2026-02-10 16:44:26.188125+03	\N	\N	\N	client
82ee432e-e4ce-4bf9-9337-979589163295	Mr.  KAYUZA ALI	+256757880909	2026-02-10 16:43:00.86114+03	2026-02-10 16:44:46.873434+03	\N	\N	\N	client
93b006f4-5bc5-4128-b809-c3ef3d1fcff0	Mr.  KAYINGI ALEX	+256701820570	2026-02-10 16:44:06.7848+03	2026-02-10 16:45:18.14319+03	\N	\N	\N	client
0c8d7586-4a65-435c-9941-7399e08929bc	Mr.  KALO ROBERT	+256700712733	2026-02-10 16:44:09.551749+03	2026-02-10 16:45:19.404123+03	\N	\N	\N	client
20f9fd31-d371-4a1e-b565-aefb4717fee8	Mrs.  NAGAYI SHAMIM	+256741963106	2026-02-10 16:42:50.272558+03	2026-02-10 16:45:23.342185+03	\N	\N	\N	client
71a9a58d-ad1c-46d1-b9ed-2e8a4b2dedc2	Mrs.  AWORI VIVIAN	+256709523727	2026-02-10 16:42:24.147996+03	2026-02-10 16:49:10.313316+03	\N	\N	\N	client
f973fba1-f08e-475c-8c93-f563c490a8b2	Mrs.  NAKYANZI TEOPISTA	+256751827755	2026-02-10 16:42:27.587303+03	2026-02-10 16:49:02.443447+03	\N	\N	\N	client
11239e65-53f4-458d-ac9b-7714ea883a88	MUSISI PHILLIP	+256707213827	2026-02-10 16:42:26.281724+03	2026-02-10 16:49:11.616123+03	\N	\N	\N	client
fb3a1d2d-9b7d-4810-81c2-821a163861fc	Mrs.  NAJJINDA JAMILAH	+256707054848	2026-02-10 16:42:25.41354+03	2026-02-10 16:49:12.889611+03	\N	\N	\N	client
9694dc5a-5796-40c3-9968-ae576b8fa9be	Mrs.  KOBUSINGYE SHEEBAH	+256708337483	2026-02-10 16:44:02.767145+03	2026-02-10 16:49:18.109185+03	\N	\N	\N	client
20346c20-1871-4580-a472-b5204303da15	Mr.  SENYONDWA JULIUS	+256759065112	2026-02-10 16:42:48.971865+03	2026-02-10 16:49:19.398806+03	\N	\N	\N	client
aed117fe-2ffa-46da-99a0-144dcb8463ba	Mrs.  NAMUBIRU FATUMA	\N	2026-02-10 16:44:05.511599+03	2026-02-10 16:49:32.093588+03	\N	\N	\N	client
2be1a302-1789-46a6-8178-efe933c5ab4a	Mr.  KAMOGA HUSSEIN	+256754787039	2026-02-10 16:43:31.782164+03	2026-02-10 16:49:38.460807+03	\N	\N	\N	client
e5a6f7b3-ff2e-4af1-afb3-2139a575f3de	Mr.  MWEBE JOHN	+256753856515	2026-02-10 16:43:33.110804+03	2026-02-10 16:49:42.421725+03	\N	\N	\N	client
c5af0695-b0cf-4173-b366-67a0fd11b88e	Mrs.  NAMULI HAJALA	+256740686007	2026-02-10 16:43:36.594442+03	2026-02-10 16:49:58.196239+03	\N	\N	\N	client
86f9f8d8-2a98-4a27-b349-c24ac684e5eb	Mrs.  NAKIWALA OLIVIA	+256741884026	2026-02-10 16:43:34.571209+03	2026-02-10 16:49:59.607819+03	\N	\N	\N	client
01e22d26-83e2-4c82-9fbc-14be066b9357	Mr.  SENYONDO DEO	+256757947598	2026-02-10 16:43:43.467025+03	2026-02-10 16:50:40.438665+03	\N	\N	\N	client
56feab29-5095-4735-99ac-186fc216123f	Mr.  ISOOBA EMMANUEL	+256752634444	2026-02-10 16:43:44.711047+03	2026-02-10 16:50:44.607693+03	\N	\N	\N	client
2a59fe45-d8cc-4e13-9585-4d74196d0a17	Mr.  KIMBUGWE ROBERT	+256742646117	2026-02-10 16:43:30.468294+03	2026-02-10 16:50:58.646746+03	\N	\N	\N	client
e4d722e7-934f-47cd-b9ba-b8c1f8cfcc08	Mr.  MWESIGWA INNOCENT	+256705490711	2026-02-10 16:44:23.520671+03	2026-02-10 16:44:23.520671+03	\N	\N	\N	client
30559a2e-3a3e-4fa1-916f-13844785a13a	Mr.  MAYANJA DERRICK	+256745922959	2026-02-10 16:44:24.460981+03	2026-02-10 16:44:24.460981+03	\N	\N	\N	client
058382f1-7377-445e-a5d9-025dc8817d55	Mr.  NGOBI FALUKU	+256703105879	2026-02-10 16:44:25.334875+03	2026-02-10 16:44:25.334875+03	\N	\N	\N	client
fe11a0df-308f-43b9-908e-17b84eff55b8	NANKYA AMINAH	+256755841500	2026-02-10 16:44:27.948654+03	2026-02-10 16:44:27.948654+03	\N	\N	\N	client
a84b8e25-b11a-49f3-b8fc-43110b003ae2	Mrs.  NANSAMBA RITAH	+256752090158	2026-02-10 16:44:28.850468+03	2026-02-10 16:44:28.850468+03	\N	\N	\N	client
4aae52fd-276c-4764-9e01-e01a6ff197b0	Mrs.  NABUNJE RUTH	+256701359484	2026-02-10 16:44:30.123655+03	2026-02-10 16:44:30.123655+03	\N	\N	\N	client
0165b499-c223-40a2-8906-bfc9e90bd1f9	Mrs.  NDAGIRA MAYIMUNA	+256750933803	2026-02-10 16:44:31.458857+03	2026-02-10 16:44:31.458857+03	\N	\N	\N	client
5144948a-9f9e-4085-bc13-ba202f45ef93	Mr.  KASOLO DANIEL	+256759845552	2026-02-10 16:44:39.399853+03	2026-02-10 16:44:39.399853+03	\N	\N	\N	client
e5da2496-0793-44ba-9178-79c27c5bcf69	Mrs.  MIREMBE JOAN	+256742895299	2026-02-10 16:44:40.269126+03	2026-02-10 16:44:40.269126+03	\N	\N	\N	client
011c5550-c6d5-4470-96eb-f18682382295	Mr.  NYANZI DAVID	+256751840100	2026-02-10 16:44:41.674515+03	2026-02-10 16:44:41.674515+03	\N	\N	\N	client
f418cad4-e07c-4a28-aa93-b5c0441db7cb	Mr.  NTALE SULAIT	+256707683511	2026-02-10 16:44:38.31796+03	2026-02-10 16:44:43.014946+03	\N	\N	\N	client
2cbc3f0b-d1cd-4b72-b43d-b4142b004395	Mrs.  NAKIBUUKA RITAH	+256702670438	2026-02-10 16:44:47.767947+03	2026-02-10 16:44:47.767947+03	\N	\N	\N	client
f05dadc0-897c-478f-83f0-f4e29bca7e43	Mrs.  KATATUMBA SUSAN	+256744771244	2026-02-10 16:44:50.580724+03	2026-02-10 16:44:50.580724+03	\N	\N	\N	client
2fe55582-cbe5-4d22-9cef-e108c2486d0f	Mrs.  KANSIME ODETH	+256755990403	2026-02-10 16:44:51.883719+03	2026-02-10 16:44:51.883719+03	\N	\N	\N	client
a30514cc-6539-4942-a10b-1b294af66c37	Mr.  TURINAWE RICHARD	+256759235535	2026-02-10 16:45:02.290638+03	2026-02-10 16:45:02.290638+03	\N	\N	\N	client
5150e093-dd70-4b8d-bf98-c6f0f110a361	Mrs.  NAMUJUZI JUSTINE	+256750241148	2026-02-10 16:45:05.001774+03	2026-02-10 16:45:05.001774+03	\N	\N	\N	client
cefb49b4-276b-4a58-9417-bbc2b325cbf8	Mrs.  KENEHERA HARRIET	+256779416177	2026-02-10 16:45:13.319831+03	2026-02-10 16:45:13.319831+03	\N	\N	\N	client
9aba298e-7052-4829-abd2-6e4e4bcbfdcb	Mrs.  NAKIMERA JUSTINE	+256743837984	2026-02-10 16:45:14.332091+03	2026-02-10 16:45:14.332091+03	\N	\N	\N	client
2d24444a-7549-46fc-9f34-ef7539ff7d34	Mrs.  NAKATO FLORENCE	+256746410469	2026-02-10 16:45:15.198254+03	2026-02-10 16:45:15.198254+03	\N	\N	\N	client
6818310f-fbd9-49f6-bd5c-1e9040efa485	Mrs.  NAKAMYA FIINA	+256701179824	2026-02-10 16:45:16.042537+03	2026-02-10 16:45:16.042537+03	\N	\N	\N	client
59b8403c-e62a-4c52-b8e1-5990f90caae6	Mrs.  MUTESI MAURINE	+256759875394	2026-02-10 16:45:17.279405+03	2026-02-10 16:45:17.279405+03	\N	\N	\N	client
3e259e0b-71f9-4b38-a318-31475b572e83	Mrs.  SEMAKULA HADIJAH	+256701143206	2026-02-10 16:44:57.077758+03	2026-02-10 16:45:24.649974+03	\N	\N	\N	client
39c98a36-7e08-4a59-98a4-31fecde57f65	Mrs.  NAJUKO JULIET	+256758854127	2026-02-10 16:44:58.378724+03	2026-02-10 16:45:25.928736+03	\N	\N	\N	client
f3ea030a-f08b-422a-971e-e9096db37e2a	Mr.  KAWOOYA NASHIL	+256702939259	2026-02-10 16:45:27.203797+03	2026-02-10 16:45:27.203797+03	\N	\N	\N	client
2e8ff03f-83de-4c6b-ac2e-e6e78d875384	Mr.  SENFUKA NICHOLAS	+256709742351	2026-02-10 16:44:59.642057+03	2026-02-10 16:45:28.474409+03	\N	\N	\N	client
78647bc5-2391-41df-b2ab-4e0dcf417e94	Mrs.  NAMAGEMBE JOSEPHINE	\N	2026-02-10 16:45:30.219044+03	2026-02-10 16:45:30.219044+03	\N	\N	\N	client
862d9fda-c97b-49a7-8a08-ef41ef41dba5	Mrs.  NAKAYONDO NIGHT	\N	2026-02-10 16:45:31.222696+03	2026-02-10 16:45:31.222696+03	\N	\N	\N	client
1d560cc3-4e58-43e3-b8fc-7d8ec4097ad9	Mrs.  NAJJOBYO JANAT	\N	2026-02-10 16:45:32.054578+03	2026-02-10 16:45:32.054578+03	\N	\N	\N	client
eb560f55-b2cf-4816-b7d4-581f1ced7018	Mrs.  NAKALULE CARLO	+256708822253	2026-02-10 16:45:32.981894+03	2026-02-10 16:45:32.981894+03	\N	\N	\N	client
2ad746b0-4758-45b5-9f7f-961a13ecc999	Mrs.  NALUBOWA HADIJAH	+256750174563	2026-02-10 16:45:33.967073+03	2026-02-10 16:45:33.967073+03	\N	\N	\N	client
06429f14-33f9-4109-a7e9-04b0cb4e6bf8	Mrs.  MUHAME AZIDAH	+256782894315	2026-02-10 16:45:35.326428+03	2026-02-10 16:45:35.326428+03	\N	\N	\N	client
38305602-9166-470a-b31a-7684390165a8	Mrs.  KABYESIZA AGNES	+256702787612	2026-02-10 16:45:36.596026+03	2026-02-10 16:45:36.596026+03	\N	\N	\N	client
5f764476-2d30-45b5-b5a0-873db80f6159	Mrs.  AJOLORWOTH FAITH	\N	2026-02-10 16:45:37.524567+03	2026-02-10 16:45:37.524567+03	\N	\N	\N	client
889ce556-5d0b-410f-b377-e951a83693cb	Mrs.  NAKAYIZA AGNES	+256709320340	2026-02-10 16:45:38.829864+03	2026-02-10 16:45:38.829864+03	\N	\N	\N	client
6e1454cd-b2a8-46c0-b585-97a4e7069a5e	Mrs.  ATIM TECKLER ELIZABETH	+256703077844	2026-02-10 16:45:39.726522+03	2026-02-10 16:45:39.726522+03	\N	\N	\N	client
059e3a3a-4882-478e-91a0-e0351f674fda	Mrs.  HADIJAH OKIRYA	+256742937322	2026-02-10 16:45:40.582575+03	2026-02-10 16:45:40.582575+03	\N	\N	\N	client
7b5ba9f7-6759-45a7-9736-93dfc16962ff	Mrs.  NAMUBIRU ROBINAH	+256704772494	2026-02-10 16:45:41.487041+03	2026-02-10 16:45:41.487041+03	\N	\N	\N	client
5fabe3f8-0c46-4fa3-9124-99e7995da45f	Mrs.  NAKAWESI AMINAH	+256704888445	2026-02-10 16:45:42.816375+03	2026-02-10 16:45:42.816375+03	\N	\N	\N	client
bd9003ff-97f8-497a-b0ba-07f2f735627e	Mrs.  NANKYA REHEMA	+256705312121	2026-02-10 16:45:43.744483+03	2026-02-10 16:45:43.744483+03	\N	\N	\N	client
23881893-2b4a-4c91-acdf-2040dab32de2	KYALO SHARIFAH	+256755783020	2026-02-10 16:45:44.638322+03	2026-02-10 16:45:44.638322+03	\N	\N	\N	client
7c98dd28-ceac-43d7-b7ca-5e79a0fb9423	Mrs.  NALULE IMMACULATE	+256741023839	2026-02-10 16:45:45.460629+03	2026-02-10 16:45:45.460629+03	\N	\N	\N	client
52b239b8-26f9-432e-919e-60b77283914b	Mrs.  NAKULIMA EDITH	+256703374798	2026-02-10 16:45:57.393274+03	2026-02-10 16:45:57.393274+03	\N	\N	\N	client
bf727a21-c74a-4cc5-ad62-9243ad0098b2	Mrs.  NANKYA ROSE	+256756239010	2026-02-10 16:45:58.279116+03	2026-02-10 16:45:58.279116+03	\N	\N	\N	client
9033a25b-d580-453d-a954-f5a489167e93	Mrs.  KYAZIKE MAGRET	+256705585501	2026-02-10 16:45:59.64719+03	2026-02-10 16:45:59.64719+03	\N	\N	\N	client
3eaaac65-3b4a-43b8-8713-6167e463ec00	Mr.  KATIMBO JOHN BOSCO	+2567048414872	2026-02-10 16:46:00.930619+03	2026-02-10 16:46:00.930619+03	\N	\N	\N	client
70863a8b-bb70-4fee-aa55-eb4b42353a26	Mrs.  BRENDAH NINSIIMA	+256751838232	2026-02-10 16:46:04.873124+03	2026-02-10 16:46:04.873124+03	\N	\N	\N	client
1d2eba9c-e1d3-4b09-aa8c-5aa56d76dfee	Mrs.  TUSIIME JOANITA	\N	2026-02-10 16:46:06.564728+03	2026-02-10 16:46:06.564728+03	\N	\N	\N	client
b2f9fc1c-a7a2-433c-b95a-a46fdc55f1f9	Mrs.  NAMUKWAYA OLIVIA	+256703240279	2026-02-10 16:46:07.420269+03	2026-02-10 16:46:07.420269+03	\N	\N	\N	client
4bae7252-d05c-4562-8944-0898ca5b9817	Mrs.  NANKYA JALIA	+256752965745	2026-02-10 16:46:09.143151+03	2026-02-10 16:46:09.143151+03	\N	\N	\N	client
3ace33c7-e0d0-4fa3-ae26-e3bf55c4a544	Mrs.  ZALWANGO RESTY	+256751243696	2026-02-10 16:46:10.581073+03	2026-02-10 16:46:10.581073+03	\N	\N	\N	client
825a411b-c89a-4b59-9c20-a7c33eefa39a	Mr.  NTAATE HENRY	+256702720908	2026-02-10 16:46:11.454318+03	2026-02-10 16:46:11.454318+03	\N	\N	\N	client
7db5c923-cbce-4fe2-9c0c-5c0fd79e4322	Mrs.  NAGAWA OLIVIA	+256751350949	2026-02-10 16:46:12.304718+03	2026-02-10 16:46:12.304718+03	\N	\N	\N	client
8d21cb2a-9bea-4b88-8d86-bb6ace6668bb	Mrs.  NAKYANZI SHAMIM	+256701345025	2026-02-10 16:46:13.144726+03	2026-02-10 16:46:13.144726+03	\N	\N	\N	client
8e54490f-e956-47a9-95ac-75c1bee50ccf	Mrs.  MBASINGA HARRIET	+256740538107	2026-02-10 16:46:13.988271+03	2026-02-10 16:46:13.988271+03	\N	\N	\N	client
1e74885d-6b85-4a0c-89bf-465beb71ddda	Mr.  SEMAKULA CHARLES	+256751935512	2026-02-10 16:46:15.263521+03	2026-02-10 16:46:15.263521+03	\N	\N	\N	client
bee09d47-3ccf-40f7-a58b-65ea385c52c7	Mr.  SEKIZIYIVU IBRAHIM	+256751500820	2026-02-10 16:45:54.347138+03	2026-02-10 16:50:51.224295+03	\N	\N	\N	client
05487af2-9e16-4a7f-b1cc-ed36c0a7f8e5	Lubega Josam	+256752099263	2026-02-10 16:45:07.544653+03	2026-02-10 16:47:08.284889+03	\N	\N	\N	client
be1f9842-cda7-4c77-b755-1bd2da1bf6d6	Namuli Betty	+256706197648	2026-02-10 16:45:06.263562+03	2026-02-10 16:47:09.65157+03	\N	\N	\N	client
843fd8ad-8f5e-403b-95ad-eb115e8bc944	Mrs.  NALWADDA PHIONAH	+256758967474	2026-02-10 16:46:08.282475+03	2026-02-10 16:48:02.007648+03	\N	\N	\N	client
8ed1ce66-1da6-4dea-b98b-0efbd8566a8d	Mr.  SENDEGEYA SAKA	+256756124401	2026-02-10 16:45:00.957407+03	2026-02-10 16:48:10.129493+03	\N	\N	\N	client
03e90c4f-3ce4-4379-9610-4bd7e50c7493	Mrs.  ZALWANGO JESCA BABIRYE	+256755296356	2026-02-10 16:45:03.576127+03	2026-02-10 16:48:15.957533+03	\N	\N	\N	client
1e944c16-4cd3-4745-bc61-46ccac667064	Mrs.  NAMBOOZE FAUZIA	+256758366002	2026-02-10 16:44:56.208414+03	2026-02-10 16:48:23.810292+03	\N	\N	\N	client
a381ab48-64f5-42a1-8055-3947de1de7cc	Mrs.  NAMULONDO HADIJAH	+256744041445	2026-02-10 16:44:54.506727+03	2026-02-10 16:49:47.761326+03	\N	\N	\N	client
00412331-e81b-42e6-8cd1-6eda658a259f	KARUHANGA CHRISTOPHER	+256752213079	2026-02-10 16:46:03.577257+03	2026-02-10 16:50:32.711891+03	\N	\N	\N	client
2440bea4-eed8-4be6-9416-8936269b315e	DDUMBA PETER	+256755532306	2026-02-10 16:46:02.24443+03	2026-02-10 16:50:33.975664+03	\N	\N	\N	client
83dc39d8-adf0-4fb9-a877-94e47c784f86	Mr.  KIJALI JOVAN	+256759627909	2026-02-10 16:45:56.078025+03	2026-02-10 16:50:50.344417+03	\N	\N	\N	client
eff1ac0d-68ae-4320-ba77-598232062b39	Mr.  KIBIRANGO MEDI	+256708225037	2026-02-10 16:45:55.181556+03	2026-02-10 16:50:53.420808+03	\N	\N	\N	client
89114712-ed3d-471c-9055-9c1d46ffb3e8	Mrs.  NAKAYIZA CATHERINE	+256759305134	2026-02-10 16:46:16.695458+03	2026-02-10 16:46:16.695458+03	\N	\N	\N	client
c6212859-a4c3-43ec-8294-ec70e64a8081	NAMATOVU AGNES	+256754667955	2026-02-10 16:46:17.962704+03	2026-02-10 16:46:17.962704+03	\N	\N	\N	client
c94a5039-8249-4130-9fb5-c7ed1949294a	NALUMULI ROBINAH	+256741354448	2026-02-10 16:46:19.216099+03	2026-02-10 16:46:20.552449+03	\N	\N	\N	client
8b5da675-0aad-4af3-ad32-4cb50572622d	Mrs.  NANYONGA ZAINA	\N	2026-02-10 16:46:21.848872+03	2026-02-10 16:46:21.848872+03	\N	\N	\N	client
8ae68040-c08f-47a7-9418-df5a62997c81	Mrs.  NALULE AMINA	\N	2026-02-10 16:46:23.52663+03	2026-02-10 16:46:23.52663+03	\N	\N	\N	client
0d7a345c-f063-446b-bc86-6c0c74dba4c5	Mrs.  NAMPIJJA LINDA	\N	2026-02-10 16:46:24.359946+03	2026-02-10 16:46:24.359946+03	\N	\N	\N	client
68d5c85d-6714-4f08-bf5f-163d94dc487a	Mrs.  NANSAMBA MARGRET	+256709290140	2026-02-10 16:46:25.229299+03	2026-02-10 16:46:25.229299+03	\N	\N	\N	client
9280697f-f63c-41f4-89df-baf1d8477e89	Mr.  MAWANDA SHAFIK	\N	2026-02-10 16:46:26.071699+03	2026-02-10 16:46:26.071699+03	\N	\N	\N	client
23deccb8-1524-49b3-9c77-962da14bca5d	Mrs.  NAKIMBUGWE JULIET	\N	2026-02-10 16:46:26.921502+03	2026-02-10 16:46:26.921502+03	\N	\N	\N	client
04283371-d6cf-4f0e-a6c1-9c0a14ef0105	Mrs.  NATUKUNDA JUSTINE	+256740973908	2026-02-10 16:46:28.186067+03	2026-02-10 16:46:28.186067+03	\N	\N	\N	client
cbf2944c-cf41-4891-b1db-eb59ac135da6	Mrs.  ATUHIRE PHIONAH	+256753241545	2026-02-10 16:46:29.182723+03	2026-02-10 16:46:29.182723+03	\N	\N	\N	client
d9f6c382-0f89-4305-a511-ee2462725ba4	Mrs.  ATUHIRE EVELYNE	+256705510815	2026-02-10 16:46:30.009997+03	2026-02-10 16:46:30.009997+03	\N	\N	\N	client
e0bb2a3d-eb4b-4a11-a771-92f96bd4a087	Mrs.  KYOSIMIRE PAMELA	+256779008446	2026-02-10 16:46:34.744192+03	2026-02-10 16:46:34.744192+03	\N	\N	\N	client
47cb8b23-3f16-4994-b8e6-18862a6ed990	Mrs.  NALUKWAGO FRIDA	\N	2026-02-10 16:46:35.568542+03	2026-02-10 16:46:35.568542+03	\N	\N	\N	client
17ea56e2-d880-4e21-a39d-236426996eb9	Miss  KAMYA TEDDY	\N	2026-02-10 16:46:36.416931+03	2026-02-10 16:46:36.416931+03	\N	\N	\N	client
d53752cf-89c5-4644-81d5-9715cbc17a32	Mrs.  KAHWA LACKEL	\N	2026-02-10 16:46:38.112222+03	2026-02-10 16:46:38.112222+03	\N	\N	\N	client
3f5248b6-0c60-42ab-8af0-9b77a5d979e9	Mrs.  NAKIRANDA BABRA	\N	2026-02-10 16:46:40.287111+03	2026-02-10 16:46:40.287111+03	\N	\N	\N	client
679efbaa-b87d-4078-8999-fe63b8e5637c	Mrs.  KYATEREKERA CHRISTINE	\N	2026-02-10 16:46:41.118106+03	2026-02-10 16:46:41.118106+03	\N	\N	\N	client
52858932-34e1-4de4-be2f-4c30874934df	Mr.  Lusiba Fred	+256700527371	2026-02-10 16:46:42.36443+03	2026-02-10 16:46:42.36443+03	\N	\N	\N	client
84dd812b-0002-43d6-aa98-91a21570f1ef	Ms.  Lukwago Eva	+256703446562	2026-02-10 16:46:43.647559+03	2026-02-10 16:46:43.647559+03	\N	\N	\N	client
5fa08807-417e-441a-8947-b1b18b1f4a24	Nakiseka Jowelia	+256750047034	2026-02-10 16:46:45.007448+03	2026-02-10 16:46:45.007448+03	\N	\N	\N	client
250bc13c-d312-4415-aa76-dc2d55113737	Mrs.  Nambazira Rose	+256701928429	2026-02-10 16:46:46.308087+03	2026-02-10 16:46:46.308087+03	\N	\N	\N	client
a63f462c-5bf3-4530-8f72-49e73d626741	Mrs.  NAMUWULYA WINNIE BIRUNGI	+256753136375	2026-02-10 16:46:48.034942+03	2026-02-10 16:46:48.034942+03	\N	\N	\N	client
602ea67a-340f-4dd3-9503-66a80b3026e2	Mrs.  NAKASIRYE SYLIVIA	+25674408582	2026-02-10 16:46:48.905876+03	2026-02-10 16:46:48.905876+03	\N	\N	\N	client
fdbead1c-edcf-49eb-9201-fa387db679c7	Mrs.  NAGAWA REHEMA NAKATO	+256708792304	2026-02-10 16:46:49.773145+03	2026-02-10 16:46:49.773145+03	\N	\N	\N	client
7b177c95-c74c-4512-8210-7de8614f1b3e	Mrs.  LUNKUSE FLORENCE	\N	2026-02-10 16:46:50.594777+03	2026-02-10 16:46:50.594777+03	\N	\N	\N	client
d89dee60-1781-44ff-ad5f-993a2b4318aa	Namuyobo Monica	+256741804554	2026-02-10 16:46:51.847069+03	2026-02-10 16:46:51.847069+03	\N	\N	\N	client
b222fe5c-9dd6-4815-be42-e738ed986da3	Mrs.  Nakonde Hasifah	+256706982931	2026-02-10 16:46:54.398049+03	2026-02-10 16:46:54.398049+03	\N	\N	\N	client
f439d4d2-592b-4ee5-97a5-b2fb05b06bf7	Mr.  WASSWA CHRISTOPHER	+256759890840	2026-02-10 16:46:55.2437+03	2026-02-10 16:46:55.2437+03	\N	\N	\N	client
e4a6fbc6-4f82-4bd9-8cde-8f1be35584ae	Mr.  MUSISI TADEO	+256708439908	2026-02-10 16:46:56.5058+03	2026-02-10 16:46:56.5058+03	\N	\N	\N	client
58211898-6c37-44ad-bef1-04da125547ce	Mr.  ZIWA JOSEPHINE	+256705414598	2026-02-10 16:46:58.935784+03	2026-02-10 16:46:58.935784+03	\N	\N	\N	client
8c26a54a-ba90-41eb-80ac-dfa81a737a11	Mrs.  DOREEN NAMAKULA	\N	2026-02-10 16:46:59.839937+03	2026-02-10 16:46:59.839937+03	\N	\N	\N	client
02fb0f11-cc31-4aa8-a850-0e6ab9506b0e	Mr.  Lubwama Robert	+256701268606	2026-02-10 16:47:01.063024+03	2026-02-10 16:47:01.063024+03	\N	\N	\N	client
21a1ba1f-5cf1-419b-858f-46f01a312df3	Mugema Jackson	\N	2026-02-10 16:47:01.928359+03	2026-02-10 16:47:01.928359+03	\N	\N	\N	client
76e70d00-3cd1-4d72-9cca-27c091aed4fa	Mr.  Mukoli Tom	+256701080011	2026-02-10 16:47:02.790444+03	2026-02-10 16:47:02.790444+03	\N	\N	\N	client
497f9f16-5de5-44f4-939a-32d1457fccd0	Mr.  Mwesigwa Halid	+256752006066	2026-02-10 16:47:03.612351+03	2026-02-10 16:47:03.612351+03	\N	\N	\N	client
bf3e4eae-0cf7-4477-ab0e-38f539fad6e5	Mrs.  Kaitesi Jolly	+256706705925	2026-02-10 16:47:04.878651+03	2026-02-10 16:47:04.878651+03	\N	\N	\N	client
bfef2e51-3fb5-48b6-907f-35e4c93145dd	Mrs.  Akoth Allen	+256756049413	2026-02-10 16:47:05.735462+03	2026-02-10 16:47:05.735462+03	\N	\N	\N	client
770cd95d-4fed-4c4f-bad3-c5ae55e48072	Mrs.  Nakacwa Annet	+256751560266	2026-02-10 16:47:06.608087+03	2026-02-10 16:47:06.608087+03	\N	\N	\N	client
38f1990a-6042-4115-93c5-92c66bdf6f16	Mr.  Kisozi David	+256751500308	2026-02-10 16:47:07.440302+03	2026-02-10 16:47:07.440302+03	\N	\N	\N	client
0e85cd6e-126b-4425-b34e-aaf43971cc56	Mrs.  ASONYA RASHIDAH	+256705794287	2026-02-10 16:47:11.548035+03	2026-02-10 16:47:11.548035+03	\N	\N	\N	client
a691e269-0a53-4065-b073-c7e53791c8e9	Mrs.  AHWEZA NEUST	+256745656417	2026-02-10 16:47:12.87162+03	2026-02-10 16:47:12.87162+03	\N	\N	\N	client
4e7ddc85-81c4-4b25-93d6-82699a422cf6	Mrs.  NELIMA FATUMA	+256745656917	2026-02-10 16:47:13.793172+03	2026-02-10 16:47:13.793172+03	\N	\N	\N	client
a9d3665a-5072-49ad-bf5c-cf919abf5390	Mrs.  NAKIBUUKA PAULINE	+256753173079	2026-02-10 16:47:14.660518+03	2026-02-10 16:47:14.660518+03	\N	\N	\N	client
e144d13d-6b52-4477-a560-649bae54777d	Mrs.  NAKADDU LILLIAN	+256709463912	2026-02-10 16:47:15.510661+03	2026-02-10 16:47:15.510661+03	\N	\N	\N	client
2c27ec28-509f-4bef-9631-9c457be0599a	Mr.  JJUUKO JOSEPH	+256784745545	2026-02-10 16:47:18.716045+03	2026-02-10 16:47:18.716045+03	\N	\N	\N	client
be6c061d-3c8a-4f36-9406-ba6720a11eb4	Mr.  LUTAYA ABBEY	+256743235924	2026-02-10 16:47:19.611732+03	2026-02-10 16:47:19.611732+03	\N	\N	\N	client
2e5762b6-30fa-4924-9011-22ddb7fadfd4	Mr.  NAKIBINGE RONNY	+256701169823	2026-02-10 16:47:20.516031+03	2026-02-10 16:47:20.516031+03	\N	\N	\N	client
1b707875-94f0-434c-a774-eba3820a6dfc	Mrs.  KITOOKE BRIAN	+256700112401	2026-02-10 16:47:21.36165+03	2026-02-10 16:47:21.36165+03	\N	\N	\N	client
049d7941-6823-4b21-82b4-5bc4835646a2	Mr.  KAKULE JONATHAN	+256758198968	2026-02-10 16:47:22.692978+03	2026-02-10 16:47:22.692978+03	\N	\N	\N	client
90ec65bf-2af6-41fe-b342-e0b1942ecab3	NAMULI DIANAH	+256757396334	2026-02-10 16:47:23.5517+03	2026-02-10 16:47:23.5517+03	\N	\N	\N	client
0d61f03d-50de-44ce-b5cb-034edd799022	Mrs.  NYOMEWA SCOVIA	+256755931062	2026-02-10 16:47:25.823319+03	2026-02-10 16:47:25.823319+03	\N	\N	\N	client
9d1fa1b5-d105-4036-af69-bf0ed65dc85e	Mrs.  KYOSIMIRE PROSSY	+256755525284	2026-02-10 16:47:26.667266+03	2026-02-10 16:47:26.667266+03	\N	\N	\N	client
db6dc8ee-a1a6-4967-a055-1113449edf7e	Mrs.  NAKAMYA MWAJUMA	+256741857343	2026-02-10 16:47:27.533246+03	2026-02-10 16:47:27.533246+03	\N	\N	\N	client
67b924b7-aa0b-41db-9f22-be7a14bbcbe2	Mrs.  NABIRYE SYLVIA	\N	2026-02-10 16:47:24.916983+03	2026-02-10 16:47:28.367133+03	\N	\N	\N	client
e31ac65f-270b-41e6-b56a-3b4bcc40760c	Mrs.  NANYONGA RUTH	+256705964681	2026-02-10 16:47:29.701414+03	2026-02-10 16:47:29.701414+03	\N	\N	\N	client
f7732074-6034-46b6-b12b-74937c2054a2	Mrs.  NAKITANDA SARAH	+256750454757	2026-02-10 16:47:30.612936+03	2026-02-10 16:47:30.612936+03	\N	\N	\N	client
c8115791-4eb3-4354-91fe-c7e75ca428b4	NAKANWAGI ANNET	+256753286217	2026-02-10 16:47:31.488631+03	2026-02-10 16:47:31.488631+03	\N	\N	\N	client
2bedfdbb-dc3d-4090-8f43-7786c4ceeae6	Mrs.  AUMA FANISE TRACY	+256752998193	2026-02-10 16:47:32.317984+03	2026-02-10 16:47:32.317984+03	\N	\N	\N	client
f015c08d-8754-459d-b7a9-4c204a40cc0c	Mrs.  NAMUBIRU FARIDAH	+256701460164	2026-02-10 16:47:33.161717+03	2026-02-10 16:47:33.161717+03	\N	\N	\N	client
f85517c5-778b-4e1d-bb83-cac8941217cb	Mrs.  KWAGALA SARAH	\N	2026-02-10 16:47:34.009463+03	2026-02-10 16:47:34.009463+03	\N	\N	\N	client
fce7fef4-8c3e-4a19-9430-34b75228f8e1	Mrs.  NANYONJO EMILLY	+256751482221	2026-02-10 16:47:34.877552+03	2026-02-10 16:47:34.877552+03	\N	\N	\N	client
baf75191-95c6-494c-a58f-899de4007d9c	Mrs.  MBABALI HANIFAH	+256782437403	2026-02-10 16:47:36.111301+03	2026-02-10 16:47:36.111301+03	\N	\N	\N	client
a416e84d-7890-4d98-93bb-a7e4cd912423	Mrs.  NANTALE FAITH	+256702927490	2026-02-10 16:47:36.976375+03	2026-02-10 16:47:36.976375+03	\N	\N	\N	client
40e7940e-5d87-4606-bd23-a516f636503e	Mrs.  NAMUYOMBA JOSEPHINE	+256703362630	2026-02-10 16:47:37.837072+03	2026-02-10 16:47:37.837072+03	\N	\N	\N	client
352dd7a5-fee2-4f80-855a-b558a3ff6837	Mrs.  BULYABA RUTH KABUYE	+256705957581	2026-02-10 16:47:38.705576+03	2026-02-10 16:47:38.705576+03	\N	\N	\N	client
cd77105b-ad29-4a6a-857a-2e970bfdffaf	Mrs.  NALWADDA FALIDAH	+256705220010	2026-02-10 16:47:40.828223+03	2026-02-10 16:47:40.828223+03	\N	\N	\N	client
84c0dc10-03d9-4f98-ab1e-183d3d7f47b4	Mrs.  NABAGGALA SOLOME	\N	2026-02-10 16:47:41.691125+03	2026-02-10 16:47:41.691125+03	\N	\N	\N	client
fe98fe91-d2b4-4dcb-8861-d4ce8afa46c1	Mrs.  NANYONJO HANIFAH	\N	2026-02-10 16:47:42.555725+03	2026-02-10 16:47:42.555725+03	\N	\N	\N	client
c84958cf-6d5e-4a35-be2d-58e052148331	Mrs.  NALUWOOZA JULIET BUKENYA	+256702868907	2026-02-10 16:47:16.761125+03	2026-02-10 16:50:00.912133+03	\N	\N	\N	client
22475371-f76b-4883-bebb-04f76bccea35	Mrs.  Ssekitoleko Prossy	+256708663832	2026-02-10 16:46:52.682282+03	2026-02-10 16:50:36.146619+03	\N	\N	\N	client
2859db94-1137-420c-98bb-7920c974ff2d	Mr.  Kasozi Robert	+256754018864	2026-02-10 16:46:32.119124+03	2026-02-10 16:51:05.365711+03	\N	\N	\N	client
807e08cf-7f39-4911-bf52-34d1a7e3c504	Mrs.  Namala Justine Tina	+256705958444	2026-02-10 16:46:37.256229+03	2026-02-10 16:51:08.660962+03	\N	\N	\N	client
dcc9a568-ca90-4086-8acb-a890de378ec6	Ms.  Namakula Teddy	+256759247777	2026-02-10 16:46:32.949559+03	2026-02-10 16:51:30.053853+03	\N	\N	\N	client
1e83cee1-e5ff-49b5-a234-902c80d48418	Nakyeyune Harriet	+256704877756	2026-02-10 16:46:30.850178+03	2026-02-10 16:51:31.344723+03	\N	\N	\N	client
9d31382d-4706-461c-9216-ceec0f8b8e6c	Mrs.  NALUBEGA FLORENCE	+256742226140	2026-02-10 16:47:45.110433+03	2026-02-10 16:47:45.110433+03	\N	\N	\N	client
b5f04cc8-833c-42a7-9672-882d9c4e72bb	Mrs.  NAMWANJE JANE	+256754363241	2026-02-10 16:47:45.924405+03	2026-02-10 16:47:45.924405+03	\N	\N	\N	client
be0e64d6-febb-4f68-ba5a-e17abbd2991f	Mrs.  NASSALI MARIAM	+256756419415	2026-02-10 16:47:46.778037+03	2026-02-10 16:47:46.778037+03	\N	\N	\N	client
049dc689-88dd-477c-8797-006d09ea7b3c	Mrs.  NANTEZA BEATRICE	+256701578999	2026-02-10 16:47:48.066719+03	2026-02-10 16:47:48.066719+03	\N	\N	\N	client
c8ed617e-761f-4529-a299-c5929b29f595	OWINY GLADIES	+256759431663	2026-02-10 16:47:48.902243+03	2026-02-10 16:47:49.767878+03	\N	\N	\N	client
13a5af1f-ff6f-422e-b220-f09c82ec42d8	Mrs.  NASOZI JOYCE	+256760117577	2026-02-10 16:47:50.710833+03	2026-02-10 16:47:50.710833+03	\N	\N	\N	client
685174a7-f301-4f56-98bd-d9ab0d21c04d	Mrs.  NAKAGGWA MILLY	+256775534341	2026-02-10 16:47:51.971618+03	2026-02-10 16:47:51.971618+03	\N	\N	\N	client
a638170e-2831-4803-a289-6bc2365619c9	Mrs.  TWIKIRIZE ALLEN	+256758107938	2026-02-10 16:47:52.867033+03	2026-02-10 16:47:52.867033+03	\N	\N	\N	client
20040977-0530-4cb9-b17f-bbd10d368fde	Mr.  AMPUMUZA AMON	+256752472565	2026-02-10 16:47:55.033576+03	2026-02-10 16:47:55.033576+03	\N	\N	\N	client
b61d7141-6861-4ccf-9274-9dbf383b92bd	Mrs.  NAMUDDU KEMIREMBE HARRIET	+256742245108	2026-02-10 16:47:55.884046+03	2026-02-10 16:47:55.884046+03	\N	\N	\N	client
97aec1a9-c06d-41c2-a9ad-be5bc9dea8e1	NALWADDA BABRA	+256701594523	2026-02-10 16:47:56.742641+03	2026-02-10 16:47:56.742641+03	\N	\N	\N	client
ddcd3099-25e2-4b22-b1ca-76560948b379	Mrs.  AYENYA CHRISTINE NIGHT	+256782194764	2026-02-10 16:47:57.973627+03	2026-02-10 16:47:57.973627+03	\N	\N	\N	client
ec55ad21-2845-4bde-a32e-e9bec58cf96b	Mrs.  ACHIRO SANDRA	+256701273212	2026-02-10 16:47:58.859949+03	2026-02-10 16:47:58.859949+03	\N	\N	\N	client
655c2557-3d0c-4000-b25f-a9ec505a79b7	Mrs.  MIREMBE GIRADES	+256708645888	2026-02-10 16:47:59.70063+03	2026-02-10 16:47:59.70063+03	\N	\N	\N	client
b74b0220-e32f-4180-94af-3a5d0c7e78f2	Mrs.  NAKIBUULE ALLEN	+256704340320	2026-02-10 16:48:01.112098+03	2026-02-10 16:48:01.112098+03	\N	\N	\N	client
43e20055-1131-480b-8c3f-55c2e1b29d29	Mrs.  NAKIRIJA JALIA	+256788259692	2026-02-10 16:48:06.615734+03	2026-02-10 16:48:06.615734+03	\N	\N	\N	client
6b87bf17-9704-413f-bb47-dc9d34c534d7	Mrs.  BUSINGYE ERINA H KIWEESI	+256704300246	2026-02-10 16:48:07.510633+03	2026-02-10 16:48:07.510633+03	\N	\N	\N	client
1b5558e6-51cd-4394-aabe-a13d7353b130	Mrs.  NAKATE ANNET MAYANJA	+256758927292	2026-02-10 16:48:08.385412+03	2026-02-10 16:48:08.385412+03	\N	\N	\N	client
a4b56ca6-a4b8-40bb-9556-c6d21b1e461c	Mr.  KITAKA FAZIRI SSEBUSUNJE	+256743688378	2026-02-10 16:48:13.318501+03	2026-02-10 16:48:13.318501+03	\N	\N	\N	client
59b47db3-ea3b-43d3-a4b4-066ec97197b3	Mrs.  NABAKKA SAUDAH	+256750868057	2026-02-10 16:48:14.252792+03	2026-02-10 16:48:14.252792+03	\N	\N	\N	client
8763caf5-ecee-4ab3-8e96-0f5795adee75	Mrs.  NASILA SALUMU	+256705594949	2026-02-10 16:48:15.122791+03	2026-02-10 16:48:15.122791+03	\N	\N	\N	client
a918b342-a96b-4e5e-968c-265edcca0844	Mrs.  TUMWINE SANDRAH	+256740753002	2026-02-10 16:48:17.235556+03	2026-02-10 16:48:17.235556+03	\N	\N	\N	client
a1f9c4b6-1bc2-48c9-af4b-2349c9a9a146	NALWOGA HALIMA	+256740173928	2026-02-10 16:48:18.939147+03	2026-02-10 16:48:21.529513+03	\N	\N	\N	client
de951e6e-a97a-4d6b-a18e-91af72d22a51	Mrs.  NANYANZI RITAH	+256755739093	2026-02-10 16:48:22.967621+03	2026-02-10 16:48:22.967621+03	\N	\N	\N	client
cfe94e4a-1db7-4e9b-829b-92144418b7ae	KEBIRUNGI ASYNANSI	+256743890919	2026-02-10 16:47:54.197728+03	2026-02-10 16:50:39.5855+03	\N	\N	\N	client
f0469b29-f9b1-487e-8bae-71ab2c752f96	Mrs.  NABAGESERA ROBINAH	+256706760050	2026-02-10 16:48:12.459872+03	2026-02-10 16:50:54.725747+03	\N	\N	\N	client
2e35e7ef-d91e-465c-8646-164db82e9503	Mrs.  Nanyon jo Hasifah	+256773267484	2026-02-10 16:48:04.277913+03	2026-02-10 16:51:10.038163+03	\N	\N	\N	client
0e909348-0d0f-40bb-a690-73d05672b399	Miss  Nalwada Phionah	+256758967479	2026-02-10 16:48:02.881864+03	2026-02-10 16:51:27.024411+03	\N	\N	\N	client
73906246-c2cf-4de6-bbc2-f4ce77ea7e1f	Mr.  BUULE SWALIKI	+256700984624	2026-02-10 16:48:25.067536+03	2026-02-10 16:48:25.067536+03	\N	\N	\N	client
ff4e0d95-46e5-4d3d-8d36-08c2e6adebf9	Mrs.  TWESIGYE EMMACULATE	+256701341438	2026-02-10 16:48:25.923918+03	2026-02-10 16:48:25.923918+03	\N	\N	\N	client
5c811279-65df-42e4-9726-f9a3917a5150	Mrs.  NAKYEJWE AMINA	+256743482849	2026-02-10 16:48:28.073999+03	2026-02-10 16:48:28.073999+03	\N	\N	\N	client
482585ba-0a4b-4936-9b36-a120b90da10d	Mrs.  NAMUBIRU ASHA	+256758829382	2026-02-10 16:48:30.178846+03	2026-02-10 16:48:30.178846+03	\N	\N	\N	client
00810ca3-4b47-46eb-be1d-507c26a19c38	Mrs.  NANYANGE AMINAH	+256703041763	2026-02-10 16:48:31.163151+03	2026-02-10 16:48:31.163151+03	\N	\N	\N	client
ff30f926-2e6b-4a5b-89d5-29beeee48358	Mrs.  NAKIBOWA VICTORIA	\N	2026-02-10 16:48:32.085223+03	2026-02-10 16:48:32.085223+03	\N	\N	\N	client
d22d3eb7-0f94-4368-b127-b709d2c5b380	Miss  KAAHWA SPECIOZA	+256758172968	2026-02-10 16:48:32.938082+03	2026-02-10 16:48:32.938082+03	\N	\N	\N	client
bb8c3d64-b955-4b0f-b9b9-6b6258fa8e9c	Mrs.  MWAJUMA BAHATI	+256703265238	2026-02-10 16:48:33.827561+03	2026-02-10 16:48:33.827561+03	\N	\N	\N	client
5f379480-93c4-417c-934d-d1ab52445110	Mrs.  KAYAGA AMINAH	+256753306067	2026-02-10 16:48:35.084959+03	2026-02-10 16:48:35.084959+03	\N	\N	\N	client
ee846bcc-1cef-4526-9f9e-e03ffe1f0f12	Mrs.  NAKYEYUNE FLORENCE	+256759405535	2026-02-10 16:48:35.940717+03	2026-02-10 16:48:35.940717+03	\N	\N	\N	client
b36fc70a-d8bf-4702-bb83-aea110ffbc55	Mrs.  NDAGIRE UDAYA	+256703618761	2026-02-10 16:48:36.803463+03	2026-02-10 16:48:36.803463+03	\N	\N	\N	client
01ced916-8a12-4dce-8fd6-4303872578f3	Mrs.  NAKATANZA JANET	+256751395539	2026-02-10 16:48:37.689035+03	2026-02-10 16:48:37.689035+03	\N	\N	\N	client
8c05f954-fca9-4cda-8b70-c4616644b9de	Mr.  SSEKABENDE DAVID	+256706548649	2026-02-10 16:48:38.61603+03	2026-02-10 16:48:38.61603+03	\N	\N	\N	client
e952954c-d1a6-4a27-8544-74ab9382d413	Mrs.  NALUBEGA JOWERIA	+256705894706	2026-02-10 16:48:39.625567+03	2026-02-10 16:48:39.625567+03	\N	\N	\N	client
516b63dc-f0e8-4086-b7ed-742550a6e724	Mrs.  MBABAZI SYLIVIA	+256743882950	2026-02-10 16:48:40.902661+03	2026-02-10 16:48:40.902661+03	\N	\N	\N	client
7d1cd2ef-87d7-42ab-8cc2-8b9e300695aa	KOBUSINGYE SARAH	+256703117302	2026-02-10 16:48:41.919423+03	2026-02-10 16:48:41.919423+03	\N	\N	\N	client
d58b90ae-87db-434f-bc8f-7bdc2fbff9c5	Mrs.  NABUKALU LAILA	+256754508619	2026-02-10 16:48:42.855258+03	2026-02-10 16:48:42.855258+03	\N	\N	\N	client
1e525de3-36c7-4ab2-b9e6-57945bc44dfe	Mr.  KIWANUKA FRED	+256700859072	2026-02-10 16:48:43.774944+03	2026-02-10 16:48:43.774944+03	\N	\N	\N	client
812380aa-0496-438a-a468-937227941b7d	Mrs.  NAMPALA FLORENCE	+256755794162	2026-02-10 16:48:44.61099+03	2026-02-10 16:48:44.61099+03	\N	\N	\N	client
0e5e79bd-b62b-497d-8617-63042da74bc1	Mrs.  AMUTUHAIRWE DOROTHY	+256750875855	2026-02-10 16:48:45.439018+03	2026-02-10 16:48:45.439018+03	\N	\N	\N	client
1b0aeb33-b6e3-4dd7-a7f7-df022cd76163	Mrs.  NAKANWAGI HASIFAH	+256756815839	2026-02-10 16:48:46.262238+03	2026-02-10 16:48:46.262238+03	\N	\N	\N	client
806fc588-7930-42f2-b37d-43b864d04cd9	Mrs.  NAKAZIBWE DAMALI	+256704884476	2026-02-10 16:48:47.992378+03	2026-02-10 16:48:47.992378+03	\N	\N	\N	client
d784e00b-e785-4b04-bc82-a34785d0c908	NAMAGEMBE RITAH	+256702146840	2026-02-10 16:48:48.906051+03	2026-02-10 16:48:48.906051+03	\N	\N	\N	client
8fbef6ce-3250-492d-bdd1-f72e061182fa	Mrs.  BIRABWA BETTY	+256700709469	2026-02-10 16:48:49.758195+03	2026-02-10 16:48:49.758195+03	\N	\N	\N	client
5e3404a4-b756-4d44-b56f-753468047cc0	Mrs.  WATERA JOAN	+256706997408	2026-02-10 16:48:50.63909+03	2026-02-10 16:48:50.63909+03	\N	\N	\N	client
67a687ea-fbae-4e24-88d8-8a24ae43d1bb	Mr.  NSUBUGA YAHAYA	+256755111221	2026-02-10 16:48:51.499597+03	2026-02-10 16:48:51.499597+03	\N	\N	\N	client
24c1a2a5-6a2f-4cc3-a236-6f74c1e062d6	NABUKALU FARIDAH	+256758216051	2026-02-10 16:48:52.801455+03	2026-02-10 16:48:52.801455+03	\N	\N	\N	client
1029a4ef-1606-43f5-9f96-6cc3b376df83	Mrs.  NAMATOVU PROSSY	+256706294537	2026-02-10 16:48:53.661842+03	2026-02-10 16:48:53.661842+03	\N	\N	\N	client
38a402ee-bf41-4712-9e29-fad0c93a564e	Mrs.  NAMUGERWA SULAINAH	+256753368991	2026-02-10 16:48:54.514644+03	2026-02-10 16:48:54.514644+03	\N	\N	\N	client
a00de490-37a3-4c94-b0b7-c4aaa0f8d6f4	Miss  MAKOHA ELIZABETH	+256754204406	2026-02-10 16:48:55.441803+03	2026-02-10 16:48:55.441803+03	\N	\N	\N	client
e1095323-d66f-4912-b3b1-275a89095747	Miss  TUMUSHABE EVA	+256707485757	2026-02-10 16:48:56.298284+03	2026-02-10 16:48:56.298284+03	\N	\N	\N	client
5622c419-73a7-422f-8035-0c9fc604958e	Mrs.  NAMBOWA ROSE	+256703913188	2026-02-10 16:48:58.46098+03	2026-02-10 16:48:58.46098+03	\N	\N	\N	client
dc69bdc3-f49d-4959-abdc-b41ab2a40fc8	Mr.  KIBUUKA RAJAB	+256700699864	2026-02-10 16:48:59.784664+03	2026-02-10 16:48:59.784664+03	\N	\N	\N	client
aae74515-1a09-4874-a4d1-b0d5fbf99680	Mrs.  NAKAFU DOCUS	\N	2026-02-10 16:49:00.677327+03	2026-02-10 16:49:01.567628+03	\N	\N	\N	client
9f51a27a-da0a-432f-8688-555e169d1164	Mr.  KAZIBWE ALLAN	+256755407233	2026-02-10 16:49:20.72481+03	2026-02-10 16:49:20.72481+03	\N	\N	\N	client
27f9b303-2121-442f-a819-ea603a0a7af9	Mr.  KASAANA JORAN	+256752162492	2026-02-10 16:49:22.025073+03	2026-02-10 16:49:22.025073+03	\N	\N	\N	client
aae1f352-fb5f-4324-9b80-ac959ae65ab0	Mr.  MWETISE GODFREY	+256742841972	2026-02-10 16:49:23.744309+03	2026-02-10 16:49:23.744309+03	\N	\N	\N	client
527b9b72-1c0e-430b-8851-f86880d16f0d	Mr.  BYAKATONDA WILLIAM	\N	2026-02-10 16:49:26.394896+03	2026-02-10 16:49:26.394896+03	\N	\N	\N	client
05081c52-bc29-474b-a472-54b87f315df5	Mr.  MUGUME KATUNGI HAKIM	+256705464490	2026-02-10 16:49:27.78435+03	2026-02-10 16:49:27.78435+03	\N	\N	\N	client
b89ae05f-3330-45e8-95c2-e297a600e86a	Mr.  MUKWAAYA DENNIS	+256754254112	2026-02-10 16:49:29.245438+03	2026-02-10 16:49:29.245438+03	\N	\N	\N	client
d081a228-9b53-4678-8649-6d4343dfcb4d	Mrs.  NATUKUNDA FORTUNATE	+256753473060	2026-02-10 16:49:33.519416+03	2026-02-10 16:49:33.519416+03	\N	\N	\N	client
dc3bf79c-9256-47b9-b1c2-ae0cc73d1b01	Mr.  NDIDDE KHALID	+256743856542	2026-02-10 16:49:36.292898+03	2026-02-10 16:49:36.292898+03	\N	\N	\N	client
0dd9b35b-c1c1-4bcb-95c4-beef479dcdfe	Mr.  TAYEBWA FRANCIS	+256701822472	2026-02-10 16:49:41.132508+03	2026-02-10 16:49:41.132508+03	\N	\N	\N	client
0a67145e-b52c-4876-828d-41b6bea77285	Mr.  DOOMA IVAN MUKISA	+256744848944	2026-02-10 16:49:45.086215+03	2026-02-10 16:49:45.086215+03	\N	\N	\N	client
97f1821f-e715-493f-80fd-518476e706ad	Mr.  KABEGA DEO	+256754486190	2026-02-10 16:49:46.409131+03	2026-02-10 16:49:46.409131+03	\N	\N	\N	client
ad985c89-3b57-4414-bb67-c429ba6d0a14	Mr.  KASAGA MOSES	+256754315261	2026-02-10 16:49:49.06934+03	2026-02-10 16:49:49.06934+03	\N	\N	\N	client
6b72a43c-7f84-4ce5-9e79-2cce4be67e8f	Mr.  SONKO SULAIMAN	+256706531588	2026-02-10 16:49:51.673327+03	2026-02-10 16:49:51.673327+03	\N	\N	\N	client
e499b5b7-c4ad-4e35-9a60-92ebfa3cf33f	Mr.  WASSWA DERRICK	+256707580024	2026-02-10 16:50:05.728226+03	2026-02-10 16:50:05.728226+03	\N	\N	\N	client
4835ca46-2cef-4d34-a686-160af1ba3c8e	Mrs.  NTONGO JOYCE	+256709908326	2026-02-10 16:50:15.222561+03	2026-02-10 16:50:15.222561+03	\N	\N	\N	client
192f54cf-2a8b-4ae2-bbca-aa662285445b	Mr.  Happy James	+256742996948	2026-02-10 16:50:37.435978+03	2026-02-10 16:50:37.435978+03	\N	\N	\N	client
5f149cac-16b0-47f0-8a7e-e777c3d48d4b	Twikirizze Allen	+256709752960	2026-02-10 16:50:38.753695+03	2026-02-10 16:50:38.753695+03	\N	\N	\N	client
3e2549bb-bb3a-4877-ad65-51322aa44640	Mrs.  NAKABUGO PROSSY	+256743510730	2026-02-10 16:50:46.394848+03	2026-02-10 16:50:46.394848+03	\N	\N	\N	client
def039f2-8c59-419a-bd56-d304bfb7f9cc	Mrs.  NABABI MARGRET	+256754839041	2026-02-10 16:50:47.728297+03	2026-02-10 16:50:47.728297+03	\N	\N	\N	client
fc513d83-9750-4fca-82c2-d74800b2a8fc	Mrs.  KINAWA ZAITUNI	+256756846444	2026-02-10 16:50:49.040176+03	2026-02-10 16:50:49.040176+03	\N	\N	\N	client
b0f0f535-abbf-44ed-af6d-a6ec16adc39f	Mr.  NYAKANA HAMISI	+256701131435	2026-02-10 16:50:56.034425+03	2026-02-10 16:50:56.034425+03	\N	\N	\N	client
27798bc7-cb83-4bba-a8ca-0f2f28d71893	Mr.  BIRE SHARIF	+256742294734	2026-02-10 16:50:57.340567+03	2026-02-10 16:50:57.340567+03	\N	\N	\N	client
16120aaf-5f26-4f85-a14e-c8d8433120a0	Miss  Nalugo Christine	+256757884615	2026-02-10 16:51:00.139175+03	2026-02-10 16:51:00.139175+03	\N	\N	\N	client
2b3697d3-23ce-4d33-bff1-b1af226bba5e	Mrs.  Lusiba Sarah	+2567044558973	2026-02-10 16:51:02.398982+03	2026-02-10 16:51:02.398982+03	\N	\N	\N	client
4a5d4fad-1cb9-4122-97eb-f7e19410f79e	Kyohairwe Joyce	+256758508405	2026-02-10 16:51:03.913646+03	2026-02-10 16:51:03.913646+03	\N	\N	\N	client
e2ef61b6-316f-4f34-87cc-0fb63095d635	Mrs.  Nakibinge Justine	+256771980135	2026-02-10 16:51:07.267971+03	2026-02-10 16:51:07.267971+03	\N	\N	\N	client
ccfac2d3-c9a4-4159-84aa-13ffc2494f52	Ms.  Nkalubo Aisha	+256753778149	2026-02-10 16:46:38.967816+03	2026-02-10 16:51:11.350514+03	\N	\N	\N	client
9213a73a-2c6f-444b-920d-aec163ad7523	Mrs.  Kagaba Brenda Mbabazi	+256772907395	2026-02-10 16:51:12.722189+03	2026-02-10 16:51:12.722189+03	\N	\N	\N	client
29c2f6cf-c309-4f58-809d-64ed0fa64498	Mrs.  Nakirijja Jalia	+256788259592	2026-02-10 16:51:14.028059+03	2026-02-10 16:51:14.028059+03	\N	\N	\N	client
0cf5d7e4-9475-4d21-8e0d-e57ce71c7982	Miss  Nabwato Hadijah	+256759031603	2026-02-10 16:51:15.752114+03	2026-02-10 16:51:15.752114+03	\N	\N	\N	client
1ee0c2b8-b641-4aa6-ac2f-1ee634e863f3	Ntamu Sharif	+256758313768	2026-02-10 16:51:17.126747+03	2026-02-10 16:51:17.126747+03	\N	\N	\N	client
4437c898-9b7e-49c8-8b34-4c862bc68a3b	Namale Noeline	+256740076491	2026-02-10 16:51:18.430529+03	2026-02-10 16:51:18.430529+03	\N	\N	\N	client
3a7fdba4-7ee7-4587-9e1b-604b2fe563b8	Nambasi Kenneth	+256755944901	2026-02-10 16:51:19.763724+03	2026-02-10 16:51:19.763724+03	\N	\N	\N	client
a14561ef-479d-4998-96a0-8dfb85bda786	Ms.  Namayanja Phionah	+256702221595	2026-02-10 16:51:21.533706+03	2026-02-10 16:51:21.533706+03	\N	\N	\N	client
b2d870b6-1e1b-43d6-a71c-61664bea1094	Miss  Nasolo Harriet	+256709796376	2026-02-10 16:51:22.894726+03	2026-02-10 16:51:22.894726+03	\N	\N	\N	client
87681d90-5e70-415d-b242-a5efc8000cb2	Miss  Nantume Ritah	+256786674851	2026-02-10 16:51:24.214194+03	2026-02-10 16:51:24.214194+03	\N	\N	\N	client
5521a9a0-3fd5-4d41-b299-16db5c4ec1cc	Mirembe Pamela	+256754981341	2026-02-10 16:51:25.712198+03	2026-02-10 16:51:25.712198+03	\N	\N	\N	client
a2146ef5-2cae-4c93-9117-f31abc6b6fd3	Miss  Lukyamuzi Benard	+256777177166	2026-02-10 16:51:28.694335+03	2026-02-10 16:51:28.694335+03	\N	\N	\N	client
5dcb8cc6-092b-411e-9c7a-33fc3430da19	Mukasa Sarah	+256755376120	2026-02-10 16:36:21.486549+03	2026-02-10 16:42:35.597504+03	\N	\N	\N	client
\.


--
-- Data for Name: repayments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.repayments (id, loan_application_id, amount, payment_date, recorded_by, notes, created_at, updated_at, status, payment_method, member_breakdown) FROM stdin;
e7bda644-65a6-45fe-bf41-a62c4ca03af2	1e442b7e-021e-4194-84f2-84679963daf8	490000.00	2026-02-15	\N	Imported from Excel Row 3	2026-02-15 12:32:27.205239+03	2026-02-15 12:32:27.205239+03	paid	cash	[]
8ed3eac9-8211-47fd-9113-ee0acbbb0329	1b6a91b1-8c5a-4973-8d28-ccf7a9612218	320000.00	2026-02-15	\N	Imported from Excel Row 4	2026-02-15 12:32:27.22089+03	2026-02-15 12:32:27.22089+03	paid	cash	[]
4d1467a6-4c42-4c2d-ac5f-ef2b513a77b0	30cc452f-d403-42f5-8b9a-b7515b73dc26	287000.00	2026-02-15	\N	Imported from Excel Row 5	2026-02-15 12:32:27.222515+03	2026-02-15 12:32:27.222515+03	paid	cash	[]
ab74f031-2be4-485f-b2a9-5c1eda743d45	a16a2dab-23f0-421d-97ac-f92530324660	287000.00	2026-02-15	\N	Imported from Excel Row 6	2026-02-15 12:32:27.223834+03	2026-02-15 12:32:27.223834+03	paid	cash	[]
6fa25fce-2baa-4198-84da-984e6dfc5236	127c783e-22a2-4213-ad46-0422cae0f12d	287000.00	2026-02-15	\N	Imported from Excel Row 7	2026-02-15 12:32:27.225527+03	2026-02-15 12:32:27.225527+03	paid	cash	[]
235bf711-eb4c-44be-a92e-738f6e34c4d4	a093d13e-94b6-4a85-be28-1a8cff2af3fb	287000.00	2026-02-15	\N	Imported from Excel Row 8	2026-02-15 12:32:27.226917+03	2026-02-15 12:32:27.226917+03	paid	cash	[]
e1dc48e1-6986-4d6d-a0c6-3f346162833a	883bec25-e38b-4e51-9101-266078dc8edf	287000.00	2026-02-15	\N	Imported from Excel Row 9	2026-02-15 12:32:27.228573+03	2026-02-15 12:32:27.228573+03	paid	cash	[]
9ad3a2f0-3bb1-4e85-addb-4ea3f58b583b	66d421f4-014a-4397-a548-293d90a3a5eb	82000.00	2026-02-15	\N	Imported from Excel Row 10	2026-02-15 12:32:27.230193+03	2026-02-15 12:32:27.230193+03	paid	cash	[]
55c47afc-11bf-453d-b39f-d410745f54c7	d5be59cd-3439-4db5-a858-0b34dc4df71c	82000.00	2026-02-15	\N	Imported from Excel Row 11	2026-02-15 12:32:27.23145+03	2026-02-15 12:32:27.23145+03	paid	cash	[]
709b344b-9a8e-4db3-ad4c-8df438e6798e	df120a4c-dabe-4d9f-bb45-55c7098657e2	82000.00	2026-02-15	\N	Imported from Excel Row 12	2026-02-15 12:32:27.232373+03	2026-02-15 12:32:27.232373+03	paid	cash	[]
cee8a758-fb06-47bb-ade9-027756e02e50	5a445baf-f4c2-48ec-b6b0-e707da525ab1	520000.00	2026-02-15	\N	Imported from Excel Row 13	2026-02-15 12:32:27.233158+03	2026-02-15 12:32:27.233158+03	paid	cash	[]
adab5fdb-1310-4b15-b41e-35c5d12fba57	e4360789-ef95-4672-9a78-e1590d3ab7eb	82000.00	2026-02-15	\N	Imported from Excel Row 14	2026-02-15 12:32:27.233874+03	2026-02-15 12:32:27.233874+03	paid	cash	[]
0417ace9-d04c-45c7-a99d-a1a8bcbaa866	da2ccc8a-0a99-4e22-9fcb-590395be6fc4	82000.00	2026-02-15	\N	Imported from Excel Row 15	2026-02-15 12:32:27.234811+03	2026-02-15 12:32:27.234811+03	paid	cash	[]
bf9a80f8-ae43-4491-ada8-421c901348a0	1185be98-385f-439e-b9b6-45769ea10da4	82000.00	2026-02-15	\N	Imported from Excel Row 16	2026-02-15 12:32:27.235698+03	2026-02-15 12:32:27.235698+03	paid	cash	[]
b1aefea5-0323-4d32-9083-0978a4564089	37f8497c-5532-4856-983f-76d417d339c6	40000.00	2026-02-15	\N	Imported from Excel Row 17	2026-02-15 12:32:27.236529+03	2026-02-15 12:32:27.236529+03	paid	cash	[]
4ebbb74c-83b9-49d5-bf59-ed4a5234d4bb	e8cad5dc-8421-48e7-80b7-3d0fa3f7708c	82000.00	2026-02-15	\N	Imported from Excel Row 18	2026-02-15 12:32:27.237306+03	2026-02-15 12:32:27.237306+03	paid	cash	[]
0a578dd9-9460-420b-be6b-9ab48e25deae	7353dd0f-b376-4a65-ab53-a4e7465927a6	82000.00	2026-02-15	\N	Imported from Excel Row 19	2026-02-15 12:32:27.238056+03	2026-02-15 12:32:27.238056+03	paid	cash	[]
e58e55aa-a93c-4294-afa0-a0a4366688d6	c112650f-6697-4563-9279-ac544e63cdfa	82000.00	2026-02-15	\N	Imported from Excel Row 20	2026-02-15 12:32:27.238754+03	2026-02-15 12:32:27.238754+03	paid	cash	[]
648710fa-edc6-4088-8ece-fa135b4b5d31	e349ea5b-3b42-40fb-b5f3-add7ac7e43ea	355800.00	2026-02-15	\N	Imported from Excel Row 21	2026-02-15 12:32:27.239432+03	2026-02-15 12:32:27.239432+03	paid	cash	[]
0a2752ad-0f45-4c13-b9d1-2aa9b54b3266	36b17319-079b-4b89-a61c-eb938120f803	222000.00	2026-02-15	\N	Imported from Excel Row 22	2026-02-15 12:32:27.240053+03	2026-02-15 12:32:27.240053+03	paid	cash	[]
1ba37b94-a82f-4ad9-9895-735b32af6d62	469dab49-b143-43a6-850f-90bc367ae68f	235000.00	2026-02-15	\N	Imported from Excel Row 23	2026-02-15 12:32:27.240746+03	2026-02-15 12:32:27.240746+03	paid	cash	[]
1d39a0c1-7a68-4fef-83b8-7006b1f66acf	dadad6f5-08c1-4273-9658-08e869d10c1a	317000.00	2026-02-15	\N	Imported from Excel Row 24	2026-02-15 12:32:27.241683+03	2026-02-15 12:32:27.241683+03	paid	cash	[]
f6a8f604-b1e7-4675-ba59-b7986b55b400	4ae9bfa4-89fd-4b0b-8d08-e5ea3b363c07	139500.00	2026-02-15	\N	Imported from Excel Row 25	2026-02-15 12:32:27.242485+03	2026-02-15 12:32:27.242485+03	paid	cash	[]
ab2418ac-35c2-4fa4-9cfe-3c5d83030982	4e9a32e7-c9c3-4633-b5c3-828bf4193f59	650000.00	2026-02-15	\N	Imported from Excel Row 26	2026-02-15 12:32:27.243222+03	2026-02-15 12:32:27.243222+03	paid	cash	[]
05126d53-2547-4d94-9789-72948afdc80e	20b00229-b755-4c89-a4db-c32850b60945	432000.00	2026-02-15	\N	Imported from Excel Row 27	2026-02-15 12:32:27.243884+03	2026-02-15 12:32:27.243884+03	paid	cash	[]
27d8d007-06a8-42b8-aa3a-e7208b07f469	853da5b1-460d-4196-8288-904d52ad1cf6	682000.00	2026-02-15	\N	Imported from Excel Row 28	2026-02-15 12:32:27.244718+03	2026-02-15 12:32:27.244718+03	paid	cash	[]
15b68876-bdef-4fee-8ba1-3ea644149584	a802f932-e48d-437a-a692-b0c8df5a0f18	560000.00	2026-02-15	\N	Imported from Excel Row 29	2026-02-15 12:32:27.245799+03	2026-02-15 12:32:27.245799+03	paid	cash	[]
90473694-012f-4208-b019-f2bcd369134b	cd888548-43f5-4d05-af86-6f74a94c5bd6	459000.00	2026-02-15	\N	Imported from Excel Row 30	2026-02-15 12:32:27.247019+03	2026-02-15 12:32:27.247019+03	paid	cash	[]
9edf3a4a-9140-4bcd-9d22-b8f3b0f12dda	fd59e604-df8f-4796-825b-3cd75521b841	433000.00	2026-02-15	\N	Imported from Excel Row 31	2026-02-15 12:32:27.24782+03	2026-02-15 12:32:27.24782+03	paid	cash	[]
adb1164c-1e7d-4b38-a77d-0575c73faeb5	69c77a83-3c4f-4f0a-908d-5c3fc0b8e5d5	780000.00	2026-02-15	\N	Imported from Excel Row 32	2026-02-15 12:32:27.248518+03	2026-02-15 12:32:27.248518+03	paid	cash	[]
98362cba-e264-4dd3-9461-05741b7d63b8	67a28b5b-9590-41fc-ba26-af73d30994ce	114000.00	2026-02-15	\N	Imported from Excel Row 33	2026-02-15 12:32:27.249142+03	2026-02-15 12:32:27.249142+03	paid	cash	[]
8bf6d974-c1dc-4966-99c6-e9f69f44fcf4	c51b098b-1398-497d-b2eb-d7ad8a56fc8a	226000.00	2026-02-15	\N	Imported from Excel Row 34	2026-02-15 12:32:27.249754+03	2026-02-15 12:32:27.249754+03	paid	cash	[]
774ab323-b971-4a41-97ed-f32b3c58fd09	9c7aae23-d057-4cf7-a07c-97c62f564f74	1131000.00	2026-02-15	\N	Imported from Excel Row 35	2026-02-15 12:32:27.250464+03	2026-02-15 12:32:27.250464+03	paid	cash	[]
3e01a945-8384-4f48-9bdc-4123cbbcfb4a	353c5094-73d1-4a37-8942-6a960de01227	910000.00	2026-02-15	\N	Imported from Excel Row 36	2026-02-15 12:32:27.25111+03	2026-02-15 12:32:27.25111+03	paid	cash	[]
7b7b046a-db18-4237-b6d0-375450ff6709	1d3bc0a4-583a-4e4d-9ba6-df07625ec7da	650000.00	2026-02-15	\N	Imported from Excel Row 38	2026-02-15 12:32:27.251899+03	2026-02-15 12:32:27.251899+03	paid	cash	[]
5c73c18f-46af-42fb-9e39-94e2849078c6	96f44eda-7c3b-4404-bb62-15b7d4c499c0	174000.00	2026-02-15	\N	Imported from Excel Row 40	2026-02-15 12:32:27.252675+03	2026-02-15 12:32:27.252675+03	paid	cash	[]
b08be663-d746-4aff-b9f5-db0386af8cec	6ce92ace-d1dc-45cc-aa53-dfc1f1cb5233	650000.00	2026-02-15	\N	Imported from Excel Row 41	2026-02-15 12:32:27.253502+03	2026-02-15 12:32:27.253502+03	paid	cash	[]
1b5bfd16-c48e-4a6c-bdaa-ddf53f649054	babd9af7-d9e2-404b-8a97-d43807910844	90000.00	2026-02-15	\N	Imported from Excel Row 42	2026-02-15 12:32:27.254216+03	2026-02-15 12:32:27.254216+03	paid	cash	[]
e230be87-0d52-4f72-8572-4e0f41f7e01a	21827caa-2fbd-493c-b119-e295777c2cc8	650000.00	2026-02-15	\N	Imported from Excel Row 43	2026-02-15 12:32:27.254924+03	2026-02-15 12:32:27.254924+03	paid	cash	[]
a9589ead-7ab9-4cf2-81e5-b3bc7d7f15cb	8d95e725-0f10-4f85-89f1-9fc5f31ddd30	2141000.00	2026-02-15	\N	Imported from Excel Row 46	2026-02-15 12:32:27.255704+03	2026-02-15 12:32:27.255704+03	paid	cash	[]
df6bf3bf-12c2-4e58-80b7-2760db2e82df	5d4ab168-ca0e-4cc8-af42-acdc55b822fe	1300000.00	2026-02-15	\N	Imported from Excel Row 47	2026-02-15 12:32:27.256516+03	2026-02-15 12:32:27.256516+03	paid	cash	[]
b5d39963-cb9f-494a-b511-c3c2f2984c4a	c0844a54-8b9e-4428-b96b-cb95b2d526cb	532000.00	2026-02-15	\N	Imported from Excel Row 48	2026-02-15 12:32:27.257414+03	2026-02-15 12:32:27.257414+03	paid	cash	[]
b25648eb-0596-4703-abca-d9df1a91d0c7	9fbf01ab-4047-4932-acf4-ea3a6fa27818	554000.00	2026-02-15	\N	Imported from Excel Row 49	2026-02-15 12:32:27.25818+03	2026-02-15 12:32:27.25818+03	paid	cash	[]
a1f9eaec-362f-461f-a331-f5920ff67ca4	f756252d-af07-4155-a2fb-35e17f249a30	477000.00	2026-02-15	\N	Imported from Excel Row 50	2026-02-15 12:32:27.258879+03	2026-02-15 12:32:27.258879+03	paid	cash	[]
56854fc1-1a29-4a25-92e5-646ea95fb016	5915241b-8012-462c-9b43-c8779bac92d3	447000.00	2026-02-15	\N	Imported from Excel Row 51	2026-02-15 12:32:27.259595+03	2026-02-15 12:32:27.259595+03	paid	cash	[]
2ac2c1c7-8984-45a4-905d-31b13d9877d7	9a1de240-520c-41d4-b549-09e195b26e4d	374000.00	2026-02-15	\N	Imported from Excel Row 52	2026-02-15 12:32:27.26034+03	2026-02-15 12:32:27.26034+03	paid	cash	[]
cccd5476-d54f-44de-b30c-1f4b19908b63	092e24f1-a860-4132-9e15-ad736cb2ab7a	495000.00	2026-02-15	\N	Imported from Excel Row 53	2026-02-15 12:32:27.261439+03	2026-02-15 12:32:27.261439+03	paid	cash	[]
adc8c1fa-a18e-459a-a8c7-a5ab3e0fa672	56915a3d-5271-48b7-9003-959befc539d1	480000.00	2026-02-15	\N	Imported from Excel Row 54	2026-02-15 12:32:27.262595+03	2026-02-15 12:32:27.262595+03	paid	cash	[]
9da078d9-ca41-4064-bd50-15a2d394b75a	ff025125-f1b8-4f70-94f3-c55a2e3c9afb	299000.00	2026-02-15	\N	Imported from Excel Row 55	2026-02-15 12:32:27.263661+03	2026-02-15 12:32:27.263661+03	paid	cash	[]
af7a0371-0386-4883-a5b4-b5f1a19bc97c	c105bb38-adef-4cfc-b373-c32b3cb92238	650000.00	2026-02-15	\N	Imported from Excel Row 56	2026-02-15 12:32:27.264474+03	2026-02-15 12:32:27.264474+03	paid	cash	[]
ea589afc-6683-4290-b652-10eb406d7c91	65271358-22b4-44d1-9b07-7a87a82bfc83	100000.00	2026-02-15	\N	Imported from Excel Row 57	2026-02-15 12:32:27.265299+03	2026-02-15 12:32:27.265299+03	paid	cash	[]
b263bc14-d7ef-46d0-8b2a-5cc0a94191b6	4456a8ae-cf1b-4938-a86d-5407c3980e37	910000.00	2026-02-15	\N	Imported from Excel Row 58	2026-02-15 12:32:27.266056+03	2026-02-15 12:32:27.266056+03	paid	cash	[]
38be35e1-6205-4408-a6bf-8bfda7263ac1	e4ce1912-6569-48f0-a659-699249edb1f9	123000.00	2026-02-15	\N	Imported from Excel Row 59	2026-02-15 12:32:27.267023+03	2026-02-15 12:32:27.267023+03	paid	cash	[]
b73b1b99-1062-431a-bcb7-1fbe16cdc74b	93f6f513-8aa7-4300-a234-b3236dd633c1	100000.00	2026-02-15	\N	Imported from Excel Row 60	2026-02-15 12:32:27.267952+03	2026-02-15 12:32:27.267952+03	paid	cash	[]
949480c3-f73e-4330-a584-bd48568be5b2	e27b785e-e9ff-427e-b11b-16be1645e1f5	910000.00	2026-02-15	\N	Imported from Excel Row 61	2026-02-15 12:32:27.268859+03	2026-02-15 12:32:27.268859+03	paid	cash	[]
dc11496a-ba3d-4dd4-b091-207c4e5848d9	58478ed5-6873-4eef-99fc-314bf961797c	100000.00	2026-02-15	\N	Imported from Excel Row 62	2026-02-15 12:32:27.269801+03	2026-02-15 12:32:27.269801+03	paid	cash	[]
91ac06be-d50c-412a-b269-ebd23f66c52b	e81e104d-2574-48af-b561-b03c1d0d45c5	100000.00	2026-02-15	\N	Imported from Excel Row 63	2026-02-15 12:32:27.27058+03	2026-02-15 12:32:27.27058+03	paid	cash	[]
5bbd97a1-71a3-4298-ba52-5e7f29f685cc	a7ca61c3-6b8b-4717-bfa2-73ad20d46bd0	910000.00	2026-02-15	\N	Imported from Excel Row 64	2026-02-15 12:32:27.271362+03	2026-02-15 12:32:27.271362+03	paid	cash	[]
d321384c-f4d2-4396-b03c-461b508320b2	2cb3297a-df9c-4c30-94de-60d860133d41	160000.00	2026-02-15	\N	Imported from Excel Row 65	2026-02-15 12:32:27.27246+03	2026-02-15 12:32:27.27246+03	paid	cash	[]
050aa350-7586-4597-bf57-551a5e57382c	b31943e5-0caf-4ad8-9c84-4c057499b16b	160000.00	2026-02-15	\N	Imported from Excel Row 66	2026-02-15 12:32:27.275733+03	2026-02-15 12:32:27.275733+03	paid	cash	[]
377f4318-0808-4690-b078-bf6f8ce764a1	2f8dcc32-d20c-49b8-995f-065c468d0d2e	160000.00	2026-02-15	\N	Imported from Excel Row 67	2026-02-15 12:32:27.276526+03	2026-02-15 12:32:27.276526+03	paid	cash	[]
cefc069c-7cf8-4e1b-a6b2-d97dd1e42bc3	3d7e9b5e-572c-40b2-9081-11e0dd60b92b	100000.00	2026-02-15	\N	Imported from Excel Row 68	2026-02-15 12:32:27.277439+03	2026-02-15 12:32:27.277439+03	paid	cash	[]
28f2dd5c-d062-4e11-aced-97c04a19764f	1a79cbc1-4d8d-4d17-8d43-5f45a8ceca1a	160000.00	2026-02-15	\N	Imported from Excel Row 69	2026-02-15 12:32:27.278968+03	2026-02-15 12:32:27.278968+03	paid	cash	[]
71c0ef57-c465-4b08-bd21-140b2c24be12	d737ee95-3025-44e1-b59c-fbfbee334725	105000.00	2026-02-15	\N	Imported from Excel Row 70	2026-02-15 12:32:27.280185+03	2026-02-15 12:32:27.280185+03	paid	cash	[]
bcfe7c6f-9c73-4951-ae81-2bf3cfb1cb33	cabc44e0-e1d3-4243-81ed-826119fa474f	105000.00	2026-02-15	\N	Imported from Excel Row 71	2026-02-15 12:32:27.281443+03	2026-02-15 12:32:27.281443+03	paid	cash	[]
b61e959c-deea-4d55-bd0a-3d982eea1e29	2cc1b952-fc6f-4054-9d8a-c253dddc1dfe	71000.00	2026-02-15	\N	Imported from Excel Row 73	2026-02-15 12:32:27.28365+03	2026-02-15 12:32:27.28365+03	paid	cash	[]
1fd432aa-9507-4052-ba19-4476f2761a0f	cc9746ad-c473-4f98-898c-97a751f0ee24	132000.00	2026-02-15	\N	Imported from Excel Row 74	2026-02-15 12:32:27.285869+03	2026-02-15 12:32:27.285869+03	paid	cash	[]
b834d49f-20b8-41b4-bc16-43acc44294fd	ef7c9085-2555-4b5e-af68-e897735735b0	132000.00	2026-02-15	\N	Imported from Excel Row 75	2026-02-15 12:32:27.287959+03	2026-02-15 12:32:27.287959+03	paid	cash	[]
1728516d-1fd2-4231-ba1f-4e77b1f4345a	e51ac0be-fc71-4611-a1d3-549a36a3c9a3	164000.00	2026-02-15	\N	Imported from Excel Row 76	2026-02-15 12:32:27.290046+03	2026-02-15 12:32:27.290046+03	paid	cash	[]
5a25dc65-e6ce-4b6d-88f6-35410893840a	28f4f710-e0cc-4c69-a572-21dd7f90b3a8	132000.00	2026-02-15	\N	Imported from Excel Row 77	2026-02-15 12:32:27.2921+03	2026-02-15 12:32:27.2921+03	paid	cash	[]
12187c34-5d94-4f63-b235-d7647414e157	f78f8ad5-f02d-4d28-b004-6dd6c8e1ce08	132000.00	2026-02-15	\N	Imported from Excel Row 78	2026-02-15 12:32:27.294837+03	2026-02-15 12:32:27.294837+03	paid	cash	[]
023f7349-99cc-4e46-a836-55a1a30f01a8	7adfe546-5476-453b-b351-0426a2566ffa	100000.00	2026-02-15	\N	Imported from Excel Row 79	2026-02-15 12:32:27.299108+03	2026-02-15 12:32:27.299108+03	paid	cash	[]
2a1fb077-cf3e-4cbe-b8a8-82a469a2ce76	62332b8f-aa8f-4f92-9890-40b2bbd6b065	139000.00	2026-02-15	\N	Imported from Excel Row 80	2026-02-15 12:32:27.302954+03	2026-02-15 12:32:27.302954+03	paid	cash	[]
c467b240-448d-4333-ad8c-b6e12cdae603	cbab3056-2855-4234-80f8-9a207df65d1f	175000.00	2026-02-15	\N	Imported from Excel Row 81	2026-02-15 12:32:27.303917+03	2026-02-15 12:32:27.303917+03	paid	cash	[]
dc60d92b-9ee9-429c-8790-335cbdc39d3a	10e5e824-a057-4eba-89d6-91bc67f0a7da	245000.00	2026-02-15	\N	Imported from Excel Row 82	2026-02-15 12:32:27.3049+03	2026-02-15 12:32:27.3049+03	paid	cash	[]
736931a1-0b2c-4ad2-8fa7-648ef3ceaffb	7cff1b3f-8022-4de9-88e0-ad080f76cd53	198000.00	2026-02-15	\N	Imported from Excel Row 83	2026-02-15 12:32:27.305785+03	2026-02-15 12:32:27.305785+03	paid	cash	[]
321778ab-6fcf-445b-aea8-b02d8a1626c2	e7ae43b5-d880-42c7-9130-2379db9f641e	198000.00	2026-02-15	\N	Imported from Excel Row 84	2026-02-15 12:32:27.306605+03	2026-02-15 12:32:27.306605+03	paid	cash	[]
0af6919c-4790-46a5-a892-602f8079ff71	69f02e96-94d2-4bf3-8883-8070f556e8e7	198000.00	2026-02-15	\N	Imported from Excel Row 85	2026-02-15 12:32:27.307411+03	2026-02-15 12:32:27.307411+03	paid	cash	[]
4d8fe4ce-c124-4a8e-96e4-b2c5a223662d	ca303d05-fde6-4dc9-91d1-d3199c845d8a	198000.00	2026-02-15	\N	Imported from Excel Row 86	2026-02-15 12:32:27.308258+03	2026-02-15 12:32:27.308258+03	paid	cash	[]
556d4cab-ef75-4683-9ed4-f4da0b4723c8	f4ac623a-a95f-44aa-aa55-44b1b60d8076	200000.00	2026-02-15	\N	Imported from Excel Row 87	2026-02-15 12:32:27.309057+03	2026-02-15 12:32:27.309057+03	paid	cash	[]
5654856d-632c-4d7a-af09-b9cc10c40262	f71b0d76-ea71-45c4-a6e7-8f59d58be7c6	145000.00	2026-02-15	\N	Imported from Excel Row 88	2026-02-15 12:32:27.30985+03	2026-02-15 12:32:27.30985+03	paid	cash	[]
d51e1bdc-1f82-4c97-899d-c05c40eafcba	e3f8fb3a-dd42-4e2c-8299-f4c7fe7838a9	205000.00	2026-02-15	\N	Imported from Excel Row 89	2026-02-15 12:32:27.311814+03	2026-02-15 12:32:27.311814+03	paid	cash	[]
bc827325-ca84-48a9-a95c-b318422aad5f	694bf796-18e7-40cb-bc70-1e618028caca	246000.00	2026-02-15	\N	Imported from Excel Row 90	2026-02-15 12:32:27.313038+03	2026-02-15 12:32:27.313038+03	paid	cash	[]
d45069c3-c97f-4b5f-adf3-dc2c6d592780	21e07338-dd43-47a9-b3c0-110c74f29ec5	246000.00	2026-02-15	\N	Imported from Excel Row 91	2026-02-15 12:32:27.31412+03	2026-02-15 12:32:27.31412+03	paid	cash	[]
8ce8ed02-a63e-4adb-8e45-ac611ae16459	69f822e0-66b3-416b-b3f0-f3a2847ae671	246000.00	2026-02-15	\N	Imported from Excel Row 92	2026-02-15 12:32:27.31513+03	2026-02-15 12:32:27.31513+03	paid	cash	[]
1898e72a-83f5-4f62-924a-23e965c2f1ce	2a3646c6-ca9d-47c8-812a-b18de85ad02b	569000.00	2026-02-15	\N	Imported from Excel Row 93	2026-02-15 12:32:27.316074+03	2026-02-15 12:32:27.316074+03	paid	cash	[]
cbdb0e62-84f5-42d3-9a55-ce212c22e70a	7cb809e1-8963-40c1-bab4-edc6628b3972	650000.00	2026-02-15	\N	Imported from Excel Row 94	2026-02-15 12:32:27.316877+03	2026-02-15 12:32:27.316877+03	paid	cash	[]
e999a0b7-596c-46b3-8d1b-36e57a86f373	6da83992-dde1-42f0-8166-5fca5311f3ab	650000.00	2026-02-15	\N	Imported from Excel Row 95	2026-02-15 12:32:27.317661+03	2026-02-15 12:32:27.317661+03	paid	cash	[]
be165f64-5613-41c6-91be-748a55901ea2	f7c5e47b-258f-4217-add9-057b703c1561	650000.00	2026-02-15	\N	Imported from Excel Row 96	2026-02-15 12:32:27.31846+03	2026-02-15 12:32:27.31846+03	paid	cash	[]
6b28d6f7-c5cb-4042-8359-8eb397d2d6d5	f4fe3ad0-1e8c-47c2-975a-a525196d865c	26000.00	2026-02-15	\N	Imported from Excel Row 97	2026-02-15 12:32:27.319374+03	2026-02-15 12:32:27.319374+03	paid	cash	[]
75fff64c-866f-43fc-9464-52c8926b737b	81acc4a4-e7de-4ae5-89a3-0604e5d70ba8	569000.00	2026-02-15	\N	Imported from Excel Row 98	2026-02-15 12:32:27.320172+03	2026-02-15 12:32:27.320172+03	paid	cash	[]
1cc92742-003b-4be8-b10f-726a4b3ea6cc	ae799545-024a-4f6f-8e69-b72927a3538c	123000.00	2026-02-15	\N	Imported from Excel Row 99	2026-02-15 12:32:27.321012+03	2026-02-15 12:32:27.321012+03	paid	cash	[]
58ba1b57-1021-44d9-9917-76425377eb4c	eae7b535-86e0-4e81-8d47-140bfffd7f23	205000.00	2026-02-15	\N	Imported from Excel Row 100	2026-02-15 12:32:27.321844+03	2026-02-15 12:32:27.321844+03	paid	cash	[]
2e3ab7fb-dcec-40c7-a6d0-514ab00f7e2f	abfc4a2f-96cc-4eaa-8bd0-a54c1c9f1318	205000.00	2026-02-15	\N	Imported from Excel Row 101	2026-02-15 12:32:27.322631+03	2026-02-15 12:32:27.322631+03	paid	cash	[]
6c0e301c-616f-418d-bcae-4879e232cd25	3ff8e732-8680-4586-bc3f-0964ec8475f3	205000.00	2026-02-15	\N	Imported from Excel Row 102	2026-02-15 12:32:27.323404+03	2026-02-15 12:32:27.323404+03	paid	cash	[]
254cebd2-0ef6-48d8-b8bf-88dfd423673a	209ce367-c754-472c-8c2a-ab66c3805f6b	350000.00	2026-02-15	\N	Imported from Excel Row 103	2026-02-15 12:32:27.32504+03	2026-02-15 12:32:27.32504+03	paid	cash	[]
37f6d6f3-bfa4-4e6f-96a9-6e0fd9a45a80	4e54cf2e-8213-4a6f-81b3-1fb3cc0ead62	350000.00	2026-02-15	\N	Imported from Excel Row 104	2026-02-15 12:32:27.325901+03	2026-02-15 12:32:27.325901+03	paid	cash	[]
4450e49a-9c95-4c7b-9f64-f7fd70ab0f95	b485baae-0b29-4257-ae8b-19dc08943a56	192000.00	2026-02-15	\N	Imported from Excel Row 105	2026-02-15 12:32:27.326716+03	2026-02-15 12:32:27.326716+03	paid	cash	[]
a5708029-ba14-4445-95fd-3a8ad83f1509	92f4f17a-6fea-41cc-8486-55035a8fabcc	246000.00	2026-02-15	\N	Imported from Excel Row 106	2026-02-15 12:32:27.327736+03	2026-02-15 12:32:27.327736+03	paid	cash	[]
8165734a-efa3-4580-8748-6c414e12ef3a	886a4a29-cf9f-4585-8c6a-296557540c48	192000.00	2026-02-15	\N	Imported from Excel Row 107	2026-02-15 12:32:27.329023+03	2026-02-15 12:32:27.329023+03	paid	cash	[]
8eb44973-a688-46bb-ba76-71c91bb1ae65	07a46109-f2a4-466a-8b23-b5c3d2ff245d	246000.00	2026-02-15	\N	Imported from Excel Row 108	2026-02-15 12:32:27.330288+03	2026-02-15 12:32:27.330288+03	paid	cash	[]
ed8e575a-94f2-4b3c-ad3d-1fc72aba36bf	f1fd9a46-bde2-4189-9ea6-7c2f58ed89c0	35000.00	2026-02-15	\N	Imported from Excel Row 109	2026-02-15 12:32:27.333599+03	2026-02-15 12:32:27.333599+03	paid	cash	[]
8e3d556e-ef81-44ac-83ea-3cc919e75ba3	e93c8c5f-fb65-4901-9260-73219404e512	246000.00	2026-02-15	\N	Imported from Excel Row 110	2026-02-15 12:32:27.334723+03	2026-02-15 12:32:27.334723+03	paid	cash	[]
6b8f55fc-1bbd-4923-aaa9-63fcf9c63a46	79022963-bfef-4694-bdca-2a8d3a379ec5	246000.00	2026-02-15	\N	Imported from Excel Row 111	2026-02-15 12:32:27.335664+03	2026-02-15 12:32:27.335664+03	paid	cash	[]
d4073aa1-d146-4263-9700-0462d9d8c645	7f80cd0b-cac9-40fb-81c8-5178fed1346c	246000.00	2026-02-15	\N	Imported from Excel Row 112	2026-02-15 12:32:27.336529+03	2026-02-15 12:32:27.336529+03	paid	cash	[]
6cecc053-3ce1-444e-8f8d-8270cf8e8db3	f3eed394-eeb1-4ae3-9b1c-499454a5c5fc	246000.00	2026-02-15	\N	Imported from Excel Row 113	2026-02-15 12:32:27.337397+03	2026-02-15 12:32:27.337397+03	paid	cash	[]
11a74bff-1530-48a7-90b2-edcd90b33449	d1e9cc32-ed9d-4ccb-ad5c-995a13a7bc46	250000.00	2026-02-15	\N	Imported from Excel Row 114	2026-02-15 12:32:27.338223+03	2026-02-15 12:32:27.338223+03	paid	cash	[]
c68386b2-a778-43fc-8401-c72d43f273a2	5747b366-adbf-4594-a615-e6f97401f63c	250000.00	2026-02-15	\N	Imported from Excel Row 115	2026-02-15 12:32:27.339075+03	2026-02-15 12:32:27.339075+03	paid	cash	[]
536bf974-44bf-4d7f-b3dc-305841bb2ca7	0fed7e29-00a3-4dbd-9f08-336068204af5	410000.00	2026-02-15	\N	Imported from Excel Row 116	2026-02-15 12:32:27.339913+03	2026-02-15 12:32:27.339913+03	paid	cash	[]
1a0ad71e-1cef-4139-b64b-855151a77b63	c1b57564-6109-45f6-933c-27f749a81e34	410000.00	2026-02-15	\N	Imported from Excel Row 117	2026-02-15 12:32:27.340788+03	2026-02-15 12:32:27.340788+03	paid	cash	[]
4a8912de-7385-4849-85f7-aac6a76bd712	c1c65fec-e3e8-44c3-8655-efd7abf97f59	250000.00	2026-02-15	\N	Imported from Excel Row 118	2026-02-15 12:32:27.341673+03	2026-02-15 12:32:27.341673+03	paid	cash	[]
3a546b1b-2091-4d4e-a8c9-98bd9d41ff72	9d80e6a0-e437-4921-b921-c4ef00ba18e2	280000.00	2026-02-15	\N	Imported from Excel Row 119	2026-02-15 12:32:27.342491+03	2026-02-15 12:32:27.342491+03	paid	cash	[]
b7b75ac4-a259-4699-8935-39487206bf62	2dc0cdc3-1a9a-4731-9fe6-e9dc781a0db2	290000.00	2026-02-15	\N	Imported from Excel Row 120	2026-02-15 12:32:27.343204+03	2026-02-15 12:32:27.343204+03	paid	cash	[]
ab6978ea-b11e-4ee6-aaab-db4708a5c46c	aa0afe26-6a67-4cdb-b60b-fb78d7a6642c	320000.00	2026-02-15	\N	Imported from Excel Row 121	2026-02-15 12:32:27.343921+03	2026-02-15 12:32:27.343921+03	paid	cash	[]
68ea71bc-9168-4eea-8600-0380f1a48201	2abc148c-bd04-4302-a41f-ac19745a5a4d	320000.00	2026-02-15	\N	Imported from Excel Row 122	2026-02-15 12:32:27.346048+03	2026-02-15 12:32:27.346048+03	paid	cash	[]
64444418-263e-4bc7-9c14-4b2fd8c4d21e	da55881d-f791-4cb4-afff-7d1632607f61	320000.00	2026-02-15	\N	Imported from Excel Row 123	2026-02-15 12:32:27.347326+03	2026-02-15 12:32:27.347326+03	paid	cash	[]
bfe6f516-8771-434b-b2da-e8762b6cdcfd	5d2751a1-51a7-4f48-ad52-a71b0f9383da	320000.00	2026-02-15	\N	Imported from Excel Row 124	2026-02-15 12:32:27.348511+03	2026-02-15 12:32:27.348511+03	paid	cash	[]
8b2779c8-efcf-41cc-858c-79b5c68f4f7f	abf63758-1b2f-45d7-b7ce-d85e65a61404	320000.00	2026-02-15	\N	Imported from Excel Row 125	2026-02-15 12:32:27.349638+03	2026-02-15 12:32:27.349638+03	paid	cash	[]
8b8d573d-5fe8-4950-94e3-089308a72969	bcda767f-a255-4b63-8427-307f11650f3d	250000.00	2026-02-15	\N	Imported from Excel Row 126	2026-02-15 12:32:27.350553+03	2026-02-15 12:32:27.350553+03	paid	cash	[]
eb16b66a-e184-430a-8d65-e97bbadccc34	bda6f81c-d0ca-4cba-b092-97288afebe73	485000.00	2026-02-15	\N	Imported from Excel Row 127	2026-02-15 12:32:27.351405+03	2026-02-15 12:32:27.351405+03	paid	cash	[]
805f8e8f-e5fd-49b3-ae77-43b9e82070e5	a37a9b61-5e09-422a-9f73-9e37a56d0ad9	360000.00	2026-02-15	\N	Imported from Excel Row 128	2026-02-15 12:32:27.352156+03	2026-02-15 12:32:27.352156+03	paid	cash	[]
61046341-4dab-4752-a2ed-ad597382cacd	37589655-5550-41e9-a719-b6a268487748	360000.00	2026-02-15	\N	Imported from Excel Row 129	2026-02-15 12:32:27.352776+03	2026-02-15 12:32:27.352776+03	paid	cash	[]
77c261b3-e510-439c-834c-f138fefebafa	050f77fc-d8be-48a8-9cdf-eee37d129e43	328000.00	2026-02-15	\N	Imported from Excel Row 130	2026-02-15 12:32:27.353461+03	2026-02-15 12:32:27.353461+03	paid	cash	[]
b0111598-871c-4efc-8e79-003dc1a23a8c	66981da0-4651-46fb-9676-2f5e3a4ca387	480000.00	2026-02-15	\N	Imported from Excel Row 131	2026-02-15 12:32:27.355261+03	2026-02-15 12:32:27.355261+03	paid	cash	[]
cf3c04fc-dbac-4cdc-9d90-8b6c547180a4	a3211db0-5bdb-4b57-94f1-dce0735833ad	550000.00	2026-02-15	\N	Imported from Excel Row 132	2026-02-15 12:32:27.356094+03	2026-02-15 12:32:27.356094+03	paid	cash	[]
e5816a22-4ece-4615-b397-efeed6d1b955	3d02c53e-33ac-45aa-829a-9def21db43a5	480000.00	2026-02-15	\N	Imported from Excel Row 133	2026-02-15 12:32:27.356866+03	2026-02-15 12:32:27.356866+03	paid	cash	[]
aef83114-757b-4602-ba94-5ca17796b522	ae8751a1-211e-4a7f-ac0d-567a42ff2b1a	480000.00	2026-02-15	\N	Imported from Excel Row 134	2026-02-15 12:32:27.357704+03	2026-02-15 12:32:27.357704+03	paid	cash	[]
bb3536c1-8f78-4d14-8ade-05ff040b1e90	5c3be9e7-23ee-47d1-90b5-fea0ca493d8a	70000.00	2026-02-15	\N	Imported from Excel Row 135	2026-02-15 12:32:27.358487+03	2026-02-15 12:32:27.358487+03	paid	cash	[]
8830c611-e8a0-438b-9ce2-a8ec3578d10d	9f3c764f-5b9d-45f2-93c1-8e4017d14f83	245000.00	2026-02-15	\N	Imported from Excel Row 136	2026-02-15 12:32:27.359263+03	2026-02-15 12:32:27.359263+03	paid	cash	[]
4c768fcf-469d-4036-9f98-36da01f6e14c	30a7ac70-02b4-4611-b96f-53445db8348d	160000.00	2026-02-15	\N	Imported from Excel Row 138	2026-02-15 12:32:27.360159+03	2026-02-15 12:32:27.360159+03	paid	cash	[]
03d137cc-038b-43e2-a39b-3a40c93d5582	b44c984f-69c5-4f60-9666-1bfa270a3345	410000.00	2026-02-15	\N	Imported from Excel Row 139	2026-02-15 12:32:27.361121+03	2026-02-15 12:32:27.361121+03	paid	cash	[]
32d0a282-3f9b-459b-b949-ee6fdafa30c4	227af27d-e0d2-46de-ab57-df3a22316493	121000.00	2026-02-15	\N	Imported from Excel Row 140	2026-02-15 12:32:27.362273+03	2026-02-15 12:32:27.362273+03	paid	cash	[]
2c2e52a5-919d-4bb4-a91a-ae994fb3d7a1	ece3a581-b31b-4a00-b135-5ade02ac3a21	80000.00	2026-02-15	\N	Imported from Excel Row 141	2026-02-15 12:32:27.363165+03	2026-02-15 12:32:27.363165+03	paid	cash	[]
50803aca-0a61-498d-a343-c95d612426f8	0330c929-4a5e-43af-97e3-46c0e5c99201	108000.00	2026-02-15	\N	Imported from Excel Row 142	2026-02-15 12:32:27.364149+03	2026-02-15 12:32:27.364149+03	paid	cash	[]
eeb66701-119d-4132-8f72-c570b3c1fe64	ed44d26d-4bc7-4fc8-b361-069f8c6f807a	41000.00	2026-02-15	\N	Imported from Excel Row 143	2026-02-15 12:32:27.365367+03	2026-02-15 12:32:27.365367+03	paid	cash	[]
1fd6f42b-9595-4525-b539-4ba408f64538	b8c4872d-e6b0-4277-a0a1-068091cafd9f	121000.00	2026-02-15	\N	Imported from Excel Row 144	2026-02-15 12:32:27.366467+03	2026-02-15 12:32:27.366467+03	paid	cash	[]
a7ab4e11-8190-4395-a14d-fb521a13f6a5	835850b6-ddb5-40de-8c07-166b53adb0e1	410000.00	2026-02-15	\N	Imported from Excel Row 145	2026-02-15 12:32:27.367286+03	2026-02-15 12:32:27.367286+03	paid	cash	[]
e3a2af8d-2280-4529-9f6f-d35df566764e	c158ae2c-dabc-428e-bf9c-1972fb6b6920	30000.00	2026-02-15	\N	Imported from Excel Row 146	2026-02-15 12:32:27.36804+03	2026-02-15 12:32:27.36804+03	paid	cash	[]
cbcb2010-eae3-4c53-bc6a-7fa8974e70c5	b2fa118c-434d-48d6-8063-4fc533a68467	600500.00	2026-02-15	\N	Imported from Excel Row 147	2026-02-15 12:32:27.368895+03	2026-02-15 12:32:27.368895+03	paid	cash	[]
9493ecfe-b425-4721-8d18-6bd74eb1f6db	b66d9cfb-321d-49b5-a3eb-2f859fa89968	410000.00	2026-02-15	\N	Imported from Excel Row 148	2026-02-15 12:32:27.36972+03	2026-02-15 12:32:27.36972+03	paid	cash	[]
a2f58a87-34e6-4f73-993f-ab9354b239f2	d65c8d93-fe2d-4fed-ab7b-42551b99f835	559500.00	2026-02-15	\N	Imported from Excel Row 149	2026-02-15 12:32:27.370593+03	2026-02-15 12:32:27.370593+03	paid	cash	[]
04815a2d-d1a8-41ba-a4ea-9732a03baa5f	3969a451-516e-43e8-a274-0287d65678de	491000.00	2026-02-15	\N	Imported from Excel Row 150	2026-02-15 12:32:27.371395+03	2026-02-15 12:32:27.371395+03	paid	cash	[]
f3d084d7-8066-4f85-b5ef-be0b496f33c4	3486377c-bd91-4f56-8171-1ce11cd0e336	280000.00	2026-02-15	\N	Imported from Excel Row 152	2026-02-15 12:32:27.372199+03	2026-02-15 12:32:27.372199+03	paid	cash	[]
7b9ce6c9-cb3c-4394-9731-f10f2a4f4e4a	4f5340d7-a99e-407e-ba09-7bb662ede683	310000.00	2026-02-15	\N	Imported from Excel Row 154	2026-02-15 12:32:27.37299+03	2026-02-15 12:32:27.37299+03	paid	cash	[]
6f6a610f-8251-42ce-90a4-acece534f38c	e7919669-a753-4470-81c9-41c2c594ed0f	749000.00	2026-02-15	\N	Imported from Excel Row 155	2026-02-15 12:32:27.37373+03	2026-02-15 12:32:27.37373+03	paid	cash	[]
c9b81f72-833d-4a6a-ab46-391774492435	851974d5-8433-4832-ab00-661b2ee8dffa	47000.00	2026-02-15	\N	Imported from Excel Row 156	2026-02-15 12:32:27.374473+03	2026-02-15 12:32:27.374473+03	paid	cash	[]
01ffb559-d6d3-42be-af10-82a811b3cd00	6f633387-4549-44b9-a46a-661620a010c8	650000.00	2026-02-15	\N	Imported from Excel Row 158	2026-02-15 12:32:27.375225+03	2026-02-15 12:32:27.375225+03	paid	cash	[]
58a6746a-552f-491d-bd07-5c917a01d84e	0988224a-9964-4cb1-962a-a25118ed29a9	650000.00	2026-02-15	\N	Imported from Excel Row 159	2026-02-15 12:32:27.377159+03	2026-02-15 12:32:27.377159+03	paid	cash	[]
6044cceb-d4e9-4778-9291-0de5dbf6b45d	113abcda-b469-4234-980d-d071c0b2127b	650000.00	2026-02-15	\N	Imported from Excel Row 160	2026-02-15 12:32:27.378252+03	2026-02-15 12:32:27.378252+03	paid	cash	[]
5b412468-3f17-477a-90b7-c04b5d43d0d5	88d4e800-e705-4678-8039-5502117dddc3	650000.00	2026-02-15	\N	Imported from Excel Row 161	2026-02-15 12:32:27.379605+03	2026-02-15 12:32:27.379605+03	paid	cash	[]
e329e55b-1c8b-45b8-a583-31c026b4eea0	57b3bd77-4640-43e9-9dbe-4571e5b977ba	650000.00	2026-02-15	\N	Imported from Excel Row 162	2026-02-15 12:32:27.380846+03	2026-02-15 12:32:27.380846+03	paid	cash	[]
da229369-fa6b-40f5-b7d0-b40d3b70e45f	ea2f999f-554d-43ba-8e75-4a797de43600	650000.00	2026-02-15	\N	Imported from Excel Row 163	2026-02-15 12:32:27.381862+03	2026-02-15 12:32:27.381862+03	paid	cash	[]
6512ed0f-94c3-4053-aebd-d0c42c41e73d	8457d4ce-e4ed-4c04-a4a3-3b5952f257bb	650000.00	2026-02-15	\N	Imported from Excel Row 164	2026-02-15 12:32:27.383595+03	2026-02-15 12:32:27.383595+03	paid	cash	[]
641bec18-155c-4ed9-aea1-a46967cd41b2	04df9914-3924-49e9-af67-76b04a7cb61b	444000.00	2026-02-15	\N	Imported from Excel Row 165	2026-02-15 12:32:27.384423+03	2026-02-15 12:32:27.384423+03	paid	cash	[]
77b20f2c-03c2-456f-b3df-986505f0b85a	874ac69f-41fa-40eb-a684-e649ae3201f3	501000.00	2026-02-15	\N	Imported from Excel Row 166	2026-02-15 12:32:27.385216+03	2026-02-15 12:32:27.385216+03	paid	cash	[]
6ae649d8-afaf-415f-9efa-01cacbc18334	997aa150-7fd6-4d22-9d43-60928fafe558	320000.00	2026-02-15	\N	Imported from Excel Row 167	2026-02-15 12:32:27.385998+03	2026-02-15 12:32:27.385998+03	paid	cash	[]
d60a5c29-ce99-4d1f-92ff-16593a5d0e78	4acfa01e-82b6-4b7d-b09b-0ed0fb47c4d2	390000.00	2026-02-15	\N	Imported from Excel Row 168	2026-02-15 12:32:27.386835+03	2026-02-15 12:32:27.386835+03	paid	cash	[]
08894273-a7fc-4f2f-a650-c5da8dc33217	e9aaabf8-2fa3-4bf2-b8b4-de73f2ad1e66	351000.00	2026-02-15	\N	Imported from Excel Row 169	2026-02-15 12:32:27.387862+03	2026-02-15 12:32:27.387862+03	paid	cash	[]
acc4a80e-6043-4d98-ab39-2ffa2e3f2c07	d80c5b13-f528-4538-9555-91de2f9a9080	330000.00	2026-02-15	\N	Imported from Excel Row 170	2026-02-15 12:32:27.388886+03	2026-02-15 12:32:27.388886+03	paid	cash	[]
219fd403-7d8d-4496-9c76-e8898fbaeaba	cd421a86-24a5-4f2a-b324-b922ed28d7ed	400000.00	2026-02-15	\N	Imported from Excel Row 171	2026-02-15 12:32:27.389786+03	2026-02-15 12:32:27.389786+03	paid	cash	[]
1316591c-344c-4b94-853a-21d92eee4bd5	fbc570f2-0d87-45e5-a691-913e107f339b	650000.00	2026-02-15	\N	Imported from Excel Row 172	2026-02-15 12:32:27.390629+03	2026-02-15 12:32:27.390629+03	paid	cash	[]
6317cca5-f826-48b2-9c16-1d766dd57021	58eebfbf-8669-4ac7-b397-4c6b92e3461a	328000.00	2026-02-15	\N	Imported from Excel Row 173	2026-02-15 12:32:27.391405+03	2026-02-15 12:32:27.391405+03	paid	cash	[]
45734b95-2a31-46ec-88bd-15b9d568ae1e	89beb8c6-d1fc-4857-9514-30d2a28bb8d4	615000.00	2026-02-15	\N	Imported from Excel Row 174	2026-02-15 12:32:27.392202+03	2026-02-15 12:32:27.392202+03	paid	cash	[]
ba0a0f7a-6e73-4623-a7b6-7834a7a18530	cb202328-d8de-484f-aee9-70345e437d9f	650000.00	2026-02-15	\N	Imported from Excel Row 175	2026-02-15 12:32:27.392992+03	2026-02-15 12:32:27.392992+03	paid	cash	[]
22380ce6-b8c5-432b-84e3-fe3cc2a4640f	712514ed-b2c0-4a62-91e0-623767ba0002	225000.00	2026-02-15	\N	Imported from Excel Row 176	2026-02-15 12:32:27.393751+03	2026-02-15 12:32:27.393751+03	paid	cash	[]
4848e1d4-2bbe-464b-a495-109722606cb3	5cf4e163-795c-48d2-b7df-dc063ee13f21	198000.00	2026-02-15	\N	Imported from Excel Row 177	2026-02-15 12:32:27.394794+03	2026-02-15 12:32:27.394794+03	paid	cash	[]
9ca83035-8227-4527-848f-e5a771841d6e	222ebbf8-ac9d-48ba-8603-81f44301fc6c	228000.00	2026-02-15	\N	Imported from Excel Row 178	2026-02-15 12:32:27.395952+03	2026-02-15 12:32:27.395952+03	paid	cash	[]
4323ad73-cded-4bef-a6c7-bcd244365203	b5780c48-3063-42b2-8620-2ee6dee5000e	450000.00	2026-02-15	\N	Imported from Excel Row 179	2026-02-15 12:32:27.397035+03	2026-02-15 12:32:27.397035+03	paid	cash	[]
2fd18a4d-1b6a-4503-9139-caaf5a72bf72	d249b824-590b-48f7-82e3-94139f75aa75	480000.00	2026-02-15	\N	Imported from Excel Row 180	2026-02-15 12:32:27.397973+03	2026-02-15 12:32:27.397973+03	paid	cash	[]
82ad1ee6-8dd4-44b6-9520-f1a88dc266e0	af883d2e-33e1-4ebf-90e5-1820a53881c2	450000.00	2026-02-15	\N	Imported from Excel Row 181	2026-02-15 12:32:27.398929+03	2026-02-15 12:32:27.398929+03	paid	cash	[]
5cdc61c5-ddd0-46b2-a320-cb45b7756e19	ba729193-1583-4850-82c1-ef1284dd6ec6	480000.00	2026-02-15	\N	Imported from Excel Row 182	2026-02-15 12:32:27.39974+03	2026-02-15 12:32:27.39974+03	paid	cash	[]
8a457b61-6b31-47f0-a2aa-9d48950ccd18	9be26caa-25e2-42bf-9666-d9882fccfc6b	32000.00	2026-02-15	\N	Imported from Excel Row 183	2026-02-15 12:32:27.400516+03	2026-02-15 12:32:27.400516+03	paid	cash	[]
67c9e429-4ebb-4824-bb40-eae6d137f222	6913d478-15dd-49da-abae-be61ab1ed4dd	293000.00	2026-02-15	\N	Imported from Excel Row 186	2026-02-15 12:32:27.401327+03	2026-02-15 12:32:27.401327+03	paid	cash	[]
e2603f08-04f5-4b3f-9965-60735c2d21b8	40aa2cc0-3fe0-4029-b015-4e4aae881775	351000.00	2026-02-15	\N	Imported from Excel Row 187	2026-02-15 12:32:27.40311+03	2026-02-15 12:32:27.40311+03	paid	cash	[]
67b429de-a32b-426f-9348-57056a1a3a1a	ed71e5da-ce82-4f28-8f65-8808c933446b	297000.00	2026-02-15	\N	Imported from Excel Row 188	2026-02-15 12:32:27.404124+03	2026-02-15 12:32:27.404124+03	paid	cash	[]
c3930c3d-76f2-4d3b-8d75-582b8de37f60	09fbeb3e-d2ce-415f-818d-ab62582e4f56	509000.00	2026-02-15	\N	Imported from Excel Row 189	2026-02-15 12:32:27.40507+03	2026-02-15 12:32:27.40507+03	paid	cash	[]
8911f377-7642-426b-b199-89f69c2e3c72	e9357f7a-171b-4f0e-9fe5-3577dcc871e6	509000.00	2026-02-15	\N	Imported from Excel Row 190	2026-02-15 12:32:27.405894+03	2026-02-15 12:32:27.405894+03	paid	cash	[]
ee44d215-c19f-4627-be93-4682ce43c285	5626f0b6-8fac-4830-8c54-ca3384068b18	349000.00	2026-02-15	\N	Imported from Excel Row 191	2026-02-15 12:32:27.407165+03	2026-02-15 12:32:27.407165+03	paid	cash	[]
f4d0a7a4-2fe5-43c1-a1ee-a2dbfff43976	3693dc9e-3a43-4567-933a-8f0e1ecc2e22	650000.00	2026-02-15	\N	Imported from Excel Row 193	2026-02-15 12:32:27.407966+03	2026-02-15 12:32:27.407966+03	paid	cash	[]
606ef2ba-0f0c-4293-99f7-2b10854d4d76	00ced3f8-2b84-4f39-840b-047f3985f949	120000.00	2026-02-15	\N	Imported from Excel Row 194	2026-02-15 12:32:27.409084+03	2026-02-15 12:32:27.409084+03	paid	cash	[]
ca1c56da-9250-4649-9be4-c441341368f4	c263b602-f83b-482b-af16-7c6adcf1f4e7	650000.00	2026-02-15	\N	Imported from Excel Row 196	2026-02-15 12:32:27.409869+03	2026-02-15 12:32:27.409869+03	paid	cash	[]
ee927e8f-a422-48c2-b941-6abbe7ab4466	32899c96-a839-4013-842e-c92cddfc6d9b	650000.00	2026-02-15	\N	Imported from Excel Row 197	2026-02-15 12:32:27.410649+03	2026-02-15 12:32:27.410649+03	paid	cash	[]
7ac063f5-aa48-4514-9fe3-77191257a94b	eaab080a-a032-421a-b2b4-60abfc053ba0	650000.00	2026-02-15	\N	Imported from Excel Row 198	2026-02-15 12:32:27.411726+03	2026-02-15 12:32:27.411726+03	paid	cash	[]
4161824a-a4d2-4c5b-9b8b-f9b43f497fcf	270d1a00-b312-4057-804e-4a6b4e2f7d45	650000.00	2026-02-15	\N	Imported from Excel Row 199	2026-02-15 12:32:27.412958+03	2026-02-15 12:32:27.412958+03	paid	cash	[]
4aebf926-393e-461a-999c-7ce8c2920deb	3c2ea4e0-3158-44b3-84a4-9cb2d7420515	650000.00	2026-02-15	\N	Imported from Excel Row 200	2026-02-15 12:32:27.413937+03	2026-02-15 12:32:27.413937+03	paid	cash	[]
ceb5b5ec-7a97-4347-9f24-a43367863a9c	a57b8a13-8a5a-4b02-91a6-5efdae86d510	510000.00	2026-02-15	\N	Imported from Excel Row 202	2026-02-15 12:32:27.414881+03	2026-02-15 12:32:27.414881+03	paid	cash	[]
0a07e18a-42de-4efe-ade0-7a0db5e830d2	d1e8ad86-1ac8-4308-939a-500d813f98a0	520000.00	2026-02-15	\N	Imported from Excel Row 204	2026-02-15 12:32:27.41663+03	2026-02-15 12:32:27.41663+03	paid	cash	[]
60439e86-6a65-4c41-8784-6737335b1099	2ce5b33a-6578-4216-9b64-cffe1b893e21	390000.00	2026-02-15	\N	Imported from Excel Row 205	2026-02-15 12:32:27.417493+03	2026-02-15 12:32:27.417493+03	paid	cash	[]
80d2c3cb-ffca-4afa-8d2f-06a0750f1964	9c61c5fe-d77f-4832-b3c7-024955542f06	520000.00	2026-02-15	\N	Imported from Excel Row 206	2026-02-15 12:32:27.418274+03	2026-02-15 12:32:27.418274+03	paid	cash	[]
9f9db2fd-ee2e-41d1-91cd-4fa895a4c84a	43f8592e-a80b-4b07-8f91-393d6467f537	650000.00	2026-02-15	\N	Imported from Excel Row 207	2026-02-15 12:32:27.419194+03	2026-02-15 12:32:27.419194+03	paid	cash	[]
628efaec-319a-4ec5-aab1-d35e3defa989	d6b9ce47-a0a7-4dac-a685-0e31e955ed27	650000.00	2026-02-15	\N	Imported from Excel Row 208	2026-02-15 12:32:27.420077+03	2026-02-15 12:32:27.420077+03	paid	cash	[]
6d70f518-6951-4c7d-b619-1dc7d07db137	8644e06a-b15d-433a-94f0-93b2c64bed92	625000.00	2026-02-15	\N	Imported from Excel Row 209	2026-02-15 12:32:27.420937+03	2026-02-15 12:32:27.420937+03	paid	cash	[]
ad5ffb1a-d486-4806-815a-88a12bf337a2	2d6abee5-49eb-428a-885a-6cff212a62bd	650000.00	2026-02-15	\N	Imported from Excel Row 210	2026-02-15 12:32:27.421753+03	2026-02-15 12:32:27.421753+03	paid	cash	[]
f75a4c01-fe66-4e53-8fb7-797bbf6270cd	444e3d57-79e2-41fe-af96-97fa47c6dc44	82000.00	2026-02-15	\N	Imported from Excel Row 211	2026-02-15 12:32:27.422568+03	2026-02-15 12:32:27.422568+03	paid	cash	[]
29fb1c98-9364-4f6b-8bdf-b0c390aa0982	37833043-b4f9-4116-bf7e-5adb40a52d7a	123000.00	2026-02-15	\N	Imported from Excel Row 212	2026-02-15 12:32:27.423831+03	2026-02-15 12:32:27.423831+03	paid	cash	[]
73eecf13-b5d4-423e-bbe1-617d8a7990dd	73609408-283b-463f-9504-dff59d6dea83	123000.00	2026-02-15	\N	Imported from Excel Row 213	2026-02-15 12:32:27.425056+03	2026-02-15 12:32:27.425056+03	paid	cash	[]
f914d8ea-0458-450d-b001-10add531614a	8efab7af-cd67-4825-95f5-3c43c32d8095	123000.00	2026-02-15	\N	Imported from Excel Row 214	2026-02-15 12:32:27.42595+03	2026-02-15 12:32:27.42595+03	paid	cash	[]
c5025958-495f-4cf0-acf3-4c43009b47cf	c183c1a3-ccba-4c91-9697-68f53bee490a	163000.00	2026-02-15	\N	Imported from Excel Row 215	2026-02-15 12:32:27.426934+03	2026-02-15 12:32:27.426934+03	paid	cash	[]
d2e76e18-29e8-484c-b96d-edd88a8bf644	df94cdcc-2462-477a-aaa6-11e9bd446dc1	650000.00	2026-02-15	\N	Imported from Excel Row 216	2026-02-15 12:32:27.427972+03	2026-02-15 12:32:27.427972+03	paid	cash	[]
88c8d258-f6c5-4f16-ba22-3b91a792fee2	caf0abca-f7fc-4bae-a3a0-406c68a73487	650000.00	2026-02-15	\N	Imported from Excel Row 217	2026-02-15 12:32:27.429179+03	2026-02-15 12:32:27.429179+03	paid	cash	[]
52020387-465d-4c13-8e4a-77a34d312d14	006dc261-ffd9-4b27-acc5-05bb0000fc64	650000.00	2026-02-15	\N	Imported from Excel Row 218	2026-02-15 12:32:27.430348+03	2026-02-15 12:32:27.430348+03	paid	cash	[]
3888df4a-84a1-49d1-9e2b-a0658db13e12	f3086b1b-f49a-45e3-81b4-ee5b994c3afb	650000.00	2026-02-15	\N	Imported from Excel Row 219	2026-02-15 12:32:27.437568+03	2026-02-15 12:32:27.437568+03	paid	cash	[]
8634951c-0d68-4caa-9a26-889dbf3ebabf	404da766-0f11-46f3-a109-71c03810dd2c	650000.00	2026-02-15	\N	Imported from Excel Row 220	2026-02-15 12:32:27.438529+03	2026-02-15 12:32:27.438529+03	paid	cash	[]
e7501f20-72d3-4362-ad12-db7922fb0b0c	2414aa66-0c81-40af-b29d-8176c0a22a3c	480000.00	2026-02-15	\N	Imported from Excel Row 221	2026-02-15 12:32:27.439365+03	2026-02-15 12:32:27.439365+03	paid	cash	[]
ea2ff1fc-592c-4c8a-8f5c-6a7c5ac9dd60	7fe64c45-dec9-4bbc-82f0-94b01ffda9dd	930000.00	2026-02-15	\N	Imported from Excel Row 222	2026-02-15 12:32:27.440195+03	2026-02-15 12:32:27.440195+03	paid	cash	[]
1de9eede-d1f1-42a0-a638-b1fc90b045a5	8a219eb3-cb77-4e38-832b-debb6bbbd5e1	625000.00	2026-02-15	\N	Imported from Excel Row 223	2026-02-15 12:32:27.44169+03	2026-02-15 12:32:27.44169+03	paid	cash	[]
1bf8aa9a-d4ec-4715-bae4-e6b8c9d1d40f	0700698d-b21a-4054-ae22-e0595d6b1578	920000.00	2026-02-15	\N	Imported from Excel Row 224	2026-02-15 12:32:27.443322+03	2026-02-15 12:32:27.443322+03	paid	cash	[]
6048367e-018e-4c77-896b-35fad3a35680	51f89eb8-3760-4d40-afda-26fe3d81ab06	748000.00	2026-02-15	\N	Imported from Excel Row 225	2026-02-15 12:32:27.444591+03	2026-02-15 12:32:27.444591+03	paid	cash	[]
645d78a5-6184-4107-a9f7-cec4ab381dfd	28027c27-6a9c-4df2-ba94-8b09562ace64	616000.00	2026-02-15	\N	Imported from Excel Row 226	2026-02-15 12:32:27.445779+03	2026-02-15 12:32:27.445779+03	paid	cash	[]
c4bfd1cd-9476-45e5-9818-6e0f38f2a445	3c5f250f-6f2e-4373-96ab-7b181deeeff7	889000.00	2026-02-15	\N	Imported from Excel Row 227	2026-02-15 12:32:27.446881+03	2026-02-15 12:32:27.446881+03	paid	cash	[]
24951743-a0f4-4d73-82fd-68d39d26d74b	1db57fbe-659c-4966-8d5e-b27059ed2cbe	777000.00	2026-02-15	\N	Imported from Excel Row 228	2026-02-15 12:32:27.447931+03	2026-02-15 12:32:27.447931+03	paid	cash	[]
1a429d32-f447-444b-8de1-5df078ae7a88	58127581-005f-4e0c-85f7-c0674e80de48	850000.00	2026-02-15	\N	Imported from Excel Row 229	2026-02-15 12:32:27.44893+03	2026-02-15 12:32:27.44893+03	paid	cash	[]
6efd89b9-5653-4ddd-bbb2-f91bcb6e77cc	7131934a-1b47-4a16-b289-ed0be139ced8	782000.00	2026-02-15	\N	Imported from Excel Row 230	2026-02-15 12:32:27.449823+03	2026-02-15 12:32:27.449823+03	paid	cash	[]
5c33413d-12aa-410b-9369-b372b95af245	327ae9f2-d622-4f88-8b48-4cc40914bb6b	296000.00	2026-02-15	\N	Imported from Excel Row 232	2026-02-15 12:32:27.450755+03	2026-02-15 12:32:27.450755+03	paid	cash	[]
4a730b76-1bf2-4e94-9996-ba30f22e2b5b	37d19cba-1213-46a8-8e2a-76adc755023d	910000.00	2026-02-15	\N	Imported from Excel Row 234	2026-02-15 12:32:27.451684+03	2026-02-15 12:32:27.451684+03	paid	cash	[]
199c7cc9-fea7-4ca1-a3a3-bee83e3cedde	3099ae66-bf2c-47d9-acf4-4cef281bac72	650000.00	2026-02-15	\N	Imported from Excel Row 235	2026-02-15 12:32:27.452909+03	2026-02-15 12:32:27.452909+03	paid	cash	[]
76c9fca6-c2d8-4555-a806-0c81bd5f14b3	e3271c4e-580e-4f56-af30-520f2df7e6ea	650000.00	2026-02-15	\N	Imported from Excel Row 236	2026-02-15 12:32:27.454017+03	2026-02-15 12:32:27.454017+03	paid	cash	[]
54fc0a97-7a3e-4fca-a82f-81b385bac5c3	7e6be631-564e-436d-9db3-8006e69e8bed	650000.00	2026-02-15	\N	Imported from Excel Row 237	2026-02-15 12:32:27.454923+03	2026-02-15 12:32:27.454923+03	paid	cash	[]
7f532045-da40-47d2-b5eb-120c4d7a3d9e	ad39b47c-cce9-49cf-8ce8-72a25ee055a5	650000.00	2026-02-15	\N	Imported from Excel Row 238	2026-02-15 12:32:27.455736+03	2026-02-15 12:32:27.455736+03	paid	cash	[]
5b33e7bc-5e9a-4a86-8cc3-ad02d86b713b	6129f091-75d9-4fe6-92ac-65cdc49da302	105000.00	2026-02-15	\N	Imported from Excel Row 244	2026-02-15 12:32:27.456616+03	2026-02-15 12:32:27.456616+03	paid	cash	[]
89647916-50a1-4118-9a95-e06381ec1adc	8a582970-e620-4904-ac94-a175fb03f2ae	35000.00	2026-02-15	\N	Imported from Excel Row 245	2026-02-15 12:32:27.458421+03	2026-02-15 12:32:27.458421+03	paid	cash	[]
26f1ef7b-558d-49e7-8df3-253c3872786d	eb6e66b7-a28f-4d11-8b6b-e11ea828f475	35000.00	2026-02-15	\N	Imported from Excel Row 246	2026-02-15 12:32:27.459314+03	2026-02-15 12:32:27.459314+03	paid	cash	[]
1b1622f7-079f-4144-843b-686482d3bbd3	b5900987-5234-42b3-be6a-d0c863eadd80	672000.00	2026-02-15	\N	Imported from Excel Row 255	2026-02-15 12:32:27.460212+03	2026-02-15 12:32:27.460212+03	paid	cash	[]
eb8e49b1-0d73-4c53-b25b-a5204d48cf30	72dc7d44-245d-48b2-9496-1318567e69b4	665000.00	2026-02-15	\N	Imported from Excel Row 256	2026-02-15 12:32:27.46203+03	2026-02-15 12:32:27.46203+03	paid	cash	[]
a2406475-b662-4f3a-9096-7d6c24f942e1	4b0aafb9-4335-4be9-84b2-f07cfa221527	520000.00	2026-02-15	\N	Imported from Excel Row 257	2026-02-15 12:32:27.46319+03	2026-02-15 12:32:27.46319+03	paid	cash	[]
dc22d1b4-6cc1-4580-8a9f-9350723c724b	8626ac84-3635-4cb7-860b-58a2158457b5	665000.00	2026-02-15	\N	Imported from Excel Row 258	2026-02-15 12:32:27.464238+03	2026-02-15 12:32:27.464238+03	paid	cash	[]
8806187b-1b66-4bd0-881f-49ab892f38ef	618b9895-f247-411c-8553-bab117a64e72	100000.00	2026-02-15	\N	Imported from Excel Row 266	2026-02-15 12:32:27.465247+03	2026-02-15 12:32:27.465247+03	paid	cash	[]
4248e8bf-9f05-4122-bd15-1895a24e6027	ab61de1b-e467-4d74-b9de-0a7a37cef69c	50000.00	2026-02-15	\N	Imported from Excel Row 267	2026-02-15 12:32:27.465999+03	2026-02-15 12:32:27.465999+03	paid	cash	[]
586a6f08-046c-4ff9-81e2-55284efc8e3f	db1ce1e7-68e3-407b-a48c-eadf70fccee3	816000.00	2026-02-15	\N	Imported from Excel Row 270	2026-02-15 12:32:27.46676+03	2026-02-15 12:32:27.46676+03	paid	cash	[]
824f5085-b7c2-458e-b896-3b18a1d1df42	b71f12b6-7c4c-46b5-9283-76617a1a8e70	561000.00	2026-02-15	\N	Imported from Excel Row 271	2026-02-15 12:32:27.467479+03	2026-02-15 12:32:27.467479+03	paid	cash	[]
a573017a-ca82-4e49-bad5-c0d68cfbab56	1678826e-01d1-4cf1-9cfe-e3b19c57183f	440000.00	2026-02-15	\N	Imported from Excel Row 272	2026-02-15 12:32:27.469258+03	2026-02-15 12:32:27.469258+03	paid	cash	[]
94c16a7f-2ab4-4783-b231-7e358f332853	e6c531e8-fdb1-4dc8-9698-21c4b2f360d9	480000.00	2026-02-15	\N	Imported from Excel Row 273	2026-02-15 12:32:27.470043+03	2026-02-15 12:32:27.470043+03	paid	cash	[]
affbb6dd-6099-4ac8-bddc-20f4e2e0a7b6	633d829f-0338-4e9a-9716-270d6c45f843	480000.00	2026-02-15	\N	Imported from Excel Row 274	2026-02-15 12:32:27.47092+03	2026-02-15 12:32:27.47092+03	paid	cash	[]
bf43a791-7e40-4f39-b4b2-7758db2352e3	d1c9536c-af9a-4f7c-9b0d-e0fa7074823d	480000.00	2026-02-15	\N	Imported from Excel Row 275	2026-02-15 12:32:27.471963+03	2026-02-15 12:32:27.471963+03	paid	cash	[]
d38a4f9b-87b4-4047-a85f-8e566b540415	7b23c0eb-822d-4729-88d1-3ee9e9217c3e	164000.00	2026-02-15	\N	Imported from Excel Row 277	2026-02-15 12:32:27.472827+03	2026-02-15 12:32:27.472827+03	paid	cash	[]
94c5ad8f-ebb3-4535-a937-1ae30f504c8f	7bed9a6c-48ae-4728-850e-81bdff9dbca5	123000.00	2026-02-15	\N	Imported from Excel Row 278	2026-02-15 12:32:27.473626+03	2026-02-15 12:32:27.473626+03	paid	cash	[]
852046f2-2e18-4513-be47-fd701861c0e8	122ad36b-2cd3-41fa-8783-9e05fce0dced	164000.00	2026-02-15	\N	Imported from Excel Row 279	2026-02-15 12:32:27.474427+03	2026-02-15 12:32:27.474427+03	paid	cash	[]
ea978e92-8ce3-4937-8cc0-b0b6c5b3edd6	81b23010-d32b-4435-b216-710507193d30	164000.00	2026-02-15	\N	Imported from Excel Row 280	2026-02-15 12:32:27.475238+03	2026-02-15 12:32:27.475238+03	paid	cash	[]
1a927e94-cc4b-40de-9b63-a8cb67fa5281	d63c6468-1788-4409-a0ae-c0fbd3d289cc	200000.00	2026-02-15	\N	Imported from Excel Row 281	2026-02-15 12:32:27.476098+03	2026-02-15 12:32:27.476098+03	paid	cash	[]
89281ef6-0da4-4f69-b096-6481839a350d	cbce8279-55c7-45e6-be17-f0294b9e9b13	123000.00	2026-02-15	\N	Imported from Excel Row 282	2026-02-15 12:32:27.476845+03	2026-02-15 12:32:27.476845+03	paid	cash	[]
c3593e5d-9ebf-4488-9ecf-6e8de2175dc9	4d839de4-c1b5-480d-bf45-2f0daad04925	650000.00	2026-02-15	\N	Imported from Excel Row 283	2026-02-15 12:32:27.47785+03	2026-02-15 12:32:27.47785+03	paid	cash	[]
ec12673a-483b-49ad-89bc-4ced2e3f0f08	1a1802b6-6eb1-454b-9e61-fcc5a4f4a418	665000.00	2026-02-15	\N	Imported from Excel Row 284	2026-02-15 12:32:27.479044+03	2026-02-15 12:32:27.479044+03	paid	cash	[]
2811b0d2-fcef-4bf8-ae50-c1a6ce8dc0ad	e21c5051-51cc-478b-938e-108a84ab6a4a	620000.00	2026-02-15	\N	Imported from Excel Row 285	2026-02-15 12:32:27.480186+03	2026-02-15 12:32:27.480186+03	paid	cash	[]
8d2ee70f-81ba-47fb-903a-a86a4d8a132b	9efb6cf8-0108-4457-a4d6-97e24693bc2d	650000.00	2026-02-15	\N	Imported from Excel Row 286	2026-02-15 12:32:27.481125+03	2026-02-15 12:32:27.481125+03	paid	cash	[]
4e2afdb4-9d5c-483d-8934-a552da6f295c	0fc0ba94-5940-427c-b19c-0ffaa7c84972	650000.00	2026-02-15	\N	Imported from Excel Row 287	2026-02-15 12:32:27.481931+03	2026-02-15 12:32:27.481931+03	paid	cash	[]
5e0081dc-8478-4809-b5cf-6af8b88ab21b	0309e9d8-61f8-41ed-9ca2-97dd15530e88	650000.00	2026-02-15	\N	Imported from Excel Row 288	2026-02-15 12:32:27.482716+03	2026-02-15 12:32:27.482716+03	paid	cash	[]
670d2761-4f03-4726-ab1e-3043edc59879	93f59f1a-5fe5-41e9-a41e-a62388bdd1db	650000.00	2026-02-15	\N	Imported from Excel Row 289	2026-02-15 12:32:27.483558+03	2026-02-15 12:32:27.483558+03	paid	cash	[]
2daf5fcf-1e51-4013-b034-d7f96e69e769	cc673ad8-4abb-4ebc-9a9c-ce76095572d0	650000.00	2026-02-15	\N	Imported from Excel Row 290	2026-02-15 12:32:27.484407+03	2026-02-15 12:32:27.484407+03	paid	cash	[]
b77e220b-42c9-4170-ad4f-c073b89a62da	f6cc2088-71d1-4ade-976c-0e164a910372	650000.00	2026-02-15	\N	Imported from Excel Row 291	2026-02-15 12:32:27.485213+03	2026-02-15 12:32:27.485213+03	paid	cash	[]
567de118-7781-47c4-bc0c-5e8fc0ee26d2	b1b0dff6-bbd7-4b05-ba76-938da7a51a10	650000.00	2026-02-15	\N	Imported from Excel Row 292	2026-02-15 12:32:27.486098+03	2026-02-15 12:32:27.486098+03	paid	cash	[]
c71af536-e81c-41a1-8d73-f4d5500f3a14	cc1c1b91-054d-43bf-a5d4-b2d0785523b1	445000.00	2026-02-15	\N	Imported from Excel Row 293	2026-02-15 12:32:27.486947+03	2026-02-15 12:32:27.486947+03	paid	cash	[]
7891621c-0318-4192-be7b-38ec47851dff	eae30a4e-1fc0-46b0-ac0f-36cc55555e24	405000.00	2026-02-15	\N	Imported from Excel Row 294	2026-02-15 12:32:27.487883+03	2026-02-15 12:32:27.487883+03	paid	cash	[]
527d412b-bc6b-4b88-91f4-f9696ceb4174	48eff088-0c79-4546-924c-9e8b6743fc1c	425000.00	2026-02-15	\N	Imported from Excel Row 295	2026-02-15 12:32:27.488972+03	2026-02-15 12:32:27.488972+03	paid	cash	[]
fbbea4ec-3e7e-4f1b-926b-ea3076d51d27	b3fb64ac-5c94-4b98-aca2-8c8aca91cbc6	525000.00	2026-02-15	\N	Imported from Excel Row 296	2026-02-15 12:32:27.489865+03	2026-02-15 12:32:27.489865+03	paid	cash	[]
62d30a60-ba81-44b0-8d1a-4c053a11049f	f67f8ac4-99ea-4a45-a6fd-0616328eb5f8	910000.00	2026-02-15	\N	Imported from Excel Row 297	2026-02-15 12:32:27.490854+03	2026-02-15 12:32:27.490854+03	paid	cash	[]
4624b7b1-1585-4cab-87db-99d246f07a78	75fabbc8-9eaa-41f7-9013-766876d1cafe	555500.00	2026-02-15	\N	Imported from Excel Row 298	2026-02-15 12:32:27.491802+03	2026-02-15 12:32:27.491802+03	paid	cash	[]
450e0f00-d1a9-4765-bede-45824ed6a100	7b67e47b-1cb5-4ddd-867e-3222defe9d31	199000.00	2026-02-15	\N	Imported from Excel Row 299	2026-02-15 12:32:27.49268+03	2026-02-15 12:32:27.49268+03	paid	cash	[]
e1bd107d-ab3f-4e84-9a2e-17713669515d	b80e40d9-358b-4872-a9fb-827e216f511c	176000.00	2026-02-15	\N	Imported from Excel Row 300	2026-02-15 12:32:27.493573+03	2026-02-15 12:32:27.493573+03	paid	cash	[]
803ccb4b-bb47-4d2c-a564-c7cec3cf38f9	647d4b18-87b2-40bd-9ff5-e4e9a3dcb2ef	182000.00	2026-02-15	\N	Imported from Excel Row 301	2026-02-15 12:32:27.494651+03	2026-02-15 12:32:27.494651+03	paid	cash	[]
5cdfd5ef-0fe3-49b0-8769-fad68cfc8169	cf44e2a2-fa25-4263-9a61-4ae824cef62a	198000.00	2026-02-15	\N	Imported from Excel Row 302	2026-02-15 12:32:27.495781+03	2026-02-15 12:32:27.495781+03	paid	cash	[]
1f6b27c2-f665-40bf-93ef-df8e1f7bb384	11d966fa-c15a-4d2c-ac48-2bedf541a2c1	451000.00	2026-02-15	\N	Imported from Excel Row 303	2026-02-15 12:32:27.496872+03	2026-02-15 12:32:27.496872+03	paid	cash	[]
e9654239-f9cb-42a0-a19c-a05ba6a0561f	a0cbbebc-e133-487e-8b1c-91033c2934e0	435000.00	2026-02-15	\N	Imported from Excel Row 304	2026-02-15 12:32:27.497769+03	2026-02-15 12:32:27.497769+03	paid	cash	[]
ee85d52e-8312-4066-8328-27d2c19aa9b9	09ed8a35-28ed-47e2-ace6-d7ce3fdcbe2c	481000.00	2026-02-15	\N	Imported from Excel Row 305	2026-02-15 12:32:27.498667+03	2026-02-15 12:32:27.498667+03	paid	cash	[]
1f122809-a7d1-42af-b835-d7eb7d2f6fd2	8e3b7966-6311-45ae-af5d-fb657c16c5f4	465000.00	2026-02-15	\N	Imported from Excel Row 306	2026-02-15 12:32:27.499568+03	2026-02-15 12:32:27.499568+03	paid	cash	[]
41fd5129-7cca-4e1e-ab2b-09e87f52360f	78805f56-87e0-4773-9c44-ba358d995da3	665000.00	2026-02-15	\N	Imported from Excel Row 307	2026-02-15 12:32:27.500317+03	2026-02-15 12:32:27.500317+03	paid	cash	[]
10672e24-a6d4-4f1d-a30c-72c7cca19259	8953333a-26b1-41b9-bc56-d60444ff97a0	665000.00	2026-02-15	\N	Imported from Excel Row 308	2026-02-15 12:32:27.501009+03	2026-02-15 12:32:27.501009+03	paid	cash	[]
4e427c1d-0637-461c-9084-7038176d6992	2d66159b-ff3a-493b-a2f3-c774f990d603	925000.00	2026-02-15	\N	Imported from Excel Row 309	2026-02-15 12:32:27.501687+03	2026-02-15 12:32:27.501687+03	paid	cash	[]
58fe83d7-a0d4-4cb6-b3a9-9c2200e50175	a6ec3322-2442-4549-b186-6783cf28d149	573000.00	2026-02-15	\N	Imported from Excel Row 310	2026-02-15 12:32:27.502387+03	2026-02-15 12:32:27.502387+03	paid	cash	[]
ef5a9f79-77f9-4fda-a33f-a10abd9632d4	9cbb21a4-ecb4-4484-bb8d-2b60ffcfdabe	434000.00	2026-02-15	\N	Imported from Excel Row 311	2026-02-15 12:32:27.503102+03	2026-02-15 12:32:27.503102+03	paid	cash	[]
30e7689c-6228-4ba6-b7a3-37a16c5dc65e	724eee73-a2a4-4fce-a8f5-3413e1cd038a	680000.00	2026-02-15	\N	Imported from Excel Row 312	2026-02-15 12:32:27.503972+03	2026-02-15 12:32:27.503972+03	paid	cash	[]
e8879234-bdc6-4efb-b468-cb943231ccce	04085df2-8751-4945-b7ad-09fe0c988ada	667000.00	2026-02-15	\N	Imported from Excel Row 313	2026-02-15 12:32:27.504727+03	2026-02-15 12:32:27.504727+03	paid	cash	[]
41ceef5a-0a0d-47d9-bc8c-3be9edcd3be4	e6f92999-a13e-4dd6-b307-46b89ba00540	630000.00	2026-02-15	\N	Imported from Excel Row 314	2026-02-15 12:32:27.505486+03	2026-02-15 12:32:27.505486+03	paid	cash	[]
d86d75ab-5b38-4109-b085-492c5aa65331	a8b35042-b494-43e7-8c41-9f0d54a861df	647000.00	2026-02-15	\N	Imported from Excel Row 315	2026-02-15 12:32:27.506397+03	2026-02-15 12:32:27.506397+03	paid	cash	[]
1837e879-6ea1-481e-931e-edae48f6cacf	d20d58c5-b369-4afe-b378-2a5f17f6d04d	665000.00	2026-02-15	\N	Imported from Excel Row 316	2026-02-15 12:32:27.507193+03	2026-02-15 12:32:27.507193+03	paid	cash	[]
f3c443c9-e9ca-4033-a549-045f4febca04	21dadaa5-ed07-40e1-a341-d63ca8cca0ed	680000.00	2026-02-15	\N	Imported from Excel Row 317	2026-02-15 12:32:27.507894+03	2026-02-15 12:32:27.507894+03	paid	cash	[]
aa884202-129c-440f-9956-247c2896be87	e24ca864-474b-44f1-bfda-7b90c6cb6cb5	680000.00	2026-02-15	\N	Imported from Excel Row 318	2026-02-15 12:32:27.508582+03	2026-02-15 12:32:27.508582+03	paid	cash	[]
b348bf07-5c85-4748-a5d2-4019e375ed0a	fa7c296b-7162-4d9d-b670-761c4f68d6f3	680000.00	2026-02-15	\N	Imported from Excel Row 319	2026-02-15 12:32:27.509339+03	2026-02-15 12:32:27.509339+03	paid	cash	[]
e72d7eb8-b49b-4a08-a84a-fa53bb5c5924	53f3c7ed-b3ee-4748-8515-8f4539f9dd3b	680000.00	2026-02-15	\N	Imported from Excel Row 320	2026-02-15 12:32:27.510205+03	2026-02-15 12:32:27.510205+03	paid	cash	[]
a7c5bea4-e07b-49ca-8010-6f9c811fd755	06c020cc-97e7-4140-a728-17ec663c785e	695000.00	2026-02-15	\N	Imported from Excel Row 322	2026-02-15 12:32:27.511442+03	2026-02-15 12:32:27.511442+03	paid	cash	[]
c69064bc-1097-4a20-97fd-81927862396f	8bcc19aa-88e9-49cf-ac77-3fd20ec1732f	81000.00	2026-02-15	\N	Imported from Excel Row 324	2026-02-15 12:32:27.512582+03	2026-02-15 12:32:27.512582+03	paid	cash	[]
ed3b4373-5cdf-4341-9473-2d17743fe82f	da55a0ad-2aec-4bb5-ad56-f0aa9fe73c06	740000.00	2026-02-15	\N	Imported from Excel Row 325	2026-02-15 12:32:27.513403+03	2026-02-15 12:32:27.513403+03	paid	cash	[]
a794775f-bdbd-4918-8c1b-84febf1b2d7f	656e5908-6d09-4f45-849d-a496ba5702bb	560000.00	2026-02-15	\N	Imported from Excel Row 326	2026-02-15 12:32:27.514231+03	2026-02-15 12:32:27.514231+03	paid	cash	[]
f37626aa-ab4b-4c76-94d0-ebe3b5a41b5e	cbd20c45-9ff8-4189-99cb-5683e916313d	693000.00	2026-02-15	\N	Imported from Excel Row 327	2026-02-15 12:32:27.515079+03	2026-02-15 12:32:27.515079+03	paid	cash	[]
00bda20e-f6dd-4755-ac2c-ebedb6e027fa	349cb57f-fe6c-4611-8913-c5d7663b2337	650000.00	2026-02-15	\N	Imported from Excel Row 329	2026-02-15 12:32:27.515791+03	2026-02-15 12:32:27.515791+03	paid	cash	[]
cd868247-b701-4aa8-82e5-a58c470f5bf8	afb016b5-8d4a-44fd-a47e-cd5a3d19a62b	125000.00	2026-02-15	\N	Imported from Excel Row 330	2026-02-15 12:32:27.516416+03	2026-02-15 12:32:27.516416+03	paid	cash	[]
9f433203-8a61-4dd6-9174-21bc8d0c81ba	8fa5661a-b70c-4e17-b666-c6a3e9b65280	205000.00	2026-02-15	\N	Imported from Excel Row 331	2026-02-15 12:32:27.517007+03	2026-02-15 12:32:27.517007+03	paid	cash	[]
4bb53599-9a4b-4b1e-9fad-d681810b960e	bd383048-e0f2-4761-84b9-33b174cee1ed	125000.00	2026-02-15	\N	Imported from Excel Row 332	2026-02-15 12:32:27.521098+03	2026-02-15 12:32:27.521098+03	paid	cash	[]
f025c75b-ec4e-4cf9-824c-e0439757cad4	50632819-0ff1-4c03-a1d3-64083d5f7a2a	235000.00	2026-02-15	\N	Imported from Excel Row 333	2026-02-15 12:32:27.532461+03	2026-02-15 12:32:27.532461+03	paid	cash	[]
dd974f7a-e193-4d84-8e22-351ddf028d56	4c6e743d-b9ca-4edc-856c-747dffb39d6a	650000.00	2026-02-15	\N	Imported from Excel Row 336	2026-02-15 12:32:27.545146+03	2026-02-15 12:32:27.545146+03	paid	cash	[]
70aa27e2-d2b1-4ac8-99ad-543beffdb36c	365b2044-73ba-4e9c-b9e4-bacc7648708e	650000.00	2026-02-15	\N	Imported from Excel Row 340	2026-02-15 12:32:27.558004+03	2026-02-15 12:32:27.558004+03	paid	cash	[]
11e327bd-3465-4951-9a97-6ca3daf526ae	ac46a162-8451-45da-91ce-9bb17dc9090b	27000.00	2026-02-15	\N	Imported from Excel Row 342	2026-02-15 12:32:27.56982+03	2026-02-15 12:32:27.56982+03	paid	cash	[]
fe6665fb-1643-4e31-9a0e-8d30c4a3eb2b	70b77b0e-5394-42b2-967b-ec53986de817	27000.00	2026-02-15	\N	Imported from Excel Row 343	2026-02-15 12:32:27.57129+03	2026-02-15 12:32:27.57129+03	paid	cash	[]
63aaa371-e9d7-4875-86a3-a204e9a4b71c	a0960c94-885f-4ea4-904b-ff5d6c587cd9	97000.00	2026-02-15	\N	Imported from Excel Row 344	2026-02-15 12:32:27.572257+03	2026-02-15 12:32:27.572257+03	paid	cash	[]
d2e2752f-12e7-41f2-af7a-71c89e6d61ee	1c13fb6d-190a-4d69-9a18-6f7617b41086	681000.00	2026-02-15	\N	Imported from Excel Row 345	2026-02-15 12:32:27.573226+03	2026-02-15 12:32:27.573226+03	paid	cash	[]
8a271a98-f4ae-46f0-9d93-ace41f942613	836c70ff-02bc-4f6c-8abe-2bff8ec43288	680000.00	2026-02-15	\N	Imported from Excel Row 346	2026-02-15 12:32:27.574045+03	2026-02-15 12:32:27.574045+03	paid	cash	[]
9614e1b0-0812-45cb-b7c8-6f169a03dee1	6b4da2e3-e3cc-40fb-bea7-b1b2b41b2c16	681000.00	2026-02-15	\N	Imported from Excel Row 347	2026-02-15 12:32:27.574906+03	2026-02-15 12:32:27.574906+03	paid	cash	[]
ae9728cd-d06f-4e71-ac69-4a5ab6a5b986	6a1aa40f-6113-41e4-b8e8-7133fd4159c4	681000.00	2026-02-15	\N	Imported from Excel Row 348	2026-02-15 12:32:27.575695+03	2026-02-15 12:32:27.575695+03	paid	cash	[]
f2b7d11c-5d60-4677-947b-4b0b0669732e	4ed36114-55a0-42af-9790-cb366bb30956	210000.00	2026-02-15	\N	Imported from Excel Row 351	2026-02-15 12:32:27.576929+03	2026-02-15 12:32:27.576929+03	paid	cash	[]
f23a5ef6-eb13-468c-8fb9-c843020fc9f9	f1625e8e-3507-4c40-8e3e-bbd1516483c1	280000.00	2026-02-15	\N	Imported from Excel Row 352	2026-02-15 12:32:27.578243+03	2026-02-15 12:32:27.578243+03	paid	cash	[]
e3c6cd97-cb4c-4ba1-b36a-03d19aee1890	fedf5a45-e5e0-4842-8a5a-26d0f4493d87	165000.00	2026-02-15	\N	Imported from Excel Row 353	2026-02-15 12:32:27.579676+03	2026-02-15 12:32:27.579676+03	paid	cash	[]
47566787-aa4f-492d-a26b-589fe33a5f4c	8413391f-961c-4a32-8751-65bafb5ec91f	928000.00	2026-02-15	\N	Imported from Excel Row 354	2026-02-15 12:32:27.580965+03	2026-02-15 12:32:27.580965+03	paid	cash	[]
b7c6022e-ff01-4a8d-8bff-674598ff0a40	bac5ea31-6b09-46e4-a437-1fc0b130a6ae	439000.00	2026-02-15	\N	Imported from Excel Row 355	2026-02-15 12:32:27.582289+03	2026-02-15 12:32:27.582289+03	paid	cash	[]
6ceb9b96-66f7-4f13-bba8-483603e874a5	cffda4c3-243a-412c-b1a3-e1d4af852ea5	455000.00	2026-02-15	\N	Imported from Excel Row 357	2026-02-15 12:32:27.583559+03	2026-02-15 12:32:27.583559+03	paid	cash	[]
e199c459-1598-4d44-ba9d-f1347d1b7d00	9c3be5fa-a5fd-43e3-81d2-a8cbf4dd4228	455000.00	2026-02-15	\N	Imported from Excel Row 358	2026-02-15 12:32:27.584455+03	2026-02-15 12:32:27.584455+03	paid	cash	[]
5d459e8e-4796-493c-b029-47295f0436b4	1263b764-ea02-4d57-89d0-24fc3bf467ed	420000.00	2026-02-15	\N	Imported from Excel Row 359	2026-02-15 12:32:27.585282+03	2026-02-15 12:32:27.585282+03	paid	cash	[]
2c215219-e686-414e-b775-07f43b156602	09cb46c7-7330-4380-ad51-fcf8ab54397b	455000.00	2026-02-15	\N	Imported from Excel Row 360	2026-02-15 12:32:27.586091+03	2026-02-15 12:32:27.586091+03	paid	cash	[]
0c8ce351-0c4d-4347-96a1-cc791b111d8a	e1dba8c3-e64b-4808-b8ab-101a548bf1db	910000.00	2026-02-15	\N	Imported from Excel Row 362	2026-02-15 12:32:27.58704+03	2026-02-15 12:32:27.58704+03	paid	cash	[]
73d6fa29-f348-4b59-8790-b5c685bea5ac	c95fa482-71a3-48ed-8c2a-1c22a3edf063	405000.00	2026-02-15	\N	Imported from Excel Row 364	2026-02-15 12:32:27.587866+03	2026-02-15 12:32:27.587866+03	paid	cash	[]
1ee505cc-544e-48c6-81a4-e7cb3d3ff468	0791685c-5824-4e82-a276-dd620c3babd3	226000.00	2026-02-15	\N	Imported from Excel Row 365	2026-02-15 12:32:27.588632+03	2026-02-15 12:32:27.588632+03	paid	cash	[]
15c0e23b-7aa3-4fbf-a790-443d648d4ac6	1eecd6af-8428-4cd5-8c6f-3aa81a7fdeff	335000.00	2026-02-15	\N	Imported from Excel Row 366	2026-02-15 12:32:27.589423+03	2026-02-15 12:32:27.589423+03	paid	cash	[]
df9cfcb7-77fd-42e7-9f9b-a8acb646c6a0	284929ee-4af2-40dc-878e-8e95524b7819	164000.00	2026-02-15	\N	Imported from Excel Row 368	2026-02-15 12:32:27.590222+03	2026-02-15 12:32:27.590222+03	paid	cash	[]
7e56f432-4b0d-4df2-9542-dbf88b3cdfa5	a9766734-422e-46aa-be4c-ca68fbf95556	805000.00	2026-02-15	\N	Imported from Excel Row 369	2026-02-15 12:32:27.591032+03	2026-02-15 12:32:27.591032+03	paid	cash	[]
ff842494-c585-41d8-bb44-9e5c0ea40616	c404ae0e-495a-4774-b361-ddd354b168e4	670000.00	2026-02-15	\N	Imported from Excel Row 370	2026-02-15 12:32:27.591828+03	2026-02-15 12:32:27.591828+03	paid	cash	[]
1ed3f031-4759-460b-a0e6-528ab50506c1	1abf69cb-8de7-49db-bf25-b40df13202c0	780000.00	2026-02-15	\N	Imported from Excel Row 371	2026-02-15 12:32:27.592617+03	2026-02-15 12:32:27.592617+03	paid	cash	[]
5700ea9e-a8ca-4c3e-96a8-3f484cdc7594	7f4493b4-682c-462f-bdc7-0365835dea40	520000.00	2026-02-15	\N	Imported from Excel Row 372	2026-02-15 12:32:27.593446+03	2026-02-15 12:32:27.593446+03	paid	cash	[]
5ca08f5a-2342-4cbd-b9a2-e8db31fc9100	bdca3836-1953-49e3-8583-8f03c98f67b9	746000.00	2026-02-15	\N	Imported from Excel Row 373	2026-02-15 12:32:27.594394+03	2026-02-15 12:32:27.594394+03	paid	cash	[]
a405b685-3163-4406-8f69-15f8886bbf8a	414986b2-b371-4f64-a1cc-4e47cd4f9327	275000.00	2026-02-15	\N	Imported from Excel Row 374	2026-02-15 12:32:27.595312+03	2026-02-15 12:32:27.595312+03	paid	cash	[]
3cc75561-1c21-45cc-a59e-fbde4c8646a3	9b9d1627-edb1-4213-92dd-495c288fc7c4	390000.00	2026-02-15	\N	Imported from Excel Row 375	2026-02-15 12:32:27.596303+03	2026-02-15 12:32:27.596303+03	paid	cash	[]
0e0bd91d-f0ae-4517-9458-3ce2a268a206	ef84be8a-27ac-479c-911f-6c9b2532e0ef	650000.00	2026-02-15	\N	Imported from Excel Row 381	2026-02-15 12:32:27.597344+03	2026-02-15 12:32:27.597344+03	paid	cash	[]
c12af249-430b-434c-bc81-331be39c6d85	fde8928f-21a7-4e72-b02d-c60047abc598	650000.00	2026-02-15	\N	Imported from Excel Row 382	2026-02-15 12:32:27.598284+03	2026-02-15 12:32:27.598284+03	paid	cash	[]
7ecfb2be-1615-4365-8f87-2eac25ce4bb4	f374b008-3e16-447c-89ff-4cc84b573bfd	660000.00	2026-02-15	\N	Imported from Excel Row 383	2026-02-15 12:32:27.599276+03	2026-02-15 12:32:27.599276+03	paid	cash	[]
0f434465-67cf-4f7f-a08f-3f6c8d0fa50c	b7be506a-d022-4153-a037-71d82b10435d	650000.00	2026-02-15	\N	Imported from Excel Row 384	2026-02-15 12:32:27.600101+03	2026-02-15 12:32:27.600101+03	paid	cash	[]
42dcfd7c-f54a-44ed-973b-eef8ba5cfd1e	211b2218-9cc9-491b-92a0-fbc5b8446c70	542000.00	2026-02-15	\N	Imported from Excel Row 385	2026-02-15 12:32:27.600916+03	2026-02-15 12:32:27.600916+03	paid	cash	[]
d5582d6b-9dd1-4563-b377-27068257f355	584e247f-f0ac-4f92-bd5a-2d3ada7cfe1d	683000.00	2026-02-15	\N	Imported from Excel Row 386	2026-02-15 12:32:27.601765+03	2026-02-15 12:32:27.601765+03	paid	cash	[]
b68e8c09-f890-43e4-88ad-caf56e423d2f	870faf74-2aaa-42b3-b1bf-672c07c2e2f7	694000.00	2026-02-15	\N	Imported from Excel Row 387	2026-02-15 12:32:27.602599+03	2026-02-15 12:32:27.602599+03	paid	cash	[]
5bd9f59e-88e7-4b03-b261-b2b5f271a249	d13b321e-6f57-4d36-8519-4ad05dc860e9	519000.00	2026-02-15	\N	Imported from Excel Row 388	2026-02-15 12:32:27.603371+03	2026-02-15 12:32:27.603371+03	paid	cash	[]
cd315562-3508-44d4-b0b0-0dc3f3e0cf30	730342f6-3ae8-41e3-b63a-49c7005451f1	679000.00	2026-02-15	\N	Imported from Excel Row 389	2026-02-15 12:32:27.605011+03	2026-02-15 12:32:27.605011+03	paid	cash	[]
8d5b4a51-e570-42dc-b414-515f7260fc8c	08c93ffe-27f0-47ac-9815-7432cf9eb434	677000.00	2026-02-15	\N	Imported from Excel Row 406	2026-02-15 12:32:27.606078+03	2026-02-15 12:32:27.606078+03	paid	cash	[]
49644c75-ee92-4775-b88e-ef637ef9ae6e	d7e9d206-a378-4fa0-9e62-0aafba0588df	650000.00	2026-02-15	\N	Imported from Excel Row 407	2026-02-15 12:32:27.606885+03	2026-02-15 12:32:27.606885+03	paid	cash	[]
9ebf49a1-5d75-4480-8a05-51dee25d2602	04117a48-8871-4397-b962-348645a96fc2	650000.00	2026-02-15	\N	Imported from Excel Row 408	2026-02-15 12:32:27.607678+03	2026-02-15 12:32:27.607678+03	paid	cash	[]
95c25053-667a-4205-abeb-6019774b5fec	fd56e7b5-5b04-4003-89b2-a7cae5cf65ba	650000.00	2026-02-15	\N	Imported from Excel Row 409	2026-02-15 12:32:27.608491+03	2026-02-15 12:32:27.608491+03	paid	cash	[]
203da7e4-3516-4a8b-abe4-eaafa0064874	b471324d-31c8-4d5d-a02c-a43d995480e9	650000.00	2026-02-15	\N	Imported from Excel Row 410	2026-02-15 12:32:27.609251+03	2026-02-15 12:32:27.609251+03	paid	cash	[]
84602ab1-77ec-417c-99d7-cfa644d4e1f4	177c3af0-66fe-419a-a18d-707fc555ad9a	1146000.00	2026-02-15	\N	Imported from Excel Row 418	2026-02-15 12:32:27.610322+03	2026-02-15 12:32:27.610322+03	paid	cash	[]
dba80c33-ea75-4112-a004-05e3e43b9290	05eca129-20c6-4e42-a40a-3b6c79154bc9	1347000.00	2026-02-15	\N	Imported from Excel Row 419	2026-02-15 12:32:27.611653+03	2026-02-15 12:32:27.611653+03	paid	cash	[]
d7da2873-2984-4c4d-bbd7-ec261167b569	f56bb33f-95f7-4759-b7c1-67a6e409e430	120000.00	2026-02-15	\N	Imported from Excel Row 420	2026-02-15 12:32:27.612928+03	2026-02-15 12:32:27.612928+03	paid	cash	[]
287fd47d-bea2-4b39-80d5-cff2dcab85b6	d2bba826-3eed-4af3-ac6d-d7ad0339d66d	1444000.00	2026-02-15	\N	Imported from Excel Row 421	2026-02-15 12:32:27.613869+03	2026-02-15 12:32:27.613869+03	paid	cash	[]
66c31da2-22b0-4039-8575-e9282b30b7a0	5c24f323-a6f8-41ac-b7c2-2c196f8375f6	567000.00	2026-02-15	\N	Imported from Excel Row 430	2026-02-15 12:32:27.615089+03	2026-02-15 12:32:27.615089+03	paid	cash	[]
c218f613-6fd7-462d-963e-229cfdc14cfc	03b7ff49-1998-49c6-b105-adff249285df	569000.00	2026-02-15	\N	Imported from Excel Row 431	2026-02-15 12:32:27.616122+03	2026-02-15 12:32:27.616122+03	paid	cash	[]
7e665d32-23df-407c-bdcd-4670d08fd084	b595c00b-ea8f-4da4-8a4b-516d5e9354a6	570000.00	2026-02-15	\N	Imported from Excel Row 432	2026-02-15 12:32:27.617074+03	2026-02-15 12:32:27.617074+03	paid	cash	[]
6e7f6fd5-4a84-4821-9566-61d599184511	13bd4907-4a1e-43a5-80d2-ae43e5ac1e5b	600000.00	2026-02-15	\N	Imported from Excel Row 433	2026-02-15 12:32:27.617897+03	2026-02-15 12:32:27.617897+03	paid	cash	[]
1924a470-113c-4728-9e12-04ce2d5c3f0d	0b379f4b-b2bc-4f84-8a8a-df8f82240742	633000.00	2026-02-15	\N	Imported from Excel Row 434	2026-02-15 12:32:27.618652+03	2026-02-15 12:32:27.618652+03	paid	cash	[]
b7221501-6e48-4cf7-8661-99122b0dcf1d	7a3d59f1-15c6-4615-a790-4ff716271c90	600000.00	2026-02-15	\N	Imported from Excel Row 435	2026-02-15 12:32:27.619469+03	2026-02-15 12:32:27.619469+03	paid	cash	[]
7aff0d5a-9fdf-4822-a244-c74fce5d90f1	75dafe12-d24c-4347-b244-5112e6b9baba	1082000.00	2026-02-15	\N	Imported from Excel Row 446	2026-02-15 12:32:27.620565+03	2026-02-15 12:32:27.620565+03	paid	cash	[]
c3c4e5e4-f4e6-4030-9fa4-5d56d0ea6d66	b389d195-9cdc-48fd-93f5-12a0eca461e4	964000.00	2026-02-15	\N	Imported from Excel Row 448	2026-02-15 12:32:27.621423+03	2026-02-15 12:32:27.621423+03	paid	cash	[]
158f7908-093a-4fea-bdab-ec5055626826	7f2e4270-8d07-4eb8-823f-d1b4cc1d5b89	181000.00	2026-02-15	\N	Imported from Excel Row 457	2026-02-15 12:32:27.622388+03	2026-02-15 12:32:27.622388+03	paid	cash	[]
6201e66b-7cf5-4f3b-8de7-be34c1e849e5	d051b80c-74c2-4c58-9bae-5882fa6035cd	218000.00	2026-02-15	\N	Imported from Excel Row 458	2026-02-15 12:32:27.623202+03	2026-02-15 12:32:27.623202+03	paid	cash	[]
d3b9c09e-d02c-453b-9724-f0f8eb9cba43	f1bc5552-df0b-4a59-b38e-e5b55cf8b24d	128000.00	2026-02-15	\N	Imported from Excel Row 459	2026-02-15 12:32:27.623988+03	2026-02-15 12:32:27.623988+03	paid	cash	[]
02c4b2b1-7cd8-49e3-97e1-5fe495f76aaf	277e85c1-880a-4e65-9bc1-5ed0cdbc7525	181000.00	2026-02-15	\N	Imported from Excel Row 460	2026-02-15 12:32:27.62489+03	2026-02-15 12:32:27.62489+03	paid	cash	[]
705329be-621d-4a56-89ac-e5dc1f55a196	cd163dae-8f4a-49ce-97b9-57628f3bf46e	530000.00	2026-02-15	\N	Imported from Excel Row 482	2026-02-15 12:32:27.626028+03	2026-02-15 12:32:27.626028+03	paid	cash	[]
2c9b46e6-2680-448a-a29c-ff343b1b9311	e8d032dc-8641-4d0e-8e38-884c474bc69d	536000.00	2026-02-15	\N	Imported from Excel Row 483	2026-02-15 12:32:27.626957+03	2026-02-15 12:32:27.626957+03	paid	cash	[]
ebd2df70-0c8a-4eba-8c06-8aed843ceb44	cc68f34f-756f-4371-ae43-a99ffc5c8d52	677000.00	2026-02-15	\N	Imported from Excel Row 488	2026-02-15 12:32:27.628178+03	2026-02-15 12:32:27.628178+03	paid	cash	[]
0b25ada4-55a6-474c-ba6c-74b3350bd4d5	30af0130-edc8-4e48-a280-2106fc5d00dd	677000.00	2026-02-15	\N	Imported from Excel Row 489	2026-02-15 12:32:27.629238+03	2026-02-15 12:32:27.629238+03	paid	cash	[]
b38451cf-a6cd-422a-b496-2373dcafe2d8	f91677e8-a0a9-4d42-9e27-990b4ec339b2	670000.00	2026-02-15	\N	Imported from Excel Row 516	2026-02-15 12:32:27.630562+03	2026-02-15 12:32:27.630562+03	paid	cash	[]
871cb960-7570-4f08-be97-0ad98aeeb8f2	ed162294-3ace-4458-991d-ccc6d6125877	999000.00	2026-02-15	\N	Imported from Excel Row 535	2026-02-15 12:32:27.631922+03	2026-02-15 12:32:27.631922+03	paid	cash	[]
5e9e9877-2c6b-4cee-8791-f5e1218d75b8	15176c2e-0eb8-4778-97a3-e12facf51b67	90000.00	2026-02-15	\N	Imported from Excel Row 542	2026-02-15 12:32:27.632978+03	2026-02-15 12:32:27.632978+03	paid	cash	[]
dabc965a-3656-4076-8ea2-5c3dbc4fa943	b1167341-3fcb-4d21-80f8-9e024b364d2d	695000.00	2026-02-15	\N	Imported from Excel Row 547	2026-02-15 12:32:27.634081+03	2026-02-15 12:32:27.634081+03	paid	cash	[]
85de761b-8a5e-456b-97da-e1d9ec26525b	5cd35e13-482c-4217-83d0-bb73891a842b	627000.00	2026-02-15	\N	Imported from Excel Row 548	2026-02-15 12:32:27.634895+03	2026-02-15 12:32:27.634895+03	paid	cash	[]
0eb23f81-352a-4212-8cf2-a310d189712b	63fdf744-b03b-4397-9f23-019c51128b0e	10000.00	2026-02-15	\N	Imported from Excel Row 552	2026-02-15 12:32:27.635725+03	2026-02-15 12:32:27.635725+03	paid	cash	[]
998742ed-190f-493e-bc15-d76225b13735	37795e47-7c11-4687-9505-9d53ba2e569c	50000.00	2026-02-15	\N	Imported from Excel Row 554	2026-02-15 12:32:27.636526+03	2026-02-15 12:32:27.636526+03	paid	cash	[]
ab2cbac0-38c8-493d-9dde-e88f5a220e41	9d6cd0f5-3042-4987-89ec-0c12960390e8	40000.00	2026-02-15	\N	Imported from Excel Row 570	2026-02-15 12:32:27.637623+03	2026-02-15 12:32:27.637623+03	paid	cash	[]
9d5b0ef8-642b-42d8-965e-9ba996291a61	6ddaa26f-8793-4a69-a085-6b5a67df25d8	810000.00	2026-02-15	\N	Imported from Excel Row 577	2026-02-15 12:32:27.638801+03	2026-02-15 12:32:27.638801+03	paid	cash	[]
0cddfe9e-7781-49f7-9158-9412c399b55c	6ec2e666-576f-41fd-b448-83af7edd0e34	918000.00	2026-02-15	\N	Imported from Excel Row 588	2026-02-15 12:32:27.639869+03	2026-02-15 12:32:27.639869+03	paid	cash	[]
1915ff6e-b820-4ae4-80d8-8076577719ef	ea759525-fadc-495a-999a-ce58adfde415	703000.00	2026-02-15	\N	Imported from Excel Row 589	2026-02-15 12:32:27.640653+03	2026-02-15 12:32:27.640653+03	paid	cash	[]
f2803546-18c4-429e-87d1-007e5ea36177	53ff958a-232c-4686-a03c-1fb5c7a697fe	690000.00	2026-02-15	\N	Imported from Excel Row 593	2026-02-15 12:32:27.641524+03	2026-02-15 12:32:27.641524+03	paid	cash	[]
71211dea-cab0-4dbc-b6fd-981e47c47cb3	2be3cec2-d3af-4f50-8297-1bad3e9d4919	70000.00	2026-02-15	\N	Imported from Excel Row 600	2026-02-15 12:32:27.64305+03	2026-02-15 12:32:27.64305+03	paid	cash	[]
653a9ccb-1675-497d-a342-f205bfcab013	e71dff5d-bef5-4736-a676-f134fed5a5d9	70000.00	2026-02-15	\N	Imported from Excel Row 601	2026-02-15 12:32:27.644496+03	2026-02-15 12:32:27.644496+03	paid	cash	[]
656a4b53-23c0-4239-b09e-7aa314ab873a	41f3d8ef-aa0b-40a6-8a03-fb2117ad6245	105000.00	2026-02-15	\N	Imported from Excel Row 602	2026-02-15 12:32:27.645568+03	2026-02-15 12:32:27.645568+03	paid	cash	[]
0f75973b-19e1-4685-9fda-6ae3fdcd97ae	57fcd618-ea95-468a-aaf3-e68a3494ab19	105000.00	2026-02-15	\N	Imported from Excel Row 603	2026-02-15 12:32:27.64654+03	2026-02-15 12:32:27.64654+03	paid	cash	[]
4a90beb7-2f87-4dc5-ad81-83b5f0e6489d	553e8e22-5b12-4a2e-8a97-317d2c0b6348	650000.00	2026-02-15	\N	Imported from Excel Row 604	2026-02-15 12:32:27.647355+03	2026-02-15 12:32:27.647355+03	paid	cash	[]
06762814-3b77-450d-a539-dc7bf7fc9e21	890f925e-6480-4f57-9313-0b5c8f978503	650000.00	2026-02-15	\N	Imported from Excel Row 605	2026-02-15 12:32:27.648212+03	2026-02-15 12:32:27.648212+03	paid	cash	[]
daefb5bd-842a-4665-9a8f-8f5ef43a347f	53d78c3b-aa0b-40f6-b6cb-8e8e94b36a8b	650000.00	2026-02-15	\N	Imported from Excel Row 606	2026-02-15 12:32:27.649053+03	2026-02-15 12:32:27.649053+03	paid	cash	[]
0349fb00-0d9f-4a5d-ba20-ce6996ce02e9	c2215823-ef9a-49ad-a284-38d3ce1a6583	650000.00	2026-02-15	\N	Imported from Excel Row 607	2026-02-15 12:32:27.649883+03	2026-02-15 12:32:27.649883+03	paid	cash	[]
a18f5cd4-de1e-49b5-9f04-99be6bfab24b	56293d39-592e-47f7-b60e-d166d67e350b	650000.00	2026-02-15	\N	Imported from Excel Row 608	2026-02-15 12:32:27.650731+03	2026-02-15 12:32:27.650731+03	paid	cash	[]
c3a5a6a3-4907-4150-997d-e985913953ef	4fada97f-a714-400b-abd0-c6f540de158d	700500.00	2026-02-15	\N	Imported from Excel Row 609	2026-02-15 12:32:27.651599+03	2026-02-15 12:32:27.651599+03	paid	cash	[]
5a9a4f03-aa65-4e3c-8049-801ecfade38a	b32ee15c-59de-45b5-82f9-13c2be12e01b	621000.00	2026-02-15	\N	Imported from Excel Row 610	2026-02-15 12:32:27.652468+03	2026-02-15 12:32:27.652468+03	paid	cash	[]
2086c0c9-ce8c-4389-ba94-ddfb7e94ad13	2594f69e-916d-4c3e-9b8b-bf6107259798	498000.00	2026-02-15	\N	Imported from Excel Row 611	2026-02-15 12:32:27.65356+03	2026-02-15 12:32:27.65356+03	paid	cash	[]
48a04ee2-97ab-4682-bd7c-4b1bbec9253c	32d78998-3be7-483a-a811-65f717462932	506000.00	2026-02-15	\N	Imported from Excel Row 612	2026-02-15 12:32:27.654516+03	2026-02-15 12:32:27.654516+03	paid	cash	[]
f8cb4a4d-49da-46f0-ac1b-a88cc3eceea4	a88b4a49-49c2-48c8-a054-bc339aa1bf4d	459000.00	2026-02-15	\N	Imported from Excel Row 613	2026-02-15 12:32:27.655387+03	2026-02-15 12:32:27.655387+03	paid	cash	[]
dec6ae07-2f05-40ec-ade0-867ed9f5c5e6	a2171cf5-c35c-409b-b057-ac15829cc0bf	497000.00	2026-02-15	\N	Imported from Excel Row 614	2026-02-15 12:32:27.656267+03	2026-02-15 12:32:27.656267+03	paid	cash	[]
0e3eade6-2316-4206-947f-1fa38624f6cd	a91d97b8-d6a5-4054-b834-b8e74a928a7d	528000.00	2026-02-15	\N	Imported from Excel Row 615	2026-02-15 12:32:27.657155+03	2026-02-15 12:32:27.657155+03	paid	cash	[]
21a80031-67dc-45a7-909b-d7f1555595ae	81173d66-0596-4228-9963-df61d14d096a	650000.00	2026-02-15	\N	Imported from Excel Row 616	2026-02-15 12:32:27.65803+03	2026-02-15 12:32:27.65803+03	paid	cash	[]
d4c0007a-5213-4345-bde2-dd0d8b3b0ae8	a1e9341c-1c5b-480f-941d-9cc5fd938253	542000.00	2026-02-15	\N	Imported from Excel Row 617	2026-02-15 12:32:27.659044+03	2026-02-15 12:32:27.659044+03	paid	cash	[]
2605fc9a-730c-4ce8-b861-e14eed3c9ca0	c1945641-c587-461a-9d35-346f6124e69d	594000.00	2026-02-15	\N	Imported from Excel Row 618	2026-02-15 12:32:27.660104+03	2026-02-15 12:32:27.660104+03	paid	cash	[]
9b01e066-0597-4f92-adf2-6abc80fa0161	a452472c-d392-4480-a7e4-b71747fd1ac2	615000.00	2026-02-15	\N	Imported from Excel Row 619	2026-02-15 12:32:27.661134+03	2026-02-15 12:32:27.661134+03	paid	cash	[]
9b66061b-4202-4106-862f-44d0702af379	dc511a65-f5bc-4759-a0b4-3dd947aa2e13	621000.00	2026-02-15	\N	Imported from Excel Row 621	2026-02-15 12:32:27.662225+03	2026-02-15 12:32:27.662225+03	paid	cash	[]
367ac4c6-e27d-4011-9827-1f0fdeee7f16	1d6e33a9-e62b-42b4-83a4-7c190da68c12	650000.00	2026-02-15	\N	Imported from Excel Row 622	2026-02-15 12:32:27.664946+03	2026-02-15 12:32:27.664946+03	paid	cash	[]
59ed02fc-d830-4062-bed2-ef28e4e83ce8	e4108d76-c15f-45e6-8ff3-a8cb61014f66	650000.00	2026-02-15	\N	Imported from Excel Row 623	2026-02-15 12:32:27.666408+03	2026-02-15 12:32:27.666408+03	paid	cash	[]
e86b32c5-5923-4fd5-86fb-b9f79bd10ec1	de9422ef-b147-4c5f-9440-3d17cf7255b1	660000.00	2026-02-15	\N	Imported from Excel Row 624	2026-02-15 12:32:27.667772+03	2026-02-15 12:32:27.667772+03	paid	cash	[]
0f6a26a8-413d-4fbb-9859-b9b5496ae79e	e2883d2d-0c99-4c0f-9bc4-1efd5a9b4478	592000.00	2026-02-15	\N	Imported from Excel Row 625	2026-02-15 12:32:27.668778+03	2026-02-15 12:32:27.668778+03	paid	cash	[]
9defa520-4bff-44a4-a7ab-a875bb9dc10e	0a43905d-4829-427e-95d2-06da5f58a2e1	623000.00	2026-02-15	\N	Imported from Excel Row 626	2026-02-15 12:32:27.669694+03	2026-02-15 12:32:27.669694+03	paid	cash	[]
db4639d4-10e9-4e5f-8519-4d71db330cf8	ead8827a-e441-464d-b43c-e17c7f5062f1	650000.00	2026-02-15	\N	Imported from Excel Row 627	2026-02-15 12:32:27.671011+03	2026-02-15 12:32:27.671011+03	paid	cash	[]
c7a23b31-1465-49f9-996e-09dded9bd91d	9b443429-2098-4c95-aba7-a8b2ccb5026a	650000.00	2026-02-15	\N	Imported from Excel Row 628	2026-02-15 12:32:27.672086+03	2026-02-15 12:32:27.672086+03	paid	cash	[]
018fe7d6-c4b8-4ec3-9992-9a4d3ebe2f5b	7f7d255e-9647-4b5a-a06f-c8f1d4f15609	650000.00	2026-02-15	\N	Imported from Excel Row 629	2026-02-15 12:32:27.6729+03	2026-02-15 12:32:27.6729+03	paid	cash	[]
a60c5dcd-c940-470b-9347-693478f11175	61c6e18f-33dc-4084-a87c-693788ed5df7	650000.00	2026-02-15	\N	Imported from Excel Row 630	2026-02-15 12:32:27.673653+03	2026-02-15 12:32:27.673653+03	paid	cash	[]
f10289cb-2d57-4eb4-a8e7-28477963d04b	f023148b-8922-47a1-b674-dd456570d587	620000.00	2026-02-15	\N	Imported from Excel Row 631	2026-02-15 12:32:27.674654+03	2026-02-15 12:32:27.674654+03	paid	cash	[]
d0b48f26-e512-406a-8e31-0efeb02e97eb	e4b39db8-35af-4f69-a265-67b8823a8590	635000.00	2026-02-15	\N	Imported from Excel Row 632	2026-02-15 12:32:27.67584+03	2026-02-15 12:32:27.67584+03	paid	cash	[]
67255b02-8cab-42a5-88f6-2f0817986b19	76d60734-bfce-4247-b5c5-2d51d7b08052	621000.00	2026-02-15	\N	Imported from Excel Row 633	2026-02-15 12:32:27.676977+03	2026-02-15 12:32:27.676977+03	paid	cash	[]
16a39b6c-bd06-4a80-98dc-4080e50a821c	ccc45747-bbec-40ca-a0bb-01f7517e6cf2	650000.00	2026-02-15	\N	Imported from Excel Row 634	2026-02-15 12:32:27.678195+03	2026-02-15 12:32:27.678195+03	paid	cash	[]
9c2c8697-6683-4a46-8ce7-8e785b3a44e0	fbaac12b-9ef4-4fb8-a43c-1d6eb88a8dff	661000.00	2026-02-15	\N	Imported from Excel Row 635	2026-02-15 12:32:27.679062+03	2026-02-15 12:32:27.679062+03	paid	cash	[]
4d825a0d-0fba-4add-8066-d989a9334820	4ba14516-0c10-4ddf-9964-c529eb520ae5	439000.00	2026-02-15	\N	Imported from Excel Row 636	2026-02-15 12:32:27.679918+03	2026-02-15 12:32:27.679918+03	paid	cash	[]
9a7090d4-7e65-4e68-b037-d0a430b0d764	7a1c5e10-c399-439c-aaaf-b2a2a0f692eb	520000.00	2026-02-15	\N	Imported from Excel Row 637	2026-02-15 12:32:27.680675+03	2026-02-15 12:32:27.680675+03	paid	cash	[]
e164d837-19dd-452f-8580-d878a2fd2882	ca9f7816-54bc-4343-8bf8-9af5dd7b6376	650000.00	2026-02-15	\N	Imported from Excel Row 638	2026-02-15 12:32:27.681408+03	2026-02-15 12:32:27.681408+03	paid	cash	[]
36a86482-c552-431e-82a1-8793fc75d1d8	1c5563b5-eb81-4b2e-93e1-cf933021255c	1110500.00	2026-02-15	\N	Imported from Excel Row 640	2026-02-15 12:32:27.682226+03	2026-02-15 12:32:27.682226+03	paid	cash	[]
d45a2828-ce85-4e64-8c5e-7cfee29bdd79	226875cc-9601-48a3-bcff-87cd04fee301	54000.00	2026-02-15	\N	Imported from Excel Row 642	2026-02-15 12:32:27.683213+03	2026-02-15 12:32:27.683213+03	paid	cash	[]
cafa3677-d00a-4f44-a458-934ce1bd4015	174271e6-136e-45f5-9c14-993cd2e2c2ff	701000.00	2026-02-15	\N	Imported from Excel Row 643	2026-02-15 12:32:27.684046+03	2026-02-15 12:32:27.684046+03	paid	cash	[]
b1c43bdd-83b3-4fd3-9834-83c56357887d	a626ff02-0bc3-4b9b-9e9f-41b6d122f51d	672000.00	2026-02-15	\N	Imported from Excel Row 644	2026-02-15 12:32:27.684845+03	2026-02-15 12:32:27.684845+03	paid	cash	[]
edfe9777-1ca0-4481-89a1-b55630561a7a	3726f272-9dd2-4dd6-8e75-825bb08614e1	675000.00	2026-02-15	\N	Imported from Excel Row 645	2026-02-15 12:32:27.685571+03	2026-02-15 12:32:27.685571+03	paid	cash	[]
cf348c3e-3d22-4f21-933b-988e93f815bc	36ba7810-0ae5-4217-b0a0-8f1cf6f2ad8d	690000.00	2026-02-15	\N	Imported from Excel Row 646	2026-02-15 12:32:27.686447+03	2026-02-15 12:32:27.686447+03	paid	cash	[]
88cd40b3-7d5d-4f1a-94a8-a6764d7e3601	10254d98-1893-42f4-8ac0-9bf3094d70b9	678000.00	2026-02-15	\N	Imported from Excel Row 647	2026-02-15 12:32:27.687168+03	2026-02-15 12:32:27.687168+03	paid	cash	[]
a0a1c383-ccc8-450d-af76-a88fed9c971a	df2075fe-2470-447e-9242-8d911add150b	675000.00	2026-02-15	\N	Imported from Excel Row 648	2026-02-15 12:32:27.688019+03	2026-02-15 12:32:27.688019+03	paid	cash	[]
607b1e03-21c9-4421-bff6-02d1165943a4	99833a2b-ae3c-4754-a4f6-45d3ee5d62b3	675000.00	2026-02-15	\N	Imported from Excel Row 649	2026-02-15 12:32:27.688789+03	2026-02-15 12:32:27.688789+03	paid	cash	[]
d142dc89-d257-412c-ab95-42cced1a5951	76d91c02-945a-4433-b71c-e1ff98f1f39f	675000.00	2026-02-15	\N	Imported from Excel Row 650	2026-02-15 12:32:27.689569+03	2026-02-15 12:32:27.689569+03	paid	cash	[]
c1ee7684-7420-41af-883c-067d7c7ac9f6	3669e297-e88e-4808-aa5e-78da11487aae	675000.00	2026-02-15	\N	Imported from Excel Row 651	2026-02-15 12:32:27.690579+03	2026-02-15 12:32:27.690579+03	paid	cash	[]
2cdc8bcf-3d20-478a-ad17-b84b0c9b0d4a	12d1dbe4-b26d-4c60-a8f2-e172a8df6a26	675000.00	2026-02-15	\N	Imported from Excel Row 652	2026-02-15 12:32:27.691577+03	2026-02-15 12:32:27.691577+03	paid	cash	[]
6a6b5dd0-24af-494c-a694-50b5ae3f88ff	e3ec23f0-3d90-44cd-8183-4d0b956dcf75	650000.00	2026-02-15	\N	Imported from Excel Row 653	2026-02-15 12:32:27.692665+03	2026-02-15 12:32:27.692665+03	paid	cash	[]
8bc16d1c-1e39-45ab-8f3c-63296c3b7ff7	68d579e1-bc82-4014-969e-c5187a68f889	650000.00	2026-02-15	\N	Imported from Excel Row 654	2026-02-15 12:32:27.693755+03	2026-02-15 12:32:27.693755+03	paid	cash	[]
4396f526-c24f-4c1d-8f47-0e1682d7ca9d	1d09ba40-19cb-4662-9db8-0ae94b12147c	650000.00	2026-02-15	\N	Imported from Excel Row 655	2026-02-15 12:32:27.694841+03	2026-02-15 12:32:27.694841+03	paid	cash	[]
7ff885c0-b122-4185-a02e-234dd6a5064a	28fbd84c-a219-46d0-a994-09f020795bbb	650000.00	2026-02-15	\N	Imported from Excel Row 656	2026-02-15 12:32:27.696209+03	2026-02-15 12:32:27.696209+03	paid	cash	[]
4c926ea7-85d3-4603-8608-1e4e3d1164a0	16933078-b5cc-46d4-9284-568c882a2c94	650000.00	2026-02-15	\N	Imported from Excel Row 657	2026-02-15 12:32:27.697573+03	2026-02-15 12:32:27.697573+03	paid	cash	[]
49b07f20-1cfc-4af8-8df7-e231ca0f4778	918d64f7-bc19-4635-84f3-aa5edd881dd8	681000.00	2026-02-15	\N	Imported from Excel Row 658	2026-02-15 12:32:27.700257+03	2026-02-15 12:32:27.700257+03	paid	cash	[]
57840ca1-2d64-43e7-80cd-91706ff68074	f086a38a-9228-4fc0-9945-d4ea05a8e2d4	696000.00	2026-02-15	\N	Imported from Excel Row 659	2026-02-15 12:32:27.702289+03	2026-02-15 12:32:27.702289+03	paid	cash	[]
48a855e3-17ca-4ef5-8c7e-eccb3d0f612b	b44657a8-cecc-4c41-9bcb-41bf064573aa	675000.00	2026-02-15	\N	Imported from Excel Row 660	2026-02-15 12:32:27.703492+03	2026-02-15 12:32:27.703492+03	paid	cash	[]
3041ab39-5fb0-4c65-8807-bad3ee53f460	44f86df9-688b-48fc-85b4-2471321ac3d0	681000.00	2026-02-15	\N	Imported from Excel Row 661	2026-02-15 12:32:27.704466+03	2026-02-15 12:32:27.704466+03	paid	cash	[]
97a22605-9699-45b0-8d16-e643298ba460	0ff41d52-6125-4a94-b0eb-89e525279424	672000.00	2026-02-15	\N	Imported from Excel Row 662	2026-02-15 12:32:27.705417+03	2026-02-15 12:32:27.705417+03	paid	cash	[]
01e922cb-5f5d-4fce-8e82-a667fc91bf44	68025eb0-85aa-449e-a393-276d8d60b513	1312000.00	2026-02-15	\N	Imported from Excel Row 663	2026-02-15 12:32:27.706456+03	2026-02-15 12:32:27.706456+03	paid	cash	[]
d667b045-c7ec-40e9-baf1-54817ef054a7	0a981e56-601f-4b9a-9b44-2e73d28ed2a4	693000.00	2026-02-15	\N	Imported from Excel Row 665	2026-02-15 12:32:27.707601+03	2026-02-15 12:32:27.707601+03	paid	cash	[]
d00b472b-bad5-471f-827c-70ce90c9e8b5	d938eaa9-181a-4433-9fff-decf489b6de0	30000.00	2026-02-15	\N	Imported from Excel Row 667	2026-02-15 12:32:27.708819+03	2026-02-15 12:32:27.708819+03	paid	cash	[]
c4b73386-d0de-48d8-bd1c-997d3009d45a	f93583c9-cd68-4a04-9653-7ae7ce265d5d	690000.00	2026-02-15	\N	Imported from Excel Row 670	2026-02-15 12:32:27.710178+03	2026-02-15 12:32:27.710178+03	paid	cash	[]
083aef8b-6397-4148-9a00-2d0760ab1f61	c526f89b-05e6-4271-a6d9-e1ed43b91e7c	691000.00	2026-02-15	\N	Imported from Excel Row 671	2026-02-15 12:32:27.713333+03	2026-02-15 12:32:27.713333+03	paid	cash	[]
218af6c2-b581-4fa9-acd5-1a62fd6ed886	45767641-983b-480a-8a1d-0cb6d2615175	691000.00	2026-02-15	\N	Imported from Excel Row 672	2026-02-15 12:32:27.714519+03	2026-02-15 12:32:27.714519+03	paid	cash	[]
432db9c6-e4c1-4ec6-bef9-5467581bb879	3fb8c986-9d88-40a5-8101-e2e9cfaab7dc	691000.00	2026-02-15	\N	Imported from Excel Row 673	2026-02-15 12:32:27.715477+03	2026-02-15 12:32:27.715477+03	paid	cash	[]
44279d34-9909-4a24-af93-0fd3d2e9a2e9	84a6a025-039d-4db7-bf44-b5a770590e69	594000.00	2026-02-15	\N	Imported from Excel Row 674	2026-02-15 12:32:27.716518+03	2026-02-15 12:32:27.716518+03	paid	cash	[]
89679957-f36c-4e0c-8bc4-a5c7a53d8c48	87f49195-a984-4590-b384-06e49f1abc9c	621000.00	2026-02-15	\N	Imported from Excel Row 675	2026-02-15 12:32:27.717446+03	2026-02-15 12:32:27.717446+03	paid	cash	[]
d24b2f33-a874-4d7f-9c6d-cf0cedd692b7	864c6d4e-8f79-40ec-9996-3680114c3378	621000.00	2026-02-15	\N	Imported from Excel Row 676	2026-02-15 12:32:27.718414+03	2026-02-15 12:32:27.718414+03	paid	cash	[]
3aecd6dc-f7fa-40d2-a9a5-3ffd599d96a5	ee3754d5-643b-4b82-bb96-bb0caa15361e	10000.00	2026-02-15	\N	Imported from Excel Row 678	2026-02-15 12:32:27.719436+03	2026-02-15 12:32:27.719436+03	paid	cash	[]
b04d85a1-aa1b-46d1-a654-e8694e817c9a	48934361-b228-4a13-9e4d-ba72f782f260	40000.00	2026-02-15	\N	Imported from Excel Row 680	2026-02-15 12:32:27.720421+03	2026-02-15 12:32:27.720421+03	paid	cash	[]
8db9d744-ffbc-4907-994b-b8594b56e4ab	51ca084c-b984-488d-af70-6b08b835bcfc	543000.00	2026-02-15	\N	Imported from Excel Row 681	2026-02-15 12:32:27.721569+03	2026-02-15 12:32:27.721569+03	paid	cash	[]
fb779af9-dcdb-4329-8c26-40beb9529010	93576b7c-40cc-4a5e-b7f3-426c62e3b620	551750.00	2026-02-15	\N	Imported from Excel Row 682	2026-02-15 12:32:27.722537+03	2026-02-15 12:32:27.722537+03	paid	cash	[]
51a0c9ad-7966-4d19-bfca-541fe5306d3a	ce41dbab-d5bb-4680-bb78-200ba7dad71f	414875.00	2026-02-15	\N	Imported from Excel Row 683	2026-02-15 12:32:27.723623+03	2026-02-15 12:32:27.723623+03	paid	cash	[]
a0714915-ae90-43be-877c-81ea3badc5bb	faf7972a-f706-469e-bc8c-8e544f464cf1	552500.00	2026-02-15	\N	Imported from Excel Row 684	2026-02-15 12:32:27.724682+03	2026-02-15 12:32:27.724682+03	paid	cash	[]
1f9e78f9-0706-4f8c-a409-20d26c5bc7aa	14611dfa-9bb6-4c9e-b9af-6a9f2af1ce65	369500.00	2026-02-15	\N	Imported from Excel Row 685	2026-02-15 12:32:27.725622+03	2026-02-15 12:32:27.725622+03	paid	cash	[]
ad0482bc-359e-4beb-a64a-b5c8e25fc1b8	b7d2bc57-8285-44e1-9e40-1f6ef42ea2ec	360000.00	2026-02-15	\N	Imported from Excel Row 686	2026-02-15 12:32:27.726594+03	2026-02-15 12:32:27.726594+03	paid	cash	[]
d052f753-8c09-421a-937a-e4a8290b2dc9	0956b03d-203d-46a8-9e89-9b2cc5f8733d	216000.00	2026-02-15	\N	Imported from Excel Row 687	2026-02-15 12:32:27.728077+03	2026-02-15 12:32:27.728077+03	paid	cash	[]
59229cac-7f47-404f-a6f6-04ce0bfd31ea	fa7ad5c5-ea93-45a1-bdc8-a611c287b290	216000.00	2026-02-15	\N	Imported from Excel Row 688	2026-02-15 12:32:27.729741+03	2026-02-15 12:32:27.729741+03	paid	cash	[]
f6ae4ee3-0854-4f82-8511-ce92c9909c3f	6fc8933e-a623-47a2-bfae-5c6594834722	225000.00	2026-02-15	\N	Imported from Excel Row 689	2026-02-15 12:32:27.730954+03	2026-02-15 12:32:27.730954+03	paid	cash	[]
5d9a3aa6-d4ce-410c-b8bd-fe1332fe6f77	8b8f6600-d9d5-49e2-ba3a-f0a15eb5b473	135000.00	2026-02-15	\N	Imported from Excel Row 690	2026-02-15 12:32:27.73195+03	2026-02-15 12:32:27.73195+03	paid	cash	[]
e6cba453-75f7-44be-8561-c7d92af34739	576e31d2-5bfc-4b1e-9068-82b87aa84123	135000.00	2026-02-15	\N	Imported from Excel Row 691	2026-02-15 12:32:27.732724+03	2026-02-15 12:32:27.732724+03	paid	cash	[]
6862dc9f-5701-493b-b88f-694be44c5027	0cdf17f2-3806-4455-9ab1-dbb4add3b844	180000.00	2026-02-15	\N	Imported from Excel Row 692	2026-02-15 12:32:27.733448+03	2026-02-15 12:32:27.733448+03	paid	cash	[]
0828d25d-cfd2-4229-a83e-bac5fc57c414	61538803-83cc-49ec-ba87-5f1e0a5e9602	135000.00	2026-02-15	\N	Imported from Excel Row 693	2026-02-15 12:32:27.734236+03	2026-02-15 12:32:27.734236+03	paid	cash	[]
c040fd9e-779e-49fe-b372-109bec6d2b30	1bcd240b-c023-4e7b-a9ba-e535c64152bf	135000.00	2026-02-15	\N	Imported from Excel Row 694	2026-02-15 12:32:27.735001+03	2026-02-15 12:32:27.735001+03	paid	cash	[]
9ef8ccde-edf1-47f1-a605-2d280a71943f	df28af91-16a8-442f-ab58-e01c1be91757	198000.00	2026-02-15	\N	Imported from Excel Row 695	2026-02-15 12:32:27.735869+03	2026-02-15 12:32:27.735869+03	paid	cash	[]
b1851b38-cf42-484f-adb0-7195cfceb94b	934540bb-97c0-4922-b60c-de7240152f59	243000.00	2026-02-15	\N	Imported from Excel Row 696	2026-02-15 12:32:27.736823+03	2026-02-15 12:32:27.736823+03	paid	cash	[]
9836c8c5-1414-4807-9229-b1546b8fe547	536a1c52-a899-47df-8cf7-e74f3016df7a	148500.00	2026-02-15	\N	Imported from Excel Row 697	2026-02-15 12:32:27.737915+03	2026-02-15 12:32:27.737915+03	paid	cash	[]
d069cfd7-f7a9-45a2-b8fc-25513a8b3f80	21980a51-0d2d-47a8-8bfa-da46eebb9c77	148500.00	2026-02-15	\N	Imported from Excel Row 698	2026-02-15 12:32:27.739239+03	2026-02-15 12:32:27.739239+03	paid	cash	[]
0e859e90-53e7-48e9-9cdf-f255d56a044f	cd8c966b-2191-4640-a93b-5307df34ea05	333000.00	2026-02-15	\N	Imported from Excel Row 699	2026-02-15 12:32:27.740215+03	2026-02-15 12:32:27.740215+03	paid	cash	[]
eb88c542-db01-40cd-9cb8-701033b34262	7517392f-5d39-442a-997a-a833b0e07326	333000.00	2026-02-15	\N	Imported from Excel Row 700	2026-02-15 12:32:27.741287+03	2026-02-15 12:32:27.741287+03	paid	cash	[]
5e24884b-c8e7-4020-956f-4c1a4a2d5312	74c02173-7fa9-4367-be0e-f255076e040c	333000.00	2026-02-15	\N	Imported from Excel Row 701	2026-02-15 12:32:27.742268+03	2026-02-15 12:32:27.742268+03	paid	cash	[]
fd819c00-0438-4be0-9f6a-108a7381e85d	8c726e74-d763-4a68-91b5-c4f826cef6a4	333000.00	2026-02-15	\N	Imported from Excel Row 702	2026-02-15 12:32:27.743353+03	2026-02-15 12:32:27.743353+03	paid	cash	[]
d6e46a7d-0191-4030-9b5a-3ebdac713db8	0bb8ad00-7350-48a8-adf1-ebaacd659917	396000.00	2026-02-15	\N	Imported from Excel Row 703	2026-02-15 12:32:27.744865+03	2026-02-15 12:32:27.744865+03	paid	cash	[]
1f09483e-75f3-410f-a4d7-804d92ea071f	41c96aff-9619-4529-952a-285a5a474415	528000.00	2026-02-15	\N	Imported from Excel Row 704	2026-02-15 12:32:27.746487+03	2026-02-15 12:32:27.746487+03	paid	cash	[]
f773b28f-4bd1-4b49-8c8f-8e55eeb198f4	f7949717-1d4d-4375-99e0-f34e2fe02191	550000.00	2026-02-15	\N	Imported from Excel Row 705	2026-02-15 12:32:27.747472+03	2026-02-15 12:32:27.747472+03	paid	cash	[]
a9d82d66-4049-46db-a67b-6c28de87274b	fabd989a-9d72-4588-8f2f-f1940710e292	675000.00	2026-02-15	\N	Imported from Excel Row 706	2026-02-15 12:32:27.748488+03	2026-02-15 12:32:27.748488+03	paid	cash	[]
\.


--
-- Data for Name: territories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.territories (id, name, description, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_roles (id, user_id, role, created_at) FROM stdin;
2dd83fe1-4464-4c94-ae35-51b46de67e9a	a9c3e1ee-7c5c-4289-b123-575d8bec610f	loan_officer	2026-02-11 15:49:41.269025+03
7e629306-b4d1-4a1b-9895-64f31575d6aa	70e0ab1e-d1e9-40a0-bdf6-373ffcced22e	admin	2026-02-11 15:49:41.395807+03
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types) FROM stdin;
loan-documents	loan-documents	\N	2026-02-11 15:12:30.956033+03	2026-02-11 15:12:30.956033+03	t	f	5242880	{image/jpeg,image/jpg,image/png,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel}
\.


--
-- Name: users auth_users_email_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT auth_users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: asset_valuations asset_valuations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_valuations
    ADD CONSTRAINT asset_valuations_pkey PRIMARY KEY (id);


--
-- Name: branch_performance branch_performance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_performance
    ADD CONSTRAINT branch_performance_pkey PRIMARY KEY (id);


--
-- Name: branches branches_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_code_key UNIQUE (code);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: collateral_insurance collateral_insurance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collateral_insurance
    ADD CONSTRAINT collateral_insurance_pkey PRIMARY KEY (id);


--
-- Name: collateral collateral_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collateral
    ADD CONSTRAINT collateral_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: interest_rate_settings interest_rate_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interest_rate_settings
    ADD CONSTRAINT interest_rate_settings_pkey PRIMARY KEY (id);


--
-- Name: loan_applications loan_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_applications
    ADD CONSTRAINT loan_applications_pkey PRIMARY KEY (id);


--
-- Name: loan_products loan_products_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_products
    ADD CONSTRAINT loan_products_code_key UNIQUE (code);


--
-- Name: loan_products loan_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_products
    ADD CONSTRAINT loan_products_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: product_performance product_performance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_performance
    ADD CONSTRAINT product_performance_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: territories territories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.territories
    ADD CONSTRAINT territories_name_key UNIQUE (name);


--
-- Name: territories territories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.territories
    ADD CONSTRAINT territories_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: idx_asset_valuations_collateral; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_asset_valuations_collateral ON public.asset_valuations USING btree (collateral_id);


--
-- Name: idx_branch_performance_branch; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_branch_performance_branch ON public.branch_performance USING btree (branch_id);


--
-- Name: idx_branches_territory; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_branches_territory ON public.branches USING btree (territory_id);


--
-- Name: idx_chat_messages_conversation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_messages_conversation_id ON public.chat_messages USING btree (conversation_id);


--
-- Name: idx_collateral_insurance_collateral; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_collateral_insurance_collateral ON public.collateral_insurance USING btree (collateral_id);


--
-- Name: idx_collateral_loan_application; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_collateral_loan_application ON public.collateral USING btree (loan_application_id);


--
-- Name: idx_conversations_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversations_user_id ON public.conversations USING btree (user_id);


--
-- Name: idx_interest_rate_settings_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_interest_rate_settings_product ON public.interest_rate_settings USING btree (product_id);


--
-- Name: idx_product_performance_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_performance_product ON public.product_performance USING btree (product_id);


--
-- Name: branches update_branches_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: collateral_insurance update_collateral_insurance_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_collateral_insurance_updated_at BEFORE UPDATE ON public.collateral_insurance FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: collateral update_collateral_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_collateral_updated_at BEFORE UPDATE ON public.collateral FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: conversations update_conversations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: loan_applications update_loan_applications_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_loan_applications_updated_at BEFORE UPDATE ON public.loan_applications FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: loan_products update_loan_products_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_loan_products_updated_at BEFORE UPDATE ON public.loan_products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: territories update_territories_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_territories_updated_at BEFORE UPDATE ON public.territories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: asset_valuations asset_valuations_collateral_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_valuations
    ADD CONSTRAINT asset_valuations_collateral_id_fkey FOREIGN KEY (collateral_id) REFERENCES public.collateral(id) ON DELETE CASCADE;


--
-- Name: branch_performance branch_performance_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_performance
    ADD CONSTRAINT branch_performance_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: branches branches_territory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_territory_id_fkey FOREIGN KEY (territory_id) REFERENCES public.territories(id) ON DELETE SET NULL;


--
-- Name: chat_messages chat_messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: collateral_insurance collateral_insurance_collateral_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collateral_insurance
    ADD CONSTRAINT collateral_insurance_collateral_id_fkey FOREIGN KEY (collateral_id) REFERENCES public.collateral(id) ON DELETE CASCADE;


--
-- Name: collateral collateral_loan_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collateral
    ADD CONSTRAINT collateral_loan_application_id_fkey FOREIGN KEY (loan_application_id) REFERENCES public.loan_applications(id) ON DELETE CASCADE;


--
-- Name: conversations conversations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: interest_rate_settings interest_rate_settings_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interest_rate_settings
    ADD CONSTRAINT interest_rate_settings_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.loan_products(id) ON DELETE CASCADE;


--
-- Name: loan_applications loan_applications_assigned_officer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_applications
    ADD CONSTRAINT loan_applications_assigned_officer_id_fkey FOREIGN KEY (assigned_officer_id) REFERENCES auth.users(id);


--
-- Name: loan_applications loan_applications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_applications
    ADD CONSTRAINT loan_applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: product_performance product_performance_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_performance
    ADD CONSTRAINT product_performance_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.loan_products(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: repayments repayments_loan_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.repayments
    ADD CONSTRAINT repayments_loan_application_id_fkey FOREIGN KEY (loan_application_id) REFERENCES public.loan_applications(id);


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles Admins can manage all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all roles" ON public.user_roles TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: branch_performance Admins can manage branch performance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage branch performance" ON public.branch_performance USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: branches Admins can manage branches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage branches" ON public.branches USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: product_performance Admins can manage product performance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage product performance" ON public.product_performance USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: loan_products Admins can manage products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage products" ON public.loan_products USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: interest_rate_settings Admins can manage rate settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage rate settings" ON public.interest_rate_settings USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: territories Admins can manage territories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage territories" ON public.territories USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: loan_applications Clients can create applications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can create applications" ON public.loan_applications FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: loan_applications Clients can view own applications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can view own applications" ON public.loan_applications FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: repayments Clients can view own repayments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can view own repayments" ON public.repayments FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.loan_applications la
  WHERE ((la.id = repayments.loan_application_id) AND (la.user_id = auth.uid())))));


--
-- Name: loan_products Everyone can view active products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view active products" ON public.loan_products FOR SELECT USING (((status = 'active'::text) OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'loan_officer'::public.app_role)));


--
-- Name: loan_applications Loan Officers can create applications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Loan Officers can create applications" ON public.loan_applications FOR INSERT TO authenticated WITH CHECK ((public.has_role(auth.uid(), 'loan_officer'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: repayments Staff can insert repayments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can insert repayments" ON public.repayments FOR INSERT TO authenticated WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'loan_officer'::public.app_role)));


--
-- Name: collateral Staff can manage collateral; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can manage collateral" ON public.collateral USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'loan_officer'::public.app_role)));


--
-- Name: collateral_insurance Staff can manage insurance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can manage insurance" ON public.collateral_insurance USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'loan_officer'::public.app_role)));


--
-- Name: asset_valuations Staff can manage valuations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can manage valuations" ON public.asset_valuations USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'loan_officer'::public.app_role)));


--
-- Name: loan_applications Staff can update applications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can update applications" ON public.loan_applications FOR UPDATE TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'loan_officer'::public.app_role)));


--
-- Name: loan_applications Staff can view all applications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can view all applications" ON public.loan_applications FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'loan_officer'::public.app_role)));


--
-- Name: collateral Staff can view all collateral; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can view all collateral" ON public.collateral FOR SELECT USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'loan_officer'::public.app_role)));


--
-- Name: profiles Staff can view all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can view all profiles" ON public.profiles FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'loan_officer'::public.app_role)));


--
-- Name: repayments Staff can view all repayments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can view all repayments" ON public.repayments FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'loan_officer'::public.app_role)));


--
-- Name: branch_performance Staff can view branch performance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can view branch performance" ON public.branch_performance FOR SELECT USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'loan_officer'::public.app_role)));


--
-- Name: branches Staff can view branches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can view branches" ON public.branches FOR SELECT USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'loan_officer'::public.app_role)));


--
-- Name: collateral_insurance Staff can view insurance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can view insurance" ON public.collateral_insurance FOR SELECT USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'loan_officer'::public.app_role)));


--
-- Name: product_performance Staff can view product performance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can view product performance" ON public.product_performance FOR SELECT USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'loan_officer'::public.app_role)));


--
-- Name: interest_rate_settings Staff can view rate settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can view rate settings" ON public.interest_rate_settings FOR SELECT USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'loan_officer'::public.app_role)));


--
-- Name: territories Staff can view territories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can view territories" ON public.territories FOR SELECT USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'loan_officer'::public.app_role)));


--
-- Name: asset_valuations Staff can view valuations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can view valuations" ON public.asset_valuations FOR SELECT USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'loan_officer'::public.app_role)));


--
-- Name: notifications System can insert notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: chat_messages Users can create messages in own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create messages in own conversations" ON public.chat_messages FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.conversations
  WHERE ((conversations.id = chat_messages.conversation_id) AND (conversations.user_id = auth.uid())))));


--
-- Name: conversations Users can create own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own conversations" ON public.conversations FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: conversations Users can delete own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own conversations" ON public.conversations FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: conversations Users can update own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own conversations" ON public.conversations FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING ((auth.uid() = id));


--
-- Name: chat_messages Users can view messages from own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view messages from own conversations" ON public.chat_messages FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.conversations
  WHERE ((conversations.id = chat_messages.conversation_id) AND (conversations.user_id = auth.uid())))));


--
-- Name: conversations Users can view own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own conversations" ON public.conversations FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING ((auth.uid() = id));


--
-- Name: user_roles Users can view own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: notifications Users can view their own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: asset_valuations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.asset_valuations ENABLE ROW LEVEL SECURITY;

--
-- Name: branch_performance; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.branch_performance ENABLE ROW LEVEL SECURITY;

--
-- Name: branches; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: collateral; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.collateral ENABLE ROW LEVEL SECURITY;

--
-- Name: collateral_insurance; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.collateral_insurance ENABLE ROW LEVEL SECURITY;

--
-- Name: conversations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

--
-- Name: interest_rate_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.interest_rate_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: loan_applications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;

--
-- Name: loan_products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.loan_products ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: product_performance; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.product_performance ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: repayments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.repayments ENABLE ROW LEVEL SECURITY;

--
-- Name: territories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.territories ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

