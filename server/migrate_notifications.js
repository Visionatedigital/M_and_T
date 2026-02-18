const fs = require('fs');
const path = require('path');
const db = require('./db');

const migrate = async () => {
    try {
        const sql = fs.readFileSync(path.join(__dirname, '../supabase/migrations/20260212100000_create_notifications.sql'), 'utf8');
        await db.query(sql);
        console.log('Notifications table created successfully');
    } catch (err) {
        console.error('Error creating notifications table:', err);
    } finally {
        process.exit();
    }
};

migrate();
