const express = require('express');
const router = express.Router();
const db = require('../db.cjs');
const { isAdmin, isLoanOfficer } = require('../lib/roles.cjs');

const { calculateClientScore } = require('../services/scoreService');

// Get all borrowers with aggregated loan data
router.get('/', async (req, res) => {
  const isGroup = req.query.isGroup === 'true';

  try {
    if (isGroup) {
      const { rows } = await db.query(`
                SELECT 
                    g.id,
                    g.group_name as full_name,
                    'Group Account' as email,
                    (SELECT b.phone_number FROM loan_applications la
                     JOIN borrowers b ON la.borrower_id = b.id
                     WHERE la.group_id = g.id LIMIT 1) as phone_number,
                    g.created_at,
                    COUNT(la.id) as total_loans,
                    SUM(COALESCE(la.loan_amount, 0)) as total_borrowed,
                    COALESCE((
                        SELECT SUM(amount) FROM repayments r 
                        JOIN loan_applications la2 ON r.loan_application_id = la2.id 
                        WHERE la2.group_id = g.id
                    ), 0) as total_paid,
                    true as is_group
                FROM groups g
                LEFT JOIN loan_applications la ON g.id = la.group_id AND la.status != 'rejected'
                GROUP BY g.id
                ORDER BY g.group_name
            `);

      const processed = rows.map(r => ({
        ...r,
        total_paid: parseFloat(r.total_paid || 0),
        open_loans_balance: Math.max(0, (parseFloat(r.total_borrowed || 0) * 1.3) - parseFloat(r.total_paid || 0)),
        status: (parseFloat(r.total_borrowed || 0) * 1.3) <= parseFloat(r.total_paid || 0) ? 'Fully Paid' : 'Current'
      }));
      return res.json(processed);
    }

    const role = req.user?.role;
    const userId = req.user?.user_id || req.user?.id;
    const isLoanOfficer = role === 'loan_officer';

    let borrowerWhere = `b.full_name NOT IN (
                SELECT p.full_name FROM profiles p
                JOIN user_roles ur ON p.id = ur.user_id
                WHERE ur.role::text IN ('admin', 'loan_officer')
            )`;
    const borrowerValues = [];
    if (isLoanOfficer && userId) {
      borrowerWhere = `b.assigned_officer_id = $1`;
      borrowerValues.push(userId);
    }

    const { rows } = await db.query(`
            SELECT 
                b.*,
                COUNT(la.id) as total_loans,
                SUM(COALESCE(la.loan_amount, 0)) as total_borrowed,
                COALESCE((
                    SELECT SUM(amount) FROM repayments r 
                    JOIN loan_applications la2 ON r.loan_application_id = la2.id 
                    WHERE la2.borrower_id = b.id
                ), 0) as total_paid
            FROM borrowers b
            LEFT JOIN loan_applications la ON b.id = la.borrower_id AND la.status != 'rejected'
            WHERE ${borrowerWhere}
            GROUP BY b.id
            ORDER BY b.full_name
        `, borrowerValues.length ? borrowerValues : []);

    const processed = await Promise.all(rows.map(async (r) => {
      const total_borrowed_with_interest = parseFloat(r.total_borrowed || 0) * 1.3; 
      const total_paid = parseFloat(r.total_paid || 0);
      const balance = Math.max(0, total_borrowed_with_interest - total_paid);

      return {
        ...r,
        total_loans: parseInt(r.total_loans),
        total_borrowed: parseFloat(r.total_borrowed || 0),
        total_paid: total_paid,
        open_loans_balance: balance,
        status: balance <= 0 && r.total_loans > 0 ? 'Fully Paid' : (r.total_loans > 0 ? 'Current' : 'New')
      };
    }));

    res.json(processed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch borrowers' });
  }
});

// Update borrower location
router.put('/:id/location', async (req, res) => {
  const { id } = req.params;
  const { district, county, sub_county, parish, village, latitude, longitude } = req.body;

  try {
    await db.query(`
      UPDATE borrowers 
      SET 
        address = $1, 
        district = $2,
        city = $3,
        province_state = $4,
        village = $5,
        latitude = $6,
        longitude = $7,
        updated_at = NOW() 
      WHERE id = $8
    `, [`${village}, ${district}`, district, district, county, village, latitude, longitude, id]);

    res.json({ message: 'Location updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Get borrower's attachments from their most recent loan application
router.get('/:id/attachments', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT attachment_national_id, attachment_lc1_letter, attachment_recommendation_letter,
             attachment_passport_photo, attachment_income_statement
      FROM loan_applications
      WHERE borrower_id = $1
        AND (attachment_national_id IS NOT NULL OR attachment_lc1_letter IS NOT NULL
             OR attachment_recommendation_letter IS NOT NULL OR attachment_passport_photo IS NOT NULL
             OR attachment_income_statement IS NOT NULL)
      ORDER BY created_at DESC
      LIMIT 1
    `, [req.params.id]);
    if (rows.length === 0) return res.json({});
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch borrower attachments' });
  }
});

// Update borrower profile (staff)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.user_id || req.user?.id;
  const role = req.user?.role;

  if (!isAdmin(role) && !isLoanOfficer(role)) {
    return res.status(403).json({ error: 'Staff access required.' });
  }

  if (isLoanOfficer(role) && userId) {
    const { rows: access } = await db.query(
      'SELECT id FROM borrowers WHERE id = $1 AND assigned_officer_id = $2',
      [id, userId]
    );
    if (access.length === 0) {
      return res.status(403).json({ error: 'You can only edit borrowers assigned to you.' });
    }
  }

  const allowed = [
    'full_name', 'email', 'phone_number', 'first_name', 'last_middle_name',
    'business_name', 'address', 'district', 'village', 'landline_phone', 'description',
    'city', 'province_state', 'zipcode', 'gender', 'title', 'working_status', 'unique_number',
    'country', 'id_number', 'borrower_photo',
  ];
  const body = req.body || {};
  const updates = [];
  const values = [];
  let idx = 1;
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      updates.push(`${key} = $${idx}`);
      values.push(body[key] === '' ? null : body[key]);
      idx += 1;
    }
  }
  if (Object.prototype.hasOwnProperty.call(body, 'borrower_files')) {
    const bf = body.borrower_files;
    const arr = bf == null ? null : (Array.isArray(bf) ? bf : [bf]);
    updates.push(`borrower_files = $${idx}`);
    values.push(arr);
    idx += 1;
  }
  if (Object.prototype.hasOwnProperty.call(body, 'assigned_officer_id')) {
    if (!isAdmin(role)) {
      return res.status(403).json({ error: 'Only administrators can change loan officer assignment.' });
    }
    const aid = body.assigned_officer_id;
    updates.push(`assigned_officer_id = $${idx}`);
    values.push(aid === '' || aid == null ? null : aid);
    idx += 1;
  }
  if (Object.prototype.hasOwnProperty.call(body, 'credit_score')) {
    if (!isAdmin(role)) {
      return res.status(403).json({ error: 'Only administrators can edit credit score.' });
    }
    updates.push(`credit_score = $${idx}`);
    const cs = body.credit_score;
    values.push(cs === '' || cs == null ? null : Number(cs));
    idx += 1;
  }
  if (Object.prototype.hasOwnProperty.call(body, 'dob') || Object.prototype.hasOwnProperty.call(body, 'date_of_birth')) {
    const d = body.dob !== undefined ? body.dob : body.date_of_birth;
    updates.push(`date_of_birth = $${idx}`);
    values.push(d === '' || d == null ? null : d);
    idx += 1;
  }
  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  values.push(id);

  try {
    const { rows } = await db.query(
      `UPDATE borrowers SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
      values
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Borrower not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update borrower' });
  }
});

// Get borrower by ID
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        b.*,
        COUNT(la.id) as total_loans,
        SUM(COALESCE(la.loan_amount, 0)) as total_borrowed,
        COALESCE((
          SELECT SUM(amount) FROM repayments r 
          JOIN loan_applications la2 ON r.loan_application_id = la2.id 
          WHERE la2.borrower_id = b.id
        ), 0) as total_paid
      FROM borrowers b
      LEFT JOIN loan_applications la ON b.id = la.borrower_id AND la.status != 'rejected'
      WHERE b.id = $1
      GROUP BY b.id
    `, [req.params.id]);

    if (rows.length === 0) return res.status(404).json({ error: 'Borrower not found' });

    const borrower = rows[0];
    const total_borrowed_with_interest = parseFloat(borrower.total_borrowed || 0) * 1.3;
    const total_paid = parseFloat(borrower.total_paid || 0);
    const balance = Math.max(0, total_borrowed_with_interest - total_paid);

    const response = {
      ...borrower,
      total_loans: parseInt(borrower.total_loans),
      total_borrowed: parseFloat(borrower.total_borrowed || 0),
      total_paid: total_paid,
      open_loans_balance: balance,
      status: balance <= 0 && borrower.total_loans > 0 ? 'Fully Paid' : (borrower.total_loans > 0 ? 'Current' : 'New')
    };

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch borrower' });
  }
});

// Create new borrower
router.post('/', async (req, res) => {
  const {
    full_name, email, phone_number, first_name, last_middle_name,
    business_name, unique_number, country, address, city,
    province_state, zipcode, gender, title, working_status, credit_score,
    dob, landline_phone, description,
    borrower_photo, borrower_files, assigned_officer_id,
    district, village
  } = req.body;

  try {
    const query = `
            INSERT INTO borrowers (
                full_name, email, phone_number, first_name, last_middle_name,
                business_name, unique_number, country, address, city,
                province_state, zipcode, gender, title, working_status, credit_score,
                date_of_birth, landline_phone, description,
                borrower_photo, borrower_files, assigned_officer_id,
                district, village
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
            RETURNING *
        `;
    const assignedOfficerId = (assigned_officer_id && typeof assigned_officer_id === 'string' && assigned_officer_id.length > 10) ? assigned_officer_id : null;

    const values = [
      full_name, email, phone_number, first_name, last_middle_name,
      business_name, unique_number, country || 'Uganda', address, city,
      province_state, zipcode, gender, title, working_status, credit_score || 300,
      dob || null, landline_phone, description,
      borrower_photo, borrower_files ? [borrower_files] : null, assignedOfficerId,
      district || null, village || null
    ];

    const { rows } = await db.query(query, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('❌ Error creating borrower:');
    console.error('  Message:', err.message);
    res.status(500).json({ error: 'Failed to create borrower: ' + err.message });
  }
});

module.exports = router;
