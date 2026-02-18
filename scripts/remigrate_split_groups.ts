
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve('d:/m-t-growth-gateway/.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!);

const VALID_PRODUCT = 'Bodaboda Group Loan';

async function remigrate() {
    console.log("Starting split-group migration...");

    // 1. Load JSON
    const rawData = fs.readFileSync('d:/m-t-growth-gateway/loans.json', 'utf-8');
    const allRecords = JSON.parse(rawData);
    console.log(`Loaded ${allRecords.length} records.`);

    // 2. Pre-fetch Users to avoid duplicates
    console.log("Pre-fetching users...");
    const userMap = new Map(); // phone -> id

    let page = 0;
    let hasMore = true;
    while (hasMore) {
        const { data: users, error } = await supabase.auth.admin.listUsers({ page: page + 1, perPage: 1000 });
        if (error || !users || users.users.length === 0) {
            hasMore = false;
        } else {
            users.users.forEach(u => {
                if (u.phone) userMap.set(u.phone, u.id);
                if (u.email) userMap.set(u.email, u.id);
            });
            page++;
            if (users.users.length < 1000) hasMore = false;
        }
    }
    console.log(`Pre-fetched ${userMap.size} users.`);

    // 3. Pre-fetch Groups
    const { data: existingGroups } = await supabase.from('groups').select('id, group_name');
    const groupMap = new Map();
    existingGroups?.forEach(g => groupMap.set(g.group_name.toUpperCase(), g.id));

    // Helper to format date
    function parseDate(value: any): string | null {
        if (!value) return null;
        const s = String(value).trim();
        if (!s) return null;
        const parts = s.split('/');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return null;
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

    console.log("Cleaning up previous migration data...");
    await supabase.from('loan_applications').delete().eq('loan_product', VALID_PRODUCT);

    console.log("Processing all records...");
    let processedCount = 0;

    for (const record of allRecords) {
        const name = record['Name'];
        const gName = record['Group'];
        let phone = normalizePhone(record['Mobile']);
        if (!phone) {
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
                console.error(`Failed to create user ${name} (${phone}):`, createError.message);
                continue;
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

        // Handle Group
        let groupId = null;
        if (gName && gName !== 'NaN' && String(gName).trim().length > 0) {
            const normalizedGName = String(gName).trim().toUpperCase();
            groupId = groupMap.get(normalizedGName);
            if (!groupId) {
                const { data: newGroup, error: groupErr } = await supabase.from('groups').insert({
                    group_name: normalizedGName,
                    status: 'active'
                }).select('id').single();
                if (groupErr) {
                    console.error(`Failed to create group ${normalizedGName}:`, groupErr.message);
                } else {
                    groupId = newGroup.id;
                    groupMap.set(normalizedGName, groupId);
                }
            }
        }

        const principal = Number(String(record['Principal']).replace(/,/g, ''));
        const releasedDate = parseDate(record['Released']);
        const createdAt = releasedDate ? new Date(releasedDate).toISOString() : new Date().toISOString();

        // Insert individual loan application
        const { error: loanError } = await supabase.from('loan_applications').insert({
            user_id: userId,
            full_name: name,
            email: email,
            phone_number: phone,
            id_number: record['NIN NUMBER'] || '',
            loan_product: VALID_PRODUCT,
            loan_amount: principal,
            loan_duration_months: 4, // Average duration based on maturity if calculated, 4 is safe default
            status: 'disbursed',
            loan_purpose: groupId ? `Group Loan Member: ${gName}` : `Individual Loan`,
            group_id: groupId,
            created_at: createdAt,
            approved_at: createdAt,
            employment_status: groupId ? 'Group Member' : 'Individual',
            address: record['Address'] || '',
            date_of_birth: parseDate(record['DOB']) || '1990-01-01'
        });

        if (loanError) {
            console.error(`Failed to create loan for ${name}:`, loanError.message);
        } else {
            processedCount++;
            if (processedCount % 50 === 0) console.log(`Processed ${processedCount} records...`);
        }
    }

    console.log(`Migration finished. Total records: ${processedCount}`);
}

remigrate();
