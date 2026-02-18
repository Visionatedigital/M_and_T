
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkIdSubstring() {
    console.log('--- Checking ID Substrings ---');
    const client = await pool.connect();
    try {
        const ids = ['9160286', '10022095', '10018621', '10018242'];

        for (const id of ids) {
            console.log(`Searching for ${id}...`);
            const res = await client.query(`
                SELECT full_name, phone_number FROM profiles 
                WHERE phone_number LIKE $1
            `, [`%${id}%`]);

            if (res.rows.length > 0) {
                console.log(`  MATCH: ${id} ->`, res.rows[0]);
            } else {
                console.log(`  No match for ${id}`);
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

checkIdSubstring();
