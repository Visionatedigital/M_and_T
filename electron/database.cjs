/**
 * SQLite Database Module for M&T Growth Gateway Desktop
 * Replaces PostgreSQL with better-sqlite3 for embedded desktop storage.
 * 
 * Key differences from pg:
 * - Synchronous API (better-sqlite3 is sync, which is actually faster for local use)
 * - Uses ? placeholders instead of $1, $2 (we wrap this to be compatible)
 * - No schemas (auth.users becomes auth_users)
 * - No FILTER clause (use CASE WHEN instead)
 * - No gen_random_uuid() (use uuid module)
 * - No date_trunc (use strftime)
 * - No NOW() (use datetime('now'))
 */

const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

let db;

/**
 * Initialize the SQLite database.
 * @param {string} userDataPath - Electron's app.getPath('userData')
 * @returns {Database} The SQLite database instance
 */
function initDatabase(userDataPath) {
    const dbPath = path.join(userDataPath, 'mt_growth.db');
    console.log(`📦 SQLite database path: ${dbPath}`);

    db = new Database(dbPath);

    // Performance optimizations for desktop use
    db.pragma('journal_mode = WAL');      // Write-ahead logging — much faster
    db.pragma('synchronous = NORMAL');     // Good balance of safety & speed
    db.pragma('cache_size = -64000');      // 64MB cache
    db.pragma('foreign_keys = ON');        // Enforce referential integrity
    db.pragma('temp_store = MEMORY');      // Keep temp tables in memory

    // Register custom UUID function
    db.function('gen_random_uuid', () => uuidv4());

    // Create all tables
    createTables();

    return db;
}

function createTables() {
    db.exec(`
        -- Auth users (replaces auth.users from Supabase)
        CREATE TABLE IF NOT EXISTS auth_users (
            id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
            email TEXT UNIQUE,
            encrypted_password TEXT,
            raw_app_meta_data TEXT,
            raw_user_meta_data TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );

        -- Profiles
        CREATE TABLE IF NOT EXISTS profiles (
            id TEXT PRIMARY KEY,
            full_name TEXT NOT NULL,
            phone_number TEXT,
            email TEXT,
            first_name TEXT,
            last_name TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (id) REFERENCES auth_users(id) ON DELETE CASCADE
        );

        -- User roles
        CREATE TABLE IF NOT EXISTS user_roles (
            id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
            user_id TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('admin', 'loan_officer', 'client')),
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE,
            UNIQUE (user_id, role)
        );

        -- Territories
        CREATE TABLE IF NOT EXISTS territories (
            id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );

        -- Branches
        CREATE TABLE IF NOT EXISTS branches (
            id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
            name TEXT NOT NULL,
            code TEXT NOT NULL UNIQUE,
            address TEXT NOT NULL,
            phone TEXT,
            email TEXT,
            manager_id TEXT,
            territory_id TEXT,
            status TEXT NOT NULL DEFAULT 'active',
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (territory_id) REFERENCES territories(id) ON DELETE SET NULL
        );

        -- Loan Products
        CREATE TABLE IF NOT EXISTS loan_products (
            id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
            name TEXT NOT NULL,
            code TEXT NOT NULL UNIQUE,
            description TEXT,
            min_amount REAL NOT NULL,
            max_amount REAL NOT NULL,
            min_duration_months INTEGER NOT NULL DEFAULT 1,
            max_duration_months INTEGER NOT NULL DEFAULT 60,
            base_interest_rate REAL NOT NULL,
            processing_fee_percentage REAL NOT NULL DEFAULT 0,
            late_payment_penalty_rate REAL DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'active',
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );

        -- Loan Applications
        CREATE TABLE IF NOT EXISTS loan_applications (
            id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
            user_id TEXT NOT NULL,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone_number TEXT NOT NULL,
            id_number TEXT NOT NULL DEFAULT '',
            date_of_birth TEXT DEFAULT '',
            address TEXT DEFAULT '',
            loan_product TEXT NOT NULL,
            loan_amount REAL NOT NULL,
            loan_duration_months INTEGER NOT NULL,
            loan_purpose TEXT NOT NULL DEFAULT '',
            employment_status TEXT DEFAULT '',
            employer_name TEXT,
            monthly_income REAL,
            branch_name TEXT,
            loan_type TEXT,
            loan_category TEXT,
            group_name TEXT,
            district TEXT,
            division TEXT,
            county TEXT,
            village TEXT,
            parish TEXT,
            business_location TEXT,
            attachments TEXT,
            status TEXT NOT NULL DEFAULT 'pending',
            assigned_officer_id TEXT,
            rejection_reason TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now')),
            reviewed_at TEXT,
            approved_at TEXT,
            FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE,
            FOREIGN KEY (assigned_officer_id) REFERENCES auth_users(id)
        );

        -- Repayments
        CREATE TABLE IF NOT EXISTS repayments (
            id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
            loan_application_id TEXT,
            amount REAL NOT NULL,
            payment_date TEXT DEFAULT (datetime('now')),
            payment_method TEXT,
            notes TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (loan_application_id) REFERENCES loan_applications(id) ON DELETE CASCADE
        );

        -- Collateral
        CREATE TABLE IF NOT EXISTS collateral (
            id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
            loan_application_id TEXT,
            type TEXT NOT NULL,
            description TEXT NOT NULL,
            estimated_value REAL NOT NULL,
            current_value REAL,
            status TEXT NOT NULL DEFAULT 'active',
            location TEXT,
            registration_number TEXT,
            notes TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (loan_application_id) REFERENCES loan_applications(id) ON DELETE CASCADE
        );

        -- Collateral Insurance
        CREATE TABLE IF NOT EXISTS collateral_insurance (
            id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
            collateral_id TEXT NOT NULL,
            insurance_company TEXT NOT NULL,
            policy_number TEXT NOT NULL,
            coverage_amount REAL NOT NULL,
            premium_amount REAL NOT NULL,
            start_date TEXT NOT NULL,
            expiry_date TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'active',
            notes TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (collateral_id) REFERENCES collateral(id) ON DELETE CASCADE
        );

        -- Asset Valuations
        CREATE TABLE IF NOT EXISTS asset_valuations (
            id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
            collateral_id TEXT NOT NULL,
            valuation_date TEXT NOT NULL,
            valued_by TEXT NOT NULL,
            valuation_amount REAL NOT NULL,
            valuation_method TEXT,
            notes TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (collateral_id) REFERENCES collateral(id) ON DELETE CASCADE
        );

        -- Branch Performance
        CREATE TABLE IF NOT EXISTS branch_performance (
            id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
            branch_id TEXT NOT NULL,
            period_start TEXT NOT NULL,
            period_end TEXT NOT NULL,
            total_loans INTEGER NOT NULL DEFAULT 0,
            total_disbursed REAL NOT NULL DEFAULT 0,
            total_repayments REAL NOT NULL DEFAULT 0,
            active_clients INTEGER NOT NULL DEFAULT 0,
            new_clients INTEGER NOT NULL DEFAULT 0,
            default_rate REAL,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
        );

        -- Product Performance
        CREATE TABLE IF NOT EXISTS product_performance (
            id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
            product_id TEXT NOT NULL,
            period_start TEXT NOT NULL,
            period_end TEXT NOT NULL,
            total_applications INTEGER NOT NULL DEFAULT 0,
            approved_applications INTEGER NOT NULL DEFAULT 0,
            rejected_applications INTEGER NOT NULL DEFAULT 0,
            total_disbursed REAL NOT NULL DEFAULT 0,
            average_loan_amount REAL,
            default_rate REAL,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (product_id) REFERENCES loan_products(id) ON DELETE CASCADE
        );

        -- Interest Rate Settings
        CREATE TABLE IF NOT EXISTS interest_rate_settings (
            id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
            product_id TEXT NOT NULL,
            rate_type TEXT NOT NULL,
            base_rate REAL NOT NULL,
            margin REAL DEFAULT 0,
            effective_from TEXT NOT NULL,
            effective_to TEXT,
            notes TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (product_id) REFERENCES loan_products(id) ON DELETE CASCADE
        );

        -- Conversations (AI Chat)
        CREATE TABLE IF NOT EXISTS conversations (
            id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE
        );

        -- Chat Messages
        CREATE TABLE IF NOT EXISTS chat_messages (
            id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
            conversation_id TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
            content TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
        );

        -- Indexes for performance
        CREATE INDEX IF NOT EXISTS idx_loan_applications_user_id ON loan_applications(user_id);
        CREATE INDEX IF NOT EXISTS idx_loan_applications_status ON loan_applications(status);
        CREATE INDEX IF NOT EXISTS idx_repayments_loan_id ON repayments(loan_application_id);
        CREATE INDEX IF NOT EXISTS idx_collateral_loan_id ON collateral(loan_application_id);
        CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON chat_messages(conversation_id);
        CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
        CREATE INDEX IF NOT EXISTS idx_branches_code ON branches(code);
    `);

    // Apply schema migrations for existing databases
    const newCols = [
        'branch_name TEXT', 'loan_type TEXT', 'loan_category TEXT',
        'group_name TEXT', 'district TEXT', 'division TEXT',
        'county TEXT', 'village TEXT', 'parish TEXT',
        'business_location TEXT', 'attachments TEXT'
    ];
    newCols.forEach(col => {
        try {
            db.exec(`ALTER TABLE loan_applications ADD COLUMN ${col}`);
            console.log(`Successfully added column ${col} to loan_applications`);
        } catch (e) {
            // Ignore if column already exists
        }
    });

    // Fee columns per loan product (match PostgreSQL loan_products for desktop parity)
    const loanProductFeeCols = [
        'application_fee REAL DEFAULT 0',
        'admission_fee REAL DEFAULT 0',
        'processing_fee REAL DEFAULT 0',
        'passbook_fee REAL DEFAULT 0',
        'insurance_rate REAL DEFAULT 0',
        'security_deposit_rate REAL DEFAULT 0',
        'monitoring_fee_rate REAL DEFAULT 3',
        'late_payment_penalty REAL DEFAULT 0',
        'restructuring_fee_low REAL DEFAULT 0',
        'restructuring_fee_high REAL DEFAULT 0',
        'restructuring_threshold REAL DEFAULT 0',
        "custom_fees TEXT DEFAULT '[]'",
    ];
    loanProductFeeCols.forEach((col) => {
        try {
            db.exec(`ALTER TABLE loan_products ADD COLUMN ${col}`);
        } catch (e) {
            /* duplicate column */
        }
    });

    const loanAppSdCols = [
        'security_deposit_amount REAL',
        'security_deposit_balance REAL',
    ];
    loanAppSdCols.forEach((col) => {
        try {
            db.exec(`ALTER TABLE loan_applications ADD COLUMN ${col}`);
        } catch (e) {
            /* duplicate */
        }
    });

    const repaymentPenaltyCols = [
        'penalty_amount REAL DEFAULT 0',
        'penalty_covered_by_security_deposit REAL DEFAULT 0',
        'recorded_by TEXT',
    ];
    repaymentPenaltyCols.forEach((col) => {
        try {
            db.exec(`ALTER TABLE repayments ADD COLUMN ${col}`);
        } catch (e) {
            /* duplicate */
        }
    });

    console.log('✅ All database tables created');

    // Seed default data if database is fresh
    seedDefaultData();
}

function seedDefaultData() {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM auth_users').get();
    if (userCount.count > 0) {
        console.log('📊 Database already has data, skipping seed');
        return;
    }

    console.log('🌱 Seeding default data...');

    const adminId = '00000000-0000-0000-0000-000000000001';
    const officerId = '00000000-0000-0000-0000-000000000002';

    // Admin user — Liz Keza (desktop default)
    db.prepare('INSERT INTO auth_users (id, email) VALUES (?, ?)').run(adminId, 'liz.keza@mtgrowth.local');
    db.prepare('INSERT INTO profiles (id, full_name, first_name, last_name) VALUES (?, ?, ?, ?)').run(adminId, 'Liz Keza', 'Liz', 'Keza');
    db.prepare('INSERT INTO user_roles (user_id, role) VALUES (?, ?)').run(adminId, 'admin');

    // Loan Officer
    db.prepare('INSERT INTO auth_users (id, email) VALUES (?, ?)').run(officerId, 'officer@example.com');
    db.prepare('INSERT INTO profiles (id, full_name, first_name, last_name) VALUES (?, ?, ?, ?)').run(officerId, 'Loan Officer One', 'Loan', 'Officer');
    db.prepare('INSERT INTO user_roles (user_id, role) VALUES (?, ?)').run(officerId, 'loan_officer');

    // Branches
    db.prepare("INSERT OR IGNORE INTO branches (name, code, address) VALUES (?, ?, ?)").run('Kampala Central', 'KLA01', 'Nakasero, Kampala');
    db.prepare("INSERT OR IGNORE INTO branches (name, code, address) VALUES (?, ?, ?)").run('Mbarara Branch', 'MBR01', 'High Street, Mbarara');

    // Loan Products
    db.prepare("INSERT OR IGNORE INTO loan_products (name, code, min_amount, max_amount, min_duration_months, max_duration_months, base_interest_rate) VALUES (?, ?, ?, ?, ?, ?, ?)").run('Personal Loans', 'PL001', 500000, 5000000, 3, 24, 0.15);

    // Sample Application  
    const appId = '00000000-0000-0000-0000-000000000101';
    const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare(`INSERT OR IGNORE INTO loan_applications 
        (id, user_id, full_name, email, phone_number, id_number, date_of_birth, address, 
        loan_product, loan_amount, loan_duration_months, loan_purpose, employment_status, 
        status, approved_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        appId, adminId, 'John Doe', 'john@example.com', '+256700123456', 'ID12345',
        '1990-01-01', 'Kampala', 'Personal Loans', 1000000, 12, 'Business Expansion',
        'Employed', 'disbursed', twoMonthsAgo, twoMonthsAgo, twoMonthsAgo
    );

    // Sample Repayment
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const existingRepayment = db.prepare('SELECT COUNT(*) as count FROM repayments WHERE loan_application_id = ?').get(appId);
    if (existingRepayment.count === 0) {
        db.prepare("INSERT INTO repayments (loan_application_id, amount, payment_date, payment_method) VALUES (?, ?, ?, ?)").run(appId, 100000, oneMonthAgo, 'Mobile Money');
    }

    console.log('✅ Default data seeded');
    console.log('🔑 Test credentials:');
    console.log('   Admin (Liz Keza):    liz.keza@mtgrowth.local  /  MtGrowth2025!');
    console.log('   Loan officer:        officer@example.com / officer123');
}

/**
 * Get the database instance
 */
function getDb() {
    if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
    return db;
}

module.exports = { initDatabase, getDb };
