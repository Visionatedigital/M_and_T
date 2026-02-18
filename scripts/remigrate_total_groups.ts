
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve('d:/m-t-growth-gateway/.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!);

const VALID_PRODUCT = 'Bodaboda Group Loan';

async function remigrateConsolidated() {
    try {
        console.log("Starting consolidated group migration...");

        // 1. Load JSON and Auth
        const rawData = fs.readFileSync('d:/m-t-growth-gateway/loans.json', 'utf-8');
        const allRecords = JSON.parse(rawData);
        console.log(`Loaded ${allRecords.length} records.`);

        // Fetch a default admin user to assign loans to
        const { data: userData, error: userErr } = await supabase.auth.admin.listUsers();
        if (userErr) throw new Error(`Auth fetch failed: ${userErr.message}`);
        const adminUser = userData.users.find(u => u.user_metadata?.role === 'admin') || userData.users[0];
        if (!adminUser) throw new Error("No admin user found to assign loans to.");
        const adminId = adminUser.id;
        console.log(`Assigning loans to admin: ${adminId}`);

        // 2. Clean up existing data for this product
        console.log("Cleaning up old repayments and applications...");

        // 1. Get all loans for this product
        const { data: loansToDel, error: fetchErr } = await supabase
            .from('loan_applications')
            .select('id')
            .eq('loan_product', VALID_PRODUCT);

        if (fetchErr) throw new Error(`Fetch failed: ${fetchErr.message}`);

        const loanIds = (loansToDel || []).map(l => l.id);
        console.log(`Found ${loanIds.length} loans to delete.`);

        // Chunk deletion to avoid 400 Bad Request (too many parameters)
        const chunkSize = 20;
        for (let i = 0; i < loanIds.length; i += chunkSize) {
            const chunk = loanIds.slice(i, i + chunkSize);
            console.log(`Deleting chunk ${i / chunkSize + 1} of ${Math.ceil(loanIds.length / chunkSize)}...`);

            // Delete repayments for this chunk
            const { error: repDelErr } = await supabase
                .from('repayments')
                .delete()
                .in('loan_application_id', chunk);

            if (repDelErr) console.warn(`Repayment deletion warning (might be empty) at chunk ${i}: ${repDelErr.message}`);

            // Delete loans for this chunk
            const { error: delErr } = await supabase
                .from('loan_applications')
                .delete()
                .in('id', chunk);

            if (delErr) {
                console.error(`Loan cleanup failed at chunk ${i}: ${delErr.message}`);
                // If it fails due to FK, we might need to be more thorough
            }
        }
        console.log("Cleanup complete.");

        // 3. Group by 'Group' column
        const groups: Record<string, { sharedPrincipal: number, members: any[], status: string, released: string, loanId: string }> = {};
        const individuals: any[] = [];

        allRecords.forEach((r: any) => {
            const groupName = (r.Group || '').trim();
            const personName = (r.Name || '').trim();
            const principal = Number(r.Principal) || 0;

            if (!personName || principal === 0) return; // SKIP EXCEL TOTALS OR EMPTY ROWS

            if (!groupName || groupName === 'N/A' || groupName === personName || groupName === 'Individual') {
                individuals.push(r);
            } else {
                if (!groups[groupName]) {
                    groups[groupName] = {
                        sharedPrincipal: principal, // Use the first member's principal as the group total
                        members: [],
                        status: r.Status,
                        released: r.Released,
                        loanId: String(r['Loan Id'])
                    };
                }
                // Don't add to principal - all members share the same total
                groups[groupName].members.push({
                    name: personName,
                    nin: r['NIN NUMBER'],
                    dob: r.DOB,
                    // Individual amount is the group total divided by number of members (calculated later)
                });
            }
        });

        console.log(`Identified ${Object.keys(groups).length} groups and ${individuals.length} individuals.`);

        // 4. Insert Groups - Calculate individual member amounts
        console.log("Inserting Group Loans...");
        for (const [groupName, data] of Object.entries(groups)) {
            const memberCount = data.members.length;
            const individualAmount = data.sharedPrincipal / memberCount;

            // Add the calculated individual amount to each member
            const membersWithAmounts = data.members.map(m => ({
                ...m,
                amount: individualAmount
            }));
            const { data: groupRec } = await supabase.from('groups').select('id').eq('group_name', groupName).maybeSingle();
            let groupId = groupRec?.id;

            if (!groupId) {
                const { data: newGroup, error: groupErr } = await supabase.from('groups').insert({ group_name: groupName, status: 'active' }).select('id').single();
                if (groupErr) {
                    console.error(`Group creation failed for ${groupName}:`, groupErr.message);
                    continue;
                }
                groupId = newGroup?.id;
            }

            const { error: insErr } = await supabase.from('loan_applications').insert({
                user_id: adminId,
                full_name: groupName,
                email: `${groupName.replace(/\s+/g, '').toLowerCase()}@mtgrowth.com`,
                phone_number: '0000000000',
                id_number: `G-${groupName.toUpperCase().replace(/\s+/g, '')}`, // UNIQUE ID FOR GROUP
                date_of_birth: '1970-01-01',
                address: 'Group Address',
                loan_product: VALID_PRODUCT,
                loan_amount: Number(data.sharedPrincipal), // USE SHARED PRINCIPAL
                loan_duration_months: 4,
                loan_purpose: JSON.stringify(membersWithAmounts), // Member list (with calculated amounts) stored here
                employment_status: 'Self Employed',
                status: 'disbursed',
                approved_at: data.released ? parseDate(data.released) : new Date().toISOString(),
                created_at: data.released ? parseDate(data.released) : new Date().toISOString(),
            });

            if (insErr) {
                console.error(`Group application insert failed for ${groupName}:`, insErr.message);
            }
        }

        // 5. Insert Individuals
        console.log("Inserting Individual Loans...");
        for (const r of individuals) {
            const { error: insErr } = await supabase.from('loan_applications').insert({
                user_id: adminId,
                full_name: r.Name,
                email: `${r.Name.replace(/\s+/g, '').toLowerCase()}@example.com`,
                phone_number: String(r.Mobile) || '0000000000',
                id_number: String(r['NIN NUMBER']) || 'NIN-UNKNOWN',
                date_of_birth: r.DOB ? parseDate(r.DOB).split('T')[0] : '1970-01-01',
                address: r.Address || 'No Address',
                loan_product: VALID_PRODUCT,
                loan_amount: Number(r.Principal) || 0,
                loan_duration_months: 4,
                loan_purpose: 'Personal',
                employment_status: 'Self Employed',
                status: 'disbursed',
                approved_at: r.Released ? parseDate(r.Released) : new Date().toISOString(),
                created_at: r.Released ? parseDate(r.Released) : new Date().toISOString(),
            });
            if (insErr) console.error(`Individual insert failed for ${r.Name}:`, insErr.message);
        }

        console.log("Finished consolidation migration.");
    } catch (e: any) {
        console.error("FATAL ERROR:", e.message);
        process.exit(1);
    }
}

function parseDate(d: string) {
    const p = d.split('/');
    if (p.length === 3) return new Date(`${p[2]}-${p[1]}-${p[0]}`).toISOString();
    return new Date().toISOString();
}

remigrateConsolidated();
