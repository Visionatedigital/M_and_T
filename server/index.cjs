const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const reportsRouter = require('./routes/reports.cjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Mock Auth Middleware for Local Development
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.split(' ')[1];
            const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
            req.user = decoded;
            console.log(`👤 Auth: Decoded token for ${decoded.email || decoded.user_id}`);
            return next();
        } catch (e) {
            console.warn('⚠️ Auth: Failed to decode mock token');
        }
    }

    // Use headers to switch roles for testing, or default to admin
    req.user = {
        user_id: req.headers['x-user-id'] || '00000000-0000-0000-0000-000000000001',
        role: req.headers['x-role'] || 'admin',
        full_name: 'Test Administrator'
    };
    console.log(`👤 Auth: Using fallback user (${req.user.role})`);
    next();
};

const db = require('./db.cjs');

// Routes
app.use('/api/reports', authMiddleware, reportsRouter);

// Database-backed API routes for offline mode
app.get('/api/clients', authMiddleware, async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM profiles ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error('API Error (clients):', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/applications', authMiddleware, async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM loan_applications ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error('API Error (applications):', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/applications/active', authMiddleware, async (req, res) => {
    try {
        const { rows } = await db.query("SELECT * FROM loan_applications WHERE status IN ('approved', 'disbursed') ORDER BY updated_at DESC");
        res.json(rows);
    } catch (err) {
        console.error('API Error (active applications):', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/applications/:id', authMiddleware, async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM loan_applications WHERE id = $1', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Application not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error('API Error (application details):', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/repayments', authMiddleware, async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM repayments ORDER BY payment_date DESC');
        res.json(rows);
    } catch (err) {
        console.error('API Error (repayments):', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/branches', authMiddleware, async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM branches ORDER BY name ASC');
        res.json(rows);
    } catch (err) {
        console.error('API Error (branches):', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/products', authMiddleware, async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM loan_products ORDER BY name ASC');
        res.json(rows);
    } catch (err) {
        console.error('API Error (products):', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/collateral', authMiddleware, async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM collateral ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error('API Error (collateral):', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Write Routes for Offline Mode
app.post('/api/applications', authMiddleware, async (req, res) => {
    try {
        const {
            full_name, email, phone_number, id_number, loan_product,
            loan_amount, loan_duration_months, loan_purpose, user_id,
            branch_name, loan_type, loan_category, group_name, district,
            division, county, village, parish, business_location, attachments
        } = req.body;

        // Ensure user exists in mock auth if not provided
        let finalUserId = user_id;
        if (!finalUserId) {
            // Check if user exists by email
            const { rows: userRows } = await db.query('SELECT id FROM auth.users WHERE email = $1', [email]);
            if (userRows.length > 0) {
                finalUserId = userRows[0].id;
            } else {
                // Create user
                const { rows: newUser } = await db.query(
                    'INSERT INTO auth.users (email) VALUES ($1) RETURNING id',
                    [email]
                );
                finalUserId = newUser[0].id;

                // Create profile
                await db.query(
                    'INSERT INTO profiles (id, full_name, first_name, last_name) VALUES ($1, $2, $3, $4)',
                    [finalUserId, full_name, full_name.split(' ')[0], full_name.split(' ')[1] || '']
                );
            }
        }

        const { rows } = await db.query(
            `INSERT INTO loan_applications 
            (user_id, full_name, email, phone_number, id_number, loan_product, loan_amount, loan_duration_months, loan_purpose, status, branch_name, loan_type, loan_category, group_name, district, division, county, village, parish, business_location, attachments) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21) RETURNING *`,
            [finalUserId, full_name, email, phone_number, id_number, loan_product, loan_amount, loan_duration_months, loan_purpose, 'pending', branch_name, loan_type, loan_category, group_name, district, division, county, village, parish, business_location, attachments]
        );
        res.json(rows[0]);
    } catch (err) {
        console.error('API Error (create application):', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.patch('/api/applications/:id/status', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updateData = {
            status,
            updated_at: new Date().toISOString()
        };

        let query = 'UPDATE loan_applications SET status = $1, updated_at = $2';
        let vals = [status, updateData.updated_at];

        if (status === 'approved' || status === 'disbursed') {
            query += ', approved_at = $3';
            vals.push(new Date().toISOString());
        }

        query += ' WHERE id = $' + (vals.length + 1) + ' RETURNING *';
        vals.push(id);

        const { rows } = await db.query(query, vals);
        if (rows.length === 0) return res.status(404).json({ error: 'Application not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error('API Error (update status):', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/repayments', authMiddleware, async (req, res) => {
    try {
        const { loan_application_id, amount, payment_method, notes } = req.body;
        const { rows } = await db.query(
            'INSERT INTO repayments (loan_application_id, amount, payment_method, notes) VALUES ($1, $2, $3, $4) RETURNING *',
            [loan_application_id, amount, payment_method, notes]
        );
        res.json(rows[0]);
    } catch (err) {
        console.error('API Error (create repayment):', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/collateral', authMiddleware, async (req, res) => {
    try {
        const { loan_application_id, type, description, estimated_value, location, registration_number } = req.body;
        const { rows } = await db.query(
            'INSERT INTO collateral (loan_application_id, type, description, estimated_value, location, registration_number, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [loan_application_id, type, description, estimated_value, location, registration_number, 'active']
        );
        res.json(rows[0]);
    } catch (err) {
        console.error('API Error (create collateral):', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/clients', authMiddleware, async (req, res) => {
    try {
        const { full_name, email, phone_number } = req.body;

        // 1. Create entry in mock auth table
        const { rows: users } = await db.query(
            'INSERT INTO auth.users (email) VALUES ($1) RETURNING id',
            [email]
        );
        const userId = users[0].id;

        // 2. Create profile
        const { rows: profiles } = await db.query(
            'INSERT INTO profiles (id, full_name, first_name, last_name, phone_number, email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [userId, full_name, full_name.split(' ')[0], full_name.split(' ')[1] || '', phone_number, email]
        );

        res.json(profiles[0]);
    } catch (err) {
        console.error('API Error (create client):', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/products', authMiddleware, async (req, res) => {
    try {
        const { name, code, description, min_amount, max_amount, base_interest_rate } = req.body;
        const { rows } = await db.query(
            'INSERT INTO loan_products (name, code, description, min_amount, max_amount, base_interest_rate, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [name, code, description, min_amount, max_amount, base_interest_rate, 'active']
        );
        res.json(rows[0]);
    } catch (err) {
        console.error('API Error (create product):', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Mock Auth Endpoints
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    console.log(`🔑 Login attempt: ${email}`);

    // Use the same mock logic as the frontend or setup script
    let user = null;
    if (email === 'admin@example.com' && (password === 'admin123' || password === 'password')) {
        user = { id: '00000000-0000-0000-0000-000000000001', email, full_name: 'Admin User', role: 'admin' };
    } else if (email === 'officer@example.com' && (password === 'officer123' || password === 'password')) {
        user = { id: '00000000-0000-0000-0000-000000000002', email, full_name: 'Loan Officer One', role: 'loan_officer' };
    }

    if (user) {
        // Generate a simple mock token
        const token = Buffer.from(JSON.stringify(user)).toString('base64');
        console.log(`✅ Login success: ${email} (${user.role})`);
        res.json({ token, user });
    } else {
        console.warn(`❌ Login failed: ${email}`);
        res.status(401).json({ error: 'Invalid local credentials' });
    }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
    res.json(req.user);
});

// AI Endpoints
app.get('/api/ai/conversations', authMiddleware, async (req, res) => {
    try {
        const { user_id } = req.user;
        const { rows } = await db.query(
            'SELECT * FROM conversations WHERE user_id = $1 ORDER BY updated_at DESC',
            [user_id]
        );
        res.json(rows);
    } catch (err) {
        console.error('API Error (get conversations):', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/ai/conversations', authMiddleware, async (req, res) => {
    try {
        const { user_id } = req.user;
        const { title } = req.body;
        const { rows } = await db.query(
            'INSERT INTO conversations (user_id, title) VALUES ($1, $2) RETURNING *',
            [user_id, title]
        );
        res.json(rows[0]);
    } catch (err) {
        console.error('API Error (create conversation):', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/ai/conversations/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM conversations WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error('API Error (delete conversation):', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/ai/conversations/:id/messages', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await db.query(
            'SELECT * FROM chat_messages WHERE conversation_id = $1 ORDER BY created_at ASC',
            [id]
        );
        res.json(rows);
    } catch (err) {
        console.error('API Error (get messages):', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/ai/conversations/:id/messages', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { role, content } = req.body;
        const { rows } = await db.query(
            'INSERT INTO chat_messages (conversation_id, role, content) VALUES ($1, $2, $3) RETURNING *',
            [id, role, content]
        );
        // Update conversation's updated_at
        await db.query('UPDATE conversations SET updated_at = NOW() WHERE id = $1', [id]);
        res.json(rows[0]);
    } catch (err) {
        console.error('API Error (save message):', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/ai/chat', authMiddleware, async (req, res) => {
    try {
        const { messages } = req.body;
        const lastMessage = messages[messages.length - 1].content.toLowerCase();

        let response = "I am your M&T Growth Gateway AI assistant. I can help you with loan statistics, client information, and general microfinance inquiries. How can I assist you today?";

        if (lastMessage.includes('loan') || lastMessage.includes('stats')) {
            response = "Currently, we have several loan applications in the system. The majority are Personal Loans. Our average interest rate is 20%. Would you like to see a more detailed report?";
        } else if (lastMessage.includes('hi') || lastMessage.includes('hello')) {
            response = "Hello! I'm here to help you manage M&T operations. What information do you need?";
        }

        // Simulating AI thinking delay
        setTimeout(() => {
            res.json({ response });
        }, 500);
    } catch (err) {
        console.error('API Error (ai chat):', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', database: 'connected' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Reports API available at http://localhost:${PORT}/api/reports`);
});
