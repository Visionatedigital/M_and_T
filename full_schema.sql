CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'loan_officer',
    'client'
);


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


SET default_table_access_method = heap;

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
    CONSTRAINT loan_applications_loan_product_check CHECK ((loan_product = ANY (ARRAY['Personal Loans'::text, 'Civil Servant Loans'::text, 'Logbook Finance Loans'::text, 'SME Loans'::text]))),
    CONSTRAINT loan_applications_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'under_review'::text, 'approved'::text, 'rejected'::text, 'disbursed'::text])))
);


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
    updated_at timestamp with time zone DEFAULT now() NOT NULL
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
    full_name text NOT NULL,
    phone_number text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    first_name text,
    last_name text
);


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
-- Name: loan_products Everyone can view active products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view active products" ON public.loan_products FOR SELECT USING (((status = 'active'::text) OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'loan_officer'::public.app_role)));


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
-- Name: product_performance; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.product_performance ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

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





-- 1. Add Fee Columns to loan_products
-- We wrap in DO block to avoid errors if columns exist (safe for re-running)
DO $$
BEGIN
    -- Application Fee
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'loan_products' AND column_name = 'application_fee') THEN
        ALTER TABLE public.loan_products ADD COLUMN application_fee numeric DEFAULT 0;
    END IF;
    -- Admission Fee
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'loan_products' AND column_name = 'admission_fee') THEN
        ALTER TABLE public.loan_products ADD COLUMN admission_fee numeric DEFAULT 0;
    END IF;
    -- Processing Fee
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'loan_products' AND column_name = 'processing_fee') THEN
        ALTER TABLE public.loan_products ADD COLUMN processing_fee numeric DEFAULT 0;
    END IF;
    -- Passbook Fee
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'loan_products' AND column_name = 'passbook_fee') THEN
        ALTER TABLE public.loan_products ADD COLUMN passbook_fee numeric DEFAULT 0;
    END IF;
    -- Insurance Rate (Percentage)
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'loan_products' AND column_name = 'insurance_rate') THEN
        ALTER TABLE public.loan_products ADD COLUMN insurance_rate numeric DEFAULT 0; 
    END IF;
    -- Security Deposit Rate (Percentage)
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'loan_products' AND column_name = 'security_deposit_rate') THEN
        ALTER TABLE public.loan_products ADD COLUMN security_deposit_rate numeric DEFAULT 0; 
    END IF;
END $$;

-- 2. Update Constraint on loan_applications
-- Drop old constraint safely
ALTER TABLE public.loan_applications DROP CONSTRAINT IF EXISTS loan_applications_loan_product_check;

-- Add new constraint with expanded list
ALTER TABLE public.loan_applications ADD CONSTRAINT loan_applications_loan_product_check 
    CHECK (loan_product = ANY (ARRAY[
        'Personal Loans'::text, 
        'Civil Servant Loans'::text, 
        'Logbook Finance Loans'::text, 
        'SME Loans'::text,
        'Bodaboda Group Loan'::text, -- Legacy support for transition
        'Individual Loan'::text,
        'Group Loan'::text
    ]));

-- 3. Insert/Update Products
-- Upsert based on Code to avoid duplicates
INSERT INTO public.loan_products (
    name, 
    code, 
    min_amount, 
    max_amount, 
    min_duration_months, 
    max_duration_months, 
    application_fee, 
    admission_fee, 
    processing_fee, 
    passbook_fee, 
    insurance_rate, 
    security_deposit_rate, 
    base_interest_rate
)
VALUES 
    (
        'Individual Loan', 
        'IND_LOAN', 
        150000, 
        2000000, 
        4, 
        6, 
        5000, 
        5000, 
        5000, 
        5000, 
        1.0, 
        10.0, 
        0 -- Interest not specified, assuming handled elsewhere or 0 base
    ),
    (
        'Group Loan', 
        'GRP_LOAN', 
        150000, 
        2000000, 
        4, 
        6, 
        5000, 
        5000, 
        5000, 
        5000, 
        1.0, 
        10.0, 
        0
    )
ON CONFLICT (code) DO UPDATE SET 
    min_amount = EXCLUDED.min_amount,
    max_amount = EXCLUDED.max_amount,
    min_duration_months = EXCLUDED.min_duration_months,
    max_duration_months = EXCLUDED.max_duration_months,
    application_fee = EXCLUDED.application_fee,
    admission_fee = EXCLUDED.admission_fee,
    processing_fee = EXCLUDED.processing_fee,
    passbook_fee = EXCLUDED.passbook_fee,
    insurance_rate = EXCLUDED.insurance_rate,
    security_deposit_rate = EXCLUDED.security_deposit_rate;




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



-- Add status and payment_method to repayments
ALTER TABLE public.repayments ADD COLUMN IF NOT EXISTS status text DEFAULT 'paid';
ALTER TABLE public.repayments ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'cash';



-- Add group_members JSONB column to loan_applications
ALTER TABLE public.loan_applications ADD COLUMN IF NOT EXISTS group_members JSONB DEFAULT '[]'::jsonb;



-- Add member_breakdown to repayments to track individual contributions in group loans
ALTER TABLE public.repayments ADD COLUMN IF NOT EXISTS member_breakdown JSONB DEFAULT '[]';

-- Add comment to explain usage
COMMENT ON COLUMN public.repayments.member_breakdown IS 'Stores individual member payment amounts for group loans. Format: [{"name": String, "nin": String, "amount": Number}]';



-- Check count of loans by product and status
SELECT 
    loan_product,
    status,
    COUNT(*) as count
FROM 
    loan_applications
GROUP BY 
    loan_product, status
ORDER BY 
    count DESC;

-- Check a few examples of non-group loans that should be active
SELECT 
    id, 
    full_name, 
    loan_product, 
    status, 
    created_at
FROM 
    loan_applications
WHERE 
    loan_product != 'Bodaboda Group Loan'
    AND status IN ('approved', 'disbursed')
LIMIT 5;



SELECT * FROM loan_products;



-- 1. Rename 'Bodaboda Group Loan' to 'Group Loan'
UPDATE loan_products
SET name = 'Group Loan'
WHERE name = 'Bodaboda Group Loan';

-- 2. Ensure 'Individual Loan' exists
INSERT INTO loan_products (name, interest_rate, duration_months, status)
SELECT 'Individual Loan', 0.30, 4, 'active'
WHERE NOT EXISTS (
    SELECT 1 FROM loan_products WHERE name = 'Individual Loan'
);

-- 3. Update existing loan applications
UPDATE loan_applications
SET loan_product = 'Group Loan'
WHERE loan_product = 'Bodaboda Group Loan';



-- Add location fields to loan_applications table
ALTER TABLE loan_applications
ADD COLUMN IF NOT EXISTS latitude float8,
ADD COLUMN IF NOT EXISTS longitude float8;



SELECT count(*) FROM profiles;
SELECT count(*) FROM loan_applications;



-- Add missing columns to profiles table if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS role text DEFAULT 'client';

-- Make full_name nullable if it's not (since we prefer first/last)
ALTER TABLE public.profiles ALTER COLUMN full_name DROP NOT NULL;

-- Backfill profiles from auth.users
INSERT INTO public.profiles (id, first_name, last_name, full_name, email, phone_number, role, created_at)
SELECT 
    au.id,
    COALESCE(split_part(au.raw_user_meta_data->>'full_name', ' ', 1), 'User'),
    COALESCE(split_part(au.raw_user_meta_data->>'full_name', ' ', 2), ''),
    COALESCE(au.raw_user_meta_data->>'full_name', 'User'), -- Populate full_name too
    au.email,
    au.raw_user_meta_data->>'phone_number',
    COALESCE(au.raw_user_meta_data->>'role', 'client'),
    au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;

-- Update profiles with data from loan applications
UPDATE public.profiles p
SET 
    first_name = COALESCE(split_part(la.full_name, ' ', 1), p.first_name),
    last_name = COALESCE(split_part(la.full_name, ' ', 2), p.last_name),
    full_name = COALESCE(la.full_name, p.full_name),
    phone_number = COALESCE(la.phone_number, p.phone_number)
FROM loan_applications la
WHERE p.id = la.user_id;



-- Fix Data Integrity: Re-assign loans from the "Olivia" user (e560377e...) to new unique users based on full_name

-- 1. Create a temporary table to map unique names to new User IDs
CREATE TEMP TABLE name_mapping AS
SELECT DISTINCT full_name, gen_random_uuid() as new_user_id
FROM loan_applications
WHERE user_id = 'e560377e-8e67-4ff3-a394-2053b82609da';

-- 2. Insert new "ghost" users into auth.users (We can't easily do this in SQL due to hashing, BUT we can insert into PROFILES directly)
-- NOTE: If we insert into profiles but NOT auth.users, they won't be able to login, which is fine for "Staff Portal" clients.
-- However, if there is a foreign key from profiles.id -> auth.users.id, this will fail.
-- Let's check if profiles has a FK to auth.users. usually it does.

-- Verification:
-- If profiles has FK to auth.users, we MUST create auth.users.
-- Since we cannot generate valid passwords in SQL easily, we will create dummy auth users with a known pattern or just random hashes.

-- Workaround:
-- We will use a script to generate the SQL with valid auth.users inserts (using a fixed dummy hash for password).
-- Or, simpler:
-- Just update the LOANS to point to new UUIDs and insert into PROFILES. 
-- BUT, if `loan_applications.user_id` has a FK to `auth.users` (likely), this will fail.

-- Let's assume we need to safeguard against FK constraints.
-- I will create a PL/PGSQL block to generate these.

DO $$
DECLARE
    r RECORD;
    new_uid UUID;
    fake_email TEXT;
BEGIN
    FOR r IN SELECT DISTINCT full_name FROM loan_applications WHERE user_id = 'e560377e-8e67-4ff3-a394-2053b82609da'
    LOOP
        new_uid := gen_random_uuid();
        fake_email := lower(regexp_replace(r.full_name, '\s+', '.', 'g')) || '@mandt.placeholder';
        
        -- Try to insert into auth.users (this requires permissions, might fail if running as non-superuser)
        -- If we can't write to auth.users, we are stuck unless the FK is loose.
        -- ALTERNATIVE: Use the existing check_auth_users script to see if we have 50 users. 
        -- We might just distribute them among existing 50 users? 
        -- No, names won't match.
        
        -- Let's try inserting into auth.users with a dummy hash
        BEGIN
            INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, instance_id)
            VALUES (
                new_uid, 
                fake_email, 
                '$2a$10$dummyhashdummyhashdummyhashdummyhashdummyhash', -- Dummy hash
                now(), 
                '{"provider":"email","providers":["email"]}', 
                jsonb_build_object('full_name', r.full_name, 'role', 'client'), 
                now(), 
                now(), 
                'authenticated', 
                '00000000-0000-0000-0000-000000000000'
            );
            
            -- Insert into profiles
            INSERT INTO public.profiles (id, first_name, last_name, full_name, email, role, created_at)
            VALUES (
                new_uid, 
                split_part(r.full_name, ' ', 1), 
                split_part(r.full_name, ' ', 2), 
                r.full_name, 
                fake_email, 
                'client', 
                now()
            );

            -- Update loans
            UPDATE public.loan_applications
            SET user_id = new_uid
            WHERE full_name = r.full_name AND user_id = 'e560377e-8e67-4ff3-a394-2053b82609da';
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed for %: %', r.full_name, SQLERRM;
        END;
    END LOOP;
END $$;



-- Add group_name to loan_applications to store legacy group labels (e.g., 'Kapere', 'Single')
ALTER TABLE loan_applications ADD COLUMN IF NOT EXISTS group_name TEXT;

-- Index for faster filtering and aggregation
CREATE INDEX IF NOT EXISTS idx_loan_applications_group_name ON loan_applications(group_name);


-- Add amount_paid column to loan_applications
ALTER TABLE public.loan_applications 
ADD COLUMN IF NOT EXISTS amount_paid NUMERIC DEFAULT 0 NOT NULL;

-- Add a check constraint to ensure amount_paid is non-negative
ALTER TABLE public.loan_applications 
ADD CONSTRAINT loan_applications_amount_paid_check 
CHECK (amount_paid >= 0);

COMMENT ON COLUMN public.loan_applications.amount_paid IS 'Total amount paid towards this loan';


-- Add new columns to loan_applications table for Loan Agreement 2026 compliance
ALTER TABLE public.loan_applications
ADD COLUMN IF NOT EXISTS loan_category text, -- Business, Agricultural, School Fees, Emergency
ADD COLUMN IF NOT EXISTS district text,
ADD COLUMN IF NOT EXISTS division text,
ADD COLUMN IF NOT EXISTS county text,
ADD COLUMN IF NOT EXISTS sub_county text,
ADD COLUMN IF NOT EXISTS parish text,
ADD COLUMN IF NOT EXISTS village text,
ADD COLUMN IF NOT EXISTS business_location text,
ADD COLUMN IF NOT EXISTS guarantors jsonb DEFAULT '[]'::jsonb, -- Array of {name, phone, id_number, address}
ADD COLUMN IF NOT EXISTS witness_details jsonb DEFAULT '{}'::jsonb; -- {name, phone, id_number, address, role}

-- Add monitoring_fee_rate to loan_products
-- Default is 3% as per agreement
DO $$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'loan_products' AND column_name = 'monitoring_fee_rate') THEN
        ALTER TABLE public.loan_products ADD COLUMN monitoring_fee_rate numeric DEFAULT 3.0;
    END IF;
END $$;

-- Update fees for existing products to match the 2026 Agreement
-- Individual Loan and Group Loan
UPDATE public.loan_products
SET 
    application_fee = 0, -- Application form is usually free or part of processing? Agreement says "Loan Processing Fee: UGX 15,000". Let's assume Application Fee is 0 and Processing covers it, or maybe Application Stage fee. 
    -- Agreement: "Application Stage ... Loan Processing Fee: UGX 15,000". 
    -- "Payable Only Upon Loan Approval ... Admission & Passbook Fee: UGX 10,000"
    processing_fee = 15000,
    admission_fee = 10000,
    passbook_fee = 0, -- Included in Admission? Agreement says "Admission & Passbook Fee: UGX 10,000". We can split or just put it in admission. Let's put 10000 in admission and 0 in passbook to avoid double charging if logic sums them.
    monitoring_fee_rate = 3.0,
    security_deposit_rate = 10.0,
    insurance_rate = 1.0 -- Keeping existing 1% or setting to what? Agreement doesn't explicitly mention "Insurance" but mentions "Security & Collateral". Let's leave insurance as is if not mentioned, or set to 0? The agreement has "Monitoring Fee: 3%". Let's stick to that.
WHERE name IN ('Individual Loan', 'Group Loan');

-- Ensure validation check for loan_category
ALTER TABLE public.loan_applications DROP CONSTRAINT IF EXISTS loan_applications_loan_category_check;
ALTER TABLE public.loan_applications ADD CONSTRAINT loan_applications_loan_category_check 
    CHECK (loan_category IS NULL OR loan_category = ANY (ARRAY['Business', 'Agricultural', 'School Fees', 'Emergency', 'Other']));


-- Add Security & Collateral fields to loan_applications table
ALTER TABLE public.loan_applications
ADD COLUMN IF NOT EXISTS security_type TEXT,
ADD COLUMN IF NOT EXISTS security_value NUMERIC;

-- Add comment to describe the new fields
COMMENT ON COLUMN public.loan_applications.security_type IS 'Type of security/collateral pledged for secured loans';
COMMENT ON COLUMN public.loan_applications.security_value IS 'Estimated value of the security/collateral in UGX';


-- Update loan product fees to match M&T Microfinance Fee Schedule
-- Based on: M&T Microfinance Loan Agreement 2026

-- Update fee structure for Individual Loan and Group Loan products
UPDATE public.loan_products
SET
    processing_fee = 15000,  -- UGX 15,000 (Non-refundable, Application Stage)
    admission_fee = 10000,   -- UGX 10,000 (Admission & Passbook Fee)
    monitoring_fee_rate = 3, -- 3% of Loan Amount
    security_deposit_rate = 10, -- 10% (Refundable)
    updated_at = NOW()
WHERE name IN ('Individual Loan', 'Group Loan');

-- Add conditional fee columns to loan_products table if they don't exist
ALTER TABLE public.loan_products
ADD COLUMN IF NOT EXISTS late_payment_penalty NUMERIC DEFAULT 10000,
ADD COLUMN IF NOT EXISTS restructuring_fee_low NUMERIC DEFAULT 30000,
ADD COLUMN IF NOT EXISTS restructuring_fee_high NUMERIC DEFAULT 60000,
ADD COLUMN IF NOT EXISTS restructuring_threshold NUMERIC DEFAULT 600000;

-- Set conditional fees for all products
UPDATE public.loan_products
SET
    late_payment_penalty = 10000,      -- UGX 10,000 per missed installment
    restructuring_fee_low = 30000,     -- UGX 30,000 for loans ≤ UGX 600,000
    restructuring_fee_high = 60000,    -- UGX 60,000 for loans > UGX 600,000
    restructuring_threshold = 600000,  -- Threshold amount
    updated_at = NOW()
WHERE status = 'active';

-- Add comments to describe the new fields
COMMENT ON COLUMN public.loan_products.late_payment_penalty IS 'Late payment penalty per missed installment (UGX)';
COMMENT ON COLUMN public.loan_products.restructuring_fee_low IS 'Loan restructuring fee for amounts ≤ threshold (UGX)';
COMMENT ON COLUMN public.loan_products.restructuring_fee_high IS 'Loan restructuring fee for amounts > threshold (UGX)';
COMMENT ON COLUMN public.loan_products.restructuring_threshold IS 'Threshold amount for restructuring fee calculation (UGX)';


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


-- Create Supabase Storage bucket for loan documents
-- This bucket will store all loan application attachments

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'loan-documents',
    'loan-documents',
    true, -- Public bucket so documents can be accessed via URL
    5242880, -- 5MB file size limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the loan-documents bucket
CREATE POLICY "Authenticated users can upload loan documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'loan-documents');

CREATE POLICY "Authenticated users can view loan documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'loan-documents');

CREATE POLICY "Users can update their own loan documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'loan-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own loan documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'loan-documents' AND auth.uid()::text = (storage.foldername(name))[1]);


-- Add group_members field to loan_applications table
ALTER TABLE public.loan_applications
ADD COLUMN IF NOT EXISTS group_members JSONB DEFAULT '[]'::jsonb;

-- Add comment to describe the field
COMMENT ON COLUMN public.loan_applications.group_members IS 'List of group members for Group Loan applications, containing name, phone, and ID';


-- Add group_name field to loan_applications table
ALTER TABLE public.loan_applications
ADD COLUMN IF NOT EXISTS group_name TEXT;

-- Add comment to describe the field
COMMENT ON COLUMN public.loan_applications.group_name IS 'Name of the group for Group Loan applications';


