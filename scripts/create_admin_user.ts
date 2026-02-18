
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve('d:/m-t-growth-gateway/.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!);

async function createAdmin() {
    console.log("Creating Admin User...");

    const email = 'admin@mandt.placeholder';
    const password = 'AdminUser123!';
    const name = 'System Admin';
    const phone = '256700000000';

    // 1. Check if exists
    const { data: users } = await supabase.auth.admin.listUsers();
    const existing = users.users.find(u => u.email === email);

    let userId;

    if (existing) {
        console.log(`Admin User already exists: ${existing.id}`);
        userId = existing.id;
    } else {
        // 2. Create User
        const { data: newUser, error } = await supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true, // Auto-confirm
            user_metadata: { full_name: name, phone_number: phone }
        });

        if (error) {
            console.error("Error creating user:", error);
            return;
        }

        userId = newUser.user.id;
        console.log(`Created Admin User: ${userId}`);

        // 3. Create Profile
        await supabase.from('profiles').insert({
            id: userId,
            full_name: name,
            phone_number: phone,
            email: email,
            role: 'admin'
        });
    }

    // 4. Assign Role
    const { data: roles } = await supabase.from('user_roles').select('*').eq('user_id', userId).eq('role', 'admin');

    if (!roles || roles.length === 0) {
        await supabase.from('user_roles').insert({
            user_id: userId,
            role: 'admin'
        });
        console.log("Assigned 'admin' role.");
    } else {
        console.log("Role already assigned.");
    }

    console.log(`\nAdmin Credentials:\nEmail: ${email}\nPassword: ${password}`);
}

createAdmin();
