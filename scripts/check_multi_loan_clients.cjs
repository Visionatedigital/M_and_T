
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkClients() {
    console.log('--- Checking Multi-Loan Clients ---');
    const client = await pool.connect();
    try {
        const names = [
            'KAHINGA', 'KAYINGI', // Alex
            'NAKYANZI', // Teopista
            'NALWADDA', // Phionah
            'NAKYEYUNE' // Harriet
        ];

        for (const name of names) {
            console.log(`\nSearching for "${name}":`);
            const res = await client.query(`
                SELECT 
                    p.full_name, la.id_number,
                    la.id as loan_id, la.loan_amount, la.status, la.created_at
                FROM profiles p
                LEFT JOIN loan_applications la ON p.id = la.user_id
                WHERE p.full_name ILIKE $1
            `, [`%${name}%`]);

            res.rows.forEach(r => {
                console.log(`  - ${r.full_name} (NIN: ${r.id_number})`);
                console.log(`    Loan: ${r.loan_amount} (${r.status}) - ID: ${r.loan_id}`);
            });
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

checkClients();
