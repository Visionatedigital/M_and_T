
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabaseUrl = "https://hhjautitkadwypreqdrd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoamF1dGl0a2Fkd3lwcmVxZHJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDY3NDY2MiwiZXhwIjoyMDgwMjUwNjYyfQ.eqxSHEghZdRnYbVscaHpPRy_q47tGLh49YxswWi6ujU";

// Create a client with service role to manage users
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function migrate() {
    console.log("Starting Migration: Individual-First Model (v3)...");

    console.log("Fetching all loans...");
    // 1. Fetch all loans
    const { data: loans, error: loansError } = await supabase
        .from('loan_applications')
        .select('*');
    console.log(`Fetched ${loans?.length || 0} total loans.`);

    if (loansError) {
        console.error("Error fetching loans:", loansError);
        return;
    }

    // 2. Fetch all groups
    const { data: groups, error: groupsError } = await supabase
        .from('groups')
        .select('*');

    const groupsMap = new Map((groups || []).map(g => [g.group_name.toUpperCase(), g.id]));

    for (const loan of loans) {
        let members = [];
        let isGroup = false;
        let groupName = "SINGLE";

        try {
            if (loan.loan_purpose && (loan.loan_purpose.startsWith('[') || loan.loan_purpose.startsWith('{'))) {
                const parsed = JSON.parse(loan.loan_purpose);
                if (Array.isArray(parsed)) {
                    members = parsed;
                    isGroup = true;
                    groupName = loan.full_name.toUpperCase().replace(" GROUP", "");
                }
            }
        } catch (e) { }

        if (isGroup && members.length > 0) {
            console.log(`Processing Group Loan: ${loan.full_name} (${members.length} members)`);

            let groupId = groupsMap.get(groupName);
            if (!groupId) {
                console.log(`Creating Group: ${groupName}`);
                const { data: newGroup, error: ngError } = await supabase
                    .from('groups')
                    .insert({ group_name: groupName, status: 'active' })
                    .select()
                    .single();
                if (ngError) {
                    console.error(`Failed to create group ${groupName}:`, ngError);
                    continue;
                }
                groupId = newGroup.id;
                groupsMap.set(groupName, groupId);
            }

            const { data: reps } = await supabase.from('repayments').select('amount').eq('loan_application_id', loan.id);
            const totalPaid = (reps || []).reduce((sum, r) => sum + Number(r.amount), 0);
            const paidPerMember = totalPaid / members.length;

            let successCount = 0;
            for (const m of members) {
                const mName = (m.name || m.full_name || "Unknown Member").trim();
                const mAmount = Number(m.amount || m.loan_amount || (loan.loan_amount / members.length));
                const email = `${mName.toLowerCase().replace(/\s+/g, '.')}@mandt.placeholder`;

                console.log(`  Adding member: ${mName} - ${mAmount}`);

                // 1. Create Auth User
                console.log(`    Creating auth user for ${email}...`);
                const { data: userData, error: authError } = await supabase.auth.admin.createUser({
                    email: email,
                    password: 'Password123!',
                    email_confirm: true,
                    user_metadata: { full_name: mName }
                });

                let newUserId;
                if (authError) {
                    console.error(`    Auth error for ${mName}:`, authError.message);
                    if (authError.message.includes("already registered")) {
                        const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
                        if (listError) {
                            console.error("    Could not list users to find existing:", listError.message);
                            continue;
                        }
                        const existing = (existingUsers.users || []).find(u => u.email === email);
                        if (existing) {
                            newUserId = existing.id;
                            console.log(`    Found existing user: ${newUserId}`);
                        } else {
                            console.error("    User says registered but not found in list.");
                            continue;
                        }
                    } else {
                        continue;
                    }
                } else {
                    if (!userData || !userData.user) {
                        console.error("    Auth user created but no user data returned.");
                        continue;
                    }
                    newUserId = userData.user.id;
                    console.log(`    Created new user: ${newUserId}`);
                }

                // 2. Create Profile (might already be created via trigger)
                const { error: pError } = await supabase.from('profiles').upsert({
                    id: newUserId,
                    full_name: mName,
                    first_name: mName.split(' ')[0],
                    last_name: mName.split(' ').slice(1).join(' '),
                    phone_number: loan.phone_number
                });

                if (pError) {
                    console.error(`    Profile error for ${mName}:`, pError);
                    continue;
                }

                // 3. Check if member loan already exists
                const { data: existingLoan } = await supabase
                    .from('loan_applications')
                    .select('id')
                    .eq('user_id', newUserId)
                    .eq('group_id', groupId)
                    .maybeSingle();

                if (existingLoan) {
                    console.log(`    Loan already exists for ${mName}. Skipping insert.`);
                    successCount++;
                    continue;
                }

                // 4. Create Loan
                const { data: newLoan, error: nlError } = await supabase
                    .from('loan_applications')
                    .insert({
                        user_id: newUserId,
                        full_name: mName,
                        loan_amount: mAmount,
                        loan_product: loan.loan_product,
                        loan_purpose: `Member of ${groupName}`,
                        status: loan.status,
                        group_id: groupId,
                        phone_number: loan.phone_number,
                        address: loan.address,
                        date_of_birth: loan.date_of_birth || '1990-01-01',
                        email: loan.email || email,
                        employment_status: loan.employment_status,
                        id_number: 'PENDING',
                        loan_duration_months: loan.loan_duration_months || 4
                    })
                    .select()
                    .single();

                if (nlError) {
                    console.error(`    Loan error for ${mName}:`, nlError);
                } else {
                    successCount++;
                    if (paidPerMember > 0) {
                        await supabase.from('repayments').insert({
                            loan_application_id: newLoan.id,
                            amount: Math.round(paidPerMember),
                            payment_date: new Date().toISOString().split('T')[0],
                            notes: `Migration: Distributed from group ${groupName}`
                        });
                    }
                }
            }

            if (successCount === members.length) {
                await supabase.from('repayments').delete().eq('loan_application_id', loan.id);
                await supabase.from('loan_applications').delete().eq('id', loan.id);
                console.log(`  Finished ${groupName}. Original record deleted.`);
            } else {
                console.error(`  Warning: Only ${successCount}/${members.length} members succeeded for ${groupName}. NOT deleting original.`);
            }

        } else {
            // Mark as Single
            await supabase.from('loan_applications').update({ group_id: null }).eq('id', loan.id);
        }
    }

    console.log("Migration Complete!");
}

migrate();
