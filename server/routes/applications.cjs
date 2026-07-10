const express = require('express');
const router = express.Router();
const db = require('../db.cjs');
const notificationService = require('../services/notificationService');
const { analyzeApplication } = require('../services/aiService.cjs');
const { isAdmin, isLoanOfficer } = require('../lib/roles.cjs');
const { sqlOfficerLoanListScope } = require('../lib/officerLoanScope.cjs');

const ALLOWED_PAYMENT_METHODS = ['cash', 'bank_transfer', 'mobile_money'];

/** YYYY-MM-DD or null — avoids PostgreSQL date errors from bad client input */
function normalizeDateOnlyInput(val) {
    if (val == null || val === '') return null;
    const s = String(val).trim();
    if (!s) return null;
    const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
    const t = Date.parse(s);
    if (Number.isNaN(t)) return null;
    return new Date(t).toISOString().slice(0, 10);
}

const normalizePaymentMethod = (value) => {
    if (!value) return null;
    const v = String(value).toLowerCase().trim();
    if (v === 'bank') return 'bank_transfer';
    if (v === 'mobile') return 'mobile_money';
    return v;
};

const getOfficerScope = (req, alias = 'la', paramIndex = 1) => {
    const role = String(req.user?.role || '').toLowerCase().trim().replace(/[\s-]+/g, '_');
    const userId = req.user?.user_id || req.user?.id;
    if (role !== 'loan_officer' || !userId) {
        return { joinSql: '', whereSql: '', values: [] };
    }
    const p = `$${paramIndex}`;
    return {
        joinSql: ` LEFT JOIN borrowers b_scope ON b_scope.id = ${alias}.borrower_id `,
        whereSql: sqlOfficerLoanListScope(alias, p),
        values: [userId]
    };
};

// Get all loan applications
router.get('/', async (req, res) => {
    try {
        const scope = getOfficerScope(req, 'la', 1);
        const values = [...scope.values];
        const whereParts = [];

        if (scope.whereSql) whereParts.push(scope.whereSql);

        if (req.query.borrower_id) {
            values.push(req.query.borrower_id);
            whereParts.push(`la.borrower_id = $${values.length}`);
        }

        const whereClause = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';

        const { rows } = await db.query(`
            SELECT la.*, g.group_name as nested_group_name 
            FROM loan_applications la
            LEFT JOIN groups g ON la.group_id = g.id
            ${scope.joinSql}
            ${whereClause}
            ORDER BY la.created_at DESC
        `, values);

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

// Get active loans (status: approved, disbursed)
router.get('/active', async (req, res) => {
    try {
        const scope = getOfficerScope(req, 'la', 1);
        const statusParam = scope.values.length + 1;
        const values = [...scope.values, ['approved', 'disbursed', 'completed', 'settled']];
        const whereParts = [
            `la.status = ANY($${statusParam}::text[])`
        ];
        if (scope.whereSql) whereParts.push(scope.whereSql);
        const whereClause = `WHERE ${whereParts.join(' AND ')}`;

        const { rows } = await db.query(`
            SELECT 
                la.*, 
                g.group_name as groups_group_name,
                COALESCE(r.total_paid, 0) as amount_paid
            FROM loan_applications la
            LEFT JOIN groups g ON la.group_id = g.id
            ${scope.joinSql}
            LEFT JOIN (
                SELECT loan_application_id, SUM(amount) as total_paid
                FROM repayments
                GROUP BY loan_application_id
            ) r ON la.id = r.loan_application_id
            ${whereClause}
            ORDER BY la.created_at DESC
        `, values);

        const processed = rows.map(loan => {
            const groupName = loan.groups_group_name || loan.group_name || null;
            const principal = parseFloat(loan.loan_amount) || 0;
            const interestRate = 0.30;
            const totalAmount = principal * (1 + interestRate);
            const approvedDate = new Date(loan.approved_at || loan.created_at);
            const now = new Date();
            const monthsElapsed = Math.floor((now.getTime() - approvedDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
            const monthsRemaining = Math.max(0, (loan.loan_duration_months || 0) - monthsElapsed);
            const amountPaid = parseFloat(loan.amount_paid || 0);
            const remainingBalance = Math.max(0, totalAmount - amountPaid);

            const { groups_group_name, ...loanRest } = loan;
            return {
                ...loanRest,
                group_name: groupName,
                groups: groupName ? { group_name: groupName } : null,
                principal,
                total_amount: totalAmount,
                amount_paid: amountPaid,
                remaining_balance: remainingBalance,
                months_elapsed: monthsElapsed,
                months_remaining: monthsRemaining
            };
        });

        res.json(processed);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch active loans' });
    }
});

/** When a loan officer logs an application, link borrowers so officer-scoped lists include them. */
async function ensureBorrowerAssignedToOfficer(borrowerId, officerUserId) {
    if (!borrowerId || !officerUserId) return;
    await db.query(
        `UPDATE borrowers SET assigned_officer_id = $1 WHERE id = $2 AND assigned_officer_id IS NULL`,
        [officerUserId, borrowerId]
    );
}

// Helper: find or create borrower (used for individual and group members)
async function findOrCreateBorrower(member, options = {}) {
    const assigningOfficerId = options.assigningOfficerId || null;
    const fullName = member.full_name || member.name;
    const phone = member.phone_number || member.phone;
    const { email, id_number, date_of_birth, district, county, sub_county, parish, village } = member;
    const emailVal = email && String(email).trim() ? String(email).trim() : '';
    const address = [village, parish, sub_county, district].filter(Boolean).join(', ') || district || village || '';

    const { rows: existing } = await db.query(
        'SELECT id FROM borrowers WHERE phone_number = $1 LIMIT 1',
        [phone]
    );
    if (existing.length > 0) {
        const id = existing[0].id;
        await ensureBorrowerAssignedToOfficer(id, assigningOfficerId);
        return id;
    }

    const { rows: created } = await db.query(`
        INSERT INTO borrowers (full_name, email, phone_number, id_number, date_of_birth, address, city, assigned_officer_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
    `, [fullName, emailVal, phone, id_number || null, date_of_birth || null, address, district || village || '', assigningOfficerId]);
    return created[0].id;
}

// Create application
router.post('/', async (req, res) => {
        const {
            full_name, email, phone_number, id_number, loan_product,
            loan_amount, loan_duration_months, loan_purpose, user_id,
            branch_name, loan_type, loan_category, group_id, group_name,
            district, division, county, village, parish, business_location,
            application_type, group_members, security_type, security_value, guarantors,
            date_of_birth, address,
            attachment_national_id, attachment_lc1_letter, attachment_recommendation_letter,
            attachment_passport_photo, attachment_income_statement, attachment_uploaded_at
        } = req.body;

    const officerUserIdForAssign =
        isLoanOfficer(req.user?.role) ? (req.user?.user_id || req.user?.id) : null;
    const borrowerOpts = { assigningOfficerId: officerUserIdForAssign };

    try {
        await db.query('BEGIN');

        let borrower_id, finalGroupId = group_id, finalGroupName = group_name;
        let finalGroupMembers = group_members || [];

        if (application_type === 'group' && group_name) {
            // ========== GROUP LOAN: Group leader = existing borrower (selected); other members = selected borrowers ==========
            const leaderBorrowerId = req.body.borrower_id;
            const groupLeaderAmount = parseFloat(req.body.group_leader_amount) || 0;
            const others = (group_members || []).map(m => ({
                borrower_id: m.borrower_id,
                full_name: m.name || m.full_name,
                name: m.name || m.full_name,
                phone_number: m.phone || m.phone_number,
                phone: m.phone || m.phone_number,
                id_number: m.id_number,
                email: m.email,
                date_of_birth: m.date_of_birth,
                district: m.district,
                county: m.county || m.province_state,
                sub_county: m.sub_county,
                parish: m.parish,
                village: m.village || m.address,
                amount: parseFloat(m.amount) || 0
            })).filter(m => m.borrower_id || ((m.full_name || m.name) && (m.phone_number || m.phone)));

            const membersWithBorrowerIds = [];

            if (leaderBorrowerId) {
                borrower_id = leaderBorrowerId;
                await ensureBorrowerAssignedToOfficer(leaderBorrowerId, officerUserIdForAssign);
                membersWithBorrowerIds.push({
                    borrower_id: leaderBorrowerId,
                    name: full_name,
                    phone: phone_number,
                    id_number,
                    email,
                    date_of_birth: req.body.date_of_birth,
                    district,
                    county,
                    village,
                    amount: groupLeaderAmount
                });
            } else {
                borrower_id = await findOrCreateBorrower({
                    full_name, email, phone_number, id_number,
                    date_of_birth: req.body.date_of_birth,
                    district, county, sub_county: req.body.sub_county, parish, village
                }, borrowerOpts);
                membersWithBorrowerIds.push({
                    borrower_id,
                    name: full_name,
                    phone: phone_number,
                    id_number,
                    email,
                    date_of_birth: req.body.date_of_birth,
                    district,
                    county,
                    village,
                    amount: groupLeaderAmount
                });
            }

            for (const m of others) {
                let bid;
                if (m.borrower_id) {
                    bid = m.borrower_id;
                    await ensureBorrowerAssignedToOfficer(bid, officerUserIdForAssign);
                } else {
                    bid = await findOrCreateBorrower(m, borrowerOpts);
                }
                membersWithBorrowerIds.push({
                    borrower_id: bid,
                    name: m.full_name || m.name,
                    phone: m.phone_number || m.phone,
                    id_number: m.id_number,
                    email: m.email,
                    date_of_birth: m.date_of_birth,
                    district: m.district,
                    county: m.county,
                    village: m.village,
                    amount: m.amount || 0
                });
            }

            finalGroupMembers = membersWithBorrowerIds;

            if (!finalGroupId) {
                const { rows: groupRows } = await db.query(`
                    INSERT INTO groups (group_name, description, status)
                    VALUES ($1, $2, 'active')
                    RETURNING id
                `, [group_name, `Group loan - ${membersWithBorrowerIds.length} members`]);
                finalGroupId = groupRows[0]?.id;
            }
        } else {
            // ========== INDIVIDUAL LOAN: Existing logic ==========
            borrower_id = req.body.borrower_id;
            if (!borrower_id) {
                borrower_id = await findOrCreateBorrower({
                    full_name, email, phone_number, id_number,
                    date_of_birth: req.body.date_of_birth,
                    district, county, sub_county: req.body.sub_county, parish, village
                }, borrowerOpts);
            } else {
                await ensureBorrowerAssignedToOfficer(borrower_id, officerUserIdForAssign);
            }
        }

        const guarantorsNormalized = (guarantors || []).map(g => ({
            name: g.name || g.full_name,
            phone: g.phone || g.phone_number,
            id_number: g.id_number || g.nin,
            address: g.address
        })).filter(g => g.name || g.phone);

        const addressVal = address || [village, parish, req.body.sub_county, district].filter(Boolean).join(', ') || 'N/A';
        const dateOfBirthVal = date_of_birth || '1990-01-01'; // Required by schema; fallback when not provided

        const repaymentFreq = req.body.repayment_frequency || 'monthly';
        const interestMethod = req.body.interest_method || 'flat_rate';
        const interestRate = req.body.interest_rate != null ? parseFloat(req.body.interest_rate) : null;
        const interestFixedAmount = req.body.interest_fixed_amount != null ? parseFloat(req.body.interest_fixed_amount) : null;
        const durationUnit = req.body.duration_unit || 'months';

        const applicationDate = normalizeDateOnlyInput(req.body.application_date || req.body.created_on);
        if (applicationDate) {
            const today = new Date().toISOString().slice(0, 10);
            if (applicationDate > today) {
                await db.query('ROLLBACK');
                return res.status(400).json({ error: 'Application date cannot be in the future.' });
            }
        }

        const values = [
            user_id, full_name, email, phone_number, id_number, dateOfBirthVal, addressVal,
            loan_product, loan_amount, loan_duration_months, loan_purpose, 'Self-Employed', 'pending',
            loan_category || null, finalGroupId || null, finalGroupName || null,
            JSON.stringify(finalGroupMembers),
            JSON.stringify(guarantorsNormalized),
            district || null, division || null, county || null, req.body.sub_county || null, parish || null, village || null, business_location || null,
            attachment_national_id || null, attachment_lc1_letter || null, attachment_recommendation_letter || null,
            attachment_passport_photo || null, attachment_income_statement || null, attachment_uploaded_at || null,
            security_type || null, security_value ? parseFloat(security_value) : null,
            repaymentFreq, interestMethod, interestRate, interestFixedAmount, durationUnit
        ];
        const cols = [
            'user_id', 'full_name', 'email', 'phone_number', 'id_number', 'date_of_birth', 'address',
            'loan_product', 'loan_amount', 'loan_duration_months', 'loan_purpose', 'employment_status', 'status',
            'loan_category', 'group_id', 'group_name', 'group_members', 'guarantors',
            'district', 'division', 'county', 'sub_county', 'parish', 'village', 'business_location',
            'attachment_national_id', 'attachment_lc1_letter', 'attachment_recommendation_letter',
            'attachment_passport_photo', 'attachment_income_statement', 'attachment_uploaded_at',
            'security_type', 'security_value',
            'repayment_frequency', 'interest_method', 'interest_rate', 'interest_fixed_amount', 'duration_unit'
        ];
        if (applicationDate) {
            cols.push('created_at');
            values.push(applicationDate);
        }
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
        const query = `INSERT INTO loan_applications (${cols.join(', ')}) VALUES (${placeholders}) RETURNING *`;

        const { rows } = await db.query(query, values);
        await db.query('COMMIT');

        try {
            await notificationService.createNotification(
                user_id,
                'Application Received',
                `Loan application for ${full_name}${finalGroupName ? ` (${finalGroupName})` : ''} has been submitted.`,
                'success'
            );
        } catch (nErr) {}

        res.status(201).json(rows[0]);
    } catch (err) {
        await db.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Failed to create application' });
    }
});

// Get single application by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const scope = getOfficerScope(req, 'la', 2);
        const whereClause = scope.whereSql
            ? `WHERE la.id = $1 AND ${scope.whereSql}`
            : 'WHERE la.id = $1';
        const { rows } = await db.query(`
            SELECT la.*, g.group_name as nested_group_name
            FROM loan_applications la
            LEFT JOIN groups g ON la.group_id = g.id
            ${scope.joinSql}
            ${whereClause}
        `, [id, ...scope.values]);
        if (rows.length === 0) return res.status(404).json({ error: 'Application not found' });
        const loan = rows[0];
        const principal = parseFloat(loan.loan_amount) || 0;
        const interestRate = 0.30;
        const totalAmount = principal * (1 + interestRate);
        const approvedDate = new Date(loan.approved_at || loan.created_at);
        const now = new Date();
        const monthsElapsed = Math.floor((now.getTime() - approvedDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
        const monthsRemaining = Math.max(0, (loan.loan_duration_months || 0) - monthsElapsed);
        const { rows: payRows } = await db.query('SELECT SUM(amount) as paid FROM repayments WHERE loan_application_id = $1', [id]);
        const amountPaid = parseFloat(payRows[0]?.paid || 0);
        const remainingBalance = Math.max(0, totalAmount - amountPaid);
        const isGroupLoan = loan.loan_product === 'Group Loan' || !!loan.group_id;
        const numInstallments = isGroupLoan ? Math.ceil((loan.loan_duration_months || 4) * 4.33) : (loan.loan_duration_months || 4);
        const monthlyPayment = totalAmount / numInstallments;
        res.json({
            ...loan,
            group_name: loan.group_name || loan.nested_group_name || null,
            principal,
            total_amount: totalAmount,
            amount_paid: amountPaid,
            remaining_balance: remainingBalance,
            growth_rate: interestRate * 100,
            months_elapsed: monthsElapsed,
            months_remaining: monthsRemaining,
            monthly_payment: monthlyPayment,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch application details' });
    }
});

// AI analysis of application
router.post('/:id/analyze', async (req, res) => {
    const { id } = req.params;
    try {
        const scope = getOfficerScope(req, 'la', 2);
        const whereClause = scope.whereSql
            ? `WHERE la.id = $1 AND ${scope.whereSql}`
            : 'WHERE la.id = $1';
        const { rows } = await db.query(`
            SELECT la.*, g.group_name as nested_group_name
            FROM loan_applications la
            LEFT JOIN groups g ON la.group_id = g.id
            ${scope.joinSql}
            ${whereClause}
        `, [id, ...scope.values]);
        if (rows.length === 0) return res.status(404).json({ error: 'Application not found' });
        const app = rows[0];
        const application = {
            ...app,
            group_name: app.group_name || app.nested_group_name || null
        };

        let borrowerHistory = {};
        if (app.borrower_id) {
            const { rows: loanRows } = await db.query(`
                SELECT la.loan_amount, la.loan_duration_months, la.status
                FROM loan_applications la
                WHERE la.borrower_id = $1 AND la.id != $2
            `, [app.borrower_id, id]);
            const { rows: payRows } = await db.query(`
                SELECT COALESCE(SUM(r.amount), 0) as total_paid
                FROM repayments r
                JOIN loan_applications la ON r.loan_application_id = la.id
                WHERE la.borrower_id = $1
            `, [app.borrower_id]);
            borrowerHistory = {
                pastLoans: loanRows.length,
                totalPaid: parseFloat(payRows[0]?.total_paid || 0)
            };
            try {
                const { calculateClientScore } = require('../services/scoreService.cjs');
                const scoreResult = await calculateClientScore(app.borrower_id);
                borrowerHistory.creditScore = scoreResult?.score ?? scoreResult?.rating;
            } catch (_) { /* ignore */ }
        }

        const analysis = await analyzeApplication(application, borrowerHistory);
        res.json({ analysis });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to analyze application' });
    }
});

// Update status (approve / reject / disburse) — administrators only
router.patch('/:id/status', async (req, res) => {
    if (!isAdmin(req.user?.role)) {
        return res.status(403).json({ error: 'Only administrators can change application status (approve, reject, disburse).' });
    }
    const { id } = req.params;
    const { status } = req.body;
    const actingUser = req.user?.user_id || '00000000-0000-0000-0000-000000000000';
    const approvedAtOverride = normalizeDateOnlyInput(req.body.approved_at);
    const disbursementEntryDate =
        normalizeDateOnlyInput(req.body.disbursement_entry_date) || approvedAtOverride;

    const today = new Date().toISOString().slice(0, 10);
    if (approvedAtOverride && approvedAtOverride > today) {
        return res.status(400).json({ error: 'Approval date cannot be in the future.' });
    }
    if (disbursementEntryDate && disbursementEntryDate > today) {
        return res.status(400).json({ error: 'Disbursement / accounting date cannot be in the future.' });
    }

    try {
        const { rows: prevRows } = await db.query(
            `
            SELECT la.status, la.loan_amount, la.full_name, la.loan_product, la.phone_number
            FROM loan_applications la
            WHERE la.id = $1
            `,
            [id]
        );
        const prevLoan = prevRows[0];
        if (!prevLoan) return res.status(404).json({ error: 'Application not found' });

        const { rows } = await db.query(
            `
            UPDATE loan_applications la
            SET status = $1, updated_at = NOW(),
                approved_at = CASE
                    WHEN $1::text NOT IN ('approved', 'disbursed') THEN la.approved_at
                    WHEN $3::date IS NOT NULL THEN ($3::date)::timestamptz
                    WHEN la.approved_at IS NOT NULL THEN la.approved_at
                    ELSE NOW()
                END
            WHERE la.id = $2
            RETURNING la.*
            `,
            [status, id, approvedAtOverride || null]
        );

        if (rows.length === 0) return res.status(404).json({ error: 'Application not found' });

        const isNowDisbursed = ['approved', 'disbursed'].includes(status);
        const wasDisbursedBefore = prevLoan && ['approved', 'disbursed'].includes(prevLoan.status);

        if (isNowDisbursed && !wasDisbursedBefore && prevLoan) {
            const amount = parseFloat(prevLoan.loan_amount) || 0;
            const disbursementMethod = normalizePaymentMethod(req.body.disbursement_method || req.body.payment_method);
            const disbursementAccount = req.body.disbursement_account || '';

            if (!disbursementMethod || !ALLOWED_PAYMENT_METHODS.includes(disbursementMethod)) {
                return res.status(400).json({ error: 'Valid disbursement_method is required (cash, bank_transfer, mobile_money)' });
            }
            
            if (amount > 0) {
                const entryDate =
                    disbursementEntryDate || approvedAtOverride || new Date().toISOString().split('T')[0];
                await db.query(`
                    INSERT INTO accounting_entries
                        (entry_type, category, description, amount, entry_date, payment_method, reference_id, recorded_by)
                    VALUES ('expense', 'Loan Disbursement', $1, $2, $3, $4, $5, $6)
                `, [
                    `Loan Disbursement - ${prevLoan.full_name}${disbursementAccount ? ' (' + disbursementAccount + ')' : ''}`, 
                    amount, 
                    entryDate, 
                    disbursementMethod, 
                    id, 
                    actingUser
                ]);
            }
        }

        // Notify
        try {
            const msg = `Hello ${prevLoan.full_name}, your loan application has been ${status}.`;
            await notificationService.sendSMS(prevLoan.phone_number, msg);
        } catch (nErr) {}

        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// Update details
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const body = req.body;
    try {
        const scope = getOfficerScope(req, 'la', 2);
        if (scope.whereSql) {
            const accessCheck = await db.query(
                `
                SELECT la.id
                FROM loan_applications la
                ${scope.joinSql}
                WHERE la.id = $1 AND ${scope.whereSql}
                LIMIT 1
                `,
                [id, ...scope.values]
            );
            if (accessCheck.rows.length === 0) {
                return res.status(404).json({ error: 'Not found' });
            }
        }

        const groupMembersJson = body.group_members ? JSON.stringify(body.group_members) : null;
        const guarantorsNormalized = body.guarantors ? (body.guarantors || []).map(g => ({
            name: g.name || g.full_name,
            phone: g.phone || g.phone_number,
            id_number: g.id_number || g.nin,
            address: g.address
        })).filter(g => g.name || g.phone) : null;
        const guarantorsJson = guarantorsNormalized ? JSON.stringify(guarantorsNormalized) : null;

        let extraSql = '';
        const values = [
            body.full_name, body.email, body.phone_number, body.id_number,
            body.loan_product, body.loan_amount, body.loan_duration_months, body.loan_purpose,
            body.branch_name, body.loan_type, body.loan_category, body.group_id || null, body.group_name || null,
            groupMembersJson,
            guarantorsJson,
            body.district, body.division, body.county, body.village, body.parish,
            body.business_location, body.security_type || null, body.security_value ? parseFloat(body.security_value) : null,
            body.repayment_frequency || null, body.interest_method || null, body.interest_rate != null ? parseFloat(body.interest_rate) : null, body.interest_fixed_amount != null ? parseFloat(body.interest_fixed_amount) : null, body.duration_unit || null,
            body.attachment_national_id ?? null,
            body.attachment_lc1_letter ?? null,
            body.attachment_recommendation_letter ?? null,
            body.attachment_passport_photo ?? null,
            body.attachment_income_statement ?? null,
            body.attachment_uploaded_at ?? null,
        ];
        let p = values.length + 1;
        const todayPut = new Date().toISOString().slice(0, 10);
        if (isAdmin(req.user?.role)) {
            const c = normalizeDateOnlyInput(body.application_date || body.created_at);
            if (c) {
                if (c > todayPut) {
                    return res.status(400).json({ error: 'Application date cannot be in the future.' });
                }
                extraSql += `, created_at = $${p}::date::timestamptz`;
                values.push(c);
                p += 1;
            }
            const ap = normalizeDateOnlyInput(body.approved_at);
            if (body.approved_at !== undefined && ap) {
                if (ap > todayPut) {
                    return res.status(400).json({ error: 'Approval date cannot be in the future.' });
                }
                extraSql += `, approved_at = $${p}::date::timestamptz`;
                values.push(ap);
                p += 1;
            }
        }
        values.push(id);
        const idParam = p;

        const query = `
            UPDATE loan_applications
            SET 
                full_name = $1, email = $2, phone_number = $3, id_number = $4,
                loan_product = $5, loan_amount = $6, loan_duration_months = $7, loan_purpose = $8,
                branch_name = $9, loan_type = $10, loan_category = $11, group_id = $12, group_name = $13,
                group_members = COALESCE($14, group_members),
                guarantors = COALESCE($15, guarantors),
                district = $16, division = $17, county = $18, village = $19, parish = $20, 
                business_location = $21, security_type = $22, security_value = $23,
                repayment_frequency = COALESCE($24, repayment_frequency),
                interest_method = COALESCE($25, interest_method),
                interest_rate = COALESCE($26, interest_rate),
                interest_fixed_amount = COALESCE($27, interest_fixed_amount),
                duration_unit = COALESCE($28, duration_unit),
                attachment_national_id = $29,
                attachment_lc1_letter = $30,
                attachment_recommendation_letter = $31,
                attachment_passport_photo = $32,
                attachment_income_statement = $33,
                attachment_uploaded_at = $34,
                updated_at = NOW()
                ${extraSql}
            WHERE id = $${idParam}
            RETURNING *
        `;
        const { rows } = await db.query(query, values);
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error('Application PUT error:', err);
        const msg = err && err.message ? String(err.message) : 'Failed to update';
        res.status(500).json({ error: msg });
    }
});

module.exports = router;
