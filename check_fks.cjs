process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const db = require('./server/db.cjs');
db.query(`
    SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
    FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public';
`)
    .then(res => {
        console.log(JSON.stringify(res.rows, null, 2));
        process.exit(0);
    })
    .catch(e => {
        console.error(e);
        process.exit(1);
    });
