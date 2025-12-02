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


