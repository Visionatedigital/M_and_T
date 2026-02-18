const express = require('express');
const router = express.Router();
const db = require('../db');
const notificationService = require('../services/notificationService');

// Get all loan applications

router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query(`
      SELECT la.*, g.group_name as nested_group_name 
      FROM loan_applications la
      LEFT JOIN groups g ON la.group_id = g.id
      ORDER BY la.created_at DESC
    `);

        const processed = rows.map(app => ({
            ...app,
            group_name: app.group_name || app.nested_group_name || null
        }));

        res.json(processed);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// Get active loans (status: approved, disbursed) with calculations
router.get('/active', async (req, res) => {
    try {
        const { rows } = await db.query(`
            SELECT 
                la.*, 
                g.group_name,
                COALESCE(r.total_paid, 0) as amount_paid
            FROM loan_applications la
            LEFT JOIN groups g ON la.group_id = g.id
            LEFT JOIN (
                SELECT loan_application_id, SUM(amount) as total_paid
                FROM repayments
                GROUP BY loan_application_id
            ) r ON la.id = r.loan_application_id
            WHERE la.status IN ('approved', 'disbursed', 'completed', 'settled')
            ORDER BY la.created_at DESC
        `);

        const processed = rows.map(loan => {
            const principal = parseFloat(loan.loan_amount);
            const interestRate = 0.30;
            const totalAmount = principal * (1 + interestRate);
            const approvedDate = new Date(loan.approved_at || loan.created_at);
            const now = new Date();
            const monthsElapsed = Math.floor((now.getTime() - approvedDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
            const monthsRemaining = Math.max(0, loan.loan_duration_months - monthsElapsed);
            const amountPaid = parseFloat(loan.amount_paid || 0);
            const remainingBalance = Math.max(0, totalAmount - amountPaid);
            const growthRate = interestRate * 100;

            return {
                ...loan,
                principal,
                total_amount: totalAmount,
                amount_paid: amountPaid,
                remaining_balance: remainingBalance,
                growth_rate: growthRate,
                months_elapsed: monthsElapsed,
                months_remaining: monthsRemaining,
                groups: loan.group_id ? { group_name: loan.group_name } : null
            };
        });

        res.json(processed);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch active loans' });
    }
});

// Create a new loan application
router.post('/', async (req, res) => {
    const {
        user_id, full_name, email, phone_number, id_number, date_of_birth,
        address, loan_product, loan_amount, loan_duration_months, loan_purpose,
        employment_status, employer_name, monthly_income, group_id, group_name
    } = req.body;

    try {
        const query = `
      INSERT INTO loan_applications (
        user_id, full_name, email, phone_number, id_number, date_of_birth,
        address, loan_product, loan_amount, loan_duration_months, loan_purpose,
        employment_status, employer_name, monthly_income, group_id, group_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;
        const values = [
            user_id, full_name, email, phone_number, id_number, date_of_birth,
            address, loan_product, loan_amount, loan_duration_months, loan_purpose,
            employment_status, employer_name, monthly_income, group_id, group_name
        ];

        const { rows } = await db.query(query, values);

        // Notify Admin and Loan Officer (User)
        try {
            // In-app notification for the Loan Officer who created it
            await notificationService.createNotification(
                user_id,
                'Loan Application Submitted',
                `Application for ${full_name} (${loan_product}) has been submitted successfully.`,
                'success'
            );

            // Email to Admin (Placeholder email)
            // In a real app, fetch admin emails from DB
            await notificationService.sendEmail(
                'admin@mtgroup.com',
                'New Loan Application Submitted',
                `A new loan application for ${full_name} (${loan_product}) has been submitted by Loan Officer.`
            );
        } catch (notifyErr) {
            console.error('Error sending submission notifications:', notifyErr);
        }

        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create application' });
    }
});

// Get a single loan application with calculations
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await db.query(`
            SELECT 
                la.*,
                COALESCE(la.full_name, p.full_name) as full_name,
                COALESCE(la.email, p.email) as email,
                COALESCE(la.phone_number, p.phone_number) as phone_number,
                g.group_name
            FROM loan_applications la
            JOIN profiles p ON la.user_id = p.id
            LEFT JOIN groups g ON la.group_id = g.id
            WHERE la.id = $1
        `, [id]);

        if (rows.length === 0) return res.status(404).json({ error: 'Application not found' });

        const loan = rows[0];
        const principal = parseFloat(loan.loan_amount);
        const interestRate = 0.30;
        const totalAmount = principal * (1 + interestRate);
        const monthlyPayment = totalAmount / loan.loan_duration_months;

        const approvedDate = new Date(loan.approved_at || loan.created_at);
        const now = new Date();
        const monthsElapsed = Math.floor((now.getTime() - approvedDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
        const monthsRemaining = Math.max(0, loan.loan_duration_months - monthsElapsed);

        // Calculate actual payments from repayments table
        const { rows: payments } = await db.query('SELECT SUM(amount) as paid FROM repayments WHERE loan_application_id = $1', [id]);
        const amountPaid = parseFloat(payments[0].paid || 0);
        const remainingBalance = Math.max(0, totalAmount - amountPaid);
        const growthRate = interestRate * 100;

        res.json({
            ...loan,
            principal,
            total_amount: totalAmount,
            amount_paid: amountPaid,
            remaining_balance: remainingBalance,
            growth_rate: growthRate,
            months_elapsed: monthsElapsed,
            months_remaining: monthsRemaining,
            monthly_payment: monthlyPayment
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch application details' });
    }
});

// Update application status
router.patch('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const { rows } = await db.query(
            'UPDATE loan_applications SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (rows.length === 0) return res.status(404).json({ error: 'Application not found' });

        const application = rows[0];

        // Notify Applicant on Status Change
        try {
            const { rows: applicant } = await db.query(
                'SELECT phone_number, email, full_name, loan_product, user_id FROM loan_applications WHERE id = $1',
                [id]
            );

            // Notify Applicant
            if (applicant.length > 0) {
                const { phone_number, email, full_name, loan_product, user_id } = applicant[0];
                const subject = `Loan Application ${status.toUpperCase()}`;
                const message = `Hello ${full_name}, your ${loan_product} application has been ${status}.`;

                // SMS to Applicant
                await notificationService.sendSMS(phone_number, message);

                // Email to Applicant
                await notificationService.sendEmail(email, subject, message);

                // Notify Loan Officer (if status is approved or rejected)
                if (['approved', 'rejected'].includes(status)) {
                    // Fetch Loan Officer details
                    const { rows: officer } = await db.query('SELECT email, full_name FROM profiles WHERE id = $1', [user_id]);
                    if (officer.length > 0) {
                        const officerEmail = officer[0].email;
                        const officerName = officer[0].full_name;
                        const officerMsg = `Hello ${officerName}, the loan application for ${full_name} (${loan_product}) has been ${status}.`;

                        await notificationService.sendEmail(officerEmail, `Loan Application ${status.toUpperCase()} - ${full_name}`, officerMsg);
                    }
                }
            }
        } catch (notifyErr) {
            console.error('Error sending status notification:', notifyErr);
        }

        res.json(application);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update application status' });
    }
});

// Update application details (Edit Application)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const body = req.body;

    try {
        const query = `
            UPDATE loan_applications
            SET 
                full_name = $1, 
                email = COALESCE($2, email), 
                phone_number = $3, id_number = $4, date_of_birth = $5,
                address = $6, loan_product = $7, loan_amount = $8, loan_duration_months = $9, loan_purpose = $10,
                employment_status = $11, employer_name = $12, monthly_income = $13, group_id = $14, group_name = $15,
                guarantors = $16, group_members = $17,
                attachment_national_id = $18, attachment_lc1_letter = $19, attachment_recommendation_letter = $20, 
                attachment_passport_photo = $21, attachment_income_statement = $22,
                district = $23, division = $24, county = $25, sub_county = $26, parish = $27, village = $28,
                business_location = $29, witness_details = $30, security_type = $31, security_value = $32,
                loan_category = $33, insurance_status = $34,
                updated_at = NOW()
            WHERE id = $35
            RETURNING *
        `;

        const values = [
            body.full_name, body.email || null, body.phone_number, body.id_number, body.date_of_birth,
            body.address, body.loan_product, body.loan_amount, body.loan_duration_months, body.loan_purpose,
            body.employment_status, body.employer_name, body.monthly_income, body.group_id || null, body.group_name || null,
            JSON.stringify(body.guarantors || []), JSON.stringify(body.group_members || []),
            body.attachment_national_id || null, body.attachment_lc1_letter || null, body.attachment_recommendation_letter || null,
            body.attachment_passport_photo || null, body.attachment_income_statement || null,
            body.district || null, body.division || null, body.county || null, body.sub_county || null, body.parish || null, body.village || null,
            body.business_location || null, JSON.stringify(body.witness_details || null), body.security_type || null, body.security_value || null,
            body.loan_category || null, body.insurance_status || 'Not Insured',
            id
        ];

        console.log('Update Values:', values);

        const { rows } = await db.query(query, values);

        if (rows.length === 0) return res.status(404).json({ error: 'Application not found' });

        res.json(rows[0]);
    } catch (err) {
        console.error('Update application error DETAILS:', err);
        console.error('Error code:', err.code);
        console.error('Error routine:', err.routine);
        res.status(500).json({ error: 'Failed to update application details', details: err.message });
    }
});

module.exports = router;
