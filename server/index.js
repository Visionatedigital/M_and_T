const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

// Main application entry point - Restart Forced for ENV Fix - Retrying Notifications
const app = express();
const PORT = process.env.PORT || 5000;
const authenticateToken = require('./middleware/auth');
const applicationRoutes = require('./routes/applications');
const clientRoutes = require('./routes/clients');
const groupRoutes = require('./routes/groups');
const uploadRoutes = require('./routes/uploads');
const collateralRoutes = require('./routes/collateral');
const authRoutes = require('./routes/auth');
/** Use .cjs router — repayments.js is legacy and lacks newer endpoints (collector-summary, history-group). */
const repaymentRoutes = require('./routes/repayments.cjs');
const branchRoutes = require('./routes/branches');
const territoryRoutes = require('./routes/territories');
const productRoutes = require('./routes/products');
const aiRoutes = require('./routes/ai.cjs');
const reportRoutes = require('./routes/reports');
const path = require('path');

app.use(cors());
app.use(express.json());



app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', authenticateToken, clientRoutes);
app.use('/api/groups', authenticateToken, groupRoutes);
app.use('/api/applications', authenticateToken, applicationRoutes);
app.use('/api/collateral', authenticateToken, collateralRoutes);
app.use('/api/repayments', authenticateToken, repaymentRoutes);
app.use('/api/branches', authenticateToken, branchRoutes);
app.use('/api/territories', authenticateToken, territoryRoutes);
app.use('/api/products', authenticateToken, productRoutes);
app.use('/api/reports', authenticateToken, reportRoutes);
app.use('/api/ai', authenticateToken, aiRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', authenticateToken, require('./routes/users'));
app.use('/api/notifications', authenticateToken, require('./routes/notifications'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'M&T Backend is running' });
});

// Basic error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;
