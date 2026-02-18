
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables manually since we might not have dotenv
const supabaseUrl = 'https://hhjautitkadwypreqdrd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoamF1dGl0a2Fkd3lwcmVxZHJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDY3NDY2MiwiZXhwIjoyMDgwMjUwNjYyfQ.eqxSHEghZdRnYbVscaHpPRy_q47tGLh49YxswWi6ujU';

const supabase = createClient(supabaseUrl, supabaseKey);

const LOANS_JSON_PATH = path.join(process.cwd(), 'loans.json');

async function migrateGroupsRepair() {
    console.log('Starting group migration repair...');

    try {
        const rawData = fs.readFileSync(LOANS_JSON_PATH, 'utf-8');
        const loans = JSON.parse(rawData);

        console.log(`Loaded ${loans.length} loans from JSON.`);

        const groupMap = new Map<string, string>(); // groupName -> groupId
        let updatedCount = 0;
        let createdGroups = 0;
        let errors = 0;

        for (const loan of loans) {
            const groupName = loan['Group'];
            const nin = loan['NIN NUMBER'];
            const name = loan['Name'];

            if (!groupName || typeof groupName !== 'string' || groupName.trim() === '') {
                continue; // Skip if no group
            }

            const normalizedGroupName = groupName.trim().toUpperCase();

            // 1. Get or Create Group
            let groupId = groupMap.get(normalizedGroupName);

            if (!groupId) {
                // Check DB first
                const { data: existingGroup, error: fetchError } = await supabase
                    .from('groups')
                    .select('id')
                    .eq('group_name', normalizedGroupName) // Case sensitive usually, but we normalized to upper in DB? or just match
                    .maybeSingle(); // Use maybeSingle to avoid error if not found

                if (existingGroup) {
                    groupId = existingGroup.id;
                } else {
                    // Create new group
                    const { data: newGroup, error: createError } = await supabase
                        .from('groups')
                        .insert({
                            group_name: normalizedGroupName,
                            status: 'active',
                            created_at: new Date().toISOString()
                        })
                        .select('id')
                        .single();

                    if (createError) {
                        console.error(`Error creating group '${normalizedGroupName}':`, createError.message);
                        errors++;
                        continue;
                    }
                    groupId = newGroup.id;
                    createdGroups++;
                    console.log(`Created new group: ${normalizedGroupName}`);
                }
                groupMap.set(normalizedGroupName, groupId);
            }

            // 2. Update Loan Application
            // Try finding by NIN first
            let loanAppId = null;

            if (nin) {
                const { data: foundLoan, error: findError } = await supabase
                    .from('loan_applications')
                    .select('id')
                    .eq('id_number', nin)
                    .maybeSingle();

                if (foundLoan) loanAppId = foundLoan.id;
            }

            // Fallback to Name if NIN fail
            if (!loanAppId && name) {
                // Normalize name search?
                // Try exact match or ilike
                const { data: foundLoanByName, error: findByNameError } = await supabase
                    .from('loan_applications')
                    .select('id')
                    .ilike('full_name', name)
                    .maybeSingle();

                if (foundLoanByName) loanAppId = foundLoanByName.id;
            }

            if (loanAppId) {
                const { error: updateError } = await supabase
                    .from('loan_applications')
                    .update({ group_id: groupId })
                    .eq('id', loanAppId);

                if (updateError) {
                    console.error(`Error updating loan ${loanAppId} for group ${normalizedGroupName}:`, updateError.message);
                    errors++;
                } else {
                    updatedCount++;
                    if (updatedCount % 50 === 0) process.stdout.write('.');
                }
            } else {
                // console.warn(`Could not find loan application for: ${name} (NIN: ${nin})`);
            }
        }

        console.log('\nRepair successful!');
        console.log(`Created Groups: ${createdGroups}`);
        console.log(`Updated Loans: ${updatedCount}`);
        console.log(`Errors: ${errors}`);

    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrateGroupsRepair();
