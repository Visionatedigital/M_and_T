require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function testDirectUpdate() {
    const id = '27ba1b12-d4cf-4783-ab1d-f53b203d3839';

    try {
        // First get the current data
        const { rows: currentRows } = await pool.query('SELECT * FROM loan_applications WHERE id = $1', [id]);
        if (currentRows.length === 0) { console.log('Not found'); process.exit(1); }
        const app = currentRows[0];
        console.log('Current app found:', app.full_name);

        // Now try the exact same UPDATE query
        const query = `
            UPDATE loan_applications
            SET 
                full_name = $1, email = $2, phone_number = $3, id_number = $4, date_of_birth = $5,
                address = $6, loan_product = $7, loan_amount = $8, loan_duration_months = $9, loan_purpose = $10,
                employment_status = $11, employer_name = $12, monthly_income = $13, group_id = $14, group_name = $15,
                guarantors = $16, group_members = $17,
                attachment_national_id = $18, attachment_lc1_letter = $19, attachment_recommendation_letter = $20, 
                attachment_passport_photo = $21, attachment_income_statement = $22,
                district = $23, division = $24, county = $25, sub_county = $26, parish = $27, village = $28,
                business_location = $29, witness_details = $30, security_type = $31, security_value = $32,
                loan_category = $33,
                updated_at = NOW()
            WHERE id = $34
            RETURNING *
        `;

        const values = [
            app.full_name + " (Test)", app.email, app.phone_number, app.id_number, app.date_of_birth,
            app.address, app.loan_product, app.loan_amount, app.loan_duration_months, app.loan_purpose,
            app.employment_status, app.employer_name, app.monthly_income, app.group_id || null, app.group_name || null,
            JSON.stringify(app.guarantors || []), JSON.stringify(app.group_members || []),
            app.attachment_national_id || null, app.attachment_lc1_letter || null, app.attachment_recommendation_letter || null,
            app.attachment_passport_photo || null, app.attachment_income_statement || null,
            app.district || null, app.division || null, app.county || null, app.sub_county || null, app.parish || null, app.village || null,
            app.business_location || null, JSON.stringify(app.witness_details || null), app.security_type || null, app.security_value || null,
            app.loan_category || null,
            id
        ];

        console.log('Running UPDATE with', values.length, 'params...');
        const { rows } = await pool.query(query, values);
        console.log('SUCCESS! Updated:', rows[0].full_name);

    } catch (err) {
        console.error('DETAILED ERROR:', err.message);
        console.error('Detail:', err.detail);
        console.error('Hint:', err.hint);
        console.error('Position:', err.position);
        console.error('Code:', err.code);
    } finally {
        process.exit();
    }
}

testDirectUpdate();
