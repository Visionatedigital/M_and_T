const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
    {
        db: { schema: 'public' },
        auth: { autoRefreshToken: false, persistSession: false }
    }
);

async function addAmountPaidColumn() {
    console.log('=== ADDING amount_paid COLUMN ===');

    try {
        // Check if column exists
        const { data: columns, error: checkError } = await supabase
            .from('loan_applications')
            .select('amount_paid')
            .limit(1);

        if (!checkError) {
            console.log('✓ Column amount_paid already exists');
            return;
        }

        console.log('Column does not exist, adding it via SQL...');
        console.log('\nPlease run this SQL in your Supabase SQL Editor:');
        console.log('---');
        console.log(`
ALTER TABLE public.loan_applications 
ADD COLUMN IF NOT EXISTS amount_paid NUMERIC DEFAULT 0 NOT NULL;

ALTER TABLE public.loan_applications 
ADD CONSTRAINT loan_applications_amount_paid_check 
CHECK (amount_paid >= 0);

COMMENT ON COLUMN public.loan_applications.amount_paid IS 'Total amount paid towards this loan';
        `);
        console.log('---');

    } catch (err) {
        console.error('Error:', err.message);
    }
}

addAmountPaidColumn().catch(console.error);
