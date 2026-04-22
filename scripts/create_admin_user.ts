
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!);

async function createAdmin() {
    console.log("Creating admin user (Liz Keza)...");

    const email = 'liz.keza@mtgrowth.com';
    const password = 'MtGrowth2025!';
    const name = 'Liz Keza';
    const phone = '256700000001';

    // 1. Check if exists
    const { data: users } = await supabase.auth.admin.listUsers();
    const existing = users.users.find(u => u.email === email);

    let userId;

    if (existing) {
        console.log(`Admin user already exists: ${existing.id}`);
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
        console.log(`Created admin user: ${userId}`);

        // 3. Create Profile
        await supabase.from('profiles').insert({
            id: userId,
            full_name: name,
            first_name: 'Liz',
            last_name: 'Keza',
            phone_number: phone,
            email: email,
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

    console.log(`\nAdmin credentials:\n  Email: ${email}\n  Password: ${password}`);
}

createAdmin();
