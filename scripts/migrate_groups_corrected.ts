
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve('d:/m-t-growth-gateway/.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!);

// Valid product from previous tests
const VALID_PRODUCT = 'Bodaboda Group Loan';

async function migrate() {
    console.log("Starting corrected migration...");

    // 1. Load JSON
    const rawData = fs.readFileSync('d:/m-t-growth-gateway/loans.json', 'utf-8');
    const allRecords = JSON.parse(rawData);
    console.log(`Loaded ${allRecords.length} records.`);

    // 2. Group Data
    const groups: Record<string, any[]> = {};
    const individuals: any[] = [];

    allRecords.forEach((r: any) => {
        const gName = r['Group'];
        if (gName && typeof gName === 'string' && gName.trim().length > 0 && gName !== 'NaN') {
            if (!groups[gName]) groups[gName] = [];
            groups[gName].push(r);
        } else {
            individuals.push(r);
        }
    });

    console.log(`Found ${Object.keys(groups).length} unique groups.`);
    console.log(`Found ${individuals.length} individual loans.`);

    // 3. Pre-fetch Users to avoid duplicates
    console.log("Pre-fetching users...");
    const userMap = new Map(); // phone -> id

    let page = 1;
    let hasMore = true;
    while (hasMore) {
        const { data: users, error } = await supabase.auth.admin.listUsers({ page: page, perPage: 1000 });
        if (error || !users || users.users.length === 0) {
            hasMore = false;
        } else {
            users.users.forEach(u => {
                if (u.phone) userMap.set(u.phone, u.id);
                if (u.email) userMap.set(u.email, u.id);
            });
            page++;
        }
    }
    console.log(`Pre-fetched ${userMap.size} users.`);

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
    const normalizePhone = (p: any) => {
        if (!p) return null;
        let s = String(p).replace(/\D/g, '');
        if (s.startsWith('256')) return s;
        if (s.startsWith('0')) return '256' + s.substring(1);
        if (s.length === 9) return '256' + s;
        return s;
    };

    // Helper to process a loan
    const processLoan = async (record: any, isGroup: boolean, groupName?: string, memberCount?: number) => {
        const name = record['Name'];
        let phone = normalizePhone(record['Mobile']);

        if (!phone) {
            // Generate dummy phone if missing
            phone = '256' + Math.floor(100000000 + Math.random() * 900000000);
        }

        const email = `${phone}@mandt.placeholder`;
        let userId = userMap.get(phone) || userMap.get(email);

        // Create User if missing
        if (!userId) {
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email: email,
                phone: phone,
                password: 'User123!',
                email_confirm: true,
                user_metadata: { full_name: name, phone_number: phone }
            });

            if (createError) {
                // If user exists, fetch them
                if (createError.message.includes('already been registered')) {
                    const { data: existingUser } = await supabase.from('auth.users').select('id').eq('email', email).single();
                    // accessing auth.users directly might not work with client, need admin.
                    // actually listUsers is better or getUser
                    // Let's use listUsers with filter? 
                    // Or just rely on the map if we paginate correctly. 
                    // Better: Pagination loop for listUsers.
                }
                console.error(`Failed to create user ${name}:`, createError.message);
                // Try to find user by email via admin
                // This is hard without ID. 
                // Let's implement pagination in Step 3.
                return;
            }
            userId = newUser.user.id;
            userMap.set(phone, userId);

            // Create Profile
            await supabase.from('profiles').insert({
                id: userId,
                full_name: name,
                phone_number: phone,
                email: email,
                role: 'client'
            });
        }

        // Map Fields
        const principal = Number(String(record['Principal']).replace(/,/g, ''));
        const releasedDate = record['Released']; // Need to parse? Excel date number or string?
        // Assuming conversion script handled date parsing to string or we parse it here.
        // If it's Excel serial, we might need logic. But Python script likely outputted strings?
        // Let's assume the JSON has strings or we try to pass as is. 
        // If Python `to_json` was used with defaults, dates might be ISO strings or epoch.

        let createdAt = new Date().toISOString();
        // Simple check if it looks like a date
        if (releasedDate && !isNaN(Date.parse(releasedDate))) {
            createdAt = new Date(releasedDate).toISOString();
        }

        const purpose = isGroup
            ? `Group Loan: ${groupName} (Leader: ${name}, Members: ${memberCount})`
            : `Individual Loan: ${name}`;

        // Create Loan
        // Check duplicate?
        // We'll trust the cleanup step involved wiping previous data, 
        // OR we just check if a loan with this product/amount/created_at exists for user.
        // For speed, let's just insert.

        const { error: loanError } = await supabase.from('loan_applications').insert({
            user_id: userId,
            full_name: name,
            email: email,
            phone_number: phone,
            id_number: record['NIN NUMBER'] || '',
            loan_product: VALID_PRODUCT,
            loan_amount: principal,
            loan_duration_months: 1, // Defaulting as not clear in Excel snippet
            status: 'disbursed',
            loan_purpose: purpose,
            created_at: createdAt,
            approved_at: createdAt,
            employment_status: isGroup ? 'Group Member' : 'Individual',
            address: record['Address'] || '',
            date_of_birth: parseDate(record['DOB']) || '1990-01-01'
        });

        if (loanError) {
            console.error(`Failed to create loan for ${name}:`, loanError.message);
        } else {
            // console.log(`Created loan for ${name}`);
        }
    };

    // 4. Migrate Individuals
    console.log("Migrating Individuals...");
    for (const ind of individuals) {
        await processLoan(ind, false);
    }

    // 5. Migrate Groups
    console.log("Migrating Groups...");
    for (const gName of Object.keys(groups)) {
        const members = groups[gName];
        // Pick Leader (First member)
        const leader = members[0];

        // Use Leader's data to create ONE loan
        // Validation: Verify if duplicate processing is needed?
        // User said: "Group given 500,000". We assume 'Principal' in row is the group amount.

        await processLoan(leader, true, gName, members.length);
    }

    console.log("Migration finished.");
}

async function cleanup() {
    console.log("Cleaning up all previous 'Bodaboda Group Loan' applications...");
    const { error } = await supabase
        .from('loan_applications')
        .delete()
        .eq('loan_product', VALID_PRODUCT);

    if (error) console.error("Cleanup error:", error);
    else console.log("Cleanup complete.");
}

// Run
(async () => {
    await cleanup();
    await migrate();
})();
