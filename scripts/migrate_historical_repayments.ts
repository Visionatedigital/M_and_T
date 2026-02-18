
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve('d:/m-t-growth-gateway/.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!);

const VALID_PRODUCT = 'Bodaboda Group Loan';

async function migrateHistorical() {
    try {
        console.log("Starting historical payment migration...");

        // 1. Load JSON
        const rawData = fs.readFileSync('d:/m-t-growth-gateway/loans.json', 'utf-8');
        const allRecords = JSON.parse(rawData);
        console.log(`Loaded ${allRecords.length} records.`);

        // 2. Fetch all loans to build a map
        const { data: loans, error: loanErr } = await supabase
            .from('loan_applications')
            .select('id, id_number, full_name, loan_product')
            .eq('loan_product', VALID_PRODUCT);

        if (loanErr) {
            console.error("Error fetching loans:", loanErr.message);
            return;
        }

        console.log(`Fetched ${loans?.length || 0} loans for mapping.`);

        // Map by NIN (id_number) or Name
        const loanMap = new Map();
        loans?.forEach(l => {
            if (l.id_number) {
                loanMap.set(l.id_number.toUpperCase().trim(), l.id);
            }
            if (l.full_name) {
                loanMap.set(l.full_name.toUpperCase().trim(), l.id);
            }
        });

        console.log(`Mapped ${loanMap.size} unique keys to ${loans?.length} applications.`);

        const loanIds = (loans || []).map(l => l.id);
        if (loanIds.length > 0) {
            console.log(`Cleaning up existing repayments for ${loanIds.length} loans...`);
            await supabase.from('repayments').delete().in('loan_application_id', loanIds);
        }

        console.log("Processing records and consolidating group payments...");

        // 1. Group the Excel records to avoid double-counting group payments
        const groupedPayments: Record<string, { paid: number, released: string, name: string, group: string }> = {};
        const individualPayments: any[] = [];

        allRecords.forEach((r: any) => {
            const name = (r.Name || '').trim();
            const principal = Number(String(r.Principal).replace(/,/g, '')) || 0;
            if (!name || principal === 0) return; // SKIP TOTALS

            const groupName = String(r.Group || '').trim();
            const paid = Number(String(r.Paid || 0).replace(/,/g, '')) || 0;
            const nin = String(r['NIN NUMBER'] || '').trim();
            const released = r.Released;

            if (paid <= 0) return;

            // Check if it's a group loan (Group != Individual/Empty)
            if (groupName && groupName !== 'N/A' && groupName !== 'Individual' && groupName !== name) {
                if (!groupedPayments[groupName]) {
                    groupedPayments[groupName] = {
                        paid: paid, // Taking the shared paid amount
                        released: released,
                        name: name,
                        group: groupName
                    };
                }
            } else {
                individualPayments.push({
                    paid: paid,
                    released: released,
                    name: name,
                    nin: nin
                });
            }
        });

        let migratedCount = 0;

        // 2. Insert Group Payments
        console.log(`Inserting ${Object.keys(groupedPayments).length} group payments...`);
        for (const [groupName, data] of Object.entries(groupedPayments)) {
            // Match the unique group ID format
            const groupUid = `G-${groupName.toUpperCase().replace(/\s+/g, '')}`;
            const loanId = loanMap.get(groupUid);

            if (!loanId) {
                console.warn(`Could not find consolidated group loan for: ${groupName} (UID: ${groupUid})`);
                continue;
            }

            const payDate = data.released ? parseDate(data.released) : new Date().toISOString().split('T')[0];
            const { error } = await supabase.from('repayments').insert({
                loan_application_id: loanId,
                amount: data.paid,
                payment_date: payDate
            });
            if (!error) {
                migratedCount++;
            } else {
                console.error(`Failed to record group payment for ${groupName}:`, error.message);
            }
        }

        // 3. Insert Individual Payments
        console.log(`Inserting ${individualPayments.length} individual payments...`);
        for (const data of individualPayments) {
            const nin = String(data.nin || '').toUpperCase().trim();
            const name = String(data.name || '').toUpperCase().trim();
            const loanId = loanMap.get(nin) || loanMap.get(name);

            if (!loanId) continue;

            const payDate = data.released ? parseDate(data.released) : new Date().toISOString().split('T')[0];
            const { error } = await supabase.from('repayments').insert({
                loan_application_id: loanId,
                amount: data.paid,
                payment_date: payDate
            });
            if (!error) {
                migratedCount++;
            } else {
                console.error(`Failed to record individual payment for ${data.name}:`, error.message);
            }
        }

        console.log(`Finished. Total consolidated records migrated: ${migratedCount}`);
    } catch (err: any) {
        console.error("FATAL ERROR in migration:", err);
        process.exit(1);
    }
}

function parseDate(d: string) {
    if (!d) return new Date().toISOString().split('T')[0];
    const p = d.split('/');
    if (p.length === 3) return `${p[2]}-${p[1]}-${p[0]}`;
    return new Date().toISOString().split('T')[0];
}

migrateHistorical();
