const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function run() {
    try {
        console.log('--- Table: repayments ---');
        const cols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'repayments' ORDER BY ordinal_position");
        console.log(cols.rows.map(c => `${c.column_name} (${c.data_type})`).join('\n'));

        console.log('\n--- Row Count ---');
        const count = await pool.query("SELECT COUNT(*) FROM repayments");
        console.log('Total repayments:', count.rows[0].count);

        if (count.rows[0].count > 0) {
            console.log('\n--- Sample Row ---');
            const sample = await pool.query("SELECT * FROM repayments LIMIT 1");
            console.log(JSON.stringify(sample.rows[0], null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
