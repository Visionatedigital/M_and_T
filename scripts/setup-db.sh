#!/bin/bash

# Configuration
DB_NAME="mt_growth"
MIGRATION_FILE="supabase/migrations/20251202101432_remix_migration_from_pg_dump.sql"

echo "🐘 Setting up local database: $DB_NAME..."

# 1. Create database if it doesn't exist
psql -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || createdb $DB_NAME

# 2. Setup Supabase-specific prerequisites
echo "🛠️ Creating Supabase-specific schemas, roles, and functions..."
psql -d $DB_NAME <<EOF
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Roles
DO \$$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN
        CREATE ROLE service_role;
    END IF;
END
\$$;

-- Grant permissions (if roles exist)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;

-- Schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS storage;

-- Auth tables
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID,
    email TEXT UNIQUE,
    encrypted_password TEXT,
    email_confirmed_at TIMESTAMP WITH TIME ZONE,
    invitation_token TEXT,
    confirmation_token TEXT,
    recovery_token TEXT,
    email_change_token_new TEXT,
    email_change TEXT,
    raw_app_meta_data JSONB,
    raw_user_meta_data JSONB,
    is_super_admin BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    phone TEXT,
    phone_confirmed_at TIMESTAMP WITH TIME ZONE,
    phone_change TEXT,
    phone_change_token TEXT,
    email_change_token_current TEXT,
    email_change_confirm_status SMALLINT,
    banned_until TIMESTAMP WITH TIME ZONE,
    reauthentication_token TEXT,
    reauthentication_sent_at TIMESTAMP WITH TIME ZONE
);

-- Mock Auth functions
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS \$$
    -- Returning the ID of the test admin by default for local dev
    SELECT '00000000-0000-0000-0000-000000000001'::uuid;
\$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION auth.role() RETURNS text AS \$$
    SELECT 'authenticated'::text;
\$$ LANGUAGE sql;

-- Grant permissions to schema public to authenticated role
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA auth TO authenticated;
EOF

# 3. Run the project migration
echo "📜 Running migration $MIGRATION_FILE..."
# Note: we might see errors about missing extensions like pg_graphql, that's expected on standard Postgres
psql -d $DB_NAME -f $MIGRATION_FILE > /dev/null 2>&1

# 4. Create missing tables (e.g., repayments) that aren't in the migration dump
echo "🏗️ Creating additional required tables (repayments)..."
psql -d $DB_NAME <<EOF
CREATE TABLE IF NOT EXISTS public.repayments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_application_id UUID REFERENCES public.loan_applications(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payment_method TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure all tables are owned by or accessible to current user for local dev
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
EOF

# 5. Insert Test Credentials
echo "🔑 Creating test credentials..."
psql -d $DB_NAME <<EOF
-- Admin User
INSERT INTO auth.users (id, email, created_at)
VALUES ('00000000-0000-0000-0000-000000000001', 'admin@example.com', now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, first_name, last_name, created_at)
VALUES ('00000000-0000-0000-0000-000000000001', 'Admin User', 'Admin', 'User', now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
VALUES ('00000000-0000-0000-0000-000000000001', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Loan Officer One
INSERT INTO auth.users (id, email, created_at)
VALUES ('00000000-0000-0000-0000-000000000002', 'officer@example.com', now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, first_name, last_name, created_at)
VALUES ('00000000-0000-0000-0000-000000000002', 'Loan Officer One', 'Loan', 'Officer', now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
VALUES ('00000000-0000-0000-0000-000000000002', 'loan_officer')
ON CONFLICT (user_id, role) DO NOTHING;
EOF

# 6. Insert Sample Data for testing
echo "📊 Seeding sample data..."
psql -d $DB_NAME <<EOF
-- Branches
INSERT INTO public.branches (name, code, address) VALUES 
('Kampala Central', 'KLA01', 'Nakasero, Kampala'),
('Mbarara Branch', 'MBR01', 'High Street, Mbarara')
ON CONFLICT (code) DO NOTHING;

-- Loan Products (if empty)
INSERT INTO public.loan_products (name, code, min_amount, max_amount, min_duration_months, max_duration_months, base_interest_rate)
SELECT 'Personal Loans', 'PL001', 500000, 5000000, 3, 24, 0.15 FROM (SELECT 1) x WHERE NOT EXISTS (SELECT 1 FROM public.loan_products WHERE code = 'PL001');

-- Sample Applications
INSERT INTO public.loan_applications (
    id, user_id, full_name, email, phone_number, id_number, date_of_birth, address, 
    loan_product, loan_amount, loan_duration_months, loan_purpose, employment_status, status, approved_at, created_at, updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'John Doe', 'john@example.com', '+256700123456', 'ID12345', '1990-01-01', 'Kampala',
    'Personal Loans', 1000000, 12, 'Business Expansion', 'Employed', 'disbursed', now() - interval '2 months', now() - interval '2 months', now() - interval '2 months'
) ON CONFLICT (id) DO NOTHING;

-- Sample Repayments
INSERT INTO public.repayments (loan_application_id, amount, payment_date, payment_method)
SELECT id, 100000, now() - interval '1 month', 'Mobile Money' FROM public.loan_applications WHERE id = '00000000-0000-0000-0000-000000000101'
AND NOT EXISTS (SELECT 1 FROM public.repayments WHERE loan_application_id = '00000000-0000-0000-0000-000000000101');
EOF

echo ""
echo "✅ Database setup complete!"
echo "--------------------------------------------------"
echo "🔑 Test Credentials:"
echo "   - Admin:    admin@example.com"
echo "   - Officer:  officer@example.com"
echo "--------------------------------------------------"
echo "🚀 To start everything, run: npm run dev:full"
echo "📊 Or just the server:      npm run server"
