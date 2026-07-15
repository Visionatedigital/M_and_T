const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const cron = require('node-cron');
// Load .env from project root (PM2 cwd is often not the app dir — default dotenv misses .env)
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Overdue alerts - run weekly (default Monday 8:00 AM)
const OVERDUE_CRON = process.env.OVERDUE_CRON || '0 8 * * 1'; // 8am every Monday

// Fix for Supabase SSL connection issues in packaged app
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Auth Middleware
const jwt = require('jsonwebtoken');
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.split(' ')[1];
            // Must match server/routes/auth.js (sign) and server/middleware/auth.js
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
            req.user = decoded;
            console.log(`👤 Auth: Parsed JWT for ${decoded.email || decoded.user_id || decoded.id}`);
            return next();
        } catch (e) {
            console.warn('⚠️ Auth: Failed to verify JWT token:', e.message);
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }
    }

    // Allow health check without auth
    if (req.path === '/health') return next();

    console.warn(`⚠️ Auth: No Authorization header provided for ${req.path}`);
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
};

// Import Routers
const reportsRouter = require('./routes/reports.cjs');
const accountingRouter = require('./routes/accounting.cjs');
const borrowersRouter = require('./routes/borrowers.cjs');
const applicationsRouter = require('./routes/applications.cjs');
const repaymentsRouter = require('./routes/repayments.cjs');
const assetsRouter = require('./routes/assets.cjs');
const creditorsRouter = require('./routes/creditors.cjs');
const payrollRouter = require('./routes/payroll.cjs');
const branchesRouter = require('./routes/branches.cjs');
const productsRouter = require('./routes/products.cjs');
const collateralRouter = require('./routes/collateral.cjs');
const territoriesRouter = require('./routes/territories.cjs');
const usersRouter = require('./routes/users.cjs');
const notificationsRouter = require('./routes/notifications.cjs');
const aiRouter = require('./routes/ai.cjs');
const guarantorsRouter = require('./routes/guarantors.cjs');
const groupsRouter = require('./routes/groups.cjs');
const authRoutes = require('./routes/auth.js');
const uploadsRouter = require('./routes/uploads.js');

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Public Routes
app.use('/api/auth', authRoutes);
app.get('/health', (req, res) => res.json({ status: 'ok', database: 'connected' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', database: 'connected' }));
/** Real DB check — open in browser if login returns 500 (does not expose secrets). */
app.get('/api/health/db', async (req, res) => {
    const urlSet = Boolean(process.env.DATABASE_URL && String(process.env.DATABASE_URL).trim().length > 0);
    const jwtSet = Boolean(process.env.JWT_SECRET && String(process.env.JWT_SECRET).trim().length > 0);
    if (!urlSet) {
        return res.status(503).json({
            ok: false,
            databaseUrlConfigured: false,
            jwtSecretConfigured: jwtSet,
            hint: 'DATABASE_URL missing — dotenv not loading or .env empty. Ensure .env exists at project root and restart PM2 from app directory or deploy latest server (loads .env via __dirname).'
        });
    }
    try {
        const db = require('./db.cjs');
        await db.query('SELECT 1 AS ok');
        return res.json({
            ok: true,
            databaseUrlConfigured: true,
            jwtSecretConfigured: jwtSet,
            database: 'reachable'
        });
    } catch (e) {
        console.error('[health/db]', e.code, e.message);
        return res.status(503).json({
            ok: false,
            databaseUrlConfigured: true,
            jwtSecretConfigured: jwtSet,
            code: e.code || 'UNKNOWN',
            database: 'unreachable'
        });
    }
});

// Protected Routes
app.use('/api/reports', authMiddleware, reportsRouter);
app.use('/api/accounting', authMiddleware, accountingRouter);
app.use('/api/borrowers', authMiddleware, borrowersRouter);
app.use('/api/clients', authMiddleware, borrowersRouter); // Alias for clients
app.use('/api/applications', authMiddleware, applicationsRouter);
app.use('/api/repayments', authMiddleware, repaymentsRouter);
app.use('/api/assets', authMiddleware, assetsRouter);
app.use('/api/creditors', authMiddleware, creditorsRouter);
app.use('/api/payroll', authMiddleware, payrollRouter);
app.use('/api/branches', authMiddleware, branchesRouter);
app.use('/api/products', authMiddleware, productsRouter);
app.use('/api/collateral', authMiddleware, collateralRouter);
app.use('/api/territories', authMiddleware, territoriesRouter);
app.use('/api/users', authMiddleware, usersRouter);
app.use('/api/notifications', authMiddleware, notificationsRouter);
app.use('/api/ai', authMiddleware, aiRouter);
app.use('/api/guarantors', authMiddleware, guarantorsRouter);
app.use('/api/groups', authMiddleware, groupsRouter);
app.use('/api/upload', authMiddleware, uploadsRouter);

// Production web UI: `npm run build` → dist/ (same origin as /api — required on a droplet)
const distPath = path.resolve(__dirname, '..', 'dist');
const distIndexHtml = path.join(distPath, 'index.html');
if (fs.existsSync(distIndexHtml)) {
    console.log(`📦 Serving SPA from ${distPath}`);
    app.use(express.static(distPath));
    app.get('/', (_req, res) => res.sendFile(distIndexHtml));
    // BrowserRouter deep links — Express 5 path-to-regexp rejects app.get('*'); use middleware
    app.use((req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') return next();
        if (req.path.startsWith('/api')) return next();
        // Missing built files must not return index.html (browser expects JS → MIME error)
        if (req.path.startsWith('/assets')) {
            return res.status(404).type('text/plain').send('Asset not found — rebuild or hard-refresh');
        }
        res.sendFile(distIndexHtml);
    });
} else {
    console.warn(`⚠️ No ${distIndexHtml} — run "npm run build" in project root (or upload dist/). CWD=${process.cwd()}`);
}

/**
 * Start the server programmatically
 */
function startServer(port = PORT) {
    return new Promise((resolve) => {
        const server = app.listen(port, () => {
            console.log(`🚀 M&T Server running on http://localhost:${port}`);
            resolve(server);
        });
    });
}

if (require.main === module) {
    startServer(PORT).then(() => {
        if (process.env.OVERDUE_CRON !== 'false') {
            cron.schedule(OVERDUE_CRON, async () => {
                try {
                    const { runOverdueCheck } = require('./services/overdueCheck.cjs');
                    const result = await runOverdueCheck();
                    console.log(`📱 Overdue alerts: ${result.count} SMS sent`);
                } catch (e) {
                    console.error('Overdue cron error:', e);
                }
            });
            console.log(`⏰ Overdue alerts scheduled: ${OVERDUE_CRON}`);
        }
    });
}

module.exports = { app, startServer };
