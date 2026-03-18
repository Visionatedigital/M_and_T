const { Client } = require('pg');
const client = new Client({
    connectionString: 'postgresql://postgres.xdhdcoepxqnyoahzaoie:S7G0JE9zHzJ4XyaT@aws-1-eu-west-2.pooler.supabase.com:5432/postgres?sslmode=require',
    ssl: { rejectUnauthorized: false }
});

async function checkUsers() {
    try {
        await client.connect();
        const res = await client.query('SELECT email FROM auth.users');
        console.log("USERS:");
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error("DATABASE ERROR:", err.message);
    } finally {
        await client.end();
    }
}

checkUsers();
