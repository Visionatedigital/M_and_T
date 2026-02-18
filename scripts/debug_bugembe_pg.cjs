
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function debugBugembe() {
    console.log('--- Debugging Bugembe Loan (PG) ---');
    const client = await pool.connect();
    try {
        // 1. Find the Group
        const groupRes = await client.query("SELECT id, group_name FROM groups WHERE group_name ILIKE '%KAMOGA%'");
        console.log('Groups Found:', groupRes.rows);

        if (groupRes.rows.length > 0) {
            const groupIds = groupRes.rows.map(g => g.id);
            // 2. Find Loans
            const loanRes = await client.query(`
                SELECT 
                    la.id, la.loan_amount, la.status, la.user_id, p.full_name 
                FROM loan_applications la
                LEFT JOIN profiles p ON la.user_id = p.id
                WHERE la.group_id = ANY($1) 
                  AND la.loan_amount = 500000
            `, [groupIds]);

            console.log('Loans Found in KAMOGA (500k):', loanRes.rows);
        }

        // 3. Check Bugembe Profiles
        const profileRes = await client.query("SELECT * FROM profiles WHERE full_name ILIKE '%BUGEMBE%'");
        console.log('Profiles matching BUGEMBE:', profileRes.rows);

        // 4. Check Repayments for Bugembe's Loan (98c6e17c...)
        const loanId = '98c6e17c-ccee-4a2a-aa62-dff1e74e8c50';
        const repaymentRes = await client.query("SELECT * FROM repayments WHERE loan_application_id = $1", [loanId]);
        console.log('Repayments for Loan 98c6e17c...:', repaymentRes.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

debugBugembe();
