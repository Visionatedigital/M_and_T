
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve('d:/m-t-growth-gateway/.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!);

async function createLoanOfficer() {
    console.log("Creating Loan Officer...");

    const email = 'loanofficer@mandt.placeholder';
    const password = 'OfficerUser123!';
    const name = 'Loan Officer 1';
    const phone = '256700000001';

    // 1. Check if exists
    const { data: users } = await supabase.auth.admin.listUsers();
    const existing = users.users.find(u => u.email === email);

    let userId;

    if (existing) {
        console.log(`Loan Officer already exists: ${existing.id}`);
        userId = existing.id;
    } else {
        // 2. Create User
        const { data: newUser, error } = await supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: { full_name: name, phone_number: phone }
        });

        if (error) {
            console.error("Error creating user:", error);
            return;
        }

        userId = newUser.user.id;
        console.log(`Created Loan Officer: ${userId}`);

        // 3. Create Profile
        await supabase.from('profiles').insert({
            id: userId,
            full_name: name,
            phone_number: phone,
            email: email,
            role: 'loan_officer' // Ideally schema handles validation, but here we just store it.
        });
    }

    // 4. Assign Role in user_roles table
    // Check if role exists
    const { data: roles } = await supabase.from('user_roles').select('*').eq('user_id', userId).eq('role', 'loan_officer');

    if (!roles || roles.length === 0) {
        const { error: roleError } = await supabase.from('user_roles').insert({
            user_id: userId,
            role: 'loan_officer'
        });

        if (roleError) console.error("Error assigning role:", roleError);
        else console.log("Assigned 'loan_officer' role.");
    } else {
        console.log("Role already assigned.");
    }

    console.log(`\nLoan Officer Credentials:\nEmail: ${email}\nPassword: ${password}`);
}

createLoanOfficer();
