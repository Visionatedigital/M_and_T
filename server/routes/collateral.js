const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all collateral with enriched data
router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query(`
            SELECT 
                c.*,
                la.full_name as loan_client_name,
                EXISTS (
                    SELECT 1 FROM collateral_insurance ci 
                    WHERE ci.collateral_id = c.id AND ci.status = 'active'
                ) as has_insurance
            FROM collateral c
            LEFT JOIN loan_applications la ON c.loan_application_id = la.id
            ORDER BY c.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch collateral' });
    }
});

// Create collateral
router.post('/', async (req, res) => {
    const {
        loan_application_id, type, description, estimated_value, current_value, status, notes
    } = req.body;

    try {
        const query = `
      INSERT INTO collateral (
        loan_application_id, type, description, estimated_value, current_value, status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
        const values = [loan_application_id, type, description, estimated_value, current_value, status, notes];

        const { rows } = await db.query(query, values);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create collateral' });
    }
});

module.exports = router;
