const express = require('express');
const router = express.Router();
const db = require('../db');

const { calculateClientScore } = require('../services/scoreService');

// Get all clients (profiles) with aggregated loan data
router.get('/', async (req, res) => {
  const isGroup = req.query.isGroup === 'true';

  try {
    if (isGroup) {
      // ... (keep existing group logic)
      const { rows } = await db.query(`
        SELECT 
          g.id,
          g.group_name as full_name,
          'Group Account' as email,
          g.group_leader_phone as phone_number,
          g.created_at,
          COUNT(la.id) as total_loans,
          COUNT(CASE WHEN la.status IN ('approved', 'disbursed') THEN 1 END) as active_loans,
          SUM(COALESCE(la.loan_amount, 0) * 1.3) as total_borrowed,
          (
            SELECT SUM(COALESCE(r.amount, 0))
            FROM repayments r
            JOIN loan_applications la2 ON r.loan_application_id = la2.id
            WHERE la2.group_id = g.id
          ) as total_repaid,
          true as is_group
        FROM groups g
        LEFT JOIN loan_applications la ON g.id = la.group_id
          AND la.status != 'rejected'
        GROUP BY g.id
        ORDER BY g.group_name
      `);

      const processed = rows.map(r => ({
        ...r,
        total_loans: parseInt(r.total_loans),
        active_loans: parseInt(r.active_loans),
        total_borrowed: parseFloat(r.total_borrowed || 0),
        total_repaid: parseFloat(r.total_repaid || 0),
        is_group: true,
        credit_score: 300 // Groups default to 300 for now, or implement group scoring later
      }));
      return res.json(processed);
    }

    const { rows } = await db.query(`
      SELECT 
        p.*,
        COUNT(la.id) as total_loans,
        COUNT(CASE WHEN la.status IN ('approved', 'disbursed') THEN 1 END) as active_loans,
        SUM(COALESCE(la.loan_amount, 0) * 1.3) as total_borrowed,
        (
          SELECT SUM(COALESCE(r.amount, 0))
          FROM repayments r
          JOIN loan_applications la2 ON r.loan_application_id = la2.id
          WHERE la2.user_id = p.id
        ) as total_repaid
      FROM profiles p
      LEFT JOIN loan_applications la ON p.id = la.user_id
        AND la.status != 'rejected'
      GROUP BY p.id
      ORDER BY p.full_name
    `);

    // Convert string numbers to Actual Numbers AND Add Credit Score
    const processed = await Promise.all(rows.map(async (r) => {
      const { score } = await calculateClientScore(r.id);
      return {
        ...r,
        total_loans: parseInt(r.total_loans),
        active_loans: parseInt(r.active_loans),
        total_borrowed: parseFloat(r.total_borrowed || 0),
        total_repaid: parseFloat(r.total_repaid || 0),
        is_group: false,
        credit_score: score
      };
    }));

    res.json(processed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// Update client location (updates the profile or the most recent loan)
router.put('/:id/location', async (req, res) => {
  const { id } = req.params;
  const { district, county, sub_county, parish, village, latitude, longitude } = req.body;

  try {
    // We update the profile with latest address
    await db.query(`
      UPDATE profiles 
      SET address = $1, updated_at = NOW() 
      WHERE id = $2
    `, [`${village}, ${district}`, id]);

    // Also update the most recent loan application to keep it synced
    await db.query(`
      UPDATE loan_applications 
      SET 
        district = $1, county = $2, sub_county = $3, 
        parish = $4, village = $5, latitude = $6, longitude = $7,
        updated_at = NOW()
      WHERE id = (
        SELECT id FROM loan_applications 
        WHERE user_id = $8 
        ORDER BY created_at DESC 
        LIMIT 1
      )
    `, [district, county, sub_county, parish, village, latitude, longitude, id]);

    res.json({ message: 'Location updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Get client by ID
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        p.*,
        COUNT(la.id) as total_loans,
        COUNT(CASE WHEN la.status IN ('approved', 'disbursed') THEN 1 END) as active_loans,
        SUM(COALESCE(la.loan_amount, 0) * 1.3) as total_borrowed,
        (
          SELECT SUM(COALESCE(r.amount, 0))
          FROM repayments r
          JOIN loan_applications la2 ON r.loan_application_id = la2.id
          WHERE la2.user_id = p.id
        ) as total_repaid
      FROM profiles p
      LEFT JOIN loan_applications la ON p.id = la.user_id
        AND la.status != 'rejected'
      WHERE p.id = $1
      GROUP BY p.id
    `, [req.params.id]);

    if (rows.length === 0) return res.status(404).json({ error: 'Client not found' });

    const client = rows[0];
    const { score } = await calculateClientScore(client.id);

    // Convert numeric fields
    const response = {
      ...client,
      total_loans: parseInt(client.total_loans),
      active_loans: parseInt(client.active_loans),
      total_borrowed: parseFloat(client.total_borrowed || 0),
      total_repaid: parseFloat(client.total_repaid || 0),
      credit_score: score
    };

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

module.exports = router;
