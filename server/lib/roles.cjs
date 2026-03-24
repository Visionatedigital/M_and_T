/**
 * Canonical role checks for the API. JWT payload uses `role` from user_roles (admin | loan_officer | …).
 * Admin: full access. Loan officers: operational staff only (scoped where implemented).
 */
function normalizeRole(role) {
    return String(role || '').toLowerCase().trim().replace(/[\s-]+/g, '_');
}

function isAdmin(role) {
    return normalizeRole(role) === 'admin';
}

function isLoanOfficer(role) {
    return normalizeRole(role) === 'loan_officer';
}

/** Admin or loan officer (staff portal users) */
function isStaff(role) {
    const r = normalizeRole(role);
    return r === 'admin' || r === 'loan_officer';
}

function requireAdmin(req, res, next) {
    if (!isAdmin(req.user?.role)) {
        return res.status(403).json({ error: 'Administrator privileges required.' });
    }
    next();
}

function requireStaff(req, res, next) {
    if (!isStaff(req.user?.role)) {
        return res.status(403).json({ error: 'Staff access required.' });
    }
    next();
}

module.exports = {
    normalizeRole,
    isAdmin,
    isLoanOfficer,
    isStaff,
    requireAdmin,
    requireStaff,
};
