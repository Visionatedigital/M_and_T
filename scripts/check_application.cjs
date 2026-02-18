const db = require('../server/db');

async function checkApp() {
    const id = '27ba1b12-d4cf-4783-ab1d-f53b203d3839';
    try {
        console.log('Checking application with ID:', id);
        const { rows } = await db.query('SELECT * FROM loan_applications WHERE id = $1', [id]);
        if (rows.length > 0) {
            console.log('Found application:', rows[0].id, rows[0].status, rows[0].full_name);
        } else {
            console.log('Application NOT FOUND in database.');
            const all = await db.query('SELECT id FROM loan_applications LIMIT 5');
            console.log('First 5 IDs in DB:', all.rows.map(r => r.id));
        }
    } catch (err) {
        console.error('Database error:', err);
    } finally {
        process.exit();
    }
}

checkApp();
