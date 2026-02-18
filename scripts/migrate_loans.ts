
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: path.resolve('d:/m-t-growth-gateway/.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Role Key in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const JSON_FILE_PATH = 'd:/m-t-growth-gateway/loans.json';

// Data mapping based on JSON inspection
interface LoanRecord {
    Released: string;
    Name: string;
    Principal: number;
    Paid: number;
    Balance: number;
    Group: string;
    Interest: number;
    Maturity: string;
    'Next Installment Date': string;
    'Available Balance': number | string;
    DOB: string;
    Address: string;
    Age: number;
    Mobile: number | string;
    Business: string;
    'Interest Rate': string;
    'Last Payment Amount': number;
    'Loan Id': number | string;
    'Previous Installment Amount': number;
    'NIN NUMBER': string;
    Status: string;
}

// Helper to format date
function parseDate(value: any): string | null {
    if (!value) return null;
    const s = String(value).trim();
    if (!s) return null;

    // Expecting dd/mm/yyyy
    const parts = s.split('/');
    if (parts.length === 3) {
        // dd/mm/yyyy -> yyyy-mm-dd
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return null; // Return null if invalid format
}

// Helper to normalize phone
function normalizePhone(phone: any): string {
    if (!phone) return '';
    // Convert number to string (JSON might have it as number)
    let p = String(phone).replace(/\D/g, ''); // Remove non-digits

    // Handle exponential notation if any (though replace \D handles it mostly, but large numbers might be scientific in string?)
    // If it comes as number 755376120, string is "755376120".

    // Uganda logic: 
    // 07... -> 2567...
    // 7... (9 digits) -> 2567...

    if (p.length === 9) {
        return `256${p}`;
    }
    if (p.startsWith('0') && p.length === 10) {
        return `256${p.substring(1)}`;
    }
    // If it's already 12 digits starting with 256, keep it?
    if (p.length === 12 && p.startsWith('256')) {
        return p;
    }

    return p;
}

async function getAdminUser() {
    // Find an admin user to assign loans to
    // Try to find a user with role 'admin' in user_roles table
    const { data: roles, error } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin')
        .limit(1);

    if (error || !roles || roles.length === 0) {
        console.log('No admin user found in user_roles. Checking for any user to assign...');
        // Fallback: just get the first user
        const { data: users, error: userError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
        if (userError || !users || users.users.length === 0) {
            throw new Error('No users found in system to assign loans to.');
        }
        return users.users[0].id;
    }
    return roles[0].user_id;
}

async function runMigration() {
    console.log('Starting migration from JSON...');

    // 1. Get Admin User for assignment
    let adminUserId;
    try {
        adminUserId = await getAdminUser();
        console.log(`Assigning loans to Admin User ID: ${adminUserId}`);
    } catch (e) {
        console.error('Failed to find admin user:', e);
        return;
    }

    // Pre-fetch all users to handle "email already exists" errors
    // This is better than individual lookups which are hard in Admin API
    const userMap = new Map<string, string>(); // email -> id
    let page = 1;
    while (true) {
        const { data: { users }, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
        if (error) {
            console.error('Error fetching users:', error);
            break;
        }
        if (!users || users.length === 0) break;

        users.forEach(u => {
            if (u.email) userMap.set(u.email.toLowerCase(), u.id);
            if (u.phone) userMap.set(u.phone, u.id); // Also map phone
        });

        if (users.length < 1000) break;
        page++;
    }
    console.log(`Pre-fetched ${userMap.size} existing users.`);

    // 2. Read JSON
    const rawData = fs.readFileSync(JSON_FILE_PATH, 'utf-8');
    const rows: LoanRecord[] = JSON.parse(rawData);

    console.log(`Found ${rows.length} records in JSON file.`);

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const row of rows) {
        try {
            const fullName = row['Name'];
            if (!fullName && !row['Principal']) {
                // Likely a footer or empty row
                skippedCount++;
                continue;
            }

            // Extract fields
            const releaseDateRaw = row['Released'];
            const principal = row['Principal'] || 0;
            const statusRaw = row['Status'];
            const mobileRaw = row['Mobile'];
            const ninRaw = row['NIN NUMBER'];
            const address = row['Address'];
            const business = row['Business'];
            const dobRaw = row['DOB'];
            const loanProduct = 'SME Loans'; // Default

            // Normalize data
            const releaseDate = parseDate(releaseDateRaw) || new Date().toISOString();
            const phone = normalizePhone(mobileRaw);
            // Only generate email if phone exists, otherwise random?
            const email = phone ? `${phone}@mandt.placeholder` : `no_phone_${Date.now()}_${Math.floor(Math.random() * 10000)}@mandt.placeholder`;
            const password = `User${Math.floor(Math.random() * 10000)}!`;

            // 3. Find or Create User (Shadow Account)
            let userId: string | undefined = userMap.get(email.toLowerCase());
            if (!userId && phone) userId = userMap.get(phone);

            if (userId) {
                console.log(`User already exists for ${fullName} (${email}). ID: ${userId}`);
            } else {
                // Create new user
                const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                    email: email,
                    phone: phone || undefined,
                    password: password,
                    email_confirm: true,
                    phone_confirm: true,
                    user_metadata: {
                        full_name: fullName,
                        phone_number: phone
                    }
                });

                if (createError) {
                    // Double check if it exists (race condition or map miss?)
                    if (createError.message.includes('already registered')) {
                        console.warn(`User ${email} reported existing but not in map. Skipping.`);
                        errorCount++;
                        continue;
                    }
                    console.error(`Failed to create user ${fullName}:`, createError);
                    errorCount++;
                    continue;
                }
                userId = newUser.user.id;
                // Add to map for subsequent rows (though each row should be unique user ideally?)
                userMap.set(email.toLowerCase(), userId);
                console.log(`Created shadow user: ${fullName} (${userId})`);
            }

            // 5. Create Loan Application
            // Map Status
            let appStatus = 'pending';
            const s = String(statusRaw).toLowerCase();
            if (s.includes('past maturity') || s.includes('due today') || s.includes('active') || s.includes('missed repayment')) {
                appStatus = 'disbursed';
            } else if (s.includes('paid') || s.includes('cleared')) {
                appStatus = 'disbursed';
            } else {
                appStatus = 'disbursed'; // Default to disbursed for known existing loans
            }

            // Map Group to loan_purpose
            let purpose = business || 'Business';
            const groupName = row['Group'];
            if (groupName) {
                purpose = `${purpose} (Group: ${groupName})`;
            }

            // Check if loan already exists (deduplication)
            const { data: existingLoans } = await supabase
                .from('loan_applications')
                .select('id')
                .eq('user_id', userId)
                .eq('loan_amount', principal)
                .eq('created_at', releaseDate)
                .limit(1);

            if (existingLoans && existingLoans.length > 0) {
                console.log(`Loan already exists for ${fullName}. Skipping.`);
                skippedCount++;
                continue;
            }

            // Force 'Bodaboda Group Loan' as it is the only valid value found in DB check constraint
            // ideally we would map this based on business type, but constraint is strict.
            const validProduct = 'Bodaboda Group Loan';

            const { error: loanError } = await supabase
                .from('loan_applications')
                .insert({
                    user_id: userId,
                    full_name: fullName,
                    email: email,
                    phone_number: phone || '',
                    id_number: ninRaw || 'N/A',
                    date_of_birth: parseDate(dobRaw) || '1990-01-01',
                    address: address || 'Unknown',
                    loan_product: validProduct,
                    loan_amount: principal || 0,
                    loan_duration_months: 4,
                    loan_purpose: purpose,
                    employment_status: 'Self-Employed',
                    status: appStatus,
                    assigned_officer_id: adminUserId,
                    created_at: releaseDate,
                    approved_at: releaseDate,
                });

            if (loanError) {
                console.error(`Failed to create loan for ${fullName}:`, loanError);
                errorCount++;
            } else {
                successCount++;
            }

        } catch (err) {
            console.error(`Error processing row:`, err);
            errorCount++;
        }
    }

    console.log(`Migration completed. Success: ${successCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`);
}

runMigration().catch(console.error);
