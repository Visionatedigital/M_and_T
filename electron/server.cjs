/**
 * Embedded Express Server for M&T Growth Gateway Desktop
 * Uses SQLite via better-sqlite3 instead of PostgreSQL.
 * Runs inside the Electron main process.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase, getDb } = require('./database.cjs');
const { v4: uuidv4 } = require('uuid');

let serverInstance = null;

/**
 * Start the embedded Express server
 * @param {string} userDataPath - Electron's user data directory for storing the database
 * @returns {Promise<http.Server>} The HTTP server instance
 */
async function startServer(userDataPath) {
    // Initialize SQLite database
    initDatabase(userDataPath);

    const app = express();
    const PORT = 3000;

    // Middleware
    app.use(cors());
    app.use(express.json());

    // Request logging (lightweight for desktop)
    app.use((req, res, next) => {
        if (req.path !== '/health') {
            console.log(`${req.method} ${req.path}`);
        }
        next();
    });

    // Auth Middleware (mock for desktop — desktop app is single-user trusted)
    const authMiddleware = (req, res, next) => {
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.split(' ')[1];
                const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
                req.user = decoded;
                return next();
            } catch (e) {
                console.warn('⚠️ Auth: Failed to decode token');
            }
        }
        // Default to admin for desktop
        req.user = {
            user_id: '00000000-0000-0000-0000-000000000001',
            role: 'admin',
            full_name: 'Admin User'
        };
        next();
    };

    // ==================== AUTH ROUTES ====================
    app.post('/api/auth/login', (req, res) => {
        const { email, password } = req.body;
        console.log(`🔑 Login attempt: ${email}`);

        let user = null;
        const adminId = '00000000-0000-0000-0000-000000000001';
        const isAdminEmail = email === 'liz.keza@mtgrowth.local' || email === 'admin@example.com';
        const adminPasswordOk =
            password === 'MtGrowth2025!' || password === 'admin123' || password === 'password';
        if (isAdminEmail && adminPasswordOk) {
            user = {
                id: adminId,
                email,
                full_name: 'Liz Keza',
                role: 'admin',
            };
        } else if (email === 'officer@example.com' && (password === 'officer123' || password === 'password')) {
            user = { id: '00000000-0000-0000-0000-000000000002', email, full_name: 'Loan Officer One', role: 'loan_officer' };
        }

        if (user) {
            const token = Buffer.from(JSON.stringify(user)).toString('base64');
            console.log(`✅ Login success: ${email} (${user.role})`);
            res.json({ token, user });
        } else {
            res.status(401).json({ error: 'Invalid local credentials' });
        }
    });

    app.get('/api/auth/me', authMiddleware, (req, res) => {
        res.json(req.user);
    });

    // ==================== CLIENTS ====================
    app.get('/api/clients', authMiddleware, (req, res) => {
        try {
            const db = getDb();
            const rows = db.prepare('SELECT * FROM profiles ORDER BY created_at DESC').all();
            res.json(rows);
        } catch (err) {
            console.error('API Error (clients):', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    app.post('/api/clients', authMiddleware, (req, res) => {
        try {
            const db = getDb();
            const { full_name, email, phone_number } = req.body;
            const userId = uuidv4();

            db.prepare('INSERT INTO auth_users (id, email) VALUES (?, ?)').run(userId, email);
            db.prepare('INSERT INTO profiles (id, full_name, first_name, last_name, phone_number, email) VALUES (?, ?, ?, ?, ?, ?)').run(
                userId, full_name, full_name.split(' ')[0], full_name.split(' ')[1] || '', phone_number, email
            );

            const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(userId);
            res.json(profile);
        } catch (err) {
            console.error('API Error (create client):', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // ==================== APPLICATIONS ====================
    app.get('/api/applications', authMiddleware, (req, res) => {
        try {
            const db = getDb();
            const rows = db.prepare('SELECT * FROM loan_applications ORDER BY created_at DESC').all();
            res.json(rows);
        } catch (err) {
            console.error('API Error (applications):', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    app.get('/api/applications/active', authMiddleware, (req, res) => {
        try {
            const db = getDb();
            const rows = db.prepare("SELECT * FROM loan_applications WHERE status IN ('approved', 'disbursed') ORDER BY updated_at DESC").all();
            res.json(rows);
        } catch (err) {
            console.error('API Error (active applications):', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    app.get('/api/applications/:id', authMiddleware, (req, res) => {
        try {
            const db = getDb();
            const row = db.prepare('SELECT * FROM loan_applications WHERE id = ?').get(req.params.id);
            if (!row) return res.status(404).json({ error: 'Application not found' });
            res.json(row);
        } catch (err) {
            console.error('API Error (application details):', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    app.post('/api/applications', authMiddleware, (req, res) => {
        try {
            const db = getDb();
            const {
                full_name, email, phone_number, id_number, loan_product,
                loan_amount, loan_duration_months, loan_purpose, user_id
            } = req.body;

            let finalUserId = user_id;
            if (!finalUserId) {
                const existingUser = db.prepare('SELECT id FROM auth_users WHERE email = ?').get(email);
                if (existingUser) {
                    finalUserId = existingUser.id;
                } else {
                    finalUserId = uuidv4();
                    db.prepare('INSERT INTO auth_users (id, email) VALUES (?, ?)').run(finalUserId, email);
                    db.prepare('INSERT INTO profiles (id, full_name, first_name, last_name) VALUES (?, ?, ?, ?)').run(
                        finalUserId, full_name, full_name.split(' ')[0], full_name.split(' ')[1] || ''
                    );
                }
            }

            const appId = uuidv4();
            db.prepare(`INSERT INTO loan_applications 
                (id, user_id, full_name, email, phone_number, id_number, loan_product, loan_amount, loan_duration_months, loan_purpose, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(appId, finalUserId, full_name, email, phone_number, id_number || '', loan_product, loan_amount, loan_duration_months, loan_purpose, 'pending');

            const row = db.prepare('SELECT * FROM loan_applications WHERE id = ?').get(appId);
            res.json(row);
        } catch (err) {
            console.error('API Error (create application):', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    app.patch('/api/applications/:id/status', authMiddleware, (req, res) => {
        try {
            const db = getDb();
            const { id } = req.params;
            const { status } = req.body;
            const now = new Date().toISOString();

            if (status === 'approved' || status === 'disbursed') {
                db.prepare('UPDATE loan_applications SET status = ?, updated_at = ?, approved_at = ? WHERE id = ?').run(status, now, now, id);
            } else {
                db.prepare('UPDATE loan_applications SET status = ?, updated_at = ? WHERE id = ?').run(status, now, id);
            }

            const row = db.prepare('SELECT * FROM loan_applications WHERE id = ?').get(id);
            if (!row) return res.status(404).json({ error: 'Application not found' });
            res.json(row);
        } catch (err) {
            console.error('API Error (update status):', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    app.put('/api/applications/:id', authMiddleware, (req, res) => {
        try {
            const db = getDb();
            const { id } = req.params;
            const data = req.body;
            const now = new Date().toISOString();

            const fields = Object.keys(data).filter(k => k !== 'id');
            const setClause = fields.map(f => `${f} = ?`).join(', ');
            const values = fields.map(f => data[f]);

            db.prepare(`UPDATE loan_applications SET ${setClause}, updated_at = ? WHERE id = ?`).run(...values, now, id);
            const row = db.prepare('SELECT * FROM loan_applications WHERE id = ?').get(id);
            res.json(row);
        } catch (err) {
            console.error('API Error (update application):', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // ==================== REPAYMENTS ====================
    app.get('/api/repayments', authMiddleware, (req, res) => {
        try {
            const db = getDb();
            const rows = db.prepare('SELECT * FROM repayments ORDER BY payment_date DESC').all();
            res.json(rows);
        } catch (err) {
            console.error('API Error (repayments):', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    app.post('/api/repayments', authMiddleware, (req, res) => {
        try {
            const db = getDb();
            const { loan_application_id, amount, payment_method, notes } = req.body;
            const repId = uuidv4();
            db.prepare('INSERT INTO repayments (id, loan_application_id, amount, payment_method, notes) VALUES (?, ?, ?, ?, ?)').run(
                repId, loan_application_id, amount, payment_method, notes
            );
            const row = db.prepare('SELECT * FROM repayments WHERE id = ?').get(repId);
            res.json(row);
        } catch (err) {
            console.error('API Error (create repayment):', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // ==================== BRANCHES ====================
    app.get('/api/branches', authMiddleware, (req, res) => {
        try {
            const db = getDb();
            const rows = db.prepare('SELECT * FROM branches ORDER BY name ASC').all();
            res.json(rows);
        } catch (err) {
            console.error('API Error (branches):', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // ==================== PRODUCTS ====================
    app.get('/api/products', authMiddleware, (req, res) => {
        try {
            const db = getDb();
            const rows = db.prepare('SELECT * FROM loan_products ORDER BY name ASC').all();
            res.json(rows);
        } catch (err) {
            console.error('API Error (products):', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    app.post('/api/products', authMiddleware, (req, res) => {
        try {
            const db = getDb();
            const p = req.body || {};
            const num = (v, d = 0) => {
                if (v === undefined || v === null || v === '') return d;
                const x = parseFloat(v);
                return Number.isFinite(x) ? x : d;
            };
            const nint = (v, d = 0) => {
                if (v === undefined || v === null || v === '') return d;
                const x = parseInt(v, 10);
                return Number.isFinite(x) ? x : d;
            };
            const prodId = uuidv4();
            const now = new Date().toISOString();
            const serializeCustomFees = (body) => {
                let arr = [];
                const raw = body?.custom_fees;
                if (Array.isArray(raw)) arr = raw;
                else if (typeof raw === 'string' && raw.trim()) {
                    try {
                        const j = JSON.parse(raw);
                        arr = Array.isArray(j) ? j : [];
                    } catch {
                        arr = [];
                    }
                }
                const cleaned = arr
                    .filter((x) => x && String(x.label || '').trim())
                    .map((x) => {
                        const id = String(x.id || '').trim();
                        return {
                            ...(id ? { id } : {}),
                            label: String(x.label).trim(),
                            amount: num(x.amount),
                        };
                    });
                return JSON.stringify(cleaned);
            };
            db.prepare(
                `INSERT INTO loan_products (
                    id, name, code, description, min_amount, max_amount, min_duration_months, max_duration_months,
                    base_interest_rate, status, processing_fee_percentage, late_payment_penalty_rate,
                    application_fee, admission_fee, processing_fee, passbook_fee, insurance_rate, security_deposit_rate,
                    monitoring_fee_rate, late_payment_penalty, restructuring_fee_low, restructuring_fee_high, restructuring_threshold,
                    custom_fees,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            ).run(
                prodId,
                p.name,
                p.code,
                p.description ?? null,
                num(p.min_amount),
                num(p.max_amount),
                nint(p.min_duration_months, 1),
                nint(p.max_duration_months, 60),
                num(p.base_interest_rate),
                p.status || 'active',
                num(p.processing_fee_percentage),
                num(p.late_payment_penalty_rate),
                num(p.application_fee),
                num(p.admission_fee),
                num(p.processing_fee),
                num(p.passbook_fee),
                num(p.insurance_rate),
                num(p.security_deposit_rate),
                num(p.monitoring_fee_rate, 3),
                num(p.late_payment_penalty),
                num(p.restructuring_fee_low),
                num(p.restructuring_fee_high),
                num(p.restructuring_threshold),
                serializeCustomFees(p),
                now,
                now
            );
            const row = db.prepare('SELECT * FROM loan_products WHERE id = ?').get(prodId);
            res.json(row);
        } catch (err) {
            console.error('API Error (create product):', err);
            res.status(500).json({ error: err.message || 'Internal server error' });
        }
    });

    app.put('/api/products/:id', authMiddleware, (req, res) => {
        try {
            const db = getDb();
            const { id } = req.params;
            const data = { ...req.body };
            const now = new Date().toISOString();
            if (Array.isArray(data.custom_fees)) {
                const numLocal = (v, d = 0) => {
                    if (v === undefined || v === null || v === '') return d;
                    const x = parseFloat(v);
                    return Number.isFinite(x) ? x : d;
                };
                const cleaned = data.custom_fees
                    .filter((x) => x && String(x.label || '').trim())
                    .map((x) => {
                        const sid = String(x.id || '').trim();
                        return {
                            ...(sid ? { id: sid } : {}),
                            label: String(x.label).trim(),
                            amount: numLocal(x.amount),
                        };
                    });
                data.custom_fees = JSON.stringify(cleaned);
            }
            const fields = Object.keys(data).filter(k => k !== 'id');
            const setClause = fields.map(f => `${f} = ?`).join(', ');
            const values = fields.map(f => data[f]);

            db.prepare(`UPDATE loan_products SET ${setClause}, updated_at = ? WHERE id = ?`).run(...values, now, id);
            const row = db.prepare('SELECT * FROM loan_products WHERE id = ?').get(id);
            res.json(row);
        } catch (err) {
            console.error('API Error (update product):', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    app.delete('/api/products/:id', authMiddleware, (req, res) => {
        try {
            const db = getDb();
            const { id } = req.params;
            const info = db.prepare('DELETE FROM loan_products WHERE id = ?').run(id);
            if (info.changes === 0) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.json({ ok: true, id });
        } catch (err) {
            console.error('API Error (delete product):', err);
            res.status(500).json({ error: err.message || 'Internal server error' });
        }
    });

    // ==================== COLLATERAL ====================
    app.get('/api/collateral', authMiddleware, (req, res) => {
        try {
            const db = getDb();
            const rows = db.prepare('SELECT * FROM collateral ORDER BY created_at DESC').all();
            res.json(rows);
        } catch (err) {
            console.error('API Error (collateral):', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    app.post('/api/collateral', authMiddleware, (req, res) => {
        try {
            const db = getDb();
            const { loan_application_id, type, description, estimated_value, location, registration_number } = req.body;
            const colId = uuidv4();
            db.prepare('INSERT INTO collateral (id, loan_application_id, type, description, estimated_value, location, registration_number, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
                colId, loan_application_id, type, description, estimated_value, location, registration_number, 'active'
            );
            const row = db.prepare('SELECT * FROM collateral WHERE id = ?').get(colId);
            res.json(row);
        } catch (err) {
            console.error('API Error (create collateral):', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // ==================== TERRITORIES ====================
    app.get('/api/territories', authMiddleware, (req, res) => {
        try {
            const db = getDb();
            const rows = db.prepare('SELECT * FROM territories ORDER BY name ASC').all();
            res.json(rows);
        } catch (err) {
            console.error('API Error (territories):', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // ==================== AI ENDPOINTS ====================
    app.get('/api/ai/conversations', authMiddleware, (req, res) => {
        try {
            const db = getDb();
            const userId = req.user.id || req.user.user_id;
            const rows = db.prepare('SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC').all(userId);
            res.json(rows);
        } catch (err) {
            console.error('API Error (get conversations):', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    app.post('/api/ai/conversations', authMiddleware, (req, res) => {
        try {
            const db = getDb();
            const userId = req.user.id || req.user.user_id;
            const { title } = req.body;
            const convId = uuidv4();
            db.prepare('INSERT INTO conversations (id, user_id, title) VALUES (?, ?, ?)').run(convId, userId, title);
            const row = db.prepare('SELECT * FROM conversations WHERE id = ?').get(convId);
            res.json(row);
        } catch (err) {
            console.error('API Error (create conversation):', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    app.delete('/api/ai/conversations/:id', authMiddleware, (req, res) => {
        try {
            const db = getDb();
            db.prepare('DELETE FROM conversations WHERE id = ?').run(req.params.id);
            res.json({ success: true });
        } catch (err) {
            console.error('API Error (delete conversation):', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    app.get('/api/ai/conversations/:id/messages', authMiddleware, (req, res) => {
        try {
            const db = getDb();
            const rows = db.prepare('SELECT * FROM chat_messages WHERE conversation_id = ? ORDER BY created_at ASC').all(req.params.id);
            res.json(rows);
        } catch (err) {
            console.error('API Error (get messages):', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    app.post('/api/ai/conversations/:id/messages', authMiddleware, (req, res) => {
        try {
            const db = getDb();
            const { id } = req.params;
            const { role, content } = req.body;
            const msgId = uuidv4();
            db.prepare('INSERT INTO chat_messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)').run(msgId, id, role, content);
            db.prepare("UPDATE conversations SET updated_at = datetime('now') WHERE id = ?").run(id);
            const row = db.prepare('SELECT * FROM chat_messages WHERE id = ?').get(msgId);
            res.json(row);
        } catch (err) {
            console.error('API Error (save message):', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    app.post('/api/ai/chat', authMiddleware, async (req, res) => {
        try {
            const { messages } = req.body;

            // ── Read OpenAI API key from .env ──
            const fs = require('fs');
            let apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey || apiKey === 'your-openai-api-key-here') {
                try {
                    const envPath = path.join(__dirname, '..', '.env');
                    const envContent = fs.readFileSync(envPath, 'utf8');
                    const match = envContent.match(/OPENAI_API_KEY\s*=\s*(.+)/);
                    if (match) apiKey = match[1].trim();
                } catch (e) { /* no .env */ }
            }

            if (!apiKey || apiKey === 'your-openai-api-key-here') {
                return res.json({
                    response: "⚠️ OpenAI API key not configured. Please add your key to the .env file:\n\n`OPENAI_API_KEY=sk-your-key-here`\n\nThen restart the application."
                });
            }

            // ── Pull live database context ──
            const db = getDb();
            let dbContext = '';
            try {
                const totalApps = db.prepare('SELECT COUNT(*) as count FROM loan_applications').get();
                const statusBreakdown = db.prepare("SELECT status, COUNT(*) as count FROM loan_applications GROUP BY status").all();
                const totalClients = db.prepare('SELECT COUNT(*) as count FROM profiles').get();
                const totalDisbursed = db.prepare("SELECT COALESCE(SUM(loan_amount), 0) as total FROM loan_applications WHERE status IN ('approved', 'disbursed')").get();
                const totalRepayments = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM repayments').get();
                const products = db.prepare('SELECT name, base_interest_rate FROM loan_products').all();
                const branches = db.prepare('SELECT name FROM branches').all();
                const recentApps = db.prepare('SELECT full_name, loan_product, loan_amount, status, created_at FROM loan_applications ORDER BY created_at DESC LIMIT 5').all();

                dbContext = `
LIVE DATABASE STATISTICS:
- Total loan applications: ${totalApps.count}
- Status breakdown: ${statusBreakdown.map(s => `${s.status}: ${s.count}`).join(', ')}
- Total clients: ${totalClients.count}
- Total disbursed: UGX ${Number(totalDisbursed.total).toLocaleString()}
- Total repayments collected: UGX ${Number(totalRepayments.total).toLocaleString()}
- Loan products: ${products.map(p => `${p.name} (${(p.base_interest_rate * 100).toFixed(1)}% interest)`).join(', ')}
- Branches: ${branches.map(b => b.name).join(', ')}
- Recent applications: ${recentApps.map(a => `${a.full_name} - ${a.loan_product} - UGX ${Number(a.loan_amount).toLocaleString()} (${a.status})`).join('; ')}
`;
            } catch (e) {
                dbContext = 'Database stats unavailable.';
            }

            // ── System prompt ──
            const systemPrompt = `You are the AI Financial Assistant for M&T Microfinance (U) LTD, a microfinance institution based in Uganda.

Your role:
- Help staff understand loan portfolios, client data, and financial performance
- Provide insights on microfinance operations and best practices
- Answer questions about loan products, repayments, and client management
- Give actionable recommendations based on the data

${dbContext}

Guidelines:
- Be professional, concise, and data-driven
- When referencing numbers, use UGX currency and format them clearly
- If asked about data you don't have, say so honestly
- Provide actionable insights when presenting data
- Keep responses focused and structured with bullet points when appropriate`;

            // ── Call OpenAI ──
            const OpenAI = require('openai');
            const openai = new OpenAI({ apiKey });

            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages.map(m => ({ role: m.role, content: m.content }))
                ],
                max_tokens: 1024,
                temperature: 0.7,
            });

            const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
            res.json({ response });
        } catch (err) {
            console.error('API Error (ai chat):', err.message || err);

            // Provide helpful error message
            if (err.message?.includes('401') || err.message?.includes('Incorrect API key')) {
                res.json({ response: '⚠️ Invalid OpenAI API key. Please check your key in the .env file and restart the app.' });
            } else if (err.message?.includes('429')) {
                res.json({ response: '⚠️ OpenAI rate limit reached. Please wait a moment and try again.' });
            } else if (err.message?.includes('insufficient_quota')) {
                res.json({ response: '⚠️ Your OpenAI account has no remaining credits. Please top up your account at https://platform.openai.com/billing' });
            } else {
                res.json({ response: `⚠️ AI service error: ${err.message || 'Unknown error'}. Please try again.` });
            }
        }
    });

    // ==================== USERS ====================
    app.get('/api/users', authMiddleware, (req, res) => {
        try {
            const db = getDb();
            const rows = db.prepare(`
                SELECT au.id, au.email, p.full_name, p.first_name, p.last_name, p.phone_number,
                       ur.role, au.created_at
                FROM auth_users au
                LEFT JOIN profiles p ON au.id = p.id
                LEFT JOIN user_roles ur ON au.id = ur.user_id
                ORDER BY au.created_at DESC
            `).all();
            res.json(rows);
        } catch (err) {
            console.error('API Error (users):', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    app.post('/api/users', authMiddleware, (req, res) => {
        try {
            const db = getDb();
            const { email, full_name, role, phone_number } = req.body;

            // Check if user exists
            const existing = db.prepare('SELECT id FROM auth_users WHERE email = ?').get(email);
            if (existing) return res.status(400).json({ error: 'User with this email already exists' });

            const userId = uuidv4();
            db.prepare('INSERT INTO auth_users (id, email) VALUES (?, ?)').run(userId, email);
            db.prepare('INSERT INTO profiles (id, full_name, first_name, last_name, phone_number, email) VALUES (?, ?, ?, ?, ?, ?)').run(
                userId, full_name, full_name.split(' ')[0], full_name.split(' ')[1] || '', phone_number || '', email
            );
            if (role) {
                db.prepare('INSERT INTO user_roles (user_id, role) VALUES (?, ?)').run(userId, role);
            }

            res.json({ id: userId, email, full_name, role });
        } catch (err) {
            console.error('API Error (create user):', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // ==================== NOTIFICATIONS (stub) ====================
    app.get('/api/notifications', authMiddleware, (req, res) => res.json([]));
    app.patch('/api/notifications/:id/read', authMiddleware, (req, res) => res.json({ success: true }));
    app.patch('/api/notifications/read-all', authMiddleware, (req, res) => res.json({ success: true }));

    // ==================== GROUPS (stub) ====================
    app.get('/api/groups', authMiddleware, (req, res) => res.json([]));

    // ==================== REPORTS ====================
    const reportsRouter = require('./reports.cjs');
    app.use('/api/reports', authMiddleware, reportsRouter);

    // ==================== HEALTH CHECK ====================
    app.get('/health', (req, res) => {
        res.json({ status: 'ok', database: 'sqlite', mode: 'desktop' });
    });

    // Start server
    return new Promise((resolve) => {
        serverInstance = app.listen(PORT, '127.0.0.1', () => {
            console.log(`🚀 Desktop server running on http://127.0.0.1:${PORT}`);
            resolve(serverInstance);
        });
    });
}

module.exports = { startServer };
