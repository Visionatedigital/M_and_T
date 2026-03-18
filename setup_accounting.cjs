process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const db = require('./server/db.cjs');

async function runMigrations() {
    try {
        console.log('🔄 Running database migrations for M&T Growth Gateway...');

        // 1. Create borrowers table
        await db.query(`
            CREATE TABLE IF NOT EXISTS public.borrowers (
                id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
                first_name text,
                last_middle_name text,
                business_name text,
                full_name text,
                email text,
                phone_number text,
                id_number text,
                date_of_birth date,
                gender text,
                title text,
                country text DEFAULT 'Uganda',
                address text,
                city text,
                province_state text,
                zipcode text,
                landline_phone text,
                working_status text,
                credit_score numeric,
                borrower_photo text,
                description text,
                borrower_files text[],
                created_at timestamptz DEFAULT now(),
                updated_at timestamptz DEFAULT now()
            );
        `);
        console.log('✅ Created borrowers table');

        // 2. Create creditors table
        await db.query(`
            CREATE TABLE IF NOT EXISTS public.creditors (
                id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
                name text NOT NULL,
                amount_borrowed numeric NOT NULL,
                interest_rate numeric,
                start_date date,
                maturity_date date,
                created_at timestamptz DEFAULT now(),
                updated_at timestamptz DEFAULT now()
            );
        `);
        console.log('✅ Created creditors table');

        // 3. Create assets table
        await db.query(`
            CREATE TABLE IF NOT EXISTS public.assets (
                id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
                name text NOT NULL,
                category text NOT NULL,
                serial_number text,
                purchase_date date,
                value numeric NOT NULL,
                location text,
                status text DEFAULT 'Active',
                created_at timestamptz DEFAULT now(),
                updated_at timestamptz DEFAULT now()
            );
        `);
        console.log('✅ Created assets table');

        // 4. Create accounting_entries table
        await db.query(`
            CREATE TABLE IF NOT EXISTS public.accounting_entries (
                id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
                entry_type text NOT NULL CHECK (entry_type IN ('revenue', 'expense')),
                category text NOT NULL,
                description text,
                amount numeric(15,2) NOT NULL CHECK (amount > 0),
                entry_date date NOT NULL DEFAULT CURRENT_DATE,
                reference_id uuid,
                payment_method text DEFAULT 'cash',
                recorded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
                created_at timestamptz DEFAULT now(),
                updated_at timestamptz DEFAULT now()
            );
        `);
        console.log('✅ Created accounting_entries table');

        // 5. Create creditor_repayments table
        await db.query(`
            CREATE TABLE IF NOT EXISTS public.creditor_repayments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                creditor_id UUID NOT NULL REFERENCES public.creditors(id) ON DELETE CASCADE,
                amount NUMERIC(15, 2) NOT NULL,
                payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
                payment_method VARCHAR(50) NOT NULL DEFAULT 'bank_transfer',
                reference VARCHAR(255),
                recorded_by UUID REFERENCES public.profiles(id),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Created creditor_repayments table');

        // 6. Create staff_contracts table
        await db.query(`
            CREATE TABLE IF NOT EXISTS public.staff_contracts (
                id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                base_salary numeric(15,2) NOT NULL DEFAULT 0,
                allowances numeric(15,2) DEFAULT 0,
                nssf_contribution numeric(15,2) DEFAULT 0,
                paye_tax numeric(15,2) DEFAULT 0,
                status text DEFAULT 'active',
                created_at timestamptz DEFAULT now(),
                updated_at timestamptz DEFAULT now(),
                UNIQUE(user_id)
            );
        `);
        console.log('✅ Created staff_contracts table');

        // 7. Create payroll_records table
        await db.query(`
            CREATE TABLE IF NOT EXISTS public.payroll_records (
                id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                contract_id uuid NOT NULL REFERENCES public.staff_contracts(id),
                period_month integer NOT NULL,
                period_year integer NOT NULL,
                gross_salary numeric(15,2) NOT NULL,
                net_salary numeric(15,2) NOT NULL,
                deductions numeric(15,2) DEFAULT 0,
                bonuses numeric(15,2) DEFAULT 0,
                payment_status text DEFAULT 'pending',
                paid_at timestamptz,
                processed_by uuid REFERENCES auth.users(id),
                created_at timestamptz DEFAULT now(),
                UNIQUE(user_id, period_month, period_year)
            );
        `);
        console.log('✅ Created payroll_records table');

        // 8. Add borrower_id to loan_applications if it doesn't exist
        const checkCol = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'loan_applications' AND column_name = 'borrower_id'");

        if (checkCol.rows.length === 0) {
            console.log('➕ Adding borrower_id to loan_applications...');
            await db.query("ALTER TABLE public.loan_applications ADD COLUMN borrower_id uuid REFERENCES public.borrowers(id) ON DELETE SET NULL");
        }

        console.log('✅ Database migrations completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

runMigrations();
